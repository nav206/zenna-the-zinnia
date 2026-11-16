import type { IncomingMessage, ServerResponse } from 'node:http'
import { sendHono } from '../server/nodeBridge.js'
import app from '../lib/zenna-api.js'

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await sendHono(app, req, res)
}
