import { randomUUID } from "node:crypto";
import { asc, desc, eq } from "drizzle-orm";
import { err, ok, type Result } from "neverthrow";
import {
  PHASES,
  durationMonths,
  fromMonths,
  type Career,
  isGender,
  type CalendarDate,
  type Duration,
  type Gender,
  type Phase,
  type ProfileLink,
  type ProfileTexts,
  type ProfileVisibility,
  type SheetInput,
  type Skill,
  type YearMonth,
} from "@/shared/features/skill-sheet/sheet";
import {
  careerEnvironments,
  careerPhases,
  careerTools,
  careers,
  profileLinks,
  profiles,
  skillGroups,
  skills,
} from "@/src/db/schema";
import type { YorozuyaDatabase } from "@/src/server/lib/db";
import { ServerFunctionError } from "@/src/error";

export type ProfileWrite = {
  updatedOn: CalendarDate | null;
  updatedAuto: boolean;
  name: string;
  age: number | null;
  gender: Gender | null;
  experience: string;
  experienceAuto: boolean;
  visibility: ProfileVisibility;
  links: ProfileLink[];
  education: string;
  station: string;
  selfPr: string;
} & ProfileTexts;

export type CareerWrite = Omit<Career, "id">;

export type SheetImport = ProfileWrite & {
  skillGroups: { name: string; skills: Skill[] }[];
  careers: CareerWrite[];
};

function month(year: number | null, value: number | null): YearMonth | null {
  if (year === null || value === null) {
    return null;
  }
  return { year, month: value };
}

function experienceMonths(experience: Duration | null): number | null {
  if (!experience) {
    return null;
  }
  const total = durationMonths(experience);
  return total > 0 ? total : null;
}

function skillOf(name: string, months: number | null, auto: boolean): Skill {
  const base: Skill = auto ? { name, auto } : { name };
  return months === null || months <= 0 ? base : { ...base, experience: fromMonths(months) };
}

// 日が無い古い行はその月の1日として読む。
function date(
  year: number | null,
  monthValue: number | null,
  day: number | null,
): CalendarDate | null {
  const value = month(year, monthValue);
  return value ? { ...value, day: day ?? 1 } : null;
}

function isPhase(value: string): value is Phase {
  return (PHASES as readonly string[]).includes(value);
}

type Transaction = Parameters<Parameters<YorozuyaDatabase["transaction"]>[0]>[0];

function profileColumns(input: ProfileWrite) {
  return {
    updatedYear: input.updatedOn?.year ?? null,
    updatedMonth: input.updatedOn?.month ?? null,
    updatedDay: input.updatedOn?.day ?? null,
    updatedAuto: input.updatedAuto,
    name: input.name,
    age: input.age,
    gender: input.gender ?? "",
    experience: input.experience,
    experienceAuto: input.experienceAuto,
    showAge: input.visibility.age,
    showGender: input.visibility.gender,
    showExperience: input.visibility.experience,
    showEducation: input.visibility.education,
    showStation: input.visibility.station,
    showDesiredHours: input.visibility.desiredHours,
    showDesiredEmployment: input.visibility.desiredEmployment,
    showAffiliation: input.visibility.affiliation,
    showSelfPr: input.visibility.selfPr,
    education: input.education,
    station: input.station,
    selfPr: input.selfPr,
    desiredHours: input.desiredHours,
    desiredEmployment: input.desiredEmployment,
    affiliation: input.affiliation,
    strongSkills: input.strongSkills,
    strongWork: input.strongWork,
  };
}

function careerColumns(input: CareerWrite) {
  return {
    startYear: input.period.start.year,
    startMonth: input.period.start.month,
    endYear: input.period.end?.year ?? null,
    endMonth: input.period.end?.month ?? null,
    projectName: input.projectName,
    summary: input.summary,
    detailSummary: input.detailSummary,
    work: input.work,
    outcome: input.outcome,
    role: input.role,
    employment: input.employment,
    team: input.team,
    methodology: input.methodology,
    hard: input.hard,
  };
}

function replaceLinks(tx: Transaction, links: ProfileLink[]): void {
  tx.delete(profileLinks).run();
  links.forEach((link, index) => {
    tx.insert(profileLinks).values({ position: index, label: link.label, url: link.url }).run();
  });
}

