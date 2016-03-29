
angular.module('ng360')
  .directive('timeServiceChart', function() {
    return {
      restrict: 'E',
      scope: {
        chartData: '=',
        colorRange: '='
      },
      template: '<nvd3 flex options="tsChartCtrl.options" data="tsChartCtrl.data" api="tsChartCtrl.chartApi"></nvd3>',
      controllerAs: 'tsChartCtrl',
      controller: 'TsChartCtrl'
    }
  });
