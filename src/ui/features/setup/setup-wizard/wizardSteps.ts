export type WizardStep = "class" | "graduation" | "import" | "name"

export function wizardSteps(_graduationBuildCount: number, manual: boolean): WizardStep[] {
  const steps: WizardStep[] = ["class", "import"]
  if (manual) steps.push("name")
  return steps
}
