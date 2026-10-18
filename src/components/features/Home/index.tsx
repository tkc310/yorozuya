import { Link } from "@tanstack/react-router";
import { css } from "styled-system/css";
import { button } from "styled-system/recipes";

const page = css({
  display: "grid",
  gap: { base: "8", md: "16" },
  margin: "0 auto",
  maxWidth: "60rem",
  px: { base: "4", md: "8" },
  py: { base: "8", md: "16" },
});

const hero = css({
  display: "grid",
  gap: "4",
});

const title = css({
  margin: "0",
  textStyle: { base: "std-28B-150", md: "std-45B-140" },
});

const lead = css({
  color: "fg.sub",
  margin: "0",
  textStyle: { base: "std-16N-170", md: "std-17N-170" },
});

const section = css({
  display: "grid",
  gap: "4",
});

const sectionTitle = css({
  margin: "0",
  textStyle: { base: "std-20B-150", md: "std-24B-150" },
});

const toolList = css({
  display: "grid",
  gap: "4",
  listStyle: "none",
  margin: "0",
  p: "0",
});

const card = css({
  background: "bg.canvas",
  borderColor: "border.divider",
  borderRadius: "12",
  borderWidth: "1px",
  display: "grid",
  gap: "4",
  p: { base: "4", md: "8" },
});

const cardTitle = css({
  margin: "0",
  textStyle: "std-20B-150",
});

const body = css({
  margin: "0",
});

const points = css({
  display: "grid",
  gap: "1",
  listStyle: "disc",
  margin: "0",
  pl: "6",
  textStyle: "std-16N-170",
});

const cardAction = css({
  justifySelf: "start",
});

type Tool = {
  name: string;
  to: "/skill-sheet";
  summary: string;
  points: string[];
  action: string;
};

// 機能を足すときは、ここに 1 件足してルートを作る。
const tools: Tool[] = [
  {
    name: "スキルシート",
    to: "/skill-sheet",
    summary:
      "案件への応募や営業に使うスキルシートを作ります。プロフィール・保有技術・職務経歴を入力すると、A4 の印刷向けレイアウトでそのままプレビューできます。",
    points: [
      "入力した内容は、その場で右側のプレビューに反映されます",
      "エンジニア歴や技術ごとの経験年数は、職務経歴から自動で計算できます",
      "年齢や性別、最寄り駅など、項目ごとに載せる・載せないを切り替えられます",
      "印刷するか、印刷画面から PDF として保存できます",
      "内容を JSON で書き出しておけば、バックアップや別の端末への移行に使えます",
    ],
    action: "スキルシートを開く",
  },
];

export function Home() {
  return (
    <div className={page}>
      <section className={hero} aria-labelledby="home-title">
        <h1 id="home-title" className={title}>
          よろずや
        </h1>
        <p className={lead}>
          フリーランスとして働く人のための、小さな道具をひとつにまとめたアプリです。書類づくりなど、仕事のまわりの細かな手間を手元で片づけられます。
        </p>
      </section>

      <section className={section} aria-labelledby="home-tools">
        <h2 id="home-tools" className={sectionTitle}>
          使える機能
        </h2>
        <ul className={toolList}>
          {tools.map((tool) => (
            <li key={tool.to} className={card}>
              <h3 className={cardTitle}>{tool.name}</h3>
              <p className={body}>{tool.summary}</p>
              <ul className={points}>
                {tool.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Link to={tool.to} className={`${button()} ${cardAction}`}>
                {tool.action}
              </Link>
            </li>
          ))}
        </ul>
        <p className={body}>ほかの機能も、これから順に追加していきます。</p>
      </section>

      <section className={section} aria-labelledby="home-data">
        <h2 id="home-data" className={sectionTitle}>
          データの保存について
        </h2>
        <p className={body}>
          入力した内容は、お使いのパソコンの中にあるファイルにだけ保存されます。インターネット上のサーバに送られることはありません。パソコンの入れ替えや万一に備えて、各機能の書き出しでときどき控えを取っておくと安心です。
        </p>
      </section>
    </div>
  );
}
