const { validationResult } = require('express-validator')
const ApiError = require('../exceptions/api-error')
const userService = require('../service/user-service')

const cookieLifeTime = 30 * 24 * 60 * 60 * 1000 // 30 days

class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка валидации', errors.array()))
      }

      const { email, password } = req.body
      const userData = await userService.registration(email, password)

      res.cookie('refreshToken', userData.refreshToken, { maxAge: cookieLifeTime, httpOnly: true })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const userData = await userService.login(email, password)
      
      res.cookie('refreshToken', userData.refreshToken, { maxAge: cookieLifeTime, httpOnly: true })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async autoLogin(req, res, next) {
    try {
      const { id, refreshToken } = req.body

      const userData = await userService.autoLogin(id, refreshToken)
      res.cookie('refreshToken', userData.refreshToken, { maxAge: cookieLifeTime, httpOnly: true })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const token = await userService.logout(refreshToken)
      res.clearCookie('refreshToken')
      return res.json(token)
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

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const userData = await userService.refresh(refreshToken)

      res.cookie('refreshToken', userData.refreshToken, { maxAge: cookieLifeTime, httpOnly: true })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async setAvatar(req, res, next) {
    try {
      const url = await userService.setAvatar(req.user.id, req.file)
      return res.json(url)
    } catch (e) {
      next(e)
    }
  }

  async addCard(req, res, next) {
    try {
      const { id } = req.user
      const { cardFaces, qrCodes } = req.body

      const updatedCards = await userService.addCard(id, cardFaces, qrCodes)
      return res.json(updatedCards)
    } catch (e) {
      next(e)
    }
  }

  async deleteCard(req, res, next) {
    try {
      const { cardId } = req.body
      const { id } = req.user
      const updatedCards = await userService.deleteCard(id, cardId)
      return res.json(updatedCards)
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new UserController()
