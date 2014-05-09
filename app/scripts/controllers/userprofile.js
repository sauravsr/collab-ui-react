'use strict';

angular.module('wx2AdminWebClientApp')
.controller('UserProfileCtrl', ['$scope', '$location', '$route', '$routeParams', 'Log', 'Utils', '$translate', 'Userservice', 'Authinfo',
	function($scope, $location, $route, $routeParams, Log, Utils, $translate, Userservice, Authinfo) {

		var userid = $route.current.params.uid;
		$scope.orgName = Authinfo.getOrgName();

		Userservice.getUser(userid, function(data, status) {
			if (data.success) {
				$scope.user = data;
				if ($scope.user.photos)
				{
					for (var i in $scope.user.photos) {
						if ($scope.user.photos[i].type === 'thumbnail')
						{

							$scope.photoPath = $scope.user.photos[i].value;
						}
					} //end for
				} //endif
			}
			else {
				Log.debug('Get existing user failed. Status: ' + status);
			}
		});

    //Static data. To be replaced later with data from list logs API.
    $scope.userlogs = [{
      name: 'testuser_log_41234',
      date: new Date(),
    },
    {
      name: 'testuser_log_12341',
      date: new Date(),
    },
    {
      name: 'testuser_log_52123',
      date: new Date(),
    }];

		$scope.gotoPath = function(path) {
			$location.path(path);
		};

	}
]);
