import { removeSkillFn } from "../../server/features/skill-sheet/commands/remove-skill";
import { request } from "../request";

export function removeSkill(skillName: string) {
  return request(removeSkillFn({ data: { skillName } }));
}
