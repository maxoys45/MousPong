import { User } from '../models/user.model'

/**
 * Get all the users and return them in winning percentage order.
 */
const populateLeaderboard = () => {
  return new Promise((resolve, reject) => {
    // User.find({}, null, { sort: { "stats.points": -1 }}, (err, users) => {
    User.find({})
      .populate('matches')
      .exec((err, users) => {
        if (err) throw err

        let usersWithPercent = []

        users.forEach(user => {
          // If user has no wins/played then return 0
          const percent = user.stats.won / user.stats.played * 100 || 0

          // Round numbers properly eg. 1.005
          user.stats.winningPercent = Math.round((percent + Number.EPSILON) * 100) / 100

          usersWithPercent.push(user)
        })

        // Sort based on winning percentage
        usersWithPercent.sort((a, b) => {
          let valA
          let valB

          valA = parseFloat(a.stats.winningPercent)
          valB = parseFloat(b.stats.winningPercent)

          if (valA < valB) {
            return 1
          } else if (valA > valB) {
            return -1
          }

          return 0
        })

        console.log(usersWithPercent[0])

        resolve(usersWithPercent)

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