import moment from 'moment'

import { Match } from '../models/match.model'

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

    matches.forEach(match => {
      // If match happened in the last 12 hours
      match.recent = match.date >= new Date(new Date().getTime()) - (1 * 12 * 60 * 60 * 1000)

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

    matches = await addRecentMatchDate(matches)
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
 * Delete a match using the match ID.
 */
export const deleteMatch = (req, res) => {
  Match
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(doc => {
      if (!doc) res.status(404).end()

      req.flash('light_msg', 'Match has been deleted.')
      res.status(204).redirect('/matches/history')
    })
    .catch(err => next(err))
}