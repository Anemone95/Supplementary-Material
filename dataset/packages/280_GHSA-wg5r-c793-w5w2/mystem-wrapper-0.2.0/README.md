# mystem-wrapper

The only one clean, simple and performant Yandex `mystem` app wrapper module.

Read about `mystem` [here](https://tech.yandex.ru/mystem/). Shorly, `mystem` does morphological analysis of texts written in Russian language.

## Installation

```bash
npm i mystem-wrapper --save
```

During installation `mystem` app binary file will be downloaded to `bin` folder of `mystem-wrapper`
module's folder (source is [Yandex CDN](https://tech.yandex.ru/mystem/)).
To use custom binary set `MYSTEM_PATH` environment variable.

## Example

```js
var mystem = require('mystem-wrapper')();

mystem
	.analyze('Жили у бабуси два веселых гуся.')
	.then(console.log)
	.catch(console.error)
	.finally(mystem.close);
```

## Usage

Module exposes function which builds wrapper. You can call it without parameters, or provide any string with command line arguments as you would do normally while working with `mystem` from command line. For list of `mystem` command line arguments params please refer to [this page](https://tech.yandex.ru/mystem/doc/usage-examples-docpage/).

Then, wrapper itself has two methods: `analyze(text)` and `close()`, both return promise (in first case promise will be resolved with analysis results).

## License

MIT
