const router = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/index').user
const Deposit = require('../models/index').deposit
const TakeOut = require('../models/index').takeOut
const Trade = require('../models/index').trade


router.use((req, res, next) => {
  console.log('into investment router')
  next()
})

router.get('/api/testinvestment', (req, res) => {
  console.log('into testinvestment')
  console.log(req.user)
  return res.status(200).send('into testinvestment')
})

// Deposit
router.post('/api/invest/deposit', async (req, res) => {
  // console.log('into deposit')
  // console.log(req.user)
  let { deposit } = req.body
  // console.log(deposit)
  deposit = Number(deposit)
  // console.log('deposit2')
  // console.log(deposit)

  try {
    // update user
    let user = await User.findOne({ _id: req.user._id})
    // new code
    // user.deposit(deposit)

    let newUSD = (user.crypto.USD + deposit).toFixed(6)
    let newDeposit = user.crypto.depositUSD
    newDeposit.push([deposit, new Date()])

    let putUser = await User.findOneAndUpdate(
      { _id: req.user._id},
      { crypto: {
        USD: newUSD,
        BTC: user.crypto.BTC,
        ETH: user.crypto.ETH,
        depositUSD: newDeposit,
        takeOut: user.crypto.takeOut,
        buyBTC: user.crypto.buyBTC,
        sellBTC: user.crypto.sellBTC,
        buyETH: user.crypto.buyETH,
        sellETH: user.crypto.sellETH,
      }},
      { new: true}
    )

    // recorder
    let newDoc = new Deposit({
      deposit,
      instructor: req.user._id
    })

    let saveDoc = await newDoc.save()
    console.log(saveDoc)
    return res.status(200).send({
      message: 'success save!!',
      saveDoc
    })

  } catch(e) {
    return res.status(500).send('server is error')
  }
})

// Deposit history
router.get('/api/invest/deposit', async (req, res) => {
  try {
    // sort by date
    let sortData = await Deposit.find({ instructor: req.user._id}).sort({date: 1}).exec()
    // console.log(sortData)
    return res.status(200).send({
      message: 'Query Deposit history success',
      sortData
    })
  } catch(e) {
    console.log(e)
    return res.status(500).send('server is error')
  }
})

// TakeOut
router.post('/api/invest/takeout', async(req, res) => {
  console.log(req.user)
  let { takeOut } = req.body
  takeOut = Number(takeOut)

  try {
    // update user
    let user = await User.findOne({ _id: req.user._id})
    if (user.crypto.USD >= takeOut) {
      let newUSD = (user.crypto.USD - takeOut).toFixed(6)
      let newTakeOut = user.crypto.takeOut
      newTakeOut.push([takeOut, new Date()])
      let putUser = await User.findOneAndUpdate(
        { _id: req.user._id},
        { crypto: {
          USD: newUSD,
          BTC: user.crypto.BTC,
          ETH: user.crypto.ETH,
          depositUSD: user.crypto.depositUSD,
          takeOut: newTakeOut,
          buyBTC: user.crypto.buyBTC,
          sellBTC: user.crypto.sellBTC,
          buyETH: user.crypto.buyETH,
          sellETH: user.crypto.sellETH,
        }},
        { new: true}
      )
      
    } else {
      return res.status(200).send('USD is not enough')
    }

    let newDoc = new TakeOut({
      takeOut,
      instructor: req.user._id
    })

    saveDoc = await newDoc.save()
    console.log(saveDoc)

    return res.status(200).send({
      message: 'takeOut Success!!',
      saveDoc
    })

  } catch(e) {
    console.log(e)
    return res.status(500).send('server is error')
  }
})

// takeout history
router.get('/api/invest/takeout', async (req, res) => {
  try {
    // sort by date
    let sortData = await TakeOut.find({ instructor: req.user._id}).sort({date: 1}).exec()
    // console.log(sortData)
    return res.status(200).send({
      message: 'Query Deposit history success',
      sortData
    })
  } catch(e) {
    console.log(e)
    return res.status(500).send('server is error')
  }
})

