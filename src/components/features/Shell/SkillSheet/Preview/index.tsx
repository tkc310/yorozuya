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
  PHASES,
  detailSummaryOf,
  formatDate,
  formatDuration,
  present,
  type Career,
  type Duration,
  type Period,
  type SheetInput,
  type SheetView,
  type CalculatedOn,
  type YearMonth,
} from "@/shared/features/skill-sheet/sheet";
import {
  MM_TO_PX,
  PAGE_BODY_HEIGHT_MM,
  PAGE_FOOTER_HEIGHT_MM,
  paginate,
  samePages,
} from "./pagination";
import { usePaperZoom } from "./usePaperZoom";

// 用紙は印刷物なので、画面の文字の大きさの規則（14px 以上）ではなく pt で組む。
// 罫線で囲む表組みは一覧だけにし、ほかは見出し・余白・細い線で区切って読みやすくする。
const hairline = "0.5pt solid #b3b3b3";
const rule = "0.75pt solid black";

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

// 大分類（基本情報・職務経歴の一覧・職務経歴の詳細）の見出し。左寄せで、左に縦線を付ける。
const sectionTitle = css({
  borderLeft: "1.2mm solid black",
  fontSize: "11pt",
  fontWeight: "bold",
  lineHeight: "1.3",
  margin: "0",
  mb: "3mm",
  pl: "2mm",
});

// 小見出し（保有技術・自己紹介など）。
const subTitle = css({
  borderBottom: hairline,
  color: "black",
  fontSize: "9pt",
  fontWeight: "bold",
  margin: "0",
  mb: "1.5mm",
  pb: "0.5mm",
});

const part = css({
  mb: "4mm",
});

// 基本情報は 3 列の項目名と値。項目名は小さく灰色にして、値を目立たせる。
const facts = css({
  borderTop: hairline,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  margin: "0",
  mb: "4mm",
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

const skillRow = css({
  display: "grid",
  gap: "3mm",
  gridTemplateColumns: "24mm minmax(0, 1fr)",
  py: "0.6mm",
  "& + &": { borderTop: hairline },
});

const skillGroup = css({
  fontWeight: "bold",
});

const strengths = css({
  display: "grid",
  gap: "4mm",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  mb: "4mm",
});

const prose = css({
  margin: "0",
  whiteSpace: "pre-wrap",
});

const quote = css({
  borderLeft: "0.75mm solid #cccccc",
  margin: "0",
  pl: "3mm",
  whiteSpace: "pre-wrap",
});

const linkList = css({
  display: "grid",
  gap: "0.8mm",
  listStyle: "none",
  margin: "0",
  p: "0",
});

const linkItem = css({
  display: "grid",
  gap: "3mm",
  gridTemplateColumns: "30mm minmax(0, 1fr)",
  "& a": { color: "inherit", overflowWrap: "anywhere", textDecoration: "underline" },
});

const note = css({
  color: "#4d4d4d",
  fontSize: "7.5pt",
  margin: "0",
  mb: "1mm",
});

// 一覧だけは比べやすいよう表にする。縦線は使わず、行を細い線で区切る。
const listTable = css({
  borderCollapse: "collapse",
  mt: "1.5mm",
  tableLayout: "fixed",
  width: "100%",
  "& th": {
    borderBottom: rule,
    borderTop: rule,
    fontSize: "8pt",
    fontWeight: "bold",
    px: "1.2mm",
    py: "1mm",
    textAlign: "left",
  },
  "& td": {
    borderBottom: hairline,
    px: "1.2mm",
    py: "1.5mm",
    verticalAlign: "middle",
  },
  "& th:first-child, & td:first-child": { textAlign: "center" },
  "& tbody tr": { breakInside: "avoid" },
});

const projectCell = css({
  fontWeight: "bold",
});

// 詳細は 1 案件を 1 枚のカードにする。左に本文、右に技術や体制をまとめる。
const card = css({
  border: hairline,
  borderRadius: "1.5mm",
  breakInside: "avoid",
  mb: "4mm",
  overflow: "hidden",
});

const cardHead = css({
  alignItems: "baseline",
  background: "#f2f2f2",
  borderBottom: hairline,
  display: "flex",
  gap: "3mm",
  px: "3mm",
  py: "1.8mm",
});

const cardNo = css({
  color: "#4d4d4d",
  flexShrink: "0",
  fontSize: "8pt",
  fontWeight: "bold",
});

const cardTitle = css({
  flex: "1",
  fontSize: "10.5pt",
  fontWeight: "bold",
  lineHeight: "1.35",
  margin: "0",
});

const cardPeriod = css({
  color: "#333333",
  flexShrink: "0",
  fontSize: "8.5pt",
  whiteSpace: "nowrap",
});

const cardMeta = css({
  borderBottom: hairline,
  color: "#333333",
  display: "flex",
  flexWrap: "wrap",
  fontSize: "8pt",
  gap: "1mm 5mm",
  px: "3mm",
  py: "1.2mm",
});

const metaLabel = css({
  color: "#666666",
  mr: "1.5mm",
});

const cardBody = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 56mm",
});

