// -----------------------------------------
// Header for single file build 
// -----------------------------------------

var util = require('util'),
    http = require('http'),
    url = require('url'),
    fs = require('fs'),
    path = require('path'),
    events = require('events'),
    querystring = require('querystring'),
    child_process = require('child_process'),
    mersenne = require('mersenne'),
    _ = require('underscore'),
    LOG = require('nlogger').logger('nodeload');

var EventEmitter = events.EventEmitter;

var START = new Date();
var BUILD_AS_SINGLE_FILE = true;
