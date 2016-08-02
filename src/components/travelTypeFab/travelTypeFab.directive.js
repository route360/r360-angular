
angular.module('ng360')
  .directive('travelTypeFab', function() {
    return {
      restrict: 'E',
      scope: {
        model: '=',
        travelTypes: '=',
        mdDirection: '@',
        label: '@'
      },
      templateUrl: 'travelTypeFab.tpl',
      controllerAs: 'travelTypeFabCtrl',
      controller: 'TravelTypeFabCtrl'
    };
  });
