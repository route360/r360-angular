
angular.module('ng360')
  .directive('travelTypeFab', function() {
    return {
      restrict: 'E',
      scope: {
        model: '=',
        mdDirection: '@',
        label: '@'
      },
      templateUrl: 'travelTypeFab.tpl',
      controllerAs: 'travelTypeFabCtrl',
      controller: 'TravelTypeFabCtrl'
    };
  });
