// 用紙 1 枚ぶんにブロックを詰めていく。印刷と画面で同じ改ページにするために使う。

export type MeasuredBlock = {
  key: string;
  // まとまりが変わるところで必ず改ページする（プロフィール / 職務経歴の一覧 / 詳細）。
  group: string;
  height: number;
};

export const MM_TO_PX = 96 / 25.4;

// A4（297mm）から上下の余白 12mm ずつと、ページ番号の欄 6mm を引いた本文の高さ。
// 端数で次のページへこぼれないよう 1mm 余らせる。
export const PAGE_BODY_HEIGHT_MM = 297 - 12 * 2 - 6 - 1;
export const PAGE_FOOTER_HEIGHT_MM = 6;

export function paginate(blocks: MeasuredBlock[], limit: number): string[][] {
  const pages: string[][] = [];
  let current: string[] = [];
  let used = 0;
  let group: string | null = null;
  for (const block of blocks) {
    const forced = group !== null && block.group !== group;
    // 入りきらないブロックは次のページへ送る。1 つで 1 ページを超えるときはそのページに置く。
    if (current.length > 0 && (forced || used + block.height > limit)) {
      pages.push(current);
      current = [];
      used = 0;
    }
    current.push(block.key);
    used += block.height;
    group = block.group;
  }
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
