import { useCallback, useState } from "react";
import {
  type CalendarDate,
  type Career,
  type SheetInput,
} from "@/src/shared/features/skill-sheet/sheet.schema";
import {
  addCareer,
  addSkill,
  formatDuration,
  present,
  removeCareer,
  removeSkill,
  setSkillFeatured,
  updateCareer,
  updateSkillExperience,
} from "@/src/shared/features/skill-sheet/skill.service";
import sampleText from "@/fixtures/dummy-skill-sheet.json?raw";
import { Form } from "../Form/index";
import { SheetLayout } from "../Layout/index";
import { Preview } from "../Preview/index";

// 製品紹介（GitHub Pages）のスクリーンショットと操作動画に使う、サーバを使わないスキルシート。
// 見本の JSON を読み、保存は手元の状態だけを書き換える。データベースには触れない。

// 撮るたびに経験年数が変わらないよう、基準日を固定する。
export const DEMO_TODAY: CalendarDate = { year: 2026, month: 10, day: 18 };

// 見本の JSON の sheet。読み込みの検査（ImportJsonSchema）を通ることは
// src/server/features/skill-sheet/import-json.schema.test.ts で確かめているので、ここでは検査しない
// （画面のバンドルにサーバ側のモジュールを入れないため）。
type SampleSheet = Omit<SheetInput, "careers"> & {
  careers: (Omit<Career, "id"> & { id?: string })[];
};

export function loadDemoSheet(): SheetInput {
  const { sheet } = JSON.parse(sampleText) as { sheet: SampleSheet };
  return {
    ...sheet,
    careers: sheet.careers.map((career, index) => ({
      ...career,
      id: career.id ?? `career-${index + 1}`,
    })),
  };
}

let created = 0;

function nextId(): string {
  created += 1;
  return `demo-career-${created}`;
}

export function DemoSkillSheet({ initial }: { initial: SheetInput }) {
  const [sheet, setSheet] = useState(initial);
  const [preview, setPreview] = useState<SheetInput | null>(null);
  // 保有技術や経歴の一覧が変わったら、フォームを作り直す（画面の SkillSheet と同じ）。
  const [generation, setGeneration] = useState(0);
  const rebuild = (next: (current: SheetInput) => SheetInput) => {
    setSheet((current) => next(current));
    setPreview(null);
    setGeneration((current) => current + 1);
  };
  const onValues = useCallback((value: SheetInput) => setPreview(value), []);
  const presented = present({ ...sheet, experienceAuto: true }, DEMO_TODAY);
  const autoExperience = presented.ok ? formatDuration(presented.view.engineer) : "";
  const skills = sheet.skillGroups;
  const careers = sheet.careers;
  return (
    <SheetLayout
      form={
        <Form
          key={generation}
          initial={sheet}
          autoExperience={autoExperience}
          today={DEMO_TODAY}
          onValues={onValues}
          onSaveProfile={(value) => setSheet({ ...value, skillGroups: skills, careers })}
          onAddSkill={(groupName, skillName, experience) =>
            rebuild((current) => addSkill(current, groupName, skillName, experience))
          }
          onUpdateSkillExperience={(skillName, experience, auto) =>
            rebuild((current) => updateSkillExperience(current, skillName, experience, auto))
          }
          onUpdateSkillFeatured={(skillName, featured) =>
            rebuild((current) => setSkillFeatured(current, skillName, featured))
          }
          onRemoveSkill={(skillName) => rebuild((current) => removeSkill(current, skillName))}
          onAddCareer={(career) =>
            rebuild((current) => addCareer(current, { ...career, id: nextId() }))
          }
          onUpdateCareer={(careerId, career) =>
            rebuild((current) => updateCareer(current, { ...career, id: careerId }))
          }
          onRemoveCareer={(careerId) => rebuild((current) => removeCareer(current, careerId))}
          onImport={() => undefined}
        />
      }
      preview={<Preview sheet={preview ?? sheet} calculatedOn={DEMO_TODAY} />}
    />
  );
}
