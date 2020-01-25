import { Router } from 'express'
import { ensureAuth } from '../config/auth'

import { getLeaderboard } from '../controllers/leaderboard.controller'

const router = Router()

// Leaderboard
router
  .route('/')
  .get(ensureAuth, getLeaderboard)

export default router
