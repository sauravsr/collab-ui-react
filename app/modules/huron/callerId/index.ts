import { CallerIdComponent, CallerIdConfig, CallerIdOption } from './callerId.component';

export const BLOCK_CALLERID_TYPE = 'Blocked Outbound Caller ID';
export const DIRECT_LINE_TYPE = 'Direct Line';
export const COMPANY_CALLERID_TYPE = 'Company Number';
export const CUSTOM_COMPANY_TYPE = 'Custom';
export { CallerIdConfig, CallerIdOption };

export default angular
  .module('huron.caller-id', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate'
  ])
  .component('ucCallerId', new CallerIdComponent())
  .name;