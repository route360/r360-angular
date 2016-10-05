
angular.module('ng360')
  .controller('TravelSpeedFabCtrl', ['$scope', '$attrs', function($scope, $attrs) {
    var vm = this;


    this.changeTravelSpeed = function(speed) {
      $scope.current = speed
      $scope.model = speed.value
    }

    this.travelSpeeds = [
      {value: 'fast',   label: 'Fast'},
      {value: 'medium', label: 'Medium'},
      {value: 'slow',   label: 'Slow'},
    ];

    this.select = function(value) {
      $scope.model = value;
    };

    $scope.$watch('travelSpeeds', function() {
      if ($scope.travelSpeeds) {
        vm.travelSpeeds = $scope.travelSpeeds;
      }
    });

    $scope.$watch('model', function() {
      for (var i = 0; i < vm.travelSpeeds.length; i++) {
        if (vm.travelSpeeds[i].value == $scope.model) {
          $scope.current = vm.travelSpeeds[i];
        }
      }
    });
  }]);
