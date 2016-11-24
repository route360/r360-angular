
angular.module('ng360')
  .directive('travelDistanceFab', function() {
    return {
      restrict: 'E',
      scope: {
        model: '=',
        colorRange: '=',
        travelDistanceRange: '=',
        travelDistanceValues: '=',
        mdDirection: '@',
        mdAnimation: '@',
        label: '@',
        unitLabel: '@',
      },
      templateUrl: 'travelDistanceFab.tpl',
      controllerAs: 'travelDistanceFabCtrl',
      controller: 'TravelDistanceFabCtrl'
    };
  });
