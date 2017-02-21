angular.module('ng360')
  .run(function ($templateCache) {
    var tpl =
      '<md-fab-speed-dial class="{{mdAnimation || \'md-fling\'}}" md-direction="{{mdDirection || \'left\'}}">' +
      '<md-fab-trigger>' +
      '<md-button aria-label="{{label}}" class="md-fab">' +
      '{{current.label}}' +
      '<md-tooltip md-delay="500">{{label}}</md-tooltip>' +
      '</md-button>' +
      '</md-fab-trigger>' +
      '<md-fab-actions>' +
      '<md-button ng-repeat="speed in travelSpeedFabCtrl.travelSpeeds" ng-click="travelSpeedFabCtrl.changeTravelSpeed(speed)" aria-label="{{speed.label}}" class="md-fab md-mini medium" style="font-size: 11px">' +
      '{{::(speed.label)}}' +
      '<md-tooltip md-delay="500">{{speed.tooltip || speed.value}}</md-tooltip>' +
      '</md-button>' +
      '</md-fab-actions>' +
      '</md-fab-speed-dial>';

    $templateCache.put('travelSpeedFab.tpl', tpl);
  });
