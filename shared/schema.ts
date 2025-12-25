import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const passengers = pgTable("passengers", {
  id: serial("id").primaryKey(),
  passengerId: text("passenger_id").notNull().unique(),
  homePlanet: text("home_planet"),
  cryoSleep: boolean("cryo_sleep"),
  cabin: text("cabin"),
  destination: text("destination"),
  age: real("age"),
  vip: boolean("vip"),
  roomService: real("room_service").default(0),
  foodCourt: real("food_court").default(0),
  shoppingMall: real("shopping_mall").default(0),
  spa: real("spa").default(0),
  vrDeck: real("vr_deck").default(0),
  name: text("name"),
  transported: boolean("transported"),
  
  // Engineered Features
  totalSpent: real("total_spent").default(0),
  spendingFlag: boolean("spending_flag").default(false),
  cabinDeck: text("cabin_deck"),
  cabinNum: text("cabin_num"),
  cabinSide: text("cabin_side"),
  groupSize: integer("group_size").default(1),
});

export const insertPassengerSchema = createInsertSchema(passengers).omit({ id: true });

export type Passenger = typeof passengers.$inferSelect;
export type InsertPassenger = z.infer<typeof insertPassengerSchema>;

// EDA Stats Types
export type FeatureStats = {
  feature: string;
  data: { label: string; transported: number; notTransported: number; total: number; rate: number }[];
};

// ML Model Comparison Types
export type ModelResult = {
  name: string;
  accuracy: number;
};

export type FeatureImportance = {
  feature: string;
  importance: number;
};

export type MlAnalysisResponse = {
  featureImportances: FeatureImportance[];
  modelComparisons: ModelResult[];
  proposedFeatures: string[];
};

// ML Types
export type FeatureImportance = {
  feature: string;
  importance: number;
};

export type ModelMetric = {
  model: string;
  accuracy: number;
  cv_score: number;
};

export type MlResponse = {
  importances: FeatureImportance[];
  metrics: ModelMetric[];
  suggestedFeatures: string[];
};
