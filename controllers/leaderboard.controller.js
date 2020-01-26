import { User } from '../models/user.model'

const populateLeaderboard = () => {
  return new Promise((resolve, reject) => {
    User.find({}, null, { sort: { "stats.points": -1 }}, (err, users) => {
      if (err) throw err

      resolve(users)
      return
    })
  })
}

/**
 * Get the leaderboard template.
 */
export const getLeaderboard = (req, res) => {
  populateLeaderboard()
    .then(standings => {
      res.render('leaderboard', {
        user: req.user,
        standings
      })
    })
}