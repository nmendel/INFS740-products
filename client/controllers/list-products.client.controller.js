(function () {
  'use strict';

  angular
    .module('products')
    .controller('ProductsListController', ProductsListController);

  ProductsListController.$inject = ['ProductsService'];

  function ProductsListController(ProductsService) {
    var vm = this;

    var products = ProductsService.query();

    products.$promise.then(function (response) {
      var prods = {};

      for (var i = 0; i < products.length; i++) {
        var product = products[i];
        var DeviceID = product.DeviceID;
        if (!(DeviceID in prods)) {
          prods[DeviceID] = product;
        }
      }

      console.log('prods: ');
      console.log(prods);

      vm.products = Object.values(prods);
    });
  }
}());
