'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

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

mongoose.model('Reading', ReadingSchema);
