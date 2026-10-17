import type { ComponentType } from "react";
import { SkillSheet } from "../SkillSheet/Form/index";

export type ToolRegistration = {
  id: string;
  name: string;
  Panel: ComponentType;
};

export const registry: ToolRegistration[] = [
  {
    id: "skill-sheet",
    name: "スキルシート",
    Panel: SkillSheet,
  },
];
