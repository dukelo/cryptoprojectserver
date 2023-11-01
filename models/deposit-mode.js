const mongoose = require('mongoose')
const { Schema } = mongoose

const depositSchema = new Schema({
  deposit: {
    type: Number,
    // min: 1
  },
  date: {
    type: Date,
    default: Date.now()
  },
  instructor: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  }
})

module.exports = mongoose.model('Deposit', depositSchema)