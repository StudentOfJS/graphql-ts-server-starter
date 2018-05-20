import { GraphQLServer } from 'graphql-yoga'
import * as session from 'express-session'
import * as connectRedis from 'connect-redis'
import * as RateLimit from 'express-rate-limit'
import * as RedisRateLimitStore from 'rate-limit-redis'
import * as passport from 'passport'
import { Strategy } from 'passport-twitter'

import { redis } from './redis'
import { createTypeormConn } from "./utils/createTypeormConn"
import { confirmEmail } from './routes/confirmEmail';
import { genSchema } from './utils/genSchema';
import { redisSessionPrefix } from './constants';
import { User } from './entity/User';

const RedisStore = connectRedis(session)

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host"),
      session: request.session,
      req: request
    })
  })

  server.express.use(
    new RateLimit({
      store: new RedisRateLimitStore({
        client: redis
      }),
      windowMs: 15 * 60 * 1000,
      max: 100,
      delayMs: 0
    })
  )
  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: redisSessionPrefix,
      }),
      name: "qid",
      secret: process.env.TEST_HOST as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days

      }
    })
  )

  const cors = {
    credentials: true,
    origin: process.env.NODE_ENV === "test" ? "*" : (process.env.FRONTEND_HOST as string)
  }

  server.express.get("/confirm/:id", confirmEmail)

  await createTypeormConn()

  passport.use(
    new Strategy(
      {
        consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
        callbackURL: "http://localhost:4000/auth/twitter/callback",
        includeEmail: true
      },
      {
        function(token, tokenSecret, profile, cb) {
          User.findOrCreate({ twitterId: profile.id }, function (err, user) {
            return cb(err, user)
          })
        }
      }
    ))

  app.get('/auth/twitter',
    passport.authenticate('twitter'));

  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/login' }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    });
  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  })
  console.log('Server is running on localhost:4000')
  return app
}