"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import { downloadSnapshot } from "./editor-export"
import { usePathname } from "next/navigation"

const EDITOR_PASSWORD = "akshay-edit-pass"
const EDITOR_AUTH_KEY = "site-editor-authenticated"
const EDITOR_BACKGROUND_OPTION_KEY = "site-editor-background-option"
const EDITOR_BACKGROUND_URL_KEY = "site-editor-background-url"
const EDITOR_DEFAULT_BACKGROUND = "/hero-bg.jpg"

const HOME_SECTION_OPTIONS = [
  { label: "Welcome", value: "welcome" },
  { label: "About", value: "about" },
  { label: "Education", value: "education" },
  { label: "Experience", value: "experience" },
  { label: "Projects", value: "projects" },
  { label: "Contact", value: "contact" },
]

function pageStorageKey(pathname: string) {
  const slug = pathname === "/" ? "home" : pathname.replace(/^\//, "").replace(/\//g, "-")
  return `page-bg-override-${slug}`
}

function sectionStorageKey(pathname: string, sectionId: string) {
  const slug = pathname === "/" ? "home" : pathname.replace(/^\//, "").replace(/\//g, "-")
  return `section-bg-override-${slug}-${sectionId}`
}

function sectionTextBoxesStorageKey(pathname: string, sectionId: string) {
  const slug = pathname === "/" ? "home" : pathname.replace(/^\//, "").replace(/\//g, "-")
  return `section-textboxes-override-${slug}-${sectionId}`
}

function pageImagesStorageKey(pathname: string) {
  const slug = pathname === "/" ? "home" : pathname.replace(/^\//, "").replace(/\//g, "-")
  return `page-images-override-${slug}`
}

function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const maxW = 1280
      const scale = img.width > maxW ? maxW / img.width : 1
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL("image/jpeg", 0.75))
    }
    img.src = dataUrl
  })
}

interface PageImage {
  id: string
  src: string
  x: number
  y: number
  width: number
  height: number
}

interface SectionTextBox {
  id: string
  sectionId: string
  html: string
  x: number
  y: number
  width: number
  height: number
}

