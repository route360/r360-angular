
angular.module('ng360')
  .directive('timeServiceChart', function() {
    return {
      restrict: 'E',
      scope: {
        chartData: '=',
        colorRange: '=',
        traveltimeRange: '='
      },
      templateUrl: 'timeServiceChart.tpl',
      controllerAs: 'tsChartCtrl',
      controller: 'TsChartCtrl'
    }
  });
