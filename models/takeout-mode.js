const mongoose = require('mongoose')
const { Schema } = mongoose

const takeOutSchema = new Schema({
  takeOut: {
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
  },
})

module.exports = mongoose.model('TakeOut', takeOutSchema)