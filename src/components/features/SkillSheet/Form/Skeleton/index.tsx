import { css } from "styled-system/css";
import { Skeleton } from "@/src/components/ui/Skeleton/index";

const stack = css({
  display: "grid",
  gap: "6",
});

const row = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "2",
});

const grid = css({
  display: "grid",
  gap: "4",
  gridTemplateColumns: { base: "1fr", md: "2fr 1fr 1fr" },
});

const field = css({
  display: "grid",
  gap: "2",
});

function FieldSkeleton() {
  return (
    <div className={field}>
      <Skeleton width="5em" height="1.25em" />
      <Skeleton height="40px" radius="8px" />
    </div>
  );
}

// 入力欄の並びに似せた、読み込み中のフォーム。
export function FormSkeleton() {
  return (
    <div className={stack}>
      <Skeleton width="8em" height="2.25rem" />
      <div className={row}>
        <Skeleton width="80px" height="36px" radius="6px" />
        <Skeleton width="140px" height="36px" radius="6px" />
        <Skeleton width="140px" height="36px" radius="6px" />
      </div>
      <Skeleton width="6em" height="1.5em" />
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className={grid}>
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
      ))}
      <Skeleton width="6em" height="1.5em" />
      <Skeleton height="120px" radius="8px" />
    </div>
  );
}
