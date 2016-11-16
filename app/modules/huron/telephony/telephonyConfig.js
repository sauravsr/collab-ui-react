(function () {
  'use strict';

  module.exports = angular
    .module('huron.config', [
      require('modules/core/config/config'),
    ])
    .factory('HuronConfig', HuronConfig)
    .name;

  /* @ngInject */
  function HuronConfig(Config) {
    var config = {
      cmiUrl: {
        dev: 'https://cmi.huron-int.com/api/v1',
        integration: 'https://cmi.huron-int.com/api/v1',
        prod: 'https://cmi.huron-dev.com/api/v1'
      },
      cmiV2Url: {
        dev: 'https://cmi.huron-int.com/api/v2',
        integration: 'https://cmi.huron-int.com/api/v2',
        prod: 'https://cmi.huron-dev.com/api/v2'
      },

      cesUrl: {
        dev: 'https://ces.huron-int.com/api/v1',
        integration: 'https://ces.huron-int.com/api/v1',
        prod: 'https://ces.huron-dev.com/api/v1'
      },

      pgUrl: {
        dev: 'https://paging.huron-int.com/api/v1',
        integration: 'https://paging.huron-int.com/api/v1',
        prod: 'https://paging.huron-dev.com/api/v1'
      },

      emailUrl: {
        dev: 'https://hermes.huron-int.com/api/v1',
        integration: 'https://hermes.huron-int.com/api/v1',
        prod: 'https://hermes.huron-dev.com/api/v1'
      },

      terminusUrl: {
        dev: 'https://terminus.huron-int.com/api/v1',
        integration: 'https://terminus.huron-int.com/api/v1',
        prod: 'https://terminus.huron-dev.com/api/v1'
      },

      terminusV2Url: {
        dev: 'https://terminus.huron-int.com/api/v2',
        integration: 'https://terminus.huron-int.com/api/v2',
        prod: 'https://terminus.huron-dev.com/api/v2'
      },

      // TODO: Point to Ocelot micro service when it's ready.
      ocelotUrl: {
        dev: 'https://hermes.huron-int.com/api/v1',
        integration: 'https://hermes.huron-int.com/api/v1',
        prod: 'https://hermes.huron-dev.com/api/v1'
      },

      minervaUrl: {
        dev: 'https://minerva.huron-int.com/api/v1',
        integration: 'https://minerva.huron-int.com/api/v1',
        prod: 'https://minerva.huron-dev.com/api/v1'
      },

      avrilUrl: {
        dev: 'https://avrildirmgmt.appstaging.ciscoccservice.com/avrildirmgmt/api/v1',
        integration: 'https://avrildirmgmt.appstaging.ciscoccservice.com/avrildirmgmt/api/v1',
        prod: 'https://avrildirmgmt.produs1.ciscoccservice.com/avrildirmgmt/api/v1'
      },

      // TODO: Remove this when CMIv2 URl is ready.
      getMockHgUrl: function () {
        return 'https://mock-hg.de-ams.thunderhead.io/api/v2';
      },

      getAvrilUrl: function () {
        if (Config.isDev()) {
          return this.avrilUrl.dev;
        } else if (Config.isIntegration()) {
          return this.avrilUrl.integration;
        } else {
          return this.avrilUrl.prod;
        }
      },

      getCmiUrl: function () {
        if (Config.isDev()) {
          return this.cmiUrl.dev;
        } else if (Config.isIntegration()) {
          return this.cmiUrl.integration;
        } else {
          return this.cmiUrl.prod;
        }
      },

      getCmiV2Url: function () {
        if (Config.isDev()) {
          return this.cmiV2Url.dev;
        } else if (Config.isIntegration()) {
          return this.cmiV2Url.integration;
        } else {
          return this.cmiV2Url.prod;
        }
      },

      getCesUrl: function () {
        if (Config.isDev()) {
          return this.cesUrl.dev;
        } else if (Config.isIntegration()) {
          return this.cesUrl.integration;
        } else {
          return this.cesUrl.prod;
        }
      },

      getPgUrl: function () {
        if (Config.isDev()) {
          return this.pgUrl.dev;
        } else if (Config.isIntegration()) {
          return this.pgUrl.integration;
        } else {
          return this.pgUrl.prod;
        }
      },

      getEmailUrl: function () {
        if (Config.isDev()) {
          return this.emailUrl.dev;
        } else if (Config.isIntegration()) {
          return this.emailUrl.integration;
        } else {
          return this.emailUrl.prod;
        }
      },

      getTerminusUrl: function () {
        if (Config.isDev()) {
          return this.terminusUrl.dev;
        } else if (Config.isIntegration()) {
          return this.terminusUrl.integration;
        } else {
          return this.terminusUrl.prod;
        }
      },

      getTerminusV2Url: function () {
        if (Config.isDev()) {
          return this.terminusV2Url.dev;
        } else if (Config.isIntegration()) {
          return this.terminusV2Url.integration;
        } else {
          return this.terminusV2Url.prod;
        }
      },

      getOcelotUrl: function () {
        if (Config.isDev()) {
          return this.ocelotUrl.dev;
        } else if (Config.isIntegration()) {
          return this.ocelotUrl.integration;
        } else {
          return this.ocelotUrl.prod;
        }
      },

      getMinervaUrl: function () {
        if (Config.isDev()) {
          return this.minervaUrl.dev;
        } else if (Config.isIntegration()) {
          return this.minervaUrl.integration;
        } else {
          return this.minervaUrl.prod;
        }
      }

    };
    return config;
  }

})();
