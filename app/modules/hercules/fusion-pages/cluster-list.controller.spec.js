'use strict';

describe('Controller: FusionClusterListController', function () {
  var controller, $controller, $q, $rootScope, Analytics, Authinfo, EnterprisePrivateTrunkService, FusionClusterService, Notification, ResourceGroupService;

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_$rootScope_, _$controller_, _$q_, _Analytics_, _Authinfo_, _EnterprisePrivateTrunkService_, _FusionClusterService_, _Notification_, _ResourceGroupService_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $q = _$q_;
    Analytics = _Analytics_;
    Authinfo = _Authinfo_;
    EnterprisePrivateTrunkService = _EnterprisePrivateTrunkService_;
    FusionClusterService = _FusionClusterService_;
    Notification = _Notification_;
    ResourceGroupService = _ResourceGroupService_;
  }

  function initSpies() {
    spyOn(FusionClusterService, 'getAll');
    spyOn(FusionClusterService, 'getResourceGroups').and.returnValue($q.resolve({
      groups: {},
    }));
    spyOn(EnterprisePrivateTrunkService, 'fetch');
    spyOn(ResourceGroupService, 'getAllowedChannels').and.returnValue($q.resolve(['stable']));
    spyOn(Analytics, 'trackHSNavigation');
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(Authinfo, 'isEntitled').and.returnValue(true);
  }

  function initController(hasEnterprisePrivateTrunkingFeatureToggle) {
    controller = $controller('FusionClusterListController', {
      hasCucmSupportFeatureToggle: true,
      hasEnterprisePrivateTrunkingFeatureToggle: hasEnterprisePrivateTrunkingFeatureToggle,
    });
  }

  describe('init', function () {
    beforeEach(function () {
      FusionClusterService.getAll.and.returnValue($q.resolve());
      initController(false);
    });

    it('should be loading', function () {
      expect(controller.loading).toBe(true);
    });

    it('should have 0 clusters to be displayed', function () {
      expect(controller.displayedGroups).toEqual([]);
    });
  });

  describe('after loading clusters', function () {
    it('should call Notification.errorWithTrackingId if loading failed', function () {
      FusionClusterService.getResourceGroups.and.returnValue($q.reject());
      initController(false);
      expect(controller.loading).toBe(true);
      expect(Notification.errorWithTrackingId).not.toHaveBeenCalled();
      $rootScope.$apply(); // force FusionClusterService.getAll() to return
      expect(controller.loading).toBe(false);
      expect(Notification.errorWithTrackingId).toHaveBeenCalled();
    });

    it('should update filters and displayed clusters', function () {
      FusionClusterService.getResourceGroups.and.returnValue($q.resolve({ unassigned: [{
        targetType: 'c_mgmt',
        connectors: [{
          alarms: [],
          connectorType: 'c_mgmt',
          runningState: 'running',
          hostname: 'a.elg.no',
        }],
      }, {
        targetType: 'mf_mgmt',
        connectors: [{
          alarms: [],
          connectorType: 'mf_mgmt',
          runningState: 'running',
          hostname: 'a.elg.no',
        }],
      }, {
        targetType: 'cs_mgmt',
        connectors: [{
          alarms: [],
          connectorType: 'cs_mgmt',
          runningState: 'running',
          hostname: 'a.elg.no',
        }],
      }, {
        targetType: 'ucm_mgmt',
        connectors: [{
          alarms: [],
          connectorType: 'ucm_mgmt',
          runningState: 'running',
          hostname: 'a.elg.no',
        }],
      }] }));
      initController(false);
      expect(controller.filters[0].count).toBe(0);
      expect(controller.filters[1].count).toBe(0);
      expect(controller.filters[2].count).toBe(0);
      expect(controller.filters[3].count).toBe(0);
      expect(controller.filters[4].count).toBe(0);
      expect(controller.displayedGroups.length).toBe(0);
      $rootScope.$apply(); // force FusionClusterService.getAll() to return

      expect(controller.filters[0].count).toBe(1);
      expect(controller.filters[1].count).toBe(1);
      expect(controller.filters[2].count).toBe(0);
      expect(controller.filters[3].count).toBe(1);
      expect(controller.filters[4].count).toBe(1);
      expect(controller.displayedGroups.length).toBe(6);
    });

  });

  describe('Private Trunking ', function () {

    beforeEach(function () {
      EnterprisePrivateTrunkService.fetch.and.returnValue($q.resolve([
        {
          uuid: 'b01dface',
          name: 'To fulle menn',
          serviceStatus: 'unknown',
        },
        {
          uuid: 'f005ba11',
          name: 'Aldri stol på en fyllik',
          serviceStatus: 'outage',
        },
        {
          uuid: 'deadbea7',
          name: 'Skinnet bedrar',
          serviceStatus: 'operational',
        },
        {
          uuid: 'ba5eba11',
          name: 'Ingen har skylda',
          serviceStatus: 'impaired',
        },
      ]));
    });

    it('should format data from EnterprisePrivateTrunkService so that it is on the FMS cluster format', function () {

      initController(true);
      controller._loadSipDestinations();
      $rootScope.$apply();
      expect(controller.displayedGroups[5].unassigned).toEqual(jasmine.objectContaining([
        {
          name: 'To fulle menn',
          id: 'b01dface',
          targetType: 'ept',
          servicesStatuses: [
            {
              serviceId: 'ept',
              state: {
                cssClass: 'warning',
              },
              total: 1,
            },
          ],
        },
        {
          name: 'Aldri stol på en fyllik',
          id: 'f005ba11',
          targetType: 'ept',
          servicesStatuses: [
            {
              serviceId: 'ept',
              state: {
                cssClass: 'danger',
              },
              total: 1,
            },
          ],
        },
        {
          name: 'Skinnet bedrar',
          id: 'deadbea7',
          targetType: 'ept',
          servicesStatuses: [
            {
              serviceId: 'ept',
              state: {
                cssClass: 'success',
              },
              total: 1,
            },
          ],
        },
        {
          name: 'Ingen har skylda',
          id: 'ba5eba11',
          targetType: 'ept',
          servicesStatuses: [
            {
              serviceId: 'ept',
              state: {
                cssClass: 'warning',
              },
              total: 1,
            },
          ],
        },
      ]));

    });

    it('should not get private trunk data if you are not feature toggled', function () {

      initController(false);
      controller._loadSipDestinations();
      $rootScope.$apply();
      expect(EnterprisePrivateTrunkService.fetch).not.toHaveBeenCalled();

    });

  });

});
