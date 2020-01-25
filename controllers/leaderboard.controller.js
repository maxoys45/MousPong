import { Match } from '../models/match.model'

/**
 * Populate the leaderboard standings.
 */
const populateLeaderboard = () => {
  return new Promise((resolve, reject) => {
    Match.find({}, (err, matches) => {
      if (err) throw err

      resolve(matches)
      return
    })
  })
}

/**
 * Get the leaderboard template.
 */
export const getLeaderboard = (req, res) => {
  populateLeaderboard(req)
    .then((standings) => {
      res.render('leaderboard', {
        user: req.user,
        standings
      })
    })
}