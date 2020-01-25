module.exports = {
  ensureAuth: (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.flash('error_msg', 'Please login to view this page.')
      res.redirect('/users/login')

      return
    }

    return next()
  }
}