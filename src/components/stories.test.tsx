import { cleanup } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import { afterEach, describe, test } from "vitest";
import * as buttonStories from "./ui/Button/index.stories";
import * as checkboxStories from "./ui/Checkbox/index.stories";
import * as dialogStories from "./ui/Dialog/index.stories";
import * as fieldStories from "./ui/Field/index.stories";
import * as inputStories from "./ui/Input/index.stories";
import * as selectStories from "./ui/Select/index.stories";
import * as switchStories from "./ui/Switch/index.stories";
import * as textareaStories from "./ui/Textarea/index.stories";
import * as truncateStories from "./ui/Truncate/index.stories";
import * as skillSheetStories from "./features/Shell/SkillSheet/index.stories";
import * as formStories from "./features/Shell/SkillSheet/Form/index.stories";
import * as listInputStories from "./features/Shell/SkillSheet/Form/CareerDialog/ListInput/index.stories";
import * as previewStories from "./features/Shell/SkillSheet/Preview/index.stories";
import * as shellStories from "./features/Shell/index.stories";

const groups = [
  buttonStories,
  checkboxStories,
  dialogStories,
  fieldStories,
  inputStories,
  selectStories,
  switchStories,
  textareaStories,
  truncateStories,
  skillSheetStories,
  formStories,
  listInputStories,
  previewStories,
  shellStories,
];

afterEach(() => {
  cleanup();
});

describe("stories", () => {
  for (const group of groups) {
    // 部品ごとに引数の型が違うので、実行に要る run だけを見る。
    const composed: Record<string, { run: () => Promise<void> }> = composeStories(group);
    for (const [name, story] of Object.entries(composed)) {
      test(`${group.default.title} ${name}`, async () => {
        await story.run();
      });
    }
  }
});
