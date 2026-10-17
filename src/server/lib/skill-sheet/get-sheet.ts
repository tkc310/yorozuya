import { asc } from "drizzle-orm";
import { err, ok, type Result } from "neverthrow";
import {
  PHASES,
  type Career,
  type Phase,
  type SheetInput,
  type YearMonth,
} from "../../../../shared/features/skill-sheet/sheet";
import {
  careerEnvironments,
  careerPhases,
  careerTools,
  careers,
  profiles,
  skillGroups,
  skills,
} from "../../../db/schema";
import { getDb } from "../db";
import type { SheetFailure } from "./failure";

function month(year: number | null, value: number | null): YearMonth | null {
  if (year === null || value === null) {
    return null;
  }
  return { year, month: value };
}

function isPhase(value: string): value is Phase {
  return (PHASES as readonly string[]).includes(value);
}

export function readSheet(): Result<SheetInput, SheetFailure> {
  try {
    const db = getDb();
    const profile = db.select().from(profiles).all()[0];
    if (!profile) {
      return err({ message: "シートがありません" });
    }
    const groups = db.select().from(skillGroups).orderBy(asc(skillGroups.position)).all();
    const skillRows = db.select().from(skills).orderBy(asc(skills.position)).all();
    const careerRows = db.select().from(careers).orderBy(asc(careers.position)).all();
    const environments = db
      .select()
      .from(careerEnvironments)
      .orderBy(asc(careerEnvironments.position))
      .all();
    const tools = db.select().from(careerTools).orderBy(asc(careerTools.position)).all();
    const phases = db.select().from(careerPhases).orderBy(asc(careerPhases.position)).all();
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
    return err({ message: error instanceof Error ? error.message : "読み込みに失敗しました" });
  }
}
