import { getRequestListener } from '@hono/node-server'
import type { IncomingMessage, ServerResponse } from 'node:http'
import app from '../lib/zenna-api.js'

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
}

const listener = getRequestListener(app.fetch)

export default function handler(
  req: IncomingMessage,
  res: ServerResponse,
): void {
  listener(req, res)
}
