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
import * as skillSheetStories from "./features/Shell/SkillSheet/index.stories";
import * as formStories from "./features/Shell/SkillSheet/Form/index.stories";
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
  skillSheetStories,
  formStories,
  previewStories,
  shellStories,
];

afterEach(() => {
  cleanup();
});

describe("stories", () => {
  for (const group of groups) {
    const composed = composeStories(group);
    for (const [name, story] of Object.entries(composed)) {
      test(`${group.default.title} ${name}`, async () => {
        await story.run();
      });
    }
  }
});
