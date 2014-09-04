var app = angular.module('farmersMarket', ['ngRoute', 'filters']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: 'views/farmersSearch.html',
    	controller: 'search'
	}).when('/farmersMarket/:marketId/:marketName', {
    	templateUrl: 'views/farmersDetails.html',
    	controller: 'details'
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
			if ($scope.search.zip.length === 5) {
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

app.controller('details', function($scope, $routeParams, farmersMarketFactory) {
	$scope.marketId = $routeParams.marketId;
	$scope.marketName = $routeParams.marketName;
	$scope.loading = true;
	$scope.details = false;

	var init = function() {
		farmersMarketFactory.getMarketDetails($scope.marketId).then(function(d){
			$scope.details = d.marketdetails;
			$scope.details.GoogleMaps = 'https://www.google.com/maps/embed/v1/search?key=AIzaSyA4OFKbHnw9Ks7vW14ULE4xIQuFk4B6Fs4&zoom=11&q=' + encodeURIComponent($scope.details.Address.replace(/ *\([^)]*\) */g, ""));
			$scope.loading = false;
			console.log($scope.details);
		});
	};

	init();
});

app.factory('farmersMarketFactory', function($http) {

	var factory = {};

	var processData = function(dataArr) {
		var str1, str2, str3;
		if (dataArr.results[0].id !== "Error") {
			for (var i=0; i < dataArr.results.length; i++) {
				str1 = dataArr.results[i].marketname;
				str2 = str1.substr(0,str1.indexOf(' ')) + " miles ",
				str3 = str1.substr(str1.indexOf(' ')+1);
				dataArr.results[i].marketname = str3;
				dataArr.results[i].marketnameEncoded = encodeURIComponent(str3);
				dataArr.results[i].distance = str2;
			}
		}

		return dataArr;
	}

	factory.getMarketDataByZip = function(zip) {
		var promise = $http.get('http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=' + zip).then(function (results) {
			return processData(results.data);
		});
		return promise;
	};

	factory.getMarketDataByCoords = function(coords) {
		var promise = $http.get('http://search.ams.usda.gov/farmersmarkets/v1/data.svc/locSearch?lat=' + coords[0] + '&lng=' + coords[1]).then(function (results) {
			return processData(results.data);
		});
		return promise;
	};

	factory.getMarketDetails = function(id) {
		var promise = $http.get('http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=' + id).then(function (results) {
			return results.data;
		});
		return promise;
	};

	return factory;
});

angular.module('filters', []).filter('semicolonToList', function () {
	return function (input) {
		if (input) {
			return '<ul><li>' + input.replace(/;/g,'</li><li>') + '</li></ul>';
		}
	};
}).filter('semicolonToSpace', function () {
	return function (input) {
		if (input) {
			return input.replace(/;/g,' ');
		}
	};
}).filter('breakBeforeWeekDay', function () {
	return function (input) {
		var weekDays = ['Sun:', 'Mon:', 'Tue:', 'Wed:', 'Thu:', 'Fri:', 'Sat:'], re;
		if (input) {
			for (var i=0;i < weekDays.length;i++) {
				re = new RegExp(weekDays[i], "g");
				input = input.replace(re,'<br />' + weekDays[i]);
			}
			return input;
		}
	};
}).filter('removeParenthesis', function ($sce) {
	return function (input) {
		if (input) {
			return input.replace(/ *\([^)]*\) */g, "");
		}
	};
}).filter('urlSafe', ['$sce', function ($sce) {
	return function (input) {
		if (input) {
			return $sce.trustAsResourceUrl(input);
		}
	};
}]).filter('toHTML', ['$sce', function ($sce) {
	return function (input) {
		if (input) {
			return $sce.trustAsHtml(input);
		}
	};
}]);