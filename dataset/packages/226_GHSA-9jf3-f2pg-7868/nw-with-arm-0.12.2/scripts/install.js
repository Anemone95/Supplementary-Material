var os = require("os");
var path = require("path");
var fs = require("fs");
var semver = require("semver");
var emptydir = require("emptydir");
var Download = require("download");
var findpath = require("./../lib/findpath.js");



// Machine
var platform = os.platform();
var arch = os.arch();


// Version
var buildSDK = false;
var v = semver.parse(require('../package.json').version);
var version = [v.major, v.minor, v.patch].join('.');
if (v.prerelease && typeof v.prerelease[0] === 'string') {
    var prerelease = v.prerelease[0].split('-');
    if (prerelease.length > 1) {
        prerelease = prerelease.slice(0, -1);
    }
    version += '-' + prerelease.join('-');
}
if ( version.slice(-4) === '-sdk' ){
    version = version.slice(0, -4);
    buildSDK = true;
} else if ( version.slice(-3) === 'sdk' ){
    version = version.slice(0, -3);
    buildSDK = true;
}

// Sources & Targets
var url = false;
var armUrl = 'https://github.com/LeonardLaszlo/nw.js-armv7-binaries/raw/master/nwjs-v0.12.2-linux-arm.tar.gz';
var urlBase = 'http://dl.nwjs.io/v';
var targetFolder = path.join(__dirname, './../bin');


switch(platform) {
    case 'win32':
        url = urlBase + version + '/nwjs-' + (buildSDK ? 'sdk-' : '') + 'v' + version + '-win-' + arch +'.zip';
        break;

    case 'darwin':
        url = urlBase + version + '/nwjs-' + (buildSDK ? 'sdk-' : '') + 'v' + version + '-osx-' + arch + '.zip';
        break;

    case 'linux':
        url = urlBase + version + '/nwjs-' + (buildSDK ? 'sdk-' : '') + 'v' + version + '-linux-' + arch + '.tar.gz';

        if(arch == 'arm') {
            url = armUrl;
        }
        break;
}

if(!url) {
    logError('Could not find a compatible version of nw.js to download for your platform.');
}



if(!fs.existsSync(targetFolder)) {
    try {
        fs.mkdirSync(targetFolder);
    } catch(e) {}
} else {
    emptydir.emptyDirsSync(targetFolder);
}

console.log('Downloading ' + url);
var nwjsDownload = new Download({
    extract: true,
    strip: 1,
    mode: '755'})
    .get(url)
    .dest(targetFolder)
    .run(function(error) {
        if(error) {
            logError("Could not download " + url);
        } else {
            console.log("Binary location is " + findpath());
        }
    });


function logError(error) {
    console.error(typeof error === 'string' ? error : error.message);
    process.exit(1);
}