const cardMain = css({
  display: "grid",
  gap: "2.5mm",
  px: "3mm",
  py: "2.5mm",
});

const cardSide = css({
  borderLeft: hairline,
  display: "grid",
  gap: "2.5mm",
  alignContent: "start",
  px: "3mm",
  py: "2.5mm",
});

const itemLabel = css({
  color: "#4d4d4d",
  display: "block",
  fontSize: "7.5pt",
  fontWeight: "bold",
  mb: "0.5mm",
});

const tags = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "1mm",
  listStyle: "none",
  margin: "0",
  p: "0",
});

const tag = css({
  border: hairline,
  borderRadius: "1mm",
  fontSize: "7.5pt",
  lineHeight: "1.3",
  px: "1.2mm",
  py: "0.3mm",
});

// 担当工程は 4 列 2 行。工程名と ● を線で区切り、担当した工程は濃く見せる。
const phaseGrid = css({
  border: hairline,
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
});

const phaseCell = css({
  display: "grid",
  gridTemplateRows: "auto auto",
  textAlign: "center",
  "&:not(:nth-child(4n + 1))": { borderLeft: hairline },
  "&:nth-child(n + 5)": { borderTop: hairline },
});

const phaseLabel = css({
  alignItems: "center",
  color: "#666666",
  display: "flex",
  fontSize: "6.5pt",
  justifyContent: "center",
  lineHeight: "1.2",
  minHeight: "6mm",
  py: "0.5mm",
  "[data-active] > &": { color: "black", fontWeight: "bold" },
});

const phaseMark = css({
  borderTop: hairline,
  fontSize: "8pt",
  lineHeight: "1.6",
});

function formatMonth(value: YearMonth): string {
  return `${value.year}年${value.month}月`;
}

function monthIndex(value: YearMonth): number {
  return value.year * 12 + value.month - 1;
}

function periodDuration(period: Period, until: YearMonth): Duration {
  const months = Math.max(0, monthIndex(period.end ?? until) - monthIndex(period.start));
  return { years: Math.floor(months / 12), months: months % 12 };
}

// 工程名は 2 行に分ける（要件/定義、単/テスト）。2 文字のものは 1 行のまま。
function phaseLines(phase: string) {
  const split = phase.endsWith("テスト") ? phase.length - 3 : phase.length === 4 ? 2 : 0;
  if (split === 0) {
    return phase;
  }
  return (
    <>
      {phase.slice(0, split)}
      <br />
      {phase.slice(split)}
    </>
  );
}

function endLabel(period: Period): string {
  return period.end ? formatMonth(period.end) : "現在";
}

function careerName(item: Career): string {
  return item.hard ? `${item.projectName} (※)` : item.projectName;
}

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

function Skills({ input, view }: { input: SheetInput; view: SheetView }) {
  const durations = new Map(view.skills.map((skill) => [skill.name, skill.duration]));
  const groups = input.skillGroups
    .map((group) => ({
      name: group.name,
      skills: group.skills
        .map((skill) => skill.name.trim())
        .filter((skillName) => durations.has(skillName)),
    }))
    .filter((group) => group.skills.length > 0);
  if (groups.length === 0) {
    return <p className={prose}>保有技術はありません</p>;
  }
  return (
    <div>
      {groups.map((group) => (
        <div key={group.name} className={skillRow}>
          <span className={skillGroup}>{group.name}</span>
          <span>
            {group.skills
              .map((skillName) => {
                const duration = durations.get(skillName);
                if (!duration || (duration.years === 0 && duration.months === 0)) {
                  return skillName;
                }
                return `${skillName}: ${formatDuration(duration)}`;
              })
              .join(" / ")}
          </span>
        </div>
      ))}
    </div>
  );
}

