import { IWebExSite } from './meeting-settings.interface';

describe('Controller: MeetingSettingsCtrl', () => {
  const transferCodeResponse = getJSONFixture('core/json/orders/transferCodeResponse.json');
  const actingSubscriptions = _.clone(getJSONFixture('core/json/customerSubscriptions/getSubscriptionsData.json'));
  const conferenceServices = _.clone(getJSONFixture('core/json/authInfo/confServices.json'));
  const actingSubscription = _.find(actingSubscriptions, { subscriptionId : '235235-2352532-42352311d-87235221-d05b7c3523596f577' });
  const savedDataFromMeetingSetup = _.clone(getJSONFixture('core/json/setupWizard/meeting-settings/savedSitesData.json'));

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies(
      '$controller',
      '$q',
      '$rootScope',
      '$scope',
      '$translate',
      'Analytics',
      'Authinfo',
      'Config',
      'FeatureToggleService',
      'Notification',
      'SetupWizardService',
      'TrialTimeZoneService',
      'TrialWebexService');

    spyOn(this.TrialTimeZoneService, 'getTimeZones').and.returnValue(this.$q.resolve({}));
    spyOn(this.TrialWebexService, 'validateSiteUrl').and.returnValue(this.$q.resolve({ isValid: true, errorCode: 'validSite' }));
    spyOn(this.SetupWizardService, 'getPendingAudioLicenses').and.returnValue([{ offerName: 'TSP' }]);
    spyOn(this.SetupWizardService, 'getActingSubscriptionLicenses').and.returnValue(actingSubscription['licenses']);
    spyOn(this.Authinfo, 'getConferenceServices').and.returnValue(conferenceServices);
    spyOn(this.SetupWizardService, 'validateCCASPPartner').and.returnValue(this.$q.resolve({ isValid: true }));
    spyOn(this.SetupWizardService, 'hasPendingCCASPPackage').and.returnValue(true);
    spyOn(this.SetupWizardService, 'getActiveCCASPPackage').and.returnValue(undefined);
    spyOn(this.SetupWizardService, 'getCCASPPartners').and.returnValue(this.$q.resolve(['partner1', 'partner2']));
    spyOn(this.SetupWizardService, 'validateTransferCode').and.returnValue(this.$q.resolve(transferCodeResponse));
    spyOn(this.TrialWebexService, 'getProvisioningWebexSitesData').and.returnValue({});
    spyOn(this.Authinfo, 'getUserName').and.returnValue('ordersimp-somedude@mailinator.com');
    spyOn(this.Authinfo, 'getCustomerAdminEmail').and.returnValue('ordersimp-somedude2@mailinator.com');
    spyOn(this.FeatureToggleService, 'atlasSetupSiteUserManagementGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.Analytics, 'trackServiceSetupSteps').and.returnValue(this.$q.resolve());
    this.savedDataFromMeetingSetup = savedDataFromMeetingSetup;
    this.actingSubscription = actingSubscription;
  });

  function initController(): void {
    this.initController('MeetingSettingsCtrl', {});
  }

  describe('upon initialization', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should find existing WebEx licenses on acting subscription and push them to sitesArray', function () {
      expect(this.SetupWizardService.getActingSubscriptionLicenses).toHaveBeenCalled();
      expect(this.controller.sitesArray.length).toBe(2);
      const hasSiteUrlFromActiveLicense = _.some(this.controller.sitesArray, { siteUrl: 'frankSinatraTest.dmz' });
      expect(this.controller.sitesArray[0]['keepExistingSite']).toBeTruthy();
      expect(hasSiteUrlFromActiveLicense).toBe(true);
    });

    it('should find existing trial WebEx licenses on acting subscription and push them to sitesArray', function () {
      expect(this.Authinfo.getConferenceServices).toHaveBeenCalled();
      const hasSiteUrlFromTrialLicense = _.some(this.controller.existingTrialSites, { siteUrl: 'sqcie2e30.dmz' });
      expect(hasSiteUrlFromTrialLicense).toBe(true);
    });

    it('should ignore existing online trial sites', function () {
      const hasSiteUrlFromOnlineTrialLicense = _.some(this.controller.existingTrialSites, { siteUrl: 'someonlinesite.my' });
      const addsTrialSiteToExistingWebexSites = _.some(this.controller.existingWebexSites, { siteUrl: 'someonlinesite.my' });
      expect(hasSiteUrlFromOnlineTrialLicense).toBe(false);
      expect(addsTrialSiteToExistingWebexSites).toBe(false);
      expect(this.controller.existingTrialSites.length).toBe(1);
    });

    it('should set the user management setup type correctly', function () {
      const sparkSetupSite = _.find(this.controller.sitesArray, { siteUrl: 'frankSinatraTest.dmz' });
      const legacySetupSite = _.find(this.controller.sitesArray, { siteUrl: 'frankSinatraTestWX.dmz' });
      expect(this.controller.sitesArray.length).toEqual(2);
      expect(sparkSetupSite['setupType']).toBeUndefined();
      expect(legacySetupSite.hasOwnProperty('setupType')).toBeTruthy();
      expect(legacySetupSite['setupType']).toEqual(this.Config.setupTypes.legacy);
    });
    it('should correctly identify CI Unified sites', function () {
      expect(this.controller.sitesArray[0].isCIUnifiedSite).toBe(true);
      expect(this.controller.sitesArray[1].isCIUnifiedSite).toBe(false);
    });

  });

  describe('when returning back to meeting setup', function () {
    it('should set \'keep existing site\' correctly', function () {
      // existing subscription services
      const actingSubscriptionData = this.actingSubscription;
      const uniqPreExistingSavedSites = _.chain(actingSubscriptionData.licenses).map('siteUrl').uniq().value();
      // unique sites associated with licenses from existing subscription services
      _.remove(uniqPreExistingSavedSites, _.isUndefined);
      // data we have stashed while going through meeting setup
      const returnedFromGetProvisioningWebexSitesData = _.get(this, 'savedDataFromMeetingSetup');
      // sites info from this data
      const savedSites = _.get(returnedFromGetProvisioningWebexSitesData, 'webexLicencesPayload.webexProvisioningParams.webexSiteDetailsList') as any[];
      this.TrialWebexService.getProvisioningWebexSitesData.and.returnValue(returnedFromGetProvisioningWebexSitesData);

      initController.apply(this);

      //saved sites from eixsting subscriptions . They should have keepExistingSite set to true.
      const preExistingRetrievedSites = _.filter(this.controller.sitesArray, (site: IWebExSite) => {
        return _.includes(uniqPreExistingSavedSites, site.siteUrl + this.Config.siteDomainUrl.webexUrl);
      });
      // new saved sites
      const newRetrievedites = _.reject(this.controller.sitesArray, (site: IWebExSite) => {
        return _.includes(uniqPreExistingSavedSites, site.siteUrl + this.Config.siteDomainUrl.webexUrl);
      });
      // all sites should be carries over
      expect(this.controller.sitesArray.length).toEqual(savedSites.length);
      // all sites carried over from existing subscriptions have to have 'keepExisting' flag be true
      expect(_.every(preExistingRetrievedSites, { keepExistingSite: true })).toBeTruthy();
      // all new sites that wwere save should have 'keepExisting' flag be false
      expect(_.every(newRetrievedites, { keepExistingSite: true })).toBeFalsy();
    });

  });

  describe('user management in meeting site setup', function () {
    it('should be shown if the logged in user\'s email or customer admin email matches the pattern "ordersimp-<>@mailinator.com"', function() {
      initController.apply(this);
      expect(this.controller.isShowUserManagement).toEqual(true);
      this.Authinfo.getUserName.and.returnValue('bob@nonmatching-email.com');
      initController.apply(this);
      expect(this.controller.isShowUserManagement).toEqual(true);
    });
    it('should NOT be shown if the logged in user\'s email or customer admin email does NOT match the pattern "ordersimp-<>@mailinator.com" AND FT is false', function() {
      this.Authinfo.getUserName.and.returnValue('bob@nonmatching-email.com');
      this.Authinfo.getCustomerAdminEmail.and.returnValue('another@nonmatching-email.com');
      initController.apply(this);
      expect(this.controller.isShowUserManagement).toEqual(false);
      this.Authinfo.getUserName.and.returnValue('ordersimp@email.com');
      initController.apply(this);
      expect(this.controller.isShowUserManagement).toEqual(false);
    });
    it('should be shown if the logged in user\'s emails does NOT match the pattern "ordersimp-<>@mailinator.com" BUT FT is true', function() {
      this.Authinfo.getUserName.and.returnValue('bob@nonmatching-email.com');
      this.Authinfo.getCustomerAdminEmail.and.returnValue('another@nonmatching-email.com');
      this.FeatureToggleService.atlasSetupSiteUserManagementGetStatus.and.returnValue(this.$q.resolve(true));
      initController.apply(this);
      expect(this.controller.isShowUserManagement).toEqual(true);
    });
  });

  describe('upon click of the Validate button in site setup', function () {
    beforeEach(function () {
      initController.apply(this);
      this.controller.isShowUserManagement = false;
    });

    it('should call validateWebexSiteUrl() and if VALID add the site the sitesArray and call analytics appropriately', function () {
      const siteUrl = 'testSiteHere';
      this.controller.siteModel.siteUrl = siteUrl;
      this.controller.siteModel.timezone = 'someTimeZoneHere';
      this.controller.isShowUserManagement = false;
      spyOn(this.controller, 'validateWebexSiteUrl').and.callThrough();
      this.controller.validateMeetingSite();
      this.$scope.$digest();

      expect(this.controller.validateWebexSiteUrl).toHaveBeenCalledWith(siteUrl.concat('.webex.com'));
      const hasAddedSite = _.some(this.controller.sitesArray, { siteUrl: siteUrl });
      expect(hasAddedSite).toBe(true);

      expect(this.Analytics.trackServiceSetupSteps).toHaveBeenCalled();
      expect(this.Analytics.trackServiceSetupSteps.calls.mostRecent().args[0]).toBe('Service Setup: A new site was added');
      expect(this.controller.disableValidateButton).toBe(false);
    });

    it('should call validateWebexSiteUrl() and if INVALID showError to be called and site not to be added', function () {
      this.controller.sitesArray = [];
      this.TrialWebexService.validateSiteUrl.and.returnValue(this.$q.resolve({ isValid: false, errorCode: 'invalidSite' }));
      this.controller.siteModel.siteUrl = 'testSiteHere';
      this.controller.siteModel.timeZone = 'someTimeZoneHere';
      this.controller.validateMeetingSite();
      this.$scope.$apply();

      expect(this.controller.sitesArray.length).toBe(0);
      expect(this.controller.error.isError).toBe(true);
    });

    describe ('when user management is enabled', function()  {
      const siteUrl = 'testSiteHere';
      beforeEach(function () {
        initController.apply(this);
        this.controller.siteModel = {
          siteUrl: siteUrl,
          timezone: 'someTimeZoneHere',
        };
        this.controller.isShowUserManagement = true;
        this.controller.sitesArray = [];
        this.disableValidateButton = true;
        spyOn(this.controller, 'validateWebexSiteUrl').and.callThrough();
      });
      it('site will not validate without type selected', function () {
        this.controller.validateMeetingSite();
        this.$scope.$digest();
        const hasAddedSite = _.some(this.controller.sitesArray, { siteUrl: siteUrl });
        expect(hasAddedSite).toBe(false);
      });
      it('site WILL validate with type selected but NOT set setup type if it\'s not LEGACY', function () {
        this.controller.siteModel.setupType = 'undefined';
        this.controller.validateMeetingSite();
        this.$scope.$digest();
        const addedSite = _.find(this.controller.sitesArray, { siteUrl: siteUrl });
        expect(addedSite).toBeDefined();
        expect(addedSite['setupType']).not.toBeDefined();
      });
      it('site will validate with type selected and set setup type if it IS LEGACY', function () {
        this.controller.siteModel.setupType = this.Config.setupTypes.legacy;
        this.controller.validateMeetingSite();
        this.$scope.$digest();
        const addedSite = _.find(this.controller.sitesArray, { siteUrl: siteUrl });
        expect(addedSite).toBeDefined();
        expect(addedSite['setupType']).toEqual(this.Config.setupTypes.legacy);
      });
    });
  });

  describe('License distribution', function () {
    beforeEach(function () {
      initController.apply(this);
    });
    it('should calculate license quantity for sites correctly', function () {
      initController.apply(this);
      const sitesArray = [
        { quantity: 1, siteUrl: 'site1' },
        { quantity: 5, siteUrl: 'site2' },
      ];
      const distributedLicensesArray = [
        [{ centerType: 'EC', quantity: 3, siteUrl: 'site1' },
        { centerType: 'MC', quantity: 1, siteUrl: 'site1' },
        { centerType: 'TC', quantity: 4, siteUrl: 'site1' }],
        [{ centerType: 'EC', quantity: 1, siteUrl: 'site2' },
        { centerType: 'MC', quantity: 1, siteUrl: 'site2' },
        { centerType: 'TC', quantity: 0, siteUrl: 'site2' }],
      ];
      this.controller.sitesArray = _.clone(sitesArray);
      this.controller.distributedLicensesArray = _.clone(distributedLicensesArray);
      this.controller.updateSitesLicenseCount();
      this.$scope.$apply();

      expect(this.controller.sitesArray[0].quantity).toEqual(8);
      expect(this.controller.sitesArray[1].quantity).toEqual(2);
    });
  });
  describe('when licenses include a TSP Audio package', function () {
    beforeEach(function () {
      spyOn(this.SetupWizardService, 'hasPendingTSPAudioPackage').and.returnValue(true);
      spyOn(this.SetupWizardService, 'getTSPPartners').and.returnValue(this.$q.resolve(['abc', 'def']));
      initController.apply(this);
    });
    it('fetches the TSP partners', function () {
      expect(this.SetupWizardService.getTSPPartners).toHaveBeenCalled();
    });
  });

  describe('when a webex site is being transferred', function () {
    beforeEach(function () {
      initController.apply(this);
      this.controller.showTransferCodeInput = true;
      this.controller.centerDetails = [{ centerType: 'EE' }];
      this.controller.transferSiteUrl = 'mywebexsite';
      this.controller.transferSiteCode = '12345678';
      this.$scope.$apply();
      this.controller.sitesArray = [];
      this.controller.migrateTrialNext();
      this.$scope.$digest();
    });
    it('validates and processes the transfer code', function () {
      expect(this.SetupWizardService.validateTransferCode).toHaveBeenCalledWith({
        siteUrl: 'mywebexsite.webex.com',
        transferCode: '12345678',
        trackingId: undefined,
      });
      expect(this.controller.sitesArray.length).toBe(1);
      expect(this.controller.distributedLicensesArray[0].length).toBe(1);
      expect(this.controller.distributedLicensesArray[0][0].setupType).toBe('TRANSFER');
    });
  });

  describe('when a second transfer code is used', function () {
    _.set(transferCodeResponse, 'data.siteList[0].siteUrl', 'mySecondTransferredsite.webex.com');
    beforeEach(function () {
      this.SetupWizardService.validateTransferCode.and.returnValue(this.$q.resolve(transferCodeResponse));
      initController.apply(this);
      this.controller.showTransferCodeInput = true;
      this.controller.centerDetails = [{ centerType: 'EE' }];
      this.controller.transferSiteUrl = 'mywebexsite';
      this.controller.transferSiteCode = '12345678';
      this.controller.sitesArray = [
        {
          siteUrl: 'myFirstTransferredSite',
          setupType: 'TRANSFER',
        },
        {
          siteUrl: 'myExistingTrialSite',
          setupType: 'TRIALCONVERT',
        },
      ];
      this.$scope.$apply();
      this.controller.migrateTrialNext();
      this.$scope.$digest();
    });
    it('replaces the earlier transferred site with the new one and does not remove trial sites', function () {
      const hasSecondTransferredSite = _.some(this.controller.sitesArray, { siteUrl: 'mySecondTransferredsite' });
      const hasFirstTransferredSite = _.some(this.controller.sitesArray, { siteUrl: 'myFirstTransferredSite' });
      expect(this.controller.sitesArray.length).toBe(2);
      expect(hasSecondTransferredSite).toBe(true);
      expect(hasFirstTransferredSite).toBe(false);
      expect(this.controller.distributedLicensesArray[1][0].siteUrl).toBe('mySecondTransferredsite');
    });
  });

  describe('when pending licenses include CCASP and there are no CCASP active licenses', function () {
    beforeEach(function () {
      initController.apply(this);
      spyOn(this.controller, 'setNextDisableStatus').and.callThrough();
      this.controller.ccasp.partnerNameSelected = 'bob';
      this.controller.ccasp.subscriptionId = '123';
    });
    it('gets the list of ccaspPartners', function () {
      expect(this.SetupWizardService.getCCASPPartners).toHaveBeenCalled();
      expect(this.controller.ccasp.partnerOptions.length).toBe(2);
    });
    it('validates correctly', function () {
      expect(this.controller.audioPartnerName).toBe(null);
      this.controller.ccaspValidate();
      this.$scope.$digest();
      expect(this.controller.audioPartnerName).toBe('bob');
      expect(this.controller.setNextDisableStatus).toHaveBeenCalledWith(false);
      expect(this.controller.ccasp.isError).toEqual(false);
    });
    it('validates incorrectly', function () {
      expect(this.controller.audioPartnerName).toBe(null);
      this.SetupWizardService.validateCCASPPartner.and.returnValue(this.$q.resolve({ isValid: false }));
      this.controller.ccaspValidate();
      this.$scope.$digest();
      expect(this.controller.audioPartnerName).toBe(null);
      expect(this.controller.setNextDisableStatus).toHaveBeenCalledWith(true);
      this.controller.ccasp.isError = true;
    });
  });

  describe('pending when licenses include CCASP and there is a CCASP active license', function () {
    beforeEach(function () {
      const ccaspActivePackcage = {
        licenseId: 'CCASP_8c8098f4-e324-45af-8abc-ff75594090c8_testccanew002-ittest.dmz.webex.com',
        offerName: 'CCASP',
        licenseType: 'AUDIO',
        status: 'ACTIVE',
        ccaspPartnerName: 'West IP Communications',
        ccaspSubscriptionId: 'Sub1154854',
      };
      this.SetupWizardService.getActiveCCASPPackage.and.returnValue(ccaspActivePackcage);
      initController.apply(this);
      spyOn(this.controller, 'setNextDisableStatus').and.callThrough();
    });
    it('should not get the list of ccaspPartners ', function () {
      expect(this.SetupWizardService.getCCASPPartners).not.toHaveBeenCalled();
    });
    it('should populate partner subscription data from active subscription', function () {
      expect(this.controller.audioPartnerName).toEqual('West IP Communications');
      expect(this.controller.ccasp.subscriptionId).toEqual('Sub1154854');
    });
  });

});
