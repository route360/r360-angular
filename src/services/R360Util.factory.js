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
        function geocode(query,coords,lang) {

            var results = [];
            var deferred = $q.defer();

            var url = "https://service.route360.net/geocode/api/?q=" + query + "&limit=5";
            if (angular.isDefined(coords)) url += "&lat=" + coords.lat + "&lon=" + coords.lng;
            if (angular.isDefined(lang)) url += "&lang=" + lang;

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

            if (angular.isDefined(lang)) url += "&lang=" + lang;

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
