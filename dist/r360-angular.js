"use strict"; 

 angular.module('ng360.constants', [])

.constant('CONST', {serviceKey:'OOWOFUK3OPHLQTA8H5JD',prefs:{travelTypes:[{name:'Bike',icon:'md:bike',value:'bike'},{name:'Walk',icon:'md:walk',value:'walk'},{name:'Car',icon:'md:car',value:'car'},{name:'Transit',icon:'md:train',value:'transit'}],queryTimeRange:{hour:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],minute:[0,5,10,15,20,25,30,35,40,45,50,55]},intersectionTypes:{union:{name:'Union',value:'union'},intersection:{name:'Intersection',value:'intersection'},average:{name:'Average',value:'average'}},travelTimeRanges:{'5to30':{name:'5 Min - 30 Min',id:'5to30',times:[5,10,15,20,25,30]},'10to60':{name:'10 Min - 60 Min',id:'10to60',times:[10,20,30,40,50,60]},'20to120':{name:'20 Min - 120 Min',id:'20to120',times:[20,40,60,80,100,120]}},colorRanges:{default:{name:'Green to Red',id:'default',colors:['#006837','#39B54A','#8CC63F','#F7931E','#F15A24','#C1272D'],opacities:[1,1,1,1,1,1]},colorblind:{name:'Colorblind',id:'colorblind',colors:['#142b66','#4525AB','#9527BC','#CE29A8','#DF2A5C','#F0572C'],opacities:[1,1,1,1,1,1]},greyscale:{name:'Greyscale',id:'greyscale',colors:['#d2d2d2','#b2b2b2','#999999','#777777','#555555','#333333'],opacities:[1,0.8,0.6,0.4,0.2,0]},inverse:{name:'Inverse Mode (B/W)',id:'inverse',colors:['#777777'],opacities:[1,1,1,1,1,1]}},mapStyles:{light:{name:'Light',value:'https://cartodb-basemaps-c.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'},dark:{name:'Dark',value:'https://cartodb-basemaps-c.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'},osm:{name:'OSM Standard',value:'http://tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'}}}})

;
/**
 * Route 360 for Angular
 * https://github.com/route360/r360-angular
 * @license MIT
 * v0.0.1
 */

'use strict';

angular.module('ng360', ['ng360.constants']);

