'use strict';

angular.module('Core')
  .directive('crManageGroups', function () {
    return {
      restrict: 'EA',
      templateUrl: 'modules/core/users/userAdd/manage-groups.html'
    };
  });
