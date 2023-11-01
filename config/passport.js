const User = require('../models/index').user

let JwtStrategy = require('passport-jwt').Strategy
let ExtractJwt = require('passport-jwt').ExtractJwt

module.exports = (passport) => {
  let opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
  opts.secretOrKey = process.env.PASSPORT_SECRET
  passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
    try {
      let user = await User.findOne({_id: jwt_payload._id})
      if (user) {
        return done(null, user) // plus user into req.user
      } else {
        return done(null, false)
      }
    } catch(e) {
      return done(e, false)
    }
  }))
}