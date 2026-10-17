import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "../components/features/shell/shell";
import { sheetQueryKey } from "../lib/query-keys";
import { request } from "../lib/request";
import { getSheetFn } from "../server/features/skill-sheet/queries/get-sheet";

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: sheetQueryKey,
      queryFn: () => request(getSheetFn()),
    }),
  component: Index,
});

function Index() {
  return <Shell />;
}
