import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { css, cx } from "styled-system/css";
import {
  type CalculatedOn,
  type SheetInput,
  type SheetView,
} from "@/src/shared/features/skill-sheet/sheet.schema";
import { formatSlashDate, present } from "@/src/shared/features/skill-sheet/skill.service";
import { Button } from "@/src/components/ui/Button/index";
import { BasicInfo } from "./BasicInfo/index";
import { CareerListHead, CareerRow, CareerTableHead, EmptyCareerRow } from "./CareerList/index";
import { DetailCareer } from "./DetailCareer/index";
import { Extras } from "./Extras/index";
import { Header } from "./Header/index";
import { RunningHeader } from "./RunningHeader/index";
import { SKILL_COLUMN_COUNT, Skills, skillItems } from "./Skills/index";
import { Strengths } from "./Strengths/index";
import {
  MM_TO_PX,
  PAGE_FOOTER_HEIGHT_MM,
  PAGE_BODY_HEIGHT_MM,
  pageBodyHeightMm,
  paginate,
  samePages,
  type PagePart,
} from "./pagination";
import { SUB, TEXT, part, prose, sectionTitle } from "./styles";
import { usePaperZoom, type ZoomMode } from "./usePaperZoom";

const frame = css({
  width: "100%",
  _print: { width: "auto" },
});

// 画面だけに出す操作。ページ数と拡大率の切り替え。
const toolbar = css({
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: "3",
  justifyContent: "space-between",
  mb: "4",
  _print: { display: "none" },
});

const pageCount = css({
  color: "fg.sub",
  margin: "0",
  textStyle: "std-14N-170",
});

const zoomButtons = css({
  display: "flex",
  gap: "2",
});

// 100% 表示では用紙が枠より広くなるので、横にスクロールさせる。
const scroller = css({
  overflowX: "auto",
  _print: { overflow: "visible" },
});

// 画面では用紙を 1 枚ずつ並べ、印刷では同じ割り付けのまま 1 枚ずつ改ページする。
const pageStack = css({
  display: "grid",
  gap: "6",
  zoom: "var(--paper-zoom, 1)",
  _print: { display: "block", zoom: "1" },
});

const paper = css({
  background: "white",
  boxShadow: "1",
  color: TEXT,
  display: "flex",
  flexDirection: "column",
  fontSize: "8.8pt",
  height: "297mm",
  letterSpacing: "0",
  lineHeight: "1.55",
  mx: "auto",
  overflow: "hidden",
  printColorAdjust: "exact",
  // 画面の用紙の余白。pagination.ts の PAGE_MARGIN_*_MM と @page と同じ値にする。
  pb: "10mm",
  pt: "11mm",
  px: "12mm",
  width: "210mm",
  _print: {
    boxShadow: "none",
    breakAfter: "page",
    height: "auto",
    minHeight: `${PAGE_BODY_HEIGHT_MM + PAGE_FOOTER_HEIGHT_MM}mm`,
    overflow: "visible",
    px: "0",
    py: "0",
    width: "auto",
    _last: { breakAfter: "auto" },
  },
});

const pageBody = css({
  flex: "1",
});

// ブロックの余白も含めて高さを測れるよう、余白を内側に閉じ込める。
const blockBox = css({
  display: "flow-root",
});

const pageNumber = css({
  alignItems: "flex-end",
  color: SUB,
  display: "flex",
  flexShrink: "0",
  fontSize: "7.5pt",
  height: `${PAGE_FOOTER_HEIGHT_MM}mm`,
  justifyContent: "flex-end",
  margin: "0",
});

// 一覧と詳細の間をあける。
const detailsTitle = css({
  mt: "5mm",
});

// 段組みに流し込み、途中でページを分けられるブロック。
type Flow = {
  items: {
    key: string;
    keepWithNext?: boolean;
    // 段の先頭に来たときに繰り返す項目（グループ名）のキー。
    repeatOf?: string;
  }[];
  columnCount: number;
  // placed は測る前は無い。continued は前のページからの続きのとき。
  render: (placed: string[][] | undefined, continued: boolean) => ReactNode;
};

type Block = {
  key: string;
  node?: ReactNode;
  flow?: Flow;
  keepWithNext?: boolean;
  // ページの先頭に来たら表の見出し行を繰り返す。
  repeatHead?: boolean;
};

