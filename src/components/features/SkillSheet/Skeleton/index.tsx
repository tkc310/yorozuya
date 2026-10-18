import type { ReactNode } from "react";
import { css } from "styled-system/css";
import { FormSkeleton } from "../Form/Skeleton/index";
import { SheetLayout } from "../Layout/index";
import { PreviewSkeleton } from "../Preview/Skeleton/index";

const hidden = css({ srOnly: true });

// シートを読み込むあいだに出す画面。
export function SkillSheetSkeleton({ breadcrumb }: { breadcrumb?: ReactNode }) {
  return (
    <>
      <p role="status" className={hidden}>
        シートを読み込んでいます
      </p>
      <SheetLayout breadcrumb={breadcrumb} form={<FormSkeleton />} preview={<PreviewSkeleton />} />
    </>
  );
}
