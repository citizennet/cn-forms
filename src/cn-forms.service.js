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

    function destroy() {
      service.form = null;
      service.schema = null;
      service.formIndex = null;
    }
  }
})();
