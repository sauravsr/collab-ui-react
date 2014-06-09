'use strict';

angular.module('wx2AdminWebClientApp')
	.controller('TabsCtrl', ['$scope', '$location', 'Log', 'Utils', '$filter',
		function($scope, $location, Log, Utils, $filter) {

			$scope.tabs = [{
				title: 'tabs.homeTab',
				path: '/home'
			}, {
				title: 'tabs.userTab',
				path: '/users'
			}, {
				title: 'tabs.reportTab',
				path: '/reports'
			}, {
				title: 'tabs.orgTab',
				path: '/orgs'
			}, {
				title: 'tabs.templateTab',
				path: '/templates'
			}];

			$scope.navType = 'pills';

			var setActiveTab = function() {
				var curPath = $location.path();
				for (var idx in $scope.tabs) {
					var tab = $scope.tabs[idx];
					if (tab.path === curPath) {
						tab.active = 'true';
						break;
					}
				}
			};
			setActiveTab();

			$scope.getTabTitle = function(title) {
				return $filter('translate')(title);
			};

			$scope.changeTab = function(tabPath) {
				if (Utils.isAdminPage()) {
					Log.debug('using path: ' + tabPath);
					$location.path(tabPath);
				}
			};
		}
	]);
