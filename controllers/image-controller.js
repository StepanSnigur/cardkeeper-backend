const imageService = require('../service/image-service')

class ImageController {
  async getImage(req, res, next) {
    try {
      const { name } = req.params
      const image = await imageService.getImage(name)
      return res.json(image.data.toString('base64'))
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new ImageController()
