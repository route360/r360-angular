angular.module('ng360')
  .run(function($templateCache) {
    var tpl =
      '<md-fab-speed-dial class="{{mdAnimation || \'md-fling\'}}" md-direction="{{mdDirection || \'left\'}}">' +
      '<md-fab-trigger>' +
      '<md-button aria-label="{{label}}" class="md-fab">' +
      '{{model && model / 60 || 0}} Min.' +
      '<md-tooltip md-delay="500">{{label}}</md-tooltip>' +
      '</md-button>' +
      '</md-fab-trigger>' +
      '<md-fab-actions>' +
      '<md-button ng-repeat="time in travelTimeRange.times | orderBy:$index:true " ng-click="travelTimeFabCtrl.select(time)" aria-label="{{label}} {{time}}" class="md-fab md-mini" ng-style="{background: colorRange.colors[colorRange.colors.length - $index - 1]}">' +
      '{{time}}' +
      '</md-button>' +
      '</md-fab-actions>' +
      '</md-fab-speed-dial>';

    $templateCache.put('travelTimeFab.tpl', tpl);
  });
