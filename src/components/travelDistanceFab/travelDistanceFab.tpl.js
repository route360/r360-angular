angular.module('ng360')
  .run(function ($templateCache) {
      var tpl =
        '<md-fab-speed-dial class="{{mdAnimation || \'md-fling\'}}" md-direction="{{mdDirection || \'left\'}}">' +
          '<md-fab-trigger>' +
            '<md-button aria-label="{{label}}" class="md-fab">' +
              '{{selected && selected.label || 0}} {{unitLabel || "m"}}' +
              '<md-tooltip md-delay="500">{{label}}</md-tooltip>' +
            '</md-button>' +
          '</md-fab-trigger>' +
          '<md-fab-actions>' +
              '<md-button ng-repeat="item in travelDistanceItems | orderBy:$index:true " ng-click="travelDistanceFabCtrl.select(item)" aria-label="{{label}} {{item.label}}" class="md-fab md-mini" ng-style="{background: colorRange.colors[5 - $index]}">' +
                '{{item.label}}' +
              '</md-button>' +
          '</md-fab-actions>' +
        '</md-fab-speed-dial>';

      $templateCache.put('travelDistanceFab.tpl', tpl);
  });
