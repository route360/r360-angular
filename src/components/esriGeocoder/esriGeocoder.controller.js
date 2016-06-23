
angular.module('ng360')
  .controller('EsriGeocoderCtrl', ['$scope','$timeout','$attrs', '$q', '$http', 'R360Util', function($scope,$timeout,$attrs,$q,$http,R360Util){

    var vm = this;

    function selectedItemChange(item) {

      if(!angular.isDefined(item)) return;

      var url = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?f=json&magicKey=" + item.magicKey + "&text=" + item.text;

      if (angular.isDefined($scope.token)) url += "&forStorage=true&token=" + $scope.token;

      $http({
          method: 'GET',
          url: url
      }).then(function(response) {

          if (angular.isDefined($scope.placeChanged) && angular.isDefined(response) ) $scope.placeChanged({item: response.data.locations[0]});

      }, function(response) {
          console.log(response);
      });
    }

    function suggest(text) {

      var results = [];
      var deferred = $q.defer();

      var url = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&text=" + text;
      if (angular.isDefined($scope.latlng)) {
        var latlng = R360Util.normalizeLatLng($scope.latlng);
        url += "&location=" + latlng.lat + "," + latlng.lng;
      }
      if (angular.isDefined($scope.distance)) url += "&distance=" + $scope.distance;

      $http({
          method: 'GET',
          url: url
      }).then(function(response) {

          if (!angular.isDefined(response.data.suggestions)) deferred.reject('no result');;

          deferred.resolve(response.data.suggestions);

      }, function(response) {
          console.log(response);
      });
      return deferred.promise;
    }

    vm.placeholder        = angular.isDefined($scope.placeholder) ? $scope.placeholder : 'Search...';
    vm.suggest            = suggest;
    vm.selectedItemChange = selectedItemChange;


  }])
