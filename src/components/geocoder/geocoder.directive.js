/**
 * @ngdoc directive
 * @name r360DemoApp.directive:r360Rainbow
 * @description
 * # r360Rainbow
 */
angular.module('ng360')
  .directive('r360Geocoder', function () {
    return {
      restrict: 'E',
      templateUrl: 'geocoder.tpl',
      controller: 'GeocoderCtrl',
      controllerAs: 'geocoderCtrl',
      scope: {
        bias: '=',
        selectedPlace: '=',
        placeholder: '@',
        placeChanged: '&',
        searchText: '='
      }
    };
  });
