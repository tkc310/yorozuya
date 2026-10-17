import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { css } from "styled-system/css";
import {
  formatDuration,
  present,
  type Career,
  type Duration,
  type SheetInput,
  type CalendarDate,
} from "@/shared/features/skill-sheet/sheet";
import { QUERY_KEY, callServerFunction } from "@/src/lib/request";
import { Form } from "./Form/index";
import { Preview } from "./Preview/index";

// md 以上ではフォームとプレビューを左右に並べ、それぞれを別々にスクロールする。
export const sheetColumns = css({
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

const formColumn = css({
  borderColor: "border.divider",
  borderRightWidth: { md: "1px" },
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

export function SkillSheet() {
  const queryClient = useQueryClient();
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
  const [message, setMessage] = useState<string | null>(null);
  const [calculatedOn] = useState(today);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY.SKILL_SHEET });
    setPreview(null);
    setGeneration((current) => current + 1);
  };

  const saveProfile = useMutation({
    mutationFn: async (value: SheetInput) => {
      const { updateProfileFn } =
        await import("@/src/server/features/skill-sheet/commands/update-profile");
      return callServerFunction(
        updateProfileFn({
          data: {
            updatedOn: value.updatedOn,
            updatedAuto: value.updatedAuto,
            name: value.name,
            age: value.age,
            gender: value.gender,
            experience: value.experience,
            experienceAuto: value.experienceAuto,
            visibility: value.visibility,
            education: value.education,
            station: value.station,
            selfPr: value.selfPr,
            desiredHours: value.desiredHours,
            desiredEmployment: value.desiredEmployment,
            affiliation: value.affiliation,
            strongSkills: value.strongSkills,
            strongWork: value.strongWork,
            links: value.links,
          },
        }),
      );
    },
    onSuccess: async () => {
      setMessage(null);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY.SKILL_SHEET });
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const addSkillMutation = useMutation({
    mutationFn: async (input: {
      groupName: string;
      skillName: string;
      experience: Duration | null;
    }) => {
      const { addSkillFn } = await import("@/src/server/features/skill-sheet/commands/add-skill");
      return callServerFunction(addSkillFn({ data: input }));
    },
    onSuccess: async () => {
      setMessage(null);
      await refresh();
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const updateSkillExperienceMutation = useMutation({
    mutationFn: async (input: {
      skillName: string;
      experience: Duration | null;
      auto: boolean;
    }) => {
      const { updateSkillExperienceFn } =
        await import("@/src/server/features/skill-sheet/commands/update-skill-experience");
      return callServerFunction(updateSkillExperienceFn({ data: input }));
    },
    onSuccess: async () => {
      setMessage(null);
      await refresh();
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const removeSkillMutation = useMutation({
    mutationFn: async (skillName: string) => {
      const { removeSkillFn } =
        await import("@/src/server/features/skill-sheet/commands/remove-skill");
      return callServerFunction(removeSkillFn({ data: { skillName } }));
    },
    onSuccess: async () => {
      setMessage(null);
      await refresh();
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const addCareerMutation = useMutation({
    mutationFn: async (career: Omit<Career, "id">) => {
      const { addCareerFn } = await import("@/src/server/features/skill-sheet/commands/add-career");
      return callServerFunction(addCareerFn({ data: career }));
    },
    onSuccess: async () => {
      setMessage(null);
      await refresh();
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const updateCareerMutation = useMutation({
    mutationFn: async (input: { careerId: string; career: Omit<Career, "id"> }) => {
      const { updateCareerFn } =
        await import("@/src/server/features/skill-sheet/commands/update-career");
      return callServerFunction(updateCareerFn({ data: input }));
    },
    onSuccess: async () => {
      setMessage(null);
      await refresh();
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const importMutation = useMutation({
    mutationFn: async (file: unknown) => {
      const { importSheetFn } =
        await import("@/src/server/features/skill-sheet/commands/import-sheet");
      return callServerFunction(importSheetFn({ data: { file } }));
    },
    onSuccess: async () => {
      setMessage(null);
      await refresh();
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const removeCareerMutation = useMutation({
    mutationFn: async (careerId: string) => {
      const { removeCareerFn } =
        await import("@/src/server/features/skill-sheet/commands/remove-career");
      return callServerFunction(removeCareerFn({ data: { careerId } }));
    },
    onSuccess: async () => {
      setMessage(null);
      await refresh();
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const pending =
    saveProfile.isPending ||
    addSkillMutation.isPending ||
    updateSkillExperienceMutation.isPending ||
    removeSkillMutation.isPending ||
    addCareerMutation.isPending ||
    updateCareerMutation.isPending ||
    importMutation.isPending ||
    removeCareerMutation.isPending;

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
      <div className={`${column} ${formColumn} sheet-form`}>
        <Form
          key={generation}
          initial={query.data}
          autoExperience={autoExperience}
          today={calculatedOn}
          onValues={setPreview}
          onSaveProfile={(value) => saveProfile.mutate(value)}
          onAddSkill={(groupName, skillName, experience) =>
            addSkillMutation.mutate({ groupName, skillName, experience })
          }
          onUpdateSkillExperience={(skillName, experience, auto) =>
            updateSkillExperienceMutation.mutate({ skillName, experience, auto })
          }
          onRemoveSkill={(skillName) => removeSkillMutation.mutate(skillName)}
          onAddCareer={(career) => addCareerMutation.mutate(career)}
          onUpdateCareer={(careerId, career) => updateCareerMutation.mutate({ careerId, career })}
          onImport={(file) => importMutation.mutate(file)}
          onRemoveCareer={(careerId) => removeCareerMutation.mutate(careerId)}
          message={message}
          pending={pending}
        />
      </div>
      <div className={`${column} ${previewColumn}`}>
        <Preview sheet={shown} calculatedOn={calculatedOn} />
      </div>
    </div>
  );
}
