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
