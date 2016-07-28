angular.module('ng360')
  .run(function ($templateCache) {

      var tpl = 
      '<md-fab-speed-dial class="md-fling" md-direction="{{mdDirection || \'left\'}}">' +
        '<md-fab-trigger>' +
          '<md-button aria-label="{{label}}" class="md-fab">' +
            '<md-icon md-font-library="material-icons">{{current.icon}}</md-icon>' +
            '<md-tooltip md-delay="500">{{label}}</md-tooltip>' +
          '</md-button>' +
        '</md-fab-trigger>' +
        '<md-fab-actions>' +
          '<div ng-repeat="mode in travelTypeFabCtrl.travelTypes">' +
            '<md-button ng-click="travelTypeFabCtrl.select(mode.mode)" aria-label="{{mode.name}}" class="md-fab md-mini">' +
              '<md-icon md-font-library="material-icons">{{mode.icon}}</md-icon>' +
              '<md-tooltip md-delay="500">{{mode.name}}</md-tooltip>' +
            '</md-button>' +
          '</div>' +
        '</md-fab-actions>' +
      '</md-fab-speed-dial>'      
      

      $templateCache.put('travelTypeFab.tpl', tpl);
  });
