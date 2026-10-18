import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { css } from "styled-system/css";
import {
  formatDuration,
  present,
  type SheetInput,
  type CalendarDate,
} from "@/shared/features/skill-sheet/sheet";
import { QUERY_KEY, callServerFunction } from "@/src/lib/request";
import { Form } from "./Form/index";
import { Preview } from "./Preview/index";
import { useSheetCommands } from "./useSheetCommands";

// md 以上ではフォームとプレビューを左右に並べ、それぞれを別々にスクロールする。
const sheetColumns = css({
  display: "grid",
  gridTemplateColumns: { base: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr)" },
  height: { md: "100%" },
  _print: { display: "block", height: "auto" },
});

const column = css({
  minHeight: "0",
  overflowY: { md: "auto" },
  p: { base: "4", md: "8" },
  _print: { overflow: "visible", p: "0" },
});

// 印刷ではプレビューだけを出す。
const formColumn = css({
  borderColor: "border.divider",
  borderRightWidth: { md: "1px" },
  _print: { display: "none" },
});

// パンくずリストはフォームと一緒にスクロールさせる。
const crumbs = css({
  mb: { base: "4", md: "6" },
});

const previewColumn = css({
  background: { md: "bg.subtle" },
  _print: { background: "transparent" },
});

const status = css({
  margin: "0",
  p: { base: "4", md: "8" },
});

function today(): CalendarDate {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

// breadcrumb はルートから渡す。ここではルーターに依存しない。
export function SkillSheet({ breadcrumb }: { breadcrumb?: ReactNode }) {
  const query = useQuery({
    queryKey: QUERY_KEY.SKILL_SHEET,
    queryFn: async () => {
      const { getSheetFn } = await import("@/src/server/features/skill-sheet/queries/get-sheet");
      return callServerFunction(getSheetFn());
    },
    retry: false,
  });
  const [preview, setPreview] = useState<SheetInput | null>(null);
  const [generation, setGeneration] = useState(0);
  const [calculatedOn] = useState(today);
  const commands = useSheetCommands({
    onRefresh: () => {
      setPreview(null);
      setGeneration((current) => current + 1);
    },
  });

  if (query.isPending) {
    return <p className={status}>シートを読み込んでいます</p>;
  }
  if (query.isError) {
    return (
      <p role="alert" className={status}>
        {query.error.message}
      </p>
    );
  }

  const shown = preview ?? query.data;
  const presented = present({ ...shown, experienceAuto: true }, calculatedOn);
  const autoExperience = presented.ok ? formatDuration(presented.view.engineer) : "";
  return (
    <div className={sheetColumns}>
      <div className={`${column} ${formColumn}`}>
        {breadcrumb ? <div className={crumbs}>{breadcrumb}</div> : null}
        <Form
          key={generation}
          initial={query.data}
          autoExperience={autoExperience}
          today={calculatedOn}
          onValues={setPreview}
          onSaveProfile={commands.saveProfile}
          onAddSkill={(groupName, skillName, experience) =>
            commands.addSkill({ groupName, skillName, experience })
          }
          onUpdateSkillExperience={(skillName, experience, auto) =>
            commands.updateSkillExperience({ skillName, experience, auto })
          }
          onRemoveSkill={commands.removeSkill}
          onAddCareer={commands.addCareer}
          onUpdateCareer={(careerId, career) => commands.updateCareer({ careerId, career })}
          onRemoveCareer={commands.removeCareer}
          onImport={commands.importSheet}
          message={commands.message}
          pending={commands.pending}
        />
      </div>
      <div className={`${column} ${previewColumn}`}>
        <Preview sheet={shown} calculatedOn={calculatedOn} />
      </div>
    </div>
  );
}
