import type { Response } from 'express'

export const InvalidAccessTokenResponse = (res: Response) =>
  res.status(401).json({
    error: 'Invalid access token',
    message:
      'Please set the valid GITHUB_ACCESS_TOKEN env variable. For more information, please visit https://github.com/devjiwonchoi/answered?tab=readme-ov-file#env',
  })

export const InvalidUsernameResponse = (res: Response) =>
  res.status(404).json({
    error: 'Invalid Username',
    message:
      'Please provide a valid username using `?username=<username>` query parameter.',
  })
