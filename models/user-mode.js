const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcrypt')

const userSchema = new Schema({
  username: {
    type: String,
    minlength: 3,
    maxlength: 50,
    required: true,
  },
  email: {
    type: String,
    minlength: 6,
    maxlength: 50,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    maxlength: 255,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now()
  },
  crypto: {
    USD: {
      type: Number,
      min: 0,
      default: 0
    },
    BTC: {
      type: Number,
      min: 0,
      default: 0
    },
    ETH: {
      type: Number,
      min: 0,
      default: 0
    },
    depositUSD: {
      type: [[]],
      // min: 0,
      default: [[0, new Date()]]
    },
    takeOut: {
      type: [[]],
      // min: 0,
      default: [[0, new Date()]]
    },
    buyBTC: {
      type: [[]],
      // min: 0,
      default: [[0, new Date()]]
    },
    sellBTC: {
      type: [[]],
      // min: 0,
      default: [[0, new Date()]]
    },
    buyETH: {
      type: [[]],
      // min: 0,
      default: [[0, new Date()]]
    },
    sellETH: {
      type: [[]],
      // min: 0,
      default: [[0, new Date()]]
    },
  }
})

userSchema.methods.comparePassword = async function(password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password)
    return cb(null, result)
  } catch(e) {
    return cb(e, result)
  }

}

userSchema.pre('save', async function(next){
  if (this.isNew || this.isModified('password')) {
    let hashValue = await bcrypt.hash(this.password, 10)
    this.password = hashValue
  }
  next()
})

module.exports = mongoose.model('User', userSchema)