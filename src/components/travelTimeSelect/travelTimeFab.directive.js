
angular.module('ng360')
  .directive('travelTimeFab', function() {
    return {
      restrict: 'E',
      scope: {
        model: '=',
        colorRange: '=',
        travelTimeRange: '=',
        mdDirection: '@',
        label: '@'
      },
      templateUrl: 'travelTimeFab.tpl',
      controllerAs: 'travelTimeFabCtrl',
      controller: 'TravelTimeFabCtrl'
    };
  });
