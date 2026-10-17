import { createServerFn } from "@tanstack/react-start";
import { getDb } from "../../../lib/db";
import { SkillSheetRepository } from "../../repository";

export const getSheetFn = createServerFn({ method: "GET", strict: false }).handler(() =>
  new SkillSheetRepository(getDb()).read(),
);
