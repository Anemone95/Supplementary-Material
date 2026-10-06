/**
* url 匹配配置
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
