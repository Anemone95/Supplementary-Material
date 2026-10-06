var fs = require('fs');
var path = require('path');
var assert = require('assert');
var temp = require('temp').track();
var package = require('../package.json');
var httpHelpers = require('./httpHelpers');

module.exports = function(options, nextHandler) {
    assert(options.root,'A root must be defined');
    assert(options.apiPath,'An apiPath must be defined');
    assert(options.getMockPaths,'A get mock path object must be defined');
    assert(options.putMockPaths,'A put mock path object must be defined');
    assert(options.postMockPaths,'A post mock path object must be defined');
    assert(options.deleteMockPaths,'A delete mock path object must be defined');

    return function(req, res){
        var requestPath = httpHelpers.getRequestPathFromUrl(req.url);

        if(requestPath.indexOf(options.apiPath) < 0)
            return nextHandler(req, res);

        var route = requestPath.replace(options.apiPath+'/','');

        if(route === 'version'){
            res.setHeader('content-type', 'application/json');
            res.write(JSON.stringify({name:package.name,version:package.version}))
            return res.end();
        }

        if(req.method === 'POST' ||  req.method === 'PUT'){
            var requestData = '';
            req.on('data', function(data) {
                requestData += data;
            });
            req.on('end',function(){
                var mockRequest = JSON.parse(requestData);
                for(var mock in mockRequest){
                    var filePath = createTempMockData(mockRequest[mock]);
                    var relativePath = path.relative(options.root,filePath);

                    if(route === 'GET')
                        options.getMockPaths[mock] = relativePath;
                    if(route === 'POST')
                        options.postMockPaths[mock] = relativePath;
                    if(route === 'PUT')
                        options.putMockPaths[mock] = relativePath;
                    if(route === 'DELETE')
                        options.deleteMockPaths[mock] = relativePath;

                    res.end();
                }
            });
            return;
        }
    };
};

var createTempMockData = function(mockData){
    var info = temp.openSync({suffix: ".json"});
    fs.writeSync(info.fd, JSON.stringify(mockData));
    fs.closeSync(info.fd);
    return info.path;
};