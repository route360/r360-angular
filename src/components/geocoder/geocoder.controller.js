
angular.module('ng360')
  .controller('GeocoderCtrl', ['$scope','$timeout','$attrs', 'R360Util', function($scope,$timeout,$attrs,R360Util){

    var vm = this;

    function selectedItemChange(item) {
      if (angular.isDefined($scope.placeChanged) && angular.isDefined(item) ) $scope.placeChanged({item: item});
    }

    vm.placeholder        = angular.isDefined($scope.placeholder) ? $scope.placeholder : 'Search...';

    vm.geocode            = R360Util.geocode;
    vm.selectedItemChange = selectedItemChange;

  }])
