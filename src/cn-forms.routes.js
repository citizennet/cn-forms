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
      let pageParam = options.excludedPage ? `{page:(?!${options.excludedPage})[^/]*}` : ':page';
      let queryParams = ['debug', 'sandbox'].concat(options.queryParams || []).join('&');
      $stateProvider
          .state(options.name, {
            abstract: true,
            url: `${options.baseUrl}?${queryParams}`,
            controller: options.controller,
            controllerAs: 'vm',
            resolve: options.resolve,
            permissions: options.permissions,
            params: options.params,
            templateUrl: options.templateUrl,
            reloadOnSearch: false
          })
          .state(options.name + '.page', {
            url: `/${pageParam}`,
            permissions: options.permissions
          });

      cnFlexFormRoutesProvider.addStates(options);
    }
  }

})();
