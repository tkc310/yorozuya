import { randomUUID } from "node:crypto";
import { asc, desc, eq } from "drizzle-orm";
import { err, ok, type Result } from "neverthrow";
import {
  PHASES,
  type Career,
  type Phase,
  type SheetInput,
  type YearMonth,
} from "@/shared/features/skill-sheet/sheet";
import {
  careerEnvironments,
  careerPhases,
  careerTools,
  careers,
  profiles,
  skillGroups,
  skills,
} from "@/src/db/schema";
import type { YorozuyaDatabase } from "@/src/server/lib/db";
import { ServerFunctionError } from "@/src/error";

export type ProfileWrite = {
  updatedOn: YearMonth | null;
  name: string;
  workStyle: string;
  education: string;
  station: string;
  selfPr: string;
};

export type CareerWrite = Omit<Career, "id">;

function month(year: number | null, value: number | null): YearMonth | null {
  if (year === null || value === null) {
    return null;
  }
  return { year, month: value };
}

function isPhase(value: string): value is Phase {
  return (PHASES as readonly string[]).includes(value);
}

export class SkillSheetRepository {
  constructor(private readonly db: YorozuyaDatabase) {}

  read(): Result<SheetInput, ServerFunctionError> {
    try {
      const profile = this.db.select().from(profiles).all()[0];
      if (!profile) {
        return err(new ServerFunctionError("シートがありません"));
      }
      const groups = this.db.select().from(skillGroups).orderBy(asc(skillGroups.position)).all();
      const skillRows = this.db.select().from(skills).orderBy(asc(skills.position)).all();
      const careerRows = this.db.select().from(careers).orderBy(asc(careers.position)).all();
      const environments = this.db
        .select()
        .from(careerEnvironments)
        .orderBy(asc(careerEnvironments.position))
        .all();
      const tools = this.db.select().from(careerTools).orderBy(asc(careerTools.position)).all();
      const phases = this.db.select().from(careerPhases).orderBy(asc(careerPhases.position)).all();
      const sheet: SheetInput = {
        updatedOn: month(profile.updatedYear, profile.updatedMonth),
        name: profile.name,
        workStyle: profile.workStyle,
        education: profile.education,
        station: profile.station,
        selfPr: profile.selfPr,
        skillGroups: groups.map((group) => ({
          name: group.name,
          skills: skillRows
            .filter((skill) => skill.groupId === group.id)
            .map((skill) => ({ name: skill.name })),
        })),
        careers: careerRows.map((career) => {
          const item: Career = {
            id: career.id,
            period: {
              start: { year: career.startYear, month: career.startMonth },
              end: month(career.endYear, career.endMonth),
            },
            projectName: career.projectName,
            summary: career.summary,
            work: career.work,
            outcome: career.outcome,
            role: career.role,
            employment: career.employment,
            environment: environments
              .filter((row) => row.careerId === career.id)
              .map((row) => row.name),
            position: career.positionName,
            team: career.team,
            methodology: career.methodology,
            tools: tools.filter((row) => row.careerId === career.id).map((row) => row.name),
            phases: phases
              .filter((row) => row.careerId === career.id)
              .map((row) => row.phase)
              .filter(isPhase),
            parallel: career.parallel,
            hard: career.hard,
          };
          return item;
        }),
      };
      return ok(sheet);
    } catch (error) {
      return err(
        new ServerFunctionError(error instanceof Error ? error.message : "読み込みに失敗しました"),
      );
    }
  }

  updateProfile(input: ProfileWrite): Result<{ saved: true }, ServerFunctionError> {
    try {
      const existing = this.db.select().from(profiles).where(eq(profiles.id, "profile")).all()[0];
      if (!existing) {
        return err(new ServerFunctionError("シートがありません"));
      }
      this.db
        .update(profiles)
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
      return err(
        new ServerFunctionError(error instanceof Error ? error.message : "保存に失敗しました"),
      );
    }
  }

  addCareer(input: CareerWrite): Result<{ saved: true }, ServerFunctionError> {
    try {
      const id = randomUUID();
      const last = this.db.select().from(careers).orderBy(desc(careers.position)).all()[0];
      const position = last ? last.position + 1 : 0;
      this.db.transaction((tx) => {
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
      return err(
        new ServerFunctionError(
          error instanceof Error ? error.message : "経歴を追加できませんでした",
        ),
      );
    }
  }

  removeCareer(careerId: string): Result<{ saved: true }, ServerFunctionError> {
    try {
      const found = this.db.select().from(careers).where(eq(careers.id, careerId)).all()[0];
      if (!found) {
        return err(new ServerFunctionError("経歴がありません"));
      }
      this.db.transaction((tx) => {
        tx.delete(careerEnvironments).where(eq(careerEnvironments.careerId, careerId)).run();
        tx.delete(careerTools).where(eq(careerTools.careerId, careerId)).run();
        tx.delete(careerPhases).where(eq(careerPhases.careerId, careerId)).run();
        tx.delete(careers).where(eq(careers.id, careerId)).run();
      });
      return ok({ saved: true });
    } catch (error) {
      return err(
        new ServerFunctionError(
          error instanceof Error ? error.message : "経歴を削除できませんでした",
        ),
      );
    }
  }

  addSkill(groupName: string, skillName: string): Result<{ saved: true }, ServerFunctionError> {
    try {
      const name = skillName.trim();
      const group = groupName.trim();
      if (name.length === 0 || group.length === 0) {
        return err(new ServerFunctionError("技術名を入れてください"));
      }
      const duplicate = this.db
        .select()
        .from(skills)
        .all()
        .some((row) => row.name.trim() === name);
      if (duplicate) {
        return ok({ saved: true });
      }
      this.db.transaction((tx) => {
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
      return err(
        new ServerFunctionError(
          error instanceof Error ? error.message : "技術を追加できませんでした",
        ),
      );
    }
  }

  removeSkill(skillName: string): Result<{ saved: true }, ServerFunctionError> {
    try {
      const name = skillName.trim();
      const matches = this.db
        .select()
        .from(skills)
        .all()
        .filter((row) => row.name.trim() === name);
      if (matches.length === 0) {
        return err(new ServerFunctionError("技術がありません"));
      }
      this.db.transaction((tx) => {
        for (const match of matches) {
          tx.delete(skills).where(eq(skills.id, match.id)).run();
          const remaining = tx.select().from(skills).where(eq(skills.groupId, match.groupId)).all();
          if (remaining.length === 0) {
            tx.delete(skillGroups).where(eq(skillGroups.id, match.groupId)).run();
          }
        }
      });
      return ok({ saved: true });
    } catch (error) {
      return err(
        new ServerFunctionError(
          error instanceof Error ? error.message : "技術を削除できませんでした",
        ),
      );
    }
  }
}