function insertCareerDetails(tx: Transaction, careerId: string, input: CareerWrite): void {
  input.environment.forEach((name, index) => {
    tx.insert(careerEnvironments).values({ careerId, position: index, name }).run();
  });
  input.tools.forEach((name, index) => {
    tx.insert(careerTools).values({ careerId, position: index, name }).run();
  });
  input.phases.forEach((phase, index) => {
    tx.insert(careerPhases).values({ careerId, position: index, phase }).run();
  });
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
        updatedOn: date(profile.updatedYear, profile.updatedMonth, profile.updatedDay),
        updatedAuto: profile.updatedAuto,
        name: profile.name,
        age: profile.age,
        gender: isGender(profile.gender) ? profile.gender : null,
        experience: profile.experience,
        experienceAuto: profile.experienceAuto,
        visibility: {
          age: profile.showAge,
          gender: profile.showGender,
          experience: profile.showExperience,
          education: profile.showEducation,
          station: profile.showStation,
          desiredHours: profile.showDesiredHours,
          desiredEmployment: profile.showDesiredEmployment,
          affiliation: profile.showAffiliation,
          selfPr: profile.showSelfPr,
        },
        education: profile.education,
        station: profile.station,
        selfPr: profile.selfPr,
        desiredHours: profile.desiredHours,
        desiredEmployment: profile.desiredEmployment,
        affiliation: profile.affiliation,
        strongSkills: profile.strongSkills,
        strongWork: profile.strongWork,
        links: this.db
          .select()
          .from(profileLinks)
          .orderBy(asc(profileLinks.position))
          .all()
          .map((link) => ({ label: link.label, url: link.url })),
        skillGroups: groups.map((group) => ({
          name: group.name,
          skills: skillRows
            .filter((skill) => skill.groupId === group.id)
            .map((skill) => skillOf(skill.name, skill.experienceMonths, skill.experienceAuto)),
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
            detailSummary: career.detailSummary,
            work: career.work,
            outcome: career.outcome,
            role: career.role,
            employment: career.employment,
            environment: environments
              .filter((row) => row.careerId === career.id)
              .map((row) => row.name),
            team: career.team,
            methodology: career.methodology,
            tools: tools.filter((row) => row.careerId === career.id).map((row) => row.name),
            phases: phases
              .filter((row) => row.careerId === career.id)
              .map((row) => row.phase)
              .filter(isPhase),
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
      this.db.transaction((tx) => {
        tx.update(profiles).set(profileColumns(input)).where(eq(profiles.id, "profile")).run();
        replaceLinks(tx, input.links);
      });
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
          .values({ id, ...careerColumns(input), position })
          .run();
        insertCareerDetails(tx, id, input);
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

  updateCareer(careerId: string, input: CareerWrite): Result<{ saved: true }, ServerFunctionError> {
    try {
      const found = this.db.select().from(careers).where(eq(careers.id, careerId)).all()[0];
      if (!found) {
        return err(new ServerFunctionError("経歴がありません"));
      }
      this.db.transaction((tx) => {
        tx.update(careers).set(careerColumns(input)).where(eq(careers.id, careerId)).run();
        tx.delete(careerEnvironments).where(eq(careerEnvironments.careerId, careerId)).run();
        tx.delete(careerTools).where(eq(careerTools.careerId, careerId)).run();
        tx.delete(careerPhases).where(eq(careerPhases.careerId, careerId)).run();
        insertCareerDetails(tx, careerId, input);
      });
      return ok({ saved: true });
    } catch (error) {
      return err(
        new ServerFunctionError(
          error instanceof Error ? error.message : "経歴を保存できませんでした",
        ),
      );
    }
  }

  // JSON から読み込んだシートで、プロフィール・保有技術・職務経歴をまとめて置き換える。
  replaceSheet(sheet: SheetImport): Result<{ saved: true }, ServerFunctionError> {
    try {
      const existing = this.db.select().from(profiles).where(eq(profiles.id, "profile")).all()[0];
      if (!existing) {
        return err(new ServerFunctionError("シートがありません"));
      }
      this.db.transaction((tx) => {
        tx.update(profiles).set(profileColumns(sheet)).where(eq(profiles.id, "profile")).run();
        replaceLinks(tx, sheet.links);
        tx.delete(skills).run();
        tx.delete(skillGroups).run();
        tx.delete(careerEnvironments).run();
        tx.delete(careerTools).run();
        tx.delete(careerPhases).run();
        tx.delete(careers).run();
        sheet.skillGroups.forEach((group, groupIndex) => {
          const groupId = randomUUID();
          tx.insert(skillGroups)
            .values({ id: groupId, name: group.name, position: groupIndex })
            .run();
          group.skills.forEach((skill, skillIndex) => {
            tx.insert(skills)
              .values({
                id: randomUUID(),
                groupId,
                name: skill.name,
                position: skillIndex,
                experienceMonths: experienceMonths(skill.experience ?? null),
                experienceAuto: skill.auto ?? false,
              })
              .run();
          });
        });
        sheet.careers.forEach((career, careerIndex) => {
          const id = randomUUID();
          tx.insert(careers)
            .values({ id, ...careerColumns(career), position: careerIndex })
            .run();
          insertCareerDetails(tx, id, career);
        });
      });
      return ok({ saved: true });
    } catch (error) {
      return err(
        new ServerFunctionError(
          error instanceof Error ? error.message : "JSON を読み込めませんでした",
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

  addSkill(
    groupName: string,
    skillName: string,
    experience: Duration | null = null,
    auto = false,
  ): Result<{ saved: true }, ServerFunctionError> {
    try {
      const name = skillName.trim();
      const group = groupName.trim();
      if (name.length === 0 || group.length === 0) {
        return err(new ServerFunctionError("技術名を入力してください"));
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
        tx.insert(skills)
          .values({
            id: randomUUID(),
            groupId,
            name,
            position,
            experienceMonths: experienceMonths(experience),
            experienceAuto: auto,
          })
          .run();
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

  updateSkillExperience(
    skillName: string,
    experience: Duration | null,
    auto: boolean,
  ): Result<{ saved: true }, ServerFunctionError> {
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
      const months = experienceMonths(experience);
      this.db.transaction((tx) => {
        for (const match of matches) {
          tx.update(skills)
            .set({ experienceMonths: months, experienceAuto: auto })
            .where(eq(skills.id, match.id))
            .run();
        }
      });
      return ok({ saved: true });
    } catch (error) {
      return err(
        new ServerFunctionError(
          error instanceof Error ? error.message : "経験年数を保存できませんでした",
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
