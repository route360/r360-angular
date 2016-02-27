/**
 * Route 360 for Angular
 * https://github.com/route360/r360-angular
 * @license MIT
 * v0.0.1
 */

'use strict';

angular.module('ng360', [])
    .factory('r360Angular', [function($scope,$q,$location,$timeout,$http,$routeParams) {

        var now = new Date();
        var hour = now.getHours();
        var minute = (now.getMinutes() + (5 - now.getMinutes() % 5)) % 60;
        if (minute === 0) {
            hour++;
        }
        if (hour === 24) {
            hour = 0;
        }

        //self methods & properties
        var self = {

            serviceKey           : "6RNT8QMSOBQN0KMFXIPD",
            areaID               : "germany",

            travelTime           : 30,
            travelTimeRange      : '5to30',
            travelType           : 'transit',
            queryTime            : { h : hour, m : minute },
            queryDate            : now,
            colorRange           : 'default',
            markers              : [],
            intersection         : 'union',
            strokeWidth          : 20,
            extendWidth          : 500,
            mapstyle             : "https://cartodb-basemaps-c.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
            showSourceMarkers    : true, // TODO needs to be generic
            showTargetMarkers    : false, // TODO needs to be generic
            showSourceIsochrones : false, // TODO needs to be generic
            showTargetIsochrones : false, // TODO needs to be generic
            singleMarkerMode     : true,
            maxSourceMarkers     : 5,
            maxTargetMarkers     : 5,
            customMode           : false,
            newU5                : false,
            endpoint             : 'brandenburg',

            normalizeLatLng      : normalizeLatLng,
            getColorRangeArray   : getColorRangeArray,
            reverseGeocode       : reverseGeocode,
            geocode              : geocode,
            getTravelOptions     : getTravelOptions,
            getPolygons          : getPolygons,
            getRoutes            : getRoutes,
            addMarker            : addMarker,
            parseGetParams       : parseGetParams,
            updateURL            : updateURL
        };

        var prefs = {
            home: {
                latlng: [52.5167, 13.3833]
            },
            endpoints: {
                oldU5: "https://service.route360.net/brandenburg/",
                newU5: "https://service.route360.net/u5/",
            },
            travelTypes: [{
                name: "Bike",
                icon: "md:bike",
                value: "bike",
            }, {
                name: "Walk",
                icon: "md:walk",
                value: "walk",
            }, {
                name: "Car",
                icon: "md:car",
                value: "car",
            }, {
                name: "Transit",
                icon: "md:train",
                value: "transit",
            }],
            queryTimeRange: {
                hour: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                minute: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
            },
            mapProviderList: [{
                name: "OpenStreetMaps",
                value: "osm"
            }, {
                name: "Google Maps",
                value: "google"
            }],
            intersectionTypes: [
                {
                    name: "Union",
                    value: "union"
                }, {
                    name: "Intersection",
                    value: "intersection"
                }, {
                    name: "Average",
                    value: "average"
                },
            ],
            travelTimeRanges: [
                {
                    name: "5 Min - 30 Min",
                    id: '5to30',
                    times: [5, 10, 15, 20, 25, 30]
                }, {
                    name: "10 Min - 60 Min",
                    id: '10to60',
                    times: [10, 20, 30, 40, 50, 60]
                }, {
                    name: "20 Min - 120 Min",
                    id: '20to120',
                    times: [20, 40, 60, 80, 100, 120]
                }
            ],
            colorRanges: [
                {
                    name: "Green to Red",
                    id: 'default',
                    colors: ["#006837", "#39B54A", "#8CC63F", "#F7931E", "#F15A24", "#C1272D"],
                    opacities: [1, 1, 1, 1, 1, 1]
                }, {
                    name: "Colorblind",
                    id: 'colorblind',
                    colors: ["#142b66", "#4525AB", "#9527BC", "#CE29A8", "#DF2A5C", "#F0572C"],
                    opacities: [1, 1, 1, 1, 1, 1]
                }, {
                    name: "Greyscale",
                    id: 'greyscale',
                    colors: ["#d2d2d2", "#b2b2b2", "#999999", "#777777", "#555555", "#333333"],
                    opacities: [1, 0.8, 0.6, 0.4, 0.2, 0]
                }, {
                    name: "Inverse Mode (B/W)",
                    id: 'inverse',
                    colors: ["#777777"],
                    opacities: [1, 1, 1, 1, 1, 1]
                }
            ],
            mapStyles: [
                {
                    name: "Light",
                    value: "https://cartodb-basemaps-c.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
                }, {
                    name: "Dark",
                    value: "https://cartodb-basemaps-c.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
                }, {
                    name: "OSM Standard",
                    value: "http://tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png",
                }
            ]
        };

        r360.config.defaultPolygonLayerOptions.backgroundOpacity = 0.3;
        r360.config.requestTimeout = 10000;
        r360.config.serviceUrl = "https://service.route360.net/" * self.endpoint;
        r360.config.serviceKey = self.serviceKey;
        r360.config.i18n.language = "de";

        var layerGroups, lastRelatedTarget;
        var attribution = "<a href='https://cartodb.com/' target='_blank'>© CartoDB</a> | <a href='https://www.openstreetmaps.com/' target='_blank'>© OpenStreetMap</a> | © Transit Data <a href='https://ruter.no' target='_blank'>Ruter</a>, <a href='https://www.kolumbus.no/en/' target='_blank'>Kolumbus</a> | developed by <a href='https://www.route360.net/?lang=en' target='_blank'>Motion Intelligence</a>";

        function init(map) {
            layerGroups = {
                tileLayer: L.tileLayer(self.mapstyle, {maxZoom: 18,attribution: attribution}).addTo(map),
                // populationDensityLayer: L.tileLayer.wms("https://service.route360.net/geoserver/wms?service=WMS&TILED=true", {
                //     layers: 'bevoelkerungsdichte_berlin_brandenburg:brandenburg_pop_density',
                //     format: 'image/png',
                //     transparent: true,
                //     opacity: 0.0
                // }).addTo(map),
                markerLayerGroup: L.featureGroup().addTo(map),
                routeLayerGroup: L.featureGroup().addTo(map),
                reachableLayerGroup: L.featureGroup().addTo(map),
                tempLayerGroup: L.featureGroup().addTo(map),
                polygonLayerGroup: r360.leafletPolygonLayer({extendWidthX: self.extendWidth, extendWidthY: self.extendWidth}).addTo(map)
            };
            map.on("contextmenu.show", function(e) {
                lastRelatedTarget = e.relatedTarget;
            });
        }

        /**
         * Returns the current color range array
         * @return Array
         */
        function getColorRangeArray() {
            return prefs.colorRanges[self.colorRange];
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

            if (typeof coords.lat != 'undefined' && typeof coords.lng != 'undefined') {
                result.lat = parseFloat(coords.lat.toFixed(6));
                result.lng = parseFloat(coords.lng.toFixed(6));
            }

            if (typeof coords[0] != 'undefined' && typeof coords[1] != 'undefined') {
                result.lat = parseFloat(coords[0].toFixed(6));
                result.lng = parseFloat(coords[1].toFixed(6));
            }
            return coords;
        }

        /**
         * Function for geocoding
         * @param  String query  The string to be queried
         * @param  Object coords Latlng coordinates to bias the results
         * @return Promise       Promise returns top 5 matches
         */
        function geocode(query,coords) {

            var results = [];
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: "https://service.route360.net/geocode/api/?q=" + query + "&lat=" + coords.lat + "&lon=" + coords.lng + "&limit=5"
            }).then(function(response) {
                results = response.data.features.map(function(result) {
                    result.value = result.properties.osm_id;
                    result.description = buildPlaceDescription(result.properties);
                    console.log(result.description);
                    return result;
                });
                deferred.resolve(results);
            }, function(response) {
                console.log(response);
            });
            return deferred.promise;
        }

        /**
         * Function for reverse geocoding
         * @param  Object coords Latlng coordinates
         * @return Promise       Promise returns the best match
         */
        function reverseGeocode(coords) {

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
                deferred.resolve(properties);
            }, function(response) {
                console.log(response);
            });

            return deferred.promise;
        }

        /**
         * Builds r360 traveloptions. For intenal use only
         * @return r360.travelOptions
         */
        function getTravelOptions() {

            var travelOptions = r360.travelOptions();

            var travelTime = self.travelTime * 60;
            var travelTimes=[];
            var defaultColors =[];

            prefs.travelTimeRanges[self.travelTimeRange].times.forEach(function(elem, index, array) {
                var dataSet = {};
                dataSet.time  = elem*60;
                dataSet.color = prefs.colorRanges[self.colorRange].colors[index];
                dataSet.opacity = prefs.colorRanges[self.colorRange].opacities[index];
                defaultColors.push(dataSet);
            });

            r360.config.defaultTravelTimeControlOptions.travelTimes = defaultColors;

            if (self.colorRange == 'inverse') {
                travelTimes.push(travelTime);
            } else {
                defaultColors.forEach(function(elem, index, array) {
                    if (elem.time <= travelTime) {
                        travelTimes.push(elem.time);
                    }
                });
            }

            travelOptions.setTravelTimes(travelTimes);

            travelOptions.setTravelType(self.travelType);

            // Query for source markers


            self.markers.forEach(function(marker) {
                if (marker.polygons && marker.route == 'source') travelOptions.addSource(marker);
                if (marker.route == 'target') travelOptions.addTarget(marker);
                // elem.id=Math.random()*100000; // Prevent cache hack
            });

            travelOptions.extendWidthX = self.extendWidth * 2;
            travelOptions.extendWidthY = self.extendWidth * 2;

            travelOptions.setIntersectionMode(self.intersection);

            if (self.travelType == 'transit') {

                var date = String(self.queryDate.getFullYear()) + ('0' + String(self.queryDate.getMonth())).slice(-2) + ('0' + String(self.queryDate.getDate())).slice(-2);
                travelOptions.setDate(date);
                var rawTime = self.queryTime;
                var time = rawTime.h * 3600 + rawTime.m * 60;

                travelOptions.setTime(time);
            }

            travelOptions.setMinPolygonHoleSize(self.travelTime * 3600 * 2000);

            return travelOptions;
        }

        /**
         * Requests and renders traveltime isochrones on the map
         * @param  callback success Callback on success
         * @param  callback error   Callback on error
         */
        function getPolygons(success,error) {

            if (!angular.isDefined(layerGroups)) return;

            if (self.sourceMarkers.length === 0) {
                layerGroups.polygonLayerGroup.clearLayers();
                // vm.chart.data[0].values=[];  // ???
                if (angular.isDefined(success)) success('normarkers');
            }

            if (self.colorRange == 'inverse') {
                layerGroups.polygonLayerGroup.setInverse(true);
            } else {
                layerGroups.polygonLayerGroup.setInverse(false);
            }

            var travelOptions = getTravelOptions();

            if (travelOptions.getSources().length < 1) {
                if (angular.isDefined(success)) success('normarkers');
                return;
            }

            $timeout(function() {
                r360.PolygonService.getTravelTimePolygons(travelOptions,
                function(polygons) {
                    $scope.$apply(function() {
                        layerGroups.polygonLayerGroup.clearAndAddLayers(polygons, false);
                    });
                    if (angular.isDefined(success)) success();
                },
                function(status,message) {
                    if (angular.isDefined(error)) error(status,message);
                },
                'GET'
                );
            });
        }

        /**
         * Requests and renders routes to the map
         * @param  callback success Callback on success
         * @param  callback error   Callback on error
         */
        function getRoutes(success,error) {

            if (!angular.isDefined(layerGroups)) return;

            layerGroups.routeLayerGroup.clearLayers();

            if (self.targetMarkers.length === 0 || self.sourceMarkers.length === 0) {
                if (angular.isDefined(success)) success('normarkers');
                return;
            }

            var travelOptions = getTravelOptions();

            $timeout(function() {
                r360.RouteService.getRoutes(travelOptions, function(routes) {

                    routes.forEach(function(elem, index, array) {
                        r360.LeafletUtil.fadeIn(layerGroups.routeLayerGroup, elem, 500, "travelDistance", {
                            color: "red",
                            haloColor: "#fff"
                        });
                    });
                    if (!$scope.$$phase) $scope.$apply();

                    if (angular.isDefined(success)) success('normarkers');

                }, function(status,message){
                    if (angular.isDefined(error)) error(status,message);
                });
            });
        }

        /**
         * Parses the given GET params and writes the values to self
         */
        function parseGetParams() {

            for(var index in $routeParams) {

                var value = $routeParams[index];

                switch (index) {
                    case "cityID" : // lecacy
                    case "travelTime" :
                    case "travelTimeRange" :
                    case "colorRange" :
                    case "mapProvider" :
                    case "maxSourceMarkers" :
                    case "maxTargetMarkers" :
                        self[index] = parseInt(value);
                        break;
                    case "areaID" :
                    case "travelType" :
                    case "intersection" :
                        self[index] = value;
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
            if (angular.isDefined(self.cityID) && typeof self.cityID === "number") {
                switch (self.cityID) {
                    case 0:
                        self.areaID = "berlin";
                        break;
                    case 1:
                        self.areaID = "norway";
                        break;
                    case 2:
                        self.areaID = "france";
                        break;
                    case 3:
                        self.areaID = "canada";
                        break;
                    case 4:
                        self.areaID = "denmark";
                        break;
                    case 5:
                        self.areaID = "britishisles";
                        break;
                    case 6:
                        self.areaID = "switzerland";
                        break;
                    case 7:
                        self.areaID = "austria";
                        break;
                    case 8:
                        self.areaID = "newyork";
                        break;
                }
            }
        }

        /**
         * Updates the URL parameters
         */
        function updateURL() {

            for (var index in self.options) {
                switch (index) {
                    case 'markers':
                        if (self.sourceMarkers.length === 0)  {
                            $location.search("sources", null);
                            break;
                        }
                        var sources = [];
                        self.sourceMarkers.forEach(function(elem,index,array){
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
                        if (angular.isDefined($routeParams[index]) && $routeParams[index] == self[index]) break;
                        $location.search(index, String(self[index]));
                        break;
                    default:
                        break;
                }
            }
        }

        /**
         * Add a new marker to the map. Returns the created marker
         * @param Object    coords      latlng Coordinates of the new marker
         * @param bool      polygons    (optional) define if the marker should cause polygons
         * @param L.icon    markerIcon  (optional) Leaflet icon of the new marker
         * @param String    route       (optional) define as 'source' or 'target' for routing. Default is source. If target is selecetd no polygons will be displayed.
         * @return L.marker The created marker
         */
        function addMarker(coords, polygons, markerIcon, route) {

            if (!angular.isDefined(markerIcon)) markerIcon = L.AwesomeMarkers.icon({ icon: 'fa-circle', prefix : 'fa', markerColor: 'red' });
            if (!angular.isDefined(route)) route           = 'source';
            if (!angular.isDefined(polygons)) polygons     = 'true';

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

            var markerLayerGroup = layerGroups.markerLayerGroup;
            var geocode;

            var newMarker = L.marker(coords, {
                icon: markerIcon,
                contextmenu: true,
                draggable : true,
                contextmenuItems: [
                {
                    text: 'Delete Marker',
                    callback: removeMarkerFromContext, // TODO
                    index: 3,
                    iconFa: 'fa-fw fa-times'
                }, {
                    separator: true,
                    index: 2
                }]
            });

            newMarker.polygons = polygons;
            newMarker.route = route;

            newMarker.addTo(layerGroups.markerLayerGroup);
            self.markers.push(newMarker);
            return newMarker;
        }

        function removeMarker(marker) {

            layerGroups.markerLayerGroup.removeLayer(marker);

            self.markers.forEach(function(elem, index, array) {
                if (elem == marker) {
                    array.splice(index, 1);
                }
            });

            getPolygons();

        }

        function removeMarkerFromContext(e) {
            removeMarker(lastRelatedTarget);
        }

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

        return self;
    }]);
