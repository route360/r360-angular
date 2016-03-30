
angular.module('ng360')
  .controller('TsChartCtrl', ['$scope','$timeout','$attrs', function($scope,$timeout,$attrs){


    var vm = this;
    vm.chartApi = {};

    console.log($attrs);
    console.log( $scope);

    $timeout(function(){
      console.log($attrs);
      console.log($scope);
    },1000)

    $scope.$watch('chartData', function(value) {
      console.log('chartdata has changed value to');
      console.log(value);
      if (angular.isDefined($scope.chartData)) {
        if (angular.isDefined($scope.chartData.nvd3Data)) vm.data = $scope.chartData.nvd3Data;
        if (angular.isDefined($scope.chartData.max)) vm.max = $scope.chartData.max;
        // vm.data = [{
        //   key: "Population",
        //   values: $scope.chartData
        // }]
      }
    });
    vm.showChart = function(){
      vm.data[0].values.length > 0 ? true : false;
    }
    vm.max;
    vm.data = [{
        key: "Population",
        values: []
    }]

    // vm.data[0] = $scope.chartData.nvd3Data[0];

    vm.options = {
      chart: {
          type: 'discreteBarChart',
          height: 300,
          margin : {
              top: 30,
              right: 30,
              bottom: 50,
              left: 70
          },
          x: function(d){return d.label;},
          y: function(d){return d.value;},
          showValues: false,
          valueFormat: d3.format('.0f'),
          duration: 500,
          xAxis: {
              axisLabel: 'Time in min',
              tickFormat: function(d,i){
                  if (d % 5 == 0) return d;
              }
          },
          color: function(d,i){
              if ($scope.colorRange.id == 'inverse') return $scope.colorRange.colors[0];
              // if (i<=10) return $scope.colorRange.colors[0];
              // if (i<=20 && i>10) return $scope.colorRange.colors[1];
              // if (i<=30 && i>20) return $scope.colorRange.colors[2];
              // if (i<=40 && i>30) return $scope.colorRange.colors[3];
              // if (i<=50 && i>40) return $scope.colorRange.colors[4];
              // if (i<=60 && i>50) return $scope.colorRange.colors[5];
              if (i<=$scope.traveltimeRange.times[0]) return $scope.colorRange.colors[0];
              if (i<=$scope.traveltimeRange.times[1] && i>$scope.traveltimeRange.times[0]) return $scope.colorRange.colors[1];
              if (i<=$scope.traveltimeRange.times[2] && i>$scope.traveltimeRange.times[1]) return $scope.colorRange.colors[2];
              if (i<=$scope.traveltimeRange.times[3] && i>$scope.traveltimeRange.times[2]) return $scope.colorRange.colors[3];
              if (i<=$scope.traveltimeRange.times[4] && i>$scope.traveltimeRange.times[3]) return $scope.colorRange.colors[4];
              if (i<=$scope.traveltimeRange.times[5] && i>$scope.traveltimeRange.times[4]) return $scope.colorRange.colors[5];
          },
          yAxis: {
              axisLabel: 'Reachable people',
              tickFormat: d3.format("s")
          }
      }
    };

  }])