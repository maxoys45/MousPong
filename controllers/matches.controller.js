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
    .then(opponents => {
      res.render('addmatch', {
        user: req.user,
        opponents
      })
    })
}

/**
 * Take the match values and update the users stats.
 * @param {Object} p1 player1
 * @param {Number} p1s player1score
 * @param {Object} p2 player2
 * @param {Number} p2s player2score
 */
const updateUserStats = (p1, p1s, p2, p2s) => {
  // return new Promise((resolve, reject) => {
    let winner
    let loser

    if (Number(p1s) > Number(p2s)) {
      winner = p1
      loser = p2
    } else {
      winner = p2,
      loser = p1
    }

    User.updateOne({ _id: winner }, {
      $inc: { "stats.played": 1, "stats.won": 1, "stats.points": 3 }
    }).exec()

    User.updateOne({ _id: loser }, {
      $inc: { "stats.played": 1, "stats.lost": 1 }
    }).exec()
  // })
}

/**
 * Add a new match.
 */
export const addNewMatch = (req, res) => {
  const { player1, player1score, player2, player2score } = req.body

  let errors = []

  if (!player1 || !player1score || !player1 || !player2score) {
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
    updateUserStats(player1, player1score, player2, player2score)

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
      .catch (err => console.error(err))
  }
}

/**
 * Get the match history and render the template.
 */
export const getMatches = (req, res) => {
  Match
    .find({}, null, { sort: { date: -1 }})
    .populate('player1')
    .populate('player2')
    .exec((err, matches) => {
      if (err) throw err

      res.render('history', {
        matches
      })
    })
}

/**
 * TODO: Added stats to players, need to push that data when adding a match so i can loop over it on leaderboard page.
 */