const UserModel = require('../models/user-model')
const ImageModel = require('../models/image-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')

class UserService {
  async registration(email, password) {
    const candidate = await UserModel.findOne({ email })
    if (candidate) throw ApiError.BadRequest('Пользователь с таким Email уже существует')

    const hashPassword = await bcrypt.hash(password, 3)
    const activationLink = uuid.v4()
    const user = await UserModel.create({
      email,
      password: hashPassword,
      activationLink,
    })
    await mailService.sendActivationLink(email, `${process.env.API_URL}/user/activate/${activationLink}`)

    const userDto = new UserDto(user) // contain fields: id, email, isActivated
    const tokens = tokenService.generateTokens({ ...userDto })
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return {
      ...tokens,
      user: userDto
    }
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email })
    if (!user) throw ApiError.BadRequest('Неверный Email или пароль')

    const isPassEquals = await bcrypt.compare(password, user.password)
    if (!isPassEquals) throw ApiError.BadRequest('Неверный Email или пароль')

    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({ ...userDto })
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return {
      ...tokens,
      user: userDto
    }
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken)
    return token
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink })
    if (!user) throw ApiError.BadRequest('Некорректная ссылка активации')
    user.isActivated = true
    await user.save()
  }

  async refresh(refreshToken) {
    if (!refreshToken) throw ApiError.UnauthorizedError()

    const userData = tokenService.validateRefreshToken(refreshToken)
    const dbToken = await tokenService.findToken(refreshToken)
    if (!userData || !dbToken) throw ApiError.UnauthorizedError()

    const user = await UserModel.findById(userData.id)
    const userDto = new UserDto(user)
    const tokens = tokenService.generateTokens({ ...userDto })
    await tokenService.saveToken(userDto.id, tokens.refreshToken)
    return {
      ...tokens,
      user: userDto
    }
  }

  async setAvatar(id, file) {
    const user = await UserModel.findById(id)
    if (!user) throw ApiError.BadRequest('Неизвестный id пользователя')
    if (!file) throw ApiError.BadRequest('Файл не был загружен')
    
    const imageName = uuid.v4()
    const image = new ImageModel({
      name: imageName,
      data: file.buffer,
      contentType: file.mimetype
    })
    await image.save()

    return `${process.env.API_URL}/files/get/${image.name}`
  }
}

module.exports = new UserService()
