(function() {
  'use strict';
  angular
      .module('cn.forms')
      .directive('cnForm', cnForm);

  cnForm.$inject = ['$window'];
  function cnForm($window) {
    return {
      restrict: 'E',
      templateUrl: 'cn-forms/templates/cn-forms.html',
      transclude: true,
      scope: {
        config: '=ffConfig',
        model: '=ffModel'
      },
      controller: Form,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  Form.$inject = [
    'cnFormsService', '$rootScope', '$scope', '$state',
    '$stateParams', '$timeout', '$log', '$location', '$compile'
  ];
  function Form(cnFormsService, $rootScope, $scope, $state,
                $stateParams, $timeout, $log, $location, $compile) {

    var vm = this;

    vm.activate = activate;
    vm.loadOffscreen = loadOffscreen;
    vm.submit = submit;
    vm.updateData = updateData;
    vm.updatePage = updatePage;
    vm.validatePage = validatePage;

    // debug
    vm.schemaStr = '';
    vm.onSandboxSchema = onSandboxSchema;

    $scope.$watch(function() {
      return !!vm.config.schema;
    }, vm.activate);

    //////////

    function activate(watch) {
      //console.log('watch:', watch);

      //vm.activateOffscreen = true;
      vm.activateOffscreen = false;
      vm.config.cols = 3;
      vm.config.formCtrl = vm.cnForm;

      if(vm.config.schema) {
        try {
          //vm.ogSchema = _.clone(vm.config.schema, true);
          vm.compiled = false;
          cnFormsService.compile(vm.config.schema, $stateParams.page);
          vm.pageIndex = cnFormsService.getPageIndex();
          vm.page = cnFormsService.getPage();

          vm.compiled = true;

          if(vm.page.errors) {
            vm.page.errors = 0;
            $timeout(function() {
              $scope.$broadcast('schemaFormValidate');
            });
          }

          //if(vm.offscreenTimeout) $timeout.cancel(vm.offscreenTimeout);
          //vm.offscreenTimeout = $timeout(loadOffscreen, 2000);
        }
        catch(e) {
          $log.error('There was an error with your form data:', e.message);
        }
      }

      // sandbox
      if($location.search().sandbox) {
        vm.schemaStr = angular.toJson(vm.config.schema);
        vm.sandbox = true;
      }
      // debug
      if($location.search().debug) {
        vm.debug = true;
      }
    }

    function loadOffscreen() {
      //if(vm.offscreenTimeout) {
      //  $timeout.cancel(vm.offscreenTimeout);
      //  vm.offscreenTimeout = null;
      //}
      console.log('vm.activateOffscreen:', vm.activateOffscreen);
      vm.activateOffscreen = true;
    }

    function submit(form, handler) {
      console.log('submit:');
      vm.loadOffscreen();

      $scope.$broadcast('schemaFormValidate');
      $scope.$emit('schemaFormValidate');

      if(form.$valid && !vm.saving) {
        vm.saving = true;
        handler(vm.model)
            .then(function(response) {
              console.log('submit:response:', response);
              vm.config.formCtrl.$setPristine();
              vm.saving = false;
            });
      }
      else {
        //console.error('form invalid:', form);
        _.each(vm.config.schema.forms, function(page) {
          vm.validatePage(page, page === vm.page);
        });
      }
    }

    function updateData() {
      console.log('updateData:', updateData);
      $scope.$emit('ffRefreshData');
    }

    function updatePage(page) {
      $scope.$broadcast('schemaFormValidate');

      vm.validatePage(vm.page);

      $stateParams.page = page;
      $state.go($state.current.name, $stateParams);

      $scope.$emit('flexForm.updatePage', page);
    }

    function validatePage(page, noBadge) {
      var curForm = vm.config.formCtrl[page.key];
      if(curForm) {
        console.log('curForm.$error:', curForm.$error);
        //var errors = _
        //    .chain(curForm.$error)
        //    .reduce(function(left, right) {
        //      return _.merge(left, right);
        //    })
        //    .each()
        //    .value();

        var errors = _.chain(curForm.$error)
            .reduce(function(left, right) {
              return left.concat(right);
            })
            .uniq('$name')
            .reject({$name: ''})
            .value();

        if(errors && errors.length) {
          //$rootScope.$broadcast('cnForms:errors:' + page.key, errors);
          page.errors = !noBadge && errors.length;
        }
        else {
          page.errors = 0;
        }
      }
    }

    // debug

    function onSandboxSchema() {
      if(vm.schemaStr) {
        vm.config.schema = angular.fromJson(vm.schemaStr);
      }
    }
  }
})();