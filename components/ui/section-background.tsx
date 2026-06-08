"use client"

import { ReactNode } from "react"
import { useEditor } from "@/components/editor-context"
import { SectionTextBoxes } from "@/components/ui/section-text-boxes"

export function SectionBackground({
  sectionId,
  children,
}: {
  sectionId: string
  children: ReactNode
}) {
  const { sectionBackgrounds } = useEditor()
  const backgroundUrl = sectionBackgrounds[sectionId]

  return (
    <div className="relative">
      {backgroundUrl && (
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${backgroundUrl}')` }} />
      )}
      {backgroundUrl && <div className="absolute inset-0 z-10 bg-black/20 pointer-events-none" />}
      <div className="relative z-20">
        {children}
        <SectionTextBoxes sectionId={sectionId} />
      </div>
    </div>
  )
}
