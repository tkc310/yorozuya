import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { css } from "styled-system/css";
import {
  formatDate,
  present,
  type SheetInput,
  type SheetView,
  type CalculatedOn,
} from "@/shared/features/skill-sheet/sheet";
import {
  MM_TO_PX,
  PAGE_BODY_HEIGHT_MM,
  PAGE_FOOTER_HEIGHT_MM,
  paginate,
  samePages,
} from "./pagination";
import { CareerList } from "./CareerList/index";
import { DetailCareer } from "./DetailCareer/index";
import { Skills } from "./Skills/index";
import { part, prose, sectionTitle, subTitle, hairline, rule } from "./styles";
import { usePaperZoom } from "./usePaperZoom";

const frame = css({
  width: "100%",
  _print: { width: "auto" },
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
  color: "#1a1a1a",
  display: "flex",
  flexDirection: "column",
  fontSize: "9pt",
  height: "297mm",
  letterSpacing: "0",
  lineHeight: "1.55",
  mx: "auto",
  overflow: "hidden",
  printColorAdjust: "exact",
  px: "13mm",
  py: "12mm",
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
  color: "#666666",
  display: "flex",
  flexShrink: "0",
  fontSize: "8pt",
  height: `${PAGE_FOOTER_HEIGHT_MM}mm`,
  justifyContent: "flex-end",
  margin: "0",
});

// 表題と更新日を 1 行に並べ、太い線で区切る。
const masthead = css({
  alignItems: "baseline",
  borderBottom: rule,
  display: "flex",
  justifyContent: "space-between",
  mb: "5mm",
  pb: "1.5mm",
});

const title = css({
  fontSize: "16pt",
  fontWeight: "bold",
  letterSpacing: "0.05em",
  lineHeight: "1.3",
  margin: "0",
});

const updated = css({
  color: "#4d4d4d",
  fontSize: "8.5pt",
  margin: "0",
});

// 基本情報は 3 列の項目名と値。項目名は小さく灰色にして、値を目立たせる。
const facts = css({
  borderTop: hairline,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  margin: "0",
  mb: "6mm",
});

const fact = css({
  borderBottom: hairline,
  display: "grid",
  gap: "0.3mm",
  px: "1.5mm",
  py: "1.2mm",
});

const factLabel = css({
  color: "#666666",
  fontSize: "7.5pt",
});

const factValue = css({
  fontSize: "10pt",
  fontWeight: "bold",
  margin: "0",
  minHeight: "1.4em",
});

const strengths = css({
  display: "grid",
  gap: "4mm",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  mb: "6mm",
});

// リンクは箇条書きにし、先頭に ● を付ける。
const linkList = css({
  display: "grid",
  gap: "0.8mm",
  listStyle: "disc",
  margin: "0",
  pl: "4.5mm",
});

const linkItem = css({
  "& a": { color: "inherit", overflowWrap: "anywhere", textDecoration: "underline" },
});

const linkLabel = css({
  display: "inline-block",
  minWidth: "30mm",
  pr: "3mm",
});

type Fact = {
  label: string;
  value: string;
};

// 氏名と、表示をオンにした項目を並べる。
function profileFacts(view: SheetView): Fact[] {
  return [
    { label: "氏名", value: view.name },
    ...(view.visibility.age
      ? [{ label: "年齢", value: view.age !== null ? `${view.age}歳` : "" }]
      : []),
    ...(view.visibility.gender ? [{ label: "性別", value: view.gender ?? "" }] : []),
    ...(view.visibility.experience ? [{ label: "経験年数", value: view.experience }] : []),
    ...(view.visibility.education ? [{ label: "最終学歴", value: view.education }] : []),
    ...(view.visibility.station ? [{ label: "最寄駅", value: view.station }] : []),
    ...(view.visibility.desiredHours
      ? [{ label: "希望稼働時間", value: view.texts.desiredHours }]
      : []),
    ...(view.visibility.desiredEmployment
      ? [{ label: "希望雇用形態", value: view.texts.desiredEmployment }]
      : []),
    ...(view.visibility.affiliation ? [{ label: "所属", value: view.texts.affiliation }] : []),
  ];
}

type Block = {
  key: string;
  group: "profile" | "list" | "details";
  node: ReactNode;
};

