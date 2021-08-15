const ExpressRouter = require('express').Router
const userController = require('../controllers/user-controller')
const { body } = require('express-validator')

const router = new ExpressRouter()

router.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 6, max: 32 }),
  userController.registration
)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/activate/:link', userController.activate)
router.get('/refresh', userController.refresh)

module.exports = router
