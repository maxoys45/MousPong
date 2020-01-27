import { User } from '../models/user.model'

/**
 * Take the users matches played and how many they've won to work out their win percentage.
 * @param {Array} users the returned users array
 */
const addWinPercentToUsers = (users) => {
  return new Promise((resolve, reject) => {
    let usersWithPercentArr = []

    users.forEach(user => {
      const { won, played } = user.stats

      // If user has no wins/played then return 0
      const percent = won / played * 100 || 0

      // Round numbers properly eg. 1.005
      user.stats.winningPercent = Math.round((percent + Number.EPSILON) * 100) / 100

      usersWithPercentArr.push(user)
    })

    // Sort based on winning percentage
    usersWithPercentArr.sort((a, b) => {
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

    resolve(usersWithPercentArr)

    return
  })
}

/**
 * Take each users form array and limit to the last 5 entries.
 * @param {Array} users the user object with winning percentage property.
 */
const limitUsersForm = (users) => {
  return new Promise((resolve, reject) => {
    let usersWithLimitedForm = []

    users.forEach(user => {
      let { form } = user.stats
      const limitedForm = (form.length >= 5) ? form.slice((form.length - 5), form.length) : form

      user.stats.last5 = limitedForm

      usersWithLimitedForm.push(user)
    })

    resolve(usersWithLimitedForm)
  })
}

/**
 * Get all the users and return them in winning percentage order.
 */
const populateLeaderboard = async () => {
  try {
    let users = await User.find({}).populate('matches').exec()
    users = await addWinPercentToUsers(users)
    users = await limitUsersForm(users)

    return users
  } catch (err) {
    return err
  }
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