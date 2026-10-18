import { cleanup } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import { afterEach, describe, test } from "vitest";
import * as breadcrumbStories from "./ui/Breadcrumb/index.stories";
import * as buttonStories from "./ui/Button/index.stories";
import * as checkboxStories from "./ui/Checkbox/index.stories";
import * as dialogStories from "./ui/Dialog/index.stories";
import * as fieldStories from "./ui/Field/index.stories";
import * as inputStories from "./ui/Input/index.stories";
import * as selectStories from "./ui/Select/index.stories";
import * as switchStories from "./ui/Switch/index.stories";
import * as textareaStories from "./ui/Textarea/index.stories";
import * as truncateStories from "./ui/Truncate/index.stories";
import * as homeStories from "./features/Home/index.stories";
import * as skillSheetStories from "./features/SkillSheet/index.stories";
import * as formStories from "./features/SkillSheet/Form/index.stories";
import * as listInputStories from "./features/SkillSheet/Form/CareerDialog/ListInput/index.stories";
import * as previewStories from "./features/SkillSheet/Preview/index.stories";

const groups = [
  breadcrumbStories,
  buttonStories,
  checkboxStories,
  dialogStories,
  fieldStories,
  inputStories,
  selectStories,
  switchStories,
  textareaStories,
  truncateStories,
  homeStories,
  skillSheetStories,
  formStories,
  listInputStories,
  previewStories,
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
