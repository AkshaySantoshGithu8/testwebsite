import { NextResponse } from "next/server"
import {
  createEditorSessionValue,
  EDITOR_SESSION_COOKIE,
  EDITOR_SESSION_MAX_AGE_SECONDS,
  isEditorPasswordConfigured,
  isEditorSessionSecretConfigured,
  validateEditorPassword,
  verifyEditorSessionValue,
} from "@/lib/editor-session"
import { cookies } from "next/headers"

export const runtime = "nodejs"

export async function GET() {
  const cookieStore = await cookies()
  const authenticated = verifyEditorSessionValue(
    cookieStore.get(EDITOR_SESSION_COOKIE)?.value,
  )

  return NextResponse.json({
    authenticated,
    configured: isEditorPasswordConfigured() && isEditorSessionSecretConfigured(),
  })
}

export async function POST(request: Request) {
  if (!isEditorPasswordConfigured() || !isEditorSessionSecretConfigured()) {
    return NextResponse.json(
      { error: "Editor authentication is not fully configured" },
      { status: 503 },
    )
  }

  const body = await request.json().catch(() => null)
  const password = typeof body?.password === "string" ? body.password : ""

  if (!validateEditorPassword(password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
  }

  const sessionValue = createEditorSessionValue()
  if (!sessionValue) {
    return NextResponse.json(
      { error: "Editor session could not be created" },
      { status: 500 },
    )
  }

  const response = NextResponse.json({ authenticated: true })
  response.cookies.set(EDITOR_SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: EDITOR_SESSION_MAX_AGE_SECONDS,
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false })
  response.cookies.set(EDITOR_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
  return response
}
