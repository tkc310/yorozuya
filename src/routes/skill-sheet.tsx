import { createFileRoute } from "@tanstack/react-router";
import { SkillSheet } from "../components/features/SkillSheet/index";
import { PageBreadcrumb } from "../components/layouts/PageBreadcrumb/index";
import { QUERY_KEY, callServerFunction } from "../lib/request";
import { getSheetFn } from "../server/features/skill-sheet/queries/get-sheet";

export const Route = createFileRoute("/skill-sheet")({
  head: () => ({ meta: [{ title: "スキルシート | よろずや" }] }),
  staticData: { crumb: "スキルシート" },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: QUERY_KEY.SKILL_SHEET,
      queryFn: () => callServerFunction(getSheetFn()),
    }),
  component: SkillSheetPage,
});

function SkillSheetPage() {
  return <SkillSheet breadcrumb={<PageBreadcrumb />} />;
}
