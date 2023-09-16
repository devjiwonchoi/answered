import express, { type Express } from 'express'
import axios from 'axios'
import { handleData, query, generateSVGString } from './utils'

const accessToken = process.env.GITHUB_ACCESS_TOKEN

const app = express()

app.get('/api', async (_req, res) => {
  if (!accessToken) {
    res.redirect('/no-access-token')
    return
  }
  try {
    const response = await axios.post(
      'https://api.github.com/graphql',
      { query },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    const data = handleData(response.data)
    const svgString = generateSVGString(data)

    res.setHeader('Content-Type', 'image/svg+xml')
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
    res.send(svgString)
  } catch (error: any) {
    res.json({ message: error.message })
  }
})

app.get('/api/no-access-token', (_req, res) => {
  res.status(401).json({
    error: 'Missing access token',
    message:
      'Please set the valid GITHUB_ACCESS_TOKEN environment variable. For more information, please visit https://github.com/devjiwonchoi/answered?tab=readme-ov-file#env',
  })
})

app.listen({ port: 8000 })

export default app as Express
