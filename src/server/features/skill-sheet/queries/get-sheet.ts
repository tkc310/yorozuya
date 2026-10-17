import { createServerFn } from "@tanstack/react-start";
import { readSheet } from "../../../lib/skill-sheet/get-sheet";

export const getSheetFn = createServerFn({ method: "GET", strict: false }).handler(() => readSheet());
