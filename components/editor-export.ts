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

/** Collect every editor key from localStorage into a plain object */
export function exportSnapshot(): EditorSnapshot {
  const snapshot: EditorSnapshot = {}
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)!
    if (EDITOR_KEY_PREFIXES.some((p) => key.startsWith(p))) {
      snapshot[key] = window.localStorage.getItem(key)!
    }
  }
  return snapshot
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