// buy BTC
router.get('/api/invest/buy/BTC', async (req, res) => {
  let { price, unit } = req.query
  price = Number(price)
  unit = Number(unit)

  try {
    let user = await User.findOne({ _id: req.user._id})
    let cost = price*unit
    if (user.crypto.USD >= cost) {
      let newUSD = (user.crypto.USD - cost).toFixed(6)
      let newBTCUnit = (user.crypto.BTC + unit).toFixed(6)
      let newbuyBTC = user.crypto.buyBTC
      newbuyBTC.push([unit, new Date()])
      // let putUser = await User.findOneAndUpdate(
      //   {_id: req.user._id},
      //   {crypto: {
      //     USD: newUSD,
      //     BTC: newBTCUnit,
      //     ETH: user.crypto.ETH
      //   }},
      //   {new: true}
      // ).exec()

      let putUser = await User.findOneAndUpdate(
        { _id: req.user._id},
        { crypto: {
          USD: newUSD,
          BTC: newBTCUnit,
          ETH: user.crypto.ETH,
          depositUSD: user.crypto.depositUSD,
          takeOut: user.crypto.takeOut,
          buyBTC: newbuyBTC,
          sellBTC: user.crypto.sellBTC,
          buyETH: user.crypto.buyETH,
          sellETH: user.crypto.sellETH,
        }},
        { new: true}
      ).exec()

      let recorder = {
        crypto: 'BTC',
        sellorbuy: 'buy',
        price,
        unit,
        total: cost,
        instructor: req.user._id
      }
      let tradeRecorder = new Trade(recorder)
      let trade = await tradeRecorder.save()
      console.log(trade)

      return res.status(200).send({
        message: 'Buy BTC Success',
        putUser
      })
    } else {
      return res.status(200).send('USD is not enought')
    }
  } catch(e) {
    console.log(e)
    return res.status(500).send('server is error')
  }
})

// sell BTC
router.get('/api/invest/sell/BTC', async (req, res) => {
  let { price, unit } = req.query
  price = Number(price)
  unit = Number(unit)

  try {
    let user = await User.findOne({ _id: req.user._id})
    let recive = price*unit
    if (user.crypto.BTC >= unit) {
      let newUSD = (user.crypto.USD + recive).toFixed(6)
      let newBTCUnit = (user.crypto.BTC - unit).toFixed(6)
      let newsellBTC = user.crypto.sellBTC
      newsellBTC.push([unit, new Date()])
      // let putUser = await User.findOneAndUpdate(
      //   {_id: req.user._id},
      //   {crypto: {
      //     USD: newUSD,
      //     BTC: newBTCUnit,
      //     ETH: user.crypto.ETH
      //   }},
      //   {new: true}
      // ).exec()
      let putUser = await User.findOneAndUpdate(
        { _id: req.user._id},
        { crypto: {
          USD: newUSD,
          BTC: newBTCUnit,
          ETH: user.crypto.ETH,
          depositUSD: user.crypto.depositUSD,
          takeOut: user.crypto.takeOut,
          buyBTC: user.crypto.buyBTC,
          sellBTC: newsellBTC,
          buyETH: user.crypto.buyETH,
          sellETH: user.crypto.sellETH,
        }},
        { new: true}
      ).exec()

      let recorder = {
        crypto: 'BTC',
        sellorbuy: 'sell',
        price,
        unit,
        total: recive,
        instructor: req.user._id
      }
      let tradeRecorder = new Trade(recorder)
      let trade = await tradeRecorder.save()
      console.log(trade)

      return res.status(200).send({
        message: 'Sell BTC Success',
        putUser
      })
    } else {
      return res.status(200).send('USD is not enought')
    }
  } catch(e) {
    console.log(e)
    return res.status(500).send('server is error')
  }
})

// buy ETH
router.get('/api/invest/buy/ETH', async (req, res) => {
  let { price, unit } = req.query
  price = Number(price)
  unit = Number(unit)

  try {
    let user = await User.findOne({ _id: req.user._id})
    let cost = price*unit
    if (user.crypto.USD >= cost) {
      let newUSD = (user.crypto.USD - cost).toFixed(6)
      let newETHUnit = (user.crypto.ETH + unit).toFixed(6)
      let newbuyETH = user.crypto.buyETH
      newbuyETH.push([unit, new Date()])
      // let putUser = await User.findOneAndUpdate(
      //   {_id: req.user._id},
      //   {crypto: {
      //     USD: newUSD,
      //     ETH: newETHUnit,
      //     BTC: user.crypto.BTC
      //   }},
      //   {new: true}
      // ).exec()
      let putUser = await User.findOneAndUpdate(
        { _id: req.user._id},
        { crypto: {
          USD: newUSD,
          BTC: user.crypto.BTC,
          ETH: newETHUnit,
          depositUSD: user.crypto.depositUSD,
          takeOut: user.crypto.takeOut,
          buyBTC: user.crypto.buyBTC,
          sellBTC: user.crypto.sellBTC,
          buyETH: newbuyETH,
          sellETH: user.crypto.sellETH,
        }},
        { new: true}
      ).exec()

      let recorder = {
        crypto: 'ETH',
        sellorbuy: 'buy',
        price,
        unit,
        total: cost,
        instructor: req.user._id
      }
      let tradeRecorder = new Trade(recorder)
      let trade = await tradeRecorder.save()
      console.log(trade)

      return res.status(200).send({
        message: 'Buy ETH Success',
        putUser
      })
    } else {
      return res.status(200).send('USD is not enought')
    }
  } catch(e) {
    console.log(e)
    return res.status(500).send('server is error')
  }
})

