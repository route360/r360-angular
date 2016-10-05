
angular.module('ng360')
  .directive('travelSpeedFab', function() {
    return {
      restrict: 'E',
      scope: {
        model: '=',
        travelSpeeds: '=',
        mdDirection: '@',
        mdAnimation: '@',
        label: '@'
      },
      templateUrl: 'travelSpeedFab.tpl',
      controllerAs: 'travelSpeedFabCtrl',
      controller: 'TravelSpeedFabCtrl'
    };
  });
