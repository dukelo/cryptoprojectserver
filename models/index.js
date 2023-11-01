const user = require('./user-mode')
const deposit = require('./deposit-mode')
const takeOut = require('./takeout-mode')
const trade = require('./trade-mode')

module.exports = {
  user: user,
  deposit: deposit,
  takeOut: takeOut,
  trade: trade
}