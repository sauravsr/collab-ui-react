import { RoutingPrefixComponent } from './routingPrefix.component';

export default angular
  .module('huron.settings.routing-prefix', [
    require('scripts/app.templates'),
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucRoutingPrefix', new RoutingPrefixComponent())
  .name;
