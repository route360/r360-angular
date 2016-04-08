
angular.module('ng360')
  .directive('mapStyleSwitcher', function() {
    return {
      restrict: 'E',
      scope: {
        r360Angular: '='
      },
      templateUrl: 'mapStyleSwitcher.tpl',
      controllerAs: 'msSwitcherCtrl',
      controller: 'MsSwitcherCtrl'
    };
  });
