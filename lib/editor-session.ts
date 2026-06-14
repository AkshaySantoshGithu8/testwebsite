import crypto from "node:crypto"

export const EDITOR_SESSION_COOKIE = "site-editor-session"
export const EDITOR_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function getSessionSecret() {
  return process.env.EDITOR_SESSION_SECRET || process.env.EDITOR_PASSWORD || null
}

function sign(value: string) {
  const secret = getSessionSecret()
  if (!secret) return null
  return crypto.createHmac("sha256", secret).update(value).digest("hex")
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

export function isEditorPasswordConfigured() {
  return Boolean(process.env.EDITOR_PASSWORD)
}

export function validateEditorPassword(password: string) {
  const configuredPassword = process.env.EDITOR_PASSWORD
  if (!configuredPassword) return false
  return safeEqual(password, configuredPassword)
}

export function createEditorSessionValue() {
  const expiresAt = Date.now() + EDITOR_SESSION_MAX_AGE_SECONDS * 1000
  const payload = String(expiresAt)
  const signature = sign(payload)
  if (!signature) return null
  return `${payload}.${signature}`
}

export function verifyEditorSessionValue(value: string | undefined) {
  if (!value) return false
  const [payload, signature] = value.split(".")
  if (!payload || !signature) return false

  const expiresAt = Number(payload)
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false

  const expectedSignature = sign(payload)
  return expectedSignature ? safeEqual(signature, expectedSignature) : false
}
