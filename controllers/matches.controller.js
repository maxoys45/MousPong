import { Match } from '../models/match.model'
import { User } from '../models/user.model'

/**
 * Get a list of the opponents.
 */
const getOpponentsList = (req) => {
  return new Promise((resolve, reject) => {
    User.find({}, (err, users) => {
      if (err) throw err

      const filtered = users.filter(user => user.name !== req.user.name)

      resolve(filtered)
      return
    })
  })
}

/**
 * Render the match history template.
 */
export const getNewMatch = (req, res) => {
  getOpponentsList(req)
    .then((opponents) => {
      res.render('addmatch', {
        user: req.user,
        opponents
      })
    })
}

/**
 * Add a new match.
 */
export const addNewMatch = (req, res) => {
  const { player1, player1score, player2, player2score } = req.body

  let errors = []

  if (!player1 || !player1score || !player2 || !player2score) {
    errors.push({ msg: 'Please enter both scores and the opponent.' })
  }

  if (player1score === player2score) {
    errors.push({ msg: 'Games cannot end in a draw.' })
  }

  if (player1score < 11 && player2score < 11) {
    errors.push({ msg: 'The scores entered are too low.' })
  }

  if (errors.length) {
    getOpponentsList(req)
      .then((opponents) => {
        res.render('addmatch', {
          user: req.user,
          opponents,
          errors,
          player1,
          player1score,
          player2,
          player2score
        })
      })
  } else {
    const newMatch = new Match({
      player1,
      player1score,
      player2,
      player2score
    })

    newMatch.save()
      .then(() => {
        req.flash('success_msg', 'New match has been added.')
        res.redirect('/')
      })
      .catch (err => console.log(err))
  }
}

/**
 * Get the match history and render the template.
 */
export const getMatches = (req, res) => {
  Match.find({}, null, { sort: { date: -1 }}, (err, matches) => {
    if (err) throw err

    res.render('history', {
      matches
    })
  })
}