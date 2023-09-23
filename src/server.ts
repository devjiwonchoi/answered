import express, { type Express } from 'express'
import { handleData, query, generateSVGString } from './utils'

const accessToken = process.env.GITHUB_ACCESS_TOKEN

const app = express()

app.get('/api', async (req, res) => {
  if (!accessToken) res.redirect('/api/invalid-access-token')

  const { username } = req.query
  const variables = { login: username }
  try {
    const response = await fetch('https://api.github.com/graphql', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: 'POST',
      body: JSON.stringify({ query, variables }),
    })
    const data = await response.json()
    const resolvedData = handleData(data)
    const svgString = generateSVGString(resolvedData)

    res.setHeader('Content-Type', 'image/svg+xml')
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
    res.send(svgString)
  } catch (error: any) {
    res.json({ message: error.message })
  }
})

app.get('/api/invalid-access-token', (req, res) => {
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