angular.module('ng360')
    .factory('R360Angular', [ '$q','$location','$timeout','$http', 'CONST', function($q,$location,$timeout,$http,CONST) {

        var R360Angular = (function() {

            var now = new Date();
            var hour = now.getHours();
            var minute = (now.getMinutes() + (5 - now.getMinutes() % 5)) % 60;
            if (minute === 0) {
                hour++;
            }
            if (hour === 24) {
                hour = 0;
            }
            // scope var to expose options from constructor to private functions
            // all PRIVATE vars and funcs are only accessible via scope
            // all PUBLIC vars and funcs are accessible via this AND scope
            var scope = {};
            scope.prefs = CONST.prefs;

            // constructor
            function R360Angular(map,options) {

                scope.map = map;
                var self = this;
                // default options

                self.options = {};

                self.options.serviceKey           = '6RNT8QMSOBQN0KMFXIPD';
                self.options.areaID               = 'germany';
                self.options.travelTime           = 30;
                self.options.travelTimeRange      = '5to30';
                self.options.travelType           = 'transit';
                self.options.queryTime            = { h : hour, m : minute };
                self.options.queryDate            = now;
                self.options.colorRange           = 'default';
                self.options.markers              = [];
                self.options.intersection         = 'union';
                self.options.strokeWidth          = 20;
                self.options.extendWidth          = 500;
                self.options.mapstyle             = 'https://cartodb-basemaps-c.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
                self.options.maxmarkers           = 5;
                self.options.maxTargetMarkers     = 5;
                self.options.customMode           = false;
                self.options.endpoint             = 'brandenburg';
                self.options.serviceUrl           = 'https://service.route360.net/brandenburg/';
                self.options.populationServiceUrl = 'https://service.route360.net/brandenburg_population/population/';
                self.options.showPopLayer         = false;


                // change to custom options
                if (angular.isDefined(options)) {
                    for (var i in options) {
                        self.options[i] = options[i];
                    }
                }

                r360.config.defaultPolygonLayerOptions.backgroundOpacity = 0.3;
                r360.config.requestTimeout = 10000;
                r360.config.serviceUrl = self.options.serviceUrl;
                r360.config.serviceKey = self.options.serviceKey;
                r360.config.i18n.language = 'de';

                // setter for service URL (databinding doesnt work)
                this.setServiceUrl = function(serviceUrl) {
                    r360.config.serviceUrl = serviceUrl;
                };

                // helper for context menu
                this.lastRelatedTarget = null;

                this.attribution = "<a href='https://cartodb.com/' target='_blank'>© CartoDB</a> | <a href='https://www.openstreetmaps.com/' target='_blank'>© OpenStreetMap</a> | © Transit Data <a href='https://ruter.no' target='_blank'>Ruter</a>, <a href='https://www.kolumbus.no/en/' target='_blank'>Kolumbus</a> | developed by <a href='https://www.route360.net/?lang=en' target='_blank'>Motion Intelligence</a>";

                this.layerGroups = {
                    tileLayer: L.tileLayer(self.options.mapstyle, {maxZoom: 18,attribution: this.attribution}).addTo(map),
                    markerLayerGroup: L.featureGroup().addTo(map),
                    routeLayerGroup: L.featureGroup().addTo(map),
                    polygonLayerGroup: r360.leafletPolygonLayer({extendWidthX: self.options.extendWidth, extendWidthY: self.options.extendWidth}).addTo(map),
                    populationDensityLayer: L.tileLayer.wms('https://service.route360.net/geoserver/wms?service=WMS&TILED=true', {
                        layers: 'bevoelkerungsdichte_berlin_brandenburg:brandenburg_pop_density',
                        format: 'image/png',
                        transparent: true,
                        opacity: 0.5
                    })
                };

                map.on('contextmenu.show', function(e) {
                    this.lastRelatedTarget = e.relatedTarget;
                });

                function removeMarkerFromContext(e) {
                    self.removeMarker(self.lastRelatedTarget);
                }

            }

            /**
             * Sets a new tile URL and redraws the map
             * @param  String url New tile url
             */
            R360Angular.prototype.setTileUrl = function(url) {
              var self = this;
              self.options.mapstyle = url;
              self.layerGroups.tileLayer.setUrl(url);
              self.layerGroups.tileLayer.redraw();
            };

            /**
             * Builds r360 traveloptions. For intenal use only
             * @return r360.travelOptions
             */
            R360Angular.prototype.getTravelOptions = function() {

                var self = this;

                var travelOptions = r360.travelOptions();

                var travelTime = self.options.travelTime * 60;
                var travelTimes=[];
                var defaultColors =[];

                scope.prefs.travelTimeRanges[self.options.travelTimeRange].times.forEach(function(elem, index) {
                    var dataSet = {};
                    dataSet.time  = elem*60;
                    dataSet.color = scope.prefs.colorRanges[self.options.colorRange].colors[index];
                    dataSet.opacity = scope.prefs.colorRanges[self.options.colorRange].opacities[index];
                    defaultColors.push(dataSet);
                });

                r360.config.defaultTravelTimeControlOptions.travelTimes = defaultColors;

                if (self.options.colorRange === 'inverse') {
                    travelTimes.push(travelTime);
                } else {
                    defaultColors.forEach(function(elem) {
                        if (elem.time <= travelTime) {
                            travelTimes.push(elem.time);
                        }
                    });
                }

                if (self.options.colorRange === 'inverse') {
                    self.layerGroups.polygonLayerGroup.setInverse(true);
                } else {
                    self.layerGroups.polygonLayerGroup.setInverse(false);
                };

                travelOptions.setTravelTimes(travelTimes);
                travelOptions.setTravelType(self.options.travelType);

                // Query for source markers

                self.options.markers.forEach(function(marker) {
                    if (marker.polygons && marker.route == 'source') travelOptions.addSource(marker);
                    if (marker.route == 'target') travelOptions.addTarget(marker);
                    // elem.id=Math.random()*100000; // Prevent cache hack
                });

                travelOptions.extendWidthX = self.options.extendWidth * 2;
                travelOptions.extendWidthY = self.options.extendWidth * 2;

                travelOptions.setIntersectionMode(self.options.intersection);

                if (self.options.travelType == 'transit') {

                    var date = String(self.options.queryDate.getFullYear()) + ('0' + String(self.options.queryDate.getMonth()+1)).slice(-2) + ('0' + String(self.options.queryDate.getDate())).slice(-2);
                    travelOptions.setDate(date);
                    var rawTime = self.options.queryTime;
                    var time = rawTime.h * 3600 + rawTime.m * 60;

                    travelOptions.setTime(time);
                }

                travelOptions.setMinPolygonHoleSize(self.options.travelTime * 3600 * 2000);

                return travelOptions;
            }

            /**
             * Returns the current color range array
             * @return Array
             */
            R360Angular.prototype.getColorRangeArray = function() {
                var self = this;
                return scope.prefs.colorRanges[self.options.colorRange];
            };

            /**
             * Returns the current tt range array
             * @return Array
             */
            R360Angular.prototype.getTravelTimeRangeArray = function() {
                var self = this;
                return scope.prefs.travelTimeRanges[self.options.travelTimeRange];
            };


            R360Angular.prototype.togglePopLayer = function(regions) {

                var self = this;

                if (!self.options.showPopLayer) {
                    self.options.showPopLayer = true;
                    if (angular.isDefined(regions)) {
                        self.layerGroups.populationDensityLayer.setParams({
                            layers: regions
                        });
                    }
                    self.layerGroups.populationDensityLayer.addTo(scope.map);
                    self.options.colorRange = 'inverse';
                } else {
                    self.options.showPopLayer = false;
                    scope.map.removeLayer(self.layerGroups.populationDensityLayer);
                    self.options.colorRange = 'default';
                }

            };

            R360Angular.prototype.getPopData = function(success, customPopulationServiceUrl){

                var self = this;

                var populationServiceUrl = angular.isDefined(customPopulationServiceUrl) ? customPopulationServiceUrl : self.options.populationServiceUrl;

                var url = populationServiceUrl + "?key=" + self.options.serviceKey +"&travelType=" +self.options.travelType+ "&maxRoutingTime=" + self.options.travelTime * 60 + "&statistics=population_total";

                var payload = [];

                self.options.markers.forEach(function(marker) {
                    if (marker.polygons && marker.route == 'source') payload.push({ lat : marker._latlng.lat, lng : marker._latlng.lng, id : marker._latlng.lat + ";" + marker._latlng.lng});
                });

                if (payload.length < 1) {
                    success('nomarkers');
                    return;
                };

                $http({
                 method      : "post",
                 url         : url,
                 data        : payload,
                 contentType : 'application/json',
                 cache       : true
                })
                .success(function(result, status, headers, config){

                    var rawData;
                    var resultData = {
                        nvd3Data : [
                            {
                                key: "Population",
                                values: []
                            }
                        ],
                        max : 0,
                    };

                    rawData = result[0].values;
                    var sum = 0;
                    rawData.forEach(function(dataset,index){

                        if ( index > self.options.travelTime ) return;

                        sum += dataset;
                        resultData.nvd3Data[0].values.push({
                         label: (index == 0) ? "<1" : index,
                         value: sum
                        });

                        resultData.max = sum;
                    });

                    if (angular.isDefined(success)) success(resultData);

                    })
                .error(function(data, status, headers, config){

                 console.log(data);
                 console.log(status);
                 console.log(headers);
                 console.log(config);
                });
            };



            /**
             * Requests and renders traveltime isochrones on the map
             * @param  callback success Callback on success
             * @param  callback error   Callback on error
             */
            R360Angular.prototype.getPolygons = function(success,error) {

                var self = this;

                if (!angular.isDefined(self.layerGroups)) return;

                if (self.options.markers.length === 0) {
                    self.layerGroups.polygonLayerGroup.clearLayers();
                    if (angular.isDefined(success)) success('normarkers');
                }

                var method = self.options.markers.length > 5 ? 'POST' : 'GET';

                if (self.options.colorRange == 'inverse') {
                    self.layerGroups.polygonLayerGroup.setInverse(true);
                } else {
                    self.layerGroups.polygonLayerGroup.setInverse(false);
                }

                var travelOptions = self.getTravelOptions();

                if (travelOptions.getSources().length < 1) {
                    self.layerGroups.polygonLayerGroup.clearLayers();
                    if (angular.isDefined(success)) success('normarkers');
                    return;
                }

                $timeout(function() {
                    r360.PolygonService.getTravelTimePolygons(travelOptions,
                    function(polygons) {
                        self.layerGroups.polygonLayerGroup.clearAndAddLayers(polygons, false);
                        if (angular.isDefined(success)) success();
                    },
                    function(status,message) {
                        if (angular.isDefined(error)) error(status,message);
                    },
                    method
                    );
                });
            };

            /**
             * Requests and renders routes to the map
             * @param  callback success Callback on success
             * @param  callback error   Callback on error
             */
            R360Angular.prototype.getRoutes = function(success,error) {

                var self = this;

                if (!angular.isDefined(self.layerGroups)) return;

                self.layerGroups.routeLayerGroup.clearLayers();

                if (self.options.markers.length === 0) {
                    if (angular.isDefined(success)) success('normarkers');
                    return;
                }

                var travelOptions = self.getTravelOptions();

                $timeout(function() {
                    r360.RouteService.getRoutes(travelOptions, function(routes) {

                        routes.forEach(function(elem, index, array) {
                            r360.LeafletUtil.fadeIn(self.layerGroups.routeLayerGroup, elem, 500, "travelDistance", {
                                color: "red",
                                haloColor: "#fff"
                            });
                        });


                        if (angular.isDefined(success)) success('normarkers');

                    }, function(status,message){
                        if (angular.isDefined(error)) error(status,message);
                    });
                });
            };

            /**
             * Parses the given GET params and writes the values to self.options
             */
            R360Angular.prototype.parseGetParams = function($routeParams) {

                var self = this;

                for(var index in $routeParams) {

                    var value = $routeParams[index];

                    switch (index) {
                        case "cityID" : // lecacy
                        case "travelTime" :
                        case "travelTimeRange" :
                        case "colorRange" :
                        case "mapProvider" :
                        case "maxmarkers" :
                        case "maxTargetMarkers" :
                            self.options[index] = parseInt(value);
                            break;
                        case "areaID" :
                        case "travelType" :
                        case "intersection" :
                            self.options[index] = value;
                            break;
                        case "sources":
                        case "targets":
                            break;
                        default:
                            console.log('Parameter not valid');
                            break;
                    }
                }

                // legacy ID support
                if (angular.isDefined(self.options.cityID) && typeof self.options.cityID === "number") {
                    switch (self.options.cityID) {
                        case 0:
                            self.options.areaID = "berlin";
                            break;
                        case 1:
                            self.options.areaID = "norway";
                            break;
                        case 2:
                            self.options.areaID = "france";
                            break;
                        case 3:
                            self.options.areaID = "canada";
                            break;
                        case 4:
                            self.options.areaID = "denmark";
                            break;
                        case 5:
                            self.options.areaID = "britishisles";
                            break;
                        case 6:
                            self.options.areaID = "switzerland";
                            break;
                        case 7:
                            self.options.areaID = "austria";
                            break;
                        case 8:
                            self.options.areaID = "newyork";
                            break;
                    }
                }
            };

            /**
             * Updates the URL parameters
             */
            R360Angular.prototype.updateURL = function($routeParams) {

                var self = this;

                for (var index in self.options.options) {
                    switch (index) {
                        case 'markers':
                            if (self.options.markers.length === 0)  {
                                $location.search("sources", null);
                                break;
                            }
                            var sources = [];
                            self.options.markers.forEach(function(elem,index,array){
                                sources.push(elem._latlng.lat + "," + elem._latlng.lng);
                            });
                            $location.search("sources", sources.join(";"));
                            break;
                        case 'areaID':
                        case 'travelTime':
                        case 'travelTimeRange':
                        case 'travelType':
                        case 'colorRange':
                        case 'intersection':
                            if (angular.isDefined($routeParams[index]) && $routeParams[index] == self.options[index]) break;
                            $location.search(index, String(self.options[index]));
                            break;
                        default:
                            break;
                    }
                }
            };

            /**
             * Add a new marker to the map.             Returns the created marker
             * @param Object    coords                  latlng Coordinates of the new marker
             * @param bool      polygons                (optional) define if the marker should cause polygons
             * @param String    route                   (optional) define as 'source' or 'target' for routing. Default is source. If target is selecetd no polygons will be displayed.
             * @param L.icon    leafletMarkerOptions    (optional) Leaflet Marker Options
             * @return L.marker The created marker
             */
            R360Angular.prototype.addMarker = function(coords, polygons, route, leafletMarkerOptions) {

                var self = this;

                if (!angular.isDefined(route)) route           = 'source';
                if (!angular.isDefined(polygons)) polygons     = 'true';

                var markerOptions = {
                    icon: L.AwesomeMarkers.icon({ icon: 'fa-circle', prefix : 'fa', markerColor: 'red' }),
                    contextmenu: true,
                    draggable : true,
                    contextmenuItems: [
                    {
                        text: 'Delete Marker',
                        callback: this.removeMarkerFromContext, // TODO
                        index: 3,
                        iconFa: 'fa-fw fa-times'
                    }, {
                        separator: true,
                        index: 2
                    }]
                };

                if (angular.isDefined(leafletMarkerOptions)) {
                    for (var key in leafletMarkerOptions) {
                        markerOptions[key] = leafletMarkerOptions[key];
                    }
                }

                if (typeof coords[0] != 'undefined' || typeof coords[1] != 'undefined')
                    if (typeof coords.lat != 'undefined' || typeof coords.lng != 'undefined')
                        return;

                if (typeof coords.lat != 'undefined' && typeof coords.lng != 'undefined') {
                    coords.lat = parseFloat(coords.lat.toFixed(6));
                    coords.lng = parseFloat(coords.lng.toFixed(6));
                }

                if (typeof coords[0] != 'undefined' && typeof coords[1] != 'undefined') {
                    coords[0] = parseFloat(coords[0].toFixed(6));
                    coords[1] = parseFloat(coords[1].toFixed(6));
                }

                var markerLayerGroup = self.layerGroups.markerLayerGroup;
                var geocode;

                var newMarker = L.marker(coords, markerOptions);

                newMarker.polygons = polygons;
                newMarker.route = route;

                newMarker.addTo(self.layerGroups.markerLayerGroup);
                self.options.markers.push(newMarker);
                return newMarker;
            };

            R360Angular.prototype.removeMarker = function(marker) {

                var self = this;

                self.layerGroups.markerLayerGroup.removeLayer(marker);

                self.options.markers.forEach(function(elem, index, array) {
                    if (elem == marker) {
                        array.splice(index, 1);
                    }
                });

            };

            return R360Angular;

        })();

        return R360Angular;
    }]);


