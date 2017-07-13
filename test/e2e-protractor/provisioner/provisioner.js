import * as provisionerHelper from './provisioner.helper';
import * as atlasHelper from './provisioner.helper.atlas';
import * as cmiHelper from './provisioner.helper.cmi';
import * as helper from '../../api_sanity/test_helper';
import * as _ from 'lodash';
import * as Promise from 'promise';
import { PstnCustomer } from './terminus-customers';
import { PstnCustomerE911Signee } from './terminus-customers-customer-e911';
import { PstnNumbersOrders } from './terminus-numbers-orders';
import * as pstnHelper from './provisioner.helper.pstn';

/* global LONG_TIMEOUT */

export function provisionAtlasCustomer(partnerName, trial) {
  return provisionerHelper.getToken(partnerName)
    .then(token => {
      return deleteAtlasCustomerIfFound(token, partnerName, trial.customerName)
        .then(createCustomer => {
          if (createCustomer) {
            console.log(`Creating customer ${trial.customerName} in Atlas...`);
            return atlasHelper.createAtlasCustomer(token, helper.auth[partnerName].org, trial)
              .then(customer => {
                console.log(`${trial.customerName} successfully created in Atlas!`);
                return customer;
              });
          } else {
            console.log(`${trial.customerName} found in Atlas! provisionerKeepCustomer flag is true, skipping create.`);
            return Promise.resolve();
          }
        });
    });
}

export function provisionCmiCustomer(partnerName, customer, site, numberRange) {
  return provisionerHelper.getToken(partnerName)
    .then(token => {
      console.log(`Creating customer ${customer.name} in CMI...`);
      return cmiHelper.createCmiCustomer(token, customer)
        .then(() => {
          console.log(`${customer.name} successfully created in CMI!`);
          console.log('Creating site in CMI...');
          return cmiHelper.createCmiSite(token, customer.uuid, site);
        })
        .then(() => {
          console.log('Site successfully created in CMI!');
          console.log(`Creating number range ${numberRange.name} in CMI...`);
          return cmiHelper.createNumberRange(token, customer.uuid, numberRange);
        })
        .then(() => {
          console.log('Number Range successfully created in CMI!');
          return provisionerHelper.flipFtswFlag(token, customer.uuid);
        });
    });
}


export function provisionCustomerAndLogin(customer) {
  return this.provisionAtlasCustomer(customer.partner, customer.trial)
    .then(atlasCustomer => {
      if (atlasCustomer && customer.cmiCustomer) {
        customer.cmiCustomer.uuid = atlasCustomer.customerOrgId;
        customer.cmiCustomer.name = atlasCustomer.customerName;
        return this.provisionCmiCustomer(customer.partner, customer.cmiCustomer, customer.cmiSite, customer.numberRange)
          .then(() => setupPSTN(customer))
          .then(() => loginPartner(customer.partner))
          .then(() => switchToCustomerWindow(customer.name));
      } else {
        return loginPartner(customer.partner)
          .then(() => switchToCustomerWindow(customer.name));
      }
    });
}

export function setupPSTN(customer) {
  if (customer.pstn) {
    return provisionerHelper.getToken(customer.partner)
      .then(token => {
        console.log('Creating PSTN customer');
        var obj = {};
        obj.firstName = customer.cmiCustomer.name;
        obj.email = customer.trial.customerEmail;
        obj.uuid = customer.cmiCustomer.uuid;
        obj.name = customer.name;
        obj.resellerId = helper.auth[customer.partner].org;
        const pstnCustomer = new PstnCustomer(obj);
        return pstnHelper.createPstnCustomer(token, pstnCustomer)
          .then(() => {
            console.log('Adding e911 signature to customer');
            obj = {};
            obj.firstName = customer.cmiCustomer.name;
            obj.email = customer.trial.customerEmail;
            obj.name = customer.name;
            obj.e911Signee = customer.cmiCustomer.uuid;
            const pstnCustomerE911 = new PstnCustomerE911Signee(obj);
            return pstnHelper.putE911Signee(token, pstnCustomerE911)
              .then(() => {
                console.log('Adding phone numbers to customer');
                obj = {};
                obj.numbers = customerNumbersPSTN(customer.pstnLines);
                const pstnNumbersOrders = new PstnNumbersOrders(obj);
                return pstnHelper.addPstnNumbers(token, pstnNumbersOrders, customer.cmiCustomer.uuid);
              });
          });
      });
  }
}

export function customerNumbersPSTN(number) {
  var prevNumber = 0;
  var pstnNumbers = [];
  for (var i = 0; i < number; i++) {
    var numbers = numberPSTN(prevNumber);
    prevNumber = numbers[1];
    pstnNumbers.push(numbers[0]);
  }
  return pstnNumbers;
}

export function numberPSTN(prevNumber) {
  var date = Date.now();
  console.log(date);
  // If created at same millisecond as previous
  if (date <= prevNumber) {
    date = ++prevNumber;
  } else {
    prevNumber = date;
  }
  // get last 10 digits from date and format into PSTN number
  date = date.toString();
  date = ('+1919' + date.substr(date.length - 7));
  return [date, prevNumber];
}

export function tearDownAtlasCustomer(partnerName, customerName) {
  if (!provisionerKeepCustomer) {
    return provisionerHelper.getToken(partnerName)
      .then(token => {
        return deleteAtlasCustomerIfFound(token, partnerName, customerName);
      });
  } else {
    console.log('provisionerKeepCustomer flag is true, skipping delete.');
    return Promise.resolve();
  }
}

function deleteAtlasCustomerIfFound(token, partnerName, customerName) {
  return atlasHelper.findAtlasCustomer(token, helper.auth[partnerName].org, customerName)
    .then(response => {
      console.log(`Searching for ${customerName} in Atlas...`);
      const managedOrgs = _.get(response, 'organizations', undefined);
      if (_.isArray(managedOrgs) && managedOrgs.length > 0) {
        if (!provisionerKeepCustomer) {
          console.log(`${customerName} found in Atlas!  Deleting...`);
          return atlasHelper.deleteAtlasCustomer(token, managedOrgs[0].customerOrgId)
            .then(() => {
              console.log(`${customerName} successfully deleted from Atlas!`);
              return true;
            });
        } else {
          console.log(`${customerName} found in Atlas! provisionerKeepCustomer flag is true, skipping delete.`);
          return false;
        }
      } else {
        console.log(`${customerName} not found in Atlas!`);
        return true;
      }
    });
}

export function loginPartner(partnerEmail) {
  return login.login(partnerEmail, '#/partner/customers');
}

function switchToCustomerWindow(customerName) {
  utils.click(element(by.cssContainingText('.ui-grid-cell', customerName)));
  utils.click(partner.launchCustomerPanelButton);
  return utils.switchToNewWindow().then(() => {
    return utils.wait(navigation.tabs, LONG_TIMEOUT);
  });
}

