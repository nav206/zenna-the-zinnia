import { handle } from 'hono/vercel'
import app from '../server/app'

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
}

/** Catch-all for /api/* on Vite + Vercel (non-Next file-system functions). */
export default handle(app)
