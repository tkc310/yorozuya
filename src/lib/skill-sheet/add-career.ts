import type { Career } from "../../../shared/features/skill-sheet/sheet";
import { addCareerFn } from "../../server/features/skill-sheet/commands/add-career";
import { request } from "../request";

export function addCareer(input: Omit<Career, "id">) {
  return request(addCareerFn({ data: input }));
}
