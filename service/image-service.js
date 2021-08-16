const ImageModel = require('../models/image-model')

class ImageService {
  async getImage(name) {
    const image = await ImageModel.findOne({ name })
    return image
  }
}

module.exports = new ImageService()
