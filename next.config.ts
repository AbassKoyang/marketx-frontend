import type { NextConfig } from "next"

const apiOrigin = (
  process.env.API_PROXY_TARGET ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000"
).replace(/\/$/, "")

const nextConfig: NextConfig = {
  // Let Django own trailing-slash behavior. Without this, Next normalizes
  // `/api/markets/` to `/api/markets`, Django redirects back to the slash,
  // and the proxied request loops.
  skipTrailingSlashRedirect: true,
  experimental: {
    agentUpgrade: "security",
    useOffline: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // Django routes require a trailing slash. Next's `:path*` capture
        // drops one, so add it back instead of triggering Django's redirect.
        destination: `${apiOrigin}/api/:path*/`,
      },
    ]
  },
}

export default nextConfig
