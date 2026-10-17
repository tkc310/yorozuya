import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { css, cx } from "styled-system/css";
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
const rule = "0.5pt";

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
  color: "black",
  display: "flex",
  flexDirection: "column",
  fontSize: "9pt",
  height: "297mm",
  letterSpacing: "0",
  lineHeight: "1.4",
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
  // 案件の上下の線を重ねて 1 本にする。
  "& > [data-detail] + [data-detail]": { mt: `-${rule}` },
});

// ブロックの余白も含めて高さを測れるよう、余白を内側に閉じ込める。
const blockBox = css({
  display: "flow-root",
});

const pageNumber = css({
  alignItems: "flex-end",
  display: "flex",
  flexShrink: "0",
  fontSize: "8pt",
  height: `${PAGE_FOOTER_HEIGHT_MM}mm`,
  justifyContent: "flex-end",
  margin: "0",
});

const updated = css({
  margin: "0",
  textAlign: "right",
});

const title = css({
  fontSize: "12pt",
  fontWeight: "bold",
  lineHeight: "1.4",
  margin: "0",
  mb: "2mm",
  textAlign: "center",
});

const table = css({
  borderCollapse: "collapse",
  mb: "4mm",
  tableLayout: "fixed",
  width: "100%",
  "& th, & td": {
    borderColor: "solidGray.900",
    borderWidth: rule,
    px: "1mm",
    py: "0.5mm",
  },
  "& td": {
    textAlign: "left",
    verticalAlign: "top",
  },
  "& th": {
    background: "solidGray.100",
    fontWeight: "bold",
    textAlign: "center",
    verticalAlign: "middle",
  },
});

// 一覧のセルは上下中央。No だけ左右も中央にする。
// 印刷しても読めるよう、URL はそのまま見せる。
const linkCell = css({
  overflowWrap: "anywhere",
  "& a": { color: "inherit", textDecoration: "underline" },
});

const careerTable = css({
  "& tbody tr": { breakInside: "avoid" },
  "& tbody td": { verticalAlign: "middle" },
  "& tbody td:first-child": { textAlign: "center" },
});

const preWrap = css({
  whiteSpace: "pre-wrap",
});

const groupName = css({
  display: "block",
  fontWeight: "bold",
});

const note = css({
  fontSize: "7.5pt",
  margin: "0",
  mb: "1mm",
});

// 大分類（基本情報・職務経歴の一覧・職務経歴の詳細）の見出し。左寄せで、左に縦線を付ける。
const sectionTitle = css({
  borderColor: "black",
  borderLeftStyle: "solid",
  borderLeftWidth: "1mm",
  fontSize: "10.5pt",
  fontWeight: "bold",
  lineHeight: "1.4",
  margin: "0",
  mb: "2mm",
  pl: "2mm",
  textAlign: "left",
});

// 縦の列ごとに中身を積む。外枠は左と上、セルは右と下に線を引く。
const detail = css({
  borderColor: "solidGray.900",
  borderLeftWidth: rule,
  borderTopWidth: rule,
  // 案件の途中では改ページしない。1 件で 1 ページを超えるときだけ途中で分かれる。
  breakInside: "avoid",
  display: "grid",
  gridTemplateColumns: "7mm 21mm minmax(0, 1fr) 33mm 36mm",
  // 2 件目以降は上の線を重ねる。次のページへ送られたときは余白が消えて線が残る。
  "& + &": { mt: `-${rule}` },
});

const cell = css({
  borderBottomWidth: rule,
  borderColor: "solidGray.900",
  borderRightWidth: rule,
  px: "1mm",
  py: "0.5mm",
});

const head = css({
  background: "solidGray.100",
  fontWeight: "bold",
  textAlign: "center",
});

const stack = css({
  borderBottomWidth: rule,
  borderColor: "solidGray.900",
  borderRightWidth: rule,
  display: "flex",
  flexDirection: "column",
});

const part = css({
  borderColor: "solidGray.900",
  borderTopWidth: rule,
  px: "1mm",
  py: "0.5mm",
  _first: { borderTopWidth: "0" },
});

const grow = css({
  flex: "1",
});

const projectName = css({
  fontWeight: "bold",
  margin: "0",
});

const paragraph = css({
  margin: "0",
  mt: "1.5mm",
  whiteSpace: "pre-wrap",
});

const lines = css({
  listStyle: "none",
  margin: "0",
  p: "0",
});

// 担当工程は 4 列 2 行。各欄は上下左右の中央に寄せる。
const phases = css({
  borderColor: "solidGray.900",
  borderTopWidth: rule,
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
});

