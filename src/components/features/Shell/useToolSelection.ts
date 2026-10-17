import { create } from "zustand";

type ToolSelection = {
  toolId: string;
  selectTool: (toolId: string) => void;
};

export const useToolSelection = create<ToolSelection>((set) => ({
  toolId: "skill-sheet",
  selectTool: (toolId) => set({ toolId }),
}));
