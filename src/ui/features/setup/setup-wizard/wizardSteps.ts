export type WizardStep = "language" | "class" | "graduation" | "import" | "name"

export function wizardSteps(
  _graduationBuildCount: number,
  manual: boolean,
  includeLanguage = true,
): WizardStep[] {
  const steps: WizardStep[] = []
  if (includeLanguage) steps.push("language")
  steps.push("class", "import")
  if (manual) steps.push("name")
  return steps
}
