# Tomita
[![NPM](https://nodei.co/npm/tomita.png)](https://nodei.co/npm/tomita/)

Tomita is a wrapper for [Yandex](http://yandex.ru) [Tomita Parser](http://api.yandex.ru/tomita/) tool

Tomita Parser is a tool for extracting structured data (facts) from text in natural language.

## Requirements
- 		[Tomita Parser binary](http://api.yandex.ru/tomita/download.xml)
## Installation

    npm install tomita

## Documentation
[Yandex documentation](http://api.yandex.ru/tomita/doc/tutorial/concept/about.xml)

## Usage:
```js
var tomita = require("tomita");
tomita("path_to_binary")
	.src("input.txt")
	.dict("dict.gzt")
	.run(function(output){
		console.log(output);
	});
```
## Test

	npm test

## License

### Module
Licensed under the [MIT license](http://creativecommons.org/licenses/MIT/)

Copyright &copy; 2014 Roman Timashev <roman@tmshv.ru> (http://roman.tmshv.ru)

### Tomita Parser
[License](http://legal.yandex.ru/tomita/)
© 2012 ООО «ЯНДЕКС»