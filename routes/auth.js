const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const registerValidation = require('../validation').registerValidation
const loginValidation = require('../validation').loginValidation
const User = require('../models/index').user

router.use((req, res, next) => {
  console.log('into auth router');
  next();
})


router.get('/api/testapi', (req, res) => {
  console.log('into testapi router')
  res.status(200).send('into testapi router')
})

// register
router.post('/api/register', async (req, res) => {
  console.log('into auth register')
  let {username, email, password} = req.body
  
  // check form format
  let { error } = registerValidation(req.body)
  if (error) {
    return res.status(400).send(error.details[0].message)
  }

  try {
    let userFound = await User.findOne({email})
    if (userFound) {
      return res.status(400).send('the email is exist')
    }

    let saveDocument = new User({
      username,
      email,
      password
    })
    
    let result = await saveDocument.save()
    console.log(result)
    return res.status(200).send(result)
    

  } catch(e) {
    console.log(e)
    return res.status(500).send('server error')
  }

})

// login
router.post('/api/login', async (req, res) => {
  console.log('into auth login')
  let {email, password} = req.body

  // check form format
  let { error } = loginValidation(req.body)
  if (error) {
    return res.status(400).send(error)
  }

  // check email
  let user = await User.findOne({ email })
  if (!user) {
    return res.status(401).send('no this email')
  }

  // verify password
  user.comparePassword(password, (err, isMatch) => {
    if (err) {
      return res.status(500).send('server error')
    }
    if(isMatch){
      let tokenObject = { _id: user._id, email: user.email}
      let token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET)
      return res.status(200).send({
        message: 'success',
        token: 'JWT '+token,
        user
      })
    } else {
      return res.status(400).send('password is wrong')
    }
  })
})


module.exports = router