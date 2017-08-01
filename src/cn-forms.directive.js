(function() {
  'use strict';

  angular
    .module('cn.forms')
    .directive('cnForm', cnForm);

  function cnForm() {
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
    'cnFormsService', '$scope', '$state',
    '$stateParams', '$timeout', '$log', '$location', '$compile'
  ];
  function Form(cnFormsService, $scope, $state,
                $stateParams, $timeout, $log, $location, $compile) {

    function cnFormTag() {}
    $scope.__tag = new cnFormTag();

    var vm = this;

    vm.activate = activate;
    vm.loadOffscreen = loadOffscreen;
    vm.submit = submit;
    vm.updatePage = updatePage;
    vm.validatePage = validatePage;
    vm.cleanupEvent = "cn.forms.cleanup";
    vm.formKey = $stateParams.page;

    // debug
    vm.schemaStr = '';
    vm.onSandboxSchema = onSandboxSchema;

    $scope.$watch(() => !!vm.config.schema, vm.activate);

    $scope.$on('$destroy', function() {
      $scope.$broadcast(vm.cleanupEvent);
      $scope.$emit(vm.cleanupEvent);
      cnFormsService.destroy();
    });

    //////////

    function activate(watch) {
      vm.activateOffscreen = false;
      vm.config.getScope = vm.config.getScope || (() => $scope);
      vm.config.formCtrl = vm.cnForm;
      vm.config.buttonContainerClass = "page-action-btns";
      vm.config.isDisabled = isDisabled;

      setupStyles(vm.config);
      //if(vm.config.isModal) setupModal(vm.config);

      if(vm.config.schema) {
        try {
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

          vm.renderedPages = _.reduce(
            vm.config.schema.forms,
            (acc, value, index) => _.set(acc, index, _.eq(vm.pageIndex, index)),
            {}
          );
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
    }

    function setupStyles(config) {
      vm.styles = config.styles || {};
      vm.styles.head = vm.styles.head || config.isModal ?
        'modal-header clearfix' : 'cn-form-head cn-heading row vertical-parent';
      vm.styles.offset = vm.styles.offset || config.isModal ?
        false : 0;
      vm.styles.body = vm.styles.body || vm.styles.offset === false ?
        '' : 'cn-form-fixed';
      vm.styles.col1 = vm.styles.col1 || config.isModal ?
        '' : 'col-sm-2';
      vm.styles.col2 = vm.styles.col2 || config.isModal ?
        '' : 'col-sm-6';
      vm.styles.col3 = vm.styles.col3 || config.isModal ?
        '' : (vm.config.schema.forms ? 'col-sm-4' : 'col-sm-6');
      vm.styles.nav = vm.styles.nav || config.isModal ?
        '' : 'nav-stacked';
      vm.styles.cols = vm.styles.cols || config.isModal ?
        2 : 3;
    }

     function isDisabled(btnConfig) {
      return btnConfig.isDisabled ? btnConfig.isDisabled(isFormInvalid) : isFormInvalid(btnConfig);
    }

    function isFormInvalid(btnConfig) {
      return vm.saving || vm.cnForm.$invalid || ((!(btnConfig && btnConfig.allowPristine) || !vm.activateOffscreen) && vm.cnForm.$pristine);
    }

    function loadOffscreen() {
      vm.activateOffscreen = true;
    }

    function submit(form, handler) {
      vm.loadOffscreen();

      $scope.$broadcast('schemaFormValidate');
      $scope.$emit('schemaFormValidate');

      if((form.$valid || vm.config.allowInvalid) && !vm.saving) {
        vm.saving = true;
        handler(vm.model)
            .then(function(response) {
              vm.config.formCtrl.$setPristine();
              vm.saving = false;
            }, function(rejection) {
              vm.saving = false;
            });
      }
      else {
        _.each(vm.config.schema.forms, function(page) {
          vm.validatePage(page, page === vm.page);
        });
      }
    }

    function updatePage(page, pageIndex) {
      $scope.$broadcast('schemaFormValidate');
      // if the forms re-render these will no longer be the same reference
      if (vm.page !== vm.config.schema.forms[vm.pageIndex]) {
        vm.page = vm.config.schema.forms[vm.pageIndex];
      }

      vm.validatePage(vm.page);

      $stateParams.page = page.key;
      $state.go($state.current.name, $stateParams);
      vm.page = page;
      vm.pageIndex = pageIndex;
      vm.renderedPages[pageIndex] = true;

      $scope.$emit('flexForm.updatePage', page.key);
      $scope.$broadcast('flexForm.updatePage', page.key);
    }

    function validatePage(page, noBadge) {
      var curForm = vm.config.formCtrl[page.key];
      if(curForm) {
        console.error('curForm.$error:', curForm.$error);

        var errors = _.chain(curForm.$error)
            .reduce(function(left, right) {
              return left.concat(right);
            })
            .uniq('$name')
            .reject({$name: ''})
            .value();

        if(errors && errors.length) {
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
