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
		loading : false,
		results : null
	};

	$scope.getCoords = function() {
		if (Modernizr.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				$scope.search.coords = [
					position.coords.latitude,
					position.coords.longitude
				];
				$scope.$digest();
			});
		}
	};

	var trackZip = function() {
		if ($scope.search.zip) {
			if ($scope.search.zip.toString().length === 5) {
				$scope.search.loading = true;
				farmersMarketFactory.getMarketDataByZip($scope.search.zip).then(function(d){
					$scope.search.results = d.results;
					$scope.search.loading = false;
					console.log($scope.search);
				});
			}
		}
	};

	var trackCoords = function() {
		if ($scope.search.coords) {
			$scope.search.loading = true;
			farmersMarketFactory.getMarketDataByCoords($scope.search.coords).then(function(d){
				$scope.search.results = d.results;
				$scope.search.loading = false;
				console.log($scope.search);
			});
		}
	};

	var init = function() {
		$scope.$watch('search.zip', function() {
			trackZip();
		});
		$scope.$watch('search.coords', function() {
			trackCoords();
		});
	};

	init();
});

app.factory('farmersMarketFactory', function($http) {

	var factory = {};

	factory.getMarketDataByZip = function(zip) {
		var promise = $http.get('http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=' + zip).then(function (results) {
			return results.data;
		});
		return promise;
	};

	factory.getMarketDataByCoords = function(coords) {
		var promise = $http.get('http://search.ams.usda.gov/farmersmarkets/v1/data.svc/locSearch?lat=' + coords[0] + '&lng=' + coords[1]).then(function (results) {
			return results.data;
		});
		return promise;
	};

	return factory;
});
