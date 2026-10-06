This package only work for Linux having network-manager cli. This is intended for working with 
ethernet and wifi interfaces hence method which return other interfaces are filtered out.

## Get Devices List
The following command  gives the list of Ethernet and wifi interfaces along with status data.
```javascript
var manager = require('network-manager');
var out = manager.getDevices();
```
```javascript
[ { toString: [Function],
    type: 'ethernet',
    device: 'enp2s0',
    state: 'connected',
    connection: 'Ethernet' },
  { toString: [Function],
    type: 'wifi',
    device: 'wlp3s0b1',
    state: 'connected',
    connection: 'Renjith P' } ]
```