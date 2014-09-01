var app = angular.module('farmersMarket', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: 'views/farmersSearch.html',
    	controller: 'search'
	}).otherwise({redirectTo:'/'});
}]);

app.controller('search', function($scope, farmersMarketFactory) {
	$scope.search = {
		zip : null,
		coords : null,
		loading : true,
		results : null
	};

	var init = function() {
		if (Modernizr.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				$scope.coords = [
					position.coords.latitude,
					position.coords.longitude
				];
				farmersMarketFactory.getMarketDataByCoords($scope.coords).then(function(d){
					$scope.loading = false;
					$scope.results = d;
				});
			});
		}
		$scope.$watch('zip', function() {
			$scope.loading = true;
			farmersMarketFactory.getMarketDataByZip($scope.zip).then(function(d){
				$scope.loading = false;
				$scope.results = d;
			});
		});
	};

	init();
});

app.factory('farmersMarketFactory', function($http) {

	var factory = {};

	factory.getMarketDataByZip = function(zip) {
		var promise = $http.get('http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=' + zip).then(function (results) {
			console.log(results.data);
			return results.data;
		});
		return promise;
	};

	factory.getMarketDataByCoords = function(coords) {
		var promise = $http.get('http://search.ams.usda.gov/farmersmarkets/v1/data.svc/locSearch?lat=' + coords[0] + '&lng=' + coords[1]).then(function (results) {
			console.log(results.data);
			return results.data;
		});
		return promise;
	};

	return factory;
});
