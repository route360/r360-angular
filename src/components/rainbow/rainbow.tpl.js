angular.module('ng360')
  .run(function ($templateCache){

      var tpl = "<md-whiteframe class='md-whiteframe-z2' flex layout layout-align='center center'>\
          <label ng-repeat='tt in (travelTimeRange.labels || travelTimeRange.times)' ng-if='travelTime >= tt && colorRange.colors.length > 1' flex ng-style='{background: colorRange.colors[$index]}'>\
            {{tt}} {{label || 'Min'}}\
          </label>\
          <label ng-if='colorRange.colors.length == 1' flex style='background: {{colorRange.colors[0]}}'>\
            {{travelTime}} {{label || 'Min'}}\
          </label>\
        </md-whiteframe>"

      $templateCache.put('rainbow.tpl', tpl);
  });

