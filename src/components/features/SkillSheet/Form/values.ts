import type { CalendarDate, Duration } from "@/shared/features/skill-sheet/sheet";

// 入力欄の文字列と、シートの値を行き来する。どれも純粋な関数にしてテストする。

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

// input[type=date] の値（YYYY-MM-DD）と相互に変換する。
export function toDateValue(value: CalendarDate | null): string {
  if (!value) {
    return "";
  }
  return `${String(value.year).padStart(4, "0")}-${pad(value.month)}-${pad(value.day)}`;
}

export function fromDateValue(value: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

// 入力中にすぐ出す年齢のエラー。
export function ageError(value: string): string | null {
  const text = value.trim();
  if (text === "") {
    return null;
  }
  if (!/^\d+$/.test(text)) {
    return "数字で入力してください";
  }
  return Number(text) > 150 ? "150以下で入力してください" : null;
}

export function toAge(value: string): number | null {
  const text = value.trim();
  if (!/^\d+$/.test(text)) {
    return null;
  }
  const age = Number(text);
  return age <= 150 ? age : null;
}

export function requiredError(value: string): string | null {
  return value.trim().length === 0 ? "入力してください" : null;
}

// 年と月が両方空なら未入力として扱う。誤りはメッセージで返す。
export function toExperience(years: string, months: string): Duration | null | string {
  const yearsText = years.trim();
  const monthsText = months.trim();
  if (yearsText === "" && monthsText === "") {
    return null;
  }
  const yearsValue = yearsText === "" ? 0 : /^\d+$/.test(yearsText) ? Number(yearsText) : null;
  const monthsValue = monthsText === "" ? 0 : /^\d+$/.test(monthsText) ? Number(monthsText) : null;
  if (yearsValue === null || yearsValue > 99) {
    return "経験年数は0から99の数字で入力してください";
  }
  if (monthsValue === null || monthsValue > 11) {
    return "経験月数は0から11の数字で入力してください";
  }
  if (yearsValue === 0 && monthsValue === 0) {
    return null;
  }
  return { years: yearsValue, months: monthsValue };
}

export function sameExperience(left: Duration | null, right: Duration | undefined): boolean {
  if (!left || !right) {
    return !left && !right;
  }
  return left.years === right.years && left.months === right.months;
}

// 文字数の目安。超えたら注意を出すが、保存はできる。
export function lengthHint(text: string, guide: number): { text: string; over: boolean } {
  const length = [...text.trim()].length;
  const over = length > guide;
  return {
    text: over ? `${length} / ${guide}字（目安を超えています）` : `${length} / ${guide}字`,
    over,
  };
}

// 印刷・PDF 保存の既定のファイル名（ブラウザは document.title を使う）。
export function printTitle(name: string, today: CalendarDate): string {
  const date = `${today.year}${String(today.month).padStart(2, "0")}${String(today.day).padStart(2, "0")}`;
  const person = name.trim();
  return person ? `スキルシート_${person}_${date}` : `スキルシート_${date}`;
}
