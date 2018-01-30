'use strict';

describe('Care Feature Ctrl should', function () {
  var controller, $controller, $filter, $q, $rootScope, $state, $scope, Authinfo, CareFeatureList, CvaService, EvaService, getAADeferred,
    Log, Notification, deferred, callbackDeferred, chatPlusCallbackDeferred, cvaDeferred, evaDeferred, evaSpacesDeferred, $translate, SparkService, getPersonDeferred, FeatureToggleService, AutoAttendantCeInfoModelService;

  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('Test-Org-Id'),
    isMessageEntitled: jasmine.createSpy('isMessageEntitled').and.returnValue(true),
    isSquaredUC: jasmine.createSpy('isSquaredUC').and.returnValue(true),
    getUserName: jasmine.createSpy('getUserName').and.returnValue('some_user'),
  };

  var listOfAAs = getJSONFixture('huron/json/autoAttendant/aaList.json');
  var templateList = getJSONFixture('sunlight/json/features/chatTemplates/chatTemplateList.json');
  var emptyListOfAAs = [];
  var emptyListOfCTs = [];
  var justOneChatTemplate = templateList[0];

  var getTemplatesSuccess = function (mediaType, data) {
    return _.filter(data, function (template) {
      return template.mediaType === mediaType;
    });
  };

  var getAAListSuccessResp = function (data) {
    return data;
  };

  var myPersonId = 'my_person_id';
  var ownerDetails = { id: 'some_owner', displayName: 'Some Owner' };
  var emptyCeInfosList = function () {
    return {
      items: [],
    };
  };

  var listCVAsSuccess = function () {
    return {
      items: [
        {
          id: 'Customer Virtual Assistant Dev Config',
          type: 'APIAI',
          config: { token: '22e724e0bc604e99b0cfd281cd6c282a' },
        },
        {
          id: 'Customer Virtual Assistant PR Config',
          type: 'APIAI',
          config: { token: '22e724e0bc604e99b0cfd281cd6c282a' },
        },
        {
          id: 'CVA ID 3',
          name: 'Customer Virtual Assistant Staging Config',
          type: 'APIAI',
          config: { token: '22e724e0bc604e99b0cfd281cd6c282a' },
        },
      ],
    };
  };
  var ceInfosList = function () {
    return {
      items: [
        {
          cardName: 'Main AA',
          numbers: ['1111'],
          id: 'c16a6027-caef-4429-b3af-9d61ddc71111',
          featureName: 'huronFeatureDetails.aa',
          filterValue: 'AA',
        }, {
          cardName: 'Second AA',
          numbers: ['2222'],
          id: 'c16a6027-caef-4429-b3af-9d61ddc72222',
          featureName: 'huronFeatureDetails.aa',
          filterValue: 'AA',
          hasReferences: true,
          referenceNames: ['Main AA'],
        }, {
          cardName: 'Third  AA',
          numbers: ['3333'],
          id: 'c16a6027-caef-4429-b3af-9d61ddc73333',
          featureName: 'huronFeatureDetails.aa',
          filterValue: 'AA',
        },
      ],
    };
  };
  var listEVAsSuccess = function () {
    return {
      items: [
        {
          id: 'Expert Virtual Assistant Dev Config',
          email: 'test1@cisco.com',
        },
        {
          id: 'Expert Virtual Assistant PR Config',
          email: 'test2@cisco.com',
        },
        {
          id: 'SomeId',
          name: 'Expert Virtual Assistant Staging Config',
          email: 'test3@cisco.com',
        },
        {
          id: 'DifferentOwnerId',
          name: 'Expert Virtual Assistant Different Owner Config',
          email: 'test4@cisco.com',
          ownerId: 'some_owner',
        },
      ],
    };
  };

  var listEvaSpacesSuccess = function () {
    return {
      items: [
        {
          default: true,
          id: 'evaSpace1',
          title: 'Finance',
        },
        {
          id: 'evaSpace2',
          title: 'Accounting',
        },
      ],
    };
  };

  var getTemplateFailure = function () {
    return {
      data: 'Internal Server Error',
      status: 500,
      statusText: 'Internal Server Error',
    };
  };

  var $event = {
    preventDefault: function () {},
    stopImmediatePropagation: function () {},
  };

  var AAs = [{
    cardName: 'Main AA',
    numbers: ['1111'],
    id: 'c16a6027-caef-4429-b3af-9d61ddc71111',
    featureName: 'huronFeatureDetails.aa',
    filterValue: 'AA',
    hasDepends: false,
    hasReferences: true,
    referenceName: ['Fourth AA'],
  }, {
    cardName: 'Second AA',
    numbers: ['2222'],
    id: 'c16a6027-caef-4429-b3af-9d61ddc72222',
    featureName: 'huronFeatureDetails.aa',
    filterValue: 'AA',
    hasDepends: false,
    hasReferences: false,
    dependsNames: [],
    referenceNames: [],
  }, {
    cardName: 'Third  AA',
    numbers: ['3333'],
    id: 'c16a6027-caef-4429-b3af-9d61ddc73333',
    featureName: 'huronFeatureDetails.aa',
    filterValue: 'AA',
    hasDepends: false,
    hasReferences: false,
  }, {
    cardName: 'Fourth AA',
    dependsNames: ['Main AA'],
    featureName: 'huronFeatureDetails.aa',
    filterValue: 'AA',
    hasDepends: true,
    hasReferences: false,
    id: '818cbed6-43c3-40bb-932f-4e2802adf6a8',
    numbers: [],
    referenceNames: []
  }];

  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$filter_, _$state_, _$q_, _Authinfo_, _CareFeatureList_, _Notification_, _Log_, _$translate_, _CvaService_, _EvaService_, _SparkService_, _AutoAttendantCeInfoModelService_, _FeatureToggleService_) {
    $rootScope = _$rootScope_;
    $filter = _$filter_;
    $controller = _$controller_;
    $q = _$q_;
    $state = _$state_;
    $scope = _$rootScope_.$new();
    Authinfo = _Authinfo_;
    $translate = _$translate_;
    CareFeatureList = _CareFeatureList_;
    CvaService = _CvaService_;
    EvaService = _EvaService_;
    Log = _Log_;
    Notification = _Notification_;
    SparkService = _SparkService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    FeatureToggleService = _FeatureToggleService_;

    //create mock deferred object which will be used to return promises
    deferred = $q.defer();
    callbackDeferred = $q.defer();
    chatPlusCallbackDeferred = $q.defer();
    cvaDeferred = $q.defer();
    evaDeferred = $q.defer();
    getPersonDeferred = $q.defer();
    evaSpacesDeferred = $q.defer();
    getAADeferred = $q.defer();
    getPersonDeferred = $q.defer();
    spyOn(AutoAttendantCeInfoModelService, 'getCeInfosList').and.returnValue(getAADeferred.promise);
    spyOn(CareFeatureList, 'getChatTemplates').and.returnValue(deferred.promise);
    spyOn(CareFeatureList, 'getCallbackTemplates').and.returnValue(callbackDeferred.promise);
    spyOn(CareFeatureList, 'getChatPlusCallbackTemplates').and.returnValue(chatPlusCallbackDeferred.promise);
    spyOn(CvaService.featureList, 'getFeature').and.returnValue(cvaDeferred.promise);
    spyOn(EvaService.featureList, 'getFeature').and.returnValue(evaDeferred.promise);
    spyOn(EvaService, 'getExpertAssistantSpaces').and.returnValue(evaSpacesDeferred.promise);
    spyOn($translate, 'instant').and.returnValue('messageKey');
    spyOn($state, 'go');
    spyOn(SparkService, 'getPerson').and.returnValue(getPersonDeferred.promise);
    spyOn(SparkService, 'getMyPersonId').and.returnValue(myPersonId);

    // Turned on customer virtual assistant enabled flag
    $state.isVirtualAssistantEnabled = true;
    // Turned on expert virtual assistant enabled flag
    $state.isExpertVirtualAssistantEnabled = true;
  }));

  var getAllTemplatesDeferred = function () {
    deferred.resolve(getTemplatesSuccess('chat', templateList));
    callbackDeferred.resolve(getTemplatesSuccess('callback', templateList));
    chatPlusCallbackDeferred.resolve(getTemplatesSuccess('chatPlusCallback', templateList));
    cvaDeferred.resolve(listCVAsSuccess());
    evaDeferred.resolve(listEVAsSuccess());
    getPersonDeferred.resolve(ownerDetails);
  };

  describe('Feature Toogle for Hybrid is disabled', function () {
    beforeEach(function () {
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(false));
      controller = $controller('CareFeaturesCtrl', {
        $scope: $scope,
        $state: $state,
        $filter: $filter,
        Authinfo: Authinfo,
        CareFeatureList: CareFeatureList,
        Log: Log,
        Notification: Notification,
        $translate: $translate,
        CvaService: CvaService,
        EvaService: EvaService,
        SparkService: SparkService,
        AutoAttendantCeInfoModelService: AutoAttendantCeInfoModelService,
      });
      $scope.$apply();
    });

    it('initialize and get the list of templates and update pageState ', function () {
      expect(controller.pageState).toEqual('Loading');
      getAllTemplatesDeferred();
      evaSpacesDeferred.resolve(listEvaSpacesSuccess());
      $scope.$apply();
      expect(controller.pageState).toEqual('ShowFeatures');
    });

    it('initialize and populate template counts under customerVirtualAssistant feature', function () {
      expect(controller.pageState).toEqual('Loading');
      getAllTemplatesDeferred();
      evaSpacesDeferred.resolve(listEvaSpacesSuccess());
      $scope.$apply();
      expect(controller.pageState).toEqual('ShowFeatures');

      var cvaFeature = _.find(controller.filteredListOfFeatures, function (feature) {
        return feature.templateId === 'CVA ID 3';
      });

      expect(cvaFeature.templates.length).toEqual(1);
      expect(cvaFeature.templatesHtmlPopover).toContain('Sunlight Staging Template');

      var cvaFeature2 = _.find(controller.filteredListOfFeatures, function (feature) {
        return feature.templateId === 'Customer Virtual Assistant PR Config';
      });

      expect(cvaFeature2.templates.length).toEqual(0);
    });

    it('initialize and show error page when get templates fails ', function () {
      expect(controller.pageState).toEqual('Loading');
      deferred.reject(getTemplateFailure);
      $scope.$apply();
      expect(controller.pageState).toEqual('Error');
    });

    it('initialize and show New Feature page when templates are empty ', function () {
      expect(controller.pageState).toEqual('Loading');
      deferred.resolve(getTemplatesSuccess('chat', emptyListOfCTs));
      callbackDeferred.resolve(getTemplatesSuccess('callback', emptyListOfCTs));
      chatPlusCallbackDeferred.resolve(getTemplatesSuccess('chatPlusCallback', emptyListOfCTs));
      cvaDeferred.resolve(getTemplatesSuccess('virtualAssistant', emptyListOfCTs));
      evaDeferred.resolve(getTemplatesSuccess('virtualAssistant', emptyListOfCTs));
      $scope.$apply();
      expect(controller.pageState).toEqual('NewFeature');
    });

    it('initalize and populate expert spaces under expertVirtualAssistant feature', function () {
      spyOn(controller, 'generateHtmlPopover').and.returnValue('aHtmlString');
      expect(controller.pageState).toEqual('Loading');
      getAllTemplatesDeferred();
      evaSpacesDeferred.resolve(listEvaSpacesSuccess());
      $scope.$apply();
      expect(controller.pageState).toEqual('ShowFeatures');

      expect(controller.generateHtmlPopover).toHaveBeenCalled();
      var listEvaSpaces = listEvaSpacesSuccess().items;

      var evaFeatures = _.find(controller.features, function (feature) {
        return feature.name === 'expertVirtualAssistant';
      });

      return _.forEach(evaFeatures.data, function (evaFeature) {
        expect(controller.generateHtmlPopover).toHaveBeenCalledWith(evaFeature);
        expect(evaFeature.spaces).toEqual(listEvaSpaces);
        expect(evaFeature.templatesHtmlPopover).toEqual('<div class="feature-card-popover"><h3 class="header">messageKey</h3><h3 class="sub-header">messageKey</h3><ul class="spaces-list"></ul></div>');
        expect(evaFeature.spacesHtmlPopover).toEqual('aHtmlString');
      });
    });

    it('initalize and populate EVA usage data warning under expertVirtualAssistant feature', function () {
      spyOn(controller, 'generateHtmlPopover').and.returnValue('aHtmlString');
      expect(controller.pageState).toEqual('Loading');
      getAllTemplatesDeferred();
      evaSpacesDeferred.reject('evaSpacesError');
      $scope.$apply();
      expect(controller.pageState).toEqual('ShowFeatures');

      expect(controller.generateHtmlPopover).toHaveBeenCalled();

      var evaFeatures = _.find(controller.features, function (feature) {
        return feature.name === 'expertVirtualAssistant';
      });

      return _.forEach(evaFeatures.data, function (evaFeature) {
        expect(controller.generateHtmlPopover).toHaveBeenCalledWith(evaFeature);
        expect(evaFeature.spaces).toEqual([]);
        expect(evaFeature.templatesHtmlPopover).toEqual('<div class="feature-card-popover"><h3 class="header">messageKey</h3><h3 class="sub-header">messageKey</h3><ul class="spaces-list"></ul></div>');
        expect(evaFeature.spacesHtmlPopover).toEqual('aHtmlString');
      });
    });

    it('able to call delete function and in turn the $state service ', function () {
      deferred.resolve(getTemplatesSuccess('chat', templateList));
      callbackDeferred.resolve(getTemplatesSuccess('callback', templateList));
      chatPlusCallbackDeferred.resolve(getTemplatesSuccess('chatPlusCallback', templateList));
      $scope.$apply();
      var featureTobBeDeleted = templateList[0];
      controller.deleteCareFeature(featureTobBeDeleted, $event);
      expect($state.go).toHaveBeenCalledWith('care.Features.DeleteFeature', {
        deleteFeatureName: featureTobBeDeleted.name,
        deleteFeatureId: featureTobBeDeleted.templateId,
        deleteFeatureType: featureTobBeDeleted.featureType,
      });
    });

    it('able to receive the CARE_FEATURE_DELETED event when template gets deleted and template should be deleted from local copy', function () {
      deferred.resolve(getTemplatesSuccess('chat', templateList));
      callbackDeferred.resolve(getTemplatesSuccess('callback', templateList));
      chatPlusCallbackDeferred.resolve(getTemplatesSuccess('chatPlusCallback', templateList));
      $scope.$apply();
      var featureTobBeDeleted = templateList[0];
      controller.deleteCareFeature(featureTobBeDeleted, $event);
      $rootScope.$broadcast('CARE_FEATURE_DELETED', {
        deleteFeatureName: featureTobBeDeleted.name,
        deleteFeatureId: featureTobBeDeleted.templateId,
        deleteFeatureType: featureTobBeDeleted.featureType,
      });
      expect(controller.filteredListOfFeatures).not.toEqual(jasmine.arrayContaining([featureTobBeDeleted]));
    });

    it('able to receive the CARE_FEATURE_DELETED event when template gets deleted and change pageState to NewFeature when no templates to show', function () {
      deferred.resolve(getTemplatesSuccess('chat', [justOneChatTemplate]));
      callbackDeferred.resolve(getTemplatesSuccess('callback', emptyListOfCTs));
      chatPlusCallbackDeferred.resolve(getTemplatesSuccess('chatPlusCallback', emptyListOfCTs));
      $scope.$apply();
      var featureTobBeDeleted = justOneChatTemplate;
      controller.deleteCareFeature(featureTobBeDeleted, $event);
      $rootScope.$broadcast('CARE_FEATURE_DELETED', {
        deleteFeatureName: featureTobBeDeleted.name,
        deleteFeatureId: featureTobBeDeleted.templateId,
        deleteFeatureType: featureTobBeDeleted.featureType,
      });
      expect(controller.filteredListOfFeatures).not.toEqual(jasmine.arrayContaining([featureTobBeDeleted]));
      expect(controller.pageState).toEqual('NewFeature');
    });

    it('should filter a list of Customer Support Templates', function () {
      getAllTemplatesDeferred();
      $scope.$apply();
      controller.setFilter('customerSupport');
      expect(controller.filteredListOfFeatures.length).toEqual(9);
      expect(controller.filteredListOfFeatures[0].name).toEqual('Sunlight Dev Template');
    });

    it('should filter a list of Virtual Assistant templates', function () {
      getAllTemplatesDeferred();
      $scope.$apply();
      controller.setFilter('virtualAssistant');
      expect(controller.filteredListOfFeatures.length).toEqual(7);
      expect(controller.filteredListOfFeatures[0].name).toEqual('Customer Virtual Assistant Dev Config');
      expect(controller.filteredListOfFeatures[1].name).toEqual('Customer Virtual Assistant PR Config');
      expect(controller.filteredListOfFeatures[2].name).toEqual('Customer Virtual Assistant Staging Config');
      expect(controller.filteredListOfFeatures[3].name).toEqual('Expert Virtual Assistant Dev Config');
      expect(controller.filteredListOfFeatures[4].name).toEqual('Expert Virtual Assistant Different Owner Config');
      expect(controller.filteredListOfFeatures[5].name).toEqual('Expert Virtual Assistant PR Config');
      expect(controller.filteredListOfFeatures[6].name).toEqual('Expert Virtual Assistant Staging Config');
    });

    it('should filter all the templates', function () {
      getAllTemplatesDeferred();
      $scope.$apply();
      controller.setFilter('all');
      expect(controller.filteredListOfFeatures.length).toEqual(templateList.length + 7); // plus 7 for Virtual Assistants
    });

    it('should filter the list of templates to zero length', function () {
      getAllTemplatesDeferred();
      $scope.$apply();
      controller.setFilter('XX');
      expect(controller.filteredListOfFeatures.length).toEqual(0);
    });

    it('set the view to searched data and the chat template should come first and then callback template', function () {
      getAllTemplatesDeferred();
      $scope.$apply();
      controller.searchData('Dev');
      expect(controller.filteredListOfFeatures.length).toEqual(5);
      expect(controller.filteredListOfFeatures[0].name).toEqual('Sunlight Dev Template');
      expect(controller.filteredListOfFeatures[1].name).toEqual('Sunlight Callback Dev Template');
      expect(controller.filteredListOfFeatures[2].name).toEqual('Sunlight Chat+Callback Dev Template');
      expect(controller.filteredListOfFeatures[3].name).toEqual('Customer Virtual Assistant Dev Config');
      expect(controller.filteredListOfFeatures[4].name).toEqual('Expert Virtual Assistant Dev Config');
    });

    it('set the view to the searched data which is case insensitive and the chat template should come first and then callback template', function () {
      getAllTemplatesDeferred();
      $scope.$apply();
      controller.searchData('Dev');
      expect(controller.filteredListOfFeatures.length).toEqual(5);
      expect(controller.filteredListOfFeatures[0].name).toEqual('Sunlight Dev Template');
      expect(controller.filteredListOfFeatures[1].name).toEqual('Sunlight Callback Dev Template');
      expect(controller.filteredListOfFeatures[2].name).toEqual('Sunlight Chat+Callback Dev Template');
      expect(controller.filteredListOfFeatures[3].name).toEqual('Customer Virtual Assistant Dev Config');
      expect(controller.filteredListOfFeatures[4].name).toEqual('Expert Virtual Assistant Dev Config');
      controller.searchData('dev');
      expect(controller.filteredListOfFeatures.length).toEqual(5);
      expect(controller.filteredListOfFeatures[0].name).toEqual('Sunlight Dev Template');
      expect(controller.filteredListOfFeatures[1].name).toEqual('Sunlight Callback Dev Template');
      expect(controller.filteredListOfFeatures[2].name).toEqual('Sunlight Chat+Callback Dev Template');
      expect(controller.filteredListOfFeatures[3].name).toEqual('Customer Virtual Assistant Dev Config');
      expect(controller.filteredListOfFeatures[4].name).toEqual('Expert Virtual Assistant Dev Config');
    });

    it('should filter the searched data from the list of Customer Support Templates only', function () {
      getAllTemplatesDeferred();
      $scope.$apply();
      controller.searchData('Dev');
      controller.setFilter('customerSupport');
      expect(controller.filteredListOfFeatures.length).toEqual(3);
      expect(controller.filteredListOfFeatures[0].name).toEqual('Sunlight Dev Template');
    });

    it('should filter the searched data from the list of Virtual Assistant templates only', function () {
      getAllTemplatesDeferred();
      $scope.$apply();
      controller.searchData('Dev');
      controller.setFilter('virtualAssistant');
      expect(controller.filteredListOfFeatures.length).toEqual(2);
      expect(controller.filteredListOfFeatures[0].name).toEqual('Customer Virtual Assistant Dev Config');
      expect(controller.filteredListOfFeatures[1].name).toEqual('Expert Virtual Assistant Dev Config');
    });

    it('should show warning and not allow delete of EVA if user does not have access', function () {
      //If UserAcess returns false then warning is displayed on card and delete button is disabled as user does not have access for these actions.
      getAllTemplatesDeferred();
      $scope.$apply();
      controller.setFilter('virtualAssistant');
      var evaDifferentOwnerFeature = controller.filteredListOfFeatures[4];
      expect(controller.userHasAccess(evaDifferentOwnerFeature)).toEqual(false);
      expect(controller.filteredListOfFeatures[4].name).toEqual('Expert Virtual Assistant Different Owner Config');
    });

    it('spacesInUseText should return the accurate number of expert spaces', function () {
      var evaFeature = {
        id: 'Expert Virtual Assistant Feature',
        email: 'evaTest1@cisco.com',
        spaces: [{ title: 'finance' }, { title: 'management' }, { title: 'accounting' }],
      };

      controller.spacesInUseText(evaFeature);
      expect($translate.instant).toHaveBeenCalledWith('careChatTpl.featureCard.spacesInUseText', {
        numOfSpaces: _.get(evaFeature, 'spaces.length', 0),
      });
    });

    it('spacesInUseText should return the expected EVA usage data warning', function () {
      var evaFeature = {
        id: 'Expert Virtual Assistant Feature',
        email: 'evaTest1@cisco.com',
        spaces: [],
      };

      controller.spacesInUseText(evaFeature);
      expect($translate.instant).toHaveBeenCalledWith('careChatTpl.featureCard.unavailableSpacesInUseText');
    });

    it('generateHtmlPopover should return expected html string with multiple expert spaces', function () {
      var evaFeature = {
        id: 'Expert Virtual Assistant Feature',
        email: 'evaTest1@cisco.com',
        spaces: [{ title: 'finance', default: true }, { title: 'management' }, { title: 'accounting' }],
      };

      var htmlString = controller.generateHtmlPopover(evaFeature);
      expect($translate.instant).toHaveBeenCalledWith('careChatTpl.featureCard.popoverSpacesHeader', {
        numOfSpaces: _.get(evaFeature, 'spaces.length', 0),
      });
      expect($translate.instant).toHaveBeenCalledWith('careChatTpl.featureCard.popoverDefaultSpace');

      var htmlExpected = '<div class="feature-card-popover"><h3 class="sub-header">messageKey</h3><ul class="spaces-list">';
      _.forEach(evaFeature.spaces, function (space) {
        htmlExpected += '<li>' + space.title;
        if (space.default) {
          htmlExpected += ' messageKey';
        }
        htmlExpected += '</li>';
      });
      htmlExpected += '</ul></div>';

      expect(htmlString).toEqual(htmlExpected);
    });

    it('generateHtmlPopover should return expected html string when EVA usage data is unavailable', function () {
      var evaFeature = {
        id: 'Expert Virtual Assistant Feature',
        email: 'evaTest1@cisco.com',
        spaces: [],
      };

      var htmlString = controller.generateHtmlPopover(evaFeature);
      expect($translate.instant).toHaveBeenCalledWith('careChatTpl.featureCard.popoverErrorMessage');
      expect(htmlString).toEqual('<div class="feature-card-popover-error">messageKey</div>');
    });

    it('should not push AutoAttendant feature in feature tab if Hybrid toggle is disabled', function () {
      expect(controller.features.length).toBe(5);
      expect(controller.filters.length).toBe(3);
    });
  });

  describe('Features Controller for AutoAttendant ', function () {
    beforeEach(function () {
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
      controller = $controller('CareFeaturesCtrl', {
        $scope: $scope,
        $state: $state,
        $filter: $filter,
        Authinfo: Authinfo,
        CareFeatureList: CareFeatureList,
        Log: Log,
        Notification: Notification,
        $translate: $translate,
        CvaService: CvaService,
        EvaService: EvaService,
        SparkService: SparkService,
        AutoAttendantCeInfoModelService: AutoAttendantCeInfoModelService,
      });
      $scope.$apply();
    });
    it('should push the AutoAttendant feature in Feature tab if Hybrid Toggle is enabled', function () {
      getAADeferred.resolve(getAAListSuccessResp(emptyListOfAAs));
      $scope.$apply();
      expect(controller.features.length).toBe(6);
      expect(controller.filters.length).toBe(4);
    });

    it('should get list of AAs and if there is any data, should change the pageState to showFeatures', function () {
      expect(controller.pageState).toEqual('Loading');
      getAllTemplatesDeferred();
      evaSpacesDeferred.resolve(listEvaSpacesSuccess());
      getAADeferred.resolve(ceInfosList());
      $scope.$apply();
      expect(controller.pageState).toEqual('ShowFeatures');
    });

    it('should get list of AAs and if data received is empty, should change the pageSate to newFeature', function () {
      expect(controller.pageState).toEqual('Loading');
      getAADeferred.resolve(getAAListSuccessResp(emptyListOfAAs));
      deferred.resolve(getTemplatesSuccess('chat', emptyListOfCTs));
      callbackDeferred.resolve(getTemplatesSuccess('callback', emptyListOfCTs));
      chatPlusCallbackDeferred.resolve(getTemplatesSuccess('chatPlusCallback', emptyListOfCTs));
      cvaDeferred.resolve(getTemplatesSuccess('virtualAssistant', emptyListOfCTs));
      evaDeferred.resolve(getTemplatesSuccess('virtualAssistant', emptyListOfCTs));
      $scope.$apply();
      expect(controller.pageState).toEqual('NewFeature');
    });

    it('should be able call delete an AA function and call the $state service', function () {
      controller.deleteCareFeature(AAs[0], $event);
      expect($state.go).toHaveBeenCalledWith('huronfeatures.deleteFeature', {
        deleteFeatureName: AAs[0].cardName,
        deleteFeatureId: AAs[0].id,
        deleteFeatureType: 'AA',
      });
    });

    it('should be able to edit an AA function ', function () {
      controller.editCareFeature(AAs[0], $event);
      expect($state.go).toHaveBeenCalledWith('huronfeatures.aabuilder', {
        aaName: AAs[0].cardName,
      });
    });

    it('should Not delete an AA with dependencies', function () {
      spyOn(Notification, 'error');
      $scope.$apply();
      controller.filteredListOfFeatures = AAs;
      controller.deleteCareFeature(controller.filteredListOfFeatures[3], $event);
      expect(Notification.error).toHaveBeenCalledWith('huronFeatureDetails.aaDeleteBlocked', jasmine.any(Object));
    });

    it('should receive the HURON_FEATURE_DELETED event when an AA gets deleted with dependencies', function () {
      spyOn(Notification, 'error');
      $scope.$apply();
      controller.filteredListOfFeatures = AAs;
      controller.deleteCareFeature(controller.filteredListOfFeatures[0], $event);
      $rootScope.$broadcast('HURON_FEATURE_DELETED', {
        deleteFeatureName: AAs[0].cardName,
        deleteFeatureId: AAs[0].id,
        deleteFeatureType: 'AA',
      });
    });

    it('should filter a list of AAs', function () {
      deferred.resolve(getTemplatesSuccess('chat', emptyListOfCTs));
      callbackDeferred.resolve(getTemplatesSuccess('callback', emptyListOfCTs));
      chatPlusCallbackDeferred.resolve(getTemplatesSuccess('chatPlusCallback', emptyListOfCTs));
      cvaDeferred.resolve(getTemplatesSuccess('virtualAssistant', emptyListOfCTs));
      evaDeferred.resolve(getTemplatesSuccess('virtualAssistant', emptyListOfCTs));
      getAADeferred.resolve(getAAListSuccessResp(listOfAAs));
      $scope.$apply();
      controller.setFilter('AA');
      expect(controller.filteredListOfFeatures.length).toEqual(3);
      expect(controller.filteredListOfFeatures[0].cardName).toEqual(AAs[0].cardName);
    });

    it('should search list of AAs', function () {
      getAllTemplatesDeferred();
      getAADeferred.resolve(getAAListSuccessResp(listOfAAs));
      $scope.$apply();
      controller.searchData('Third');
      controller.setFilter('all');
      expect(controller.filteredListOfFeatures.length).toEqual(1);
      expect(controller.filteredListOfFeatures[0].cardName).toEqual('Third AA');
    });
  });
});
