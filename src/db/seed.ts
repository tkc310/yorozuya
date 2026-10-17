import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { createFixtureSheet } from "../../shared/features/skill-sheet/sheet";
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
