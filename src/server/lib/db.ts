import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Database } from "bun:sqlite";
import { drizzle, type BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { seed } from "../db/seed";
import * as schema from "../db/schema";

const file = "data/yorozuya.db";
const migrationsFolder = "src/server/db/migrations";

export type YorozuyaDatabase = BunSQLiteDatabase<typeof schema>;

let cached: YorozuyaDatabase | undefined;

export function getDb(): YorozuyaDatabase {
  if (cached) {
    return cached;
  }
  mkdirSync(dirname(file), { recursive: true });
  const sqlite = new Database(file, { create: true });
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder });
  seed(db);
  cached = db;
  return db;
}
