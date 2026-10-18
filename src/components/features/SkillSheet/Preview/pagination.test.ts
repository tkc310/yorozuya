import { describe, expect, it } from "vitest";
import { paginate, samePages } from "./pagination";

describe("改ページ", () => {
  it("まとまりが変わるところで改ページし、入りきらないブロックは次のページへ送る", () => {
    const pages = paginate(
      [
        { key: "header", group: "profile", height: 30 },
        { key: "profile", group: "profile", height: 50 },
        { key: "list", group: "list", height: 40 },
        { key: "detail-1", group: "details", height: 60 },
        { key: "detail-2", group: "details", height: 50 },
        { key: "detail-3", group: "details", height: 30 },
      ],
      100,
    );
    expect(pages).toEqual([
      ["header", "profile"],
      ["list"],
      ["detail-1"],
      ["detail-2", "detail-3"],
    ]);
  });

  it("1 つで 1 ページを超えるブロックはそのページにだけ置く", () => {
    const pages = paginate(
      [
        { key: "a", group: "details", height: 30 },
        { key: "huge", group: "details", height: 250 },
        { key: "b", group: "details", height: 30 },
      ],
      100,
    );
    expect(pages).toEqual([["a"], ["huge"], ["b"]]);
  });

  it("同じ割り付けかを比べる", () => {
    expect(samePages([["a"], ["b"]], [["a"], ["b"]])).toBe(true);
    expect(samePages([["a", "b"]], [["a"], ["b"]])).toBe(false);
    expect(samePages(null, [["a"]])).toBe(false);
  });
});
