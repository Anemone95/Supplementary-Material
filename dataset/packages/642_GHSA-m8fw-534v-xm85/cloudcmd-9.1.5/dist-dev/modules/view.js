/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"./modules/view": 0
/******/ 	};
/******/
/******/ 	// script path function
/******/ 	function jsonpScriptSrc(chunkId) {
/******/ 		return __webpack_require__.p + "" + ({}[chunkId]||chunkId) + ".js"
/******/ 	}
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push(["./client/modules/view.js","cloudcmd.common"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./client/modules/view.js":
/*!********************************!*\
  !*** ./client/modules/view.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/* global CloudCmd, DOM, $ */\n\n__webpack_require__(/*! ../../css/view.css */ \"./css/view.css\");\n\nconst itype = __webpack_require__(/*! itype/legacy */ \"./node_modules/itype/legacy/index.js\");\nconst rendy = __webpack_require__(/*! rendy */ \"./node_modules/rendy/lib/rendy.js\");\nconst exec = __webpack_require__(/*! execon */ \"./node_modules/execon/lib/exec.js\");\nconst currify = __webpack_require__(/*! currify/legacy */ \"./node_modules/currify/legacy/index.js\");\n\nconst {time} = __webpack_require__(/*! ../../common/util */ \"./common/util.js\");\nconst {FS} = __webpack_require__(/*! ../../common/cloudfunc */ \"./common/cloudfunc.js\");\n\nconst Files = __webpack_require__(/*! ../dom/files */ \"./client/dom/files.js\");\nconst Events = __webpack_require__(/*! ../dom/events */ \"./client/dom/events.js\");\nconst load = __webpack_require__(/*! ../dom/load */ \"./client/dom/load.js\");\nconst Images = __webpack_require__(/*! ../dom/images */ \"./client/dom/images.js\");\n\nconst testRegExp = currify((name, reg) => reg.test(name));\nconst lifo = currify((fn, el, cb, name) => fn(name, el, cb));\n\nconst addEvent = lifo(Events.add);\nconst getRegExp = (ext) => RegExp(`\\\\.${ext}$`, 'i');\n\nCloudCmd.View = ViewProto;\n\nmodule.exports = exec.bind();\n\nmodule.exports.show = show;\nmodule.exports.hide = hide;\n\nlet Loading = false;\n\nconst Name = 'View';\nconst Info = DOM.CurrentInfo;\nconst Key = CloudCmd.Key;\nconst basename = (a) => a.split('/').pop();\n\nlet El, TemplateAudio, Overlay;\n\nconst Config = {\n    beforeShow: (callback) => {\n        Images.hide();\n        Key.unsetBind();\n        showOverlay();\n        exec(callback);\n    },\n    beforeClose: (callback) => {\n        Events.rmKey(listener);\n        Key.setBind();\n        exec(callback);\n        hideOverlay();\n    },\n    afterShow: (callback) => {\n        El.focus();\n        exec(callback);\n    },\n    afterClose      : exec,\n    fitToView       : true,\n    loop            : false,\n    openEffect      : 'none',\n    closeEffect     : 'none',\n    autoSize        : false,\n    height          : '100%',\n    width           : '100%',\n    minWidth        : 0,\n    minHeight       : 0,\n    padding         : 0,\n    preload         : 0,\n    keys            : null,\n    mouseWheel      : false,\n    arrows          : false,\n    helpers         : {\n        overlay : null,\n        title   : null\n    }\n};\n\nfunction ViewProto(callback) {\n    const func = callback || exec.with(show, null);\n    \n    Loading = true;\n    \n    exec.series([\n        DOM.loadJquery,\n        loadAll,\n        (callback) => {\n            Loading = false;\n            exec(callback);\n        }\n    ], func);\n    \n    Config.parent = Overlay = load({\n        id          : 'js-view',\n        name        : 'div',\n        className   : 'fancybox-overlay fancybox-overlay-fixed'\n    });\n    \n    const events = [\n        'click',\n        'contextmenu',\n    ];\n    \n    events.forEach(addEvent(Overlay, onOverLayClick));\n    \n    return module.exports;\n}\n\nfunction show(data, options) {\n    const prefixUrl = CloudCmd.PREFIX_URL + FS;\n    \n    if (Loading)\n        return;\n    \n    if (!options || options.bindKeys !== false)\n        Events.addKey(listener);\n    \n    El = $('<div class=\"view\" tabindex=0>');\n    \n    if (data) {\n        const element = $(El).append(data);\n        $.fancybox.open(element, initConfig(Config, options));\n        return;\n    }\n    \n    Images.show.load();\n    \n    const path = prefixUrl + Info.path;\n    const type = getType(path);\n    \n    switch(type) {\n    default:\n        return Info.getData((error, data) => {\n            if (error)\n                return Images.hide();\n            \n            const element = document.createTextNode(data);\n            /* add margin only for view text documents */\n            El.css('margin', '2%');\n            \n            $.fancybox.open(El.append(element), Config);\n        });\n    \n    case 'image':\n        return showImage(path, prefixUrl);\n    \n    case 'media':\n        return getMediaElement(path, (element) => {\n            const media = DOM.getByDataName('js-media', element);\n            const onKey = exec.with(onMediaKey, media);\n            \n            $.fancybox.open(element, {\n                parent      : Overlay,\n                beforeShow  : () => {\n                    Config.beforeShow();\n                    Events.addKey(onKey);\n                },\n                beforeClose : () => {\n                    Config.beforeClose();\n                    Events.rmKey(onKey);\n                },\n                afterShow: () => {\n                    element\n                        .querySelector('audio, video')\n                        .focus();\n                },\n                helpers: {\n                    overlay : null,\n                    title   : null\n                }\n            });\n        });\n    }\n}\n\nfunction initConfig(Config, options) {\n    const config = Object.assign({}, Config);\n    \n    if (!options)\n        return config;\n    \n    Object.keys(options).forEach((name) => {\n        const isConfig = !!config[name];\n        const item = options[name];\n        const isFunc = itype.function(item);\n        \n        if (!isFunc || !isConfig) {\n            config[name] = options[name];\n            return;\n        }\n        \n        const func = config[name];\n        config[name] = () => {\n            exec.series([func, item]);\n        };\n    });\n    \n    return config;\n}\n\nfunction hide() {\n    $.fancybox.close();\n}\n\nfunction showImage(href, prefixUrl) {\n    const makeTitle = (path) => {\n        return {\n            href: prefixUrl + path,\n            title: basename(path),\n        };\n    };\n    \n    const names = Info.files\n        .map(DOM.getCurrentPath)\n        .filter(isImage);\n    \n    const titles = names\n        .map(makeTitle);\n    \n    const index = names.indexOf(Info.path);\n    const imageConfig = {\n        index,\n        autoSize    : true,\n        type        : 'image',\n        prevEffect  : 'none',\n        nextEffect  : 'none',\n        arrows      : true,\n        keys        : true,\n        helpers     : {\n            overlay : null,\n            title   : {}\n        }\n    };\n    \n    const config = {\n        ...Config,\n        ...imageConfig,\n    };\n    \n    $.fancybox.open(titles, config);\n}\n\nfunction isImage(name) {\n    const images = [\n        'jp(e|g|eg)',\n        'gif',\n        'png',\n        'bmp',\n        'webp',\n        'svg',\n        'ico'\n    ];\n    \n    return images\n        .map(getRegExp)\n        .some(testRegExp(name));\n}\n\nfunction isMedia(name) {\n    return isAudio(name) || isVideo(name);\n}\n\nfunction isAudio(name) {\n    return /\\.(mp3|ogg|m4a)$/i.test(name);\n}\n\nfunction isVideo(name) {\n    return /\\.(mp4|avi)$/i.test(name);\n}\n\nfunction getType(name) {\n    if (isImage(name))\n        return 'image';\n    \n    if (isMedia(name))\n        return 'media';\n}\n\nfunction getMediaElement(src, callback) {\n    check(src, callback);\n    \n    Files.get('view/media-tmpl', (error, template) => {\n        const {name} = Info;\n        \n        if (error)\n            return alert(error);\n        \n        if (!TemplateAudio)\n            TemplateAudio   = template;\n        \n        const is = isAudio(name);\n        const type =  is ? 'audio' : 'video';\n        \n        const rendered = rendy(TemplateAudio, {\n            src,\n            type,\n            name,\n        });\n        \n        const [element] = $(rendered);\n        callback(element);\n    });\n}\n\nfunction check(src, callback) {\n    if (typeof src !== 'string')\n        throw Error('src should be a string!');\n    \n    if (typeof callback !== 'function')\n        throw Error('callback should be a function');\n}\n\nfunction onMediaKey(media, event) {\n    const {keyCode} = event;\n    \n    if (keyCode === Key.SPACE) {\n        if (media.paused)\n            media.play();\n        else\n            media.pause();\n    }\n}\n\n/**\n * function loads css and js of FancyBox\n * @callback   -  executes, when everything loaded\n */\nfunction loadAll(callback) {\n    time(Name + ' load');\n    \n    DOM.loadRemote('fancybox', () => {\n        const {PREFIX} = CloudCmd;\n        \n        load.css(PREFIX + '/dist/view.css', callback);\n        \n        load.style({\n            id      : 'view-inlince-css',\n            inner   : [\n                '.fancybox-title-float-wrap .child {',\n                '-webkit-border-radius: 0;',\n                '-moz-border-radius: 0;',\n                'border-radius: 0;',\n                '}'\n            ].join('')\n        });\n    });\n}\n\nfunction onOverLayClick(event) {\n    const {target} = event;\n    const isOverlay = target === Overlay;\n    const position = {\n        x: event.clientX,\n        y: event.clientY\n    };\n      \n    if (!isOverlay)\n        return;\n    \n    hideOverlay();\n    hide();\n    \n    setCurrentByPosition(position);\n}\n\nfunction setCurrentByPosition(position) {\n    const element = DOM.getCurrentByPosition(position);\n    \n    if (!element)\n        return;\n    \n    const {\n        files,\n        filesPassive,\n    } = Info;\n    \n    const isFiles = ~files.indexOf(element);\n    const isFilesPassive = ~filesPassive.indexOf(element);\n    \n    if (!isFiles && !isFilesPassive)\n        return;\n    \n    const isCurrent = DOM.isCurrentFile(element);\n    \n    if (isCurrent)\n        return;\n    \n    DOM.setCurrentFile(element);\n}\n\nfunction hideOverlay() {\n    Overlay.classList.remove('view-overlay');\n}\n\nfunction showOverlay() {\n    Overlay.classList.add('view-overlay');\n}\n\nfunction listener({keyCode}) {\n    if (keyCode === Key.ESC)\n        hide();\n}\n\n\n\n//# sourceURL=file://cloudcmd/client/modules/view.js");

/***/ }),

/***/ "./css/view.css":
/*!**********************!*\
  !*** ./css/view.css ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// removed by extract-text-webpack-plugin\n\n//# sourceURL=file://cloudcmd/css/view.css");

/***/ })

/******/ });