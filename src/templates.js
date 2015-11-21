angular.module("cn.forms").run(["$templateCache", function($templateCache) {$templateCache.put("cn-forms/templates/cn-forms.html","<form name=\"vm.cnForm\">\n  <section class=\"cn-form-head cn-heading row vertical-parent\">\n    <div class=\"container-fluid max-width\">\n      <div class=\"col-md-6\">\n        <h5 ng-if=\"vm.config.title.lead\">{{::vm.config.title.lead}}</h5>\n\n        <h1>{{vm.config.title.main}}</h1>\n        <h5 ng-if=\"vm.config.title.sub\">{{::vm.config.title.sub}}</h5>\n      </div>\n\n      <div class=\"page-action-btns\">\n        <div class=\"btn-options\"\n             ng-mouseover=\"vm.loadOffscreen()\">\n          <a class=\"btn\" ui-sref=\"{{vm.config.actionConfig.returnState}}\">\n            {{vm.config.actionConfig.returnText || \'Cancel\'}}\n          </a>\n        <span ng-repeat=\"button in vm.config.actionConfig.actions\">\n          <a class=\"btn {{button.style && \'btn-\'+button.style}}\"\n             ng-disabled=\"vm.saving || vm.cnForm.$invalid || ((!button.allowPristine || !vm.activateOffscreen) && vm.cnForm.$pristine)\"\n             ng-class=\"{\'btn-primary\': $index === vm.config.actionConfig.actions.length - 1}\"\n             ng-click=\"button.handler && vm.submit(vm.cnForm, button.handler)\"\n             tooltip=\"{{button.helptext}}\"\n             tooltip-placement=\"bottom\">\n            {{button.text || \'Save\'}}\n          </a>\n        </span>\n        </div>\n        <p class=\"data-updated-at text-right\" id=\"data-updated-at\">\n          <a ng-click=\"vm.updateData()\">Update Data</a>\n        </p>\n      </div>\n    </div>\n  </section>\n  <div class=\"cn-form cn-form-cols-3\"\n       cn-responsive-height\n       cn-responsive-break=\"sm\">\n    <div class=\"cn-form-inner\">\n\n      <div class=\"col-sm-3 cn-form-nav\" ng-if=\"vm.config.schema.forms\">\n        <div class=\"cn-form-nav-inner\"\n             cn-parent-width\n             cn-responsive-height\n             cn-responsive-break=\"sm\">\n          <ul class=\"nav nav-pills nav-stacked\">\n            <li class=\"{{page.key === vm.page.key ? \'active\' : \'\'}}\"\n                ng-repeat=\"page in vm.config.schema.forms\">\n              <a ng-click=\"vm.updatePage(page.key)\">\n                <i class=\"cni cni-{{page.key}}\"></i>\n                {{page.title || page.key | titleCase}}\n                <span class=\"badge has-error\" ng-show=\"page.errors\">{{page.errors}}</span>\n              </a>\n            </li>\n          </ul>\n        </div>\n      </div>\n\n      <div class=\"cn-form-body\" ng-class=\"{\'col-sm-6\': vm.config.schema.forms, \'col-sm-6\': !vm.config.schema.forms}\">\n        <div class=\"{{$index !== vm.pageIndex ? \'offscreen\' : \'\'}}\"\n             ng-if=\"vm.config.schema.forms\"\n             ng-repeat=\"form in vm.config.schema.forms\">\n          <cn-flex-form\n            ff-form-index=\"$index\"\n            ff-form-name=\"form.key\"\n            ff-config=\"vm.config\"\n            ff-model=\"vm.model\"\n            ff-delay-form=\"$index !== vm.pageIndex && !vm.activateOffscreen\">\n          </cn-flex-form>\n        </div>\n\n        <cn-flex-form\n          ng-if=\"!vm.config.schema.forms\"\n          ff-form-index=\"$index\"\n          ff-form-name=\"vm.config.schema.form.key\"\n          ff-config=\"vm.config\"\n          ff-model=\"vm.model\"\n          ff-delay-form=\"$index !== vm.pageIndex && !vm.activateOffscreen\">\n        </cn-flex-form>\n\n        <!-- debug panel to display model -->\n        <pre ng-if=\"vm.debug\">{{vm.model|json}}</pre>\n\n        <!-- sandbox for debug mode -->\n        <fieldset ng-if=\"vm.sandbox\">\n          <legend>Sandbox</legend>\n\n          <div class=\"form-group\">\n            <label class=\"control-label\" for=\"schema\">Form Data</label>\n            <textarea id=\"schema\"\n                      class=\"form-control\"\n                      ng-model=\"vm.schemaStr\"\n                      rows=\"14\">\n            </textarea>\n          </div>\n          <div class=\"form-group\">\n            <button class=\"btn btn-primary\"\n                    ng-click=\"vm.onSandboxSchema()\">Update Form\n            </button>\n          </div>\n        </fieldset>\n        <!-- end sandbox -->\n      </div>\n      <!--<div class=\"col-sm-3 cn-form-meta\">-->\n      <!--<pre>-->\n      <!--{{vm.cnForm.$invalid | json}}-->\n      <!--{{vm.cnForm.$pristine | json}}-->\n      <!--{{vm.cnForm.$dirty | json}}-->\n      <!--</pre>-->\n      <!--</div>-->\n      <div class=\"cn-form-meta\" ng-class=\"{\'col-sm-3\': vm.config.schema.forms, \'col-sm-6\': !vm.config.schema.forms}\">\n        <div class=\"cn-form-meta-inner\"\n             cn-parent-width\n             cn-responsive-height\n             cn-responsive-break=\"sm\"\n             ng-transclude></div>\n      </div>\n    </div>\n  </div>\n</form>\n<ui-view></ui-view>\n");}]);