/**
@toc
2. load grunt plugins
3. init
4. setup variables
5. grunt.initConfig
6. register grunt tasks

*/

'use strict';

module.exports = function(grunt) {

  /**
  Load grunt plugins
  @toc 2.
  */
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-ng-constant');


  /**
  Function that wraps everything to allow dynamically setting/changing grunt options and config later by grunt task. This init function is called once immediately (for using the default grunt options, config, and setup) and then may be called again AFTER updating grunt (command line) options.
  @toc 3.
  @method init
  */
  function init() {
    /**
    Project configuration.
    @toc 5.
    */
    grunt.initConfig({
      ngconstant: {
        options: {
          name: 'ng360.constants',
          dest: './src/constants.js',
          wrap: '"use strict";\n\n {%= __ngModule %}',
          constants: {
            CONST: {
              serviceKey : 'OOWOFUK3OPHLQTA8H5JD',
              prefs : {
                  travelTypes: [{
                      name: 'Bike',
                      icon: 'md:bike',
                      value: 'bike',
                  }, {
                      name: 'Walk',
                      icon: 'md:walk',
                      value: 'walk',
                  }, {
                      name: 'Car',
                      icon: 'md:car',
                      value: 'car',
                  }, {
                      name: 'Transit',
                      icon: 'md:train',
                      value: 'transit',
                  }],
                  queryTimeRange: {
                      hour: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                      minute: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
                  },
                  intersectionTypes: {
                      union : {
                          name: 'Union',
                          value: 'union'
                      },
                      intersection :  {
                          name: 'Intersection',
                          value: 'intersection'
                      },
                      average : {
                          name: 'Average',
                          value: 'average'
                      },
                  },
                  travelTimeRanges: {
                      '5to30' : {
                          name: '5 Min - 30 Min',
                          id: '5to30',
                          times: [5, 10, 15, 20, 25, 30]
                      },
                      '10to60' : {
                          name: '10 Min - 60 Min',
                          id: '10to60',
                          times: [10, 20, 30, 40, 50, 60]
                      },
                      '20to120' : {
                          name: '20 Min - 120 Min',
                          id: '20to120',
                          times: [20, 40, 60, 80, 100, 120]
                      }
                  },
                  colorRanges: {
                      default : {
                          name: 'Green to Red',
                          id: 'default',
                          colors: ['#006837', '#39B54A', '#8CC63F', '#F7931E', '#F15A24', '#C1272D'],
                          opacities: [1, 1, 1, 1, 1, 1]
                      },
                      colorblind : {
                          name: 'Colorblind',
                          id: 'colorblind',
                          colors: ['#142b66', '#4525AB', '#9527BC', '#CE29A8', '#DF2A5C', '#F0572C'],
                          opacities: [1, 1, 1, 1, 1, 1]
                      },
                      greyscale : {
                          name: 'Greyscale',
                          id: 'greyscale',
                          colors: ['#d2d2d2', '#b2b2b2', '#999999', '#777777', '#555555', '#333333'],
                          opacities: [1, 0.8, 0.6, 0.4, 0.2, 0]
                      },
                      inverse : {
                          name: 'Inverse Mode (B/W)',
                          id: 'inverse',
                          colors: ['#777777'],
                          opacities: [1, 1, 1, 1, 1, 1]
                      }
                  },
                  mapStyles: {
                      light: {
                          name: 'Light',
                          value: 'https://cartodb-basemaps-c.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
                      },
                      dark: {
                          name: 'Dark',
                          value: 'https://cartodb-basemaps-c.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
                      },
                      osm: {
                          name: 'OSM Standard',
                          value: 'http://tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
                      }
                  }
              }
            }
          }
        },
        // Environment targets
        development: {
        },
        production: {
        }
      },

      jshint: {
        options: {
          //force:          true,
          globalstrict:   true,
          //sub:            true,
          multistr:true,
          node: true,
          loopfunc: true,
          browser:        true,
          devel:          true,
          globals: {
            angular : false,
            $       : false,
            moment  : false,
            Pikaday : false,
            module  : false,
            forge   : false,
            r360    : false,
            L       : false
          }
        },
        beforeconcat:   {
          options: {
            force:  false,
            ignores: ['**.min.js']
          },
          files: {
            src: []
          }
        },
        //quick version - will not fail entire grunt process if there are lint errors
        beforeconcatQ:   {
          options: {
            force:  true,
            ignores: ['**.min.js']
          },
          files: {
            src: ['src/**/*.js']
          }
        }
      },
      concat: {
        // options: {
        //   // define a string to put between each file in the concatenated output
        //   separator: ';'
        // },
        dist: {
          // the files to concatenate
          src: ['src/constants.js','src/**/*.js'],
          // the location of the resulting JS file
          dest: 'dist/r360-angular.js'
        }
      },
      uglify: {
        options: {
          mangle: false
        },
        build: {
          files:  {},
          src:    'dist/r360-angular.js',
          dest:   'dist/r360-angular.min.js'
        }
      },
      watch: {
        scripts: {
          files: ['src/**/*.js'],
          tasks: ['ngconstant:production','jshint:beforeconcatQ','concat', 'uglify:build'],
          options: {
            spawn: false,
          },
        },
      },/*,
      karma: {
        unit: {
          configFile: publicPathRelativeRoot+'config/karma.conf.js',
          singleRun: true,
          browsers: ['PhantomJS']
        }
      }*/
    });


    /**
    register/define grunt tasks
    @toc 6.
    */
    // Default task(s).
    grunt.registerTask('default', ['ngconstant:production','jshint:beforeconcatQ','concat', 'uglify:build']);

  }
  init({});   //initialize here for defaults (init may be called again later within a task)

};
