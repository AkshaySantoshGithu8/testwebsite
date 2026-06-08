"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useEditor } from "./editor-context"

const HERO_EDITOR_SUBTITLE_KEY = "hero-editor-subtitle"
const HERO_EDITOR_TITLE_KEY = "hero-editor-title"
const HERO_EDITOR_SUBTITLE_OFFSET_KEY = "hero-editor-subtitle-offset"
const HERO_EDITOR_TITLE_OFFSET_KEY = "hero-editor-title-offset"
const HERO_EDITOR_SUBTITLE_SIZE_KEY = "hero-editor-subtitle-size"
const HERO_EDITOR_TITLE_SIZE_KEY = "hero-editor-title-size"
const HERO_EDITOR_FONT_KEY = "hero-editor-font"
const HERO_EDITOR_BACKGROUND_OPTION_KEY = "hero-editor-background-option"
const HERO_EDITOR_BACKGROUND_URL_KEY = "hero-editor-background-url"
const HERO_EDITOR_CUSTOM_BACKGROUND_KEY = "hero-editor-custom-background"
const HERO_EDITOR_DEFAULT_SUBTITLE_SIZE = 40
const HERO_EDITOR_DEFAULT_TITLE_SIZE = 110
const HERO_EDITOR_DEFAULT_FONT = "system-ui, sans-serif"
const HERO_EDITOR_DEFAULT_BACKGROUND = "/hero-bg.jpg"

