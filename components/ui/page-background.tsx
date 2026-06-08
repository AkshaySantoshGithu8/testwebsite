"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

function pageStorageKey(pathname: string) {
  const slug = pathname === "/" ? "home" : pathname.replace(/^\//, "").replace(/\//g, "-")
  return `page-bg-override-${slug}`
}

export function PageBackground() {
  const pathname = usePathname() ?? "/"
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const key = pageStorageKey(pathname)

    async function load() {
      // 1. Try committed JSON file first
      try {
        const res = await fetch("/editor-content.json", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          if (data[key]) {
            setUrl(data[key])
            // Sync to localStorage so live edits layer on top
            window.localStorage.setItem(key, data[key])
            return
          }
        }
      } catch {}

      // 2. Fall back to localStorage
      const saved = window.localStorage.getItem(key)
      setUrl(saved ?? null)
    }

    load()
  }, [pathname])

  // Same-tab live updates from editor panel
  useEffect(() => {
    const key = pageStorageKey(pathname)
    const handler = (e: CustomEvent<string | null>) => setUrl(e.detail)
    window.addEventListener(`page-bg-update:${key}` as any, handler)
    return () => window.removeEventListener(`page-bg-update:${key}` as any, handler)
  }, [pathname])

  if (!url) return null

  return (
    <div
      className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
      style={{ backgroundImage: `url('${url}')`, zIndex: 0 }}
    />
  )
}