angular.module('ng360')
  .controller('EsriGeocoderCtrl', ['$scope','$timeout','$attrs', '$q', '$http', 'R360Util', function($scope,$timeout,$attrs,$q,$http,R360Util){

    var vm = this;

    function selectedItemChange(item) {

      if(!angular.isDefined(item)) return;

      var url = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?f=json&magicKey=" + item.magicKey + "&text=" + item.text;

      if (angular.isDefined($scope.token)) url += "&forStorage=true&token=" + $scope.token;

      $http({
          method: 'GET',
          url: url
      }).then(function(response) {

          if (angular.isDefined($scope.placeChanged) && angular.isDefined(response) ) $scope.placeChanged({item: response.data.locations[0]});

      }, function(response) {
          console.log(response);
      });
    }

    function suggest(text) {

      var results = [];
      var deferred = $q.defer();

      var url = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&text=" + text;
      if (angular.isDefined($scope.latlng)) {
        var latlng = R360Util.normalizeLatLng($scope.latlng);
        url += "&location=" + latlng.lat + "," + latlng.lng;
      }
      if (angular.isDefined($scope.distance)) url += "&distance=" + $scope.distance;

      $http({
          method: 'GET',
          url: url
      }).then(function(response) {

          if (!angular.isDefined(response.data.suggestions)) deferred.reject('no result');;

          deferred.resolve(response.data.suggestions);

      }, function(response) {
          console.log(response);
      });
      return deferred.promise;
    }

    vm.placeholder        = angular.isDefined($scope.placeholder) ? $scope.placeholder : 'Search...';
    vm.suggest            = suggest;
    vm.selectedItemChange = selectedItemChange;


  }])

