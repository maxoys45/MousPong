import { Router } from 'express'
import { ensureAuth } from '../config/auth'

import { getNewMatch, addNewMatch } from '../controllers/match.new.controller'
import { getMatches, deleteMatch } from '../controllers/match.history.controller'

const router = Router()

// New Match
router
  .route('/new')
  .get(ensureAuth, getNewMatch)
  .post(addNewMatch)

// Previous Matches
router
  .route('/history')
  .get(getMatches)

router
  .route('/delete/:id')
  .get(ensureAuth, deleteMatch)

export default router