'use strict';
angular
  .module('wx2AdminWebClientApp')
  .config(['$httpProvider', '$injector', '$stateProvider', '$urlRouterProvider',
    function ($httpProvider, $injector, $stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('login');
      $stateProvider
        .state('login', {
          url: '/login',
          views: {
            'main@': {
              templateUrl: 'modules/core/login/login.tpl.html',
              controller: 'LoginCtrl'
            }
          },
          authenticate: false
        })
        .state('main', {
          views: {
            'main@': {
              templateUrl: 'modules/core/views/main.tpl.html'
            }
          },
          abstract: true,
          sticky: true
        })
        .state('partner', {
          template: '<div ui-view></div>',
          url: '/partner',
          parent: 'main',
          abstract: true
        })
        .state('unauthorized', {
          url: '/unauthorized',
          templateUrl: 'modules/squared/views/unauthorized.html',
          parent: 'main'
        });

      $httpProvider.responseInterceptors.push('ResponseInterceptor');

      var translation = $injector.get('$translateProvider');

      translation.useStaticFilesLoader({
        prefix: 'l10n/',
        suffix: '.json'
      });

      //Tell the module what language to use by default
      translation.preferredLanguage('en_US');
    }
  ]);

angular
  .module('Squared')
  .config(['$urlRouterProvider', '$stateProvider',
    function ($urlRouterProvider, $stateProvider) {
      var modalMemo = 'modalMemo';
      var wizardmodalMemo = 'wizardmodalMemo';

      $stateProvider
        .state('activate', {
          url: '/activate',
          templateUrl: 'modules/squared/views/activate.html',
          controller: 'ActivateCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('downloads', {
          url: '/downloads',
          templateUrl: 'modules/squared/views/downloads.html',
          controller: 'DownloadsCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('invite', {
          url: '/invite',
          templateUrl: 'modules/squared/views/invite.html',
          controller: 'InviteCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('invitelauncher', {
          url: '/invitelauncher',
          templateUrl: 'modules/squared/views/invitelauncher.html',
          controller: 'InvitelauncherCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('applauncher', {
          url: '/applauncher',
          templateUrl: 'modules/squared/views/applauncher.html',
          controller: 'ApplauncherCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('appdownload', {
          url: '/appdownload',
          templateUrl: 'modules/squared/views/appdownload.html',
          controller: 'AppdownloadCtrl',
          parent: 'main',
          authenticate: false
        })
        .state('overview', {
          url: '/overview',
          templateUrl: 'modules/core/landingPage/landingPage.tpl.html',
          controller: 'LandingPageCtrl',
          parent: 'main'
        })
        .state('users', {
          abstract: true,
          template: '<div ui-view></div>',
          parent: 'main'
        })
        .state('users.list', {
          url: '/users',
          templateUrl: 'modules/core/users/userList/userList.tpl.html',
          controller: 'ListUsersCtrl',
          params: {
            showAddUsers: {}
          }
        })
        .state('users.list.preview', {
          templateUrl: 'modules/core/users/userPreview/userPreview.tpl.html',
          controller: 'UserPreviewCtrl'
        })
        .state('users.list.preview.conversations', {
          template: '<div user-entitlements current-user="currentUser" entitlements="entitlements" queryuserslist="queryuserslist"></div>'
        })
        .state('users.list.preview.directorynumber', {
          templateUrl: 'modules/huron/lineSettings/lineSettings.tpl.html',
          controller: 'LineSettingsCtrl'
        })
        .state('users.list.preview.adddirectorynumber', {
          templateUrl: 'modules/huron/lineSettings/lineSettings.tpl.html',
          controller: 'LineSettingsCtrl'
        })
        .state('users.list.preview.voicemail', {
          template: '<div voicemail-info></div>'
        })
        .state('users.list.preview.snr', {
          template: '<div single-number-reach-info></div>'
        })
        .state('organization', {
          url: '/organization',
          templateUrl: 'modules/core/views/organizations.html',
          controller: 'OrganizationsCtrl',
          parent: 'main'
        })
        .state('templates', {
          url: '/templates',
          templateUrl: 'modules/squared/views/templates.html',
          controller: 'UsersCtrl',
          parent: 'main'
        })
        .state('reports', {
          url: '/reports',
          templateUrl: 'modules/squared/views/reports.html',
          controller: 'ReportsCtrl',
          parent: 'main'
        })
        .state('userprofile', {
          url: '/userprofile/:uid',
          templateUrl: 'modules/squared/views/userprofile.html',
          controller: 'UserProfileCtrl',
          parent: 'main'
        })
        .state('support', {
          url: '/support?search',
          templateUrl: 'modules/squared/views/support.html',
          controller: 'SupportCtrl',
          parent: 'main'
        })
        .state('devices', {
          url: '/devices',
          templateUrl: 'modules/squared/devices/devices.html',
          controller: 'SpacesCtrl',
          parent: 'main'
        })
        .state('partneroverview', {
          parent: 'partner',
          url: '/overview',
          templateUrl: 'modules/core/views/partnerlanding.html',
          controller: 'PartnerHomeCtrl'
        })
        .state('partnerreports', {
          parent: 'partner',
          url: '/reports',
          templateUrl: 'modules/squared/views/partnerreports.html',
          controller: 'ReportsCtrl'
        })
        .state('login_swap', {
          url: '/login/:customerOrgId/:customerOrgName',
          views: {
            'main@': {
              templateUrl: 'modules/core/login/login.tpl.html',
              controller: 'LoginCtrl'
            }
          },
          authenticate: false
        })
        .state('launch_partner_org', {
          url: '/login/:launchPartnerOrg',
          views: {
            'main@': {
              templateUrl: 'modules/core/login/login.tpl.html',
              controller: 'LoginCtrl'
            }
          },
          authenticate: false
        })
        .state('partnercustomers', {
          parent: 'partner',
          template: '<div ui-view></div>',
          absract: true
        })
        .state('partnercustomers.list', {
          url: '/customers',
          templateUrl: 'modules/core/customers/customerList/customerList.tpl.html',
          controller: 'PartnerHomeCtrl'
        })
        .state('partnercustomers.list.preview', {
          templateUrl: 'modules/core/customers/customerPreview/customerPreview.tpl.html',
          controller: 'CustomerPreviewCtrl'
        })
        .state('modal', {
          abstract: true,
          onEnter: ['$modal', '$state', '$previousState', function ($modal, $state, $previousState) {
            $previousState.memo(modalMemo);
            $state.modal = $modal.open({
              template: '<div ui-view="modal"></div>'
            });
            $state.modal.result.finally(function () {
              $state.modal = null;
              var previousState = $previousState.get(modalMemo);
              if (previousState) {
                return $previousState.go(modalMemo);
              }
            });
          }],
          onExit: ['$state', '$previousState', function ($state, $previousState) {
            if ($state.modal) {
              $previousState.forget(modalMemo);
              $state.modal.close();
            }
          }]
        })
        .state('wizardmodal', {
          abstract: true,
          onEnter: ['$modal', '$state', '$previousState', function ($modal, $state, $previousState) {
            $previousState.memo(wizardmodalMemo);
            $state.modal = $modal.open({
              template: '<div ui-view="modal"></div>',
              controller: 'ModalWizardCtrl',
              windowTemplateUrl: 'modules/core/modal/wizardWindow.tpl.html'
            });
            $state.modal.result.finally(function () {
              $state.modal = null;
              var previousState = $previousState.get(wizardmodalMemo);
              if (previousState) {
                return $previousState.go(wizardmodalMemo);
              }
            });
          }],
          onExit: ['$state', '$previousState', function ($state, $previousState) {
            if ($state.modal) {
              $previousState.forget(wizardmodalMemo);
              $state.modal.close();
            }
          }]
        })
        .state('firsttimesplash', {
          abstract: true,
          views: {
            'main@': {
              templateUrl: 'modules/core/setupWizard/firstTimeWizard.tpl.html',
              controller: 'FirstTimeWizardCtrl'
            }
          }
        })
        .state('firsttimewizard', {
          parent: 'firsttimesplash',
          templateUrl: 'modules/core/setupWizard/setupWizard.tpl.html',
          controller: 'SetupWizardCtrl'
        })
        .state('setupwizardmodal', {
          parent: 'wizardmodal',
          views: {
            'modal@': {
              templateUrl: 'modules/core/setupWizard/setupWizard.tpl.html',
              controller: 'SetupWizardCtrl'
            }
          }
        });
    }
  ]);

angular
  .module('Huron')
  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider
        .state('callrouting', {
          url: '/callrouting',
          templateUrl: 'modules/huron/views/callrouting.html',
          controller: 'CallRoutingCtrl',
          parent: 'main'
        });
    }
  ]);

angular
  .module('Hercules')
  .config(['$stateProvider',
    function ($stateProvider) {
      $stateProvider
        .state('fusion', {
          url: '/fusion',
          templateUrl: 'modules/hercules/views/connectors.html',
          controller: 'ConnectorCtrl',
          parent: 'main'
        });
    }
  ]);
