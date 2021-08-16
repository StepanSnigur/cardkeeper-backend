const { Schema, model } = require('mongoose')

const ImageSchema = new Schema({
  data: Buffer,
  contentType: String,
  name: String
})

module.exports = model('Image', ImageSchema)
