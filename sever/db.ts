import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Default to a dummy connection string if not set, 
// since we are using MemStorage for this analysis app 
// and might not have provisioned a real DB yet.
// In a real app, we would enforce DATABASE_URL.
const connString = process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/db";

export const pool = new Pool({ connectionString: connString });
export const db = drizzle(pool, { schema });
