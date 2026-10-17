import { eq } from "drizzle-orm";
import { err, ok, type Result } from "neverthrow";
import type { YearMonth } from "../../../../shared/features/skill-sheet/sheet";
import { profiles } from "../../../db/schema";
import { getDb } from "../db";
import type { SheetFailure } from "./failure";

export type ProfileWrite = {
  updatedOn: YearMonth | null;
  name: string;
  workStyle: string;
  education: string;
  station: string;
  selfPr: string;
};

export function writeProfile(input: ProfileWrite): Result<{ saved: true }, SheetFailure> {
  try {
    const db = getDb();
    const existing = db.select().from(profiles).where(eq(profiles.id, "profile")).all()[0];
    if (!existing) {
      return err({ message: "シートがありません" });
    }
    db.update(profiles)
      .set({
        updatedYear: input.updatedOn?.year ?? null,
        updatedMonth: input.updatedOn?.month ?? null,
        name: input.name,
        workStyle: input.workStyle,
        education: input.education,
        station: input.station,
        selfPr: input.selfPr,
      })
      .where(eq(profiles.id, "profile"))
      .run();
    return ok({ saved: true });
  } catch (error) {
    return err({ message: error instanceof Error ? error.message : "保存に失敗しました" });
  }
}
