import { Match } from '../models/match.model'
import { User } from '../models/user.model'

import { numDifference } from '../helpers/utils'

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
const updateUserStats = (p1, p1s, p2, p2s, matchId) => {
  // return new Promise((resolve, reject) => {
    let winner
    let loser

    // Detemine which player is the winner
    if (Number(p1s) > Number(p2s)) {
      winner = { id: p1, points: p1s }
      loser = { id: p2, points: p2s }
    } else {
      winner = { id: p2, points: p2s }
      loser = { id: p1, points: p1s }
    }

    // Calculate score difference
    winner.diff = winner.points - loser.points
    loser.diff = loser.points - winner.points

    // Update User db
    User.updateOne({ _id: winner.id }, {
      $push: { matches: matchId, 'stats.form': 1 },
      $inc: {
        'stats.played': 1,
        'stats.won': 1,
        'stats.points': 3,
        'stats.scoreFor': winner.points,
        'stats.scoreAgainst': loser.points,
        'stats.scoreDiff': winner.diff
      }
    }).exec()

    User.updateOne({ _id: loser.id }, {
      $push: { matches: matchId, 'stats.form': 0 },
      $inc: {
        'stats.played': 1,
        'stats.lost': 1,
        'stats.scoreFor': loser.points,
        'stats.scoreAgainst': winner.points,
        'stats.scoreDiff': loser.diff
      }
    }).exec()
  // })
}

/**
 * Add a new match.
 */
export const addNewMatch = (req, res) => {
  const { player1: p1, player1score: p1s, player2: p2, player2score: p2s } = req.body

  let errors = []

  if (!p1 || !p1s || !p2 || !p2s) {
    errors.push({ msg: 'Please enter both scores and the opponent.' })
  }

  if (p1s === p2s) {
    errors.push({ msg: 'Games cannot end in a draw.' })
  }

  if (p1s < 11 && p2s < 11) {
    errors.push({ msg: 'The scores entered are too low.' })
  }

  if (p1s >= 10 && p2s >= 10 && numDifference(p1s, p2s) !== 2) {
    errors.push({ msg: 'In overtime, a match must finish with a difference of 2.' })
  }

  if (p1s > 11 && p2s < 9 || p1s < 9 && p2s > 11) {
    errors.push({ msg: 'You cannot score more than 11 points unless in overtime.' })
  }

  if (errors.length) {
    getOpponentsList(req)
      .then((opponents) => {
        res.render('addmatch', {
          user: req.user,
          opponents,
          errors,
          player1: p1,
          player1score: p1s,
          player2: p2,
          player2score: p2s
        })
      })
  } else {
    const newMatch = new Match({
      player1: p1,
      player1score: p1s,
      player2: p2,
      player2score: p2s
    })

    updateUserStats(p1, p1s, p2, p2s, newMatch._id)

    newMatch.save()
      .then(() => {
        req.flash('light_msg', 'New match has been added.')
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