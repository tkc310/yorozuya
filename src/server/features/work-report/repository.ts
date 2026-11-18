import { and, desc, eq, like, lt, or } from "drizzle-orm";
import { err, ok, type Result } from "neverthrow";
import {
  DAY_OVERRIDES,
  DEFAULT_SETTINGS,
  type DayEntry,
  type DayOverride,
  type MonthRange,
  type WorkReportMonth,
  type WorkReportSettings,
} from "@/src/shared/features/work-report/report.schema";
import { isEmptyEntry } from "@/src/shared/features/work-report/report.service";
import { workReportDays, workReportMonths, workReportSettings } from "@/src/server/db/schema";
import type { YorozuyaDatabase } from "@/src/server/lib/db";
import { ServerFunctionError } from "@/src/error";

const SETTINGS_ID = "default";

function failure(error: unknown, fallback: string): ServerFunctionError {
  return new ServerFunctionError(error instanceof Error ? error.message : fallback);
}

function isOverride(value: string): value is DayOverride {
  return (DAY_OVERRIDES as readonly string[]).includes(value);
}

function monthPrefix(year: number, month: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-`;
}

export class WorkReportRepository {
  constructor(private readonly db: YorozuyaDatabase) {}

  private settings(): WorkReportSettings {
    const row = this.db
      .select()
      .from(workReportSettings)
      .where(eq(workReportSettings.id, SETTINGS_ID))
      .get();
    if (!row) {
      return DEFAULT_SETTINGS;
    }
    return {
      weekdayMinutes: [
        row.sunMinutes,
        row.monMinutes,
        row.tueMinutes,
        row.wedMinutes,
        row.thuMinutes,
        row.friMinutes,
        row.satMinutes,
      ],
      holidaysOff: row.holidaysOff,
      defaultStart: row.defaultStart,
      defaultBreak: row.defaultBreak,
      name: row.name,
      client: row.client,
      project: row.project,
    };
  }

  // 精算幅が未設定の月は、それより前で最も新しい月の値を引き継いで見せる（保存はしない）。
  private range(year: number, month: number): MonthRange {
    const own = this.db
      .select()
      .from(workReportMonths)
      .where(and(eq(workReportMonths.year, year), eq(workReportMonths.month, month)))
      .get();
    const row =
      own ??
      this.db
        .select()
        .from(workReportMonths)
        .where(
          or(
            lt(workReportMonths.year, year),
            and(eq(workReportMonths.year, year), lt(workReportMonths.month, month)),
          ),
        )
        .orderBy(desc(workReportMonths.year), desc(workReportMonths.month))
        .get();
    return {
      year,
      month,
      minMinutes: row?.minMinutes ?? null,
      maxMinutes: row?.maxMinutes ?? null,
    };
  }

  private entries(year: number, month: number): DayEntry[] {
    return this.db
      .select()
      .from(workReportDays)
      .where(like(workReportDays.date, `${monthPrefix(year, month)}%`))
      .orderBy(workReportDays.date)
      .all()
      .map((row) => ({
        date: row.date,
        start: row.start,
        end: row.end,
        breakMinutes: row.breakMinutes,
        override: isOverride(row.override) ? row.override : "none",
        note: row.note,
      }));
  }

  readMonth(year: number, month: number): Result<WorkReportMonth, ServerFunctionError> {
    try {
      return ok({
        settings: this.settings(),
        range: this.range(year, month),
        entries: this.entries(year, month),
      });
    } catch (error) {
      return err(failure(error, "作業報告書を読めませんでした"));
    }
  }

  readYear(year: number): Result<WorkReportMonth[], ServerFunctionError> {
    try {
      const settings = this.settings();
      return ok(
        Array.from({ length: 12 }, (_, index) => ({
          settings,
          range: this.range(year, index + 1),
          entries: this.entries(year, index + 1),
        })),
      );
    } catch (error) {
      return err(failure(error, "作業報告書を読めませんでした"));
    }
  }

  saveSettings(input: WorkReportSettings): Result<{ saved: true }, ServerFunctionError> {
    try {
      const [sun, mon, tue, wed, thu, fri, sat] = input.weekdayMinutes;
      const values = {
        sunMinutes: sun,
        monMinutes: mon,
        tueMinutes: tue,
        wedMinutes: wed,
        thuMinutes: thu,
        friMinutes: fri,
        satMinutes: sat,
        holidaysOff: input.holidaysOff,
        defaultStart: input.defaultStart,
        defaultBreak: input.defaultBreak,
        name: input.name,
        client: input.client,
        project: input.project,
      };
      this.db
        .insert(workReportSettings)
        .values({ id: SETTINGS_ID, ...values })
        .onConflictDoUpdate({ target: workReportSettings.id, set: values })
        .run();
      return ok({ saved: true });
    } catch (error) {
      return err(failure(error, "稼働日設定を保存できませんでした"));
    }
  }

  saveRange(input: MonthRange): Result<{ saved: true }, ServerFunctionError> {
    try {
      const values = { minMinutes: input.minMinutes, maxMinutes: input.maxMinutes };
      this.db
        .insert(workReportMonths)
        .values({ year: input.year, month: input.month, ...values })
        .onConflictDoUpdate({
          target: [workReportMonths.year, workReportMonths.month],
          set: values,
        })
        .run();
      return ok({ saved: true });
    } catch (error) {
      return err(failure(error, "精算幅を保存できませんでした"));
    }
  }

  // 空の入力は行ごと消し、入力した日だけを持つ。
  saveDay(input: DayEntry): Result<{ saved: true }, ServerFunctionError> {
    try {
      if (isEmptyEntry(input)) {
        this.db.delete(workReportDays).where(eq(workReportDays.date, input.date)).run();
        return ok({ saved: true });
      }
      const values = {
        start: input.start,
        end: input.end,
        breakMinutes: input.breakMinutes,
        override: input.override,
        note: input.note,
      };
      this.db
        .insert(workReportDays)
        .values({ date: input.date, ...values })
        .onConflictDoUpdate({ target: workReportDays.date, set: values })
        .run();
      return ok({ saved: true });
    } catch (error) {
      return err(failure(error, "入力を保存できませんでした"));
    }
  }
}
