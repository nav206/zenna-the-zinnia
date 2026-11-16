import { handle } from 'hono/vercel'
import app from '../lib/zenna-api.js'

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
}

export default handle(app)
