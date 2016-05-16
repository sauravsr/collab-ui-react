(function () {
  'use strict';

  angular
    .module('Core')
    .controller('CustomerOverviewCtrl', CustomerOverviewCtrl);

  /* @ngInject */
  function CustomerOverviewCtrl($state, $stateParams, $translate, $window, AccountOrgService, Authinfo, Auth, BrandService, Config, FeatureToggleService, identityCustomer, Log, Notification, Orgservice, PartnerService, TrialService, Userservice) {
    var vm = this;

    vm.currentCustomer = $stateParams.currentCustomer;
    vm.customerName = vm.currentCustomer.customerName;
    vm.customerOrgId = vm.currentCustomer.customerOrgId;

    vm.reset = reset;
    vm.saveLogoSettings = saveLogoSettings;
    vm.launchCustomerPortal = launchCustomerPortal;
    vm.openEditTrialModal = openEditTrialModal;
    vm.getDaysLeft = getDaysLeft;
    vm.isSquaredUC = isSquaredUC();
    vm.isOrgSetup = isOrgSetup;
    vm.isOwnOrg = isOwnOrg;
    vm.getUserAuthInfo = getUserAuthInfo;
    vm.deleteTestOrg = deleteTestOrg;

    vm.uuid = '';
    vm.logoOverride = false;
    vm.showRoomSystems = false;
    vm.usePartnerLogo = true;
    vm.allowCustomerLogos = false;
    vm.allowCustomerLogoOrig = false;
    vm.isTest = false;

    vm.partnerOrgId = Authinfo.getOrgId();
    vm.partnerOrgName = Authinfo.getOrgName();
    vm.isPartnerAdmin = Authinfo.isPartnerAdmin();

    var licAndOffers = PartnerService.parseLicensesAndOffers(vm.currentCustomer);
    vm.offer = vm.currentCustomer.offer = _.get(licAndOffers, 'offer');

    FeatureToggleService.supports(FeatureToggleService.features.atlasCloudberryTrials).then(function (result) {
      if (result) {
        if (_.find(vm.currentCustomer.offers, {
            id: Config.offerTypes.roomSystems
          })) {
          vm.showRoomSystems = result;
        }
      }
    });

    init();

    vm.toggleAllowCustomerLogos = _.debounce(function (value) {
      if (value) {
        BrandService.enableCustomerLogos(vm.customerOrgId);
      } else {
        BrandService.disableCustomerLogos(vm.customerOrgId);
      }
    }, 2000, {
      'leading': true,
      'trailing': false
    });

    function init() {
      initCustomer();
      getLogoSettings();
      getIsTestOrg();
    }

    function resetForm() {
      if (vm.form) {
        vm.allowCustomerLogos = vm.allowCustomerLogoOrig;
        vm.form.$setPristine();
        vm.form.$setUntouched();
      }
    }

    function reset() {
      resetForm();
    }

    function saveLogoSettings() {
      vm.toggleAllowCustomerLogos(vm.allowCustomerLogos);
      vm.form.$setPristine();
      vm.form.$setUntouched();
    }

    function initCustomer() {
      if (angular.isUndefined(vm.currentCustomer.customerEmail)) {
        vm.currentCustomer.customerEmail = identityCustomer.email;
      }
    }

    function getLogoSettings() {
      BrandService.getSettings(Authinfo.getOrgId())
        .then(function (settings) {
          vm.logoOverride = settings.allowCustomerLogos;
        });
      BrandService.getSettings(vm.customerOrgId)
        .then(function (settings) {
          vm.usePartnerLogo = settings.usePartnerLogo;
          vm.allowCustomerLogos = settings.allowCustomerLogos;
          vm.allowCustomerLogoOrig = settings.allowCustomerLogos;
        });
    }

    function LicenseFeature(name, bAdd) {
      this['id'] = name.toString();
      this['idOperation'] = bAdd ? 'ADD' : 'REMOVE';
      this['properties'] = null;
    }

    function collectLicenseIdsForWebexSites(liclist) {
      var licIds = [];
      var i = 0;
      if (angular.isUndefined(liclist)) {
        liclist = [];
      }
      for (i = 0; i < liclist.length; i++) {
        var lic = liclist[i];
        var licId = lic.licenseId;
        var lictype = lic.licenseType;
        var isConfType = lictype === "CONFERENCING";
        if (isConfType) {
          licIds.push(new LicenseFeature(licId, (angular.isUndefined(lic.siteUrl) === false)));
        }
      }
      return licIds;
    } //collectLicenses

    function launchCustomerPortal() {
      var liclist = vm.currentCustomer.licenseList;
      var licIds = collectLicenseIdsForWebexSites(liclist);
      var partnerEmail = Authinfo.getPrimaryEmail();
      var u = {
        'address': partnerEmail
      };
      if (licIds.length > 0) {
        Userservice.updateUsers([u], licIds, null, 'updateUserLicense', function () {});
      } else {
        AccountOrgService.getAccount(vm.customerOrgId).success(function (data) {
          var d = data;
          var len = d.accounts.length;
          var i = 0;
          for (i = 0; i < len; i++) {
            var account = d.accounts[i];
            var lics = account.licenses;
            var licIds = collectLicenseIdsForWebexSites(lics);
            Userservice.updateUsers([u], licIds, null, 'updateUserLicense', function () {});
          }
        });
      }
      $window.open($state.href('login_swap', {
        customerOrgId: vm.customerOrgId,
        customerOrgName: vm.customerName
      }));
    }

    function openEditTrialModal() {
      TrialService.getTrial(vm.currentCustomer.trialId).then(function (response) {
        $state.go('trialEdit.info', {
            currentTrial: vm.currentCustomer,
            details: response
          })
          .then(function () {
            $state.modal.result.then(function () {
              $state.go('partnercustomers.list', {}, {
                reload: true
              });
            });
          });
      });
    }

    function getDaysLeft(daysLeft) {
      if (daysLeft < 0) {
        return $translate.instant('customerPage.expired');
      } else if (daysLeft === 0) {
        return $translate.instant('customerPage.expiresToday');
      } else {
        return daysLeft;
      }
    }

    function isSquaredUC() {
      if (angular.isArray(identityCustomer.services)) {
        return _.contains(identityCustomer.services, Config.entitlements.huron);
      }
      return false;
    }

    function isOrgSetup() {
      return _.every(vm.currentCustomer.unmodifiedLicenses, {
        status: 'ACTIVE'
      });
    }

    function isOwnOrg() {
      return vm.customerName === Authinfo.getOrgName();
    }

    function getUserAuthInfo() {
      PartnerService.getUserAuthInfo(vm.customerOrgId);
    }

    function getIsTestOrg() {
      Orgservice.getOrg(function (data, status) {
        if (data.success) {
          vm.isTest = data.isTestOrg;
        } else {
          Log.error('Query org info failed. Status: ' + status);
        }
      }, vm.customerOrgId);
    }

    function deleteTestOrg() {
      if (vm.isTest) {
        if ($window.confirm("Press OK if you want to Delete " + vm.customerName) === true) {
          Orgservice.deleteOrg(vm.customerOrgId).then(function () {
            Notification.success('customerPage.deleteOrgSuccess', {
              orgName: vm.customerName
            });
          }).catch(function (error) {
            Notification.error('customerPage.deleteOrgError', {
              orgName: vm.customerName
            });
          });
        }
      }
    }

  }
})();
