(function(){

var paths = {
	/**
	 * 基于HTML5-requestAnimationFrame的事件轮训插件
	 * @see demo/choudMap.html .etc
	 */
	requestAFrame : "module/requestAFrame",
	/**
	 * 基于iframe实现的文件上传
	 * @see demo/frame-upload.html
	 */
	frameUpload : "module/frame-upload/frameUpload",
	/*
	 * 对密码进行加密设置
	 * @see  http://plugins.jquery.com/base64/
	*/
	base64:"module/jquery.base64.min",
},
scripts = document.getElementsByTagName('script') , _src = scripts[scripts.length-1].src;
require.baseUrl = _src.replace( /\/[^\/]*$/,"" )
require.config({
	baseUrl: require.baseUrl,
	urlArgs: 'v=1.0',
	paths: paths,
	shim :{

		}
});

})();


/**



**/