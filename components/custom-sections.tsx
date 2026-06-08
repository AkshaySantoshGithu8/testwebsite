"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useEditor } from "./editor-context"

const FONT_OPTIONS = [
  { label: "Default", value: "inherit" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Mono", value: "ui-monospace, monospace" },
  { label: "System", value: "system-ui, sans-serif" },
]
const FONT_SIZE_OPTIONS = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64]

interface CustomSection {
  id: string
  html: string
  x: number
  y: number
  width: number
  height: number
  label: string
}

function storageKey(pathname: string) {
  const slug = pathname === "/" ? "home" : pathname.replace(/^\//, "").replace(/\//g, "-")
  return `custom-sections-${slug}`
}

function load(pathname: string): CustomSection[] {
  try {
    const raw = window.localStorage.getItem(storageKey(pathname))
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function save(pathname: string, sections: CustomSection[]) {
  window.localStorage.setItem(storageKey(pathname), JSON.stringify(sections))
}

// ─── Single custom section ────────────────────────────────────────────────────
function Section({
  section,
  onUpdate,
  onDelete,
}: {
  section: CustomSection
  onUpdate: (updates: Partial<CustomSection>) => void
  onDelete: () => void
}) {
  const { editorAuthenticated } = useEditor()
  const ref = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const savedRangeRef = useRef<Range | null>(null)
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })
  const resizeStart = useRef({ mx: 0, my: 0, ow: 0, oh: 0 })

  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDir, setResizeDir] = useState("")
  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 })
  const [linkMode, setLinkMode] = useState(false)
  const [linkValue, setLinkValue] = useState("")

  // Seed HTML on mount
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = section.html
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const saveHtml = () => {
    if (ref.current) onUpdate({ html: ref.current.innerHTML })
  }

  const restoreSelection = () => {
    if (!savedRangeRef.current) return
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(savedRangeRef.current)
  }

  // Drag
  const startDrag = (e: React.MouseEvent) => {
    if (!editorAuthenticated) return
    e.preventDefault(); e.stopPropagation()
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: section.x, oy: section.y }
    setIsDragging(true)
    const onMove = (ev: MouseEvent) => onUpdate({
      x: dragStart.current.ox + ev.clientX - dragStart.current.mx,
      y: dragStart.current.oy + ev.clientY - dragStart.current.my,
    })
    const onUp = (ev: MouseEvent) => {
      onUpdate({
        x: dragStart.current.ox + ev.clientX - dragStart.current.mx,
        y: dragStart.current.oy + ev.clientY - dragStart.current.my,
      })
      setIsDragging(false)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  // Resize — dir: "se" | "s" | "e"
  const startResize = (e: React.MouseEvent, dir: string) => {
    if (!editorAuthenticated) return
    e.preventDefault(); e.stopPropagation()
    resizeStart.current = { mx: e.clientX, my: e.clientY, ow: section.width, oh: section.height }
    setIsResizing(true)
    setResizeDir(dir)
    const onMove = (ev: MouseEvent) => {
      const dw = ev.clientX - resizeStart.current.mx
      const dh = ev.clientY - resizeStart.current.my
      const updates: Partial<CustomSection> = {}
      if (dir === "se" || dir === "e") updates.width = Math.max(200, resizeStart.current.ow + dw)
      if (dir === "se" || dir === "s") updates.height = Math.max(60, resizeStart.current.oh + dh)
      onUpdate(updates)
    }
    const onUp = (ev: MouseEvent) => {
      const dw = ev.clientX - resizeStart.current.mx
      const dh = ev.clientY - resizeStart.current.my
      const updates: Partial<CustomSection> = {}
      if (dir === "se" || dir === "e") updates.width = Math.max(200, resizeStart.current.ow + dw)
      if (dir === "se" || dir === "s") updates.height = Math.max(60, resizeStart.current.oh + dh)
      onUpdate(updates)
      setIsResizing(false)
      setResizeDir("")
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
      if (!sel || sel.isCollapsed || sel.toString().trim() === "") { setToolbarVisible(false); return }
      savedRangeRef.current = sel.getRangeAt(0).cloneRange()
      const rect = sel.getRangeAt(0).getBoundingClientRect()
      setToolbarPos({ top: rect.top - 56, left: rect.left + rect.width / 2 })
      setToolbarVisible(true); setLinkMode(false); setLinkValue("")
    }, 10)
  }

  const applyCommand = (cmd: string, val?: string) => {
    restoreSelection(); document.execCommand(cmd, false, val); saveHtml()
  }

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
    const url = linkValue.trim()
    restoreSelection()
    if (!url) { document.execCommand("unlink", false) } else {
      const full = url.startsWith("http") ? url : `https://${url}`
      document.execCommand("createLink", false, full)
      const anchor = window.getSelection()?.getRangeAt(0)?.commonAncestorContainer?.parentElement?.closest("a")
      if (anchor) { anchor.target = "_blank"; anchor.rel = "noopener noreferrer" }
    }
    saveHtml(); setLinkMode(false); setLinkValue(""); setToolbarVisible(false)
  }

  const selectAll = () => {
    if (!ref.current) return
    const range = document.createRange()
    range.selectNodeContents(ref.current)
    const sel = window.getSelection()
    sel?.removeAllRanges(); sel?.addRange(range)
    savedRangeRef.current = range.cloneRange()
    const rect = range.getBoundingClientRect()
    setToolbarPos({ top: rect.top - 56, left: rect.left + rect.width / 2 })
    setToolbarVisible(true)
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          left: section.x,
          top: section.y,
          width: section.width,
          height: section.height,
          zIndex: 1000,
          cursor: isDragging ? "grabbing" : "default",
        }}
        className="group"
      >
        {/* Header bar */}
        {editorAuthenticated && (
          <div className="flex items-center justify-between h-7 px-2 rounded-t-[var(--radius)] bg-secondary border border-b-0 border-border select-none">
            <div
              onMouseDown={startDrag}
              className={`flex items-center gap-1.5 text-muted-foreground text-[11px] tracking-widest flex-1 h-full hover:text-foreground transition ${isDragging ? "cursor-grabbing text-foreground" : "cursor-grab"}`}
            >
              <span className="text-primary opacity-70">⠿</span> {section.label}
            </div>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); selectAll() }} className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 transition">Select all</button>
            <div className="w-px h-3 bg-border mx-1" />
            <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onDelete() }} className="text-[10px] text-destructive-foreground/60 hover:text-red-400 px-1.5 transition" title="Delete section">✕</button>
          </div>
        )}

        {/* Content */}
        <div
          ref={ref}
          contentEditable={editorAuthenticated ? "true" : "false"}
          suppressContentEditableWarning
          onBlur={(e) => { if (toolbarRef.current?.contains(e.relatedTarget as Node)) return; saveHtml() }}
          onMouseUp={handleMouseUp}
          onKeyUp={handleMouseUp}
          style={{ height: `calc(${section.height}px - 28px)`, overflow: "auto" }}
          className={`p-4 rounded-b-[var(--radius)] text-foreground font-sans text-base leading-relaxed ${editorAuthenticated ? "bg-card border border-border outline-none ring-0" : "bg-card/80"}`}
        />

        {/* Resize handles — right edge, bottom edge, bottom-right corner */}
        {editorAuthenticated && (
          <>
            {/* Right edge */}
            <div
              onMouseDown={(e) => startResize(e, "e")}
              className="absolute top-7 bottom-4 right-0 w-2 cursor-e-resize hover:bg-white/10 transition rounded-r"
              title="Drag to resize width"
            />
            {/* Bottom edge */}
            <div
              onMouseDown={(e) => startResize(e, "s")}
              className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize hover:bg-white/10 transition rounded-b"
              title="Drag to resize height"
            />
            {/* Bottom-right corner */}
            <div
              onMouseDown={(e) => startResize(e, "se")}
              className={`absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end pr-0.5 pb-0.5 ${isResizing && resizeDir === "se" ? "text-primary" : "text-muted-foreground hover:text-primary"} transition`}
              title="Drag to resize"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                <path d="M0 8 L8 0 L8 8 Z" />
              </svg>
            </div>
          </>
        )}
      </div>

      {/* Formatting toolbar */}
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
              <button type="button" onMouseDown={(e) => { e.preventDefault(); restoreSelection(); document.execCommand("unlink"); saveHtml(); setLinkMode(false) }} className="rounded px-2 py-1 text-xs text-white/50 hover:text-white hover:bg-white/20 transition">Remove</button>
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
              <button type="button" onMouseDown={(e) => { e.preventDefault(); const anchor = window.getSelection()?.anchorNode?.parentElement?.closest("a"); setLinkValue(anchor?.href ?? ""); setLinkMode(true) }} className="rounded px-2 py-1 text-xs text-white hover:bg-white/20 transition">🔗</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); setToolbarVisible(false) }} className="ml-0.5 rounded px-1.5 py-1 text-xs text-white/40 hover:text-white hover:bg-white/20 transition">✕</button>
            </>
          )}
        </div>
      )}
    </>
  )
}

