// 用紙 1 枚ぶんにブロックを詰めていく。印刷と画面で同じ改ページにするために使う。
// まとまりごとに改ページはしない。上から詰め、入りきらないブロックだけ次のページへ送る。

export type MeasuredBlock = {
  key: string;
  height: number;
  // 真なら次のブロックと同じページに置く（見出しだけがページ末尾に残らないようにする）。
  keepWithNext?: boolean;
  // ページの先頭に来たときに上へ足す高さ（表の見出し行を繰り返す分）。
  repeatHeight?: number;
};

export const MM_TO_PX = 96 / 25.4;

// 用紙の余白。@page（src/styles/global.css）と同じ値にする。
export const PAGE_MARGIN_TOP_MM = 11;
export const PAGE_MARGIN_BOTTOM_MM = 10;
export const PAGE_MARGIN_X_MM = 12;
export const PAGE_FOOTER_HEIGHT_MM = 6;
// 2 ページ目以降の上端に出す、氏名と更新日の行。
export const RUNNING_HEADER_HEIGHT_MM = 7;

// A4（297mm）から上下の余白とページ番号の欄を引いた本文の高さ。
// 端数で次のページへこぼれないよう 1mm 余らせる。
export const PAGE_BODY_HEIGHT_MM =
  297 - PAGE_MARGIN_TOP_MM - PAGE_MARGIN_BOTTOM_MM - PAGE_FOOTER_HEIGHT_MM - 1;

// ページごとの本文の高さ（mm）。2 ページ目以降はランニングヘッダーの分だけ低い。
export function pageBodyHeightMm(pageIndex: number): number {
  return pageIndex === 0 ? PAGE_BODY_HEIGHT_MM : PAGE_BODY_HEIGHT_MM - RUNNING_HEADER_HEIGHT_MM;
}

export function paginate(
  blocks: MeasuredBlock[],
  limit: number | ((pageIndex: number) => number),
): string[][] {
  const limitOf = typeof limit === "number" ? () => limit : limit;
  const pages: string[][] = [];
  let current: string[] = [];
  let used = 0;
  blocks.forEach((block, index) => {
    const next = block.keepWithNext ? blocks[index + 1] : undefined;
    const need = block.height + (next?.height ?? 0);
    // 入りきらないブロックは次のページへ送る。1 つで 1 ページを超えるときはそのページに置く。
    if (current.length > 0 && used + need > limitOf(pages.length)) {
      pages.push(current);
      current = [];
      used = 0;
    }
    if (current.length === 0) {
      used += block.repeatHeight ?? 0;
    }
    current.push(block.key);
    used += block.height;
  });
  if (current.length > 0) {
    pages.push(current);
  }
  return pages;
}

export function samePages(left: string[][] | null, right: string[][]): boolean {
  if (!left || left.length !== right.length) {
    return false;
  }
  return left.every(
    (page, index) =>
      page.length === right[index]?.length && page.every((key, at) => key === right[index]?.[at]),
  );
}
