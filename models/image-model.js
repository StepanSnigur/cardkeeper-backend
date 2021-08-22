const { Schema, model } = require('mongoose')

const ImageSchema = new Schema({
  data: String,
  contentType: String,
  name: String
})

module.exports = model('Image', ImageSchema)