/**
 * @ngdoc directive
 * @name r360DemoApp.directive:r360Rainbow
 * @description
 * # r360Rainbow
 */
angular.module('ng360')
  .directive('r360EsriGeocoder', function () {
    return {
      restrict: 'E',
      templateUrl: 'esriGeocoder.tpl',
      controller: 'EsriGeocoderCtrl',
      controllerAs: 'esriGeocoderCtrl',
      scope: {
        selectedPlace: '=',
        placeholder: '@',
        latlng: '=',
        distance: '=',
        placeChanged: '&',
        searchText: '=',
        token: '='
      }
    };
  });

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


angular.module('ng360')
  .controller('GeocoderCtrl', ['$scope','$timeout','$attrs', 'R360Util', function($scope,$timeout,$attrs,R360Util){

    var vm = this;

    function selectedItemChange(item) {
      if (angular.isDefined($scope.placeChanged) && angular.isDefined(item) ) $scope.placeChanged({item: item});
    }

    vm.placeholder        = angular.isDefined($scope.placeholder) ? $scope.placeholder : 'Search...';
    vm.geocode            = R360Util.geocode;
    vm.selectedItemChange = selectedItemChange;
    

  }])

/**
 * @ngdoc directive
 * @name r360DemoApp.directive:r360Rainbow
 * @description
 * # r360Rainbow
 */
