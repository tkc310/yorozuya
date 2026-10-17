import { Dialog as ArkDialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import type { ReactNode } from "react";
import { dialog } from "styled-system/recipes";
import { Button } from "../Button/index";

export function Dialog({
  open,
  title,
  footer,
  children,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  footer?: ReactNode;
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
}) {
  const classes = dialog();
  return (
    <ArkDialog.Root
      open={open}
      lazyMount
      unmountOnExit
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
