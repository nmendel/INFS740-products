(function () {
  'use strict';

  angular
    .module('products')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Products',
      state: 'products',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'products', {
      title: 'List Products',
      state: 'products.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'products', {
      title: 'Create Product',
      state: 'products.create',
      roles: ['user']
    });

    menuService.addSubMenuItem('topbar', 'products', {
      title: 'Histogram',
      state: 'reading.list'
    });
  }
}());
