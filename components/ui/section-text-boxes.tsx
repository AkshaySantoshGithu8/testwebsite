"use client"

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { useEditor } from "@/components/editor-context"

export function SectionTextBoxes({ sectionId }: { sectionId: string }) {
  const { editorAuthenticated, sectionTextBoxes, updateSectionTextBox, removeSectionTextBox } = useEditor()
  const boxes = sectionTextBoxes[sectionId] ?? []
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragStart = useRef({ x: 0, y: 0 })
  const originalPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!draggingId || !editorAuthenticated) return

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      event.preventDefault()
      const dx = event.clientX - dragStart.current.x
      const dy = event.clientY - dragStart.current.y
      dragStart.current = { x: event.clientX, y: event.clientY }
      originalPos.current = {
        x: originalPos.current.x + dx,
        y: originalPos.current.y + dy,
      }
      updateSectionTextBox(sectionId, draggingId, {
        x: originalPos.current.x,
        y: originalPos.current.y,
      })
    }

    const handlePointerUp = () => setDraggingId(null)

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [draggingId, editorAuthenticated, sectionId, updateSectionTextBox])

  const startDrag = (id: string, event: React.PointerEvent<HTMLButtonElement>) => {
    if (!editorAuthenticated) return
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = { x: event.clientX, y: event.clientY }
    const box = boxes.find((box) => box.id === id)
    if (box) originalPos.current = { x: box.x, y: box.y }
    setDraggingId(id)
  }

  if (boxes.length === 0) {
    return null
  }

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {boxes.map((box) => (
        <div
          key={box.id}
          className="absolute pointer-events-auto overflow-hidden rounded-3xl border border-white/15 bg-background/90 shadow-2xl backdrop-blur-xl"
          style={{
            left: box.x,
            top: box.y,
            width: box.width,
            height: box.height,
            touchAction: "none",
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-black/40 px-3 py-2 text-xs text-white/80">
            <span>Text box</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onPointerDown={(event) => startDrag(box.id, event)}
                className="rounded-lg bg-white/10 px-2 py-1 text-[11px] text-white hover:bg-white/20 transition"
              >
                Drag
              </button>
              <button
                type="button"
                onClick={() => removeSectionTextBox(sectionId, box.id)}
                className="rounded-lg bg-red-500/10 px-2 py-1 text-[11px] text-red-200 hover:bg-red-500/20 transition"
              >
                Remove
              </button>
            </div>
          </div>

          <div
            contentEditable={editorAuthenticated}
            suppressContentEditableWarning
            className="h-[calc(100%-40px)] overflow-auto whitespace-pre-wrap break-words px-4 py-3 text-sm text-foreground focus:outline-none"
            onBlur={(event) => updateSectionTextBox(sectionId, box.id, { html: event.currentTarget.innerHTML })}
            dangerouslySetInnerHTML={{ __html: box.html }}
          />
        </div>
      ))}
    </div>
  )
}
