import { Router } from 'express'
import { ensureAuth } from '../config/auth'

import { getNewMatch, addNewMatch, getMatches, deleteMatch } from '../controllers/matches.controller'

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

router
  .route('/delete/:id')
  .get(ensureAuth, deleteMatch)

export default router