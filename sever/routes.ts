import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import fs from "fs";
import { execSync } from "child_process";
import { parse } from "csv-parse/sync";
import path from "path";
import { InsertPassenger } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- ETL PROCESS START ---
  const dataDir = path.join(process.cwd(), "server/data");
  const csvPath = path.join(dataDir, "train.csv");
  
  // 1. Unzip if needed
  if (!fs.existsSync(csvPath)) {
    console.log("CSV not found. Attempting to unzip...");
    try {
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      // Find the zip file
      const assetsDir = path.join(process.cwd(), "attached_assets");
      const files = fs.readdirSync(assetsDir);
      const zipFile = files.find(f => f.startsWith("spaceship-titanic") && f.endsWith(".zip"));
      
      if (zipFile) {
        execSync(`unzip -o "${path.join(assetsDir, zipFile)}" -d "${dataDir}"`);
        console.log("Unzipped successfully.");
      } else {
        console.error("No zip file found in attached_assets");
      }
    } catch (e) {
      console.error("Error unzipping data:", e);
    }
  }

  // 2. Read and Process Data
  if (fs.existsSync(csvPath)) {
    console.log("Loading and processing data...");
    const fileContent = fs.readFileSync(csvPath);
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    // Helper for Mode
    const getMode = (arr: any[]) => {
      return arr.sort((a,b) =>
        arr.filter(v => v===a).length - arr.filter(v => v===b).length
      ).pop();
    };
    
    // Helper for Median
    const getMedian = (arr: number[]) => {
      const sorted = arr.sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      return sorted[middle];
    };

    // Calculate imputations stats from valid data
    const validAges = records.map((r: any) => parseFloat(r.Age)).filter((n: number) => !isNaN(n));
    const medianAge = getMedian(validAges) || 27;
    
    const validHomePlanets = records.map((r: any) => r.HomePlanet).filter((v: string) => v);
    const modeHomePlanet = getMode(validHomePlanets) || "Earth";
    
    const validCryoSleep = records.map((r: any) => r.CryoSleep).filter((v: string) => v);
    const modeCryoSleep = getMode(validCryoSleep) === 'True';

    const validDestination = records.map((r: any) => r.Destination).filter((v: string) => v);
    const modeDestination = getMode(validDestination) || "TRAPPIST-1e";

    const validVIP = records.map((r: any) => r.VIP).filter((v: string) => v);
    const modeVIP = getMode(validVIP) === 'True';

    // Group Size Map
    const groupCounts = new Map<string, number>();
    records.forEach((r: any) => {
      const gId = r.PassengerId.split('_')[0];
      groupCounts.set(gId, (groupCounts.get(gId) || 0) + 1);
    });

    const processedData: InsertPassenger[] = records.map((r: any) => {
      // Impute & Type Convert
      const age = r.Age ? parseFloat(r.Age) : medianAge;
      const roomService = r.RoomService ? parseFloat(r.RoomService) : 0;
      const foodCourt = r.FoodCourt ? parseFloat(r.FoodCourt) : 0;
      const shoppingMall = r.ShoppingMall ? parseFloat(r.ShoppingMall) : 0;
      const spa = r.Spa ? parseFloat(r.Spa) : 0;
      const vrDeck = r.VRDeck ? parseFloat(r.VRDeck) : 0;
      
      const homePlanet = r.HomePlanet || modeHomePlanet;
      const cryoSleep = r.CryoSleep ? (r.CryoSleep === 'True') : modeCryoSleep;
      const destination = r.Destination || modeDestination;
      const vip = r.VIP ? (r.VIP === 'True') : modeVIP;
      const transported = r.Transported === 'True';
      
      // Feature Engineering
      const totalSpent = roomService + foodCourt + shoppingMall + spa + vrDeck;
      const spendingFlag = totalSpent > 0;
      
      let cabinDeck = null, cabinNum = null, cabinSide = null;
      if (r.Cabin) {
        const parts = r.Cabin.split('/');
        if (parts.length === 3) {
          cabinDeck = parts[0];
          cabinNum = parts[1];
          cabinSide = parts[2];
        }
      }
      
      const gId = r.PassengerId.split('_')[0];
      const groupSize = groupCounts.get(gId) || 1;

      return {
        passengerId: r.PassengerId,
        homePlanet,
        cryoSleep,
        cabin: r.Cabin || null,
        destination,
        age,
        vip,
        roomService,
        foodCourt,
        shoppingMall,
        spa,
        vrDeck,
        name: r.Name || null,
        transported,
        totalSpent,
        spendingFlag,
        cabinDeck,
        cabinNum,
        cabinSide,
        groupSize
      };
    });

    // Seed Storage
    await storage.seedPassengers(processedData);
    console.log(`Processed ${processedData.length} records.`);
  }
  // --- ETL PROCESS END ---


  app.get(api.passengers.list.path, async (req, res) => {
    const passengers = await storage.getPassengers();
    res.json(passengers);
  });

  app.get(api.passengers.eda.path, async (req, res) => {
    const passengers = await storage.getPassengers();
    const totalPassengers = passengers.length;
    const transportedCount = passengers.filter(p => p.transported).length;
    const transportedRate = totalPassengers ? (transportedCount / totalPassengers) : 0;

    // Helper for categorical stats
    const getStats = (key: keyof InsertPassenger) => {
      const counts: Record<string, { transported: number, total: number }> = {};
      
      passengers.forEach(p => {
        const val = String(p[key]);
        if (!counts[val]) counts[val] = { transported: 0, total: 0 };
        counts[val].total++;
        if (p.transported) counts[val].transported++;
      });

      return Object.entries(counts).map(([label, d]) => ({
        label,
        transported: d.transported,
        notTransported: d.total - d.transported,
        total: d.total,
        rate: d.total ? parseFloat((d.transported / d.total).toFixed(2)) : 0
      }));
    };

    // Helper for bucket stats (Age, Spend)
    const getBucketStats = (key: keyof InsertPassenger, bucketSize: number) => {
      const counts: Record<string, { transported: number, total: number }> = {};
       passengers.forEach(p => {
        const val = Number(p[key] || 0);
        const bucket = Math.floor(val / bucketSize) * bucketSize;
        const label = `${bucket}-${bucket + bucketSize}`;
        
        if (!counts[label]) counts[label] = { transported: 0, total: 0 };
        counts[label].total++;
        if (p.transported) counts[label].transported++;
      });
      
      // Sort keys numerically if possible or just return
      return Object.entries(counts)
        .sort((a,b) => parseInt(a[0]) - parseInt(b[0]))
        .map(([label, d]) => ({
          label,
          transported: d.transported,
          notTransported: d.total - d.transported,
          total: d.total,
          rate: d.total ? parseFloat((d.transported / d.total).toFixed(2)) : 0
        }));
    };

    const features = [
      { feature: "CryoSleep", data: getStats("cryoSleep") },
      { feature: "HomePlanet", data: getStats("homePlanet") },
      { feature: "Destination", data: getStats("destination") },
      { feature: "VIP", data: getStats("vip") },
      { feature: "Age", data: getBucketStats("age", 10) },
      { feature: "GroupSize", data: getStats("groupSize") },
      { feature: "CabinDeck", data: getStats("cabinDeck") },
      { feature: "CabinSide", data: getStats("cabinSide") },
      { feature: "SpendingFlag", data: getStats("spendingFlag") },
      // Total Spent buckets: 0-500, 500-1000...
      { feature: "TotalSpent", data: getBucketStats("totalSpent", 1000) } 
    ];

    res.json({
      totalPassengers,
      transportedCount,
      transportedRate,
      features
    });
  });

  return httpServer;
}
