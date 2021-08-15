class UserDto {
  constructor(model) {
    this.email = model.email
    this.id = model._id
    this.isActivated = model.isActivated
    this.cards = model.cards,
    this.settings = model.settings
  }
}

module.exports = UserDto
