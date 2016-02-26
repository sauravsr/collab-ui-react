'use strict';

describe('Controller: TrialPstnCtrl', function () {
  var controller, trials, $scope, $q, TrialPstnService, PstnSetupService;

  beforeEach(module('core.trial'));
  beforeEach(module('Huron'));
  beforeEach(module('Core'));

  beforeEach(inject(function ($rootScope, _$q_, $controller, _TrialPstnService_, _PstnSetupService_) {
    $scope = $rootScope.$new();

    TrialPstnService = _TrialPstnService_;
    PstnSetupService = _PstnSetupService_;
    $q = _$q_;

    controller = $controller('TrialPstnCtrl', {
      $scope: $scope,
      TrialPstnService: TrialPstnService,
    });

    trials = TrialPstnService.getData();

    $scope.$apply();
  }));

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  describe('Enter info to the controller and expect the same out of the service', function () {
    var carrier = {
      name: 'IntelePeer',
      uuid: '23453-235sdfaf-3245a-asdfa4'
    };
    var numberInfo = {
      state: {
        name: 'Texas',
        abbreviation: 'TX'
      },
      areaCode: {
        code: '469',
        count: 25
      },
      numbers: ["+14696500030", "+14696500102", "+14696500194", "+14696500208", "+14696500220"]
    };
    var contractInfo = {
      companyName: 'Sample Company',
      signeeFirstName: 'Samp',
      signeeLastName: 'Le',
      email: 'sample@snapple.com'
    };

    it('should set the carrier', function () {
      controller.trialData.details.pstnProvider = carrier;
      expect(trials.details.pstnProvider).toBe(carrier);
    });

    it('should set the legal contact information', function () {
      controller.trialData.details.pstnContractInfo = contractInfo;
      expect(trials.details.pstnContractInfo).toBe(contractInfo);
    });

    it('should set number data', function () {
      controller.trialData.details.pstnNumberInfo = numberInfo;
      expect(trials.details.pstnNumberInfo).toBe(numberInfo);
    });

  });
});
