const ImageModel = require('../models/image-model')
const uuid = require('uuid')

class ImageService {
  async getImage(name) {
    const image = await ImageModel.findOne({ name })
    return image
  }
  async createImage(file) {
    const imageName = uuid.v4()
    const image = new ImageModel({
      name: imageName,
      data: file.base64,
      contentType: file.type
    })
    await image.save()

    return `${process.env.API_URL}/files/get/${image.name}`
  }
  async deleteImage(url) {
    const slicedUrl = url.split('/')
    const id = slicedUrl[slicedUrl.length - 1]

    await ImageModel.findOneAndRemove({ name: id })
  }
}

module.exports = new ImageService()
