import { useEffect, useState } from "react";
import { css } from "styled-system/css";
import {
  orderCareers,
  type CalendarDate,
  type Career,
  type SheetInput,
} from "@/shared/features/skill-sheet/sheet";
import { Button } from "@/src/components/ui/Button/index";
import { Truncate } from "@/src/components/ui/Truncate/index";
import { CareerDialog } from "../CareerDialog/index";
import { ItemActions } from "../ItemActions/index";
import { itemLabel, items, listItem } from "../styles";

type CareerWrite = Omit<Career, "id">;

const careerNo = css({
  color: "fg.sub",
  display: "inline-block",
  fontVariantNumeric: "tabular-nums",
  flexShrink: "0",
  mr: "2",
  minWidth: "1.75em",
  textAlign: "right",
});

export type CareerSectionProps = {
  sheet: SheetInput;
  today: CalendarDate;
  pending?: boolean;
  onAddCareer: (career: CareerWrite) => void;
  onUpdateCareer: (careerId: string, career: CareerWrite) => void;
  onRemoveCareer: (careerId: string) => void;
  // モーダルで入力中の内容を反映した経歴の一覧。閉じたら null。保存前でもプレビューに映すために使う。
  onPreviewCareers: (careers: Career[] | null) => void;
};

// 職務経歴の一覧（プレビューと同じ並びと番号）と、追加・編集のサイドモーダル。
export function CareerSection({
  sheet,
  today,
  pending,
  onAddCareer,
  onUpdateCareer,
  onRemoveCareer,
  onPreviewCareers,
}: CareerSectionProps) {
  // 編集中の経歴の id。"new" なら追加、null なら閉じている。
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<CareerWrite | null>(null);
  const editingCareer =
    editing && editing !== "new"
      ? (sheet.careers.find((career) => career.id === editing) ?? null)
      : null;

  useEffect(() => {
    if (editing === null || !draft) {
      onPreviewCareers(null);
      return;
    }
    onPreviewCareers(
      editing === "new"
        ? [...sheet.careers, { ...draft, id: "draft" }]
        : sheet.careers.map((item) => (item.id === editing ? { ...draft, id: editing } : item)),
    );
  }, [onPreviewCareers, sheet.careers, editing, draft]);

  return (
    <>
      <ul className={items}>
        {orderCareers(sheet, today).map((career, index) => (
          <li key={career.id} className={listItem}>
            <span className={itemLabel}>
              <span className={careerNo}>{index + 1}.</span>
              <Truncate>{career.projectName}</Truncate>
            </span>
            <ItemActions
              name={career.projectName}
              pending={pending}
              onEdit={() => setEditing(career.id)}
              onRemove={() => onRemoveCareer(career.id)}
            />
          </li>
        ))}
      </ul>
      <div>
        <Button type="button" disabled={pending} onClick={() => setEditing("new")}>
          経歴を追加
        </Button>
      </div>
      <CareerDialog
        open={editing !== null}
        career={editingCareer}
        onDraftChange={setDraft}
        pending={pending}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
        }}
        onSubmit={(career) => {
          if (editingCareer) {
            onUpdateCareer(editingCareer.id, career);
          } else {
            onAddCareer(career);
          }
          setEditing(null);
        }}
      />
    </>
  );
}
