import { User } from '../models/user.model'

import { roundNumberTwoDecimals } from '../helpers/utils'

/**
 * Calculate the match stats based on the used being looped over
 * & the match in question.
 * @param {Object} user
 * @param {Object} match
 * @param {Object} stats
 */
const calculateMatchStats = (user, match, stats) => {
  let thisPlayer
  let otherPlayer

  if (user._id.equals(match.p1.id)) {
    thisPlayer = 'p1'
    otherPlayer = 'p2'
  } else {
    thisPlayer = 'p2'
    otherPlayer = 'p1'
  }

  stats.played++
  stats.scoreFor += match[thisPlayer].score
  stats.scoreAgainst += match[otherPlayer].score
  stats.scoreDiff += (match[thisPlayer].score - match[otherPlayer].score)
  stats.points += (match[thisPlayer].winner ? 3 : 0)

  if (match[thisPlayer].winner) {
    stats.won += 1
    stats.form.push(1)
  } else {
    stats.lost += 1
    stats.form.push(0)
  }
}

/**
 * Add users stats to each user by looking through their previous matches.
 * @param {Array} users
 */
const addStatsToUsers = (users) => {
  return new Promise(resolve => {
    const updatedUsers = []

    users.forEach(user => {
      let stats = {
        played: 0,
        won: 0,
        lost: 0,
        scoreFor: 0,
        scoreAgainst: 0,
        scoreDiff: 0,
        points: 0,
        form: []
      }

      user.matches.forEach(match => {
        calculateMatchStats(user, match, stats)
      })

      user.stats = stats

      updatedUsers.push(user)
    })

    resolve(updatedUsers)
  })
}

/**
 * Take the users matches played and how many they've won to work out their win percentage.
 * @param {Array} users
 */
const addWinPercentToUsers = (users) => {
  return new Promise(resolve => {
    const usersWithPercentArr = []

    users.forEach(user => {
      const { won, played } = user.stats

      // If user has no wins/played then return 0
      const percent = (won / played) * 100 || 0

      // Round numbers properly eg. 1.005
      user.stats.winningPercent = roundNumberTwoDecimals(percent)

      usersWithPercentArr.push(user)
    })

    resolve(usersWithPercentArr)
  })
}

/**
 * Sort by Elo points.
 * If users have the same numbers of points, goto score difference
 * @param {Array} users
 */
const sortUsersByElo = (users) => {
  return new Promise(resolve => {
    users.sort((a, b) => {
      let EloA = a.elo.current
      let EloB = b.elo.current
      let scoreDiffA = parseFloat(a.stats.scoreDiff)
      let scoreDiffB = parseFloat(b.stats.scoreDiff)

      if (EloA < EloB) {
        return 1
      } else if (EloA > EloB) {
        return -1
      } else if (EloA === EloB) {
        if (scoreDiffA < scoreDiffB) {
          return 1
        } else if (scoreDiffA > scoreDiffB) {
          return -1
        }
      }

      return 0
    })

    resolve(users)
  })
}

/**
 * Add shortened version of name to each user for use on small screens.
 * @param {Array} users
 */
const formatShortNames = (users) => {
  return new Promise(resolve => {
    const usersWithShortNames = []

    users.forEach(user => {
      const nameSplit = user.name.split(' ')

      user.shortName = `${nameSplit[0]} ${nameSplit[1][0]}`

      usersWithShortNames.push(user)
    })

    resolve(usersWithShortNames)
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
        user.ranked = true

        splitUsers.ranked.push(user)
      } else {
        user.ranked = false

        splitUsers.unranked.push(user)
      }
    })

    resolve(splitUsers)
  })
}

const populateLeaderboard = async () => {
  try {
    let users = await User
      .find()
      .populate({
        path: 'matches',
      })
      .lean()
      .exec()

    users = await addStatsToUsers(users)
    users = await addWinPercentToUsers(users)
    users = await sortUsersByElo(users)
    users = await formatShortNames(users)
    users = await limitUsersForm(users)
    users = await splitIntoMinimumPlayed(users)

    return users
  } catch(err) {
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