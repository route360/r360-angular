angular.module('ng360')
  .run(function ($templateCache){

      var tpl = '<md-select style="margin: 0" ng-model="msSwitcherCtrl.mapstyle" aria-label="Map Style Select" ng-change="msSwitcherCtrl.change()"><md-option ng-repeat="style in msSwitcherCtrl.mapStyles" value="{{style.value}}">{{style.name}}</md-option></md-select>';

      $templateCache.put('mapStyleSwitcher.tpl', tpl);
  });
