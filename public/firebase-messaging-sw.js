/**
 * Firebase Cloud Messaging service worker for MarketX.
 *
 * The web app registers this file with the public Firebase config appended as
 * query parameters (`/firebase-messaging-sw.js?apiKey=…&projectId=…`), because
 * files in `public/` are served verbatim and cannot read `NEXT_PUBLIC_*` env
 * vars at runtime.
 */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js")
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
)

const params = new URL(self.location.href).searchParams

const config = {
  apiKey: params.get("apiKey") || undefined,
  authDomain: params.get("authDomain") || undefined,
  projectId: params.get("projectId") || undefined,
  storageBucket: params.get("storageBucket") || undefined,
  messagingSenderId: params.get("messagingSenderId") || undefined,
  appId: params.get("appId") || undefined,
  measurementId: params.get("measurementId") || undefined,
}

/** Keep this in sync with `lib/notifications.ts`. */
function destinationFor(data) {
  const slug = data.market_slug
  switch (data.event_type) {
    case "order_filled":
    case "market_closed":
      return slug ? `/markets/${slug}` : "/portfolio/orders"
    case "order_cancelled":
      return "/portfolio/orders"
    case "position_settled":
      return "/portfolio/positions"
    default:
      return "/notifications"
  }
}

if (config.apiKey && config.projectId && config.messagingSenderId && config.appId) {
  firebase.initializeApp(config)

  const messaging = firebase.messaging()

  messaging.onBackgroundMessage((payload) => {
    const data = payload.data || {}
    const title = payload.notification?.title || "MarketX"
    const body = payload.notification?.body || ""

    self.registration.showNotification(title, {
      body,
      icon: "/icon-512.png",
      badge: "/icon-512.png",
      tag: data.notification_id ? `marketx-${data.notification_id}` : undefined,
      data: {
        url: destinationFor(data),
        notificationId: data.notification_id || null,
      },
    })
  })
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url =
    (event.notification.data && event.notification.data.url) || "/notifications"

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          const clientUrl = new URL(client.url)
          if (clientUrl.origin !== self.location.origin) continue
          clientUrl.pathname = url.split("?")[0]
          clientUrl.search = url.includes("?") ? `?${url.split("?")[1]}` : ""
          return client.focus().then(() => {
            if ("navigate" in client) return client.navigate(clientUrl.href)
            return undefined
          })
        }
        return self.clients.openWindow(url)
      })
  )
})
