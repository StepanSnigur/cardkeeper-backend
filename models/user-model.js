const { Schema, model } = require('mongoose')

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isActivated: { type: Boolean, default: false },
  activationLink: { type: String },
  cards: [{ frontFace: String, backFace: String }],
  settings: {
    darkTheme: { type: Boolean, default: true },
    fingerprint: { type: Boolean, default: false }
  }
})

module.exports = model('User', UserSchema)
