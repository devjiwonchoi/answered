import express from 'express'
import type { Express, Request, Response } from 'express'
import { GITHUB_ACCESS_TOKEN } from '../src/constants'
import {
  InvalidAccessTokenResponse,
  InvalidUsernameResponse,
} from '../src/response'
import { handleData, query, generateSVGString, fetcher } from '../src/utils'

const app = express()

app.get('/api', async (req: Request, res: Response) => {
  if (!GITHUB_ACCESS_TOKEN) return res.redirect('/api/invalid-access-token')

  const { username, json } = req.query
  if (!username) return InvalidUsernameResponse(res)

  const variables = { login: username as string }
  try {
    const data = handleData(await fetcher({ query, variables }))
    if (json) return res.json(data)

    const svgString = generateSVGString(data)
    res
      .setHeader('Content-Type', 'image/svg+xml')
      .setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
      .send(svgString)
  } catch (error: any) {
    res.json({ message: error.message })
  }
})

app.get('/api/invalid-access-token', (_req: Request, res: Response) =>
  InvalidAccessTokenResponse(res)
)

app.listen({ port: 8000 }, () => {
  console.log('Server is running on http://localhost:8000')
})

export default app as Express
