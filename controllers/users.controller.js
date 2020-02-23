import passport from 'passport'
import bcrypt from 'bcryptjs'

import { User } from '../models/user.model'

/**
 * Get the login template.
 */
export const getLogin = (req, res) => {
  res.render('login')
}

/**
 * Login the user.
 */
export const postLogin = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
}

/**
 * Logout the user.
 */
export const getLogout = (req, res) => {
  req.logout()
  req.flash('success_msg', 'You are logged out.')
  res.redirect('/users/login')
}

/**
 * Get the register template.
 */
export const getRegister = (req, res) => {
  res.render('register')
}

/**
 * Register the user.
 */
export const postRegister = (req, res) => {
  const { name, email, password, password2 } = req.body

  let errors = []

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields.' })
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match.' })
  }

  // Check password length
  if (password.length < 2) {
    errors.push({ msg: 'Password must be at least 6 characters long.' })
  }

  if (errors.length) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    })
  } else {
    User.findOne({ email: email })
      .then(user => {
        if (user) {
          errors.push({ msg: 'Email is already registered.' })

          res.render('register', {
            errors,
            name,
            email,
            password,
            password2
          })
        } else {
          const newUser = new User({
            name,
            email,
            password
          })

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err

              newUser.password = hash

              newUser.save()
                .then(() => {
                  req.flash('success_msg', 'You are now registered and can login.')
                  res.redirect('/users/login')
                })
                .catch(err => console.error(err))
            })
          })
        }
      })
  }
}

/**
 * Get the user account template.
 */
export const getAccount = async (req, res) => {
  const user = await User
    .findById(req.user ? req.user._id : '5e4e3cb17896a746ebdf5a12')

    // TODO: Put users with stats data into it's own component to access for here and leaderboard.
  console.log(user.name)

  res.render('account', {

  })
}

/**
 * Update user password.
 */
export const postChangePassword = (req, res) => {
  const { currentPassword, newPassword, verifyPassword } = req.body

  if (req.user) {
    if (newPassword) {
      User
        .findById(req.user._id)
        .then((err, user) => {
          if (!err & user) {
            passport.authenticate('local'), (req, res) => {

            }
          }
        })
    }
  }

  if (req.user) {
    if (newPassword) {
      User
        .findById(req.user._id, (err, user) => {
          if (!err && user) {
            if (user.authenticate(currentPassword)) {
              if (newPassword === verifyPassword) {
                user.password = newPassword

                user.save((err) => {
                  if (err) {
                    return res.status(422).send({
                      message: 'Error updating password.'
                    })
                  } else {
                    req.login(user, function (err) {
                      if (err) {
                        res.status(400).send(err)
                      } else {
                        res.send({
                          message: 'Password changed successfully.'
                        })
                      }
                    })
                  }
                })
              } else {
                res.status(422).send({
                  message: 'Passwords do not match.'
                })
              }
            } else {
              res.status(422).send({
                message: 'Current password is incorrect.'
              })
            }
          } else {
            res.status(400).send({
              message: 'User is not found.'
            })
          }
      })
    } else {
      res.status(422).send({
        message: 'Please provide a new password.'
      })
    }
  } else {
    res.status(401).send({
      message: 'User is not signed in.'
    })
  }
}