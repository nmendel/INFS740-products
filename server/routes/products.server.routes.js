'use strict';

/**
 * Module dependencies
 */
var productsPolicy = require('../policies/products.server.policy'),
  products = require('../controllers/products.server.controller'),
  reading = require('../controllers/reading.server.controller');

module.exports = function (app) {
  // Products collection routes
  app.route('/api/products').all(productsPolicy.isAllowed)
    .get(products.list)
    .post(products.create);

  // Single product routes
  app.route('/api/products/:productId').all(productsPolicy.isAllowed)
    .get(products.read)
    .put(products.update)
    .delete(products.delete);

  // Finish by binding the product middleware
  app.param('productId', products.productByID);

  // Reading collection routes
  app.route('/api/reading').all(productsPolicy.isAllowed)
    .get(reading.list)
    .post(reading.create);

  // Single reading routes
  app.route('/api/reading/:readingId').all(productsPolicy.isAllowed)
    .get(reading.read)
    .put(reading.update)
    .delete(reading.delete);

  // Finish by binding the reading middleware
  app.param('readingId', reading.readingByID);
};
