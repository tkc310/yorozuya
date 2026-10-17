import { Portal } from "@ark-ui/react/portal";
import { Tooltip } from "@ark-ui/react/tooltip";
import { css, cx } from "styled-system/css";

const text = css({
  display: "block",
  minWidth: "0",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const content = css({
  background: "solidGray.900",
  borderRadius: "6",
  boxShadow: "2",
  color: "white",
  maxWidth: "24rem",
  overflowWrap: "anywhere",
  px: "2",
  py: "1",
  textStyle: "std-14N-170",
  zIndex: "200",
});

// 1 行に収め、はみ出す分は … で省略する。マウスを乗せると、すぐに全文をツールチップで出す。
// 文字は画面上で省略するだけなので、読み上げでは全文が読まれる。
export function Truncate({ children, className }: { children: string; className?: string }) {
  return (
    <Tooltip.Root
      lazyMount
      unmountOnExit
      openDelay={100}
      closeDelay={0}
      positioning={{ placement: "top-start" }}
    >
      <Tooltip.Trigger asChild>
        <span className={cx(text, className)}>{children}</span>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content className={content}>{children}</Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
