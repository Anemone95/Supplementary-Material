# wixtoolset

Node module wrappers around the wixtoolset binaries

## Example

```
var wix = require('wixtoolset');
wix.candle('app.wxs', {output: 'build'})
	.then(function(wixobj) {
		return wix.light(app.wixobj)
	});
```

## Requirements

On platforms other then Windows you will need to have [Wine](http://winehq.org) installed and in the system path.

## Docs
All WIX tools are available off of the wix object. 
All commandline arguments map to opts object.

For example:
wix.candle(wxsFile, [wxsFile, ...], opts);
wix.light(objectFile, [objectFile, ...], opts)