(function () {
  'use strict';

  angular
    .module('Gemini')
    .service('gemService', gemService);

  /* @ngInject */
  function gemService($http, UrlConfig, Authinfo, $translate) {
    var URL = {
      spData: UrlConfig.getGeminiUrl() + 'servicepartner',
      remedyTicket: UrlConfig.getGeminiUrl() + 'remedyTicket/customers/',
    };
    var data = {};
    var service = {
      isAvops: isAvops,
      showError: showError,
      getSpData: getSpData,
      setStorage: setStorage,
      getStorage: getStorage,
      isServicePartner: isServicePartner,
      getCbgRemedyTicket: getCbgRemedyTicket,
    };
    return service;

    function getSpData() {
      return $http.get(URL.spData).then(extractData);
    }

    function getCbgRemedyTicket(customerId) {
      var url = URL.remedyTicket + customerId + '/siteId/0/type/9';
      return $http.get(url).then(extractData);
    }

    function showError(errorCode) {
      var errors = $translate.instant('gemini.errorCode.' + errorCode);
      if (errors === 'gemini.errorCode.' + errorCode) {
        return $translate.instant('gemini.errorCode.genericError');
      }
      return errors;
    }

    function isAvops() {
      return Authinfo.hasRole('Full_Admin');
    }

    function isServicePartner() {
      return Authinfo.hasRole('PARTNER_ADMIN');
    }

    function setStorage(key, val) {
      data[key] = val;
      return data[key];
    }

    function getStorage(key) {
      return data[key];
    }

    function extractData(response) {
      return response.data;
    }
  }
})();
