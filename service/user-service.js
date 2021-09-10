const UserModel = require('../models/user-model')
const ImageModel = require('../models/image-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')
const imageService = require('./image-service')

const getUserData = async (user) => {
  const userDto = new UserDto(user)
  const tokens = tokenService.generateTokens({ ...userDto })
  await tokenService.saveToken(userDto.id, tokens.refreshToken)

  return {
    ...tokens,
    user: userDto
  }
}
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

    return await getUserData(user)
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email })
    if (!user) throw ApiError.BadRequest('Неверный Email или пароль')

    const isPassEquals = await bcrypt.compare(password, user.password)
    if (!isPassEquals) throw ApiError.BadRequest('Неверный Email или пароль')

    return await getUserData(user)
  }

  async autoLogin(id, token) {
    const tokenData = tokenService.validateRefreshToken(token)
    if (!tokenData) {
      return next(ApiError.UnauthorizedError())
    }

    const user = await UserModel.findById(id)
    if (!user || !(user.email === tokenData.email)) throw ApiError.BadRequest('Ошибка входа')

    return await getUserData(user)
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
    return await getUserData(user)
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

  async addCard(id, cardFaces, qrCodes, cardName) {
    const user = await UserModel.findById(id)
    if (!user) throw ApiError.BadRequest('Вы не в сети')

    const cardFacesUrl = cardFaces.map(async (image) => {
      return await imageService.createImage(image)
    })
    const res = await Promise.all(cardFacesUrl)
    const card = {
      frontFace: res[0],
      backFace: res[1],
      qrCodes,
      cardName,
    }

    user.cards.push(card)
    await user.save()
    return user.cards
  }

  async deleteCard(userId, cardId) {
    const user = await UserModel.findById(userId)
    if (!user) throw ApiError.BadRequest('Вы не в сети')

    const cardToDelete = user.cards.find(card => card._id.toString() === cardId)
    const imagesToDelete = [cardToDelete.frontFace, cardToDelete.backFace]
    const deletedImages = imagesToDelete.map(async img => await imageService.deleteImage(img))
    await Promise.all(deletedImages)

    user.cards = user.cards.filter(card => card._id.toString() !== cardId)
    await user.save()
    return user.cards
  }
}

module.exports = new UserService()
