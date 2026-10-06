# grunt-webdriver-qunit [![Build Status](https://travis-ci.org/bulain/grunt-webdriver-qunit.png?branch=master)](https://travis-ci.org/bulain/grunt-webdriver-qunit)

> run qunit with webdriver on grunt

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-webdriver-qunit --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-webdriver-qunit');
```

## The "webdriver_start" task

### Overview
In your project's Gruntfile, add a section named `webdriver_start` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  webdriver_start: {
    options : {
      jar: '<selenium_jar_path>',
      port: '<selenium_port>',
      jvmArgs: '<jvm_args>',
      args: '<java_args>',
      env: '<environment>'
      stdio: '<stdio>'
    }
    },
})
```

### Options

#### options.jar
Type: `String`
Default value: `null`

The path of selenium server standalone jar.

#### options.port
Type: `Integer`
Default value: `4444`

The port of selenium server standalone.

#### options.jvmArgs
Type: `String`
Default value: `null`

The jvm arguments.

#### options.args
Type: `String`
Default value: `null`

The java arguments.

#### options.env
Type: `String`
Default value: `null`

The environment arguments.

#### options.stdio
Type: `String`
Default value: `null`


## The "webdriver_qunit" task

### Overview
In your project's Gruntfile, add a section named `webdriver_qunit` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  webdriver_qunit: {
    options: {
      reportsDir: '<reports_directory>',
      qunitJson: '<qunit_config>',
      baseUrl: '<base_url>',
      seleniumUrl: '<selenium_url>',
    },
    firefox: {
      options: {
        browserNames: '<browser_names>',
      }
    },
  },
})
```
#### options.browserNames
Type: `Array`
Default value: `['phantomjs']`

The browser names, the value is the array of phantomjs, chrome, firefix, ie, safari.

#### options.reportsDir
Type: `String`
Default value: `target/surefire-reports`

The reports directory.

#### options.qunitJson
Type: `String`
Default value: `null`

The configuration file of qunit.

#### options.baseUrl
Type: `String`
Default value: `null`

The base url of tests.

#### options.seleniumUrl
Type: `String`
Default value: `http://localhost:4444/wd/hub`. 
If webdriver_start given, this option ignore, will using the local selenium to testing.
Otherwise, will using the external selenium to testing.

The selenium url.

### Usage Examples

In this example, first start selenium server, then run qunit testing with webdriver. 
Please download chromedriver, phantomjs and IEDriverServer, SafariDriver then put them into PATH.

```js
#Gruntfile.js
grunt.initConfig({
  webdriver_start: {
    options : {
      port: '4444',
    }
  },
  webdriver_qunit: {
    linux: {
      options: {
        browserNames: ['phantomjs', 'chrome', 'firefox', 'ie', 'safari'],
        reportsDir: 'target/surefire-reports',
        qunitJson: '../test/qunit.json',
        baseUrl: 'http://localhost:8000',
      }
    },
  },
  grunt.loadNpmTasks('grunt-webdriver-qunit');
  grunt.registerTask('test', ['webdriver_startup', 'webdriver_qunit']);
})
```

```js
#qunit.json
{
  "baseUrl" : "http://localhost",
  "waitSeconds" : 10,
  "tests" : [{
    "path" : "/test/index.html",
    "waitSeconds" : 20
  }]
}
```

## Contributing
In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
* 2013-10-12 v0.2.5 fix the download selenium bug.
* 2013-10-12 v0.2.4 auto download selenium when install this plugin.
* 2013-09-28 v0.2.3 support selenium grid.
* 2013-09-28 v0.2.2 update selenium default jar path.
* 2013-09-28 v0.2.1 fix document and upgrade plugin.
* 2013-09-28 v0.2.0 add support external selenium.
* 2013-07-05 v0.1.2 fix bug about timeout.
* 2013-07-01 v0.1.1 update report path, make them same with test path.
* 2013-07-01 v0.1.0 first release, test pass on linux and windows.
* 2013-06-29 v0.0.4 initial this project.
