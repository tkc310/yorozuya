import { describe, expect, it } from "vitest";
import {
  ageError,
  fromDateValue,
  requiredError,
  sameExperience,
  toAge,
  toDateValue,
  toExperience,
} from "./values";

describe("入力欄の値", () => {
  it("日付の入力欄と年月日を行き来する", () => {
    expect(toDateValue({ year: 2026, month: 4, day: 3 })).toBe("2026-04-03");
    expect(toDateValue(null)).toBe("");
    expect(fromDateValue("2026-04-03")).toEqual({ year: 2026, month: 4, day: 3 });
    expect(fromDateValue("")).toBeNull();
  });

  it("年齢は数字だけを受け付け、150 を超えるとエラーにする", () => {
    expect(ageError("")).toBeNull();
    expect(ageError("3a")).toBe("数字で入力してください");
    expect(ageError("151")).toBe("150以下で入力してください");
    expect(toAge("35")).toBe(35);
    expect(toAge("abc")).toBeNull();
  });

  it("空の必須欄はエラーにする", () => {
    expect(requiredError("  ")).toBe("入力してください");
    expect(requiredError("言語")).toBeNull();
  });

  it("経験年数は年と月から作り、範囲外はメッセージで返す", () => {
    expect(toExperience("", "")).toBeNull();
    expect(toExperience("3", "")).toEqual({ years: 3, months: 0 });
    expect(toExperience("0", "0")).toBeNull();
    expect(toExperience("100", "")).toBe("経験年数は0から99の数字で入力してください");
    expect(toExperience("1", "12")).toBe("経験月数は0から11の数字で入力してください");
    expect(sameExperience({ years: 1, months: 2 }, { years: 1, months: 2 })).toBe(true);
    expect(sameExperience(null, undefined)).toBe(true);
    expect(sameExperience(null, { years: 1, months: 0 })).toBe(false);
  });
});
