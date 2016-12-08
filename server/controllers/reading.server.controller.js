'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Reading = mongoose.model('Reading'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


/**
 * Create an reading
 */
exports.create = function (req, res) {
  var reading = new Reading(req.body);

  console.log(req.user);
  console.log(typeof req.user === 'undefined');
  reading.user = req.user;

  // TODO: add user and name
  // TODO: user is a db object
  console.log('log!');
  console.log(reading);
  if (typeof req.user === 'undefined' || !reading.user) {
    reading.user = 'Nick';
  }
  console.log(req.user);
  console.log(typeof req.user === 'undefined');


  if (!reading.name) {
    reading.name = 'Toilet Paper';
  }
  console.log('log2!');
  console.log(reading);

  reading.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(reading);
    }
  });
};

/**
 * Show the current reading
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var reading = req.reading ? req.reading.toJSON() : {};

  // Add a custom field to the Reading, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Reading model.
  reading.isCurrentUserOwner = !!(req.user && reading.user && reading.user._id.toString() === req.user._id.toString());

  res.json(reading);
};

/**
 * Update an reading
 */
exports.update = function (req, res) {
  var reading = req.reading;

  reading.name = req.body.name;
  reading.weight = req.body.weight;

  reading.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(reading);
    }
  });
};

/**
 * Delete an reading
 */
exports.delete = function (req, res) {
  var reading = req.reading;

  reading.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(reading);
    }
  });
};

/**
 * List of Readings
 */
exports.list = function (req, res) {
  Reading.find().sort('-date').populate('user', 'displayName').exec(function (err, reading) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(reading);
    }
  });
};

/**
 * Reading middleware
 */
exports.readingByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Reading is invalid'
    });
  }

  Reading.findById(id).populate('user', 'displayName').exec(function (err, reading) {
    if (err) {
      return next(err);
    } else if (!reading) {
      return res.status(404).send({
        message: 'No reading with that identifier has been found'
      });
    }
    req.reading = reading;
    next();
  });
};
