![100% test coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)

# port-killer
> Kills the process running on a given port (assuming you have permission to do so)

Command line convenience utility to kill a process running on the provided port.
There are plenty of alternative (and likely superior) modules to achieve this.
This one was written for a specific use-case.


## Installation
Install via npm:

```sh
$ npm i -g port-killer
```


## Usage
As a module:

```js
const portkill = require('port-killer');
const results = portkill(8080);

console.log(results);

// returns an object with two properties
{
  // String of output providing pid if applicable
  message: 'Killed process(es) 6907',
  // Boolean indicating success or failure
  error: false
}
```

As a command line utility:

```shell
$ portkill 9945
Killed process(es) 6907
```
