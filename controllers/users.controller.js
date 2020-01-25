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
  if (password.length < 6) {
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
                .catch(err => console.log(err))
            })
          })
        }
      })
  }
}