import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import axios from 'axios'
import passport from 'passport'
import { Strategy as GitHubStrategy, Profile } from 'passport-github2'
import { handleData, query, generateHTMLString } from './utils'

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
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: `${process.env.BASE_URL}/auth/github/callback`,
    },
    (accessToken: string, _refreshToken: string, profile: any, done: any) => {
      profile.accessToken = accessToken
      done(null, profile)
    }
  )
)

const app = express()
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
  })
)
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
    res.redirect(`${process.env.BASE_URL}`)
  }
)

app.get('/', async (req, res) => {
  const accessToken = req.cookies.accessToken
  if (!accessToken) {
    res.redirect('/auth/github')
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
    const htmlString = generateHTMLString(data)
    res.send(htmlString)
  } catch (error) {
    res.json({ error })
  }
})

app.listen({ port: 8000 })
