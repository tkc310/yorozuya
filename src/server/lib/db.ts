import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Database } from "bun:sqlite";
import { drizzle, type BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { createFixtureSheet } from "../../../shared/features/skill-sheet/sheet";
import * as schema from "../../db/schema";

const file = "data/yorozu.db";

export type SheetDatabase = BunSQLiteDatabase<typeof schema>;

let cached: SheetDatabase | undefined;

const statements = [
  `CREATE TABLE IF NOT EXISTS profiles (
    id text PRIMARY KEY,
    updated_year integer,
    updated_month integer,
    name text NOT NULL,
    work_style text NOT NULL,
    education text NOT NULL,
    station text NOT NULL,
    self_pr text NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS skill_groups (
    id text PRIMARY KEY,
    name text NOT NULL,
    position integer NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS skills (
    id text PRIMARY KEY,
    group_id text NOT NULL,
    name text NOT NULL,
    position integer NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS careers (
    id text PRIMARY KEY,
    start_year integer NOT NULL,
    start_month integer NOT NULL,
    end_year integer,
    end_month integer,
    project_name text NOT NULL,
    summary text NOT NULL,
    work text NOT NULL,
    outcome text NOT NULL,
    role text NOT NULL,
    employment text NOT NULL,
    position_name text NOT NULL,
    team text NOT NULL,
    methodology text NOT NULL,
    parallel integer NOT NULL,
    hard integer NOT NULL,
    position integer NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS career_environments (
    career_id text NOT NULL,
    position integer NOT NULL,
    name text NOT NULL,
    PRIMARY KEY (career_id, position)
  )`,
  `CREATE TABLE IF NOT EXISTS career_tools (
    career_id text NOT NULL,
    position integer NOT NULL,
    name text NOT NULL,
    PRIMARY KEY (career_id, position)
  )`,
  `CREATE TABLE IF NOT EXISTS career_phases (
    career_id text NOT NULL,
    position integer NOT NULL,
    phase text NOT NULL,
    PRIMARY KEY (career_id, position)
  )`,
];

function seed(db: SheetDatabase): void {
  const existing = db.select().from(schema.profiles).all();
  if (existing.length > 0) {
    return;
  }
  const sheet = createFixtureSheet();
  db.transaction((tx) => {
    tx.insert(schema.profiles)
      .values({
        id: "profile",
        updatedYear: sheet.updatedOn?.year ?? null,
        updatedMonth: sheet.updatedOn?.month ?? null,
        name: sheet.name,
        workStyle: sheet.workStyle,
        education: sheet.education,
        station: sheet.station,
        selfPr: sheet.selfPr,
      })
      .run();
    sheet.skillGroups.forEach((group, groupIndex) => {
      const groupId = `group-${groupIndex}`;
      tx.insert(schema.skillGroups)
        .values({ id: groupId, name: group.name, position: groupIndex })
        .run();
      group.skills.forEach((skill, skillIndex) => {
        tx.insert(schema.skills)
          .values({
            id: `skill-${groupIndex}-${skillIndex}`,
            groupId,
            name: skill.name,
            position: skillIndex,
          })
          .run();
      });
    });
    sheet.careers.forEach((career, careerIndex) => {
      tx.insert(schema.careers)
        .values({
          id: career.id,
          startYear: career.period.start.year,
          startMonth: career.period.start.month,
          endYear: career.period.end?.year ?? null,
          endMonth: career.period.end?.month ?? null,
          projectName: career.projectName,
          summary: career.summary,
          work: career.work,
          outcome: career.outcome,
          role: career.role,
          employment: career.employment,
          positionName: career.position,
          team: career.team,
          methodology: career.methodology,
          parallel: career.parallel,
          hard: career.hard,
          position: careerIndex,
        })
        .run();
      career.environment.forEach((name, position) => {
        tx.insert(schema.careerEnvironments)
          .values({ careerId: career.id, position, name })
          .run();
      });
      career.tools.forEach((name, position) => {
        tx.insert(schema.careerTools).values({ careerId: career.id, position, name }).run();
      });
      career.phases.forEach((phase, position) => {
        tx.insert(schema.careerPhases)
          .values({ careerId: career.id, position, phase })
          .run();
      });
    });
  });
}

export function getDb(): SheetDatabase {
  if (cached) {
    return cached;
  }
  mkdirSync(dirname(file), { recursive: true });
  const sqlite = new Database(file, { create: true });
  for (const statement of statements) {
    sqlite.exec(statement);
  }
  const db = drizzle(sqlite, { schema });
  seed(db);
  cached = db;
  return db;
}
