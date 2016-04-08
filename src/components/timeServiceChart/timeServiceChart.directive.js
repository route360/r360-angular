
angular.module('ng360')
  .directive('timeServiceChart', function() {
    return {
      restrict: 'E',
      scope: {
        r360Angular: '=',
        chartData: '=',
        colorRange: '=',
        traveltimeRange: '='
      },
      templateUrl: 'timeServiceChart.tpl',
      controllerAs: 'tsChartCtrl',
      controller: 'TsChartCtrl'
    };
  });
