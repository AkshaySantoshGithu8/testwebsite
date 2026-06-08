"use client"

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { useEditor } from "@/components/editor-context"

export function PageImagesOverlay() {
  const { pageImages, editorAuthenticated, updatePageImage } = useEditor()
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

      updatePageImage(draggingId, {
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
  }, [draggingId, editorAuthenticated, updatePageImage])

  const startDrag = (id: string, event: ReactPointerEvent<HTMLDivElement>) => {
    if (!editorAuthenticated) return
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = { x: event.clientX, y: event.clientY }
    const target = pageImages.find((image) => image.id === id)
    if (!target) return
    originalPos.current = { x: target.x, y: target.y }
    setDraggingId(id)
  }

  if (pageImages.length === 0) {
    return null
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {pageImages.map((image) => (
        <div
          key={image.id}
          className="pointer-events-auto absolute rounded-3xl shadow-2xl overflow-hidden border border-white/10 bg-white/5"
          style={{
            left: image.x,
            top: image.y,
            width: image.width,
            height: image.height,
            touchAction: "none",
          }}
          onPointerDown={(event) => startDrag(image.id, event)}
        >
          <img
            src={image.src}
            alt="Editable page image"
            className="w-full h-full object-cover"
            draggable={false}
          />
          {editorAuthenticated && (
            <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-[11px] text-white">
              Drag to move
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