angular.module('ng360')
  .directive('r360Geocoder', function () {
    return {
      restrict: 'E',
      templateUrl: 'geocoder.tpl',
      controller: 'GeocoderCtrl',
      controllerAs: 'geocoderCtrl',
      scope: {
        bias: '=',
        selectedPlace: '=',
        placeholder: '@',
        placeChanged: '&',
        searchText: '='
      }
    };
  });

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


angular.module('ng360')
  .controller('MsSwitcherCtrl', ['$scope','CONST', function($scope,CONST){

    var vm = this;
    vm.map = {};
    vm.mapStyles = CONST.prefs.mapStyles;

    $scope.$watch('r360Angular', function(value) {
      if (angular.isDefined($scope.r360Angular) && $scope.r360Angular) {
        vm.mapstyle = value.options.mapstyle;
      }
    });

    vm.change = function() {
      if (angular.isDefined($scope.r360Angular) && $scope.r360Angular) $scope.r360Angular.setTileUrl(vm.mapstyle);
    };

  }]);


angular.module('ng360')
  .directive('mapStyleSwitcher', function() {
    return {
      restrict: 'E',
      scope: {
        r360Angular: '='
      },
      templateUrl: 'mapStyleSwitcher.tpl',
      controllerAs: 'msSwitcherCtrl',
      controller: 'MsSwitcherCtrl'
    };
  });

