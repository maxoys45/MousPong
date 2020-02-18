import moment from 'moment'

import { Match } from '../models/match.model'
import { User } from '../models/user.model'

const addFormattedDateToMatch = (matches) => {
  return new Promise(resolve => {
    const matchesWithDates = []

    matches.forEach(match => {
      match.formattedDate = moment(match.date).format('LL')
      match.shortDate = moment(match.date).format('DD/MM')

      matchesWithDates.push(match)
    })

    resolve(matchesWithDates)
  })
}

/**
 * Check whether the match happened in the last 12 hours.
 * If so, set recent property to true.
 * @param {Array} matches matches retrieved from db
 */
const addRecentMatchDate = (matches) => {
  return new Promise(resolve => {
    const matchesWithRecentDate = []

    // matches[0].recent = true
    matches.forEach(match => {
      // If match happened in the last 5 mins
      match.recent = match.date >= new Date(new Date().getTime()) - (1 * 1 * 5 * 60 * 1000)

      matchesWithRecentDate.push(match)
    })

    resolve(matchesWithRecentDate)
  })
}

const addShortNamesToMatchPlayers = (matches) => {
  return new Promise(resolve => {
    const shortNamesOnMatchPlayers = []

    matches.forEach(match => {
      const p1_split = match.p1.id.name.split(' ')
      const p2_split = match.p2.id.name.split(' ')

      match.p1.id.shortName = `${p1_split[0]} ${p1_split[1][0]}`
      match.p2.id.shortName = `${p2_split[0]} ${p2_split[1][0]}`

      shortNamesOnMatchPlayers.push(match)
    })

    resolve(shortNamesOnMatchPlayers)
  })
}
/**
 * Populate match history.
 */
const populateMatches = async () => {
  try {
    let matches = await Match
      .find({}, null, { sort: { date: -1 }})
      .populate('p1.id')
      .populate('p2.id')
      .lean()
      .exec()

    // matches = await addRecentMatchDate(matches)
    matches = await addFormattedDateToMatch(matches)
    matches = await addShortNamesToMatchPlayers(matches)

    return matches
  } catch(err) {
    return err
  }
}

/**
 * Get the match history and render the template.
 */
export const getMatches = (req, res) => {
  populateMatches()
    .then(matches => {
      res.render('history', {
        matches
      })
    })
}

/**
 * Get the latest match played.
 */
const getLatestMatch = () => {
  return new Promise(resolve => {
    const latestMatch = Match
      .findOne()
      .sort({ 'date': -1 })
      .lean()
      .exec()

    resolve(latestMatch)
  })
}

/**
 * Reset the Elo of the matches players to the previous value.
 * @TODO: Grab last element from previous array instead of having to set it as a variable separately??
 * @param {Object} latestMatch
 */
const resetEloToPreviousState = async (latestMatch) => {
  const player1 = await User.findById(latestMatch.p1.id)
  const player2 = await User.findById(latestMatch.p2.id)
  const p1LastElo = player1.elo.previous[player1.elo.previous.length - 1]
  const p2LastElo = player2.elo.previous[player2.elo.previous.length - 1]

  if (!player1.elo.previous.length || !player2.elo.previous.length) {
    throw new Error('User doesn\'t have enough previous Elo entries to delete match.')
  }

  console.log("i dont run if error")

  await User
    .findByIdAndUpdate(latestMatch.p1.id, {
      'elo.current': p1LastElo,
      $pop: { 'elo.previous': 1 },
    })

  await User
    .findByIdAndUpdate(latestMatch.p2.id, {
      'elo.current': p2LastElo,
      $pop: { 'elo.previous': 1 },
    })
}

/**
 * Delete a match using the match ID.
 * Make sure it's the latest match played to not mess with Elo system.
 * Fail if a new match has been created since loading the page.
 * Fail if a player doesn't have any previous Elo data (previous data being an Array is new).
 */
export const deleteMatch = async (req, res) => {
  const latestMatch = await getLatestMatch()

  if (!latestMatch._id.equals(req.params.id)) {
    req.flash('error_msg', 'This is not the latest match anymore and cannot be deleted.')
    res.status(400).redirect('/matches/history')

    return
  }

  resetEloToPreviousState(latestMatch)
    .then(() => {
      Match
        .findByIdAndRemove(req.params.id)
        .exec()
        .then(match => {
          req.flash('light_msg', 'Match has been deleted.')
          res.status(204).redirect('/matches/history')
        })
        .catch(err => console.error(err))
    })
    .catch(err => {
      req.flash('error_msg', 'Cannot delete match as one of the players is missing previous Elo data.')
      res.status(400).redirect('/matches/history')

      console.error(err)
    })
}