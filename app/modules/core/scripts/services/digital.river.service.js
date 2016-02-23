(function () {
  'use strict';

  angular
    .module('Core')
    .service('DigitalRiverService', DigitalRiverService);

  /* @ngInject */
  function DigitalRiverService($http, Config, Auth, $q) {

    var service = {
      getUserFromEmail: getUserFromEmail,
      addDrUser: addDrUser,
      getDrReferrer: getDrReferrer,
      getUserAuthToken: getUserAuthToken,
      activateUser: activateUser,
      activateProduct: activateProduct
    };

    return service;

    function getUserFromEmail(email) {
      return Auth.setAccessToken().then(function () {
        return $http.get(Config.getAdminServiceUrl() + 'ordertranslator/digitalriver/user/' + email + '/exists');
      });
    }

    function addDrUser(emailPassword) {
      return Auth.setAccessToken().then(function () {
        return $http.post(Config.getAdminServiceUrl() + 'ordertranslator/digitalriver/user', emailPassword);
      });
    }

    function getUserAuthToken(userid) {
      return Auth.setAccessToken().then(function () {
        return $http.get(Config.getAdminServiceUrl() + "ordertranslator/digitalriver/authtoken/" + userid);
      });
    }

    function activateUser(uuid) {
      if (!uuid) {
        return $q.reject('blank uuid');
      }
      return Auth.setAccessToken().then(function () {
        return $http.patch(Config.getAdminServiceUrl() + 'ordertranslator/online/accountstatus/' + uuid + '?accountStatus=active');
      });
    }

    function activateProduct(oid) {
      if (!oid) {
        return $q.reject('blank oid');
      }
      return Auth.setAccessToken().then(function () {
        return $http.post(Config.getAdminServiceUrl() + 'ordertranslator/api/digitalriver/activate/' + oid);
      });
    }

    // TODO: Remove this after the go-live.
    function getDrReferrer() {
      return 'digitalriver-ZGlnaXRhbHJpdmVy';
    }

  }
})();
