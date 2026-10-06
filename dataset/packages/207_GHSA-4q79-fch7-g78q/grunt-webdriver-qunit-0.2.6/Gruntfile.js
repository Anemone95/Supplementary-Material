/*
 * grunt-webdriver-qunit
 * https://github.com/bulain/grunt-webdriver-qunit
 *
 * Copyright (c) 2013 Bulain Peng
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      target: ['target'],
    },
    
    'curl-dir': {
      long:{
        src: [
          'http://selenium.googlecode.com/files/selenium-server-standalone-2.39.0.jar'
        ],
        dest: './bin/'
      }
    },
    
    connect : {
      server : {
        options : {
          port : '8000',
          base : 'test'
        }
      }
    },
    
    webdriver_startup: {
      options : {
        port: '4444',
      }
    },

    // Configuration to be run (and then tested).
    webdriver_qunit: {
      options: {
        baseUrl: 'http://localhost:8000',
        qunitJson: '../test/qunit.json',
        reportsDir: 'target/surefire-reports',
      },
      phantomjs: {
        options: {
          browserNames: ['phantomjs'],
        }
      },
      travis: {
        options: {
          browserNames: ['phantomjs', 'firefox'],
        }
      },
      linux: {
        options: {
          browserNames: ['phantomjs', 'chrome', 'firefox'],
        }
      },
      windows: {
        options: {
          browserNames: ['phantomjs', 'chrome', 'firefox', 'ie', 'safari'],
        }
      },
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-curl');

  // Define different tasks for linux and windows
  grunt.registerTask('linux', ['jshint', 'clean', 'connect', 'webdriver_startup', 'webdriver_qunit:linux']);
  grunt.registerTask('windows', ['jshint', 'clean', 'connect', 'webdriver_startup', 'webdriver_qunit:windows']);

  // By default, lint and run travis.
  grunt.registerTask('test', ['jshint', 'clean', 'connect', 'webdriver_startup', 'webdriver_qunit:travis']);
  grunt.registerTask('default', ['test']);

};
