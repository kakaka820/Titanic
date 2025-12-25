import { type Passenger, type InsertPassenger } from "@shared/schema";

export interface IStorage {
  getPassengers(): Promise<Passenger[]>;
  createPassenger(passenger: InsertPassenger): Promise<Passenger>;
  seedPassengers(passengers: InsertPassenger[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private passengers: Passenger[];
  private idCounter: number;

  constructor() {
    this.passengers = [];
    this.idCounter = 1;
  }

  async getPassengers(): Promise<Passenger[]> {
    return this.passengers;
  }

  async createPassenger(insertPassenger: InsertPassenger): Promise<Passenger> {
    const passenger: Passenger = { 
      ...insertPassenger, 
      id: this.idCounter++,
      // Ensure defaults if not provided (though schema handles some)
      roomService: insertPassenger.roomService ?? 0,
      foodCourt: insertPassenger.foodCourt ?? 0,
      shoppingMall: insertPassenger.shoppingMall ?? 0,
      spa: insertPassenger.spa ?? 0,
      vrDeck: insertPassenger.vrDeck ?? 0,
      totalSpent: insertPassenger.totalSpent ?? 0,
      spendingFlag: insertPassenger.spendingFlag ?? false,
      groupSize: insertPassenger.groupSize ?? 1,
      homePlanet: insertPassenger.homePlanet ?? null,
      cryoSleep: insertPassenger.cryoSleep ?? null,
      cabin: insertPassenger.cabin ?? null,
      destination: insertPassenger.destination ?? null,
      age: insertPassenger.age ?? null,
      vip: insertPassenger.vip ?? null,
      name: insertPassenger.name ?? null,
      transported: insertPassenger.transported ?? null,
      cabinDeck: insertPassenger.cabinDeck ?? null,
      cabinNum: insertPassenger.cabinNum ?? null,
      cabinSide: insertPassenger.cabinSide ?? null
    };
    this.passengers.push(passenger);
    return passenger;
  }

  async seedPassengers(passengers: InsertPassenger[]): Promise<void> {
    this.passengers = []; // Clear existing
    this.idCounter = 1;
    for (const p of passengers) {
      await this.createPassenger(p);
    }
  }
}

export const storage = new MemStorage();
