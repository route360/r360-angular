
angular.module('ng360')
  .controller('TsChartCtrl', ['$scope','$timeout','$attrs', function($scope){

    var vm = this;
    vm.chartApi = {};
    
    $scope.$watch('chartData', function(value) {
      console.log(value);
      if (angular.isDefined($scope.chartData) && $scope.chartData) {
        if (angular.isDefined($scope.chartData.nvd3Data)) vm.data = $scope.chartData.nvd3Data;
      }
    });
    vm.showChart = function(){
      return vm.data[0].values.length > 0 ? true : false;
    };

    vm.data = [{
        key: 'Population',
        values: []
    }];

    vm.options = {
      chart: {
          type: 'discreteBarChart',
          height: 300,
          margin : {
              top: 10,
              right: 10,
              bottom: 40,
              left: 70
          },
          x: function(d){return d.label;},
          y: function(d){return d.value;},
          showValues: false,
          valueFormat: d3.format('.0f'),
          duration: 500,
          xAxis: {
              axisLabel: 'Time in min',
              tickFormat: function(d){
                  if (d % 5 === 0) return d;
              }
          },
          color: function(d,i){
              if ($scope.colorRange.id === 'inverse') return $scope.colorRange.colors[0];
              if (i<=$scope.traveltimeRange.times[0]) return $scope.colorRange.colors[0];
              if (i<=$scope.traveltimeRange.times[1] && i>$scope.traveltimeRange.times[0]) return $scope.colorRange.colors[1];
              if (i<=$scope.traveltimeRange.times[2] && i>$scope.traveltimeRange.times[1]) return $scope.colorRange.colors[2];
              if (i<=$scope.traveltimeRange.times[3] && i>$scope.traveltimeRange.times[2]) return $scope.colorRange.colors[3];
              if (i<=$scope.traveltimeRange.times[4] && i>$scope.traveltimeRange.times[3]) return $scope.colorRange.colors[4];
              if (i<=$scope.traveltimeRange.times[5] && i>$scope.traveltimeRange.times[4]) return $scope.colorRange.colors[5];
          },
          yAxis: {
              axisLabel: 'Reachable people',
              tickFormat: d3.format('s')
          }
      }
    };

  }]);
