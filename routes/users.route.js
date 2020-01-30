import { Router } from 'express'

import { getLogin, postLogin, getLogout, getRegister, postRegister } from '../controllers/users.controller'

const router = Router()

// Login
router
  .route('/login')
  .get(getLogin)
  .post(postLogin)

// Logout
router
  .route('/logout')
  .get(getLogout)

// // Register
// router
//   .route('/register')
//   .get(getRegister)
//   .post(postRegister)

export default router