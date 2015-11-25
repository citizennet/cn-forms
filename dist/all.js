(function() {
  'use strict';
  angular.module('cn.forms', ['ui.router', 'cn.ui', 'cn.flex-form']);
})();
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
(function() {
  'use strict';
  angular
      .module('cn.forms')
      .factory('cnFormsService', cnFormsService);

  function cnFormsService() {
    var service = {
      compile: compile,
      getPage: getPage,
      getPageIndex: getPageIndex,
      update: update
    };

    return service;

    //////////////

    function compile(schema, page) {
      //console.log('schema, page:', schema, page);
      service.schema = schema;
      update(page);
    }

    function update(page) {
      //console.log('service:', service, page);
      //service.form = _.find(service.schema.forms, {key: page});
      //service.schema.form = service.form.form;
      if (service.schema.forms) {
        for(var i = 0, l = service.schema.forms.length; i < l; i++) {
          var form = service.schema.forms[i];
          if(page === form.key) {
            service.form = form;
            service.formIndex = i;
            break;
          }
        }
      }
      else {
        service.form = service.schema.form;
      }
    }

    function getPage() {
      return service.form;
    }

    function getPageIndex() {
      return service.formIndex;
    }

  }
})();
angular.module("cn.forms").run(["$templateCache", function($templateCache) {$templateCache.put("cn-forms/templates/cn-forms.html","<form name=\"vm.cnForm\">\n  <section class=\"cn-form-head cn-heading row vertical-parent\">\n    <div class=\"container-fluid max-width\">\n      <div class=\"col-md-6\">\n        <h5 ng-if=\"vm.config.title.lead\">{{::vm.config.title.lead}}</h5>\n\n        <h1>{{vm.config.title.main}}</h1>\n        <h5 ng-if=\"vm.config.title.sub\">{{::vm.config.title.sub}}</h5>\n      </div>\n\n      <div class=\"page-action-btns\">\n        <div class=\"btn-options\"\n             ng-mouseover=\"vm.loadOffscreen()\">\n          <a class=\"btn\" ui-sref=\"{{vm.config.actionConfig.returnState}}\">\n            {{vm.config.actionConfig.returnText || \'Cancel\'}}\n          </a>\n        <span ng-repeat=\"button in vm.config.actionConfig.actions\">\n          <a class=\"btn {{button.style && \'btn-\'+button.style}}\"\n             ng-disabled=\"vm.saving || vm.cnForm.$invalid || ((!button.allowPristine || !vm.activateOffscreen) && vm.cnForm.$pristine)\"\n             ng-class=\"{\'btn-primary\': $index === vm.config.actionConfig.actions.length - 1}\"\n             ng-click=\"button.handler && vm.submit(vm.cnForm, button.handler)\"\n             tooltip=\"{{button.helptext}}\"\n             tooltip-placement=\"bottom\">\n            {{button.text || \'Save\'}}\n          </a>\n        </span>\n        </div>\n        <p class=\"data-updated-at text-right\" id=\"data-updated-at\">\n          <a ng-click=\"vm.updateData()\">Update Data</a>\n        </p>\n      </div>\n    </div>\n  </section>\n  <div class=\"cn-form cn-form-cols-3\"\n       cn-responsive-height\n       cn-responsive-break=\"sm\">\n    <div class=\"cn-form-inner\">\n\n      <div class=\"col-sm-3 cn-form-nav\" ng-if=\"vm.config.schema.forms\">\n        <div class=\"cn-form-nav-inner\"\n             cn-parent-width\n             cn-responsive-height\n             cn-responsive-break=\"sm\">\n          <ul class=\"nav nav-pills nav-stacked\">\n            <li class=\"{{page.key === vm.page.key ? \'active\' : \'\'}}\"\n                ng-repeat=\"page in vm.config.schema.forms\">\n              <a ng-click=\"vm.updatePage(page.key)\">\n                <i class=\"cni cni-{{page.key}}\"></i>\n                {{page.title || page.key | titleCase}}\n                <span class=\"badge has-error\" ng-show=\"page.errors\">{{page.errors}}</span>\n              </a>\n            </li>\n          </ul>\n        </div>\n      </div>\n\n      <div class=\"cn-form-body col-sm-6\">\n        <div class=\"{{$index !== vm.pageIndex ? \'offscreen\' : \'\'}}\"\n             ng-if=\"vm.config.schema.forms\"\n             ng-repeat=\"form in vm.config.schema.forms\">\n          <cn-flex-form\n            ff-form-index=\"$index\"\n            ff-form-name=\"form.key\"\n            ff-config=\"vm.config\"\n            ff-model=\"vm.model\"\n            ff-delay-form=\"$index !== vm.pageIndex && !vm.activateOffscreen\">\n          </cn-flex-form>\n        </div>\n\n        <cn-flex-form\n          ng-if=\"!vm.config.schema.forms\"\n          ff-form-index=\"$index\"\n          ff-form-name=\"vm.config.schema.form.key\"\n          ff-config=\"vm.config\"\n          ff-model=\"vm.model\"\n          ff-delay-form=\"$index !== vm.pageIndex && !vm.activateOffscreen\">\n        </cn-flex-form>\n\n        <!-- debug panel to display model -->\n        <pre ng-if=\"vm.debug\">{{vm.model|json}}</pre>\n\n        <!-- sandbox for debug mode -->\n        <fieldset ng-if=\"vm.sandbox\">\n          <legend>Sandbox</legend>\n\n          <div class=\"form-group\">\n            <label class=\"control-label\" for=\"schema\">Form Data</label>\n            <textarea id=\"schema\"\n                      class=\"form-control\"\n                      ng-model=\"vm.schemaStr\"\n                      rows=\"14\">\n            </textarea>\n          </div>\n          <div class=\"form-group\">\n            <button class=\"btn btn-primary\"\n                    ng-click=\"vm.onSandboxSchema()\">Update Form\n            </button>\n          </div>\n        </fieldset>\n        <!-- end sandbox -->\n      </div>\n      <!--<div class=\"col-sm-3 cn-form-meta\">-->\n      <!--<pre>-->\n      <!--{{vm.cnForm.$invalid | json}}-->\n      <!--{{vm.cnForm.$pristine | json}}-->\n      <!--{{vm.cnForm.$dirty | json}}-->\n      <!--</pre>-->\n      <!--</div>-->\n      <div class=\"cn-form-meta\" ng-class=\"{\'col-sm-3\': vm.config.schema.forms, \'col-sm-6\': !vm.config.schema.forms}\">\n        <div class=\"cn-form-meta-inner\"\n             cn-parent-width\n             cn-responsive-height\n             cn-responsive-break=\"sm\"\n             ng-transclude></div>\n      </div>\n    </div>\n  </div>\n</form>\n<ui-view></ui-view>\n");}]);