function skillsFlow(input: SheetInput, view: SheetView): Flow | undefined {
  const items = skillItems(input, view);
  if (items.length === 0) {
    return undefined;
  }
  const groupKeys = new Map(
    items.filter((item) => item.kind === "group").map((item) => [item.name, item.key]),
  );
  return {
    items: items.map((item) =>
      item.kind === "group"
        ? { key: item.key, keepWithNext: true }
        : { key: item.key, repeatOf: groupKeys.get(item.group) },
    ),
    columnCount: SKILL_COLUMN_COUNT,
    render: (placed, continued) => (
      <Skills input={input} view={view} placed={placed} continued={continued} />
    ),
  };
}

// 用紙に並べる単位。ブロックの途中では改ページしない。
// 並びは面談での説明順（自己紹介 → 経歴紹介）に合わせ、改ページは強制しない。
function sheetBlocks(input: SheetInput, view: SheetView, calculatedOn: CalculatedOn): Block[] {
  const until = view.updatedOn ?? calculatedOn;
  const careers = [...view.recent, ...view.older];
  const blocks: Block[] = [
    {
      key: "header",
      node: (
        <>
          <Header view={view} />
          <BasicInfo view={view} />
        </>
      ),
    },
    { key: "strengths", node: <Strengths view={view} /> },
    // 保有技術は長くなりやすいので、ページの残りに入るだけ詰めて続きを次のページへ送る。
    { key: "skills", node: <Skills input={input} view={view} />, flow: skillsFlow(input, view) },
    { key: "extras", node: <Extras view={view} /> },
  ];
  if (view.visibility.selfPr && view.selfPr.trim()) {
    blocks.push({
      key: "self-pr",
      node: (
        <section className={part} aria-labelledby="self-pr-title">
          <h3 id="self-pr-title" className={sectionTitle}>
            自己PR
          </h3>
          <p className={prose}>{view.selfPr}</p>
        </section>
      ),
    });
  }
  blocks.push({
    key: "career-list-head",
    keepWithNext: true,
    node: <CareerListHead view={view} />,
  });
  if (careers.length === 0) {
    blocks.push({ key: "career-row-empty", node: <EmptyCareerRow /> });
  }
  careers.forEach((item, index) => {
    blocks.push({
      key: `career-row-${item.id}`,
      repeatHead: true,
      node: <CareerRow no={index + 1} item={item} until={until} />,
    });
  });
  careers.forEach((item, index) => {
    blocks.push({
      key: `detail-${item.id}`,
      node: (
        <>
          {index === 0 ? <h3 className={cx(sectionTitle, detailsTitle)}>職務経歴詳細</h3> : null}
          <DetailCareer no={index + 1} item={item} until={until} />
        </>
      ),
    });
  });
  return blocks;
}

