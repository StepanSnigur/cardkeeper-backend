require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const userRouter = require('./router/userRouter')
const fileRouter = require('./router/fileRouter')

const errorMiddleware = require('./middlewares/error-middleware')

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use('/user', userRouter)
app.use('/files', fileRouter)

// middlewares
app.use(errorMiddleware)

const PORT = process.env.PORT || 5050
const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    app.listen(PORT, () => console.log(`Server started on port: ${PORT}`))
  } catch (e) {
    console.log(e)
  }
}
start()
