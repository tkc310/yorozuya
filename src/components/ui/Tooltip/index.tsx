import { Portal } from "@ark-ui/react/portal";
import { Tooltip as ArkTooltip } from "@ark-ui/react/tooltip";
import { useState, type ReactNode } from "react";
import { tooltip } from "styled-system/recipes";

// 項目名の横に置く「?」の補足。マウスを乗せる・フォーカスする・押す、のどれでも開く。
export function Tooltip({
  label,
  children,
}: {
  // 読み上げ用の名前（例:「稼働／休みの説明」）。
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const classes = tooltip();
  return (
    <ArkTooltip.Root
      open={open}
      openDelay={150}
      closeDelay={100}
      closeOnPointerDown={false}
      interactive
      positioning={{ placement: "top" }}
      onOpenChange={(details) => setOpen(details.open)}
    >
      <ArkTooltip.Trigger asChild>
        {/* タッチ操作ではマウスを乗せられないので、押しても開く。 */}
        <button
          type="button"
          aria-label={label}
          className={classes.trigger}
          onClick={() => setOpen(true)}
        >
          <span aria-hidden="true">?</span>
        </button>
      </ArkTooltip.Trigger>
      <Portal>
        <ArkTooltip.Positioner>
          <ArkTooltip.Content className={classes.content}>{children}</ArkTooltip.Content>
        </ArkTooltip.Positioner>
      </Portal>
    </ArkTooltip.Root>
  );
}
