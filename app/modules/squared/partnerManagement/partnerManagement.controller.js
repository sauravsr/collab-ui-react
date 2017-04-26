require('./partnerManagement.scss');

/* eslint-disable */

(function () {
  'use strict';

  /* @ngInject */
  function PartnerManagementController($scope, $state, $translate, $window,
    Notification, PartnerManagementService) {
    $scope.$on('$viewContentLoaded', function () {
      $window.document.title = $translate.instant('partnerManagement.browserTabHeaderTitle');
    });

    var vm = this;
    var svc = PartnerManagementService;

    $scope.vm = vm;
    vm.isLoading = false;

    vm.partnerPlaceholder = $translate.instant('partnerManagement.create.selectPartnerPlaceholder');
    vm.partnerTypes = ['DISTI', 'DVAR', 'RESELLER', 'NA'];
    vm.partnerOptions = _.map(vm.partnerTypes, function (s) { 
      return  { label: $translate.instant('partnerManagement.create.partnerTypes.' + s),
                value: s,
              };
            });

    // Error messages from validators
    vm.messages = {
      required: $translate.instant('partnerManagement.error.required'),
      email: $translate.instant('partnerManagement.error.email'),
      noMatch: $translate.instant('partnerManagement.error.noMatch'),
      unused: $translate.instant('partnerManagement.error.nameInUse'),
    };

    // reset form data
    function initData() {
      vm.data = {
        email: '',
        confirmEmail: '',
        name: '',
        confirmName: '',
        partnerType: '',
        lifeCyclePartner: false,
      };
    }
    initData();

    vm.search = function () {
      var targetState;
      vm.isLoading = true;
      svc.search(vm.data.email).then(function (resp) {
        vm.isLoading = false;
        switch (resp.status) {
          case 200:
            switch (resp.data.orgMatchBy) {
              case "EMAIL_ADDRESS":
              case "DOMAIN_CLAIMED":
                vm.data.emailMatch = resp.data.organizations[0];
                vm.data.name = vm.data.emailMatch.displayName;
                getOrgDetails(vm.data.emailMatch.orgId);
                $state.go((resp.data.orgMatchBy === 'EMAIL_ADDRESS') ?
                  'partnerManagement.orgExists' : 'partnerManagement.orgClaimed');
                break;

              case "DOMAIN":
                vm.data.domainMatches = resp.data.organizations;
                $state.go('partnerManagement.searchResults');
                break;

              case "NO_MATCH":
                $state.go('partnerManagement.create');
                break;

              default:
                  Notification.errorWithTrackingId(resp,
                    'partnerManagement.error.searchFailed', 
                    {msg: $translate.instant('partnerManagement.error.unexpectedResp')});
              }
              break;

            default:
              // Unexpected resp, but go on to create anyway
              // (the create API will check email as well)
              $state.go('partnerManagement.create');
        }
      }).catch(function (resp) {
        vm.isLoading = false;
        Notification.errorWithTrackingId(resp,
        'partnerManagement.error.searchFailed',
        {msg: (_.isEmpty(resp.data)) ? 
          $translate.instant('partnerManagement.error.timeout') : resp.data.message});
      });
    };

    vm.create = function () {
      vm.isLoading = true;
      svc.create(vm.data).then(function () {
        vm.isLoading = false;
        $state.go('partnerManagement.createSuccess');
      }).catch(function (resp) {
        vm.isLoading = false;
        if (resp.data.message === ('Organization ' + vm.data.name +
          ' already exists in CI')) {
          vm.duplicateName = vm.data.name;
          $scope.$$childHead.createForm.name.$validate();
        } else {
          Notification.errorWithTrackingId(resp,
            'partnerManagement.error.createFailed',
            {msg: (_.isEmpty(resp.data)) ? 
              $translate.instant('partnerManagement.error.timeout') : resp.data.message});
        }
      });
    };

    vm.done = function () {
      $state.go('support.status');
    };

    vm.startOver = function () {
      initData();
      $state.go('partnerManagement.search');
    };

    function pushDetail(label, value, defValue) {
      value = value || defValue;
      if ( Array.isArray(value) ) {
        value = value.join(', ');
      }

      vm.data.orgDetails.push({
        label: $translate.instant('partnerManagement.orgDetails.' + label),
        value: value,
      });
    }

    function getOrgDetails(org) {
      // this is done while browser is loading page...
      vm.showSpinner = true;
      svc.getOrgDetails(org).then(function (resp) {
        vm.data.orgRaw = resp.data;
        vm.data.orgDetails = [];
        pushDetail('createDate', new Date(vm.data.orgRaw.createdDate).toLocaleString());
        pushDetail('activeSubs', vm.data.orgRaw.numOfSubscriptions, 0);
        pushDetail('managedCusts', vm.data.orgRaw.numOfManagedOrg, 0);
        pushDetail('domains', vm.data.orgRaw.claimedDomains, '');
        pushDetail('users', vm.data.orgRaw.numOfUsers, 0);
        pushDetail('admins',_.sortBy(_.map(vm.data.orgRaw.fullAdmins, 'displayName'),
            ['displayName', 'primaryEmail']), '');
        pushDetail('orgId', org);
        vm.showSpinner = false;
      }).catch(function (resp) {
        Notification.errorWithTrackingId(resp,
          'partnerManagement.error.getOrgDetails',
          {msg: (_.isEmpty(resp.data)) ? 
            $translate.instant('partnerManagement.error.timeout') : resp.data.message});
          vm.showSpinner = false;
      });
    }
  }

  angular
    .module('Squared')
    .directive('validateMatch', validateMatchDirective)
    .directive('validateUnused', validateUnusedDirective)
    .controller('PartnerManagementController', PartnerManagementController);

  function validateMatchDirective() {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, elem, attrs, ngModelCtrl) {
        ngModelCtrl.$validators.noMatch = function (value) {
          return attrs.validateMatch === value;
        };
      },
    };
  }

  function validateUnusedDirective() {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, elem, attrs, ngModelCtrl) {
        ngModelCtrl.$validators.unused = function (value) {
          return _.isEmpty(scope.vm.duplicateName) || 
            (value !== scope.vm.duplicateName);
        };
      },
    };
  }
}());

/* eslint-enable */
