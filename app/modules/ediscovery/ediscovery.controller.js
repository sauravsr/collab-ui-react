(function () {
  'use strict';

  /* @ngInject */
  function EdiscoveryController($timeout, $window, $scope, $translate, $modal, EdiscoveryService) {
    $scope.$on('$viewContentLoaded', function () {
      //setSearchFieldFocus();
      $window.document.title = $translate.instant("ediscovery.browserTabHeaderTitle");
    });
    var vm = this;

    vm.createReport = createReport;
    vm.showSearchHelp = showSearchHelp;

    vm.searchCriteria = {
      "searchString": "36de9c50-8410-11e5-8b9b-9d7d6ad1ac82",
      "startDate": moment()
    };
    vm.reports = [];

    initSearchStatus();

    // Initial testing, just delete all reports and create a new one...
    EdiscoveryService.deleteReports().then(function (res) {
      //console.log("response from delete reports", res);
      return EdiscoveryService.createReport("initialReport");
    }).then(function (res) {
      //console.log("create report response", res)
      return EdiscoveryService.getReport();
    }).then(function (res) {
      //console.log("getReport result ", res)
    }).finally(function (res) {
      pollAvalonReport();
    });

    function getStartDate() {
      return vm.searchCriteria.startDate;
    }

    function setEndDate(endDate) {
      vm.searchCriteria.endDate = endDate;
    }

    $scope.$watch(getStartDate, function (startDate) {
      var endDate = moment(startDate).add(1, 'days');
      setEndDate(endDate);
    });

    function initSearchStatus() {
      vm.searchStatus = {
        string: "36de9c50-8410-11e5-8b9b-9d7d6ad1ac82",
      };
    }

    function downloadReport() {
      //console.log("Download not implemented");
    }

    vm.gridOptions = {
      data: 'ediscoveryCtrl.reports',
      multiSelect: false,
      rowHeight: 40,
      enableRowHeaderSelection: false,
      enableColumnResize: true,
      enableColumnMenus: false,
      enableHorizontalScrollbar: 0,

      columnDefs: [{
        field: 'id',
        displayName: 'Id',
        sortable: false
      }, {
        field: 'displayName',
        displayName: 'Display Name',
        sortable: true
      }, {
        field: 'createdTime',
        displayName: 'Date Generated',
        sortable: true,
      }, {
        field: 'createdByUserId',
        displayName: 'Generated By',
        sortable: true
      }, {
        field: 'state',
        displayName: 'State',
        sortable: true,
      }, {
        field: 'actions',
        displayName: 'Actions',
        sortable: false,
        //cellTemplate: '<span ng-if="row.entity.state === \'COMPLETED\'">' + '<button type="button" class="button btn--primary" ng-click="ediscoveryCtrl.downloadReport()">Download</button>' + '</span>'
        cellTemplate: 'modules/ediscovery/cell-template-action.html'
      }]
    };

    function randomString() {
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      return _.sample(possible, 5).join('');
    }

    function createReport() {
      //console.log("createReport, searchCriteria", vm.searchCriteria)
      initSearchStatus();

      EdiscoveryService.createReport("whatever_" + randomString()).then(function (res) {
        //console.log("create result", res)
      });
      //      EdiscoveryService.createAvalonReport(vm.searchStatus.string).then(function (res) {
      //        //console.log("Response from create report", res);
      //      });
    }

    function pollAvalonReport() {
      EdiscoveryService.roomQuery().then(function (res) {
        //console.log("Response from poll reports", res)
        vm.reports = res;
        $timeout(pollAvalonReport, 2000);
      });
    }

    function setSearchFieldFocus() {
      angular.element('#searchInput').focus();
    }

    function showSearchHelp() {
      var searchHelpUrl = "modules/ediscovery/search-help-dialog.html";
      $modal.open({
        templateUrl: searchHelpUrl
      }).result.finally(function () {
        setSearchFieldFocus();
      });
    }

  }

  angular
    .module('Ediscovery')
    .controller('EdiscoveryController', EdiscoveryController);
}());
