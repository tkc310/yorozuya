import { defineRecipe } from "@pandacss/dev";

export const textarea = defineRecipe({
  className: "textarea",
  base: {
    background: "#fffdf9",
    borderColor: "#d9d0c5",
    borderRadius: "md",
    borderWidth: "1px",
    color: "#1f1a17",
    minHeight: "6rem",
    px: "3",
    py: "2",
    width: "100%",
  },
});
