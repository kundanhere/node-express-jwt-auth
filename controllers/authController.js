const jwt = require('jsonwebtoken');
const User = require('../models/User');

// handle errors
const handleErrors = (err) => {
  let errors = { email: '', password: '' };
  // validate errors
  // duplicate error code 11000
  if (err.code === 11000) {
    // when the email is already exists in db
    errors.email = 'This email is already registered';
    return errors;
  }
  switch (err.message) {
    // invalid email error
    case 'invalid email': {
      errors.email = 'This email is not registered';
      break;
    }
    // invalid password error
    case 'invalid password': {
      errors.password = 'Incorrect password';
      break;
    }
    // user validation failed error
    default:
      Object.values(err.errors).forEach(({ properties }) => {
        errors[properties.path] = properties.message;
      });
      break;
  }
  return errors;
};

// create token
let maxAge = 3 * 24 * 60 * 60; // dd:hr:min:sec
const createToken = (id) => {
  // this token is valid for 3 days
  let options = { expiresIn: maxAge };
  return jwt.sign({ id }, process.env.TOKEN_SECRET, options);
};

// GET requests
module.exports.get_signup = (req, res) => {
  res.render('signup');
};

module.exports.get_login = (req, res) => {
  res.render('login');
};

module.exports.get_logout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/login');
};

// POST requests
// signup request
module.exports.post_signup = async (req, res) => {
  let { email, password } = req.body;

  try {
    // save the user in database
    let user = await User.create({ email, password });
    // create token
    let token = createToken(user._id);
    // set token in cookies
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    let error = handleErrors(err);
    res.status(400).json({ error });
  }
};

// login request
module.exports.post_login = async (req, res) => {
  let { email, password } = req.body;
  try {
    let user = await User.login(email, password);
    // create token
    let token = createToken(user._id);
    // set token in cookies
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    let error = handleErrors(err);
    res.status(400).json({ error });
  }
};
