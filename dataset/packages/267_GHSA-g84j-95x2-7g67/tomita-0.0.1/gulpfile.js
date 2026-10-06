var spawn = require("child_process").spawn;
var gulp = require("gulp");
var download = require("gulp-download");
var shell = require("gulp-shell");

var dist = {
	"darwin": "http://download.cdn.yandex.net/tomita/tomita-mac.bz2",
	"freebsd": "http://download.cdn.yandex.net/tomita/tomita-win32.zip",
	"linux-ia32": "http://download.cdn.yandex.net/tomita/tomita-linux32.bz2",
	"linux-x64": "http://download.cdn.yandex.net/tomita/tomita-linux64.bz2",
	"win32": "http://download.cdn.yandex.net/tomita/tomita-freebsd64.bz2",
}
var platform = process.platform;
if(platform == "linux") platform += "-" + process.arch;
const DIST = dist[platform];

gulp.task("download", function () {
	download(DIST)
		// .pipe(shell("bzip2"))
		.pipe(gulp.dest("bin/"));
});

function unpackOnMac(){
	spawn("bzip2", ["-d bin/tomita-mac.bz2"]);
}