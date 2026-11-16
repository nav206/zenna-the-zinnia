import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, type Plugin } from 'vite'

/**
 * Mount the Hono `/api` app inside Vite so local `npm run dev` exercises
 * the same handlers Vercel serves from `api/[[...route]].ts`.
 */
function zennaApiPlugin(): Plugin {
  return {
    name: 'zenna-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          next()
          return
        }
        try {
          const mod = (await server.ssrLoadModule('/server/app.ts')) as {
            app: {
              fetch: (
                request: Request,
                Env?: unknown,
                executionCtx?: unknown,
              ) => Response | Promise<Response>
            }
          }
          const { getRequestListener } = await import('@hono/node-server')
          const listener = getRequestListener((request) => mod.app.fetch(request))
          listener(req as IncomingMessage, res as ServerResponse)
        } catch (error) {
          console.error('[zenna-api]', error)
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: 'API failed to start.' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), zennaApiPlugin()],
  server: {
    host: true,
    port: 5173,
  },
  ssr: {
    external: ['@electric-sql/pglite', 'pg', 'bcryptjs'],
  },
})
