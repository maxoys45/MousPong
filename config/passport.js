import bcrypt from 'bcryptjs'
import passportLocal from 'passport-local'

import { User } from '../models/user.model'

const LocalStrategy = passportLocal.Strategy

export default (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match email
      User.findOne({ email: email })
        .then(user => {
          if (!user) {
            return done(null, false, { message: 'That email is not registered.' })
          }

          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err

            if (!isMatch) {
              return done(null, false, { message: 'Password incorrect.' })
            }

            return done(null, user)
          })
        })
        .catch(err => console.error(err))
    })
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    })
  })
}