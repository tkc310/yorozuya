import type { StorybookConfig } from "@storybook/react-vite";
import type { Plugin, PluginOption } from "vite";
import panda from "@pandacss/dev/postcss";

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
  async viteFinal(config, { configType }) {
    config.css = {
      ...config.css,
      postcss: {
        plugins: [panda()],
      },
    };
    if (configType === "PRODUCTION") {
      // 静的ビルド（pnpm site:build）では TanStack Start のプラグインを外す。
      // これらはアプリのビルドの入口や出力を決め打ちするため、Storybook の iframe.html が作られなくなる。
      // サーバ関数はボタンを押したときに読み込むだけで、ストーリーでは呼ばないので、
      // bun:sqlite は読み込まずに外部のままにしておく。
      const plugins = await flatten(config.plugins ?? []);
      config.plugins = plugins.filter((plugin) => !plugin.name.startsWith("tanstack"));
      const external = config.build?.rollupOptions?.external;
      config.build = {
        ...config.build,
        rollupOptions: {
          ...config.build?.rollupOptions,
          external: Array.isArray(external) ? [...external, "bun:sqlite"] : ["bun:sqlite"],
        },
      };
    }
    return config;
  },
};

export default config;
