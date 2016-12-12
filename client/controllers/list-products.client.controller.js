(function () {
  'use strict';

  angular
    .module('products')
    .controller('ProductsListController', ProductsListController);

  ProductsListController.$inject = ['ProductsService'];

  function ProductsListController(ProductsService) {
    var vm = this;

    var products = ProductsService.query();

    // TODO: finish
/*
    var prods = {};

    console.log(products);

    for (var i = 0; i < products[0].length; i++) {
      console.log(products[0][i]);
      var DeviceID = products[0][i].DeviceID;
      prods[DeviceID] = products[0][i];
    }

    console.log('prods: ');
    console.log(prods);

    vm.products = Object.values(prods);
*/
    vm.products = products;
  }
}());
