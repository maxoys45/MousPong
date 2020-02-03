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
    User.find({}, (err, users) => {
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
  // getOpponentsList(req)
  //   .then(opponents => {
  //     res.render('addmatch', {
  //       user: req.user,
  //       opponents
  //     })
  //   })
  getPlayersList(req)
    .then(players => {
      res.render('addmatch', {
        user: req.user,
        players
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
//       .updateOne({ _id: winner.id }, {
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
//       .updateOne({ _id: loser.id }, {
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
//   } catch (err) {
//     return err
//   }
// }

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
  } catch (err) {
    return err
  }
}

/**
 * Add a new match.
 */
export const addNewMatch = (req, res) => {
  const { p1, p1s, p2, p2s, created_by } = req.body

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

  if (errors.length) {
    getPlayersList(req)
      .then(players => {
        res.render('addmatch', {
          user: req.user,
          players,
          errors,
          p1,
          p1s,
          p2,
          p2s
        })
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

    newMatch.save()
      .then(() => {
        addMatchesToUsers(p1, p2, newMatch._id)
          .then(() => {
            req.flash('light_msg', 'New match has been added.')
            res.redirect('/matches/new')
          })
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
    .populate('p1.id')
    .populate('p2.id')
    .exec((err, matches) => {
      if (err) throw err

      res.render('history', {
        user: req.user,
        matches
      })
    })
}

// const deletePlayerMatchStats = (match) => {
//   return new Promise((resolve, reject) => {

//   })
// }

// const deleteMatch = async (req, res) => {
//   try {
//     let match = await Match.findById(req.params.id).populate('player1').populate('player2').exec()
//     match = await deletePlayerMatchStats(match)
//     users = await limitUsersForm(users)
//     users = await splitIntoMinimumPlayed(users)

//     return users
//   } catch (err) {
//     return err
//   }
// }

/**
 * Delete a match using the match ID.
 */
export const deleteMatch = (req, res) => {

  Match
    .findById(req.params.id)
      .populate('p1.id')
      .populate('p2.id')
      .populate('created_by')
      .exec((err, match) => {
        if (err) throw err

        console.log(match)
      })
  // Match
  //   .findByIdAndRemove(req.params.id)
  //   .exec()
  //   .then(doc => {
  //     if (!doc) res.status(404).end()

  //     req.flash('light_msg', 'Match has been deleted.')
  //     res.status(204).redirect('/matches/history')
  //   })
  //   .catch(err => next(err))
}
