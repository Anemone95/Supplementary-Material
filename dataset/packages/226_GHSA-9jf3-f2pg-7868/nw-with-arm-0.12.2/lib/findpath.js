var fs = require('fs');
var os = require('os');
var path = require('path');

var binDir = path.join(__dirname, './../bin');

module.exports = function() {
    var binPath = '';
    var platform = os.platform();

    switch(platform) {
        case 'win32':
            binPath = path.join(binDir, './nw.exe');
            break;

        case 'darwin':
            binPath = path.join(binDir, './nwjs.app/Contents/MacOS/nwjs');
            break;

        case 'linux':
            binPath = path.join(binDir, './nw');
            break;
    }
    return binPath;
};