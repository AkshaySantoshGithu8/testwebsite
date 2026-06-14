"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useCommittedContent } from "@/components/committed-content-context"

function pageStorageKey(pathname: string) {
  const slug = pathname === "/" ? "home" : pathname.replace(/^\//, "").replace(/\//g, "-")
  return `page-bg-override-${slug}`
}

export function PageBackground() {
  const pathname = usePathname() ?? "/"
  const committedContent = useCommittedContent()
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const key = pageStorageKey(pathname)

    const committedUrl = committedContent[key]
    if (committedUrl) {
      setUrl(committedUrl)
      window.localStorage.setItem(key, committedUrl)
      return
    }

    const saved = window.localStorage.getItem(key)
    setUrl(saved ?? null)
  }, [pathname, committedContent])

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
