import type { StorybookConfig } from "@storybook/react-vite";
import type { Plugin, PluginOption } from "vite";
import panda from "@pandacss/dev/postcss";

// TanStack Start の、アプリのビルドの入口を 1 つに決め打ちする（マニフェストを作る）プラグイン。
// Storybook の静的ビルドは入口が複数になるため、これだけを外す（サーバ関数の変換などは残す）。
const appOnlyPlugin = /start-manifest/;

// 入れ子の配列や Promise になっているプラグインを 1 列に並べる。
async function flatten(options: PluginOption[]): Promise<Plugin[]> {
  const plugins: Plugin[] = [];
  for (const option of options) {
    const value = await option;
    if (Array.isArray(value)) {
      plugins.push(...(await flatten(value)));
    } else if (value) {
      plugins.push(value);
    }
  }
  return plugins;
}

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
    const plugins = await flatten(config.plugins ?? []);
    config.plugins = plugins.filter((plugin) => !appOnlyPlugin.test(plugin.name));
    return config;
  },
};

export default config;
