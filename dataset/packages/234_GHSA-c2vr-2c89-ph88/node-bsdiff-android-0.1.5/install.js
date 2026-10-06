var http = require('http');
var fs = require('fs');
var os = require('os');

var platform = null;
if (os.type() == 'Darwin') {
    platform = 'macosx';
} else if (os.type() == 'Linux') {
    platform = 'linux';
} else {
    throw new Error('Unknown OS!');
}

function attemptDownload(attemptsLeft) {
    var url = "http://download.cvte.cn/downfile.php?action=view&file_id=42254&file_key=Iel8FprG";

    var file = fs.createWriteStream("bsdiff");
    http.get(url, function(res) {
//        response.pipe(file);
//        response.on('end', function () {
//            exec("unzip -j -o " + tempFile + " platform-tools/aapt -d tools/", function (err) {
//                if (err) {
//                    if (attemptsLeft === 0) {
//                        throw err;
//                    } else {
//                        attemptDownload(attemptsLeft - 1);
//                        return;
//                    }
//                }
//                fs.chmodSync('tools/aapt', '755');
//                fs.unlinkSync(tempFile);
//                process.exit();
//            });
//        });
      res.on('data', function(data) {
        file.write(data);
      }).on('end', function() {
        file.end();
        fs.chmodSync('bsdiff', '755');
      });
    });
}

attemptDownload(3);
