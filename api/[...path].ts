import app from '../lib/zenna-api.js'

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
}

async function sendHono(app: { fetch: (request: Request) => Response | Promise<Response> }, req: any, res: any): Promise<void> {
  try {
    const host = req.headers?.host ?? "localhost"
    const protoHeader = req.headers?.["x-forwarded-proto"]
    const proto = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader?.split(",")[0]?.trim() || "https"
    const url = new URL(req.url ?? "/", `${proto}://${host}`)
    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers ?? {})) {
      if (value === undefined) continue
      if (Array.isArray(value)) headers.set(key, value.join(", "))
      else headers.set(key, String(value))
    }
    const method = req.method ?? "GET"
    const hasBody = method !== "GET" && method !== "HEAD"
    const request = new Request(url, {
      method,
      headers,
      body: hasBody ? req : undefined,
      // @ts-expect-error duplex for Node request body stream
      duplex: hasBody ? "half" : undefined,
    })
    const response = await app.fetch(request)
    res.statusCode = response.status
    response.headers.forEach((value: string, key: string) => {
      if (key.toLowerCase() === "transfer-encoding") return
      res.setHeader(key, value)
    })
    res.end(Buffer.from(await response.arrayBuffer()))
  } catch (error) {
    console.error("[zenna-api] bridge error", error)
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader("Content-Type", "application/json; charset=utf-8")
    }
    res.end(JSON.stringify({ error: "Something wilted on the server." }))
  }
}

/** Catch-all for /api/* on Vite + Vercel (non-Next file-system functions). */
export default async function handler(req: any, res: any): Promise<void> {
  await sendHono(app, req, res)
}