interface EditorContextValue {
  editorAuthenticated: boolean
  editorPanelOpen: boolean
  backgroundUrl: string
  backgroundOption: string
  pageBackgroundUrl: string | null
  sectionBackgrounds: Record<string, string>
  sectionTextBoxes: Record<string, SectionTextBox[]>
  pageImages: PageImage[]
  togglePanel: () => void
  authenticate: (password: string) => boolean
  logout: () => void
  setBackgroundUrl: (url: string) => void
  setBackgroundOption: (option: string) => void
  setPageBackgroundUrl: (url: string | null) => void
  setSectionBackground: (sectionId: string, url: string | null) => void
  addSectionTextBox: (sectionId: string) => void
  updateSectionTextBox: (sectionId: string, id: string, updates: Partial<SectionTextBox>) => void
  removeSectionTextBox: (sectionId: string, id: string) => void
  addPageImage: (image: PageImage) => void
  updatePageImage: (id: string, updates: Partial<PageImage>) => void
  removePageImage: (id: string) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) throw new Error("useEditor must be used inside EditorProvider")
  return context
}

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/"
  const [editorAuthenticated, setEditorAuthenticated] = useState(false)
  const [editorPanelOpen, setEditorPanelOpen] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [backgroundUrl, setBackgroundUrl] = useState(EDITOR_DEFAULT_BACKGROUND)
  const [backgroundOption, setBackgroundOption] = useState("default")
  const [pageBackgroundUrl, setPageBackgroundUrlState] = useState<string | null>(null)
  const [sectionBackgrounds, setSectionBackgrounds] = useState<Record<string, string>>({})
  const [sectionTextBoxes, setSectionTextBoxes] = useState<Record<string, SectionTextBox[]>>({})
  const [pageImages, setPageImages] = useState<PageImage[]>([])

  // Load global settings once
  useEffect(() => {
    const auth = window.localStorage.getItem(EDITOR_AUTH_KEY)
    if (auth === EDITOR_PASSWORD) setEditorAuthenticated(true)
    const savedOption = window.localStorage.getItem(EDITOR_BACKGROUND_OPTION_KEY)
    if (savedOption) setBackgroundOption(savedOption)
    const savedUrl = window.localStorage.getItem(EDITOR_BACKGROUND_URL_KEY)
    if (savedUrl) setBackgroundUrl(savedUrl)
  }, [])

  // Load per-page data whenever pathname changes
  useEffect(() => {
    // Page background (all pages)
    const savedPageBg = window.localStorage.getItem(pageStorageKey(pathname))
    setPageBackgroundUrlState(savedPageBg ?? null)

    if (pathname !== "/") {
      setSectionBackgrounds({})
      setPageImages([])
      setSectionTextBoxes({})
      return
    }

    const loadedSections: Record<string, string> = {}
    HOME_SECTION_OPTIONS.forEach(({ value }) => {
      const saved = window.localStorage.getItem(sectionStorageKey(pathname, value))
      if (saved) loadedSections[value] = saved
    })
    setSectionBackgrounds(loadedSections)

    const loadedBoxes: Record<string, SectionTextBox[]> = {}
    HOME_SECTION_OPTIONS.forEach(({ value }) => {
      const saved = window.localStorage.getItem(sectionTextBoxesStorageKey(pathname, value))
      try { loadedBoxes[value] = saved ? JSON.parse(saved) : [] } catch { loadedBoxes[value] = [] }
    })
    setSectionTextBoxes(loadedBoxes)

    const savedImages = window.localStorage.getItem(pageImagesStorageKey(pathname))
    try { setPageImages(savedImages ? JSON.parse(savedImages) : []) } catch { setPageImages([]) }
  }, [pathname])

  // Persist section text boxes
  useEffect(() => {
    Object.entries(sectionTextBoxes).forEach(([sectionId, boxes]) => {
      const key = sectionTextBoxesStorageKey(pathname, sectionId)
      boxes.length > 0
        ? window.localStorage.setItem(key, JSON.stringify(boxes))
        : window.localStorage.removeItem(key)
    })
  }, [pathname, sectionTextBoxes])

  // Persist page images
  useEffect(() => {
    const key = pageImagesStorageKey(pathname)
    pageImages.length > 0
      ? window.localStorage.setItem(key, JSON.stringify(pageImages))
      : window.localStorage.removeItem(key)
  }, [pathname, pageImages])

  useEffect(() => {
    editorAuthenticated
      ? window.localStorage.setItem(EDITOR_AUTH_KEY, EDITOR_PASSWORD)
      : window.localStorage.removeItem(EDITOR_AUTH_KEY)
  }, [editorAuthenticated])

  useEffect(() => {
    window.localStorage.setItem(EDITOR_BACKGROUND_OPTION_KEY, backgroundOption)
  }, [backgroundOption])

  useEffect(() => {
    window.localStorage.setItem(EDITOR_BACKGROUND_URL_KEY, backgroundUrl)
  }, [backgroundUrl])

  const setPageBackgroundUrl = (url: string | null) => {
    setPageBackgroundUrlState(url)
    const key = pageStorageKey(pathname)
    if (url === null) {
      window.localStorage.removeItem(key)
    } else {
      window.localStorage.setItem(key, url)
    }
    // Notify PageBackground on the same tab immediately
    window.dispatchEvent(new CustomEvent(`page-bg-update:${key}`, { detail: url }))
  }

  const setSectionBackground = (sectionId: string, url: string | null) => {
    setSectionBackgrounds((prev) => {
      const next = { ...prev }
      const key = sectionStorageKey(pathname, sectionId)
      if (url === null) {
        delete next[sectionId]
        window.localStorage.removeItem(key)
      } else {
        next[sectionId] = url
        window.localStorage.setItem(key, url)
      }
      return next
    })
  }

  const togglePanel = () => setEditorPanelOpen((o) => !o)

  const authenticate = (password: string) => {
    if (password === EDITOR_PASSWORD) {
      setEditorAuthenticated(true)
      setPasswordError("")
      setPasswordInput("")
      setEditorPanelOpen(true)
      return true
    }
    setPasswordError("Incorrect password")
    return false
  }

  const logout = () => {
    setEditorAuthenticated(false)
    setEditorPanelOpen(false)
    setPasswordInput("")
    setPasswordError("")
  }

  const addSectionTextBox = (sectionId: string) => {
    const newBox: SectionTextBox = {
      id: `section-textbox-${Date.now()}`,
      sectionId,
      html: "New text box",
      x: 40, y: 40, width: 320, height: 140,
    }
    setSectionTextBoxes((prev) => ({ ...prev, [sectionId]: [...(prev[sectionId] ?? []), newBox] }))
  }

  const updateSectionTextBox = (sectionId: string, id: string, updates: Partial<SectionTextBox>) =>
    setSectionTextBoxes((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId]?.map((box) => (box.id === id ? { ...box, ...updates } : box)) ?? [],
    }))

  const removeSectionTextBox = (sectionId: string, id: string) =>
    setSectionTextBoxes((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId]?.filter((box) => box.id !== id) ?? [],
    }))

  const addPageImage = (image: PageImage) => setPageImages((prev) => [...prev, image])
  const updatePageImage = (id: string, updates: Partial<PageImage>) =>
    setPageImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...updates } : img)))
  const removePageImage = (id: string) => setPageImages((prev) => prev.filter((img) => img.id !== id))

  const value = useMemo(() => ({
    editorAuthenticated,
    editorPanelOpen,
    backgroundUrl,
    backgroundOption,
    pageBackgroundUrl,
    sectionBackgrounds,
    sectionTextBoxes,
    pageImages,
    togglePanel,
    authenticate,
    logout,
    setBackgroundUrl,
    setBackgroundOption,
    setPageBackgroundUrl,
    setSectionBackground,
    addSectionTextBox,
    updateSectionTextBox,
    removeSectionTextBox,
    addPageImage,
    updatePageImage,
    removePageImage,
  }), [editorAuthenticated, editorPanelOpen, backgroundUrl, backgroundOption, pageBackgroundUrl, sectionBackgrounds, sectionTextBoxes, pageImages])

  return (
    <EditorContext.Provider value={value}>
      <>{children}</>
      <EditorPanel
        editorAuthenticated={editorAuthenticated}
        editorPanelOpen={editorPanelOpen}
        togglePanel={togglePanel}
        authenticate={authenticate}
        logout={logout}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        passwordError={passwordError}
        backgroundOption={backgroundOption}
        setBackgroundOption={setBackgroundOption}
        backgroundUrl={backgroundUrl}
        setBackgroundUrl={setBackgroundUrl}
        pageBackgroundUrl={pageBackgroundUrl}
        setPageBackgroundUrl={setPageBackgroundUrl}
        sectionBackgrounds={sectionBackgrounds}
        setSectionBackground={setSectionBackground}
        sectionTextBoxes={sectionTextBoxes}
        addSectionTextBox={addSectionTextBox}
        pageImages={pageImages}
        addPageImage={addPageImage}
        removePageImage={removePageImage}
        pathname={pathname}
      />
    </EditorContext.Provider>
  )
}

