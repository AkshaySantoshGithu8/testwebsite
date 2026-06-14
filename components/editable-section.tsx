"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor } from "./editor-context"
import { useCommittedContent } from "./committed-content-context"

interface EditableSectionProps {
  id: string
  version?: string
  className?: string
  style?: React.CSSProperties
  display?: "block" | "inline" | "inline-block" | "contents"
  children: React.ReactNode
}

const FONT_OPTIONS = [
  { label: "Default", value: "inherit" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Mono", value: "ui-monospace, monospace" },
  { label: "System", value: "system-ui, sans-serif" },
]
const FONT_SIZE_OPTIONS = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64]

export function EditableSection({ id, version, className, style, display, children }: EditableSectionProps) {
  const wrapperDisplay = display ?? (style?.display as "block" | "inline" | "inline-block" | "contents" | undefined)
  const effectiveDisplay = wrapperDisplay ?? "block"
  const { editorAuthenticated } = useEditor()
  const committedContent = useCommittedContent()
  const sectionRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const savedRangeRef = useRef<Range | null>(null)
  // Track whether we've seeded the DOM from localStorage already
  const seededRef = useRef(false)
  const appliedCommittedHtmlRef = useRef<string | null>(null)

  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 })
  const [linkMode, setLinkMode] = useState(false)
  const [linkValue, setLinkValue] = useState("")
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [size, setSize] = useState<{ width: number | null; height: number | null }>({ width: null, height: null })
  const resizeStart = useRef({ mx: 0, my: 0, ow: 0, oh: 0, dir: "" })
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })

  // On mount: overwrite innerHTML with saved content if it exists.
  // After this, we never touch innerHTML via React — only via ref.
  useEffect(() => {
    if (!sectionRef.current) return

    const htmlKey = `editable-section-${id}`
    const versionKey = `editable-section-version-${id}`

    // Priority: 1) committed JSON file  2) localStorage  3) default JSX children
    const committedHtml = committedContent[htmlKey]
    if (committedHtml && appliedCommittedHtmlRef.current !== committedHtml) {
      sectionRef.current.innerHTML = committedHtml
      window.localStorage.setItem(htmlKey, committedHtml)
      appliedCommittedHtmlRef.current = committedHtml
      seededRef.current = true
    } else if (!seededRef.current) {
      seededRef.current = true
      const savedVersion = window.localStorage.getItem(versionKey)

      if (version && savedVersion !== version) {
        window.localStorage.removeItem(htmlKey)
        window.localStorage.setItem(versionKey, version)
      } else {
        const saved = window.localStorage.getItem(htmlKey)
        if (saved) sectionRef.current.innerHTML = saved
      }
    }

    const pos = committedContent[`editable-section-pos-${id}`] ?? window.localStorage.getItem(`editable-section-pos-${id}`)
    if (pos) { try { setOffset(JSON.parse(pos)) } catch {} }

    const sz = committedContent[`editable-section-size-${id}`] ?? window.localStorage.getItem(`editable-section-size-${id}`)
    if (sz) { try { setSize(JSON.parse(sz)) } catch {} }
  }, [id, version, committedContent])

  const deleteSection = () => {
    window.localStorage.removeItem(`editable-section-${id}`)
    window.localStorage.removeItem(`editable-section-pos-${id}`)
    window.localStorage.removeItem(`editable-section-version-${id}`)
    window.localStorage.removeItem(`editable-section-size-${id}`)
    setDeleted(true)
  }

  const saveHtml = () => {
    if (!sectionRef.current) return
    window.localStorage.setItem(`editable-section-${id}`, sectionRef.current.innerHTML)
  }

  const startResize = (e: React.MouseEvent, dir: string) => {
    if (!editorAuthenticated) return
    e.preventDefault()
    e.stopPropagation()
    const el = sectionRef.current
    if (!el) return
    resizeStart.current = {
      mx: e.clientX,
      my: e.clientY,
      ow: el.offsetWidth,
      oh: el.offsetHeight,
      dir,
    }
    const onMove = (ev: MouseEvent) => {
      const dw = ev.clientX - resizeStart.current.mx
      const dh = ev.clientY - resizeStart.current.my
      const next = { ...size }
      if (dir === "se" || dir === "e") next.width = Math.max(120, resizeStart.current.ow + dw)
      if (dir === "se" || dir === "s") next.height = Math.max(40, resizeStart.current.oh + dh)
      setSize(next)
    }
    const onUp = (ev: MouseEvent) => {
      const dw = ev.clientX - resizeStart.current.mx
      const dh = ev.clientY - resizeStart.current.my
      const next = { ...size }
      if (dir === "se" || dir === "e") next.width = Math.max(120, resizeStart.current.ow + dw)
      if (dir === "se" || dir === "s") next.height = Math.max(40, resizeStart.current.oh + dh)
      setSize(next)
      window.localStorage.setItem(`editable-section-size-${id}`, JSON.stringify(next))
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  const restoreSelection = () => {
    if (!savedRangeRef.current) return
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(savedRangeRef.current)
  }

  const startDrag = (e: React.MouseEvent) => {
    if (!editorAuthenticated) return
    e.preventDefault()
    e.stopPropagation()
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
    setIsDragging(true)
    const onMove = (ev: MouseEvent) => setOffset({
      x: dragStart.current.ox + ev.clientX - dragStart.current.mx,
      y: dragStart.current.oy + ev.clientY - dragStart.current.my,
    })
    const onUp = (ev: MouseEvent) => {
      const next = { x: dragStart.current.ox + ev.clientX - dragStart.current.mx, y: dragStart.current.oy + ev.clientY - dragStart.current.my }
      setOffset(next)
      window.localStorage.setItem(`editable-section-pos-${id}`, JSON.stringify(next))
      setIsDragging(false)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  const handleMouseUp = () => {
    if (!editorAuthenticated) return
    setTimeout(() => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.toString().trim()) { setToolbarVisible(false); setLinkMode(false); return }
      savedRangeRef.current = sel.getRangeAt(0).cloneRange()
      const rect = sel.getRangeAt(0).getBoundingClientRect()
      setToolbarPos({ top: rect.top - 56, left: rect.left + rect.width / 2 })
      setToolbarVisible(true); setLinkMode(false); setLinkValue("")
    }, 10)
  }

  const applyCommand = (cmd: string, val?: string) => { restoreSelection(); document.execCommand(cmd, false, val); saveHtml() }

  const applySpanStyle = (prop: "fontSize" | "fontFamily", val: string) => {
    restoreSelection()
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return
    const range = sel.getRangeAt(0)
    const span = document.createElement("span")
    span.style[prop] = val
    try { range.surroundContents(span) } catch { span.appendChild(range.extractContents()); range.insertNode(span) }
    saveHtml()
  }

  const applyLink = () => {
    restoreSelection()
    const url = linkValue.trim()
    if (!url) { document.execCommand("unlink") } else {
      const full = url.startsWith("http") ? url : `https://${url}`
      document.execCommand("createLink", false, full)
      const anchor = window.getSelection()?.getRangeAt(0)?.commonAncestorContainer?.parentElement?.closest("a")
      if (anchor) { anchor.target = "_blank"; anchor.rel = "noopener noreferrer" }
    }
    saveHtml(); setLinkMode(false); setLinkValue(""); setToolbarVisible(false)
  }

  const selectAll = () => {
    if (!sectionRef.current) return
    const range = document.createRange()
    range.selectNodeContents(sectionRef.current)
    const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(range)
    savedRangeRef.current = range.cloneRange()
    const rect = range.getBoundingClientRect()
    setToolbarPos({ top: rect.top - 56, left: rect.left + rect.width / 2 })
    setToolbarVisible(true)
  }

  if (deleted) return null

  return (
    <>
      <div
        style={{
          overflow: "visible",
          display: effectiveDisplay,
          ...(effectiveDisplay === "contents" ? {} : { transform: `translate(${offset.x}px, ${offset.y}px)`, position: "relative" }),
        }}
        className="group"
      >
        {editorAuthenticated && (
          <div className="absolute -top-7 left-0 right-0 h-6 flex items-center justify-between px-2 rounded-t-lg border border-b-0 border-white/20 bg-black/60 backdrop-blur-sm z-10 select-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div data-drag-handle onMouseDown={startDrag} className={`flex-1 h-full flex items-center text-white/50 text-[11px] tracking-widest hover:text-white transition ${isDragging ? "cursor-grabbing text-white" : "cursor-grab"}`}>⠿ drag</div>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); selectAll() }} className="text-[10px] text-white/40 hover:text-white px-1.5 transition">Select all</button>
            <div className="w-px h-3 bg-white/20 mx-1" />
            <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); deleteSection() }} className="text-[10px] text-red-400/60 hover:text-red-400 px-1.5 transition" title="Delete this block">✕ Delete</button>
          </div>
        )}

        {/*
          IMPORTANT: suppressContentEditableWarning alone isn't enough.
          We render {children} here for the initial SSR/hydration pass.
          The useEffect above immediately overwrites innerHTML from localStorage
          if saved content exists. After that, React won't re-render children
          because we never change the children prop — it always stays the same
          static JSX from the parent. This means edits are safe between re-renders.
        */}
        <div
          ref={sectionRef}
          className={`${className ?? ""} ${editorAuthenticated ? "ring-1 ring-white/20 ring-offset-1" : ""}`}
          style={{
            ...style,
            display: effectiveDisplay,
            ...(size.width ? { width: size.width } : {}),
            ...(size.height ? { height: size.height, overflow: "auto" } : {}),
          }}
          contentEditable={editorAuthenticated ? "true" : "false"}
          suppressContentEditableWarning
          onBlur={(e) => { if (toolbarRef.current?.contains(e.relatedTarget as Node)) return; saveHtml() }}
          onMouseUp={handleMouseUp}
          onKeyUp={handleMouseUp}
        >
          {children}
        </div>
        {/* Resize handles — only in editor mode */}
        {editorAuthenticated && (
          <>
            {/* Right edge */}
            <div
              onMouseDown={(e) => startResize(e, "e")}
              className="absolute top-0 bottom-0 -right-1.5 w-3 cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
              style={{ top: "28px" }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-white/30 hover:bg-white/70 transition" />
            </div>
            {/* Bottom edge */}
            <div
              onMouseDown={(e) => startResize(e, "s")}
              className="absolute left-0 right-0 -bottom-1.5 h-3 cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-white/30 hover:bg-white/70 transition" />
            </div>
            {/* Bottom-right corner */}
            <div
              onMouseDown={(e) => startResize(e, "se")}
              className="absolute -bottom-1.5 -right-1.5 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className="text-white/50 hover:text-white transition">
                <path d="M0 8 L8 0 L8 8 Z" />
              </svg>
            </div>
          </>
        )}
      </div>

      {editorAuthenticated && toolbarVisible && (
        <div
          ref={toolbarRef}
          onMouseDown={(e) => e.preventDefault()}
          style={{ position: "fixed", top: toolbarPos.top, left: toolbarPos.left, transform: "translateX(-50%)", zIndex: 99999 }}
          className="flex items-center gap-1 rounded-xl border border-white/20 bg-black/95 px-2 py-1.5 shadow-2xl backdrop-blur-md"
        >
          {linkMode ? (
            <div className="flex items-center gap-1">
              <input autoFocus type="text" placeholder="https://..." value={linkValue} onChange={(e) => setLinkValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setLinkMode(false) }} className="bg-white/10 text-white text-xs px-2 py-1 rounded outline-none w-44 placeholder:text-white/30" />
              <button type="button" onMouseDown={(e) => { e.preventDefault(); applyLink() }} className="rounded px-2 py-1 text-xs text-white bg-primary/80 hover:bg-primary transition">Apply</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); restoreSelection(); document.execCommand("unlink"); saveHtml(); setLinkMode(false) }} className="rounded px-2 py-1 text-xs text-white/50 hover:bg-white/20 transition">Remove</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); setLinkMode(false) }} className="rounded px-1.5 py-1 text-xs text-white/40 hover:text-white hover:bg-white/20 transition">✕</button>
            </div>
          ) : (
            <>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); applyCommand("bold") }} className="rounded px-2 py-1 text-xs font-bold text-white hover:bg-white/20 transition">B</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); applyCommand("italic") }} className="rounded px-2 py-1 text-xs italic text-white hover:bg-white/20 transition">I</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); applyCommand("underline") }} className="rounded px-2 py-1 text-xs underline text-white hover:bg-white/20 transition">U</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); applyCommand("strikeThrough") }} className="rounded px-2 py-1 text-xs line-through text-white hover:bg-white/20 transition">S</button>
              <div className="w-px h-4 bg-white/20 mx-0.5" />
              <select onMouseDown={(e) => e.stopPropagation()} onChange={(e) => { applySpanStyle("fontSize", `${e.target.value}px`); e.target.value = "" }} defaultValue="" className="rounded bg-white/10 px-1 py-1 text-xs text-white outline-none cursor-pointer hover:bg-white/20 transition">
                <option value="" disabled>Size</option>
                {FONT_SIZE_OPTIONS.map((s) => <option key={s} value={s} className="bg-black">{s}px</option>)}
              </select>
              <select onMouseDown={(e) => e.stopPropagation()} onChange={(e) => { applySpanStyle("fontFamily", e.target.value); e.target.value = "" }} defaultValue="" className="rounded bg-white/10 px-1 py-1 text-xs text-white outline-none cursor-pointer hover:bg-white/20 transition">
                <option value="" disabled>Font</option>
                {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value} className="bg-black">{f.label}</option>)}
              </select>
              <div className="w-px h-4 bg-white/20 mx-0.5" />
              <label className="flex items-center cursor-pointer gap-0.5">
                <span className="text-xs text-white/70">A</span>
                <input type="color" defaultValue="#ffffff" onMouseDown={(e) => e.stopPropagation()} onChange={(e) => applyCommand("foreColor", e.target.value)} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0" />
              </label>
              <div className="w-px h-4 bg-white/20 mx-0.5" />
              <button type="button" onMouseDown={(e) => { e.preventDefault(); const a = window.getSelection()?.anchorNode?.parentElement?.closest("a"); setLinkValue(a?.href ?? ""); setLinkMode(true) }} className="rounded px-2 py-1 text-xs text-white hover:bg-white/20 transition">🔗</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); setToolbarVisible(false) }} className="ml-0.5 rounded px-1.5 py-1 text-xs text-white/40 hover:text-white hover:bg-white/20 transition">✕</button>
            </>
          )}
        </div>
      )}
    </>
  )
}
