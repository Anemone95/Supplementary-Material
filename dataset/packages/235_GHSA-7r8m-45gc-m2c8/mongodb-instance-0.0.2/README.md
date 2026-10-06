# mongodb-instance

Downloads and installs mongodb relative to the package, intended for testing purposes.

## installation

   npm install mongodb-instance

## Example

```js
'use strict';

var mongod = require('mongodb-instance'),
    path   = require('path'),
    MongoClient = require('mongodb').MongoClient;

var port = 27000;
var instance = mongod.start({
  port: port,
  dbpath: path.join(__dirname, 'db')
});

setTimeout(function () {
  MongoClient.connect('mongodb://localhost:' + port, function (err, db) {
    if (err) {
      console.error(err);
    } else {
      console.log('Connected to db: ' + db.databaseName);
      db.close();
    }
    
    setTimeout(instance.stop.bind(instance), 1000);
  });
}, 1000);
```

## Known issues

- Only tested on a mac
- Suffers from racing conditions when starting up (use setTimeout for now)
- Do not install globally (`-g`)
