import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { css } from "styled-system/css";
import type { Career, SheetInput, YearMonth } from "@/shared/features/skill-sheet/sheet";
import { QUERY_KEY, callServerFunction } from "@/src/lib/request";
import { Form } from "./Form/index";
import { Preview } from "./Preview/index";

export const sheetColumns = css({
  display: "grid",
  gap: "6",
  gridTemplateColumns: { base: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" },
  p: "6",
});

function currentMonth(): YearMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
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
  const [calculatedOn] = useState(currentMonth);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY.SKILL_SHEET });
    setPreview(null);
    setGeneration((current) => current + 1);
  };

  const saveProfile = useMutation({
    mutationFn: async (value: SheetInput) => {
      const { updateProfileFn } = await import("@/src/server/features/skill-sheet/commands/update-profile");
      return callServerFunction(
        updateProfileFn({
          data: {
            updatedOn: value.updatedOn,
            name: value.name,
            workStyle: value.workStyle,
            education: value.education,
            station: value.station,
            selfPr: value.selfPr,
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
    mutationFn: async (input: { groupName: string; skillName: string }) => {
      const { addSkillFn } = await import("@/src/server/features/skill-sheet/commands/add-skill");
      return callServerFunction(addSkillFn({ data: input }));
    },
    onSuccess: async () => {
      setMessage(null);
      await refresh();
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const removeSkillMutation = useMutation({
    mutationFn: async (skillName: string) => {
      const { removeSkillFn } = await import("@/src/server/features/skill-sheet/commands/remove-skill");
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
  const removeCareerMutation = useMutation({
    mutationFn: async (careerId: string) => {
      const { removeCareerFn } = await import("@/src/server/features/skill-sheet/commands/remove-career");
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
    removeSkillMutation.isPending ||
    addCareerMutation.isPending ||
    removeCareerMutation.isPending;

  if (query.isPending) {
    return <p>シートを読み込んでいます</p>;
  }
  if (query.isError) {
    return <p role="alert">{query.error.message}</p>;
  }

  const shown = preview ?? query.data;
  return (
    <div className={sheetColumns}>
      <div className="sheet-form">
        <Form
          key={generation}
          initial={query.data}
          onValues={setPreview}
          onSaveProfile={(value) => saveProfile.mutate(value)}
          onAddSkill={(groupName, skillName) => addSkillMutation.mutate({ groupName, skillName })}
          onRemoveSkill={(skillName) => removeSkillMutation.mutate(skillName)}
          onAddCareer={(career) => addCareerMutation.mutate(career)}
          onRemoveCareer={(careerId) => removeCareerMutation.mutate(careerId)}
          message={message}
          pending={pending}
        />
      </div>
      <Preview sheet={shown} calculatedOn={calculatedOn} />
    </div>
  );
}
