import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "../components/features/Shell/index";
import { QUERY_KEY, callServerFunction } from "../lib/request";
import { getSheetFn } from "../server/features/skill-sheet/queries/get-sheet";

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: QUERY_KEY.SKILL_SHEET,
      queryFn: () => callServerFunction(getSheetFn()),
    }),
  component: Index,
});

function Index() {
  return <Shell />;
}
