(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAPhoneMenuCtrl', AAPhoneMenuCtrl);

  function KeyAction() {
    this.key = '';
    this.value = '';
    this.keys = [];
    this.action = {
      name: '',
      label: ''
    };
  }

  /* @ngInject */
  function AAPhoneMenuCtrl($scope, $translate, $filter, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService) {

    var vm = this;
    vm.selectPlaceholder = $translate.instant('autoAttendant.selectPlaceholder');
    vm.actionPlaceholder = $translate.instant('autoAttendant.actionPlaceholder');
    vm.keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];
    vm.selectedActions = [];
    vm.selectedTimeout = {
      name: '',
      value: ''
    };
    vm.menuEntry = {};

    vm.addKeyAction = addKeyAction;
    vm.deleteKeyAction = deleteKeyAction;
    vm.keyChanged = keyChanged;
    vm.keyActionChanged = keyActionChanged;
    vm.timeoutInvalidChanged = timeoutInvalidChanged;
    vm.populateOptionMenu = populateOptionMenu;
    vm.createOptionMenu = createOptionMenu;

    vm.repeatOptions = [{
      label: $translate.instant('autoAttendant.phoneMenuRepeatOnce'),
      name: 'phoneMenuRepeatOnce',
      value: 2
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRepeatTwice'),
      name: 'phoneMenuRepeatTwice',
      value: 3
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRepeatThree'),
      name: 'phoneMenuRepeatThree',
      value: 4
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRepeatFour'),
      name: 'phoneMenuRepeatFour',
      value: 5
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRepeatFive'),
      name: 'phoneMenuRepeatFive',
      value: 6
    }];

    vm.timeoutActions = [{
      label: $translate.instant('autoAttendant.phoneMenuContinue'),
      name: 'phoneMenuContinue',
      action: 'repeatActionsOnInput',
      value: 1
    }, {
      label: $translate.instant('autoAttendant.repeatMenu'),
      name: 'repeatMenu',
      action: 'repeatActionsOnInput',
      value: 2,
      childOptions: vm.repeatOptions
    }];

    // TBD means the action isn't supported in the backend yet
    vm.keyActions = [
      // {
      //   label: $translate.instant('autoAttendant.phoneMenuPlaySubmenu'),
      //   name: 'phoneMenuPlaySubmenu',
      //   action: 'runActionsOnInput',
      //   inputType: 1
      // },
      {
        label: $translate.instant('autoAttendant.phoneMenuRepeatMenu'),
        name: 'phoneMenuRepeatMenu',
        action: 'repeatActionsOnInput'
      }, {
        label: $translate.instant('autoAttendant.phoneMenuDialExt'),
        name: 'phoneMenuDialExt',
        action: 'runActionsOnInput',
        inputType: '2'
      },
      // {
      //   label: $translate.instant('autoAttendant.phoneMenuRouteUser'),
      //   name: 'phoneMenuRouteUser',
      //   action: 'TBD'
      // },
      {
        label: $translate.instant('autoAttendant.phoneMenuRouteHunt'),
        name: 'phoneMenuRouteHunt',
        action: 'routeToHuntGroup'
      },
      // {
      //   label: $translate.instant('autoAttendant.phoneMenuRouteVM'),
      //   name: 'phoneMenuRouteVM',
      //   action: 'TBD'
      // },
      {
        label: $translate.instant('autoAttendant.phoneMenuRouteAA'),
        name: 'phoneMenuRouteAA',
        action: 'goto'
      }
    ];

    // search for a key action by its name
    function findKeyAction(name) {
      for (var i = 0; i < vm.keyActions.length; i++) {
        if (vm.keyActions[i].name === name) {
          return vm.keyActions[i];
        }
      }
    }

    // the user has pressed "Add another input digit" to add a key/action pair
    function addKeyAction() {
      var keyAction = new KeyAction();
      keyAction.keys = getAvailableKeys('');
      vm.selectedActions.push(keyAction);

      // update global UI Model
      var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      var action = AutoAttendantCeMenuModelService.newCeActionEntry('', '');
      menuEntry.addAction(action);
      menuEntry.setType('MENU_OPTION');
      vm.menuEntry.entries.push(menuEntry);
    }

    // the user has pressed the trash can icon for a key/action pair
    function deleteKeyAction(index) {
      vm.selectedActions.splice(index, 1);
      vm.menuEntry.entries.splice(index, 1);
      setAvailableKeys();
    }

    // the user has changed the key for an existing action
    function keyChanged(index, keyValue) {
      vm.selectedActions[index].key = keyValue;
      vm.menuEntry.entries[index].key = keyValue;
      setAvailableKeys();
    }

    // the user has changed the action for an existing key
    function keyActionChanged(index, keyAction) {
      var _keyAction = findKeyAction(keyAction.name);
      if (angular.isDefined(_keyAction)) {
        var phoneMenuEntry = vm.menuEntry.entries[index];
        var action = phoneMenuEntry.actions[0];
        action.name = keyAction.action;
        if (angular.isDefined(keyAction.value)) {
          action.value = keyAction.value;
        }
        delete action.inputType;
        if (angular.isDefined(_keyAction.inputType)) {
          // some action names are overloaded and are distinguished
          // by inputType
          action.inputType = _keyAction.inputType;
        }
      }
    }

    // determine which keys are still available.
    // selectedKey: a key we want to force into the available list. this is
    // needed because when the user is changing a key we want to show the
    // current key as available even though the model thinks it's in use.
    function getAvailableKeys(selectedKey) {
      var keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];
      var availableKeys = [];
      // for each key determine if it's in use by looping over all actions.
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === selectedKey) {
          // force this key to be in the available list
          availableKeys.push(key);
          continue;
        }
        var keyInUse = false;
        for (var j = 0; j < vm.selectedActions.length; j++) {
          var actionKey = vm.selectedActions[j].key;
          if (key === actionKey) {
            keyInUse = true;
            break;
          }
        }
        if (!keyInUse) {
          // key is not in use to add to the available list
          availableKeys.push(key);
        }
      }

      return availableKeys;
    }

    // update the list of available keys for each action
    function setAvailableKeys() {
      for (var x = 0; x < vm.selectedActions.length; x++) {
        var selectedAction = vm.selectedActions[x];
        selectedAction.keys = getAvailableKeys(selectedAction.key);
      }
    }

    function timeoutInvalidChanged() {
      var entry = vm.menuEntry;
      if (entry.type == "MENU_OPTION") {
        // this is number of times to repeat the timeout/invalid menu
        if (vm.selectedTimeout.value === 1) {
          entry.attempts = vm.selectedTimeout.value;
        } else if (vm.selectedTimeout.value === 2) {
          if (angular.isDefined(vm.selectedTimeout.selectedChild)) {
            entry.attempts = vm.selectedTimeout.selectedChild.value;
          }
        }
      }
    }

    function populateOptionMenu() {
      // populate with data from an existing AA
      var entry = vm.menuEntry;
      if (entry.type == "MENU_OPTION") {
        if (angular.isDefined(entry.attempts)) {
          // both timeout options have the same action name so
          // we distinguish by the number of attempts allowed
          if (entry.attempts === 1) {
            vm.selectedTimeout = angular.copy(vm.timeoutActions[0]);
          } else {
            vm.selectedTimeout = angular.copy(vm.timeoutActions[1]);
            vm.selectedTimeout.childOptions = angular.copy(vm.repeatOptions);
            if (entry.attempts >= 2 && entry.attempts <= 6) {
              vm.selectedTimeout.selectedChild = angular.copy(vm.repeatOptions[entry.attempts - 2]);
            } else {
              // this case should never happens.
              vm.selectedTimeout.selectedChild = angular.copy(vm.repeatOptions[0]);
            }
          }
        }
        var entries = entry.entries;
        if (entries.length > 0) {
          // add the key/action pairs
          for (var j = 0; j < entries.length; j++) {
            var menuEntry = entries[j];
            if (menuEntry.actions.length == 1 && menuEntry.type == "MENU_OPTION") {
              var keyAction = new KeyAction();
              keyAction.key = menuEntry.key;
              if (angular.isDefined(menuEntry.actions[0].name) && menuEntry.actions[0].name.length > 0) {
                keyAction.action = _.find(vm.keyActions, function (keyAction) {
                  return this === keyAction.action;
                }, menuEntry.actions[0].name);
              } else {
                keyAction.action = {};
                keyAction.action.name = "";
                keyAction.action.label = "";
              }
              keyAction.value = menuEntry.actions[0].value;
              vm.selectedActions.push(keyAction);
            }
          }
        }
        // remove keys that are in use from the selection widget
        setAvailableKeys();
      }
    }

    function createOptionMenu() {
      // we're adding a new AA so create the CeMenu
      var menu = AutoAttendantCeMenuModelService.newCeMenu();
      menu.type = 'MENU_OPTION';
      vm.entries[$scope.index] = menu;

      var keyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      keyEntry.type = "MENU_OPTION";
      var emptyAction = AutoAttendantCeMenuModelService.newCeActionEntry();
      keyEntry.addAction(emptyAction);
      menu.entries.push(keyEntry);

      menu.attempts = 4;
      vm.selectedTimeout = angular.copy(vm.timeoutActions[0]);
      vm.selectedTimeout.childOptions = angular.copy(vm.repeatOptions);
      vm.selectedTimeout.selectedChild = angular.copy(vm.repeatOptions[2]);
    }

    /////////////////////

    function activate() {
      vm.schedule = $scope.schedule;
      var ui = AAUiModelService.getUiModel();
      vm.uiMenu = ui[vm.schedule];
      vm.entries = vm.uiMenu.entries;
      vm.menuEntry = vm.entries[$scope.index];

      if (vm.menuEntry.type === '') {
        createOptionMenu();
      } else if (vm.menuEntry.type === 'MENU_OPTION') {
        populateOptionMenu();
      }
    }

    activate();
  }
})();
