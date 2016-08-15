angular.module("cn.forms").run(["$templateCache", function($templateCache) {$templateCache.put("cn-forms/templates/cn-forms.html","<form name=\"vm.cnForm\">\n  <section class=\"cn-form-head cn-heading row vertical-parent\">\n    <div class=\"container-fluid max-width\">\n      <cn-flex-form-header ff-header-config=\"vm.config\"\n                           ff-submit=\"vm.submit(vm.cnForm, handler)\"\n                           ff-load-offscreen=\"vm.loadOffscreen()\">\n      </cn-flex-form-header>\n    </div>\n  </section>\n  <div class=\"cn-form cn-form-cols-3\"\n       cn-responsive-height\n       cn-responsive-break=\"sm\">\n    <div class=\"cn-form-inner\">\n\n      <div class=\"col-sm-3 cn-form-nav\" ng-if=\"vm.config.schema.forms\">\n        <div class=\"cn-form-nav-inner\"\n             cn-parent-width\n             cn-responsive-height\n             cn-responsive-break=\"sm\">\n          <ul class=\"nav nav-pills nav-stacked\">\n            <li class=\"{{page.key === vm.page.key ? \'active\' : \'\'}}\"\n                ng-repeat=\"page in vm.config.schema.forms\">\n              <a ng-click=\"vm.updatePage(page.key)\">\n                <i class=\"cni cni-{{page.key}}\"></i>\n                {{page.title || page.key | titleCase}}\n                <span class=\"badge has-error\" ng-show=\"page.errors\">{{page.errors}}</span>\n              </a>\n            </li>\n          </ul>\n        </div>\n      </div>\n\n      <div class=\"cn-form-body col-sm-6\">\n        <div class=\"{{$index !== vm.pageIndex ? \'offscreen\' : \'\'}}\"\n             ng-if=\"vm.config.schema.forms\"\n             ng-repeat=\"form in vm.config.schema.forms\">\n          <cn-flex-form\n            ff-form-index=\"$index\"\n            ff-form-name=\"form.key\"\n            ff-config=\"vm.config\"\n            ff-model=\"vm.model\"\n            ff-delay-form=\"$index !== vm.pageIndex && !vm.activateOffscreen\"\n            ff-cleanup-event=\"vm.cleanupEvent\">\n          </cn-flex-form>\n        </div>\n\n        <cn-flex-form\n          ng-if=\"!vm.config.schema.forms\"\n          ff-form-index=\"$index\"\n          ff-form-name=\"vm.formKey\"\n          ff-config=\"vm.config\"\n          ff-model=\"vm.model\"\n          ff-cleanup-event=\"vm.cleanupEvent\">\n        </cn-flex-form>\n\n        <!-- sandbox for debug mode -->\n        <fieldset ng-if=\"vm.sandbox\">\n          <legend>Sandbox</legend>\n\n          <div class=\"form-group\">\n            <label class=\"control-label\" for=\"schema\">Form Data</label>\n            <textarea id=\"schema\"\n                      class=\"form-control\"\n                      ng-model=\"vm.schemaStr\"\n                      rows=\"14\">\n            </textarea>\n          </div>\n          <div class=\"form-group\">\n            <button class=\"btn btn-primary\"\n                    ng-click=\"vm.onSandboxSchema()\">Update Form\n            </button>\n          </div>\n        </fieldset>\n        <!-- end sandbox -->\n      </div>\n\n      <div class=\"cn-form-meta\" ng-class=\"{\'col-sm-3\': vm.config.schema.forms, \'col-sm-6\': !vm.config.schema.forms}\">\n        <div class=\"cn-form-meta-inner\"\n             cn-parent-width\n             cn-responsive-height\n             cn-responsive-break=\"sm\"\n             cn-set-max-height=\"true\">\n          <div ng-bind-html=\"vm.config.schema.meta\"/>\n          <div ng-transclude/>\n        </div>\n      </div>\n    </div>\n  </div>\n</form>\n<ui-view></ui-view>\n");}]);