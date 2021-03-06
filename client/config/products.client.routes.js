(function () {
  'use strict';

  angular
    .module('products.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('products', {
        abstract: true,
        url: '/products',
        template: '<ui-view/>'
      })
      .state('products.list', {
        url: '',
        templateUrl: 'modules/products/client/views/list-products.client.view.html',
        controller: 'ProductsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Products List'
        }
      })
      .state('products.create', {
        url: '/create',
        templateUrl: 'modules/products/client/views/form-product.client.view.html',
        controller: 'ProductsController',
        controllerAs: 'vm',
        resolve: {
          productResolve: newProduct
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Products Create'
        }
      })
      .state('products.edit', {
        url: '/:productId/edit',
        templateUrl: 'modules/products/client/views/form-product.client.view.html',
        controller: 'ProductsController',
        controllerAs: 'vm',
        resolve: {
          productResolve: getProduct
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Product {{ productResolve.title }}'
        }
      })
      .state('products.view', {
        url: '/:productId',
        templateUrl: 'modules/products/client/views/view-product.client.view.html',
        controller: 'ProductsController',
        controllerAs: 'vm',
        resolve: {
          productResolve: getProduct
        },
        data: {
          pageTitle: 'Product {{ productResolve.title }}'
        }
      });


    $stateProvider
      .state('reading', {
        abstract: true,
        url: '/reading',
        template: '<ui-view/>'
      })
      .state('reading.list', {
        url: '',
        templateUrl: 'modules/products/client/views/list-reading.client.view.html',
        controller: 'ReadingListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Histogram'
        }
      });

  }

  getProduct.$inject = ['$stateParams', 'ProductsService'];

  function getProduct($stateParams, ProductsService) {
    return ProductsService.get({
      productId: $stateParams.productId
    }).$promise;
  }

  newProduct.$inject = ['ProductsService'];

  function newProduct(ProductsService) {
    return new ProductsService();
  }
}());
