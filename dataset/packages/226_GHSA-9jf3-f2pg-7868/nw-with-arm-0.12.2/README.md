# nw-with-arm

Download and install nw for osx, windows and linux (including an running ARM version)

## Install
Just set the version for this package to the same as NW.js and start `npm install`. When 
the system is ARM based the 0.12.2 package will be downloaded.

```json
{
    "dependencies": {
        "nw-with-arm": "0.14.0"
    }
}
```

## Get bin path
 ```js
 var findpath = require('nw-with-arm').findpath;
 var nwpath = findpath();
 ```
 
 

