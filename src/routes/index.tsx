import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "../components/features/shell/shell";
import { getSheet, sheetQueryKey } from "../lib/skill-sheet/get-sheet";

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: sheetQueryKey,
      queryFn: getSheet,
    }),
  component: Index,
});

function Index() {
  return <Shell />;
}
