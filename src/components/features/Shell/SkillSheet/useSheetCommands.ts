import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Career, Duration, SheetInput } from "@/shared/features/skill-sheet/sheet";
import { QUERY_KEY, callServerFunction } from "@/src/lib/request";

type CareerWrite = Omit<Career, "id">;

// プロフィールの保存に送る値。保有技術と職務経歴はそれぞれのコマンドで保存する。
function profileOf(value: SheetInput) {
  const { skillGroups: _skillGroups, careers: _careers, ...profile } = value;
  return profile;
}

// シートを書き換えるコマンドをまとめる。失敗したらメッセージに出し、成功したら読み直す。
// refresh はフォームを作り直す（保有技術や経歴のように一覧が変わるとき）。
export function useSheetCommands({ onRefresh }: { onRefresh: () => void }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

  function useCommand<T>(run: (input: T) => Promise<unknown>, rebuild: boolean) {
    return useMutation({
      mutationFn: run,
      onSuccess: async () => {
        setMessage(null);
        await queryClient.invalidateQueries({ queryKey: QUERY_KEY.SKILL_SHEET });
        if (rebuild) {
          onRefresh();
        }
      },
      onError: (error: Error) => setMessage(error.message),
    });
  }

  const saveProfile = useCommand(async (value: SheetInput) => {
    const { updateProfileFn } =
      await import("@/src/server/features/skill-sheet/commands/update-profile");
    return callServerFunction(updateProfileFn({ data: profileOf(value) }));
  }, false);
  const addSkill = useCommand(
    async (input: { groupName: string; skillName: string; experience: Duration | null }) => {
      const { addSkillFn } = await import("@/src/server/features/skill-sheet/commands/add-skill");
      return callServerFunction(addSkillFn({ data: input }));
    },
    true,
  );
  const updateSkillExperience = useCommand(
    async (input: { skillName: string; experience: Duration | null; auto: boolean }) => {
      const { updateSkillExperienceFn } =
        await import("@/src/server/features/skill-sheet/commands/update-skill-experience");
      return callServerFunction(updateSkillExperienceFn({ data: input }));
    },
    true,
  );
  const removeSkill = useCommand(async (skillName: string) => {
    const { removeSkillFn } =
      await import("@/src/server/features/skill-sheet/commands/remove-skill");
    return callServerFunction(removeSkillFn({ data: { skillName } }));
  }, true);
  const addCareer = useCommand(async (career: CareerWrite) => {
    const { addCareerFn } = await import("@/src/server/features/skill-sheet/commands/add-career");
    return callServerFunction(addCareerFn({ data: career }));
  }, true);
  const updateCareer = useCommand(async (input: { careerId: string; career: CareerWrite }) => {
    const { updateCareerFn } =
      await import("@/src/server/features/skill-sheet/commands/update-career");
    return callServerFunction(updateCareerFn({ data: input }));
  }, true);
  const removeCareer = useCommand(async (careerId: string) => {
    const { removeCareerFn } =
      await import("@/src/server/features/skill-sheet/commands/remove-career");
    return callServerFunction(removeCareerFn({ data: { careerId } }));
  }, true);
  const importSheet = useCommand(async (file: unknown) => {
    const { importSheetFn } =
      await import("@/src/server/features/skill-sheet/commands/import-sheet");
    return callServerFunction(importSheetFn({ data: { file } }));
  }, true);

  const all = [
    saveProfile,
    addSkill,
    updateSkillExperience,
    removeSkill,
    addCareer,
    updateCareer,
    removeCareer,
    importSheet,
  ];
  return {
    message,
    pending: all.some((command) => command.isPending),
    saveProfile: saveProfile.mutate,
    addSkill: addSkill.mutate,
    updateSkillExperience: updateSkillExperience.mutate,
    removeSkill: removeSkill.mutate,
    addCareer: addCareer.mutate,
    updateCareer: updateCareer.mutate,
    removeCareer: removeCareer.mutate,
    importSheet: importSheet.mutate,
  };
}
