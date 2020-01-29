import { User } from '../models/user.model'

/**
 * Take the users matches played and how many they've won to work out their win percentage.
 * @param {Array} users the returned users array
 */
const addWinPercentToUsers = (users) => {
  return new Promise(resolve => {
    const usersWithPercentArr = []

    users.forEach(user => {
      const { won, played } = user.stats

      // If user has no wins/played then return 0
      const percent = won / played * 100 || 0

      // Round numbers properly eg. 1.005
      user.stats.winningPercent = Math.round((percent + Number.EPSILON) * 100) / 100

      usersWithPercentArr.push(user)
    })

    // Sort based on winning percentage,
    // If win percent is the same, goto score difference
    usersWithPercentArr.sort((a, b) => {
      let winPercentA = parseFloat(a.stats.winningPercent)
      let winPercentB = parseFloat(b.stats.winningPercent)
      let scoreDiffA = parseFloat(a.stats.scoreDiff)
      let scoreDiffB = parseFloat(b.stats.scoreDiff)

      if (winPercentA < winPercentB) {
        return 1
      } else if (winPercentA > winPercentB) {
        return -1
      } else if (winPercentA === winPercentB) {
        if (scoreDiffA < scoreDiffB) {
          return 1
        } else if (scoreDiffA > scoreDiffB) {
          return -1
        }
      }

      return 0
    })

    resolve(usersWithPercentArr)

    return
  })
}

/**
 * Take each users form array and limit to the last 5 entries.
 * @param {Array} users the users array with winning percentage property.
 */
const limitUsersForm = (users) => {
  return new Promise(resolve => {
    const usersWithLimitedForm = []

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
 * Split the users into 2 groups based on if they've played enough games to be ranked.
 * @param {Array} users the users array passed from previous functions.
 */
const splitIntoMinimumPlayed = (users) => {
  return new Promise(resolve => {
    const splitUsers = {
      ranked: [],
      unranked: [],
    }

    users.forEach(user => {
      if (user.stats.played >= 5) {
        splitUsers.ranked.push(user)
      } else {
        splitUsers.unranked.push(user)
      }
    })

    resolve(splitUsers)
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
    users = await splitIntoMinimumPlayed(users)

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