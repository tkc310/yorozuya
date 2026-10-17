import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { err, ok, type Result } from "neverthrow";
import { skillGroups, skills } from "../../../db/schema";
import { getDb } from "../db";
import type { SheetFailure } from "./failure";

export function insertSkill(
  groupName: string,
  skillName: string,
): Result<{ saved: true }, SheetFailure> {
  try {
    const name = skillName.trim();
    const group = groupName.trim();
    if (name.length === 0 || group.length === 0) {
      return err({ message: "技術名を入れてください" });
    }
    const db = getDb();
    const duplicate = db.select().from(skills).all().some((row) => row.name.trim() === name);
    if (duplicate) {
      return ok({ saved: true });
    }
    db.transaction((tx) => {
      const groups = tx.select().from(skillGroups).all();
      const existing = groups.find((row) => row.name === group);
      const groupId = existing?.id ?? randomUUID();
      if (!existing) {
        tx.insert(skillGroups)
          .values({ id: groupId, name: group, position: groups.length })
          .run();
      }
      const position = tx.select().from(skills).where(eq(skills.groupId, groupId)).all().length;
      tx.insert(skills).values({ id: randomUUID(), groupId, name, position }).run();
    });
    return ok({ saved: true });
  } catch (error) {
    return err({ message: error instanceof Error ? error.message : "技術を追加できませんでした" });
  }
}
