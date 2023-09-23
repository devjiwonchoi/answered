import express, { type Express } from 'express'
import { GITHUB_ACCESS_TOKEN } from '../src/constants'
import { handleData, query, generateSVGString, fetcher } from '../src/utils'

const app = express()

app.get('/api', async (req, res) => {
  if (!GITHUB_ACCESS_TOKEN) res.redirect('/api/invalid-access-token')

  const { username } = req.query
  const variables = { login: username as string }

  try {
    const data = await fetcher({ query, variables })
    const resolvedData = handleData(data)
    const svgString = generateSVGString(resolvedData)
    res
      .setHeader('Content-Type', 'image/svg+xml')
      .setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
      .send(svgString)
  } catch (error: any) {
    res.json({ message: error.message })
  }
})

app.get('/api/invalid-access-token', (_req, res) => {
  res.status(401).json({
    error: 'Invalid access token',
    message:
      'Please set the valid GITHUB_ACCESS_TOKEN env variable. For more information, please visit https://github.com/devjiwonchoi/answered?tab=readme-ov-file#env',
  })
})

app.listen({ port: 8000 }, () => {
  console.log('Server is running on http://localhost:8000')
})

export default app as Express
