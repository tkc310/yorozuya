import { css, cx } from "styled-system/css";

// 案件や技術に付けるタグ。記号ではなく文字で意味を示し、注釈にも同じタグを置く。
const BADGES = {
  pickup: {
    label: "ピックアップ",
    className: css({ background: "#fff8e1", borderColor: "#d4a017", color: "#8a5a00" }),
  },
  main: {
    label: "主要",
    className: css({ background: "#eef3f8", borderColor: "#7b9cc0", color: "#1f3a5f" }),
  },
} as const;

export type BadgeKind = keyof typeof BADGES;

// 注釈に書く意味。タグを足したら型検査で注釈の書き漏れに気づけるよう Record にする。
export const BADGE_MEANING: Record<BadgeKind, string> = {
  pickup: "は特にスキルアップできた案件",
  main: "は主要スキル",
};

const badge = css({
  borderRadius: "0.6mm",
  borderStyle: "solid",
  borderWidth: "0.5pt",
  display: "inline-block",
  fontSize: "7pt",
  fontWeight: "bold",
  lineHeight: "1.3",
  ml: "1.5mm",
  px: "1.2mm",
  verticalAlign: "0.3mm",
  whiteSpace: "nowrap",
});

const inNote = css({ mx: "0.5mm" });

export function Badge({ kind, note }: { kind: BadgeKind; note?: boolean }) {
  const item = BADGES[kind];
  return <span className={cx(badge, item.className, note ? inNote : undefined)}>{item.label}</span>;
}

// 見出しの横の注釈。「[タグ] は〜」の形にする。
export function BadgeNote({ kind }: { kind: BadgeKind }) {
  return (
    <span>
      <Badge kind={kind} note />
      {BADGE_MEANING[kind]}
    </span>
  );
}
