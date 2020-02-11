export const defaultResVars = (req, res, next) => {
  res.locals.user = req.user
  next()
}