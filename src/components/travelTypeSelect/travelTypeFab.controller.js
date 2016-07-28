
angular.module('ng360')
  .controller('TravelTypeFabCtrl', ['$scope', function($scope) {
    var vm = this;

    this.travelTypes = [
      {name: 'Walk',   mode: 'walk',    icon: 'directions_walk'},
      {name: 'Bike',   mode: 'bike',    icon: 'directions_bike'},
      {name: 'Car',    mode: 'car',     icon: 'time_to_leave'},
      {name: 'Trasit', mode: 'transit', icon: 'train'}
    ];

    this.select = function(value) {
      $scope.model = value
    };

    $scope.$watch('model', function() {
      for (var i = 0; i < vm.travelTypes.length; i++) {
        if (vm.travelTypes[i].mode == $scope.model) {
          $scope.current = vm.travelTypes[i]
        }
      }
    })
  }]);
