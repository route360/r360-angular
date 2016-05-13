/**
 * @ngdoc directive
 * @name r360DemoApp.directive:r360Rainbow
 * @description
 * # r360Rainbow
 */
angular.module('ng360')
  .directive('r360EsriGeocoder', function () {
    return {
      restrict: 'E',
      templateUrl: 'esriGeocoder.tpl',
      controller: 'EsriGeocoderCtrl',
      controllerAs: 'esriGeocoderCtrl',
      scope: {
        selectedPlace: '=',
        placeholder: '@',
        latlng: '=',
        distance: '=',
        placeChanged: '&',
        searchText: '='
      }
    };
  });
