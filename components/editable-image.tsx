"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor } from "./editor-context"

interface EditableImageProps {
  id: string
  src?: string
  alt?: string
  className?: string
  style?: React.CSSProperties
}

export function EditableImage({ id, src: initialSrc, alt = "", className = "", style = {} }: EditableImageProps) {
  const { editorAuthenticated } = useEditor()
  const [src, setSrc] = useState(initialSrc || "")
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ width: 300, height: 200 })
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef({ x: 0, y: 0 })

  // Load saved image state
  useEffect(() => {
    const savedSrc = window.localStorage.getItem(`editable-image-src-${id}`)
    const savedPosition = window.localStorage.getItem(`editable-image-pos-${id}`)
    const savedSize = window.localStorage.getItem(`editable-image-size-${id}`)

    if (savedSrc) setSrc(savedSrc)
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition))
      } catch {}
    }
    if (savedSize) {
      try {
        setSize(JSON.parse(savedSize))
      } catch {}
    }
  }, [id])

  // Persist image position and size
  useEffect(() => {
    window.localStorage.setItem(`editable-image-pos-${id}`, JSON.stringify(position))
  }, [position, id])

  useEffect(() => {
    window.localStorage.setItem(`editable-image-size-${id}`, JSON.stringify(size))
  }, [size, id])

  useEffect(() => {
    if (src) {
      window.localStorage.setItem(`editable-image-src-${id}`, src)
    }
  }, [src, id])

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!editorAuthenticated || resizing) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = { x: event.clientX, y: event.clientY }
    setDragging(true)
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (!dragging || !editorAuthenticated) return

    const dx = event.clientX - dragStart.current.x
    const dy = event.clientY - dragStart.current.y
    dragStart.current = { x: event.clientX, y: event.clientY }

    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
  }

  const handlePointerUp = () => {
    setDragging(false)
  }

  useEffect(() => {
    if (!dragging) return

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [dragging, editorAuthenticated])

  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!editorAuthenticated) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = { x: event.clientX, y: event.clientY }
    setResizing(true)
  }

  const handleResizeMove = (event: PointerEvent) => {
    if (!resizing || !editorAuthenticated) return

    const dx = event.clientX - dragStart.current.x
    const dy = event.clientY - dragStart.current.y

    setSize((prev) => ({
      width: Math.max(100, prev.width + dx),
      height: Math.max(100, prev.height + dy),
    }))

    dragStart.current = { x: event.clientX, y: event.clientY }
  }

  const handleResizeUp = () => {
    setResizing(false)
  }

  useEffect(() => {
    if (!resizing) return

    window.addEventListener("pointermove", handleResizeMove)
    window.addEventListener("pointerup", handleResizeUp)

    return () => {
      window.removeEventListener("pointermove", handleResizeMove)
      window.removeEventListener("pointerup", handleResizeUp)
    }
  }, [resizing, editorAuthenticated])

  if (!src && !editorAuthenticated) {
    return null
  }

  return (
    <div
      ref={imageRef}
      className={`${editorAuthenticated ? "border border-dashed border-primary/50" : ""} ${className}`}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: editorAuthenticated && !resizing ? "grab" : editorAuthenticated && resizing ? "nwse-resize" : "default",
        ...style,
      }}
      onPointerDown={handleDragStart}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover rounded-lg"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-secondary rounded-lg flex items-center justify-center text-muted-foreground">
          Click upload in editor to add image
        </div>
      )}

      {editorAuthenticated && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-tl cursor-nwse-resize"
          onPointerDown={handleResizeStart}
        />
      )}
    </div>
  )
}
