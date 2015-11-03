(function() {
  'use strict';
  angular
      .module('cn.forms')
      .provider('cnFormsRoutes', cnFormsRoutesProvider);

  cnFormsRoutesProvider.$inject = ['$stateProvider', 'cnFlexFormRoutesProvider'];
  function cnFormsRoutesProvider($stateProvider, cnFlexFormRoutesProvider) {
    var provider = {
      addStates: addStates,
      $get: $get
    };

    return provider;

    ////////////

    function $get() {
      // nothing to do here, but required
    }

    function addStates(options) {
      $stateProvider
          .state(options.name, {
            abstract: true,
            url: options.baseUrl,
            controller: options.controller,
            controllerAs: 'vm',
            template: '<ui-view></ui-view>',
            resolve: options.resolve,
            permissions: options.permissions,
            params: options.params
          })
          .state(options.name + '.page', {
            url: (options.excludedPage ? '/{page:(?!' + options.excludedPage + ')[^/]*}' : '/:page') + '?debug&sandbox',
            templateUrl: options.templateUrl,
            permissions: options.permissions
          });

      cnFlexFormRoutesProvider.addStates(options);
    }
  }

})();