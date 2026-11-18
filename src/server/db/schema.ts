import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  updatedYear: integer("updated_year"),
  updatedMonth: integer("updated_month"),
  updatedDay: integer("updated_day"),
  // 真なら更新日を今日にする。
  updatedAuto: integer("updated_auto", { mode: "boolean" }).notNull().default(false),
  name: text("name").notNull(),
  nameKana: text("name_kana").notNull().default(""),
  nameInitials: text("name_initials").notNull().default(""),
  // full か initials。
  nameDisplay: text("name_display").notNull().default("full"),
  title: text("title").notNull().default(""),
  availableFrom: text("available_from").notNull().default(""),
  desiredRate: text("desired_rate").notNull().default(""),
  workStyle: text("work_style").notNull().default(""),
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
  showAge: integer("show_age", { mode: "boolean" }).notNull().default(true),
  showGender: integer("show_gender", { mode: "boolean" }).notNull().default(true),
  showExperience: integer("show_experience", { mode: "boolean" }).notNull().default(true),
  showEducation: integer("show_education", { mode: "boolean" }).notNull().default(true),
  showStation: integer("show_station", { mode: "boolean" }).notNull().default(true),
  showAvailableFrom: integer("show_available_from", { mode: "boolean" }).notNull().default(true),
  showDesiredRate: integer("show_desired_rate", { mode: "boolean" }).notNull().default(false),
  showWorkStyle: integer("show_work_style", { mode: "boolean" }).notNull().default(true),
  showHighlights: integer("show_highlights", { mode: "boolean" }).notNull().default(true),
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
  // 真なら主要スキルとして 1 ページ目に出す。
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
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

// 1 ページ目に出すハイライト。
export const profileHighlights = sqliteTable("profile_highlights", {
  position: integer("position").primaryKey(),
  text: text("text").notNull(),
});

// 資格・語学。
export const profileQualifications = sqliteTable("profile_qualifications", {
  position: integer("position").primaryKey(),
  name: text("name").notNull(),
});

// 作業報告書。設定は 1 行だけ持つ（id は "default"）。時間はすべて分。
export const workReportSettings = sqliteTable("work_report_settings", {
  id: text("id").primaryKey(),
  sunMinutes: integer("sun_minutes").notNull().default(0),
  monMinutes: integer("mon_minutes").notNull().default(480),
  tueMinutes: integer("tue_minutes").notNull().default(480),
  wedMinutes: integer("wed_minutes").notNull().default(480),
  thuMinutes: integer("thu_minutes").notNull().default(480),
  friMinutes: integer("fri_minutes").notNull().default(480),
  satMinutes: integer("sat_minutes").notNull().default(0),
  holidaysOff: integer("holidays_off", { mode: "boolean" }).notNull().default(true),
  defaultStart: integer("default_start").notNull().default(600),
  defaultBreak: integer("default_break").notNull().default(60),
  name: text("name").notNull().default(""),
  client: text("client").notNull().default(""),
  project: text("project").notNull().default(""),
});

// 月ごとの精算幅。
export const workReportMonths = sqliteTable(
  "work_report_months",
  {
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    minMinutes: integer("min_minutes"),
    maxMinutes: integer("max_minutes"),
  },
  (table) => [primaryKey({ columns: [table.year, table.month] })],
);

// 入力した日だけを持つ。date は 'YYYY-MM-DD'。
export const workReportDays = sqliteTable("work_report_days", {
  date: text("date").primaryKey(),
  start: integer("start"),
  end: integer("end"),
  breakMinutes: integer("break_minutes").notNull().default(0),
  // none / off / work
  override: text("override").notNull().default("none"),
  note: text("note").notNull().default(""),
});

// 公表された祝日の写し。GitHub Pages の JSON から取り込む。
export const holidays = sqliteTable("holidays", {
  date: text("date").primaryKey(),
  name: text("name").notNull(),
});

// 取り込んだ祝日の範囲と取り込んだ日時。1 行だけ（id は "default"）。
export const holidayFeeds = sqliteTable("holiday_feeds", {
  id: text("id").primaryKey(),
  minYear: integer("min_year").notNull(),
  maxYear: integer("max_year").notNull(),
  fetchedAt: text("fetched_at").notNull(),
});
