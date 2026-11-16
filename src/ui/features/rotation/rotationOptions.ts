import type { Inputs } from "../../../engine/types"
import type { Rotation } from "../../../engine/rotation"
import { builtinRotationsForClass, defaultRotationForClass } from "../../../engine/builtinLibrary"
import { usesCustomRotation } from "../../../engine/activeRotation"

export { usesCustomRotation }

export const NO_ROTATION_OPTION_ID = ""

export type RotationOptionGroup = "builtin" | "custom"

export interface RotationOption {
  id: string
  name: string
  description?: string
  group: RotationOptionGroup
  category?: string
  isClassDefault: boolean
  rotation: Rotation
}

export function rotationOptionSectionLabel(
  option: RotationOption | undefined,
  t: (key: string, fallback?: string) => string,
): string {
  if (!option) return ""
  if (option.group === "builtin") {
    if (option.category) {
      return t(`rotation.category.${option.category}`, option.category)
    }
    return t("common.builtInRotations")
  }
  return t("common.customRotation")
}

export function rotationOptions(classId: string, savedRotations: Rotation[]): RotationOption[] {
  const classDefault = defaultRotationForClass(classId)
  const defaultCategory = classDefault?.category
  const builtins = builtinRotationsForClass(classId)
    .map<RotationOption>((rotation) => ({
      id: rotation.id,
      name: rotation.name,
      description: rotation.description,
      group: "builtin",
      category: rotation.category,
      isClassDefault: rotation.id === classDefault?.id,
      rotation,
    }))
    .sort((a, b) => {
      if (a.category && b.category && a.category !== b.category) {
        if (a.category === defaultCategory) return -1
        if (b.category === defaultCategory) return 1
        return a.category.localeCompare(b.category)
      }
      if (a.isClassDefault && !b.isClassDefault) return -1
      if (!a.isClassDefault && b.isClassDefault) return 1
      return 0
    })
  const customs = savedRotations
    .filter((rotation) => rotation.classId === classId)
    .map<RotationOption>((rotation) => ({
      id: rotation.id,
      name: rotation.name,
      description: rotation.description,
      group: "custom",
      category: rotation.category,
      isClassDefault: false,
      rotation,
    }))
  return [...builtins, ...customs]
}

export function selectedRotationOptionId(inputs: Inputs): string {
  if (usesCustomRotation(inputs)) return inputs.activeCustomRotation!.id
  if (inputs.selectedBuiltinRotationId) return inputs.selectedBuiltinRotationId
  return defaultRotationForClass(inputs.classId)?.id ?? NO_ROTATION_OPTION_ID
}

export function activeRotationName(inputs: Inputs): string | null {
  if (usesCustomRotation(inputs)) return inputs.activeCustomRotation!.name
  const selectedBuiltin = builtinRotationsForClass(inputs.classId).find(
    (rotation) => rotation.id === inputs.selectedBuiltinRotationId,
  )
  if (selectedBuiltin) return selectedBuiltin.name
  return defaultRotationForClass(inputs.classId)?.name ?? null
}

export function inputsWithRotationOption(inputs: Inputs, option: RotationOption): Inputs {
  if (option.group === "builtin") {
    return { ...inputs, activeCustomRotation: null, selectedBuiltinRotationId: option.id }
  }
  return {
    ...inputs,
    activeCustomRotation: option.rotation,
    selectedBuiltinRotationId: null,
  }
}
