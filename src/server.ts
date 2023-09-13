import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import axios from 'axios'
import passport from 'passport'
import { Strategy as GitHubStrategy, Profile } from 'passport-github2'
import dotenv from 'dotenv'
import { query } from './utils'

dotenv.config()

interface CustomUser extends Profile {
  accessToken: string
}

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (obj: any, done) {
  done(null, obj)
})

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      callbackURL: `${process.env.BASE_URL}/auth/github/callback`,
    },
    (accessToken: string, refreshToken: string, profile: any, done: any) => {
      profile.accessToken = accessToken
      done(null, profile)
    }
  )
)

const app = express()
app.use(session({ secret: 'test', resave: false, saveUninitialized: false }))
app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())

app.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email', 'repo:public_repo'] })
)

app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    const accessToken = (req.user as CustomUser).accessToken
    res.cookie('accessToken', accessToken)
    res.redirect(`${process.env.BASE_URL}/fetch-discussions`)
  }
)

app.get('/fetch-discussions', async (req, res) => {
  const accessToken = req.cookies.accessToken
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

    res.json({ data: response.data })
  } catch (error) {
    res.json({ error })
  }
})

app.listen({ port: 8000 })
