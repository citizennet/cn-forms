# cn-forms
CitizenNet Forms library

# Installation

## 1. bower
To get started, install CitizenNet's `cn-util`, `cn-tags-input`, `angular-schema-form` fork, `cn-flex-form` and
`cn-forms`:

    bower install https://github.com/citizennet/cn-util.git\#master --save-dev
    bower install https://github.com/citizennet/cn-tags-input.git\#master --save-dev
    bower install https://github.com/citizennet/angular-schema-form.git\#master --save-dev
    bower install https://github.com/citizennet/cn-flex-form.git\#master --save-dev
    bower install https://github.com/citizennet/cn-forms.git\#master --save-dev

## 2. grunt/gulp
Make sure to add the necessary files to your `grunt` or `gulp` build.
For `cn-util` you'll want:

    "dist/all.min.js"

For `cn-tags-input` you'll want:

    "dist/all.min.js"

For `angular-schema-form`:

    "dist/schema-form.min.js",
    "dist/bootstrap-decorator.min.js"

For `cn-flex-form`:

    "dist/all.min.js"

And for `cn-forms`:

    "dist/all.min.js"

## 3. angular
And last be sure to add it as a dependency for your angular app:

    angular.module("yourapp", ["cn.forms"]);

# Usage
Controller:

    vm.formConfig = {
        schema: vm.schema,
        getSchema: vm.getSchema,
        title: {
            lead: 'Editing Form', // optional, text to appear above main title
            main: 'Form Title',
            sub: 'Settings and options' // optional, text to appear below main title
        },
        actionConfig: {
            returnState: 'list', // state 'Cancel' button returns to
            returnText: 'Return', // optional, defaults to 'Cancel'
            actions: [{
                text: 'Save Form', // optional, defaults to 'Save'
                handler: vm.save, // must return promise
                allowPristine: true // optional, allow the form to save when it is still pristine, defaults to false
            }]
        }
    };

Template:

    <cn-form ff-config="vm.formConfig" ff-model="vm.model">
        <div ng-if="vm.third-col-markup">
            Any content here will be transcluded in the third column of the form
        </div>
    </cn-form>
