import { Dialog as ArkDialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import type { ReactNode } from "react";
import { dialog } from "styled-system/recipes";
import { Button } from "../Button/index";

export function Dialog({
  open,
  title,
  footer,
  placement = "center",
  children,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  footer?: ReactNode;
  // side は左からせり出し、裏の画面も操作できる（プレビューを見ながら入力するため）。
  placement?: "center" | "side";
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
}) {
  const classes = dialog({ placement });
  const side = placement === "side";
  return (
    <ArkDialog.Root
      open={open}
      lazyMount
      unmountOnExit
      modal={!side}
      trapFocus
      preventScroll={!side}
      closeOnInteractOutside={!side}
      onOpenChange={(details) => onOpenChange(details.open)}
    >
      <Portal>
        <ArkDialog.Backdrop className={classes.backdrop} />
        <ArkDialog.Positioner className={classes.positioner}>
          <ArkDialog.Content className={classes.content}>
            <div className={classes.header}>
              <ArkDialog.Title className={classes.title}>{title}</ArkDialog.Title>
              <ArkDialog.CloseTrigger asChild>
                <Button type="button" variant="text" size="sm">
                  閉じる
                </Button>
              </ArkDialog.CloseTrigger>
            </div>
            <div className={classes.body}>{children}</div>
            {footer ? <div className={classes.footer}>{footer}</div> : null}
          </ArkDialog.Content>
        </ArkDialog.Positioner>
      </Portal>
    </ArkDialog.Root>
  );
}
