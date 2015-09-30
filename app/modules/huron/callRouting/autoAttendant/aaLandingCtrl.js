(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AALandingCtrl', AALandingCtrl);

  /* @ngInject */
  function AALandingCtrl($q, $translate, AutoAttendantCeService, AutoAttendantCeInfoModelService,
    AutoAttendantCeMenuModelService, AAModelService, Notification, DirectoryNumberService, Authinfo) {
    var vm = this;
    vm.aaModel = {};
    vm.deleteAA = deleteAA;
    vm.selectAA = selectAA;
    vm.listAutoAttendants = listAutoAttendants;

    /////////////////////

    function deleteAA(ceInfo) {
      // UI update
      var i;
      for (i = 0; i < vm.aaModel.ceInfos.length; i++) {
        if (vm.aaModel.ceInfos[i].getName() === ceInfo.getName()) {
          vm.aaModel.ceInfos.splice(i, 1);
          break;
        }
      }

      AutoAttendantCeService.deleteCe(ceInfo.getCeUrl()).then(
        function (data) {
          AutoAttendantCeInfoModelService.deleteCeInfo(vm.aaModel.aaRecords, ceInfo);
          Notification.success('autoAttendant.successDeleteCe', {
            name: ceInfo.getName()
          });
        },
        function (response) {
          listAutoAttendants();
          Notification.error('autoAttendant.errorDeleteCe', {
            name: ceInfo.getName(),
            statusText: response.statusText,
            status: response.status
          });
        }
      );

    }

    /*
     * Store current ceInfo in aaModel so ceInfo.getName() can be read to define
     * the state in autoAttendantMain.tpl.html.
     */
    function selectAA(aaName) {
      vm.aaModel.aaName = aaName;
      if (aaName === '') {
        vm.aaModel.aaRecord = AAModelService.newAARecord();
      } else {
        for (var i = 0; i < vm.aaModel.aaRecords.length; i++) {
          if (vm.aaModel.aaRecords[i].callExperienceName === aaName) {
            vm.aaModel.aaRecord = angular.copy(vm.aaModel.aaRecords[i]);
            break;
          }
        }
      }
    }

    function setDirectoryNumber(resource) {
      resource.number = resource.id;
      /* workaround for Tropo-AA integraiton
      return DirectoryNumberService.get({
        customerId: Authinfo.getOrgId(),
        directoryNumberId: resource.id
      }).$promise.then(function (data) {
        resource.number = data.pattern;
      });
      */
    }

    function listAutoAttendants() {
      vm.aaModel.dataReadyPromise = AutoAttendantCeService.listCes();
      vm.aaModel.dataReadyPromise.then(
        function (data) {
          // read successfully
          vm.aaModel.aaRecords = data;
          // Workaround: for reading the dn number: by using CMI API, until
          // dn number is officialy stored in ceDefintion.
          var promises = [];
          for (var i = 0; i < vm.aaModel.aaRecords.length; i++) {
            var resources = vm.aaModel.aaRecords[i].assignedResources;
            for (var j = 0; j < resources.length; j++) {
              promises[promises.length] = setDirectoryNumber(resources[j]);
              // For testapp:
              // resources[j].setNumber(SystemService.getResourceValue(resources[j].getId()));
            }
          }
          $q.all(promises).then(
            function (result) {
              vm.aaModel.ceInfos = AutoAttendantCeInfoModelService.getAllCeInfos(vm.aaModel.aaRecords);
              vm.aaModel.ceInfos.sort(function (a, b) {
                return a.name.localeCompare(b.name);
              });
            }
          );
        },
        function (response) {
          if (response.status != 404) {
            Notification.error('autoAttendant.errorListCes', {
              statusText: response.statusText,
              status: response.status
            });
          }
        }
      );
    }

    function activate() {
      vm.aaModel = AAModelService.newAAModel();
      AAModelService.setAAModel(vm.aaModel);
      vm.aaModel.ceInfos = [];
      listAutoAttendants();
    }

    activate();
  }
})();
