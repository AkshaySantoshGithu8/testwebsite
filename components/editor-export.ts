// All localStorage keys used by the editor
export const EDITOR_KEY_PREFIXES = [
  "editable-section-",
  "editable-section-pos-",
  "editable-section-size-",
  "editable-section-version-",
  "editable-image-src-",
  "editable-image-pos-",
  "editable-image-size-",
  "page-bg-override-",
  "page-images-override-",
  "section-bg-override-",
  "section-textboxes-override-",
  "custom-sections-",
  "hero-editor-",
  "site-editor-background-",
]

export type EditorSnapshot = Record<string, string>

export function isEditorStorageKey(key: string) {
  return EDITOR_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))
}

/** Collect every editor key from localStorage into a plain object */
export function exportSnapshot(): EditorSnapshot {
  const snapshot: EditorSnapshot = {}
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)!
    if (isEditorStorageKey(key)) {
      snapshot[key] = window.localStorage.getItem(key)!
    }
  }
  return snapshot
}

export async function saveSnapshotToServer(snapshot = exportSnapshot()) {
  const response = await fetch("/api/editor/content", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(snapshot),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || "Failed to save editor content")
  }
}

/** Download the snapshot as a JSON file */
export function downloadSnapshot() {
  const snapshot = exportSnapshot()
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "editor-content.json"
  a.click()
  URL.revokeObjectURL(url)
}
