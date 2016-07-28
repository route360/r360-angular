angular.module('ng360')
  .controller('TravelTimeFabCtrl', ['$scope', function($scope) {
    this.select = function(value) {
      $scope.model = value * 60;
    }

    $scope.$watch('model', function() {
      if ($scope.model && $scope.travelTimeValues) {
        $scope.travelTimeValues = $scope.travelTimeRange.times
                                  .filter(function(time) {return time <= $scope.model / 60})
                                  .map(function(time) {return time * 60});
      }
    })
  }]);