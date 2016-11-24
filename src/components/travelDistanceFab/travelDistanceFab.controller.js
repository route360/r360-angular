angular.module('ng360')
  .controller('TravelDistanceFabCtrl', ['$scope', function($scope) {
    this.select = function(value) {
      $scope.model = value;
    }

    $scope.$watch('model', function() {
      if ($scope.model && $scope.travelDistanceValues) {
        $scope.travelDistanceValues = $scope.travelDistanceRange.times
                                  .filter(function(time) {return time <= $scope.model})
                                  .map(function(time) {return time});
      }
    })
  }]);