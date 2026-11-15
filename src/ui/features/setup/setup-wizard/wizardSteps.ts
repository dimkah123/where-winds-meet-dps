export type WizardStep = "language" | "class" | "graduation" | "import" | "name"

export function wizardSteps(_graduationBuildCount: number, manual: boolean): WizardStep[] {
  const steps: WizardStep[] = ["language", "class", "import"]
  if (manual) steps.push("name")
  return steps
}
