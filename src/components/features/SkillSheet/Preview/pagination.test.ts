import { describe, expect, it } from "vitest";
import { PAGE_BODY_HEIGHT_MM, pageBodyHeightMm, paginate, samePages } from "./pagination";

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
    expect(pages).toEqual([["header", "skills"], ["self-pr", "detail-1"], ["detail-2"]]);
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
    expect(pages).toEqual([["a"], ["huge"], ["b"]]);
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
    expect(pages).toEqual([["self-pr"], ["list-head", "row-1"]]);
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
    expect(pages).toEqual([
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
    expect(pages).toEqual([
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
    expect(samePages([["a"], ["b"]], [["a"], ["b"]])).toBe(true);
    expect(samePages([["a", "b"]], [["a"], ["b"]])).toBe(false);
    expect(samePages(null, [["a"]])).toBe(false);
  });
});
