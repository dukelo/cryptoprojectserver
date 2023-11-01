const mongoose = require('mongoose')
const { Schema } = mongoose

const tradeSchema = new Schema({
  crypto: {
    type: String,
    required: true
  },
  sellorbuy: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  unit: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  },
  instructor: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true
  }
})

module.exports = mongoose.model('Trade', tradeSchema)