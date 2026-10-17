import { desc } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { err, ok, type Result } from "neverthrow";
import type { Career } from "../../../../shared/features/skill-sheet/sheet";
import { careerEnvironments, careerPhases, careerTools, careers } from "../../../db/schema";
import { getDb } from "../db";
import type { SheetFailure } from "./failure";

export type CareerWrite = Omit<Career, "id">;

export function insertCareer(input: CareerWrite): Result<{ saved: true }, SheetFailure> {
  try {
    const db = getDb();
    const id = randomUUID();
    const last = db.select().from(careers).orderBy(desc(careers.position)).all()[0];
    const position = last ? last.position + 1 : 0;
    db.transaction((tx) => {
      tx.insert(careers)
        .values({
          id,
          startYear: input.period.start.year,
          startMonth: input.period.start.month,
          endYear: input.period.end?.year ?? null,
          endMonth: input.period.end?.month ?? null,
          projectName: input.projectName,
          summary: input.summary,
          work: input.work,
          outcome: input.outcome,
          role: input.role,
          employment: input.employment,
          positionName: input.position,
          team: input.team,
          methodology: input.methodology,
          parallel: input.parallel,
          hard: input.hard,
          position,
        })
        .run();
      input.environment.forEach((name, index) => {
        tx.insert(careerEnvironments).values({ careerId: id, position: index, name }).run();
      });
      input.tools.forEach((name, index) => {
        tx.insert(careerTools).values({ careerId: id, position: index, name }).run();
      });
      input.phases.forEach((phase, index) => {
        tx.insert(careerPhases).values({ careerId: id, position: index, phase }).run();
      });
    });
    return ok({ saved: true });
  } catch (error) {
    return err({ message: error instanceof Error ? error.message : "経歴を追加できませんでした" });
  }
}
