# cn-forms
CitizenNet Forms library

# Installation

## 1. dependencies
**cn-forms** is built as an additional layer on top of
**[cn-flex-form](https://github.com/citizennet/cn-flex-form)**, follow the installation
instructions there and then continue with the steps below.

## 2. bower
To get started, install CitizenNet's `cn-forms`:

    bower install https://github.com/citizennet/cn-forms.git#master --save-dev

## 3. grunt/gulp
Add the following file to your `grunt` or `gulp` build:

    "dist/all.min.js"

## 4. angular
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