// 工程名と ● を線で区切り、それぞれ上下左右の中央に寄せる。
const phaseCell = css({
  borderColor: "solidGray.900",
  borderLeftWidth: rule,
  display: "grid",
  gridTemplateRows: "1fr 1fr",
  textAlign: "center",
  "&:nth-child(4n + 1)": { borderLeftWidth: "0" },
  "&:nth-child(n + 5)": { borderTopWidth: rule },
  "& > *": {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    minHeight: "4.5mm",
  },
});

const phaseLabel = css({
  fontSize: "6.5pt",
  lineHeight: "1.2",
  py: "0.5mm",
});

const phaseMark = css({
  borderColor: "solidGray.900",
  borderTopWidth: rule,
  fontSize: "8pt",
  lineHeight: "1.2",
});

// 担当職種とチーム構成は 2 行ぶん以上の高さで、上下中央に寄せる。余りはこの 2 つが分け合う。
const centeredPart = css({
  display: "flex",
  flex: "1",
  flexDirection: "column",
  justifyContent: "center",
  minHeight: "calc(2lh + 1mm)",
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

type ProfileCell = {
  label: string;
  value: string;
};

const PROFILE_COLUMNS = 3;

// 氏名と、表示をオンにした項目を 3 列ずつ並べる。
function profileRows(view: SheetView): (ProfileCell | null)[][] {
  const cells: ProfileCell[] = [
    { label: "氏名", value: view.name },
    ...(view.visibility.age
      ? [{ label: "年齢", value: view.age !== null ? `${view.age}歳` : "" }]
      : []),
    ...(view.visibility.gender ? [{ label: "性別", value: view.gender ?? "" }] : []),
    ...(view.visibility.experience ? [{ label: "経験年数", value: view.experience }] : []),
    ...(view.visibility.education ? [{ label: "最終学歴", value: view.education }] : []),
    ...(view.visibility.station ? [{ label: "最寄駅", value: view.station }] : []),
  ];
  return chunkCells(cells);
}

// 希望条件は表示をオンにした項目だけを 1 行に並べる。
function desiredRow(view: SheetView): (ProfileCell | null)[] | null {
  const cells: ProfileCell[] = [
    ...(view.visibility.desiredHours
      ? [{ label: "希望稼働時間", value: view.texts.desiredHours }]
      : []),
    ...(view.visibility.desiredEmployment
      ? [{ label: "希望雇用形態", value: view.texts.desiredEmployment }]
      : []),
    ...(view.visibility.affiliation ? [{ label: "所属", value: view.texts.affiliation }] : []),
  ];
  return cells.length > 0 ? (chunkCells(cells)[0] ?? null) : null;
}

function chunkCells(cells: ProfileCell[]): (ProfileCell | null)[][] {
  const rows: (ProfileCell | null)[][] = [];
  for (let index = 0; index < cells.length; index += PROFILE_COLUMNS) {
    const row: (ProfileCell | null)[] = cells.slice(index, index + PROFILE_COLUMNS);
    while (row.length < PROFILE_COLUMNS) {
      row.push(null);
    }
    rows.push(row);
  }
  return rows;
}

function ProfileRow({ row }: { row: (ProfileCell | null)[] }) {
  return (
    <tr>
      {row.map((cell, cellIndex) =>
        cell ? (
          <Fragment key={cell.label}>
            <th scope="row">{cell.label}</th>
            <td>{cell.value}</td>
          </Fragment>
        ) : (
          <td key={`empty-${cellIndex}`} colSpan={2} />
        ),
      )}
    </tr>
  );
}

function SkillCell({ input, view }: { input: SheetInput; view: SheetView }) {
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
    return <>保有技術はありません</>;
  }
  return (
    <>
      {groups.map((group) => (
        <div key={group.name}>
          <span className={groupName}>{group.name}</span>
          {group.skills
            .map((skillName) => {
              const duration = durations.get(skillName);
              if (!duration || (duration.years === 0 && duration.months === 0)) {
                return skillName;
              }
              return `${skillName}: ${formatDuration(duration)}`;
            })
            .join(" / ")}
        </div>
      ))}
    </>
  );
}

function DetailCareer({ no, item, until }: { no: number; item: Career; until: YearMonth }) {
  const texts = [
    { label: "概要", text: detailSummaryOf(item) },
    { label: "担当業務", text: item.work },
    { label: "注力した課題・成果", text: item.outcome },
  ].filter((entry) => entry.text.trim().length > 0);
  return (
    <article className={detail} aria-label={item.projectName}>
      <div className={cx(cell, head)}>No</div>
      <div className={cx(cell, head)}>期間</div>
      <div className={cx(cell, head)}>案件内容</div>
      <div className={cx(cell, head)}>技術・環境</div>
      <div className={cx(cell, head)}>担当職種</div>
      <div className={cell}>{no}</div>
      <div className={cell}>
        {formatMonth(item.period.start)}
        <br />〜<br />
        {endLabel(item.period)}
        <br />({formatDuration(periodDuration(item.period, until))})
      </div>
      <div className={stack}>
        <div className={cx(part, grow)}>
          <p className={projectName}>{careerName(item)}</p>
          {texts.map((entry) => (
            <p key={entry.label} className={paragraph}>
              【{entry.label}】{"\n"}
              {entry.text}
            </p>
          ))}
        </div>
        <div className={cx(part, head)}>開発手法</div>
        <div className={part}>{item.methodology}</div>
        <div className={cx(part, head)}>ツール</div>
        <div className={part}>{item.tools.join(" / ")}</div>
      </div>
      <div className={cell}>
        <ul className={lines}>
          {item.environment.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
      <div className={stack}>
        <div className={cx(part, centeredPart)}>{item.role}</div>
        <div className={cx(part, head)}>チーム構成</div>
        <div className={cx(part, centeredPart)}>{item.team}</div>
        <div className={cx(part, head)}>担当工程</div>
        <div className={phases}>
          {PHASES.map((phase) => (
            <div key={phase} className={phaseCell}>
              <span className={phaseLabel}>{phaseLines(phase)}</span>
              <span className={phaseMark} aria-label={phase}>
                {item.phases.includes(phase) ? "●" : ""}
              </span>
            </div>
          ))}
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
  const desired = desiredRow(view);
  const careers = [...view.recent, ...view.older];
  const blocks: Block[] = [
    {
      key: "header",
      group: "profile",
      node: (
        <>
          <p className={updated}>
            更新日： {view.updatedOn ? formatDate(view.updatedOn) : "未設定"}
          </p>
          <h2 className={title}>スキルシート</h2>
        </>
      ),
    },
    {
      key: "profile",
      group: "profile",
      node: (
        <>
          <h3 className={sectionTitle}>基本情報</h3>
          <table className={table}>
            <colgroup>
              {/* 最終学歴などが入る 4 列目を広くし、ほかの値の列は詰める。 */}
              <col style={{ width: "25mm" }} />
              <col style={{ width: "33mm" }} />
              <col style={{ width: "25mm" }} />
              <col />
              <col style={{ width: "25mm" }} />
              <col style={{ width: "33mm" }} />
            </colgroup>
            <tbody>
              {[...profileRows(view), ...(desired ? [desired] : [])].map((row, rowIndex) => (
                <ProfileRow key={rowIndex} row={row} />
              ))}
              <tr>
                <th scope="row">保有技術</th>
                <td colSpan={PROFILE_COLUMNS * 2 - 1}>
                  <SkillCell input={input} view={view} />
                </td>
              </tr>
              <tr>
                <th scope="row">得意な技術</th>
                <td colSpan={PROFILE_COLUMNS * 2 - 1} className={preWrap}>
                  {view.texts.strongSkills}
                </td>
              </tr>
              <tr>
                <th scope="row">得意な業務</th>
                <td colSpan={PROFILE_COLUMNS * 2 - 1} className={preWrap}>
                  {view.texts.strongWork}
                </td>
              </tr>
            </tbody>
          </table>
        </>
      ),
    },
  ];
  if (view.visibility.selfPr) {
    blocks.push({
      key: "self-pr",
      group: "profile",
      node: (
        <table className={table}>
          <thead>
            <tr>
              <th scope="col">自己紹介</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={preWrap}>{view.selfPr}</td>
            </tr>
          </tbody>
        </table>
      ),
    });
  }
  if (view.links.length > 0) {
    blocks.push({
      key: "links",
      group: "profile",
      node: (
        <table className={table}>
          <colgroup>
            <col style={{ width: "25mm" }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="colgroup" colSpan={2}>
                ポートフォリオなどのリンク
              </th>
            </tr>
          </thead>
          <tbody>
            {view.links.map((link, index) => (
              <tr key={`${index}-${link.url}`}>
                <th scope="row">{link.label || "リンク"}</th>
                <td className={linkCell}>
                  <a href={link.url} target="_blank" rel="noreferrer">
                    {link.url}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <table className={cx(table, careerTable)}>
          <colgroup>
            <col style={{ width: "7mm" }} />
            {/* 期間は「2023年12月 -」が 1 行に収まる幅にして、2 行で収める。 */}
            <col style={{ width: "25mm" }} />
            {/* 見出しの「企業・案件名」が1行に収まる幅 */}
            <col style={{ width: "27mm" }} />
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
                <td>{careerName(item)}</td>
                <td className={preWrap}>{item.summary}</td>
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
              <div
                key={block.key}
                className={blockBox}
                data-block={block.key}
                data-detail={block.group === "details" ? "" : undefined}
              >
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
