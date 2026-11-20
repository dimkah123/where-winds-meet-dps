import { useState, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"
import type { Result, Inputs } from "../../../../engine/types"
import { activeRotationForInputs } from "../../../../engine/activeRotation"
import { builtinSkillsForClass } from "../../../../engine/builtinLibrary"
import { loadCustomSkillsForClass } from "../../../../storage"
import { parseReadableRotation, readableRotationText, type ParsedRotationToken } from "../readableRotation"
import { activeRotationName } from "../rotationOptions"
import { RotationTrainerOverlay } from "./RotationTrainerOverlay"
import { useDocumentPictureInPicture } from "./useDocumentPictureInPicture"

interface Props {
  inputs: Inputs
  result: Result
  rotationName?: string
  children: (openTrainer: () => void, isPipActive: boolean) => React.ReactNode
}

export function RotationTrainerHost({ inputs, result, rotationName, children }: Props) {
  const { pipWindow, isOpen, openPip, closePip } = useDocumentPictureInPicture()
  const [inPageOpen, setInPageOpen] = useState(false)

  // Resolve active rotation
  const activeRotation = useMemo(() => activeRotationForInputs(inputs), [inputs])
  const effectiveName = rotationName ?? activeRotationName(inputs) ?? "Rotation"

  // Assemble skills map
  const skillsById = useMemo(() => {
    const map = new Map()
    for (const s of builtinSkillsForClass(inputs.classId)) map.set(s.id, s)
    for (const s of loadCustomSkillsForClass(inputs.classId)) map.set(s.id, s)
    return map
  }, [inputs.classId])

  // Get readable rotation tokens
  const tokens: ParsedRotationToken[] = useMemo(() => {
    if (!activeRotation) return []
    const rawText = readableRotationText(activeRotation, result, skillsById)
    const parsed = parseReadableRotation(rawText, inputs.classId, skillsById)
    return parsed.tokens.filter((t) => t.valid)
  }, [activeRotation, inputs.classId, result, skillsById])

  const handleOpenTrainer = useCallback(async () => {
    // Try Document Picture-in-Picture first
    const win = await openPip({
      width: 800,
      height: 260,
      title: `WWM Trainer — ${effectiveName}`,
    })

    if (!win) {
      // Fallback: in-page overlay modal
      setInPageOpen(true)
    }
  }, [openPip, effectiveName])

  return (
    <>
      {children(handleOpenTrainer, isOpen || inPageOpen)}

      {/* Render inside Document Picture-in-Picture window */}
      {pipWindow &&
        createPortal(
          <RotationTrainerOverlay
            tokens={tokens}
            casts={result.casts}
            rotationTitle={effectiveName}
            onClose={closePip}
          />,
          pipWindow.document.body,
        )}

      {/* Fallback in-page modal */}
      {inPageOpen && !pipWindow && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "780px",
            height: "250px",
            zIndex: 99999,
            boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <RotationTrainerOverlay
            tokens={tokens}
            casts={result.casts}
            rotationTitle={effectiveName}
            onClose={() => setInPageOpen(false)}
          />
        </div>
      )}
    </>
  )
}
