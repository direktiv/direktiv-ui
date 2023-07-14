import { Code, Columns, Rows, Workflow } from "lucide-react";
import { FC, SVGProps } from "react";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const availableLayouts = [
  "code",
  "diagram",
  "splitVertically",
  "splitHorizontally",
] as const;

export type LayoutsType = (typeof availableLayouts)[number];

export const layoutIcons: Record<LayoutsType, FC<SVGProps<SVGSVGElement>>> = {
  code: Code,
  diagram: Workflow,
  splitVertically: Columns,
  splitHorizontally: Rows,
};

interface EditorState {
  layout: LayoutsType;
  actions: {
    setLayout: (layout: EditorState["layout"]) => void;
  };
}

const useEditorState = create<EditorState>()(
  persist(
    (set) => ({
      layout: availableLayouts[0],
      actions: {
        setLayout: (newLayout) => set(() => ({ layout: newLayout })),
      },
    }),
    {
      name: "direktiv-store-editor",
      partialize: (state) => ({
        layout: state.layout, // pick all fields to persistend, and don't persist actions
      }),
    }
  )
);

export const useEditorLayout = () => useEditorState((state) => state.layout);

export const useEditorActions = () => useEditorState((state) => state.actions);
