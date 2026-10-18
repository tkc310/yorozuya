import { css } from "styled-system/css";
import { Skeleton } from "@/src/components/ui/Skeleton/index";

// A4 の比率のまま、列の幅に合わせて縮む用紙。
const paper = css({
  aspectRatio: "210 / 297",
  background: "white",
  boxShadow: "1",
  display: "flex",
  flexDirection: "column",
  gap: "4",
  maxWidth: "210mm",
  mx: "auto",
  px: "6%",
  py: "5%",
  width: "100%",
});

const facts = css({
  display: "grid",
  gap: "3",
  gridTemplateColumns: "repeat(3, 1fr)",
});

const lines = css({
  display: "grid",
  gap: "2",
});

// 用紙の上に見出しと表の形だけを並べた、準備中のプレビュー。
export function PreviewSkeleton() {
  return (
    <div className={paper}>
      <Skeleton width="40%" height="1.75em" />
      <Skeleton width="20%" />
      <div className={facts}>
        {Array.from({ length: 9 }, (_, index) => (
          <Skeleton key={index} height="2.25em" />
        ))}
      </div>
      <Skeleton width="20%" />
      <Skeleton height="22%" />
      <div className={lines}>
        <Skeleton width="20%" />
        <Skeleton />
        <Skeleton width="95%" />
        <Skeleton width="70%" />
      </div>
    </div>
  );
}
