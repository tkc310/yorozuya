import { cleanup } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import { afterEach, describe, test } from "vitest";
import * as buttonStories from "./ui/button/index.stories";
import * as fieldStories from "./ui/field/index.stories";
import * as inputStories from "./ui/input/index.stories";
import * as textareaStories from "./ui/textarea/index.stories";
import * as formStories from "./features/SkillSheet/Form/index.stories";
import * as previewStories from "./features/SkillSheet/Preview/index.stories";
import * as shellStories from "./features/Shell/index.stories";

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
