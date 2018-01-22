const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise; // Use built-in ES6 Promise. Alternatives are Bluebird
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please supply an email address'
  },
  name: {
    type: String,
    required: 'Please supply a name',
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

// sometimes you want a conversion on the fly, for e.g. weight in kg vs lb, you don't want to store both
userSchema.virtual('gravatar').get(function() {
  const kitty = 'https://i.pinimg.com/736x/f3/bd/84/f3bd8497e15399201b634714ec5ed390--baby-kitty-little-kitty.jpg';
  const hash = md5(this.email);

  //return `https://gravatar.com/avatar/${hash}?s=200`;
  return kitty;
});

// passport adds a bunch of fields like password, passwordConfirmation needed for auth
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

// will change ugly errors into human-readable ones. for e.g. email uniqueness
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