function EditorPanel({
  editorAuthenticated,
  editorPanelOpen,
  togglePanel,
  authenticate,
  logout,
  passwordInput,
  setPasswordInput,
  passwordError,
  backgroundOption,
  setBackgroundOption,
  backgroundUrl,
  setBackgroundUrl,
  pageBackgroundUrl,
  setPageBackgroundUrl,
  sectionBackgrounds,
  setSectionBackground,
  sectionTextBoxes,
  addSectionTextBox,
  pageImages,
  addPageImage,
  removePageImage,
  pathname,
}: {
  editorAuthenticated: boolean
  editorPanelOpen: boolean
  togglePanel: () => void
  authenticate: (password: string) => boolean
  logout: () => void
  passwordInput: string
  setPasswordInput: (v: string) => void
  passwordError: string
  backgroundOption: string
  setBackgroundOption: (v: string) => void
  backgroundUrl: string
  setBackgroundUrl: (v: string) => void
  pageBackgroundUrl: string | null
  setPageBackgroundUrl: (url: string | null) => void
  sectionBackgrounds: Record<string, string>
  setSectionBackground: (sectionId: string, url: string | null) => void
  sectionTextBoxes: Record<string, SectionTextBox[]>
  addSectionTextBox: (sectionId: string) => void
  pageImages: PageImage[]
  addPageImage: (image: PageImage) => void
  removePageImage: (id: string) => void
  pathname: string
}) {
  const pageBgFileRef = useRef<HTMLInputElement>(null)
  const sectionBgFileRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [savingPageBg, setSavingPageBg] = useState(false)
  const [savingSectionBg, setSavingSectionBg] = useState(false)
  const [savingImage, setSavingImage] = useState(false)
  const [selectedSection, setSelectedSection] = useState(HOME_SECTION_OPTIONS[0].value)

  const currentSectionBackground = sectionBackgrounds[selectedSection] ?? null
  const selectedSectionLabel = HOME_SECTION_OPTIONS.find((s) => s.value === selectedSection)?.label ?? selectedSection
  const pageLabel = pathname === "/" ? "Home" : pathname

  const handlePageBgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSavingPageBg(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const compressed = await compressImage(ev.target?.result as string)
      setPageBackgroundUrl(compressed)
      setSavingPageBg(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSectionBgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSavingSectionBg(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const compressed = await compressImage(ev.target?.result as string)
      setSectionBackground(selectedSection, compressed)
      setSavingSectionBg(false)
    }
    reader.readAsDataURL(file)
  }

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSavingImage(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const compressed = await compressImage(ev.target?.result as string)
      addPageImage({ id: `page-image-${Date.now()}`, src: compressed, x: 64, y: 64, width: 320, height: 220 })
      setSavingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ""
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        type="button"
        onClick={togglePanel}
        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
      >
        {editorAuthenticated ? (editorPanelOpen ? "Close editor" : "Open editor") : "Editor"}
      </button>

      {editorPanelOpen && (
        <div className="mt-3 w-[340px] max-h-[80vh] overflow-y-auto rounded-3xl border border-white/20 bg-black/80 p-4 text-white shadow-2xl backdrop-blur-md">
          {editorAuthenticated ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm uppercase tracking-[0.3em] text-primary/90">Site editor</div>
                  <div className="text-xs text-white/70 mt-0.5">Edit text and content on every page.</div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={downloadSnapshot} className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-sm text-primary transition hover:bg-primary/20" title="Download your edits as a JSON file to commit to the project">
                    Export
                  </button>
                  <button type="button" onClick={logout} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm transition hover:bg-white/20">
                    Logout
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {/* Global background */}
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/70">Global Background</span>
                  <select
                    value={backgroundOption}
                    onChange={(e) => {
                      const opt = e.target.value
                      setBackgroundOption(opt)
                      if (opt === "default") setBackgroundUrl(EDITOR_DEFAULT_BACKGROUND)
                      else if (opt === "mountains") setBackgroundUrl("https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80")
                      else if (opt === "city") setBackgroundUrl("https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1400&q=80")
                      else if (opt === "custom") setBackgroundUrl("")
                    }}
                    className="mt-2 w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-primary"
                  >
                    <option value="default">Default</option>
                    <option value="mountains">Mountains</option>
                    <option value="city">City</option>
                    <option value="custom">Custom URL</option>
                  </select>
                </label>

                {backgroundOption === "custom" && (
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/70">Custom URL</span>
                    <input
                      type="text"
                      value={backgroundUrl}
                      onChange={(e) => setBackgroundUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="mt-2 w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-primary"
                    />
                  </label>
                )}

                <div className="border-t border-white/10" />

                {/* Page background */}
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-white/70">Page Background</span>
                  <p className="text-[11px] text-white/40 mt-0.5 mb-2">
                    Overrides global background for <span className="text-white/60 font-medium">{pageLabel}</span> only. Persists across reloads.
                  </p>
                  {savingPageBg ? (
                    <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-white/40 text-center">Compressing & saving…</div>
                  ) : pageBackgroundUrl ? (
                    <>
                      <div className="relative rounded-xl overflow-hidden border border-white/20">
                        <img src={pageBackgroundUrl} alt="Page background" className="w-full h-24 object-cover" />
                        <button
                          type="button"
                          onClick={() => { setPageBackgroundUrl(null); if (pageBgFileRef.current) pageBgFileRef.current.value = "" }}
                          className="absolute top-1.5 right-1.5 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-black/80 transition"
                        >
                          Remove
                        </button>
                      </div>
                      <button type="button" onClick={() => pageBgFileRef.current?.click()} className="mt-2 w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 transition text-center">
                        Replace image
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => pageBgFileRef.current?.click()} className="w-full rounded-2xl border border-dashed border-white/30 bg-white/5 px-3 py-3 text-sm text-white/60 hover:bg-white/10 hover:text-white transition text-center">
                      + Upload image for this page
                    </button>
                  )}
                  <input ref={pageBgFileRef} type="file" accept="image/*" onChange={handlePageBgFile} className="hidden" />
                </div>

                <div className="border-t border-white/10" />

                {/* Section background */}
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-white/70">Section Background</span>
                  <p className="text-[11px] text-white/40 mt-0.5 mb-2">Pick a section and upload a background for it.</p>

                  {pathname === "/" ? (
                    <>
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-primary mb-2"
                      >
                        {HOME_SECTION_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>

                      {savingSectionBg ? (
                        <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-white/40 text-center">Compressing & saving…</div>
                      ) : currentSectionBackground ? (
                        <>
                          <div className="relative rounded-xl overflow-hidden border border-white/20">
                            <img src={currentSectionBackground} alt="Section background" className="w-full h-24 object-cover" />
                            <button
                              type="button"
                              onClick={() => { setSectionBackground(selectedSection, null); if (sectionBgFileRef.current) sectionBgFileRef.current.value = "" }}
                              className="absolute top-1.5 right-1.5 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-black/80 transition"
                            >
                              Remove
                            </button>
                          </div>
                          <button type="button" onClick={() => sectionBgFileRef.current?.click()} className="mt-2 w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 transition text-center">
                            Replace image
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={() => sectionBgFileRef.current?.click()} className="w-full rounded-2xl border border-dashed border-white/30 bg-white/5 px-3 py-3 text-sm text-white/60 hover:bg-white/10 hover:text-white transition text-center">
                          + Upload background for {selectedSectionLabel}
                        </button>
                      )}

                      <div className="mt-3 grid gap-2">
                        <button type="button" onClick={() => addSectionTextBox(selectedSection)} className="w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10 transition">
                          + Add text box to {selectedSectionLabel}
                        </button>
                        <div className="text-[11px] text-white/40">
                          {sectionTextBoxes[selectedSection]?.length ?? 0} text box{(sectionTextBoxes[selectedSection]?.length ?? 0) === 1 ? "" : "es"} in this section.
                        </div>
                      </div>
                      <input ref={sectionBgFileRef} type="file" accept="image/*" onChange={handleSectionBgFile} className="hidden" />
                    </>
                  ) : (
                    <div className="text-[11px] text-white/40">Section backgrounds are available on the homepage only.</div>
                  )}
                </div>

                <div className="border-t border-white/10" />

                {/* Page images */}
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-white/70">Page Images</span>
                  <p className="text-[11px] text-white/40 mt-0.5 mb-2">Upload and position images on this page.</p>
                  {savingImage ? (
                    <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-white/40 text-center">Compressing & saving…</div>
                  ) : pageImages.length > 0 ? (
                    <div className="space-y-3">
                      {pageImages.map((image) => (
                        <div key={image.id} className="relative rounded-xl overflow-hidden border border-white/20">
                          <img src={image.src} alt="Page image" className="w-full h-24 object-cover" />
                          <button type="button" onClick={() => removePageImage(image.id)} className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-black/80 transition">
                            Remove
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10 transition">
                        + Add another image
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full rounded-2xl border border-dashed border-white/30 bg-white/5 px-3 py-3 text-sm text-white/60 hover:bg-white/10 hover:text-white transition text-center">
                      + Upload image for this page
                    </button>
                  )}
                  <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); authenticate(passwordInput) }} className="space-y-3">
              <div className="text-sm uppercase tracking-[0.3em] text-primary/90">Editor login</div>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-white/70">Password</span>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-white/5 px-3 py-2 text-white outline-none transition focus:border-primary"
                />
              </label>
              {passwordError && <div className="text-xs text-red-400">{passwordError}</div>}
              <button type="submit" className="w-full rounded-2xl bg-primary px-3 py-2 text-sm font-medium text-white transition hover:opacity-90">
                Unlock editor
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}