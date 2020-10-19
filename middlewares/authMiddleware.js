const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check JSON web token exists and is valid
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, (error, decodedToken) => {
      if (!error) {
        next();
      } else {
        res.redirect('/login');
      }
    });
  } else {
    res.redirect('/login');
  }
};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (error, decodedToken) => {
      if (!error) {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      } else {
        res.locals.user = null;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports = { requireAuth, checkUser };
