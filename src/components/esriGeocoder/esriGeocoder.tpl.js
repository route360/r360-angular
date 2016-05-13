angular.module('ng360')
  .run(function ($templateCache){

      var tpl = "<md-autocomplete flex\
              md-selected-item='selectedPlace'\
              md-search-text='searchText'\
              md-selected-item-change='esriGeocoderCtrl.selectedItemChange(item)'\
              md-items='item in esriGeocoderCtrl.suggest(searchText)'\
              md-item-text='item.text'\
              md-min-length='3'\
              placeholder='{{placeholder}}'\
              md-menu-class='r360-autocomplete'>\
            <md-item-template>\
            <span class='item-title'>\
                <span>{{item.text}}</span>\
              </span>\
            </md-item-template>\
            <md-not-found>\
              No matches found for '{{searchText}}'.\
            </md-not-found>\
          </md-autocomplete>"

      $templateCache.put('esriGeocoder.tpl', tpl);
  });
