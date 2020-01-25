import { Router } from 'express'
import { ensureAuth } from '../config/auth'

import { getNewMatch, addNewMatch, getMatches } from '../controllers/matches.controller'

const router = Router()

// New Match
router
  .route('/new')
  .get(ensureAuth, getNewMatch)
  .post(addNewMatch)

// Previous Matches
router
  .route('/history')
  .get(ensureAuth, getMatches)

export default router