export function HeroSection() {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  const scale = useTransform(scrollY, [0, 400], [1, 1.1])
  const { editorAuthenticated, sectionBackgrounds } = useEditor()

  const [subtitleText, setSubtitleText] = useState("Hello, it's me")
  const [titleText, setTitleText] = useState("Akshay Santosh")
  const [subtitleOffset, setSubtitleOffset] = useState({ x: 0, y: 0 })
  const [titleOffset, setTitleOffset] = useState({ x: 0, y: 0 })
  const [subtitleSize, setSubtitleSize] = useState(HERO_EDITOR_DEFAULT_SUBTITLE_SIZE)
  const [titleSize, setTitleSize] = useState(HERO_EDITOR_DEFAULT_TITLE_SIZE)
  const [fontFamily, setFontFamily] = useState(HERO_EDITOR_DEFAULT_FONT)
  const [backgroundOption, setBackgroundOption] = useState("default")
  const [backgroundUrl, setBackgroundUrl] = useState(HERO_EDITOR_DEFAULT_BACKGROUND)
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState("")
  const [dragging, setDragging] = useState<"subtitle" | "title" | null>(null)
  const dragLast = useRef({ x: 0, y: 0 })

  // Load saved editor state from localStorage.
  useEffect(() => {
    const savedSubtitle = window.localStorage.getItem(HERO_EDITOR_SUBTITLE_KEY)
    if (savedSubtitle) setSubtitleText(savedSubtitle)

    const savedTitle = window.localStorage.getItem(HERO_EDITOR_TITLE_KEY)
    if (savedTitle) setTitleText(savedTitle)

    const savedSubtitleOffset = window.localStorage.getItem(HERO_EDITOR_SUBTITLE_OFFSET_KEY)
    if (savedSubtitleOffset) {
      try {
        setSubtitleOffset(JSON.parse(savedSubtitleOffset))
      } catch {
        // ignore invalid saved value
      }
    }

    const savedTitleOffset = window.localStorage.getItem(HERO_EDITOR_TITLE_OFFSET_KEY)
    if (savedTitleOffset) {
      try {
        setTitleOffset(JSON.parse(savedTitleOffset))
      } catch {
        // ignore invalid saved value
      }
    }

    const savedSubtitleSize = window.localStorage.getItem(HERO_EDITOR_SUBTITLE_SIZE_KEY)
    if (savedSubtitleSize) {
      const parsed = Number(savedSubtitleSize)
      if (!Number.isNaN(parsed)) setSubtitleSize(parsed)
    }

    const savedTitleSize = window.localStorage.getItem(HERO_EDITOR_TITLE_SIZE_KEY)
    if (savedTitleSize) {
      const parsed = Number(savedTitleSize)
      if (!Number.isNaN(parsed)) setTitleSize(parsed)
    }

    const savedFont = window.localStorage.getItem(HERO_EDITOR_FONT_KEY)
    if (savedFont) setFontFamily(savedFont)

    const savedBackgroundOption = window.localStorage.getItem(HERO_EDITOR_BACKGROUND_OPTION_KEY)
    if (savedBackgroundOption) setBackgroundOption(savedBackgroundOption)

    const savedBackgroundUrl = window.localStorage.getItem(HERO_EDITOR_BACKGROUND_URL_KEY)
    if (savedBackgroundUrl) setBackgroundUrl(savedBackgroundUrl)

    const savedCustomBackground = window.localStorage.getItem(HERO_EDITOR_CUSTOM_BACKGROUND_KEY)
    if (savedCustomBackground) setCustomBackgroundUrl(savedCustomBackground)
  }, [])

  // Persist editor state so changes survive refresh.
  useEffect(() => {
    window.localStorage.setItem(HERO_EDITOR_SUBTITLE_KEY, subtitleText)
  }, [subtitleText])

  useEffect(() => {
    window.localStorage.setItem(HERO_EDITOR_TITLE_KEY, titleText)
  }, [titleText])

  useEffect(() => {
    window.localStorage.setItem(HERO_EDITOR_SUBTITLE_OFFSET_KEY, JSON.stringify(subtitleOffset))
  }, [subtitleOffset])

  useEffect(() => {
    window.localStorage.setItem(HERO_EDITOR_TITLE_OFFSET_KEY, JSON.stringify(titleOffset))
  }, [titleOffset])

  useEffect(() => {
    window.localStorage.setItem(HERO_EDITOR_SUBTITLE_SIZE_KEY, String(subtitleSize))
  }, [subtitleSize])

  useEffect(() => {
    window.localStorage.setItem(HERO_EDITOR_TITLE_SIZE_KEY, String(titleSize))
  }, [titleSize])

  useEffect(() => {
    window.localStorage.setItem(HERO_EDITOR_FONT_KEY, fontFamily)
  }, [fontFamily])

  useEffect(() => {
    window.localStorage.setItem(HERO_EDITOR_BACKGROUND_OPTION_KEY, backgroundOption)
  }, [backgroundOption])

  useEffect(() => {
    window.localStorage.setItem(HERO_EDITOR_BACKGROUND_URL_KEY, backgroundUrl)
  }, [backgroundUrl])

  useEffect(() => {
    window.localStorage.setItem(HERO_EDITOR_CUSTOM_BACKGROUND_KEY, customBackgroundUrl)
  }, [customBackgroundUrl])

  // Track pointer movement while dragging a text block.
  useEffect(() => {
    if (!dragging) return

    const handlePointerMove = (event: PointerEvent) => {
      const dx = event.clientX - dragLast.current.x
      const dy = event.clientY - dragLast.current.y
      dragLast.current = { x: event.clientX, y: event.clientY }

      if (dragging === "subtitle") {
        setSubtitleOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
      } else if (dragging === "title") {
        setTitleOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
      }
    }

    const handlePointerUp = () => {
      setDragging(null)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [dragging])

  // Start dragging one of the editable text blocks.
  const startDrag = (
    section: "subtitle" | "title",
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragLast.current = { x: event.clientX, y: event.clientY }
    setDragging(section)
  }

  const resetEditor = () => {
    setSubtitleOffset({ x: 0, y: 0 })
    setTitleOffset({ x: 0, y: 0 })
    setSubtitleSize(HERO_EDITOR_DEFAULT_SUBTITLE_SIZE)
    setTitleSize(HERO_EDITOR_DEFAULT_TITLE_SIZE)
    setFontFamily(HERO_EDITOR_DEFAULT_FONT)
    setBackgroundOption("default")
    setBackgroundUrl(HERO_EDITOR_DEFAULT_BACKGROUND)
    setCustomBackgroundUrl("")
    setSubtitleText("Hello, it's me")
    setTitleText("Akshay Santosh")
    window.localStorage.removeItem(HERO_EDITOR_SUBTITLE_KEY)
    window.localStorage.removeItem(HERO_EDITOR_TITLE_KEY)
    window.localStorage.removeItem(HERO_EDITOR_SUBTITLE_OFFSET_KEY)
    window.localStorage.removeItem(HERO_EDITOR_TITLE_OFFSET_KEY)
    window.localStorage.removeItem(HERO_EDITOR_SUBTITLE_SIZE_KEY)
    window.localStorage.removeItem(HERO_EDITOR_TITLE_SIZE_KEY)
    window.localStorage.removeItem(HERO_EDITOR_FONT_KEY)
    window.localStorage.removeItem(HERO_EDITOR_BACKGROUND_OPTION_KEY)
    window.localStorage.removeItem(HERO_EDITOR_BACKGROUND_URL_KEY)
    window.localStorage.removeItem(HERO_EDITOR_CUSTOM_BACKGROUND_KEY)
  }

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
  }

  // Section-level override from editor context wins over the hero's own default background.
  const effectiveBackground = sectionBackgrounds.welcome || backgroundUrl || HERO_EDITOR_DEFAULT_BACKGROUND

  return (
    <motion.section
      style={{ opacity }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with overlay */}
      <motion.div
        style={{ scale }}
        className="absolute inset-0 z-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${effectiveBackground}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 px-4 max-w-5xl mx-auto w-full flex justify-center">
        <div className="inline-block text-left">
          {/* Subtitle block — draggable only in editor mode. */}
          <div
            style={{ transform: `translate3d(${subtitleOffset.x}px, ${subtitleOffset.y}px, 0)` }}
            className={editorAuthenticated ? "cursor-grab" : undefined}
            onPointerDown={editorAuthenticated ? (event) => {
              if (event.target === event.currentTarget) startDrag("subtitle", event)
            } : undefined}
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white mb-0 text-left"
              style={{ fontFamily, fontSize: `${subtitleSize}px` }}
              contentEditable={editorAuthenticated}
              suppressContentEditableWarning
              spellCheck={false}
              onInput={(event) => setSubtitleText(event.currentTarget.textContent ?? subtitleText)}
            >
              {subtitleText}
            </motion.p>
          </div>

          {/* Name block — draggable only in editor mode. */}
          <div
            style={{ transform: `translate3d(${titleOffset.x}px, ${titleOffset.y}px, 0)` }}
            className={editorAuthenticated ? "cursor-grab" : undefined}
            onPointerDown={editorAuthenticated ? (event) => {
              if (event.target === event.currentTarget) startDrag("title", event)
            } : undefined}
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-bold text-white leading-none whitespace-nowrap text-left"
              style={{ fontFamily, fontSize: `${titleSize}px` }}
              contentEditable={editorAuthenticated}
              suppressContentEditableWarning
              spellCheck={false}
              onInput={(event) => setTitleText(event.currentTarget.textContent ?? titleText)}
            >
              {titleText}
            </motion.h1>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToAbout}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 cursor-pointer z-10 group"
        aria-label="Scroll to about section"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-white group-hover:text-primary transition-colors"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </motion.button>
    </motion.section>
  )
}