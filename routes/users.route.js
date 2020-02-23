import { Router } from 'express'
import { ensureAuth } from '../config/auth'

import { getLogin, postLogin, getLogout, getRegister, postRegister, getAccount, postChangePassword } from '../controllers/users.controller'

const router = Router()

// Login
router
  .route('/login')
  .get(getLogin)
  .post(postLogin)

// Logout
router
  .route('/logout')
  .get(ensureAuth, getLogout)

// Register
router
  .route('/register')
  .get(getRegister)
  .post(postRegister)

router
  .route('/account')
  .get(ensureAuth, getAccount)
  // .get(getAccount)

router
  .route('/account/update')
  .post(ensureAuth, postChangePassword)

export default router