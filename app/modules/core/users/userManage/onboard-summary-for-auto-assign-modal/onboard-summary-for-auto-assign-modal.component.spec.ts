import moduleName from './index';
import { OnboardSummaryForAutoAssignModalController } from './onboard-summary-for-auto-assign-modal.component';
import { MultiStepModalComponent } from 'modules/core/shared/multi-step-modal/multi-step-modal.component';
import { LicenseSummaryComponent } from 'modules/core/users/userManage/shared/license-summary/license-summary.component';

type Test = atlas.test.IComponentTest<OnboardSummaryForAutoAssignModalController, {
  $q;
  $scope;
  $state;
  Analytics;
  Notification;
  OnboardService;
}, {
  components: {
    multiStepModal: atlas.test.IComponentSpy<MultiStepModalComponent>;
    licenseSummary: atlas.test.IComponentSpy<LicenseSummaryComponent>;
  },
}>;

describe('Component: onboardSummaryForAutoAssignModal:', () => {
  beforeEach(function (this: Test) {
    this.components = {
      multiStepModal: this.spyOnComponent('multiStepModal'),
      licenseSummary: this.spyOnComponent('licenseSummary'),
    };
    this.initModules(
      moduleName,
      this.components.multiStepModal,
      this.components.licenseSummary,
    );
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      'Analytics',
      'Notification',
      'OnboardService',
    );
    this.$scope.fakeStateData = {};
    this.$scope.fakeUserList = [];
  });

  function initComponent(this: Test) {
    this.compileComponent('onboardSummaryForAutoAssignModal', {
      stateData: 'fakeStateData',
      userList: 'fakeUserList',
    });
  }

  describe('initial state:', () => {
    it('should have a title', function (this: Test) {
      initComponent.call(this);
      expect(this.components.multiStepModal.bindings[0].l10nTitle).toBe('onboardSummaryForAutoAssignModal.title');
    });

    it('should provide back, save, and dismiss functionality', function (this: Test) {
      initComponent.call(this);
      spyOn(this.controller, 'dismissModal');
      this.components.multiStepModal.bindings[0].dismiss();
      expect(this.controller.dismissModal).toHaveBeenCalled();

      spyOn(this.controller, 'back');
      this.components.multiStepModal.bindings[0].back();
      expect(this.controller.back).toHaveBeenCalled();

      spyOn(this.controller, 'save');
      this.components.multiStepModal.bindings[0].save();
      expect(this.controller.save).toHaveBeenCalled();
    });

    it('should pass along its "stateData" to its "license-summary"', function (this: Test) {
      this.$scope.fakeStateData = 'fake-stateData';
      initComponent.call(this);
      expect(this.components.licenseSummary.bindings[0].stateData).toBe('fake-stateData');
    });
  });

  describe('primary behaviors (controller):', () => {
    describe('dismissModal():', () => {
      it('should track the event', function (this: Test) {
        spyOn(this.Analytics, 'trackAddUsers');
        initComponent.call(this);
        this.controller.dismissModal();
        expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.CANCEL_MODAL);
      });
    });

    describe('back():', () => {
      it('should go back to "users.add.manual" state passing along its "stateData"', function (this: Test) {
        this.$scope.fakeStateData = 'fake-stateData';
        spyOn(this.$state, 'go');
        initComponent.call(this);
        this.controller.back();
        expect(this.$state.go).toHaveBeenCalledWith('users.add.manual', {
          stateData: 'fake-stateData',
        });
      });
    });

    describe('save():', () => {
      it('should make an onboard API call passing its user list with empty lists for both entitlements and licenses', function (this: Test) {
        this.$scope.fakeUserList = ['fake-user-1'];
        spyOn(this.OnboardService, 'onboardUsersInChunks').and.returnValue(this.$q.resolve('fake-aggregateResult'));
        spyOn(this.$state, 'go');
        initComponent.call(this);
        this.controller.save();
        this.$scope.$apply();
        expect(this.OnboardService.onboardUsersInChunks).toHaveBeenCalledWith(['fake-user-1'], [], []);
        expect(this.$state.go).toHaveBeenCalledWith('users.add.results', 'fake-aggregateResult');
      });

      it('should notify and reject if onboard API call rejects', function (this: Test) {
        this.$scope.fakeUserList = ['fake-user-1'];
        spyOn(this.OnboardService, 'onboardUsersInChunks').and.returnValue(this.$q.reject('fake-reject-response'));
        spyOn(this.Notification, 'errorResponse');
        initComponent.call(this);
        this.controller.save();
        this.$scope.$apply();
        expect(this.Notification.errorResponse).toHaveBeenCalledWith('fake-reject-response');
      });
    });
  });
});
