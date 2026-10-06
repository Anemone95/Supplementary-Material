var app = require('../lib/main.js');
var assert = require("assert");
describe('app setting', function () {
    describe('app.baseUrl', function () {
        it('when set baseUrl should be baseUrl', function () {
            var baseUrl = '/';
            app.baseUrl(baseUrl);
            assert.equal(baseUrl, app.settings['basename']);
        })
        it('when not set baseUrl should be /', function () {
            assert.equal('/', app.settings['basename']);
        })
    })
    describe('app.route', function () {
        it('when set url should have url', function () {
            var baseUrl = '/aa';
            app.use(baseUrl, function start() { 
                return 'start';
            });
            assert.equal('start', app.settings['router'][baseUrl]());
        })
    })
})
