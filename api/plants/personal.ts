import app from '../../lib/zenna-api.js'
import { sendHono } from '../../lib/send-hono.js'

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
}

export default async function handler(req: any, res: any): Promise<void> {
  await sendHono(app, req, res, '/api/plants/personal')
}
