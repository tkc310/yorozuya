import { removeCareerFn } from "../../server/features/skill-sheet/commands/remove-career";
import { request } from "../request";

export function removeCareer(careerId: string) {
  return request(removeCareerFn({ data: { careerId } }));
}
