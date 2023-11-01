require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const cors = require('cors')
require('./config/passport')(passport)
const auth = require('./routes/').auth
const invest = require('./routes/').invest

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
mongoose.connect(process.env.MONGODB_CONNECTION)
        .then(() => {
          console.log('connect DB success')
        }).catch((e) => {
          console.log(e)
        })

app.use('/auth', auth)
app.use('/invest', passport.authenticate('jwt', {session: false}), invest)

app.get('/', (req, res) => {
  return res.send('index')
})



app.listen(8080, () => {
  console.log('server is listing on port 8080')
})