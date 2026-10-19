import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

// サイドバーのロゴ。アプリと同じロゴ（src/assets/images/logo.svg）を、main.ts の staticDirs で ./images/ に配る。
addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "よろずや",
    brandImage: "./images/logo.svg",
    brandUrl: "https://tkc310.github.io/yorozuya/",
    brandTarget: "_self",
  }),
});
