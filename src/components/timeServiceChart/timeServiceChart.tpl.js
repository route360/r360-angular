angular.module('ng360')
  .run(function($templateCache) {

    var tpl = '<nvd3 ng-if="tsChartCtrl.data[0].values.length > 0" flex options="tsChartCtrl.options" data="tsChartCtrl.data" api="tsChartCtrl.chartApi"></nvd3><p ng-if="tsChartCtrl.data[0].values.length == 0">No population chart to show.</p>';

    $templateCache.put('timeServiceChart.tpl', tpl);
  });
