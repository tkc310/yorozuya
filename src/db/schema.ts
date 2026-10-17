import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  updatedYear: integer("updated_year"),
  updatedMonth: integer("updated_month"),
  name: text("name").notNull(),
  workStyle: text("work_style").notNull(),
  education: text("education").notNull(),
  station: text("station").notNull(),
  selfPr: text("self_pr").notNull(),
});

export const skillGroups = sqliteTable("skill_groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  position: integer("position").notNull(),
});

export const skills = sqliteTable("skills", {
  id: text("id").primaryKey(),
  groupId: text("group_id").notNull(),
  name: text("name").notNull(),
  position: integer("position").notNull(),
});

export const careers = sqliteTable("careers", {
  id: text("id").primaryKey(),
  startYear: integer("start_year").notNull(),
  startMonth: integer("start_month").notNull(),
  endYear: integer("end_year"),
  endMonth: integer("end_month"),
  projectName: text("project_name").notNull(),
  summary: text("summary").notNull(),
  work: text("work").notNull(),
  outcome: text("outcome").notNull(),
  role: text("role").notNull(),
  employment: text("employment").notNull(),
  positionName: text("position_name").notNull(),
  team: text("team").notNull(),
  methodology: text("methodology").notNull(),
  parallel: integer("parallel", { mode: "boolean" }).notNull(),
  hard: integer("hard", { mode: "boolean" }).notNull(),
  position: integer("position").notNull(),
});

export const careerEnvironments = sqliteTable(
  "career_environments",
  {
    careerId: text("career_id").notNull(),
    position: integer("position").notNull(),
    name: text("name").notNull(),
  },
  (table) => [primaryKey({ columns: [table.careerId, table.position] })],
);

export const careerTools = sqliteTable(
  "career_tools",
  {
    careerId: text("career_id").notNull(),
    position: integer("position").notNull(),
    name: text("name").notNull(),
  },
  (table) => [primaryKey({ columns: [table.careerId, table.position] })],
);

export const careerPhases = sqliteTable(
  "career_phases",
  {
    careerId: text("career_id").notNull(),
    position: integer("position").notNull(),
    phase: text("phase").notNull(),
  },
  (table) => [primaryKey({ columns: [table.careerId, table.position] })],
);
