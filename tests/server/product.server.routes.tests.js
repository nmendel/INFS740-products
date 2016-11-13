'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Product = mongoose.model('Product'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  product;

/**
 * Product routes tests
 */
describe('Product CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new product
    user.save(function () {
      product = {
        title: 'Product Title',
        content: 'Product Content'
      };

      done();
    });
  });

  it('should be able to save an product if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new product
        agent.post('/api/products')
          .send(product)
          .expect(200)
          .end(function (productSaveErr, productSaveRes) {
            // Handle product save error
            if (productSaveErr) {
              return done(productSaveErr);
            }

            // Get a list of products
            agent.get('/api/products')
              .end(function (productsGetErr, productsGetRes) {
                // Handle product save error
                if (productsGetErr) {
                  return done(productsGetErr);
                }

                // Get products list
                var products = productsGetRes.body;

                // Set assertions
                (products[0].user._id).should.equal(userId);
                (products[0].title).should.match('Product Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an product if not logged in', function (done) {
    agent.post('/api/products')
      .send(product)
      .expect(403)
      .end(function (productSaveErr, productSaveRes) {
        // Call the assertion callback
        done(productSaveErr);
      });
  });

  it('should not be able to save an product if no title is provided', function (done) {
    // Invalidate title field
    product.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new product
        agent.post('/api/products')
          .send(product)
          .expect(400)
          .end(function (productSaveErr, productSaveRes) {
            // Set message assertion
            (productSaveRes.body.message).should.match('Title cannot be blank');

            // Handle product save error
            done(productSaveErr);
          });
      });
  });

  it('should be able to update an product if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new product
        agent.post('/api/products')
          .send(product)
          .expect(200)
          .end(function (productSaveErr, productSaveRes) {
            // Handle product save error
            if (productSaveErr) {
              return done(productSaveErr);
            }

            // Update product title
            product.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing product
            agent.put('/api/products/' + productSaveRes.body._id)
              .send(product)
              .expect(200)
              .end(function (productUpdateErr, productUpdateRes) {
                // Handle product update error
                if (productUpdateErr) {
                  return done(productUpdateErr);
                }

                // Set assertions
                (productUpdateRes.body._id).should.equal(productSaveRes.body._id);
                (productUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of products if not signed in', function (done) {
    // Create new product model instance
    var productObj = new Product(product);

    // Save the product
    productObj.save(function () {
      // Request products
      request(app).get('/api/products')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single product if not signed in', function (done) {
    // Create new product model instance
    var productObj = new Product(product);

    // Save the product
    productObj.save(function () {
      request(app).get('/api/products/' + productObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', product.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single product with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/products/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Product is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single product which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent product
    request(app).get('/api/products/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No product with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an product if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new product
        agent.post('/api/products')
          .send(product)
          .expect(200)
          .end(function (productSaveErr, productSaveRes) {
            // Handle product save error
            if (productSaveErr) {
              return done(productSaveErr);
            }

            // Delete an existing product
            agent.delete('/api/products/' + productSaveRes.body._id)
              .send(product)
              .expect(200)
              .end(function (productDeleteErr, productDeleteRes) {
                // Handle product error error
                if (productDeleteErr) {
                  return done(productDeleteErr);
                }

                // Set assertions
                (productDeleteRes.body._id).should.equal(productSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an product if not signed in', function (done) {
    // Set product user
    product.user = user;

    // Create new product model instance
    var productObj = new Product(product);

    // Save the product
    productObj.save(function () {
      // Try deleting product
      request(app).delete('/api/products/' + productObj._id)
        .expect(403)
        .end(function (productDeleteErr, productDeleteRes) {
          // Set message assertion
          (productDeleteRes.body.message).should.match('User is not authorized');

          // Handle product error error
          done(productDeleteErr);
        });

    });
  });

  it('should be able to get a single product that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new product
          agent.post('/api/products')
            .send(product)
            .expect(200)
            .end(function (productSaveErr, productSaveRes) {
              // Handle product save error
              if (productSaveErr) {
                return done(productSaveErr);
              }

              // Set assertions on new product
              (productSaveRes.body.title).should.equal(product.title);
              should.exist(productSaveRes.body.user);
              should.equal(productSaveRes.body.user._id, orphanId);

              // force the product to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the product
                    agent.get('/api/products/' + productSaveRes.body._id)
                      .expect(200)
                      .end(function (productInfoErr, productInfoRes) {
                        // Handle product error
                        if (productInfoErr) {
                          return done(productInfoErr);
                        }

                        // Set assertions
                        (productInfoRes.body._id).should.equal(productSaveRes.body._id);
                        (productInfoRes.body.title).should.equal(product.title);
                        should.equal(productInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single product if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new product model instance
    product.user = user;
    var productObj = new Product(product);

    // Save the product
    productObj.save(function () {
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = user.id;

          // Save a new product
          agent.post('/api/products')
            .send(product)
            .expect(200)
            .end(function (productSaveErr, productSaveRes) {
              // Handle product save error
              if (productSaveErr) {
                return done(productSaveErr);
              }

              // Get the product
              agent.get('/api/products/' + productSaveRes.body._id)
                .expect(200)
                .end(function (productInfoErr, productInfoRes) {
                  // Handle product error
                  if (productInfoErr) {
                    return done(productInfoErr);
                  }

                  // Set assertions
                  (productInfoRes.body._id).should.equal(productSaveRes.body._id);
                  (productInfoRes.body.title).should.equal(product.title);

                  // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                  (productInfoRes.body.isCurrentUserOwner).should.equal(true);

                  // Call the assertion callback
                  done();
                });
            });
        });
    });
  });

  it('should be able to get a single product if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new product model instance
    var productObj = new Product(product);

    // Save the product
    productObj.save(function () {
      request(app).get('/api/products/' + productObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', product.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single product, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      username: 'temp',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create temporary user
    var _user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _user.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Product
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = user._id;

          // Save a new product
          agent.post('/api/products')
            .send(product)
            .expect(200)
            .end(function (productSaveErr, productSaveRes) {
              // Handle product save error
              if (productSaveErr) {
                return done(productSaveErr);
              }

              // Set assertions on new product
              (productSaveRes.body.title).should.equal(product.title);
              should.exist(productSaveRes.body.user);
              should.equal(productSaveRes.body.user._id, userId);

              // now signin with the temporary user
              agent.post('/api/auth/signin')
                .send(_creds)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the product
                  agent.get('/api/products/' + productSaveRes.body._id)
                    .expect(200)
                    .end(function (productInfoErr, productInfoRes) {
                      // Handle product error
                      if (productInfoErr) {
                        return done(productInfoErr);
                      }

                      // Set assertions
                      (productInfoRes.body._id).should.equal(productSaveRes.body._id);
                      (productInfoRes.body.title).should.equal(product.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (productInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Product.remove().exec(done);
    });
  });
});
