import { eq } from "drizzle-orm";
import { err, ok, type Result } from "neverthrow";
import { careerEnvironments, careerPhases, careerTools, careers } from "../../../db/schema";
import { getDb } from "../db";
import type { SheetFailure } from "./failure";

export function deleteCareer(careerId: string): Result<{ saved: true }, SheetFailure> {
  try {
    const db = getDb();
    const found = db.select().from(careers).where(eq(careers.id, careerId)).all()[0];
    if (!found) {
      return err({ message: "経歴がありません" });
    }
    db.transaction((tx) => {
      tx.delete(careerEnvironments).where(eq(careerEnvironments.careerId, careerId)).run();
      tx.delete(careerTools).where(eq(careerTools.careerId, careerId)).run();
      tx.delete(careerPhases).where(eq(careerPhases.careerId, careerId)).run();
      tx.delete(careers).where(eq(careers.id, careerId)).run();
    });
    return ok({ saved: true });
  } catch (error) {
    return err({ message: error instanceof Error ? error.message : "経歴を削除できませんでした" });
  }
}