// ページに置くブロック。段組みのブロックなら、そのページに置く項目を段ごとに持つ。
type Placed = { block: Block; placed?: string[][]; continued: boolean };

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// ブロックの高さを測ってページに割り付ける。測るまでは 1 枚にまとめて出す。
function Pages({
  blocks,
  zoom,
  name,
  updated,
  onCount,
}: {
  blocks: Block[];
  zoom: number;
  name: string;
  updated: string;
  onCount: (count: number) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PagePart[][] | null>(null);
  const [tick, setTick] = useState(0);

  // フォントの読み込みなどで高さが変わったら測り直す。
  useEffect(() => {
    const element = root.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(() => setTick((current) => current + 1));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useIsomorphicLayoutEffect(() => {
    const element = root.current;
    if (!element) {
      return;
    }
    const scale = zoom || 1;
    const heights = new Map<string, number>();
    for (const node of element.querySelectorAll<HTMLElement>("[data-block]")) {
      heights.set(node.dataset.block ?? "", node.getBoundingClientRect().height / scale);
    }
    const itemHeights = new Map<string, number>();
    for (const node of element.querySelectorAll<HTMLElement>("[data-flow-item]")) {
      itemHeights.set(node.dataset.flowItem ?? "", node.getBoundingClientRect().height / scale);
    }
    // 段組みの外の高さ（見出しと下の余白）。切れ端ごとに測り、大きい方を使う。
    const overheads = new Map<string, number>();
    for (const node of element.querySelectorAll<HTMLElement>("[data-flow]")) {
      const body = node.querySelector<HTMLElement>("[data-flow-body]");
      const key = node.dataset.flow ?? "";
      const overhead =
        (node.getBoundingClientRect().height - (body?.getBoundingClientRect().height ?? 0)) / scale;
      overheads.set(key, Math.max(overheads.get(key) ?? 0, overhead));
    }
    const head = element.querySelector<HTMLElement>("[data-repeat-head]");
    const repeatHeight = head ? head.getBoundingClientRect().height / scale : 0;
    const next = paginate(
      blocks.map((block) => ({
        key: block.key,
        height: heights.get(block.key) ?? 0,
        keepWithNext: block.keepWithNext,
        repeatHeight: block.repeatHead ? repeatHeight : undefined,
        flow: block.flow
          ? {
              items: block.flow.items.map((item) => ({
                key: item.key,
                height: itemHeights.get(item.key) ?? 0,
                keepWithNext: item.keepWithNext,
                repeatHeight: item.repeatOf ? itemHeights.get(item.repeatOf) : undefined,
              })),
              columnCount: block.flow.columnCount,
              overhead: overheads.get(block.key) ?? 0,
            }
          : undefined,
      })),
      (page) => pageBodyHeightMm(page) * MM_TO_PX,
    );
    setPages((current) => (samePages(current, next) ? current : next));
  }, [blocks, zoom, tick]);

  // 割り付けに無いブロック（測る前や、足したばかりのもの）は最後のページに置いて測る。
  const byKey = new Map(blocks.map((block) => [block.key, block]));
  const count = Math.max(1, pages?.length ?? 1);
  const grouped: Placed[][] = Array.from({ length: count }, () => []);
  const seen = new Set<string>();
  (pages ?? []).forEach((parts, index) => {
    for (const part of parts) {
      const block = byKey.get(part.key);
      if (!block) {
        continue;
      }
      grouped[index]?.push({ block, placed: part.columns, continued: seen.has(part.key) });
      seen.add(part.key);
    }
  });
  for (const block of blocks) {
    if (!seen.has(block.key)) {
      grouped[count - 1]?.push({ block, continued: false });
    }
  }

  useEffect(() => {
    onCount(count);
  }, [count, onCount]);

  return (
    <div ref={root} className={pageStack} style={{ "--paper-zoom": zoom } as CSSProperties}>
      {grouped.map((pageBlocks, index) => (
        <div key={index} className={paper} aria-label={`${index + 1}ページ目`} data-paper>
          {index > 0 ? <RunningHeader name={name} updated={updated} /> : null}
          <div className={pageBody}>
            {/* 行がページの先頭に来たら、表の見出し行を繰り返す。 */}
            {index > 0 && pageBlocks[0]?.block.repeatHead ? <CareerTableHead /> : null}
            {pageBlocks.map(({ block, placed, continued }) =>
              block.flow ? (
                <div key={block.key} className={blockBox} data-flow={block.key}>
                  {block.flow.render(placed, continued)}
                </div>
              ) : (
                <div key={block.key} className={blockBox} data-block={block.key}>
                  {block.node}
                </div>
              ),
            )}
          </div>
          <p className={pageNumber}>
            {index + 1} / {count}
          </p>
        </div>
      ))}
    </div>
  );
}

export function Preview({
  sheet: input,
  calculatedOn,
}: {
  sheet: SheetInput;
  calculatedOn: CalculatedOn;
}) {
  const [mode, setMode] = useState<ZoomMode>("fit");
  const [count, setCount] = useState(1);
  const { ref, zoom } = usePaperZoom(mode);
  const result = present(input, calculatedOn);
  return (
    <section ref={ref} className={frame} aria-label="プレビュー">
      <div className={toolbar}>
        <p className={pageCount}>全 {count} ページ</p>
        <div className={zoomButtons} role="group" aria-label="表示の大きさ">
          <Button
            type="button"
            size="sm"
            variant={mode === "fit" ? "solid" : "outline"}
            aria-pressed={mode === "fit"}
            onClick={() => setMode("fit")}
          >
            幅に合わせる
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "actual" ? "solid" : "outline"}
            aria-pressed={mode === "actual"}
            onClick={() => setMode("actual")}
          >
            100%
          </Button>
        </div>
      </div>
      <div className={scroller}>
        {result.ok ? (
          <Pages
            blocks={sheetBlocks(input, result.view, calculatedOn)}
            zoom={zoom}
            name={result.view.displayName}
            updated={result.view.updatedOn ? formatSlashDate(result.view.updatedOn) : "未設定"}
            onCount={setCount}
          />
        ) : (
          <div className={paper} style={{ "--paper-zoom": zoom } as CSSProperties}>
            <p role="status">{result.error}</p>
          </div>
        )}
      </div>
    </section>
  );
}
