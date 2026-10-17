import { cleanup } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import { afterEach, describe, test } from "vitest";
import * as buttonStories from "./ui/button.stories";
import * as fieldStories from "./ui/field.stories";
import * as inputStories from "./ui/input.stories";
import * as textareaStories from "./ui/textarea.stories";
import * as formStories from "./features/skill-sheet/form.stories";
import * as previewStories from "./features/skill-sheet/preview.stories";
import * as shellStories from "./features/shell/shell.stories";

const groups = [
  buttonStories,
  fieldStories,
  inputStories,
  textareaStories,
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
