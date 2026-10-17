import { request } from "../request";
import { getSheetFn } from "../../server/features/skill-sheet/queries/get-sheet";

export const sheetQueryKey = ["skill-sheet"] as const;

export function getSheet() {
  return request(getSheetFn());
}
