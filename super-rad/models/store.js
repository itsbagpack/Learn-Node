const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Use built-in ES6 Promise. Alternatives are Bluebird
const slug = require('slugs'); // Allow us to make URL-friendly names for our slugs, similar to Wordpress perma link

// Protip: do all data normalization on the model, right before saving to DB
const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true, // trims whitespace before saving
    required: 'Please enter a store name' // this will be the error message in place of true
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates'
    }],
    address: {
      type: String,
      required: 'You must supply an address'
    }
  },
  photo: String
});

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next(); //skip it
    return; // stop this function from running
  }
  this.slug = slug(this.name); // this is the store we're trying to save

  // find other stores that have slug of name, name-1, name-2 etc
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }

  next();
});

// use proper function because we need 'this' inside of it
storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Store', storeSchema);
