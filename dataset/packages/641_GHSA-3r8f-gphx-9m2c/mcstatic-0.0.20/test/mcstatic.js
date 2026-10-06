var http = require('http');
var assert = require('assert');
var request = require('./request');
var cases = require('./common-cases');
var mcstatic = require('../index.js');
var package = require('../package.json');

var filenames = Object.keys(cases);

describe('When using mcstatic server',function(){
    var options = {
        root : './test/public'
    };
    var port = 8080;
    var server ={};
    var baseUrl = 'http://localhost:' + port;

    beforeEach(function(done){
        server = mcstatic.createServer(options)
                    .listen(port, function () {
                        done();
                    });
    })

    afterEach(function(done){
        server.close(function(){
            done();
        })
    })

    describe('When getting mcstatic version',function(){
        var body = null;
        var error = null;
        var response = null;
        beforeEach(function(done){
            var requestOptions = {
                server : server,
                uri : baseUrl + '/__mcstatic__/version',
                port : port,
                headers : {}
            };
            request.getRequest(requestOptions,function(err,res,responseBody){
                error = err;
                response = res;
                body = JSON.parse(responseBody);
                done();
            });
        });
        it('Should return version',function(){
            assert(body.version === package.version);
        })
    });

    describe('When dynamically creating mock data',function(){
        var testData = {'/api/some/path':{'item1':1}};
        beforeEach(function(done){
            var requestOptions = {
                server : server,
                uri : baseUrl + '/__mcstatic__/GET',
                port : port,
                headers : {},
                json: testData
            };
            request.postRequest(requestOptions,function(err,res,responseBody){
                done();
            });
        });
        it('Should return version',function(done){
            var requestOptions = {
                server : server,
                uri : baseUrl + '/api/some/path',
                port : port,
                headers : {}
            };
            request.getRequest(requestOptions,function(err,res,responseBody){
                var body = JSON.parse(responseBody);
                assert(body.item1 === 1)
                done();
            });
        });
    });

    describe('When mocking a get request',function(){
        var testData = {'item1':1};
        beforeEach(function(){
            mcstatic.whenGET('/api/some/path').respond(testData);
        });
        afterEach(function(){
            mcstatic.flush();
        });
        it('Should return version',function(done){
            var requestOptions = {
                server : server,
                uri : baseUrl + '/api/some/path',
                port : port,
                headers : {}
            };
            request.getRequest(requestOptions,function(err,res,responseBody){
                var body = JSON.parse(responseBody);
                assert(body.item1 === testData.item1)
                done();
            });
        });
    });
    describe('When making a GET request',function(){
        var body = null;
        var error = null;
        var response = null;
        var file = filenames[1];
        var expected = cases[file];

        beforeEach(function(done){
            var requestOptions = {
                server : server,
                uri : baseUrl + '/' +file,
                port : port,
                headers : cases[file].headers || {}
            };
            request.getRequest(requestOptions,function(err,res,responseBody){
                error = err;
                response = res;
                body = responseBody.replace(/\s/g,'');
                expected.body=expected.body.replace(/\s/g,'');
                done();
            })
        });

        afterEach(function(){
            body = null;
            error = null;
            response = null;
        });

        it('Should have correct status code',function(){

            assert(expected.statusCode === response.statusCode)
        });
        it('Should have the expected body',function(){
            assert(body === expected.body);
        });
        it('Should have the expected header location',function(){
            assert(expected.headers.location === response.headers.location);
        });
        it('Should have the expected content type',function(){
            assert(expected.headers['content-type'] === response.headers['content-type']);
        });
    })
});