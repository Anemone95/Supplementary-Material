# get-git-data

[![npm version](https://img.shields.io/npm/v/get-git-data.svg?style=flat)](https://www.npmjs.com/package/get-git-data)

Access git revision state in node.

# API

Each method returns a promise.

``` js
const git = require('get-git-data');

await git.short()
// => aefdd94

await git.long()
// => aefdd946ea65c88f8aa003e46474d57ed5b291d1

await git.branch()
// => master

await git.tag()
// => 0.1.0

await git.log()
// [ { commitHash: 'bd7026f',
//     commitMessage: 'Fixed issue',
//     timestamp: '1548644428000',
//     authorName: 'Richard Tan' },
//   { commitHash: '6515249',
//     commitMessage: 'Refactor',
//     timestamp: '1547908111000',
//     authorName: 'Richard Tan' },
//   { commitHash: '8b2ae44',
//     commitMessage: 'Added new feature',
//     timestamp: '1547897044000',
//     authorName: 'Richard Tan' }]
```

# Install

`npm install get-git-data`

## Credits

Original source code from [https://github.com/tblobaum/git-rev](https://github.com/tblobaum/git-rev).

Bug patch by [Kacper Kula](https://github.com/kulak-at)

# License

(The MIT License)

Copyright (c) 2012 Thomas Blobaum <tblobaum@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
