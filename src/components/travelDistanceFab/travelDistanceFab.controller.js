angular.module('ng360')
  .controller('TravelDistanceFabCtrl', ['$scope', function($scope) {
    this.select = function(value) {
      $scope.model = value.time;
      $scope.selected = value;
    }

    $scope.$watch('travelDistanceRange', function() {
      if ($scope.travelDistanceRange) {
        var labels = $scope.travelDistanceRange.labels || []
        $scope.travelDistanceItems = $scope.travelDistanceRange.times
                                  .map(function(time, i) {return {time: time, label: labels[i] || time}});

        $scope.selected = $scope.travelDistanceItems.filter(function(item) {return item.time == $scope.model})[0];
      }
    })

    $scope.$watch('model', function() {
      if ($scope.model && $scope.travelDistanceValues) {
        $scope.travelDistanceValues = $scope.travelDistanceRange.times
                                  .filter(function(time) {return time <= $scope.model})
                                  .map(function(time) {return time});

      }

      if ($scope.model && $scope.travelDistanceItems) {
        $scope.selected = $scope.travelDistanceItems.filter(function(item) {return item.time == $scope.model})[0];
      }
    })
  }]);