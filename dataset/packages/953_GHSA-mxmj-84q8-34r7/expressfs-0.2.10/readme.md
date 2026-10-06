expressfs
=========

expressfs adds fs routes to your express app like writeFile, readFile, et cetera.

How to Use
----------

#### Server

Start the included app.js:

```
node app.js
```

Or you can extend your existing express app:


```
require('./expressfs.server.js')(app)
```


#### Browser

Include requirements:

```
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script type="text/javascript" src="expressfs.browser.js"></script>
```

Call your methods:

```
expressfs.writeFile('helloWorld.txt', 'hello world', function () {
  expressfs.readFile('helloWorld.txt', function (data) {
    // Prints 'hello world'
    console.log(data)
  })
})

```


v 0.2 - done
------------
- Get basics working
- Add some tests

v 0.4
-----
- Refactor to use a more promisy feel


License
-------
MIT

Author
------
Breck Yunits