angular.module('ng360')
  .run(function ($templateCache){

      var tpl = '<md-select style="margin: 0" ng-model="msSwitcherCtrl.mapstyle" aria-label="Map Style Select" ng-change="msSwitcherCtrl.change()"><md-option ng-repeat="style in msSwitcherCtrl.mapStyles" value="{{style.value}}">{{style.name}}</md-option></md-select>';

      $templateCache.put('mapStyleSwitcher.tpl', tpl);
  });

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

angular.module('ng360')
  .run(function ($templateCache){

      var tpl = "<md-whiteframe class='md-whiteframe-z2' flex layout layout-align='center center'>\
          <label ng-repeat='tt in travelTimeRange.times' ng-if='travelTime >= tt && colorRange.colors.length > 1' flex ng-style='{background: colorRange.colors[$index]}'>\
            {{tt}} Min\
          </label>\
          <label ng-if='colorRange.colors.length == 1' flex style='background: {{colorRange.colors[0]}}'>\
            {{travelTime}} Min\
          </label>\
        </md-whiteframe>"

      $templateCache.put('rainbow.tpl', tpl);
  });



angular.module('ng360')
  .controller('TsChartCtrl', ['$scope','$timeout','$attrs', function($scope){

    var vm = this;
    vm.chartApi = {};
    
    $scope.$watch('chartData', function(value) {
      console.log(value);
      if (angular.isDefined($scope.chartData) && $scope.chartData) {
        if (angular.isDefined($scope.chartData.nvd3Data)) vm.data = $scope.chartData.nvd3Data;
      }
    });
    vm.showChart = function(){
      return vm.data[0].values.length > 0 ? true : false;
    };

    vm.data = [{
        key: 'Population',
        values: []
    }];

    vm.options = {
      chart: {
          type: 'discreteBarChart',
          height: 300,
          margin : {
              top: 10,
              right: 10,
              bottom: 40,
              left: 70
          },
          x: function(d){return d.label;},
          y: function(d){return d.value;},
          showValues: false,
          valueFormat: d3.format('.0f'),
          duration: 500,
          xAxis: {
              axisLabel: 'Time in min',
              tickFormat: function(d){
                  if (d % 5 === 0) return d;
              }
          },
          color: function(d,i){
              if ($scope.colorRange.id === 'inverse') return $scope.colorRange.colors[0];
              if (i<=$scope.traveltimeRange.times[0]) return $scope.colorRange.colors[0];
              if (i<=$scope.traveltimeRange.times[1] && i>$scope.traveltimeRange.times[0]) return $scope.colorRange.colors[1];
              if (i<=$scope.traveltimeRange.times[2] && i>$scope.traveltimeRange.times[1]) return $scope.colorRange.colors[2];
              if (i<=$scope.traveltimeRange.times[3] && i>$scope.traveltimeRange.times[2]) return $scope.colorRange.colors[3];
              if (i<=$scope.traveltimeRange.times[4] && i>$scope.traveltimeRange.times[3]) return $scope.colorRange.colors[4];
              if (i<=$scope.traveltimeRange.times[5] && i>$scope.traveltimeRange.times[4]) return $scope.colorRange.colors[5];
          },
          yAxis: {
              axisLabel: 'Reachable people',
              tickFormat: d3.format('s')
          }
      }
    };

  }]);


angular.module('ng360')
  .directive('timeServiceChart', function() {
    return {
      restrict: 'E',
      scope: {
        r360Angular: '=',
        chartData: '=',
        colorRange: '=',
        traveltimeRange: '='
      },
      templateUrl: 'timeServiceChart.tpl',
      controllerAs: 'tsChartCtrl',
      controller: 'TsChartCtrl'
    };
  });

