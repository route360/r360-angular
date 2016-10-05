angular.module('ng360')
  .run(function ($templateCache) {
      var tpl =
        '<md-fab-speed-dial class="{{mdAnimation || \'md-fling\'}}" md-direction="{{mdDirection || \'left\'}}">' +
          '<md-fab-trigger>' +
            '<md-button aria-label="{{label}}" class="md-fab">' +
              '{{model && model / 60 || 0}} Min.' +
              '<md-tooltip md-delay="500">{{label}}</md-tooltip>' +
            '</md-button>' +
          '</md-fab-trigger>' +
          '<md-fab-actions>' +
            '<div ng-repeat="time in travelTimeRange.times | orderBy:$index:true ">' +
              '<md-button ng-click="travelTimeFabCtrl.select(time)" aria-label="{{label}} {{time}}" class="md-fab md-mini" ng-style="{background: colorRange.colors[5 - $index]}">' +
                '{{time}}' +
              '</md-button>' +
            '</div>' +
          '</md-fab-actions>' +
        '</md-fab-speed-dial>';

      $templateCache.put('travelTimeFab.tpl', tpl);
  });
