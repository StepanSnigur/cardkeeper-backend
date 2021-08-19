const ExpressRouter = require('express').Router
const Multer = require('multer')
const userController = require('../controllers/user-controller')
const { body } = require('express-validator')
const authMiddleware = require('../middlewares/auth-middleware')

const router = new ExpressRouter()
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  }
})

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
router.post('/uploadAvatar', authMiddleware, multer.single('avatar'), userController.setAvatar)

router.post('/addCard', authMiddleware, multer.array('cardFaces'), userController.addCard)
router.delete('/deleteCard', authMiddleware, userController.deleteCard)

module.exports = router
