const ExpressRouter = require('express').Router
const userController = require('../controllers/user-controller')
const { body } = require('express-validator')
const authMiddleware = require('../middlewares/auth-middleware')

const router = new ExpressRouter()

router.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 6, max: 32 }),
  userController.registration
)
router.post('/login', userController.login)
router.post('/autoLogin', userController.autoLogin)
router.post('/logout', userController.logout)
router.get('/activate/:link', userController.activate)
router.get('/refresh', userController.refresh)
router.post('/uploadAvatar', authMiddleware, userController.setAvatar)

router.post('/addCard', authMiddleware, userController.addCard)
router.post('/changeCard', authMiddleware, userController.changeCard)
router.delete('/deleteCard', authMiddleware, userController.deleteCard)

module.exports = router
