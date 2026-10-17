import { defineRecipe } from "@pandacss/dev";

export const button = defineRecipe({
  className: "button",
  base: {
    alignItems: "center",
    appearance: "none",
    borderRadius: "md",
    cursor: "pointer",
    display: "inline-flex",
    fontWeight: "semibold",
    gap: "2",
    justifyContent: "center",
    lineHeight: "1",
    px: "3",
    py: "2",
  },
  defaultVariants: {
    variant: "solid",
  },
  variants: {
    variant: {
      solid: {
        background: "#163a37",
        color: "#f7f4ef",
      },
      outline: {
        background: "transparent",
        borderColor: "#cfc6ba",
        borderWidth: "1px",
        color: "#1f1a17",
      },
    },
  },
});
