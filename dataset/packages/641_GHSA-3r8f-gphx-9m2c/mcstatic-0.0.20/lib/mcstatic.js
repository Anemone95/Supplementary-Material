var http = require('http');
var path = require('path');
var request = require('request');
var staticFileHandler = require('./staticFileHandler');
var mcstaticApiHandler = require('./mcstaticApiHandler');

module.exports = {
    _options : {
        root : './',
        port : '8080',
        mockPaths : {},
        getMockPaths : {},
        postMockPaths : {},
        putMockPaths : {},
        deleteMockPaths : {},
        address : 'localhost',
        apiPath : '/__mcstatic__'
    },
    _addedMocks : [],
    options : function(options){
        if(!options)
            options = {};

        for (var key in options)
            this._options[key] = options[key];

        this._options.root = path.join(path.resolve(this._options.root), '/');
        if(options.mockPaths){
            this._options.getMockPaths = options.mockPaths;
            this._options.postMockPaths = options.mockPaths;
            this._options.putMockPaths = options.mockPaths;
            this._options.deleteMockPaths = options.mockPaths;
        }
    },
    createServer : function(options){
        var self = this;
        self.options(options);
        var server = http.createServer(mcstaticApiHandler(self._options,
                                    staticFileHandler(self._options)));

        cloneHttpServer(self,server);

        self.listen = function(port,next){
            self._options.port = port;
            return server.listen(port,next);
        };

        return self;
    },
    whenGET : function(urlPath){
        return this.when('GET',urlPath);
    },
    whenPOST : function(urlPath){
        return this.when('POST',urlPath);
    },
    whenPUT : function(urlPath){
        return this.when('PUT',urlPath);
    },
    whenDELETE : function(urlPath){
        return this.when('DELETE',urlPath);
    },
    whenHEAD : function(urlPath){
        return this.when('HEAD',urlPath);
    },
    whenPATCH : function(urlPath){
        return this.when('PATCH',urlPath);
    },
    when : function(method,urlPath){
        if (!this._hasListener) {
            this._hasListener = true;
            process.addListener('exit', this.flush);
        }

        var uri = 'http://'+this._options.address + ':' + this._options.port+this._options.apiPath+'/'+method;
        this._addedMocks.push({type:method,urlPath:urlPath});

        return {
            respond : function(responseData, onResponse){
                var mockPath = {};
                mockPath[urlPath] = responseData;
                request.post({
                        uri: uri,
                        followRedirect: false,
                        json: mockPath
                    }, onResponse);
            }
        }
    },
    flush : function(){
        var self = this;
        if(!self._addedMocks || !self._options.mockPaths)
            return;

        self._addedMocks.forEach(function(element){
            if(element.type === 'GET')
                removePath(self._options.getMockPaths,element.urlPath);
            if(element.type === 'POST')
                removePath(self._options.postMockPaths,element.urlPath);
            if(element.type === 'PUT')
                removePath(self._options.putMockPaths,element.urlPath);
            if(element.type === 'DELETE')
                removePath(self._options.deleteMockPaths,element.urlPath);
        })
    }
};
var removePath = function(mockPath,urlPath){
    if(mockPath[urlPath])
        delete mockPath[urlPath];
};
var cloneHttpServer = function(obj, server){
    var depratedProperty = 'connections';

    for(var property in server){
        if(server.hasOwnProperty(property) && property !== depratedProperty)
            obj[property] = server[property];
    }
};