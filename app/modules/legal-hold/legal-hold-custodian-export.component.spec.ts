import legalHoldModuleName from './index';
import { LegalHoldCustodianExportController } from './legal-hold-custodian-export.component';

import { CrCsvDownloadComponent } from 'modules/core/shared/cr-csv-download/cr-csv-download.component';
import { GetUserBy } from './legal-hold.service';

type Test = atlas.test.IComponentTest<LegalHoldCustodianExportController, {
  $componentController,
  $q;
  $scope;
  Authinfo;
  LegalHoldService;
  ModalService;
  Notification;
},
  {
    components: {
      crCsvDownload: atlas.test.IComponentSpy<CrCsvDownloadComponent>;
    },
  }>;

describe('Component: legalHoldMatterDetail', () => {

  const testMatter = _.cloneDeep(getJSONFixture('core/json/legalHold/matters.json'))[1];
  //const numOfUsers = _.size(testMatter.usersUUIDList);
  //const _testMatterWithUsers = <IMatterJsonDataForDisplay>_.assign({}, testMatter, { numberOfCustodians: numOfUsers, createdByName: 'Jane Doe' });
  //let testMatterWithUsers;
  const userConversionResult = {
    success: 'something',
    error: 'something_else',
  };
  const usersInMatterResult = ['uuid1', 'uuid2'];

  beforeEach(function (this: Test) {
   // testMatterWithUsers = _.clone(_testMatterWithUsers);
    this.components = {
      crCsvDownload: this.spyOnComponent('crCsvDownload'),
    };

    this.initModules(
      legalHoldModuleName,
      this.components.crCsvDownload,
    );
    this.injectDependencies(
      '$componentController',
      '$q',
      '$scope',
      'Authinfo',
      'LegalHoldService',
      'ModalService',
      'Notification',
    );

    installPromiseMatchers();

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('123');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.LegalHoldService, 'convertUsersChunk').and.returnValue(this.$q.resolve(userConversionResult));
    spyOn(this.LegalHoldService, 'listUsersInMatter').and.returnValue(this.$q.resolve(usersInMatterResult));
    this.$scope.orgId = testMatter.orgId;
    this.$scope.matterName = testMatter.matterName;
    this.$scope.caseId = testMatter.caseId;
  });

  function initComponent(this: Test) {
    this.compileComponent('legalHoldCustodianExport', {
      orgId: 'orgId',
      caseId: 'caseId',
      matterName: 'matterName',
    });
  }
  describe('custodian export', () => {
    beforeEach(initComponent);

    it('should have the correct bindings',  function (this: Test) {
      expect(this.controller.caseId).toBe(testMatter.caseId);
      expect(this.controller.orgId).toBe(testMatter.orgId);
      expect(this.controller.matterName).toBe(testMatter.matterName);
    });

    it('should start downlod on click',  function (this: Test) {
      spyOn(this.controller, 'exportCustodians').and.callThrough();
      this.view.find('button.btn--primary')[0].click();
      expect(this.controller.exportCustodians).toHaveBeenCalled();
    });

    it('should export the users and pass the result into cr-csv-download component', function (this: Test) {
      const promise: ng.IPromise<any> = this.controller.exportCustodians();
      this.view.find('button.btn--primary')[0].click();
      expect(promise).toBeResolved();
      expect(this.LegalHoldService.convertUsersChunk).toHaveBeenCalledWith([usersInMatterResult], GetUserBy.ID);
      expect(this.LegalHoldService.listUsersInMatter).toHaveBeenCalledWith(this.controller.orgId, this.controller.caseId);
      expect(this.components.crCsvDownload.bindings[0].csvData).toEqual(['something', 'something_else']);
    });
  });
});
