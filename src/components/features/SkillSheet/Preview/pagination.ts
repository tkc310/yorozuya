// 用紙 1 枚ぶんにブロックを詰めていく。印刷と画面で同じ改ページにするために使う。
// まとまりごとに改ページはしない。上から詰め、入りきらないブロックだけ次のページへ送る。
// 保有技術のような段組みのブロックは、ページの残りに入るだけ段へ詰め、続きを次のページへ送る。

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

// 段組みに流し込む中身の 1 項目（保有技術のグループ名や 1 行）。
export type FlowItem = {
  key: string;
  height: number;
  // 真なら同じ段の次の項目と離さない（グループ名だけが段の末尾に残らないようにする）。
  keepWithNext?: boolean;
  // 段の先頭に来たときに上へ足す高さ（グループ名を「続き」として繰り返す分）。
  repeatHeight?: number;
};

// 段組みのブロック。項目の途中でページと段を分けられる。
export type MeasuredFlow = {
  items: FlowItem[];
  columnCount: number;
  // 段組みの外の高さ（見出しと下の余白）。ページごとの切れ端のそれぞれにかかる。
  overhead: number;
};

// ページに置く 1 つ分。段組みのブロックなら、そのページに置く項目を段ごとに持つ。
export type PagePart = { key: string; columns?: string[][] };

type Filled = { columns: number[][]; next: number; height: number };

// start から順に、高さ limit の段へ上から詰める。force なら空の段に 1 つは置く。
export function fillColumns(
  items: FlowItem[],
  start: number,
  limit: number,
  columnCount: number,
  force = false,
): Filled {
  const columns: number[][] = [];
  let index = start;
  let height = 0;
  for (let column = 0; column < columnCount; column += 1) {
    const placed: number[] = [];
    let used = 0;
    while (index < items.length) {
      const item = items[index];
      if (!item) {
        break;
      }
      const repeat = placed.length === 0 ? (item.repeatHeight ?? 0) : 0;
      const next = item.keepWithNext ? items[index + 1] : undefined;
      const need = repeat + item.height + (next?.height ?? 0);
      if (used + need > limit && !(force && placed.length === 0 && index === start)) {
        break;
      }
      placed.push(index);
      used += repeat + item.height;
      index += 1;
    }
    columns.push(placed);
    height = Math.max(height, used);
  }
  return { columns, next: index, height };
}

// 残りが全部入るときは、段の高さがそろう一番低い高さを探す（最後のページの段の長さをそろえる）。
function balance(items: FlowItem[], start: number, limit: number, columnCount: number): Filled {
  let low = 0;
  let high = limit;
  let best = fillColumns(items, start, limit, columnCount);
  for (let step = 0; step < 24 && high - low > 0.5; step += 1) {
    const middle = (low + high) / 2;
    const filled = fillColumns(items, start, middle, columnCount);
    if (filled.next === items.length) {
      best = filled;
      high = middle;
    } else {
      low = middle;
    }
  }
  return best;
}

export type PaginatedBlock = MeasuredBlock & { flow?: MeasuredFlow };

export function paginate(
  blocks: PaginatedBlock[],
  limit: number | ((pageIndex: number) => number),
): PagePart[][] {
  const limitOf = typeof limit === "number" ? () => limit : limit;
  const pages: PagePart[][] = [];
  let current: PagePart[] = [];
  let used = 0;
  const breakPage = () => {
    pages.push(current);
    current = [];
    used = 0;
  };
  blocks.forEach((block, index) => {
    if (block.flow && block.flow.items.length > 0) {
      const { items, columnCount, overhead } = block.flow;
      let start = 0;
      while (start < items.length) {
        const room = limitOf(pages.length) - used - overhead;
        const empty = current.length === 0;
        let filled = fillColumns(items, start, room, columnCount, empty);
        if (filled.next === start) {
          // 1 行も入らないなら次のページから始める。
          breakPage();
          continue;
        }
        if (filled.next === items.length) {
          filled = balance(items, start, room, columnCount);
        }
        current.push({
          key: block.key,
          columns: filled.columns.map((column) => column.map((at) => items[at]?.key ?? "")),
        });
        used += overhead + filled.height;
        start = filled.next;
        if (start < items.length) {
          breakPage();
        }
      }
      return;
    }
    const next = block.keepWithNext ? blocks[index + 1] : undefined;
    const need = block.height + (next?.height ?? 0);
    // 入りきらないブロックは次のページへ送る。1 つで 1 ページを超えるときはそのページに置く。
    if (current.length > 0 && used + need > limitOf(pages.length)) {
      breakPage();
    }
    if (current.length === 0) {
      used += block.repeatHeight ?? 0;
    }
    current.push({ key: block.key });
    used += block.height;
  });
  if (current.length > 0) {
    pages.push(current);
  }
  return pages;
}

export function samePages(left: PagePart[][] | null, right: PagePart[][]): boolean {
  return left !== null && JSON.stringify(left) === JSON.stringify(right);
}
