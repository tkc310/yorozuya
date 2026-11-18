import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { css } from "styled-system/css";
import type { WorkReportMonth } from "@/src/shared/features/work-report/report.schema";
import { buildMonth, summarize, todayIso } from "@/src/shared/features/work-report/report.service";
import { QUERY_KEY, callServerFunction } from "@/src/lib/request";
import { Button } from "@/src/components/ui/Button/index";
import { Spinner } from "@/src/components/ui/Spinner/index";
import { DayTable } from "./DayTable/index";
import { MonthTabs } from "./MonthTabs/index";
import { exportFileName, monthSheet } from "./report-sheet.service";
import { SettingsDialog } from "./SettingsDialog/index";
import { Summary } from "./Summary/index";
import { useWorkReportCommands } from "./useWorkReportCommands";
import { buildXlsx } from "./xlsx.service";

const page = css({
  display: "grid",
  gap: "6",
  gridTemplateColumns: "minmax(0, 1fr)",
  margin: "0 auto",
  maxWidth: "90rem",
  p: { base: "4", md: "8" },
});

const header = css({
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: "4",
  justifyContent: "space-between",
});

const title = css({
  alignItems: "center",
  display: "flex",
  gap: "4",
});

const heading = css({
  margin: "0",
  textStyle: { base: "std-24B-150", md: "std-28B-150" },
});

const actions = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "2",
});

const body = css({
  alignItems: "start",
  display: "grid",
  gap: "6",
  gridTemplateColumns: "minmax(0, 1fr)",
  pt: "4",
  // 表と進み具合を並べるには md より広い幅が要る。
  "@media (min-width: 72rem)": { gridTemplateColumns: "minmax(0, 1fr) 20rem" },
});

// 狭い画面では進み具合を表より先に出す。
const aside = css({
  order: "-1",
  "@media (min-width: 72rem)": { order: "0", position: "sticky", top: "4" },
});

const alert = css({
  borderColor: "error",
  borderRadius: "12",
  borderWidth: "3px",
  color: "error",
  margin: "0",
  px: "4",
  py: "3",
  textStyle: "std-16B-170",
});

const notice = css({
  background: "bg.subtle",
  borderRadius: "8",
  margin: "0",
  mt: "4",
  px: "4",
  py: "2",
  textStyle: "std-14N-170",
});

const status = css({
  margin: "0",
  py: "8",
});

// リンクを文書に置いてから押し、ダウンロードが始まってから URL を捨てる（すぐ捨てるとファイル名が落ちる）。
function saveFile(bytes: Uint8Array, name: string) {
  const blob = new Blob([bytes as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function readYear(year: number): Promise<WorkReportMonth[]> {
  const { getYearFn } = await import("@/src/server/features/work-report/queries/get-year");
  return callServerFunction(getYearFn({ data: { year } }));
}

// breadcrumb はルートから渡す。ここではルーターに依存しない。today はストーリーで日付を固定するため。
export function WorkReport({ breadcrumb, today }: { breadcrumb?: ReactNode; today?: string }) {
  const [now] = useState(() => today ?? todayIso());
  const thisYear = Number(now.slice(0, 4));
  const thisMonth = Number(now.slice(5, 7));
  const [shown, setShown] = useState({ year: thisYear, month: thisMonth });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const commands = useWorkReportCommands();

  const query = useQuery({
    queryKey: [...QUERY_KEY.WORK_REPORT, shown.year, shown.month],
    queryFn: async () => {
      const { getMonthFn } = await import("@/src/server/features/work-report/queries/get-month");
      return callServerFunction(getMonthFn({ data: shown }));
    },
    retry: false,
    placeholderData: (previous) => previous,
  });

  const data = query.data;
  const rows = data
    ? buildMonth(shown.year, shown.month, data.settings, data.entries, data.holidays)
    : [];
  const summary = data ? summarize(rows, data.range, now) : null;
  const ready = data && !query.isPlaceholderData;

  async function exportYear() {
    try {
      const months = await readYear(shown.year);
      const sheets = months.map((month, index) => monthSheet(shown.year, index + 1, month));
      saveFile(buildXlsx(sheets), exportFileName(shown.year, null));
    } catch (error) {
      commands.setMessage(error instanceof Error ? error.message : "書き出せませんでした");
    }
  }

  return (
    <div className={page}>
      {breadcrumb}
      <div className={header}>
        <div className={title}>
          <h1 className={heading}>作業報告書</h1>
          {commands.pending ? (
            <Spinner label="保存しています" size="sm" delay>
              保存しています
            </Spinner>
          ) : null}
        </div>
        <div className={actions}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!data}
            onClick={() => setSettingsOpen(true)}
          >
            稼働日設定
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!ready}
            onClick={() =>
              data &&
              saveFile(
                buildXlsx([monthSheet(shown.year, shown.month, data)]),
                exportFileName(shown.year, shown.month),
              )
            }
          >
            {shown.month}月を xlsx で書き出す
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void exportYear()}>
            {shown.year}年分を書き出す
          </Button>
        </div>
      </div>

      {commands.message ? (
        <p role="alert" className={alert}>
          {commands.message}
        </p>
      ) : null}

      <MonthTabs
        year={shown.year}
        month={shown.month}
        thisYear={thisYear}
        thisMonth={thisMonth}
        onChange={(year, month) => setShown({ year, month })}
      >
        {query.isError ? (
          <p role="alert" className={status}>
            {query.error.message}
          </p>
        ) : !ready || !summary ? (
          <div className={status}>
            <Spinner label="読み込んでいます">読み込んでいます</Spinner>
          </div>
        ) : (
          <>
            {data.holidaySource === "estimated" ? (
              <p className={notice}>
                {shown.year}
                年の祝日はまだ取り込めていないため、祝日法のルールから推定しています。公表されたデータを取り込めると自動で切り替わります。
              </p>
            ) : null}
            <div className={body}>
              <DayTable
                key={`${shown.year}-${shown.month}`}
                rows={rows}
                month={shown.month}
                today={now}
                settings={data.settings}
                onSave={commands.saveDay}
              />
              <div className={aside}>
                <Summary
                  key={`${shown.year}-${shown.month}`}
                  month={shown.month}
                  range={data.range}
                  summary={summary}
                  onSaveRange={commands.saveRange}
                />
              </div>
            </div>
          </>
        )}
      </MonthTabs>

      {data ? (
        <SettingsDialog
          open={settingsOpen}
          settings={data.settings}
          onOpenChange={setSettingsOpen}
          onSave={commands.saveSettings}
        />
      ) : null}
    </div>
  );
}