function DetailCareer({ no, item, until }: { no: number; item: Career; until: YearMonth }) {
  const texts = [
    { label: "概要", text: detailSummaryOf(item) },
    { label: "担当業務", text: item.work },
    { label: "注力した課題・成果", text: item.outcome },
  ].filter((entry) => entry.text.trim().length > 0);
  const meta = [
    { label: "担当職種", value: item.role },
    { label: "雇用形態", value: item.employment },
    { label: "チーム構成", value: item.team },
    { label: "開発手法", value: item.methodology },
  ].filter((entry) => entry.value.trim().length > 0);
  return (
    <article className={card} aria-label={item.projectName}>
      <div className={cardHead}>
        <span className={cardNo}>No.{no}</span>
        <h4 className={cardTitle}>{careerName(item)}</h4>
        <span className={cardPeriod}>
          {formatMonth(item.period.start)} 〜 {endLabel(item.period)}（
          {formatDuration(periodDuration(item.period, until))}）
        </span>
      </div>
      {meta.length > 0 ? (
        <div className={cardMeta}>
          {meta.map((entry) => (
            <span key={entry.label}>
              <span className={metaLabel}>{entry.label}</span>
              {entry.value}
            </span>
          ))}
        </div>
      ) : null}
      <div className={cardBody}>
        <div className={cardMain}>
          {texts.map((entry) => (
            <div key={entry.label}>
              <span className={itemLabel}>{entry.label}</span>
              <p className={prose}>{entry.text}</p>
            </div>
          ))}
        </div>
        <div className={cardSide}>
          {item.environment.length > 0 ? (
            <div>
              <span className={itemLabel}>技術・環境</span>
              <ul className={tags}>
                {item.environment.map((name) => (
                  <li key={name} className={tag}>
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {item.tools.length > 0 ? (
            <div>
              <span className={itemLabel}>ツール</span>
              <p className={prose}>{item.tools.join(" / ")}</p>
            </div>
          ) : null}
          <div>
            <span className={itemLabel}>担当工程</span>
            <div className={phaseGrid}>
              {PHASES.map((phase) => {
                const active = item.phases.includes(phase);
                return (
                  <div key={phase} className={phaseCell} data-active={active ? "" : undefined}>
                    <span className={phaseLabel}>{phaseLines(phase)}</span>
                    <span className={phaseMark} aria-label={phase}>
                      {active ? "●" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
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
          <section className={part} aria-label="保有技術">
            <h4 className={subTitle}>保有技術</h4>
            <Skills input={input} view={view} />
          </section>
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
          <p className={quote}>{view.selfPr}</p>
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
                <span>{link.label || "リンク"}</span>
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
    node: (
      <section aria-labelledby="career-list-title">
        <h3 id="career-list-title" className={sectionTitle}>
          職務経歴の一覧
        </h3>
        {/* 期間の重なりがあるときだけ並行の注記を、高難易度の経歴があるときだけ ※ の注記を出す。 */}
        {view.parallelCount > 0 ? (
          <p className={note}>期間が重複しているものについては並行していた案件になります。</p>
        ) : null}
        {view.hardCount > 0 ? (
          <p className={note}>
            特に難易度が高くスキルアップできた経歴には 企業・案件名の末尾に (※) と記載しています。
          </p>
        ) : null}
        <table className={listTable}>
          <colgroup>
            <col style={{ width: "8mm" }} />
            {/* 期間は「2023年12月 -」が 1 行に収まる幅にして、2 行で収める。 */}
            <col style={{ width: "24mm" }} />
            <col style={{ width: "38mm" }} />
            <col />
            <col style={{ width: "22mm" }} />
            <col style={{ width: "18mm" }} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">No.</th>
              <th scope="col">期間</th>
              <th scope="col">企業・案件名</th>
              <th scope="col">業務の概要</th>
              <th scope="col">担当職種</th>
              <th scope="col">雇用形態</th>
            </tr>
          </thead>
          <tbody>
            {careers.length === 0 ? (
              <tr>
                <td colSpan={6}>職務経歴はありません</td>
              </tr>
            ) : null}
            {careers.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>
                  {formatMonth(item.period.start)} -
                  <br />
                  {endLabel(item.period)}
                </td>
                <td className={projectCell}>{careerName(item)}</td>
                <td className={prose}>{item.summary}</td>
                <td>{item.role}</td>
                <td>{item.employment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    ),
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
