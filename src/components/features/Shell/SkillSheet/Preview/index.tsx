import { css } from "styled-system/css";
import {
  formatDuration,
  present,
  type Career,
  type Period,
  type SheetInput,
  type YearMonth,
} from "@/shared/features/skill-sheet/sheet";

const sheet = css({
  background: "#fffdf9",
  borderColor: "#e4dccd",
  borderRadius: "lg",
  borderWidth: "1px",
  display: "grid",
  gap: "5",
  p: "6",
});

const name = css({
  fontSize: "3xl",
  fontWeight: "semibold",
  lineHeight: "1.2",
  margin: "0",
});

const meta = css({
  color: "#5c534c",
  display: "flex",
  flexWrap: "wrap",
  gap: "3",
  margin: "0",
});

const pr = css({
  margin: "0",
  maxWidth: "24rem",
});

const block = css({
  display: "grid",
  gap: "2",
});

const career = css({
  display: "grid",
  gap: "2",
  borderTopWidth: "1px",
  borderColor: "#e4dccd",
  pt: "3",
});

const marks = css({
  display: "flex",
  gap: "2",
});

const mark = css({
  borderColor: "#163a37",
  borderRadius: "full",
  borderWidth: "1px",
  color: "#163a37",
  fontSize: "sm",
  px: "2",
  py: "0.5",
});

function formatMonth(value: YearMonth): string {
  return `${value.year}年${value.month}月`;
}

function formatPeriod(period: Period): string {
  const end = period.end ? formatMonth(period.end) : "進行中";
  return `${formatMonth(period.start)}–${end}`;
}

function RecentCareer({ item }: { item: Career }) {
  return (
    <article className={career}>
      <h3 className={css({ margin: "0" })}>
        {item.projectName}
        <span className={css({ color: "#5c534c", fontWeight: "normal" })}>
          {" "}
          {formatPeriod(item.period)}
        </span>
      </h3>
      <p className={css({ margin: "0" })}>{item.summary}</p>
      <p className={css({ margin: "0" })}>やったこと {item.work}</p>
      <p className={css({ margin: "0" })}>成果 {item.outcome}</p>
      {item.environment.length > 0 ? (
        <p className={css({ margin: "0" })}>環境 {item.environment.join("、")}</p>
      ) : null}
      {item.phases.length > 0 ? (
        <p className={css({ margin: "0" })}>担当工程 {item.phases.join("、")}</p>
      ) : null}
      {item.parallel || item.hard ? (
        <p className={marks}>
          {item.parallel ? <span className={mark}>並行</span> : null}
          {item.hard ? <span className={mark}>難度</span> : null}
        </p>
      ) : null}
    </article>
  );
}

export function Preview({
  sheet: input,
  calculatedOn,
}: {
  sheet: SheetInput;
  calculatedOn: YearMonth;
}) {
  const result = present(input, calculatedOn);
  if (!result.ok) {
    return (
      <section className={sheet} aria-label="プレビュー">
        <p role="status">{result.error}</p>
      </section>
    );
  }
  const view = result.view;
  const updated = view.updatedOn ? formatMonth(view.updatedOn) : "未設定";
  return (
    <section className={sheet} aria-label="プレビュー">
      <header className={block}>
        <p className={css({ margin: "0" })}>更新日 {updated}</p>
        <h2 className={name}>{view.name}</h2>
        <p className={meta}>
          <span>{view.workStyle}</span>
          <span>{view.education}</span>
          <span>{view.station}</span>
          <span>エンジニア経験 {formatDuration(view.engineer)}</span>
        </p>
      </header>
      <section className={block}>
        <h3 className={css({ margin: "0" })}>保有技術</h3>
        {view.skills.length === 0 ? (
          <p className={css({ margin: "0" })}>保有技術はありません</p>
        ) : (
          <ul>
            {view.skills.map((skill) => (
              <li key={skill.name}>
                {skill.name} {formatDuration(skill.duration)}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className={block}>
        <h3 className={css({ margin: "0" })}>自己PR</h3>
        <p className={pr}>{view.selfPr}</p>
      </section>
      <section className={block}>
        <h3 className={css({ margin: "0" })}>直近の職務経歴</h3>
        {view.recent.length === 0 ? <p className={css({ margin: "0" })}>職務経歴はありません</p> : null}
        {view.recent.map((item) => (
          <RecentCareer key={item.id} item={item} />
        ))}
      </section>
      <section className={block}>
        <h3 className={css({ margin: "0" })}>それより前</h3>
        {view.older.length === 0 ? <p className={css({ margin: "0" })}>それより前の経歴はありません</p> : null}
        <ul>
          {view.older.map((item) => (
            <li key={item.id}>
              {formatPeriod(item.period)} {item.projectName}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
