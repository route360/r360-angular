angular.module('ng360')
  .controller('TravelTimeFabCtrl', ['$scope', function($scope) {
    this.select = function(value) {
      $scope.model = value * 60
    }
   }]);