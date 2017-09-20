import { HuronDateFormatComponent } from './settings-date-format.component';

export default angular
  .module('call.settings.date-format', [
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucDateFormat', new HuronDateFormatComponent())
  .name;
