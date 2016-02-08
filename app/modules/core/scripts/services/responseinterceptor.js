(function () {
  'use strict';

  angular
    .module('Core')
    .factory('ResponseInterceptor', ResponseInterceptor);

  /* @ngInject */
  function ResponseInterceptor($q, Log, Auth) {

    return {
      responseError: function (response) {
        if (is20001Error(response)) {
          Log.info('Refresh access token due to 20001 response.');
          return Auth.refreshAccessTokenAndResendRequest(response);
        }
        if (isHttpAuthError(response)) {
          Log.info('Refresh access token due to HTTP authentication error.');
          return Auth.refreshAccessTokenAndResendRequest(response);
        }
        if (isCIInvalidAccessTokenError(response)) {
          Log.info('Refresh access token due to invalid CI error.');
          return Auth.refreshAccessTokenAndResendRequest(response);
        }

        if (refreshTokenHasExpired(response)) {
          Log.info('Refresh-token has expired.');
          return Auth.logout();
        }

        if (refreshTokenIsInvalid(response)) {
          Log.info('Refresh-token is invalid.');
          return Auth.logout();
        }

        return $q.reject(response);
      }
    };

    function is20001Error(response) {
      return response.status == 401 && responseContains(response, '200001');
    }

    function isHttpAuthError(response) {
      return response.status == 401 && responseContains(response, 'This request requires HTTP authentication');
    }

    function isCIInvalidAccessTokenError(response) {
      return response.status == 400 && responseContains(response, "Invalid access token");
    }

    function refreshTokenHasExpired(response) {
      return response.status == 400 && responseContains(response, "The refresh token provided is expired");
    }

    function refreshTokenIsInvalid(response) {
      return response.status == 400 && responseContains(response, "The requested scope is invalid");
    }

    function responseContains(response, searchString) {
      if (!response || !response.data) {
        return false;
      }
      var responseData = JSON.stringify(response.data);
      return responseData.indexOf(searchString) != -1;
    }
  }
  
})();
