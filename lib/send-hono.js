/**
 * Bridge Vercel Node (req, res) → Hono fetch.
 * Normalizes paths so /auth/signup and /api/auth/signup both work.
 */
export async function sendHono(app, req, res, pathOverride) {
  try {
    const host = req.headers?.host ?? 'localhost'
    const protoHeader = req.headers?.['x-forwarded-proto']
    const proto = Array.isArray(protoHeader)
      ? protoHeader[0]
      : protoHeader?.split(',')[0]?.trim() || 'https'

    const headerPath =
      pathOverride ||
      headerString(req.headers?.['x-forwarded-uri']) ||
      headerString(req.headers?.['x-invoke-path']) ||
      req.url ||
      '/'

    let pathname = headerPath
    let search = ''
    if (pathname.startsWith('http://') || pathname.startsWith('https://')) {
      const absolute = new URL(pathname)
      pathname = absolute.pathname
      search = absolute.search
    } else {
      const q = pathname.indexOf('?')
      if (q >= 0) {
        search = pathname.slice(q)
        pathname = pathname.slice(0, q)
      }
    }

    // Ignore Vercel's internal matched pattern if it leaked through.
    if (pathname.includes('[...') || pathname.includes('[[...')) {
      pathname = req.url?.split('?')[0] || '/'
    }

    if (!pathname.startsWith('/')) pathname = `/${pathname}`

    // Catch-all handlers sometimes see /auth/signup without the /api prefix.
    if (pathname === '/' || pathname === '') {
      const slug = req.query?.path ?? req.query?.slug
      if (Array.isArray(slug) && slug.length) {
        pathname = `/api/${slug.join('/')}`
      } else if (typeof slug === 'string' && slug) {
        pathname = `/api/${slug}`
      }
    } else if (!pathname.startsWith('/api/') && pathname !== '/api') {
      pathname = `/api${pathname}`
    }

    const url = new URL(`${pathname}${search}`, `${proto}://${host}`)
    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers ?? {})) {
      if (value === undefined) continue
      if (Array.isArray(value)) headers.set(key, value.join(', '))
      else headers.set(key, String(value))
    }

    const method = req.method ?? 'GET'
    const hasBody = method !== 'GET' && method !== 'HEAD'
    const request = new Request(url, {
      method,
      headers,
      body: hasBody ? req : undefined,
      duplex: hasBody ? 'half' : undefined,
    })

    const response = await app.fetch(request)
    res.statusCode = response.status
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'transfer-encoding') return
      res.setHeader(key, value)
    })
    res.end(Buffer.from(await response.arrayBuffer()))
  } catch (error) {
    console.error('[zenna-api] bridge error', error)
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
    }
    res.end(JSON.stringify({ error: 'Something wilted on the server.' }))
  }
}

function headerString(value) {
  if (Array.isArray(value)) return value[0]
  return typeof value === 'string' ? value : ''
}
