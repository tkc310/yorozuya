import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

// サイドバーのロゴ。画像は scripts/site/brand-images.mjs（make brand-images）で作り、
// main.ts の staticDirs で ./images/ に配る。
addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "よろずや",
    brandImage: "./images/storybook-brand.svg",
    brandUrl: "https://tkc310.github.io/yorozuya/",
    brandTarget: "_self",
  }),
});
