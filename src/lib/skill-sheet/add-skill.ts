import { addSkillFn } from "../../server/features/skill-sheet/commands/add-skill";
import { request } from "../request";

export function addSkill(groupName: string, skillName: string) {
  return request(addSkillFn({ data: { groupName, skillName } }));
}
