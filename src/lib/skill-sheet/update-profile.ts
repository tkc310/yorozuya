import type { YearMonth } from "../../../shared/features/skill-sheet/sheet";
import { updateProfileFn } from "../../server/features/skill-sheet/commands/update-profile";
import { request } from "../request";

export type ProfileWrite = {
  updatedOn: YearMonth | null;
  name: string;
  workStyle: string;
  education: string;
  station: string;
  selfPr: string;
};

export function updateProfile(input: ProfileWrite) {
  return request(updateProfileFn({ data: input }));
}
