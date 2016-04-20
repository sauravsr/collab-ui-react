(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('TrialDeviceService', TrialDeviceService);

  /* @ngInject */
  function TrialDeviceService(TrialCallService, TrialRoomSystemService) {
    var _trialData;
    var service = {
      getData: getData,
      reset: reset,
      getLimitsPromise: getLimitsPromise,
      getStates: getStates,
      getCountries: getCountries,
      canAddDevice: canAddDevice,
    };

    return service;

    ////////////////

    function getData() {
      return _trialData || _makeTrial();
    }

    function reset() {
      _makeTrial();
    }

    function _makeTrial() {
      var defaults = {
        skipDevices: false,
        shippingInfo: {
          type: 'CUSTOMER',
          name: '',
          phoneNumber: '',
          country: '',
          addressLine1: '',
          unit: '',
          city: '',
          state: '',
          postalCode: ''
        }
      };

      _trialData = angular.copy(defaults);
      return _trialData;
    }

    function getLimitsPromise() {
      return _trialData.limitsPromise;
    }

    function getCountries() {
      return [{
        country: 'United States'
      }];
    }

    function getStates() {
      return [{
        state: 'Alabama',
        abbr: 'AL'
      }, {
        state: 'Alaska',
        abbr: 'AK'
      }, {
        state: 'Arizona',
        abbr: 'AZ'
      }, {
        state: 'Arkansas',
        abbr: 'AR'
      }, {
        state: 'California',
        abbr: 'CA'
      }, {
        state: 'Colorado',
        abbr: 'CO'
      }, {
        state: 'Connecticut',
        abbr: 'CT'
      }, {
        state: 'Delaware',
        abbr: 'DE'
      }, {
        state: 'Florida',
        abbr: 'FL'
      }, {
        state: 'Georgia',
        abbr: 'GA'
      }, {
        state: 'Hawaii',
        abbr: 'HI'
      }, {
        state: 'Idaho',
        abbr: 'ID'
      }, {
        state: 'Illinois',
        abbr: 'IL'
      }, {
        state: 'Indiana',
        abbr: 'IN'
      }, {
        state: 'Iowa',
        abbr: 'IA'
      }, {
        state: 'Kansas',
        abbr: 'KS'
      }, {
        state: 'Kentucky',
        abbr: 'KY'
      }, {
        state: 'Louisiana',
        abbr: 'LA'
      }, {
        state: 'Maine',
        abbr: 'ME'
      }, {
        state: 'Maryland',
        abbr: 'MD'
      }, {
        state: 'Massachusetts',
        abbr: 'MA'
      }, {
        state: 'Michigan',
        abbr: 'MI'
      }, {
        state: 'Minnesota',
        abbr: 'MN'
      }, {
        state: 'Mississippi',
        abbr: 'MS'
      }, {
        state: 'Missouri',
        abbr: 'MO'
      }, {
        state: 'Montana',
        abbr: 'MT'
      }, {
        state: 'Nebraska',
        abbr: 'NE'
      }, {
        state: 'Nevada',
        abbr: 'NV'
      }, {
        state: 'New Hampshire',
        abbr: 'NH'
      }, {
        state: 'New Jersey',
        abbr: 'NJ'
      }, {
        state: 'New Mexico',
        abbr: 'NM'
      }, {
        state: 'New York',
        abbr: 'NY'
      }, {
        state: 'North Carolina',
        abbr: 'NC'
      }, {
        state: 'North Dakota',
        abbr: 'ND'
      }, {
        state: 'Ohio',
        abbr: 'OH'
      }, {
        state: 'Oklahoma',
        abbr: 'OK'
      }, {
        state: 'Oregon',
        abbr: 'OR'
      }, {
        state: 'Pennsylvania',
        abbr: 'PA'
      }, {
        state: 'Rhode Island',
        abbr: 'RI'
      }, {
        state: 'South Carolina',
        abbr: 'SC'
      }, {
        state: 'South Dakota',
        abbr: 'SD'
      }, {
        state: 'Tennessee',
        abbr: 'TN'
      }, {
        state: 'Texas',
        abbr: 'TX'
      }, {
        state: 'Utah',
        abbr: 'UT'
      }, {
        state: 'Vermont',
        abbr: 'VT'
      }, {
        state: 'Virginia',
        abbr: 'VA'
      }, {
        state: 'Washington',
        abbr: 'WA'
      }, {
        state: 'West Virginia',
        abbr: 'WV'
      }, {
        state: 'Wisconsin',
        abbr: 'WI'
      }, {
        state: 'Wyoming',
        abbr: 'WY'
      }];
    }

    function canAddDevice(details, roomSystemsEnabled, callEnabled, canSeeDevicePage) {
      if (!canSeeDevicePage) {
        return false;
      }
      return (TrialRoomSystemService.canAddRoomSystemDevice(details, roomSystemsEnabled) || TrialCallService.canAddCallDevice(details, callEnabled));
    }
  }
})();