// 用紙に並べる単位。表や案件の途中では改ページしない。
function sheetBlocks(input: SheetInput, view: SheetView, calculatedOn: CalculatedOn): Block[] {
  const until = view.updatedOn ?? calculatedOn;
  const careers = [...view.recent, ...view.older];
  const blocks: Block[] = [
    {
      key: "header",
      group: "profile",
      node: (
        <header className={masthead}>
          <h2 className={title}>スキルシート</h2>
          <p className={updated}>
            更新日： {view.updatedOn ? formatDate(view.updatedOn) : "未設定"}
          </p>
        </header>
      ),
    },
    {
      key: "profile",
      group: "profile",
      node: (
        <>
          <h3 className={sectionTitle}>基本情報</h3>
          <dl className={facts}>
            {profileFacts(view).map((entry) => (
              <div key={entry.label} className={fact}>
                <dt className={factLabel}>{entry.label}</dt>
                <dd className={factValue}>{entry.value}</dd>
              </div>
            ))}
          </dl>
          <Skills input={input} view={view} />
          {view.texts.strongSkills.trim() || view.texts.strongWork.trim() ? (
            <div className={strengths}>
              <section aria-label="得意な技術">
                <h4 className={subTitle}>得意な技術</h4>
                <p className={prose}>{view.texts.strongSkills}</p>
              </section>
              <section aria-label="得意な業務">
                <h4 className={subTitle}>得意な業務</h4>
                <p className={prose}>{view.texts.strongWork}</p>
              </section>
            </div>
          ) : null}
        </>
      ),
    },
  ];
  if (view.visibility.selfPr && view.selfPr.trim()) {
    blocks.push({
      key: "self-pr",
      group: "profile",
      node: (
        <section className={part} aria-label="自己紹介">
          <h4 className={subTitle}>自己紹介</h4>
          <p className={prose}>{view.selfPr}</p>
        </section>
      ),
    });
  }
  if (view.links.length > 0) {
    blocks.push({
      key: "links",
      group: "profile",
      node: (
        <section className={part} aria-label="ポートフォリオなどのリンク">
          <h4 className={subTitle}>ポートフォリオなどのリンク</h4>
          <ul className={linkList}>
            {view.links.map((link, index) => (
              <li key={`${index}-${link.url}`} className={linkItem}>
                <span className={linkLabel}>{link.label || "リンク"}</span>
                <a href={link.url} target="_blank" rel="noreferrer">
                  {link.url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ),
    });
  }
  blocks.push({
    key: "career-list",
    group: "list",
    node: <CareerList view={view} careers={careers} />,
  });
  careers.forEach((item, index) => {
    blocks.push({
      key: `detail-${item.id}`,
      group: "details",
      node: (
        <>
          {index === 0 ? <h3 className={sectionTitle}>職務経歴の詳細</h3> : null}
          <DetailCareer no={index + 1} item={item} until={until} />
        </>
      ),
    });
  });
  return blocks;
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// ブロックの高さを測ってページに割り付ける。測るまでは 1 枚にまとめて出す。
function Pages({ blocks, zoom }: { blocks: Block[]; zoom: number }) {
  const root = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[][] | null>(null);
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
    const heights = new Map<string, number>();
    for (const node of element.querySelectorAll<HTMLElement>("[data-block]")) {
      heights.set(node.dataset.block ?? "", node.getBoundingClientRect().height / (zoom || 1));
    }
    const next = paginate(
      blocks.map((block) => ({
        key: block.key,
        group: block.group,
        height: heights.get(block.key) ?? 0,
      })),
      PAGE_BODY_HEIGHT_MM * MM_TO_PX,
    );
    setPages((current) => (samePages(current, next) ? current : next));
  }, [blocks, zoom, tick]);

  const assigned = new Map<string, number>();
  (pages ?? []).forEach((keys, index) => {
    for (const key of keys) {
      assigned.set(key, index);
    }
  });
  const count = Math.max(1, pages?.length ?? 1);
  const grouped: Block[][] = Array.from({ length: count }, () => []);
  for (const block of blocks) {
    grouped[Math.min(assigned.get(block.key) ?? count - 1, count - 1)]?.push(block);
  }

  return (
    <div ref={root} className={pageStack} style={{ "--paper-zoom": zoom } as CSSProperties}>
      {grouped.map((pageBlocks, index) => (
        <div key={index} className={paper} aria-label={`${index + 1}ページ目`}>
          <div className={pageBody}>
            {pageBlocks.map((block) => (
              <div key={block.key} className={blockBox} data-block={block.key}>
                {block.node}
              </div>
            ))}
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
  const { ref, zoom } = usePaperZoom();
  const result = present(input, calculatedOn);
  return (
    <section ref={ref} className={frame} aria-label="プレビュー">
      {result.ok ? (
        <Pages blocks={sheetBlocks(input, result.view, calculatedOn)} zoom={zoom} />
      ) : (
        <div className={paper} style={{ "--paper-zoom": zoom } as CSSProperties}>
          <p role="status">{result.error}</p>
        </div>
      )}
    </section>
  );
}
