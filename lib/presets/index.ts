import { DocumentPreset, PresetId } from "@/types/preset";
import { minimalPreset } from "./minimal";
import { githubPreset } from "./github";
import { academicPreset } from "./academic";
import { technicalPreset } from "./technical";
import { midnightPreset } from "./midnight";
import { editorialPreset } from "./editorial";

export * from "./minimal";
export * from "./github";
export * from "./academic";
export * from "./technical";
export * from "./midnight";
export * from "./editorial";
export * from "./generator";

export const BUILTIN_PRESETS: Record<Exclude<PresetId, "custom">, DocumentPreset> = {
  minimal: minimalPreset,
  github: githubPreset,
  academic: academicPreset,
  technical: technicalPreset,
  midnight: midnightPreset,
  editorial: editorialPreset,
};

export const PRESET_LIST: DocumentPreset[] = [
  minimalPreset,
  githubPreset,
  academicPreset,
  technicalPreset,
  midnightPreset,
  editorialPreset,
];

export function getPresetById(
  id: PresetId,
  customPreset?: DocumentPreset
): DocumentPreset {
  if (id === "custom" && customPreset) {
    return customPreset;
  }
  return BUILTIN_PRESETS[id as Exclude<PresetId, "custom">] || minimalPreset;
}
