var fs = require('fs');
var path = require('path');

module.exports = {
  'a.txt' : {
    statusCode : 200,
    headers : {
      'content-type' : 'text/plain; charset=UTF-8',
    },
    body : 'A!!!\n',
  },
  'b.txt' : {
    statusCode : 200,
    headers : {
      'content-type' : 'text/plain',
    },
    body : 'B!!!\n',
  },
  'c.js' : {
    statusCode : 200,
    headers : {
      'content-type' : 'application/javascript',
    },
    body : 'console.log(\'C!!!\');\n',
  },
  'd.js' : {
    statusCode : 200,
    headers : {
      'content-type' : 'application/javascript',
    },
    body : 'console.log(\'C!!!\');\n',
  },
  'e.js' : {
    statusCode : 200,
    headers : {
      'content-type' : 'application/javascript',
    },
    body : 'console.log(\'π!!!\');\n',
  },
  'subdir/e.html' : {
    statusCode : 200,
    headers : {
      'content-type' : 'text/html',
    },
    body : '<b>e!!</b>\n',
  },
  // test for defaultExt
  'subdir/e?foo=bar' : {
    statusCode : 200,
    headers : {
      'content-type' : 'text/html',
    },
    body : '<b>e!!</b>\n',
  },
  // test for defaultExt with noisy query param
  'subdir/e?foo=bar.ext' : {
    statusCode : 200,
    headers : {
      'content-type' : 'text/html',
    },
    body : '<b>e!!</b>\n',
  },
  'subdir/index.html' : {
    statusCode : 200,
    headers : {
      'content-type' : 'text/html',
    },
    body : 'index!!!\n',
  },
  'subdir' : {
    statusCode : 302,
    location: 'subdir/'
  },
  'subdir?foo=bar': {
    statusCode: 302,
    location: 'subdir/?foo=bar'
  },
  // test for url-enstatusCoded paths
  '%E4%B8%AD%E6%96%87' : {  // '/中文'
    statusCode : 302,
    location: '%E4%B8%AD%E6%96%87/'
  },
  '%E4%B8%AD%E6%96%87?%E5%A4%AB=%E5%B7%B4': {  // '中文?夫=巴'
    statusCode: 302,
    location: '%E4%B8%AD%E6%96%87/?%E5%A4%AB=%E5%B7%B4'
  },
  'subdir/' : {
    statusCode : 200,
    headers : {
      'content-type' : 'text/html',
    },
    body : 'index!!!\n'
  },
  '404' : {
    statusCode : 200,
    headers : {
      'content-type' : 'text/html',
    },
    body : '<h1>404</h1>\n'
  },
  'something-non-existant' : {
    statusCode : 200,
    headers : {
      'content-type' : 'text/html',
    },
    body : '<h1>404</h1>\n'
  },
  'compress/foo.js' : {
    statusCode : 200,
    file: 'compress/foo.js.gz',
    headers: {'accept-encoding': 'compress, gzip'},
    body: fs.readFileSync(path.join(__dirname, 'public', 'compress', 'foo.js.gz'), 'utf8')
  },
  // no accept-encoding of gzip, so serve regular file
  'compress/foo_2.js' : {
    statusCode : 200,
    file: 'compress/foo_2.js'
  },
  'emptyDir/': {
    statusCode: 200
  },
  'subdir_with space' : {
    statusCode: 302,
    location: 'subdir_with%20space/'
  },
  'subdir_with space/index.html' : {
    statusCode: 200,
    headers : {
      'content-type': 'text/html',
    },
    body: 'index :)\n'
  },
  'something-non-existant%00.png': {
    statusCode: 200,
    headers : {
      'content-type': 'text/html',
    },
    body: '<h1>404</h1>\n'
  },
  'containsSymlink/': {
    statusCode: 200
  }
};

if (require.main === module) {
  console.log("ok 1 - test cases included");
}
