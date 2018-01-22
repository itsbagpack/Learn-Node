const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name'); // from expressValidator middleware in app.js
  req.checkBody('name', 'You must supply a name.').notEmpty();
  req.checkBody('email', 'That Email is not valid.').isEmail();
  req.sanitizeBody('email').normalizeEmail({ // For e.g. wesbos@gmail.com is the same as wesbos+hello@gmail.com
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password cannot be blank').notEmpty();
  req.checkBody('password-confirm', 'Confirmed password cannot be blank').notEmpty();
  req.checkBody('password-confirm', 'Your passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return; // stop the function from running
  }
  next(); // there were no errors, call next middleware
};

exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name });

  // passport provides this method on the User model, its return value is callback-based.
  // user promisify to make it return a promise
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  next(); // pass to authController.login
};

exports.account = (req, res) => {
  res.render('account', { title: 'Edit Your Account' });
};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );

  // res.redirect('back'); will redirect them to where they came from. useful is updateAccount is used for multiple
  req.flash('success', 'Updated the profile');
  res.redirect('/account');
};
