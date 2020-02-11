import EloRank from 'elo-rank'

import { Match } from '../models/match.model'
import { User } from '../models/user.model'

import { numDifference } from '../helpers/utils'

/**
 * Get a list of the opponents.
 */
// const getOpponentsList = (req) => {
//   return new Promise((resolve, reject) => {
//     User.find({}, (err, users) => {
//       if (err) throw err

//       const filtered = users.filter(user => user.name !== req.user.name)

//       resolve(filtered)
//       return
//     })
//   })
// }

/**
 * Get a list of the opponents.
 */
const getPlayersList = (req) => {
  return new Promise(resolve => {
    User
      .find({})
      .sort({ name: 1 })
      .exec((err, users) => {
        if (err) throw err

        resolve(users)
        return
    })
  })
}

/**
 * Render the match history template.
 */
export const getNewMatch = (req, res) => {
  getPlayersList(req)
    .then(players => {
      res.render('addmatch', {
        players
      })
    })
}

// /**
//  * Take the match values and update the users stats.
//  * @param {Object} p1 player1
//  * @param {Number} p1s player1score
//  * @param {Object} p2 player2
//  * @param {Number} p2s player2score
//  */
// const updateUserStats = async (p1, p1s, p2, p2s, matchId) => {
//   try {
//     let winner
//     let loser

//     // Detemine which player is the winner
//     if (Number(p1s) > Number(p2s)) {
//       winner = { id: p1, points: p1s }
//       loser = { id: p2, points: p2s }
//     } else {
//       winner = { id: p2, points: p2s }
//       loser = { id: p1, points: p1s }
//     }

//     // Calculate score difference
//     winner.diff = winner.points - loser.points
//     loser.diff = loser.points - winner.points

//     // Update User db
//     User
//       .updateOne({ id: winner.id }, {
//         $push: { matches: matchId, 'stats.form': 1 },
//         $inc: {
//           'stats.played': 1,
//           'stats.won': 1,
//           'stats.points': 3,
//           'stats.scoreFor': winner.points,
//           'stats.scoreAgainst': loser.points,
//           'stats.scoreDiff': winner.diff
//         }
//       })
//       .exec()

//     User
//       .updateOne({ id: loser.id }, {
//         $push: { matches: matchId, 'stats.form': 0 },
//         $inc: {
//           'stats.played': 1,
//           'stats.lost': 1,
//           'stats.scoreFor': loser.points,
//           'stats.scoreAgainst': winner.points,
//           'stats.scoreDiff': loser.diff
//         }
//       })
//       .exec()

//     return
//   } catch(err) {
//     return err
//   }
// }

/**
 * Add the match to users matches array.
 * @param {Object} p1 player1
 * @param {Object} p2 player2
 * @param {Object} matchId the match ObjectID
 */
const addMatchesToUsers = async (p1, p2, matchId) => {
  try {
    User
      .findByIdAndUpdate(p1, {
        $push: { matches: matchId }
      })
      .exec()

    User
      .findByIdAndUpdate(p2, {
        $push: { matches: matchId }
      })
      .exec()

    return
  } catch(err) {
    return err
  }
}

/**
 * Check the match entered for any errors.
 */
const handleErrors = (p1, p1s, p2, p2s) => {
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

  if (p1s < 0 || p2s < 0) {
    errors.push({ msg: 'You cannot enter a negative score.' })
  }

  if (p1 === p2) {
    errors.push({ msg: 'You cannot play yourself.' })
  }

  return errors
}

/**
 * Calculate ELO points for match played.
 * Higher the score difference, higher the K factor.
 */
const calculateElo = async (req) => {
  const { p1, p1s, p2, p2s } = req.body
  const scoreDifference = numDifference(p1s, p2s)
  const Elo = new EloRank(28 + (scoreDifference * 2))
  const p1outcome = (Number(p1s) > Number(p2s)) ? 1 : 0
  const p2outcome = (Number(p1s) < Number(p2s)) ? 1 : 0

  let p1Elo
  let p2Elo

  const player1 = await User.findById(p1)
  const player2 = await User.findById(p2)

  const p1ExpectedScore = Elo.getExpected(player1.elo.current, player2.elo.current)
  const p2ExpectedScore = Elo.getExpected(player2.elo.current, player1.elo.current)

  p1Elo = Elo.updateRating(p1ExpectedScore, p1outcome, player1.elo.current)
  p2Elo = Elo.updateRating(p2ExpectedScore, p2outcome, player2.elo.current)

  await User
    .findByIdAndUpdate(p1, {
      'elo.previous': player1.elo.current,
      'elo.current': p1Elo
    })
    .exec()

  await User
    .findByIdAndUpdate(p2, {
      'elo.previous': player2.elo.current,
      'elo.current': p2Elo
    })
    .exec()
}

/**
 * Add a new match.
 */
export const addNewMatch = async (req, res) => {
  const { p1, p1s, p2, p2s, created_by } = req.body

  const errors = handleErrors(p1, p1s, p2, p2s)

  if (errors.length) {
    const players = await getPlayersList(req)

    res.render('addmatch', {
      players,
      errors,
      p1,
      p1s,
      p2,
      p2s
    })
  } else {
    const newMatch = new Match({
      'p1.id': p1,
      'p1.score': p1s,
      'p1.winner': Number(p1s) > Number(p2s),
      'p2.id': p2,
      'p2.score': p2s,
      'p2.winner': Number(p2s) > Number(p1s),
      created_by
    })

    await newMatch.save()
    await addMatchesToUsers(p1, p2, newMatch.id)
    await calculateElo(req)

    req.flash('light_msg', 'New match has been added.')
    res.redirect('/matches/new') // for testing
  }
}
