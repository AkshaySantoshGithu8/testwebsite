import { readFile } from "node:fs/promises"
import path from "node:path"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/admin"
import { EDITOR_SESSION_COOKIE, verifyEditorSessionValue } from "@/lib/editor-session"

export const runtime = "nodejs"

const EDITOR_CONTENT_ROW_ID = "site"
const EDITOR_CONTENT_TABLE = "editor_content"
const EDITOR_KEY_PREFIXES = [
  "editable-section-",
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

type EditorSnapshot = Record<string, string>

function isEditorSnapshot(value: unknown): value is EditorSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  return Object.entries(value).every(
    ([key, val]) =>
      typeof key === "string" &&
      typeof val === "string" &&
      EDITOR_KEY_PREFIXES.some((prefix) => key.startsWith(prefix)),
  )
}

async function readStaticSnapshot(): Promise<EditorSnapshot> {
  try {
    const file = await readFile(
      path.join(process.cwd(), "public", "editor-content.json"),
      "utf8",
    )
    const parsed = JSON.parse(file)
    return isEditorSnapshot(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

async function readStoredSnapshot(): Promise<EditorSnapshot | null> {
  if (!hasSupabaseAdminConfig()) return null

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from(EDITOR_CONTENT_TABLE)
    .select("snapshot")
    .eq("id", EDITOR_CONTENT_ROW_ID)
    .maybeSingle()

  if (error) {
    console.error("Error loading editor content:", error)
    return null
  }

  return isEditorSnapshot(data?.snapshot) ? data.snapshot : null
}

async function isAuthenticated() {
  const cookieStore = await cookies()
  return verifyEditorSessionValue(cookieStore.get(EDITOR_SESSION_COOKIE)?.value)
}

export async function GET() {
  const snapshot = (await readStoredSnapshot()) ?? (await readStaticSnapshot())
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "no-store",
    },
  })
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: "Supabase editor storage is not configured" },
      { status: 503 },
    )
  }

  const snapshot = await request.json().catch(() => null)
  if (!isEditorSnapshot(snapshot)) {
    return NextResponse.json(
      { error: "Invalid editor content snapshot" },
      { status: 400 },
    )
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from(EDITOR_CONTENT_TABLE).upsert({
    id: EDITOR_CONTENT_ROW_ID,
    snapshot,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error saving editor content:", error)
    return NextResponse.json(
      { error: "Failed to save editor content" },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
