import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import flash from 'connect-flash'
import mongoose from 'mongoose'
import passport from 'passport'
import session from 'express-session'

import db from './config/keys'
import func from './config/passport'

import leaderboardRouter from './routes/leaderboard.route'
import userRouter from './routes/users.route'
import matchRouter from './routes/matches.route'

const app = express()

// Passport config
func(passport)

// Connect to Mongo
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
  .then(() => console.log('MongoDB Connected...\n====================\n++++++++++++++++++++\n===================='))
  .catch(err => console.error(err))

// Public folder
app.use(express.static(__dirname + '/public'));

// EJS
app.use(expressLayouts)
app.set('view engine', 'ejs')

// Public folder
app.use(express.static(__dirname + '/public'))

// Bodyparser
app.use(express.urlencoded({ extended: false }))

// Express session
app.use(session({
  secret: 'keyboard catoys45',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 86400000 // 24 hours
  }
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Connect flash
app.use(flash())

// Global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.light_msg = req.flash('light_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')

  next()
})

// Routes
app.use('/', leaderboardRouter)
app.use('/users', userRouter)
app.use('/matches', matchRouter)

// Listen to server
const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Started on ${PORT}`))
