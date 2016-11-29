'use strict';

describe('Directive: csvDownload', function () {
  var $compile, $rootScope, $scope, $timeout, $httpBackend, CsvDownloadService, FeatureToggleService, $q, $window;

  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(function (_FeatureToggleService_, _$q_, _$compile_, _$rootScope_, _$timeout_, _$window_) {
    FeatureToggleService = _FeatureToggleService_;
    $compile = _$compile_;
    $timeout = _$timeout_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    $window = _$window_;
    $scope = $rootScope.$new();
    spyOn(FeatureToggleService, 'atlasNewUserExportGetStatus').and.returnValue($q.when(false));
  }));

  describe("Controller", function () {

    this.element = null;

    it('should register for event handlers on creation', function () {

      var listeners = $rootScope.$$listeners;

      // initially, these event listeners don't exist
      expect(_.has(listeners, 'csv-download-begin')).toBeFalsy();
      expect(_.has(listeners, 'csv-download-end')).toBeFalsy();
      expect(_.has(listeners, 'csv-download-request')).toBeFalsy();

      var pscope = $scope.$new();
      this.element = $compile('<csv-download type="any"></csv-download>')(pscope);
      $scope.$digest();
      this.elemScope = this.element.isolateScope();

      // make sure we have event handlers registered
      expect(_.isFunction(listeners['csv-download-begin'][0])).toBeTruthy();
      expect(_.isFunction(listeners['csv-download-end'][0])).toBeTruthy();
      expect(_.isFunction(listeners['csv-download-request'][0])).toBeTruthy();

      $scope.$destroy();

      // the event handlers that were registered are now null, but the entries in the listeners array is still there
      expect(_.isFunction(listeners['csv-download-begin'][0])).toBeFalsy();
      expect(_.isFunction(listeners['csv-download-end'][0])).toBeFalsy();
      expect(_.isFunction(listeners['csv-download-request'][0])).toBeFalsy();
    });

  });

  describe("Browser: Firefox, Chrome, and cross-browser tests", function () {

    beforeEach(inject(function (_$httpBackend_) {
      $httpBackend = _$httpBackend_;
      $httpBackend.when('GET', 'https://atlas-integration.wbx2.com/admin/api/v1/csv/organizations/null/users/template').respond({});
      $window.navigator.msSaveOrOpenBlob = undefined;
    }));

    it('should replace the element with the appropriate content', function () {
      var element = $compile('<csv-download type="template" filename="template.csv"></csv-download>')($scope);
      $scope.$digest();

      var isolated = element.isolateScope();
      expect(isolated.downloading).toBeFalsy();
      expect(isolated.downloadingMessage).toBe('');
      expect(element.html()).toContain("csv-download");
      expect(element.html()).toContain("icon-circle-download");
    });

    it('should replace the icon when attribute icon is present', function () {
      var element = $compile('<csv-download type="template" filename="template.csv" icon="abc-icon"></csv-download>')($scope);
      $scope.$digest();

      expect(element.html()).toContain("abc-icon");
    });

    it('should remove the icon class icon-circle-download when no-icon is present', function () {
      var element = $compile('<csv-download type="any" filename="some.csv" no-icon></csv-download>')($scope);
      $scope.$digest();

      expect(element.html()).not.toContain("icon-circle-download");
    });

    it('should download template by clicking the anchor', function () {
      var element = $compile('<csv-download type="template" filename="template.csv"></csv-download>')($scope);
      $scope.$digest();

      var downloadAnchor = element.find('a');
      downloadAnchor[0].click();

      var isolated = element.isolateScope();
      expect(isolated.downloading).toBeTruthy();
      expect(isolated.downloadingMessage).toContain('csvDownload.inProgress');

      // start download
      $timeout.flush(300);
      expect(downloadAnchor.attr('disabled')).toBe('disabled');
      $httpBackend.flush();

      // finish download - changeAnchorAttrToDownloadState
      $timeout.flush(300);
      expect(downloadAnchor.attr('href')).toContain('blob');
      expect(downloadAnchor.attr('download')).toBe('template.csv');
      expect(downloadAnchor.attr('disabled')).toBe(undefined);

      // finish download - click
      $timeout.flush(300);
      expect(isolated.downloading).toBeFalsy();
    });

    it('should contain tooltip for download type=user', function () {
      var element = $compile('<csv-download type="user" filename="exported_users.csv"></csv-download>')($scope);
      $scope.$digest();

      expect(element.html()).toContain("usersPage.csvBtnTitle");
    });
  });

  describe('Browser: IE only behavior', function () {
    beforeEach(inject(function (_CsvDownloadService_) {
      CsvDownloadService = _CsvDownloadService_;
      $window.navigator.msSaveOrOpenBlob = jasmine.createSpy('msSaveOrOpenBlob').and.callFake(function () { });

      spyOn(CsvDownloadService, 'getCsv').and.returnValue($q.when('blob'));
      spyOn(CsvDownloadService, 'openInIE').and.callFake(function () { });
      spyOn(CsvDownloadService, 'revokeObjectUrl').and.callFake(function () { });
    }));

    it('should download template by clicking the anchor', function () {
      var element = $compile('<csv-download type="template" filename="template.csv"></csv-download>')($scope);
      $scope.$digest();

      var downloadAnchor = element.find('a');
      downloadAnchor[0].click();
      var isolated = element.isolateScope();
      expect(isolated.downloading).toBeTruthy();
      expect(isolated.downloadingMessage).toContain('csvDownload.inProgress');

      // start download
      $timeout.flush(300);

      // changeAnchorAttrToDownloadState
      $timeout.flush(300);
      expect(downloadAnchor.attr('href')).toEqual('');
      expect(downloadAnchor.attr('download')).toBe(undefined);
      expect(downloadAnchor.attr('disabled')).toBe(undefined);

      // finish download
      $timeout.flush(300);
      expect(isolated.downloading).toBeFalsy();

      isolated.downloadCsv();
      expect(CsvDownloadService.openInIE).toHaveBeenCalled();
    });
  });
});
