const ExpressRouter = require('express').Router
const userController = require('../controllers/user-controller')

const router = new ExpressRouter()

router.post('/registration', userController.registration)
router.post('/login')
router.post('/logout')
router.get('/activate/:link')
router.get('/refresh')

module.exports = router
