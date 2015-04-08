'use strict';

angular.module('Mediafusion').filter('thresholdListFilter', function ($filter) {

  /* Returning the Actual status based on the status value retrieved from backend. 
   *
   */
  return function (status) {
    return (status === 'Active') ? $filter('translate')('thresholdPage.active') : $filter('translate')('thresholdPage.pending');
  };
});
