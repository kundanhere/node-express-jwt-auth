const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');

// create user schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please enter an password'],
    minlength: [6, 'Please enter at least 6 characters'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Methods
// static method to login user
userSchema.statics.login = async function (email, password) {
  let user = await this.findOne({ email: email }); // ({ key: value })
  if (user) {
    let auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw new Error('invalid password');
  }
  throw new Error('invalid email');
};

// Mongoose hooks
// it fires just before the data is stored in db
userSchema.pre('save', async function (next) {
  // generate salt
  let salt = await bcrypt.genSalt();
  // hash password
  this.password = await bcrypt.hash(this.password, salt);
  // invoke router middlewares
  next();
});

// exports this module
module.exports = User = mongoose.model('user', userSchema);