// sell ETH
router.get('/api/invest/sell/ETH', async (req, res) => {
  let { price, unit } = req.query
  price = Number(price)
  unit = Number(unit)

  try {
    let user = await User.findOne({ _id: req.user._id})
    let recive = price*unit
    if (user.crypto.ETH >= unit) {
      let newUSD = (user.crypto.USD + recive).toFixed(6)
      let newETHUnit = (user.crypto.ETH - unit).toFixed(6)
      // let putUser = await User.findOneAndUpdate(
      //   {_id: req.user._id},
      //   {crypto: {
      //     USD: newUSD,
      //     ETH: newETHUnit,
      //     BTC: user.crypto.BTC
      //   }},
      //   {new: true}
      // ).exec()
      let newsellETH = user.crypto.sellETH
      newsellETH.push([unit, new Date()])
      let putUser = await User.findOneAndUpdate(
        { _id: req.user._id},
        { crypto: {
          USD: newUSD,
          BTC: user.crypto.BTC,
          ETH: newETHUnit,
          depositUSD: user.crypto.depositUSD,
          takeOut: user.crypto.takeOut,
          buyBTC: user.crypto.buyBTC,
          sellBTC: user.crypto.sellBTC,
          buyETH: user.crypto.buyETH,
          sellETH: newsellETH,
        }},
        { new: true}
      ).exec()

      let recorder = {
        crypto: 'ETH',
        sellorbuy: 'sell',
        price,
        unit,
        total: recive,
        instructor: req.user._id
      }
      let tradeRecorder = new Trade(recorder)
      let trade = await tradeRecorder.save()
      console.log(trade)

      return res.status(200).send({
        message: 'Sell ETH Success',
        putUser
      })
    } else {
      return res.status(200).send('USD is not enought')
    }
  } catch(e) {
    console.log(e)
    return res.status(500).send('server is error')
  }
})

// get now
router.get('/api/invest/now', async (req,res) => {
  try {
    let user = await User.findOne({ _id: req.user._id}).exec()
    // console.log(user.crypto)
    return res.status(200).send(user.crypto)
  } catch(e) {
    console.log(e)
    return res.status(500).send('server is error')
  }
})

// get profile
router.get('/api/invest/profile', async (req,res) => {
  console.log('get profile')
  try {
    let user = await User.findOne({ _id: req.user._id}).exec()
    return res.status(200).send(user)
  } catch(e) {
    console.log(e)
    return res.status(500).send('server is error')
  }
})

// change username, emial, password

router.patch('/api/invest/profile/change', async (req, res) => {
  console.log('patch user change')

  let {_id, username, email, password} = req.body
  let updateUser

  try {
    if (password === 'reserve') {
      updateUser = await User.findOneAndUpdate({ _id }, {username, email}, {
        new: true,
        runValidators: true,
      });
    } else {
      let hashValue = await bcrypt.hash(password, 10)
      updateUser = await User.findOneAndUpdate({ _id }, {username, email, password:hashValue}, {
        new: true,
        runValidators: true,
      });
    }
  
    console.log(updateUser)
  
    return res.send({
      message: "更新成功",
      updateUser,
    });
  } catch(e) {
    console.log(e)
    return res.status(500).send('server is error')
  }

})


// get trade history
router.get('/api/invest/trade/recorder', async (req, res) => {
  try {
    let sortData = await Trade.find({ instructor: req.user._id}).sort({date:1}).exec()
    return res.status(200).send({
      message: 'Query trade history success',
      sortData
    })
  } catch(e) {
    console.log(e)
    return res.status(500).send('server is error')
  }  
})



module.exports = router