const ExpressRouter = require('express').Router
const imageController = require('../controllers/image-controller')

const router = new ExpressRouter()

router.get('/get/:name', imageController.getImage)

module.exports = router
