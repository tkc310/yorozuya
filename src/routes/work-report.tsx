import { createFileRoute } from "@tanstack/react-router";
import { WorkReport } from "../components/features/WorkReport/index";
import { PageBreadcrumb } from "../components/layouts/PageBreadcrumb/index";

export const Route = createFileRoute("/work-report")({
  head: () => ({ meta: [{ title: "作業報告書 | よろずや" }] }),
  staticData: { crumb: "作業報告書" },
  component: WorkReportPage,
});

function WorkReportPage() {
  return <WorkReport breadcrumb={<PageBreadcrumb />} />;
}
