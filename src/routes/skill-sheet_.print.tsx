import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { css } from "styled-system/css";
import * as v from "valibot";
import { Preview } from "../components/features/SkillSheet/Preview/index";
import { QUERY_KEY, callServerFunction } from "../lib/request";
import { getSheetFn } from "../server/features/skill-sheet/queries/get-sheet";
import { PrintSearchSchema, type PrintSearch } from "../shared/features/skill-sheet/print.schema";

function today(): PrintSearch {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

const frame = css({
  p: "8",
  _print: { p: "0" },
});

// サーバで PDF にするための画面。保存済みのシートのプレビューだけを出す（src/server/lib/pdf.ts）。
export const Route = createFileRoute("/skill-sheet_/print")({
  head: () => ({ meta: [{ title: "スキルシート（印刷） | よろずや" }] }),
  validateSearch: (search: Record<string, unknown>): PrintSearch => {
    const parsed = v.safeParse(PrintSearchSchema, search);
    return parsed.success ? parsed.output : today();
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: QUERY_KEY.SKILL_SHEET,
      queryFn: () => callServerFunction(getSheetFn()),
    }),
  component: PrintPage,
});

function PrintPage() {
  const calculatedOn = Route.useSearch();
  const query = useQuery({
    queryKey: QUERY_KEY.SKILL_SHEET,
    queryFn: () => callServerFunction(getSheetFn()),
  });

  // 画面が動き出したこと（割り付けを測れること）を、PDF を作る側に知らせる。
  useEffect(() => {
    if (query.data) {
      document.documentElement.dataset.pdfReady = "true";
    } else if (query.isError) {
      document.documentElement.dataset.pdfReady = "error";
    }
  }, [query.data, query.isError]);

  if (!query.data) {
    return null;
  }
  return (
    <div className={frame}>
      <Preview sheet={query.data} calculatedOn={calculatedOn} />
    </div>
  );
}
