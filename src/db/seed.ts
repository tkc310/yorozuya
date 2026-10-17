import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { createFixtureSheet, durationMonths } from "../../shared/features/skill-sheet/sheet";
import * as schema from "./schema";

type SeedDatabase = BaseSQLiteDatabase<"sync", void, typeof schema>;

export function seed(db: SeedDatabase): void {
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
        updatedDay: sheet.updatedOn?.day ?? null,
        updatedAuto: sheet.updatedAuto,
        name: sheet.name,
        age: sheet.age,
        gender: sheet.gender ?? "",
        experience: sheet.experience,
        experienceAuto: sheet.experienceAuto,
        showAge: sheet.visibility.age,
        showGender: sheet.visibility.gender,
        showExperience: sheet.visibility.experience,
        showEducation: sheet.visibility.education,
        showStation: sheet.visibility.station,
        showDesiredHours: sheet.visibility.desiredHours,
        showDesiredEmployment: sheet.visibility.desiredEmployment,
        showAffiliation: sheet.visibility.affiliation,
        showSelfPr: sheet.visibility.selfPr,
        education: sheet.education,
        station: sheet.station,
        selfPr: sheet.selfPr,
        desiredHours: sheet.desiredHours,
        desiredEmployment: sheet.desiredEmployment,
        affiliation: sheet.affiliation,
        strongSkills: sheet.strongSkills,
        strongWork: sheet.strongWork,
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
            experienceMonths: skill.experience ? durationMonths(skill.experience) : null,
            experienceAuto: skill.auto ?? false,
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
          detailSummary: career.detailSummary,
          work: career.work,
          outcome: career.outcome,
          role: career.role,
          employment: career.employment,
          team: career.team,
          methodology: career.methodology,
          hard: career.hard,
          position: careerIndex,
        })
        .run();
      career.environment.forEach((name, position) => {
        tx.insert(schema.careerEnvironments).values({ careerId: career.id, position, name }).run();
      });
      career.tools.forEach((name, position) => {
        tx.insert(schema.careerTools).values({ careerId: career.id, position, name }).run();
      });
      career.phases.forEach((phase, position) => {
        tx.insert(schema.careerPhases).values({ careerId: career.id, position, phase }).run();
      });
    });
  });
}
