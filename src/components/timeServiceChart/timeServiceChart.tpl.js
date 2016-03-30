angular.module('ng360')
  .run(function ($templateCache){

      var tpl = "<nvd3 ng-if='tsChartCtrl.data[0].values.length > 0' flex options='tsChartCtrl.options' data='tsChartCtrl.data' api='tsChartCtrl.chartApi'></nvd3>\
          <md-list-item ng-if='tsChartCtrl.data[0].values.length == 0'>\
              <p>No population chart to show.</p>\
          </md-list-item>\
          <md-list-item ng-if='tsChartCtrl.max'>\
              <p>Total reachable</p>\
              <p style='text-align: right'>{{tsChartCtrl.max | number:0}}</p>\
          </md-list-item>"

      $templateCache.put('timeServiceChart.tpl', tpl);
  });