angular.module('ng360')
  .run(function ($templateCache){

      var tpl = '<nvd3 ng-if="tsChartCtrl.data[0].values.length > 0" flex options="tsChartCtrl.options" data="tsChartCtrl.data" api="tsChartCtrl.chartApi"></nvd3><p ng-if="tsChartCtrl.data[0].values.length == 0">No population chart to show.</p>';

      $templateCache.put('timeServiceChart.tpl', tpl);
  });

angular.module('ng360')
  .controller('TravelTimeFabCtrl', ['$scope', function($scope) {
    this.select = function(value) {
      $scope.model = value * 60;
    }

    $scope.$watch('model', function() {
      if ($scope.model && $scope.travelTimeValues) {
        $scope.travelTimeValues = $scope.travelTimeRange.times
                                  .filter(function(time) {return time <= $scope.model / 60})
                                  .map(function(time) {return time * 60});
      }
    })
  }]);

angular.module('ng360')
  .directive('travelTimeFab', function() {
    return {
      restrict: 'E',
      scope: {
        model: '=',
        colorRange: '=',
        travelTimeRange: '=',
        travelTimeValues: '=',
        mdDirection: '@',
        label: '@'
      },
      templateUrl: 'travelTimeFab.tpl',
      controllerAs: 'travelTimeFabCtrl',
      controller: 'TravelTimeFabCtrl'
    };
  });

