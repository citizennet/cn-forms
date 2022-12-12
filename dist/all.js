'use strict';

(function () {
  'use strict';

  angular.module('cn.forms', ['ui.router', 'cn.ui', 'cn.flex-form']);
})();
'use strict';

(function () {
  'use strict';

  angular.module('cn.forms').directive('cnForm', cnForm);

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

  Form.$inject = ['cnFormsService', '$scope', '$state', '$stateParams', '$timeout', '$log', '$location', '$compile'];
  function Form(cnFormsService, $scope, $state, $stateParams, $timeout, $log, $location, $compile) {

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

    $scope.$watch(function () {
      return !!vm.config.schema;
    }, vm.activate);

    $scope.$on('$destroy', function () {
      $scope.$broadcast(vm.cleanupEvent);
      $scope.$emit(vm.cleanupEvent);
      cnFormsService.destroy();
    });

    //////////

    function activate(watch) {
      vm.activateOffscreen = false;
      vm.config.getScope = vm.config.getScope || function () {
        return $scope;
      };
      vm.config.formCtrl = vm.cnForm;
      vm.config.buttonContainerClass = "page-action-btns";
      vm.config.isDisabled = isDisabled;

      setupStyles(vm.config);
      //if(vm.config.isModal) setupModal(vm.config);

      if (vm.config.schema) {
        try {
          vm.compiled = false;
          cnFormsService.compile(vm.config.schema, $stateParams.page);
          vm.pageIndex = cnFormsService.getPageIndex();
          vm.page = cnFormsService.getPage();

          vm.compiled = true;

          if (vm.page.errors) {
            vm.page.errors = 0;
            $timeout(function () {
              $scope.$broadcast('schemaFormValidate');
            });
          }

          vm.renderedPages = _.reduce(vm.config.schema.forms, function (acc, value, index) {
            return _.set(acc, index, _.eq(vm.pageIndex, index));
          }, {});
        } catch (e) {
          $log.error('There was an error with your form data:', e.message);
        }
      }

      // sandbox
      if ($location.search().sandbox) {
        vm.schemaStr = angular.toJson(vm.config.schema);
        vm.sandbox = true;
      }
    }

    function setupStyles(config) {
      vm.styles = config.styles || {};
      vm.styles.head = vm.styles.head || config.isModal ? 'modal-header clearfix' : 'cn-form-head cn-heading row vertical-parent';
      vm.styles.offset = vm.styles.offset || config.isModal ? false : 0;
      vm.styles.body = vm.styles.body || vm.styles.offset === false ? '' : 'cn-form-fixed';
      vm.styles.col1 = vm.styles.col1 || config.isModal ? '' : 'col-sm-2';
      vm.styles.col2 = vm.styles.col2 || config.isModal ? '' : 'col-sm-6';
      vm.styles.col3 = vm.styles.col3 || config.isModal ? '' : vm.config.schema.forms ? 'col-sm-4' : 'col-sm-6';
      vm.styles.nav = vm.styles.nav || config.isModal ? '' : 'nav-stacked';
      vm.styles.cols = vm.styles.cols || config.isModal ? 2 : 3;
    }

    function isDisabled(btnConfig) {
      return btnConfig.isDisabled ? btnConfig.isDisabled(isFormInvalid) : isFormInvalid(btnConfig);
    }

    function isFormInvalid(btnConfig) {
      return vm.saving || vm.cnForm.$invalid || (!(btnConfig && btnConfig.allowPristine) || !vm.activateOffscreen) && vm.cnForm.$pristine;
    }

    function loadOffscreen() {
      vm.activateOffscreen = true;
    }

    function submit(form, handler) {
      vm.loadOffscreen();

      $scope.$broadcast('schemaFormValidate');
      $scope.$emit('schemaFormValidate');

      if ((form.$valid || vm.config.allowInvalid) && !vm.saving) {
        vm.saving = true;
        handler(vm.model).then(function (response) {
          vm.config.formCtrl.$setPristine();
          vm.saving = false;
        }, function (rejection) {
          vm.saving = false;
        });
      } else {
        _.each(vm.config.schema.forms, function (page) {
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
      var oldPage = vm.page;
      vm.page = page;
      vm.pageIndex = pageIndex;
      vm.renderedPages[pageIndex] = true;

      $scope.$emit('flexForm.updatePage', page.key);
      $scope.$broadcast('flexForm.updatePage', page.key);
      $scope.$broadcast('schemaFormRedraw');

      $timeout(function () {
        $scope.$broadcast('schemaFormValidate');
        vm.validatePage(vm.page);
        vm.validatePage(oldPage);
      });
    }

    function validatePage(page, noBadge) {
      var curForm = vm.config.formCtrl[page.key];
      if (curForm) {
        console.error('curForm.$error:', curForm.$error);

        var errors = _.chain(curForm.$error).reduce(function (left, right) {
          return left.concat(right);
        }).uniq('$name').reject({ $name: '' }).value();

        if (errors && errors.length) {
          page.errors = !noBadge && errors.length;
        } else {
          page.errors = 0;
        }
      }
    }

    // debug

    function onSandboxSchema() {
      if (vm.schemaStr) {
        vm.config.schema = angular.fromJson(vm.schemaStr);
      }
    }
  }
})();
'use strict';

(function () {
  'use strict';

  angular.module('cn.forms').provider('cnFormsRoutes', cnFormsRoutesProvider);

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
      var pageParam = options.excludedPage ? '{page:(?!' + options.excludedPage + ')[^/]*}' : ':page';
      var queryParams = ['debug', 'sandbox'].concat(options.queryParams || []).join('&');
      $stateProvider.state(options.name, {
        abstract: true,
        url: options.baseUrl + '?' + queryParams,
        controller: options.controller,
        controllerAs: options.controllerAs || 'vm',
        resolve: options.resolve,
        permissions: options.permissions,
        params: options.params,
        templateUrl: options.templateUrl,
        reloadOnSearch: false
      }).state(options.name + '.page', {
        url: '/' + pageParam,
        permissions: options.permissions,
        template: '<ui-view/>'
      });

      cnFlexFormRoutesProvider.addStates(options);
    }
  }
})();
'use strict';

(function () {
  'use strict';

  angular.module('cn.forms').factory('cnFormsService', cnFormsService);

  function cnFormsService() {
    var service = {
      compile: compile,
      getPage: getPage,
      getPageIndex: getPageIndex,
      update: update,
      destroy: destroy
    };

    return service;

    //////////////

    function compile(schema, page) {
      service.schema = schema;
      update(page);
    }

    function update(page) {
      if (service.schema.forms) {
        for (var i = 0, l = service.schema.forms.length; i < l; i++) {
          var form = service.schema.forms[i];
          if (page === form.key) {
            service.form = form;
            service.formIndex = i;
            break;
          }
        }
      } else {
        service.form = service.schema.form;
      }
    }

    function getPage() {
      return service.form;
    }

    function getPageIndex() {
      return service.formIndex;
    }

    function destroy() {
      service.form = null;
      service.schema = null;
      service.formIndex = null;
    }
  }
})();
"use strict";

angular.module("cn.forms").run(["$templateCache", function ($templateCache) {
  $templateCache.put("cn-forms/templates/cn-forms.html", "<form name=\"vm.cnForm\">\n  <section class=\"{{vm.styles.head}}\">\n    <cn-flex-form-header\n      ff-header-config=\"vm.config\"\n      ff-submit=\"vm.submit(vm.cnForm, handler)\"\n      ff-load-offscreen=\"vm.loadOffscreen()\"\n    />\n  </section>\n  <div\n    class=\"cn-form cn-form-cols-{{vm.styles.cols}} {{vm.styles.body}}\"\n    cn-responsive-height=\"{{vm.styles.offset}}\"\n    cn-responsive-break=\"sm\"\n  >\n    <div class=\"cn-form-inner\">\n\n      <div\n        ng-if=\"vm.config.schema.forms\"\n        class=\"cn-form-nav {{vm.styles.col1}}\"\n      >\n        <div\n          class=\"cn-form-nav-inner\"\n          cn-parent-width\n          cn-responsive-height=\"{{vm.styles.offset}}\"\n          cn-responsive-break=\"sm\"\n        >\n          <ul class=\"nav nav-pills {{vm.styles.nav}}\">\n            <li class=\"{{page.key === vm.page.key ? \'active\' : \'\'}}\"\n                ng-repeat=\"page in vm.config.schema.forms\">\n              <a ng-click=\"vm.updatePage(page, $index)\">\n                {{page.title || page.key | titleCase}}\n                <span class=\"badge has-error\" ng-show=\"page.errors\">{{page.errors}}</span>\n              </a>\n            </li>\n          </ul>\n        </div>\n      </div>\n\n      <div class=\"cn-form-body {{vm.styles.col2}}\">\n        <div class=\"{{$index !== vm.pageIndex ? \'offscreen\' : \'\'}}\"\n             ng-if=\"vm.config.schema.forms\"\n             ng-repeat=\"form in vm.config.schema.forms\">\n          <cn-flex-form\n            ff-form-index=\"$index\"\n            ff-form-name=\"form.key\"\n            ff-config=\"vm.config\"\n            ff-model=\"vm.model\"\n            ff-delay-form=\"!vm.renderedPages[$index] && !vm.activateOffscreen\"\n            ff-cleanup-event=\"vm.cleanupEvent\">\n          </cn-flex-form>\n        </div>\n\n        <cn-flex-form\n          ng-if=\"!vm.config.schema.forms\"\n          ff-form-index=\"$index\"\n          ff-form-name=\"vm.formKey\"\n          ff-config=\"vm.config\"\n          ff-model=\"vm.model\"\n          ff-cleanup-event=\"vm.cleanupEvent\">\n        </cn-flex-form>\n\n        <!-- sandbox for debug mode -->\n        <fieldset ng-if=\"vm.sandbox\">\n          <legend>Sandbox</legend>\n\n          <div class=\"form-group\">\n            <label class=\"control-label\" for=\"schema\">Form Data</label>\n            <textarea id=\"schema\"\n                      class=\"form-control\"\n                      ng-model=\"vm.schemaStr\"\n                      rows=\"14\">\n            </textarea>\n          </div>\n          <div class=\"form-group\">\n            <button class=\"btn btn-primary\"\n                    ng-click=\"vm.onSandboxSchema()\">Update Form\n            </button>\n          </div>\n        </fieldset>\n        <!-- end sandbox -->\n      </div>\n\n      <div\n        ng-if=\"vm.styles.cols > 2\"\n        class=\"cn-form-meta {{vm.styles.col3}}\"\n      >\n        <div\n          class=\"cn-form-meta-inner\"\n          cn-parent-width\n          cn-responsive-height=\"{{vm.styles.offset}}\"\n          cn-responsive-break=\"sm\"\n          cn-set-max-height=\"true\"\n        >\n          <div ng-bind-html=\"vm.config.schema.meta\"/>\n          <div ng-transclude/>\n        </div>\n      </div>\n    </div>\n  </div>\n</form>\n<div ng-if=\"!vm.config.isModal\">\n  <ui-view/>\n</div>\n");
}]);