import { describe, expect, it } from "vitest";
import {
  PAGE_BODY_HEIGHT_MM,
  pageBodyHeightMm,
  paginate,
  samePages,
  type FlowItem,
  type PagePart,
} from "./pagination";

function keysOf(pages: PagePart[][]): string[][] {
  return pages.map((page) => page.map((part) => part.key));
}

// グループ名 1 つと、その行を高さ 10 ずつ並べる。
function group(name: string, rows: number): FlowItem[] {
  return [
    { key: name, height: 10, keepWithNext: true },
    ...Array.from({ length: rows }, (_, index) => ({
      key: `${name}-${index + 1}`,
      height: 10,
      repeatHeight: 10,
    })),
  ];
}

describe("改ページ", () => {
  it("まとまりでは改ページせず、入りきらないブロックだけ次のページへ送る", () => {
    const pages = paginate(
      [
        { key: "header", height: 30 },
        { key: "skills", height: 50 },
        { key: "self-pr", height: 40 },
        { key: "detail-1", height: 60 },
        { key: "detail-2", height: 30 },
      ],
      100,
    );
    expect(keysOf(pages)).toEqual([["header", "skills"], ["self-pr", "detail-1"], ["detail-2"]]);
  });

  it("1 つで 1 ページを超えるブロックはそのページにだけ置く", () => {
    const pages = paginate(
      [
        { key: "a", height: 30 },
        { key: "huge", height: 250 },
        { key: "b", height: 30 },
      ],
      100,
    );
    expect(keysOf(pages)).toEqual([["a"], ["huge"], ["b"]]);
  });

  it("見出しは次のブロックと同じページに置く", () => {
    const pages = paginate(
      [
        { key: "self-pr", height: 70 },
        { key: "list-head", height: 20, keepWithNext: true },
        { key: "row-1", height: 20 },
      ],
      100,
    );
    expect(keysOf(pages)).toEqual([["self-pr"], ["list-head", "row-1"]]);
  });

  it("ページの先頭に来た行は、繰り返す見出し行の高さも数える", () => {
    const pages = paginate(
      [
        { key: "row-1", height: 40, repeatHeight: 10 },
        { key: "row-2", height: 40, repeatHeight: 10 },
        { key: "row-3", height: 40, repeatHeight: 10 },
        { key: "row-4", height: 40, repeatHeight: 10 },
      ],
      90,
    );
    // 先頭の 10 と 40 を 2 行で 90 になる。
    expect(keysOf(pages)).toEqual([
      ["row-1", "row-2"],
      ["row-3", "row-4"],
    ]);
  });

  it("ページごとの高さを使う", () => {
    const pages = paginate(
      [
        { key: "a", height: 60 },
        { key: "b", height: 40 },
        { key: "c", height: 40 },
        { key: "d", height: 40 },
      ],
      (page) => (page === 0 ? 100 : 80),
    );
    expect(keysOf(pages)).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("2 ページ目以降はランニングヘッダーの分だけ本文が低い", () => {
    expect(pageBodyHeightMm(0)).toBe(PAGE_BODY_HEIGHT_MM);
    expect(pageBodyHeightMm(1)).toBeLessThan(PAGE_BODY_HEIGHT_MM);
    expect(pageBodyHeightMm(2)).toBe(pageBodyHeightMm(1));
  });

  it("同じ割り付けかを比べる", () => {
    const a = { key: "a" };
    const b = { key: "b" };
    expect(samePages([[a], [b]], [[a], [b]])).toBe(true);
    expect(samePages([[a, b]], [[a], [b]])).toBe(false);
    expect(samePages(null, [[a]])).toBe(false);
    expect(
      samePages([[{ key: "s", columns: [["x"], ["y"]] }]], [[{ key: "s", columns: [["x", "y"]] }]]),
    ).toBe(false);
  });
});

describe("段組みの改ページ", () => {
  it("ページの残りに入るだけ段へ詰め、続きを次のページへ送る", () => {
    const pages = paginate(
      [
        { key: "header", height: 60 },
        {
          key: "skills",
          height: 0,
          flow: { items: group("front", 6), columnCount: 2, overhead: 10 },
        },
        { key: "self-pr", height: 20 },
      ],
      100,
    );
    // 1 ページ目の段の高さは 100 - 60 - 10 = 30。2 段目の先頭はグループ名を繰り返す分も数える。
    expect(pages).toEqual([
      [
        { key: "header" },
        {
          key: "skills",
          columns: [
            ["front", "front-1", "front-2"],
            ["front-3", "front-4"],
          ],
        },
      ],
      // 残りは全部入るので、段の高さをそろえる。後ろのブロックは同じページに続く。
      [{ key: "skills", columns: [["front-5"], ["front-6"]] }, { key: "self-pr" }],
    ]);
  });

  it("グループ名だけを段の末尾に残さない", () => {
    const pages = paginate(
      [
        {
          key: "skills",
          height: 0,
          flow: {
            items: [...group("a", 2), ...group("b", 2)],
            columnCount: 2,
            overhead: 0,
          },
        },
      ],
      40,
    );
    expect(pages).toEqual([
      [
        {
          key: "skills",
          columns: [
            ["a", "a-1", "a-2"],
            ["b", "b-1", "b-2"],
          ],
        },
      ],
    ]);
  });

  it("1 行も入らないときは次のページから始める", () => {
    const pages = paginate(
      [
        { key: "header", height: 85 },
        { key: "skills", height: 0, flow: { items: group("a", 2), columnCount: 2, overhead: 10 } },
      ],
      100,
    );
    expect(keysOf(pages)).toEqual([["header"], ["skills"]]);
  });

  it("1 ページを超える量は、ページを重ねて続ける", () => {
    const pages = paginate(
      [{ key: "skills", height: 0, flow: { items: group("a", 9), columnCount: 1, overhead: 0 } }],
      40,
    );
    expect(pages.map((page) => page[0]?.columns)).toEqual([
      [["a", "a-1", "a-2", "a-3"]],
      [["a-4", "a-5", "a-6"]],
      [["a-7", "a-8", "a-9"]],
    ]);
  });
});
