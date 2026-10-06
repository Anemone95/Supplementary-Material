# UpMerge
*JavaScript Object Merge and Clone for Client or Server side*

## Installation

Server side, via [npm](https://www.npmjs.com):

`npm install upmerge --save`

Client side, via [bower](http://bower.io):

`bower install upmerge --save`

Then include it in your HTML document:

```html
<script src="/bower_components/UpMerge/build/upmerge.js"></script>
```

If you do not use `bower` or `npm` you can just download `build/upmerge.js` file from this repository and include it in your project.

## Usage

Let's assume that you have two objects

```JavaScript
var obj1 = {
	a: 'Hi',
	b: 'World',
	c: {
		a: 'Alpha',
		b: 'Beta'
	}
};

var obj2 = {
	a: 'Hello',
	c: {
		g: 'Gamma',
		d: 'Delta'
	},
	d: 'Wow'
};
```

You merge them with function `merge()`, using set of options.

The values shown below are *defaults* so if you do not want to change anything - you can skip `options` argument, it is optional.

```JavaScript
var options = {
	
	// Clone obj1 so it will not be changed during merge
	clone: true,
	
	// Recursive `deep` merge - `all` object levels will be merged in opposite to `first-level merge`
	deep: true,
	
	// Only replace keys/values present in first object OR `return null` if second object contains
	// key that does not exist in obj1
	replaceOnly: false
};
```

Now, merging:

**Client side**

```javascript
<script type="text/javascript">
	var resultObj = upmerge.merge(obj1, obj2, options);
	console.log(resultObj);
</script>
```

**Server side**

```javascript
var upmerge = require('upmerge');
var resultObj = upmerge.merge(obj1, obj2, options);
console.log(resultObj);
```

The result will be:

```javascript
{
	a: 'Hello',
	b: 'World',
	c: {
		a: 'Alpha',
		b: 'Beta',
		g: 'Gamma',
		d: 'Delta'
	},
	d: 'Wow'
}
```

## Cloning

You can use this library not just for merging but also for simple cloning JavaScript objects

```JavaScript
var clonedObj = upmerge.clone(origObj);
```

## Special features

**The 'replaceOnly' mode**

If you specify `replaceOnly: true` in an `options` argument - your result object will get only those values from merging object (obj2) that stored under existing in base object (obj1) keys. If someone will try to merge new keys into object - the `merge()` function will return `null` (merge fail). It is extremely useful when, for instance, you have a reference config (self-documenting, showing all the possible options) in your project and you want to let users to change described config properties only but not to add new ones (since if it is not described in reference config - it is not supported).

## Testing

Clone or download the repository, go to directory `tests` and run `bower install` it will install testing framework `qunit` then just open `tests/index.html` in your browser.

Little bit more information about test cases structure you will find in `cases.js`.

The end