// ─── Manager ─────────────────────────────────────────────────────────────────
export function CustomSections() {
  const { editorAuthenticated } = useEditor()
  const pathname = usePathname() ?? "/"
  const [sections, setSections] = useState<CustomSection[]>([])

  useEffect(() => {
    setSections(load(pathname))
  }, [pathname])

  const persist = (updated: CustomSection[]) => {
    setSections(updated)
    save(pathname, updated)
  }

  const addSection = () => {
    const count = sections.length + 1
    const newSection: CustomSection = {
      id: `custom-${Date.now()}`,
      html: `<p class="text-foreground">New section ${count} — click to edit</p>`,
      x: 80,
      y: 120 + (sections.length % 5) * 60,
      width: 480,
      height: 200,
      label: `Section ${count}`,
    }
    persist([...sections, newSection])
  }

  const updateSection = (id: string, updates: Partial<CustomSection>) => {
    persist(sections.map((s) => s.id === id ? { ...s, ...updates } : s))
  }

  const deleteSection = (id: string) => {
    persist(sections.filter((s) => s.id !== id))
  }

  return (
    <>
      {sections.map((s) => (
        <Section
          key={s.id}
          section={s}
          onUpdate={(updates) => updateSection(s.id, updates)}
          onDelete={() => deleteSection(s.id)}
        />
      ))}

      {/* Add section button — only in editor mode */}
      {editorAuthenticated && (
        <button
          type="button"
          onClick={addSection}
          className="fixed bottom-20 right-6 z-50 flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-foreground shadow-xl backdrop-blur-md hover:bg-muted transition"
          title="Add a new custom section"
        >
          <span className="text-lg leading-none">+</span> New section
        </button>
      )}
    </>
  )
}