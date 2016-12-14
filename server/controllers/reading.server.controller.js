'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport'),
  mongoose = require('mongoose'),
  Reading = mongoose.model('Reading'),
  Product = mongoose.model('Product'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  transporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.mail.yahoo.com',
    port: 465,
    auth: {
      user: 'nmendel3030@yahoo.com',
      pass: 'jump1jump1'
    }
  }));

/**
 * Create an reading
 */
exports.create = function (req, res) {
  var reading = new Reading(req.body);

  var latestReg = null;

  // TODO: make it work if theres no registration
  Product.find().sort('-date')
  .populate('user', 'displayName').populate('user', 'email')
  .exec(function (err, products) {
    if (err) {
      // failed to find registered devices
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      for (var i = 0; i < products.length; i++) {
        if (products[i].DeviceID === reading.DeviceID) {
          latestReg = products[i];
          break;
        }
      }

      if (latestReg !== null && latestReg.threshold <= reading.Weight) {
        reading.alert = true;
      }

      console.log('Alert? -> ' + reading.alert);
      if (reading.alert) {

        // setup e-mail data with unicode symbols
        var mailOptions = {
          from: '"BuyBot" <nmendel3030@yahoo.com>',
          to: latestReg.user.email,
          subject: '[BuyBot] Time to buy ' + latestReg.name,
          text: 'Hello, it is time to purchase more ' + latestReg.name,
          html: '<b>Hello, it is time to purchase more ' + latestReg.name + '</b>'
        };

        if (latestReg.alert_type === 'Amazon Order') {
          mailOptions.text = 'Failed to order ' + latestReg.name + ' from Amazon. It is time to purchase more.';
          mailOptions.html = '<b>Failed to order ' + latestReg.name + ' from Amazon. It is time to purchase more.</b>';
        }

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            transporter.close();
            return console.log(error);
          }

          console.log('Message sent: ' + info.response);
          transporter.close();
        });
      }

      reading.save(function (err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json(reading);
        }
      });
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
