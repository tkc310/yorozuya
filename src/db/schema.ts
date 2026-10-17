import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  updatedYear: integer("updated_year"),
  updatedMonth: integer("updated_month"),
  updatedDay: integer("updated_day"),
  // 真なら更新日を今日にする。
  updatedAuto: integer("updated_auto", { mode: "boolean" }).notNull().default(false),
  name: text("name").notNull(),
  age: integer("age"),
  gender: text("gender").notNull().default(""),
  // 自由入力の経験年数。experience_auto が真なら職務経歴から数える。
  experience: text("experience").notNull().default(""),
  experienceAuto: integer("experience_auto", { mode: "boolean" }).notNull().default(true),
  education: text("education").notNull(),
  station: text("station").notNull(),
  selfPr: text("self_pr").notNull(),
  desiredHours: text("desired_hours").notNull().default(""),
  desiredEmployment: text("desired_employment").notNull().default(""),
  affiliation: text("affiliation").notNull().default(""),
  strongSkills: text("strong_skills").notNull().default(""),
  strongWork: text("strong_work").notNull().default(""),
  showAge: integer("show_age", { mode: "boolean" }).notNull().default(true),
  showGender: integer("show_gender", { mode: "boolean" }).notNull().default(true),
  showExperience: integer("show_experience", { mode: "boolean" }).notNull().default(true),
  showEducation: integer("show_education", { mode: "boolean" }).notNull().default(true),
  showStation: integer("show_station", { mode: "boolean" }).notNull().default(true),
  showDesiredHours: integer("show_desired_hours", { mode: "boolean" }).notNull().default(true),
  showDesiredEmployment: integer("show_desired_employment", { mode: "boolean" })
    .notNull()
    .default(true),
  showAffiliation: integer("show_affiliation", { mode: "boolean" }).notNull().default(true),
  showSelfPr: integer("show_self_pr", { mode: "boolean" }).notNull().default(true),
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
  experienceMonths: integer("experience_months"),
  // 真なら経験年数を職務経歴から数える。
  experienceAuto: integer("experience_auto", { mode: "boolean" }).notNull().default(false),
});

export const careers = sqliteTable("careers", {
  id: text("id").primaryKey(),
  startYear: integer("start_year").notNull(),
  startMonth: integer("start_month").notNull(),
  endYear: integer("end_year"),
  endMonth: integer("end_month"),
  projectName: text("project_name").notNull(),
  // 職務経歴の一覧に出す概要。
  summary: text("summary").notNull(),
  // 職務経歴の詳細に出す概要。空なら一覧の概要を使う。
  detailSummary: text("detail_summary").notNull().default(""),
  work: text("work").notNull(),
  outcome: text("outcome").notNull(),
  role: text("role").notNull(),
  employment: text("employment").notNull(),
  team: text("team").notNull(),
  methodology: text("methodology").notNull(),
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

// 自己紹介の下に並べるポートフォリオなどのリンク。
export const profileLinks = sqliteTable("profile_links", {
  position: integer("position").primaryKey(),
  label: text("label").notNull(),
  url: text("url").notNull(),
});
