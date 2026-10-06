# wind-mvc
this is a simple mvc framework.

## Installation
```
$ npm install wind-mvc
$ node app.js
```
then, you can access like: (similarly struts rules) <br />
- http://127.0.0.1:8080/register
- http://127.0.0.1:8080/server
- http://127.0.0.1:8080/fileUpload
- http://127.0.0.1:8080/ajax
- http://127.0.0.1:8080/ajax!getJson

## main configuration file
lib/config.js
```js
/**
* gloabl configuration
**/
module.exports = {
	/**
	* server port
	**/
	port: 8080,
	
	uploadDir :'./uploadfile/'
};
```

lib/url-config.js
```js
/**
*  url map the module of the action
**/

module.exports = {
	'/ajax': {
		path: './action/ajax.js',
		results: {
			'success': './static/start/index.html'
		}
	},
	'/register': {
		path: './action/register.js',
		results: {
			'success': './static/form/form.html'
		}
	},
	'/server': {
		path: './action/serverSent.js',
		results: {
			'success': './static/server/server-sent.html'
		}
	},
	'/fileUpload': {
		path: './action/fileUpload.js',
		results: {
			success: './static/form/fileUploadWithProgress.html'
		}
	}
};
```