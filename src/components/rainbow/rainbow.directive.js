/**
 * @ngdoc directive
 * @name r360DemoApp.directive:r360Rainbow
 * @description
 * # r360Rainbow
 */
angular.module('ng360')
  .directive('r360Rainbow', function () {
    return {
      restrict: 'E',
      templateUrl: 'rainbow.tpl',
      // controller: 'RainbowCtrl',
      // controllerAs: 'rainbowCtrl',
      scope: {
        travelTime: '=',
        travelTimeRange: '=',
        colorRange: '='
      }
    };
  })
