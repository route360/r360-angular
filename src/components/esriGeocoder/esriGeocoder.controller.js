angular.module('ng360')
  .controller('EsriGeocoderCtrl', ['$scope', '$timeout', '$attrs', '$q', '$http', 'R360Util', function ($scope, $timeout, $attrs, $q, $http, R360Util) {

    var vm = this;

    function selectedItemChange(item) {

      if (!angular.isDefined(item)) return;

      // regex direct latlng input
      var matches = item.text.match(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/g);

      if (matches && matches.length > 0) {
        if (angular.isDefined($scope.placeChanged)) $scope.placeChanged([{
          geometry: {
            coordinates: {
              x: parseFloat(item.text.split(',')[1]),
              y: parseFloat(item.text.split(',')[0])
            }
          },
          properties: {
            name: item.text
          },
          name: item.text,
          text: item.text
        }])
      };

      var url = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?f=json&magicKey=' + encodeURIComponent(item.magicKey) + '&text=' + encodeURIComponent(item.text);

      if (angular.isDefined($scope.token)) url += '&forStorage=true&token=' + encodeURIComponent($scope.token);

      $http({
        method: 'GET',
        url: url
      }).then(function (response) {

        if (angular.isDefined($scope.placeChanged) && angular.isDefined(response)) $scope.placeChanged({
          item: response.data.locations[0]
        });

      }, function (response) {
        console.log(response);
      });
    }

    function suggest(text) {

      var results = [];
      var deferred = $q.defer();

      // regex direct latlng input
      var matches = text.match(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/g);

      if (matches && matches.length > 0) return Promise.resolve([{
        text: text
      }]);

      var url = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&text=' + encodeURIComponent(text);
      if (angular.isDefined($scope.latlng)) {
        var latlng = R360Util.normalizeLatLng($scope.latlng);
        url += '&location=' + latlng.lat + ',' + latlng.lng;
      }
      if (angular.isDefined($scope.distance)) url += '&distance=' + $scope.distance;
      if (angular.isDefined($scope.country)) url += '&countryCode=' + $scope.country;

      $http({
        method: 'GET',
        url: url
      }).then(function (response) {

        if (!angular.isDefined(response.data.suggestions)) deferred.reject('no result');;

        deferred.resolve(response.data.suggestions);

      }, function (response) {
        console.log(response);
      });
      return deferred.promise;
    }

    vm.placeholder = angular.isDefined($scope.placeholder) ? $scope.placeholder : 'Search...';
    vm.suggest = suggest;
    vm.selectedItemChange = selectedItemChange;


  }])