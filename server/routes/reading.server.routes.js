'use strict';

/**
 * Module dependencies
 */
var readingPolicy = require('../policies/reading.server.policy'),
  reading = require('../controllers/reading.server.controller');

module.exports = function (app) {
  // Reading collection routes
  app.route('/api/reading').all(readingPolicy.isAllowed)
    .get(reading.list)
    .post(reading.create);

  // Single reading routes
  app.route('/api/reading/:readingId').all(readingPolicy.isAllowed)
    .get(reading.read)
    .put(reading.update)
    .delete(reading.delete);

  // Finish by binding the reading middleware
  app.param('readingId', reading.readingByID);
};