angular.module('ng360')
  .run(function ($templateCache) {
      var tpl = 
        '<md-fab-speed-dial class="md-fling" md-direction="{{mdDirection || \'left\'}}">' +
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


angular.module('ng360')
  .controller('TravelTypeFabCtrl', ['$scope', '$attrs', function($scope, $attrs) {
    var vm = this;

    vm.travelTypes = $attrs.travelTypes ? $scope.travelTypes : [
      {name: 'Walk',    mode: 'walk',    icon: 'directions_walk'},
      {name: 'Bike',    mode: 'bike',    icon: 'directions_bike'},
      {name: 'Car',     mode: 'car',     icon: 'time_to_leave'},
      {name: 'Transit', mode: 'transit', icon: 'train'}
    ];

    this.select = function(value) {
      $scope.model = value;
    };

    $scope.$watch('travelTimes', function() {
      if ($scope.travelTypes) {
        vm.travelTypes = $scope.travelTypes;
      } 
    });

    $scope.$watch('model', function() {
      for (var i = 0; i < vm.travelTypes.length; i++) {
        if (vm.travelTypes[i].mode == $scope.model) {
          $scope.current = vm.travelTypes[i];
        }
      }
    });
  }]);


angular.module('ng360')
  .directive('travelTypeFab', function() {
    return {
      restrict: 'E',
      scope: {
        model: '=',
        travelTypes: '=',
        mdDirection: '@',
        label: '@'
      },
      templateUrl: 'travelTypeFab.tpl',
      controllerAs: 'travelTypeFabCtrl',
      controller: 'TravelTypeFabCtrl'
    };
  });

angular.module('ng360')
  .run(function ($templateCache) {

      var tpl = 
      '<md-fab-speed-dial class="md-fling" md-direction="{{mdDirection || \'left\'}}">' +
        '<md-fab-trigger>' +
          '<md-button aria-label="{{label}}" class="md-fab">' +
            '<md-icon md-font-set="material-icons">{{current.icon}}</md-icon>' +
            '<md-tooltip md-delay="500">{{label}}</md-tooltip>' +
          '</md-button>' +
        '</md-fab-trigger>' +
        '<md-fab-actions>' +
          '<div ng-repeat="mode in travelTypeFabCtrl.travelTypes">' +
            '<md-button ng-click="travelTypeFabCtrl.select(mode.mode)" aria-label="{{mode.name}}" class="md-fab md-mini">' +
              '<md-icon md-font-set="material-icons">{{mode.icon}}</md-icon>' +
              '<md-tooltip md-delay="500">{{mode.name}}</md-tooltip>' +
            '</md-button>' +
          '</div>' +
        '</md-fab-actions>' +
      '</md-fab-speed-dial>';
      

      $templateCache.put('travelTypeFab.tpl', tpl);
  });

/**
 * Route 360 for Angular
 * https://github.com/route360/r360-angular
 * @license MIT
 * v0.0.1
 */

angular.module('ng360')
    .factory('R360Util', [ '$q','$location','$timeout','$http', function($q,$location,$timeout,$http) {

        var R360Util = {
            buildPlaceDescription : buildPlaceDescription,
            normalizeLatLng : normalizeLatLng,
            geocode : geocode,
            reverseGeocode : reverseGeocode
        }

        return R360Util;

        function buildPlaceDescription(rawResult) {

            var result = {
                title : "",
                meta1 : "",
                meta2 : "",
                full  : ""
            };

            var name, adress1, adress2;

            if (angular.isDefined(rawResult.name)) {
                name = rawResult.name;
            }

            if (angular.isDefined(rawResult.street)) {
                adress1 = rawResult.street;
                if (angular.isDefined(rawResult.housenumber)){
                    adress1 += " " + rawResult.housenumber;
                }
            }

            if (angular.isDefined(rawResult.city)){
                adress2 = rawResult.city;
                if ((angular.isDefined(rawResult.postcode))) {
                    adress2 = rawResult.postcode + " " + adress2;
                }
                if ((angular.isDefined(rawResult.country))) {
                    adress2 += ", " + rawResult.country;
                }
            } else {
                if ((angular.isDefined(rawResult.country))) {
                    adress2 = rawResult.country;
                }
            }

            if (angular.isDefined(name)) {
                result.title = name;
                result.meta1 = adress1;
                result.meta2 = adress2;
            } else {
                result.title = adress1;
                result.meta1 = adress2;
            }

            if (name !== adress1) result.full = result.title;
            if (result.meta1 !== '' && angular.isDefined(result.meta1) && name !== adress1)  result.full += ", " +  result.meta1;
            if (result.meta1 !== '' && angular.isDefined(result.meta1) && name == adress1)  result.full +=  result.meta1;
            if (result.meta2 !== '' && angular.isDefined(result.meta2))  result.full += ", " +  result.meta2;

            return result;
        }

        /**
         * Noormalizes latlng to an object with each 6 decimal steps
         * @param  Object/Array coords coords as array or object
         * @return Object        Coords in the format {lat: xx.xxxxxx, lng: xx.xxxxxx}
         */
        function normalizeLatLng(coords) {

            var result = {
                lat : undefined,
                lng : undefined
            };

            if (typeof coords.lat !== 'undefined' && typeof coords.lng !== 'undefined') {
                result.lat = parseFloat(coords.lat.toFixed(6));
                result.lng = parseFloat(coords.lng.toFixed(6));
            }

            if (typeof coords[0] !== 'undefined' && typeof coords[1] !== 'undefined') {
                result.lat = parseFloat(coords[0].toFixed(6));
                result.lng = parseFloat(coords[1].toFixed(6));
            }
            return result;
        };

        /**
         * Function for geocoding
         * @param  String query  The string to be queried
         * @param  Object coords Latlng coordinates to bias the results
         * @return Promise       Promise returns top 5 matches
         */
        function geocode(query,coords) {

            var results = [];
            var deferred = $q.defer();

            var url = "https://service.route360.net/geocode/api/?q=" + query + "&limit=5";
            if (angular.isDefined(coords)) url += "&lat=" + coords.lat + "&lon=" + coords.lng;

            $http({
                method: 'GET',
                url: url
            }).then(function(response) {

                response.data.features.forEach(function(feature,index,array){
                    if (feature.properties.osm_key == "boundary") array.splice(index,1);
                })

                results = response.data.features.map(function(result) {
                    result.value = result.properties.osm_id;
                    result.description = buildPlaceDescription(result.properties);
                    return result;
                });
                deferred.resolve(results);
            }, function(response) {
                console.log(response);
            });
            return deferred.promise;
        };

        /**
         * Function for reverse geocoding
         * @param  Object coords Latlng coordinates
         * @return Promise       Promise returns the best match
         */
        function reverseGeocode(coords,geojson) {

            var url = "";

            var deferred = $q.defer();

            if (typeof coords.lat != 'undefined' && typeof coords.lng != 'undefined')
                url = "https://service.route360.net/geocode/reverse?lon=" + coords.lng + "&lat=" + coords.lat;

            if (typeof coords[0] != 'undefined' && typeof coords[1] != 'undefined')
                url = "https://service.route360.net/geocode/reverse?lon=" + coords[1] + "&lat=" + coords[0];

            $http({
                method: 'GET',
                url: url
            }).then(function(response) {
                var properties = {};
                if (response.data.features.length > 0) {
                    properties = response.data.features[0].properties;
                    if (typeof properties.name === 'undefined') {
                        properties.name = "";
                        if (typeof properties.street != 'undefined') properties.name += properties.street;
                        if (typeof properties.housenumber != 'undefined') properties.name += " " + properties.housenumber;
                    }
                }
                else {
                    properties = {
                        "name" : "Marker",
                        "city" : "",
                        "country" : ""
                    };
                }
                if (angular.isDefined(geojson) && geojson) deferred.resolve(response.data.features[0]);
                else deferred.resolve(properties);

            }, function(response) {
                console.log(response);
            });

            return deferred.promise;
        };

    }]);
