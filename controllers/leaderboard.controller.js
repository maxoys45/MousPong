import { User } from '../models/user.model'

/**
 * Populate the leaderboard standings.
 */
const getUsers = () => {
  return new Promise((resolve, reject) => {
    User.find({}, (err, users) => {
      if (err) throw err

      resolve(users)
      return
    })
  })
}

const populateLeaderboard = () => {
  return new Promise((resolve, reject) => {
    getUsers()
      .then(users => {
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
    .then((standings) => {
      res.render('leaderboard', {
        user: req.user,
        standings
      })
    })
}