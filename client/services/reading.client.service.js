(function () {
  'use strict';

  angular
    .module('products.services')
    .factory('ReadingService', ReadingService);

  ReadingService.$inject = ['$resource'];

  function ReadingService($resource) {
    return $resource('api/reading/:readingId', {
      readingId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
