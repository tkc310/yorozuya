import type { StorybookConfig } from "@storybook/react-vite";
import panda from "@pandacss/dev/postcss";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],
  framework: "@storybook/react-vite",
  async viteFinal(config) {
    config.css = {
      ...config.css,
      postcss: {
        plugins: [panda()],
      },
    };
    return config;
  },
};

export default config;
