BUNS_FILES.forEach(function (val) {
	var BUNS_REQ = new XMLHttpRequest(), script = document.createElement('script');
	BUNS_REQ.open('get', val, false);
	BUNS_REQ.onload = function (response) {
		//eval(response.target.responseText);
	};
	BUNS_REQ.send();
	script.type = 'text/javascript';
	script.text = BUNS_REQ.responseText;
	script.async = false;
	document.getElementsByTagName('head')[0].appendChild(script);
});

if(console.clear)
	console.clear();
const BUNS_LOADED = Date.now();
console.log('Loading time : ' + (BUNS_LOADED - BUNS_START) + 'ms');
Development.Debugger.Debugger.init();
