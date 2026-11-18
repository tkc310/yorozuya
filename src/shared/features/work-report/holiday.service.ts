import type { IsoDate } from "./report.schema";

// 国民の祝日に関する法律のルールで、その年の祝日を推定する。
// 祝日はふつう公表データ（内閣府の CSV を変換した JSON）を使い、これはまだ取り込めていない年
// （翌年分の公表前や、オフラインで初めて開いたとき）の代わりに使う（ADR 0011）。
// 2000〜2099 年を対象にする。法改正で祝日が変わったら、ここと holiday.service.test.ts を直す。

export function isoDate(year: number, month: number, day: number): IsoDate {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function weekdayOf(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// その月の n 回目の月曜日。
function nthMonday(year: number, month: number, n: number): number {
  const first = weekdayOf(year, month, 1);
  const offset = (8 - first) % 7;
  return 1 + offset + (n - 1) * 7;
}

// 春分日・秋分日の近似式（1980〜2099 年に有効）。
function vernalEquinox(year: number): number {
  return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
}

function autumnalEquinox(year: number): number {
  return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
}

type Holiday = [month: number, day: number, name: string];

function baseHolidays(year: number): Holiday[] {
  const list: Holiday[] = [
    [1, 1, "元日"],
    [1, nthMonday(year, 1, 2), "成人の日"],
    [2, 11, "建国記念の日"],
    [3, vernalEquinox(year), "春分の日"],
    [5, 3, "憲法記念日"],
    [5, 5, "こどもの日"],
    [9, autumnalEquinox(year), "秋分の日"],
    [11, 3, "文化の日"],
    [11, 23, "勤労感謝の日"],
  ];

  if (year >= 2020) {
    list.push([2, 23, "天皇誕生日"]);
  } else if (year <= 2018) {
    list.push([12, 23, "天皇誕生日"]);
  }

  if (year >= 2007) {
    list.push([4, 29, "昭和の日"], [5, 4, "みどりの日"]);
  } else {
    list.push([4, 29, "みどりの日"]);
  }

  // 東京オリンピック・パラリンピックの年は、海の日・スポーツの日・山の日が動いた。
  if (year === 2020) {
    list.push([7, 23, "海の日"], [7, 24, "スポーツの日"], [8, 10, "山の日"]);
  } else if (year === 2021) {
    list.push([7, 22, "海の日"], [7, 23, "スポーツの日"], [8, 8, "山の日"]);
  } else {
    if (year >= 2003) {
      list.push([7, nthMonday(year, 7, 3), "海の日"]);
    } else {
      list.push([7, 20, "海の日"]);
    }
    if (year >= 2016) {
      list.push([8, 11, "山の日"]);
    }
    list.push([10, nthMonday(year, 10, 2), year >= 2020 ? "スポーツの日" : "体育の日"]);
  }

  if (year >= 2003) {
    list.push([9, nthMonday(year, 9, 3), "敬老の日"]);
  } else {
    list.push([9, 15, "敬老の日"]);
  }

  if (year === 2019) {
    list.push([5, 1, "即位の日"], [10, 22, "即位礼正殿の儀の行われる日"]);
  }

  return list;
}

function toDayNumber(year: number, month: number, day: number): number {
  return Math.round(Date.UTC(year, month - 1, day) / 86_400_000);
}

function fromDayNumber(dayNumber: number): IsoDate {
  const date = new Date(dayNumber * 86_400_000);
  return isoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

const cache = new Map<number, ReadonlyMap<IsoDate, string>>();

// その年の祝日（振替休日・国民の休日を含む）を日付から名前への表で返す。
export function holidaysOf(year: number): ReadonlyMap<IsoDate, string> {
  const cached = cache.get(year);
  if (cached) {
    return cached;
  }
  const base = new Map<number, string>();
  for (const [month, day, name] of baseHolidays(year)) {
    base.set(toDayNumber(year, month, day), name);
  }

  const all = new Map(base);

  // 国民の休日: 前日と翌日が祝日で、その日自身は祝日でない日。
  for (const dayNumber of base.keys()) {
    const next = dayNumber + 1;
    if (!base.has(next) && base.has(dayNumber + 2)) {
      all.set(next, "国民の休日");
    }
  }

  // 振替休日: 祝日が日曜なら、その後で最初の祝日でない日。
  for (const dayNumber of [...base.keys()].sort((a, b) => a - b)) {
    if (new Date(dayNumber * 86_400_000).getUTCDay() !== 0) {
      continue;
    }
    let substitute = dayNumber + 1;
    while (all.has(substitute)) {
      substitute += 1;
    }
    all.set(substitute, "振替休日");
  }

  const result = new Map<IsoDate, string>();
  for (const dayNumber of [...all.keys()].sort((a, b) => a - b)) {
    result.set(fromDayNumber(dayNumber), all.get(dayNumber) ?? "");
  }
  cache.set(year, result);
  return result;
}

export function holidayName(date: IsoDate): string | null {
  const year = Number(date.slice(0, 4));
  return holidaysOf(year).get(date) ?? null;
}
