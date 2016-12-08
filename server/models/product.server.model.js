'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Product Schema
 */
var ProductSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    default: '',
    trim: true,
    required: 'Name cannot be blank'
  },
  threshold: {
    type: Number,
    default: 0,
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  DeviceID: {
    type: String,
    default: '',
    trim: true
  }

});

var ReadingSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  Weight: {
    type: Number,
    default: 0,
    trim: true
  },
  DeviceID: {
    type: String,
    default: '',
    trim: true
  },
  alert: {
    type: Boolean,
    default: false
  }

});

mongoose.model('Product', ProductSchema);
mongoose.model('Reading', ReadingSchema);
