import { eq } from "drizzle-orm";
import { err, ok, type Result } from "neverthrow";
import { skillGroups, skills } from "../../../db/schema";
import { getDb } from "../db";
import type { SheetFailure } from "./failure";

export function deleteSkill(skillName: string): Result<{ saved: true }, SheetFailure> {
  try {
    const name = skillName.trim();
    const db = getDb();
    const matches = db
      .select()
      .from(skills)
      .all()
      .filter((row) => row.name.trim() === name);
    if (matches.length === 0) {
      return err({ message: "技術がありません" });
    }
    db.transaction((tx) => {
      for (const match of matches) {
        tx.delete(skills).where(eq(skills.id, match.id)).run();
        const remaining = tx
          .select()
          .from(skills)
          .where(eq(skills.groupId, match.groupId))
          .all();
        if (remaining.length === 0) {
          tx.delete(skillGroups).where(eq(skillGroups.id, match.groupId)).run();
        }
      }
    });
    return ok({ saved: true });
  } catch (error) {
    return err({ message: error instanceof Error ? error.message : "技術を削除できませんでした" });
  }
}
