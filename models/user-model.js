const { Schema, model } = require('mongoose')

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  avatar: { type: String },
  isActivated: { type: Boolean, default: false },
  activationLink: { type: String },
  cards: [{
    frontFace: String,
    backFace: String,
    qrCodes: [String],
    cardName: String,
  }],
})

module.exports = model('User', UserSchema)
