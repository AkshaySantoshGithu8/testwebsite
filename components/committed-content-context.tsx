"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { EditorSnapshot } from "./editor-export"

const CommittedContentContext = createContext<EditorSnapshot>({})

export function useCommittedContent() {
  return useContext(CommittedContentContext)
}

export function CommittedContentProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<EditorSnapshot>({})

  useEffect(() => {
    fetch("/editor-content.json", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : {})
      .then(setSnapshot)
      .catch(() => setSnapshot({}))
  }, [])

  return (
    <CommittedContentContext.Provider value={snapshot}>
      {children}
    </CommittedContentContext.Provider>
  )
}