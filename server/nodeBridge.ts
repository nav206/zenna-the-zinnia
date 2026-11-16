import type { IncomingMessage, ServerResponse } from 'node:http'

type FetchApp = {
  fetch: (request: Request) => Response | Promise<Response>
}

/**
 * Bridge Vercel Node (IncomingMessage, ServerResponse) → Hono fetch.
 * Avoids hono/vercel web handle() which can leave Node res hanging → 504.
 */
export async function sendHono(
  app: FetchApp,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const host = req.headers.host ?? 'localhost'
    const protoHeader = req.headers['x-forwarded-proto']
    const proto = Array.isArray(protoHeader)
      ? protoHeader[0]
      : protoHeader?.split(',')[0]?.trim() || 'https'
    const url = new URL(req.url ?? '/', `${proto}://${host}`)

    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
      if (value === undefined) continue
      if (Array.isArray(value)) headers.set(key, value.join(', '))
      else headers.set(key, value)
    }

    const method = req.method ?? 'GET'
    const hasBody = method !== 'GET' && method !== 'HEAD'

    const request = new Request(url, {
      method,
      headers,
      // @ts-expect-error duplex needed when streaming IncomingMessage as body
      body: hasBody ? req : undefined,
      duplex: hasBody ? 'half' : undefined,
    })

    const response = await app.fetch(request)
    res.statusCode = response.status
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'transfer-encoding') return
      res.setHeader(key, value)
    })
    const buf = Buffer.from(await response.arrayBuffer())
    res.end(buf)
  } catch (error) {
    console.error('[zenna-api] bridge error', error)
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
    }
    res.end(JSON.stringify({ error: 'Something wilted on the server.' }))
  }
}
