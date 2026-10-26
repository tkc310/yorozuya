import { spawnSync } from "node:child_process";

if (process.env.SHEET_DEMO_STRIP !== "1" && process.features.typescript !== true) {
  const child = spawnSync(
    process.execPath,
    ["--experimental-strip-types", process.argv[1], ...process.argv.slice(2)],
    {
      stdio: "inherit",
      env: { ...process.env, SHEET_DEMO_STRIP: "1", NODE_NO_WARNINGS: "1" },
    },
  );
  process.exit(child.status ?? 1);
}

const { createFixtureSheet, durationToken, present } =
  await import("../src/shared/features/skill-sheet/skill.service.ts");

const calculatedOn = { year: 2026, month: 10 };
const arg = process.argv[2];

if (
  process.argv.length > 3 ||
  (arg !== undefined && arg !== "--no-name" && arg !== "--zero-careers")
) {
  console.log("error=不明な引数です");
  process.exit(1);
}

const fixture = createFixtureSheet();
const input =
  arg === "--no-name"
    ? { ...fixture, name: "" }
    : arg === "--zero-careers"
      ? { ...fixture, careers: [] }
      : fixture;
const result = present(input, calculatedOn);

if (!result.ok) {
  console.log(`error=${result.error}`);
  process.exit(1);
}

const { view } = result;
console.log(`name=${view.name}`);
console.log(`station=${view.station}`);
console.log(`engineerYears=${durationToken(view.engineer)}`);
for (const skill of view.skills) {
  console.log(`skill=${skill.name}:${durationToken(skill.duration)}`);
}
console.log(`pr=${view.selfPrShort ? "short" : "long"}`);
console.log(`recent=${view.recent.length}`);
console.log(`older=${view.older.length}`);
console.log(`parallel=${view.parallelCount}`);
console.log(`hard=${view.hardCount}`);
console.log(`phases=${view.phaseCount}`);
