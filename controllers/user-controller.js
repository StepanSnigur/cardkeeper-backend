const userService = require('../service/user-service')

const cookieLifeTime = 30 * 24 * 60 * 60 * 1000 // 30 days

class UserController {
  async registration(req, res, next) {
    try {
      const { email, password } = req.body
      const userData = await userService.registration(email, password)

      res.cookie('refreshToken', userData.refreshToken, { maxAge: cookieLifeTime, httpOnly: true })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link
      await userService.activate(activationLink)
      // TODO redirect on activation
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new UserController()
