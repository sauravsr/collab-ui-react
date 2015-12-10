'use strict';

describe('Service: AAValidationService', function () {
  var Notification, AAModelService, AutoAttendantCeInfoModelService, AAValidationService;

  var rawCeInfo = {
    "callExperienceName": "AAA2",
    "callExperienceURL": "https://ces.hitest.huron-dev.com/api/v1/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/callExperiences/c16a6027-caef-4429-b3af-9d61ddc7964b",
    "assignedResources": [{
      "id": "00097a86-45ef-44a7-aa78-6d32a0ca1d3b",
      "type": "directoryNumber",
      "trigger": "incomingCall"
    }]
  };

  var aaModel = {};
  var data = getJSONFixture('huron/json/autoAttendant/aaPhoneMenuCtrl.json');

  function ce2CeInfo(rawCeInfo) {
    var _ceInfo = AutoAttendantCeInfoModelService.newCeInfo();
    for (var j = 0; j < rawCeInfo.assignedResources.length; j++) {
      var _resource = AutoAttendantCeInfoModelService.newResource();
      _resource.setId(rawCeInfo.assignedResources[j].id);
      _resource.setTrigger(rawCeInfo.assignedResources[j].trigger);
      _resource.setType(rawCeInfo.assignedResources[j].type);
      if (angular.isDefined(rawCeInfo.assignedResources[j].number)) {
        _resource.setNumber(rawCeInfo.assignedResources[j].number);
      }
      _ceInfo.addResource(_resource);
    }
    _ceInfo.setName(rawCeInfo.callExperienceName);
    _ceInfo.setCeUrl(rawCeInfo.callExperienceURL);
    return _ceInfo;
  }

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_Notification_, _AutoAttendantCeInfoModelService_, _AAModelService_, _AAValidationService_) {
    AAModelService = _AAModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AAValidationService = _AAValidationService_;
    Notification = _Notification_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
  }));

  afterEach(function () {

  });

  describe('isNameValidationSuccess', function () {

    beforeEach(function () {
      spyOn(Notification, 'error');
      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
    });

    it('report name validation error for an empty string', function () {
      // when aaModel.aaRecord is defined
      var ceInfo_name = '';
      var uuid = '';
      var valid = AAValidationService.isNameValidationSuccess(ceInfo_name, uuid);

      expect(valid).toEqual(false);
      expect(Notification.error).toHaveBeenCalled();
    });

    it('report name validation error for a string of spaces', function () {
      var ceInfo_name = '   ';
      var uuid = '';
      var valid = AAValidationService.isNameValidationSuccess(ceInfo_name, uuid);

      expect(valid).toEqual(false);
      expect(Notification.error).toHaveBeenCalled();
    });

    it('should report name validation error if new AA name is not unique', function () {
      var ceInfo = ce2CeInfo(rawCeInfo);
      aaModel.ceInfos.push(ceInfo);

      var ceInfo_name = 'AAA2';
      var uuid = 'c16a6027-caef-4429-b3af-9d61ddc7964c';
      var valid = AAValidationService.isNameValidationSuccess(ceInfo_name, uuid);

      expect(valid).toEqual(false);
      expect(Notification.error).toHaveBeenCalled();
    });

    it('should report name validation success if new AA name is unique', function () {
      var ceInfo = ce2CeInfo(rawCeInfo);
      aaModel.ceInfos.push(ceInfo);

      var ceInfo_name = "AAA3";
      var uuid = 'c16a6027-caef-4429-b3af-9d61ddc7964c';
      var valid = AAValidationService.isNameValidationSuccess(ceInfo_name, uuid);

      expect(valid).toEqual(true);
    });
  });

  describe('isPhoneMenuValidationSuccess', function () {
    beforeEach(function () {
      spyOn(Notification, 'error');
      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
    });

    it('report validation success for a normal Route to Auto Attendant configuration', function () {
      var uiCombinedMenu = angular.copy(data.combinedMenu);
      var valid = AAValidationService.isPhoneMenuValidationSuccess(uiCombinedMenu);

      expect(valid).toEqual(true);
      expect(Notification.error).not.toHaveBeenCalled();
    });

    it('report validation error for an empty Route to Auto Attendant target', function () {
      var uiCombinedMenu = angular.copy(data.combinedMenu);
      var uiPhoneMenu = uiCombinedMenu.entries[0];
      var uiKey2 = uiPhoneMenu.entries[1];
      uiKey2.actions[0].value = "";
      var valid = AAValidationService.isPhoneMenuValidationSuccess(uiCombinedMenu);

      expect(valid).toEqual(false);
      expect(Notification.error).toHaveBeenCalled();
    });

    it('should not report validation error for an empty Route to Auto Attendant target if key is not initialized', function () {
      var uiCombinedMenu = angular.copy(data.combinedMenu);
      var uiPhoneMenu = uiCombinedMenu.entries[0];
      var uiKey2 = uiPhoneMenu.entries[1];
      uiKey2.key = "";
      uiKey2.actions[0].value = "";
      var valid = AAValidationService.isPhoneMenuValidationSuccess(uiCombinedMenu);

      expect(valid).toEqual(true);
      expect(Notification.error).not.toHaveBeenCalled();
    });
  });

});
