"use client"

import { getToken, isSupported } from "firebase/messaging"

import { api } from "@/lib/api/endpoints"
import { firebaseConfig, messaging } from "@/lib/firebase"

export type PushSupport = "unsupported" | "unknown" | NotificationPermission

const TOKEN_STORAGE_KEY = "marketx.push.token"
const PROMPT_STORAGE_KEY = "marketx.push.prompted-at"
const PROMPT_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000

export function pushPermission(): PushSupport {
  if (typeof window === "undefined") return "unknown"
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return "unsupported"
  }
  return Notification.permission
}

/** Re-read permission when the tab regains focus or becomes visible again. */
export function subscribePushPermission(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  const handler = () => onChange()
  document.addEventListener("visibilitychange", handler)
  window.addEventListener("focus", handler)
  return () => {
    document.removeEventListener("visibilitychange", handler)
    window.removeEventListener("focus", handler)
  }
}

export function readStoredPushToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

function storePushToken(token: string | null) {
  try {
    if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // Private mode or storage disabled; the token simply is not cached.
  }
}

export function shouldPromptForPush(): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = window.localStorage.getItem(PROMPT_STORAGE_KEY)
    if (!raw) return true
    const at = Number(raw)
    return !Number.isFinite(at) || Date.now() - at > PROMPT_SNOOZE_MS
  } catch {
    return true
  }
}

export function markPushPrompted() {
  try {
    window.localStorage.setItem(PROMPT_STORAGE_KEY, String(Date.now()))
  } catch {
    // ignore
  }
}

/**
 * The service worker is a static file, so the Firebase web config is passed
 * through the registration URL instead of being baked into `public/`.
 */
async function registerMessagingWorker(): Promise<ServiceWorkerRegistration> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(firebaseConfig)) {
    if (value) params.set(key, value)
  }
  const registration = await navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?${params.toString()}`,
    { scope: "/" }
  )
  await navigator.serviceWorker.ready
  return registration
}

export async function getPushToken(): Promise<string | null> {
  if (!messaging) return null
  if (!(await isSupported())) return null
  if (pushPermission() !== "granted") return null

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  if (!vapidKey) return null

  try {
    const registration = await registerMessagingWorker()
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    })
    if (token) storePushToken(token)
    return token || null
  } catch {
    return null
  }
}

/**
 * Requests browser permission and returns a fresh FCM token. Must be called
 * from a user gesture (button click) or the browser silently denies it.
 */
export async function enablePushNotifications(): Promise<string | null> {
  const permission = pushPermission()
  if (permission === "unsupported" || permission === "unknown") return null

  if (permission !== "granted") {
    const result = await Notification.requestPermission()
    if (result !== "granted") {
      markPushPrompted()
      return null
    }
  }

  return getPushToken()
}

/** Registers the token for the signed-in user, skipping duplicates. */
export async function syncPushDevice(token: string): Promise<void> {
  const devices = await api.notifications.devices()
  const existing = devices.results.find((device) => device.token === token)
  if (existing?.is_active) return
  await api.notifications.registerDevice({ token, platform: "web" })
}

/** Called on logout so the server stops pushing to this browser. */
export async function deactivatePushDevice(): Promise<void> {
  const token = readStoredPushToken()
  if (!token) return
  try {
    const devices = await api.notifications.devices()
    const existing = devices.results.find((device) => device.token === token)
    if (existing?.is_active) {
      await api.notifications.deactivateDevice(existing.id)
    }
  } catch {
    // Best effort: the session may already be gone.
  } finally {
    storePushToken(null)
  }
}
