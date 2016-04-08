
angular.module('ng360')
  .controller('MsSwitcherCtrl', ['$scope','CONST', function($scope,CONST){

    var vm = this;
    vm.map = {};
    vm.mapStyles = CONST.prefs.mapStyles;

    $scope.$watch('r360Angular', function(value) {
      if (angular.isDefined($scope.r360Angular) && $scope.r360Angular) {
        vm.mapstyle = value.options.mapstyle;
      }
    });

    vm.change = function() {
      if (angular.isDefined($scope.r360Angular) && $scope.r360Angular) $scope.r360Angular.setTileUrl(vm.mapstyle);
    };

  }]);
