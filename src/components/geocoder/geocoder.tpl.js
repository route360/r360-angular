angular.module('ng360')
  .run(function ($templateCache){

      var tpl = "<md-autocomplete flex\
              md-selected-item='selectedPlace'\
              md-search-text='searchText'\
              md-selected-item-change='geocoderCtrl.selectedItemChange(item)'\
              md-items='item in geocoderCtrl.geocode(searchText,bias)'\
              md-item-text='item.description.full'\
              md-min-length='3'\
              placeholder='{{placeholder}}'\
              md-menu-class='r360-autocomplete'>\
            <md-item-template>\
            <span class='item-title'>\
                <span><strong>{{item.description.title}}</strong></span>\
              </span>\
              <span class='item-metadata'>\
                <span class='item-metastat'>\
                  {{item.description.meta1}}\
                </span>\
                <span class='item-metastat'>\
                  {{item.description.meta2}}\
                </span>\
              </span>\
            </md-item-template>\
            <md-not-found>\
              No matches found for '{{geocoderCtrl.searchText}}'.\
            </md-not-found>\
          </md-autocomplete>"

      $templateCache.put('geocoder.tpl', tpl);
  });
