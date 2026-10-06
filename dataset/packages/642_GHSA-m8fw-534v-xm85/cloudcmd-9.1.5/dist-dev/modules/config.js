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
/******/ 		"./modules/config": 0
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
/******/ 	deferredModules.push(["./client/modules/config.js","cloudcmd.common"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./client/input.js":
/*!*************************!*\
  !*** ./client/input.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nconst currify = __webpack_require__(/*! currify/legacy */ \"./node_modules/currify/legacy/index.js\");\n\nconst isType = currify((type, object, name) => {\n    return typeof object[name] === type;\n});\n\nconst isBool = isType('boolean');\n\nmodule.exports.getElementByName = getElementByName;\n\nfunction getElementByName(selector, element) {\n    const str = `[data-name=\"js-${selector}\"]`;\n    \n    return element\n        .querySelector(str);\n}\n\nmodule.exports.getName = (element) => {\n    const name = element\n        .getAttribute('data-name')\n        .replace(/^js-/, '');\n    \n    return name;\n};\n\nmodule.exports.convert = (config) => {\n    const result = Object.assign({}, config);\n    const array = Object.keys(result);\n    \n    array\n        .filter(isBool(result))\n        .forEach((name) => {\n            const item = result[name];\n            \n            result[name] = setState(item);\n        });\n    \n    return result;\n};\n\nfunction setState(state) {\n    if (state)\n        return ' checked';\n    \n    return '';\n}\n\nmodule.exports.getValue = (name, element) => {\n    const el = getElementByName(name, element);\n    const type = el.type;\n    \n    switch(type) {\n    case 'checkbox':\n        return el.checked;\n    \n    case 'number':\n        return Number(el.value);\n    \n    default:\n        return el.value;\n    }\n};\n\nmodule.exports.setValue = (name, value, element) => {\n    const el = getElementByName(name, element);\n    const type = el.type;\n    \n    switch(type) {\n    case 'checkbox':\n        el.checked = value;\n        break;\n    \n    default:\n        el.value = value;\n        break;\n    }\n};\n\n\n\n//# sourceURL=file://cloudcmd/client/input.js");

/***/ }),

/***/ "./client/modules/config.js":
/*!**********************************!*\
  !*** ./client/modules/config.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/* global CloudCmd, DOM, io */\n\n__webpack_require__(/*! ../../css/config.css */ \"./css/config.css\");\n\nconst rendy = __webpack_require__(/*! rendy */ \"./node_modules/rendy/lib/rendy.js\");\nconst exec = __webpack_require__(/*! execon */ \"./node_modules/execon/lib/exec.js\");\nconst currify = __webpack_require__(/*! currify/legacy */ \"./node_modules/currify/legacy/index.js\");\nconst squad = __webpack_require__(/*! squad/legacy */ \"./node_modules/squad/legacy/index.js\");\nconst input = __webpack_require__(/*! ../input */ \"./client/input.js\");\n\nconst Images = __webpack_require__(/*! ../dom/images */ \"./client/dom/images.js\");\nconst Events = __webpack_require__(/*! ../dom/events */ \"./client/dom/events.js\");\nconst Files = __webpack_require__(/*! ../dom/files */ \"./client/dom/files.js\");\n\nconst {getTitle} = __webpack_require__(/*! ../../common/cloudfunc */ \"./common/cloudfunc.js\");\n\nconst {Dialog, setTitle} = DOM;\n\nconst TITLE = 'Config';\nconst alert = currify(Dialog.alert, TITLE);\n\nconst Config = module.exports;\n\nconst showLoad = () => {\n    Images.show.load('top');\n};\n\nconst addKey = currify((fn, input) => {\n    Events.addKey(input, fn);\n    return input;\n});\n\nconst addChange = currify((fn, input) => {\n    Events.add('change', input, fn);\n    return input;\n});\n\nCloudCmd.Config = ConfigProto;\n\nlet Loading = true;\n\nfunction ConfigProto() {\n    const noop = () => {};\n    \n    if (!CloudCmd.config('configDialog'))\n        return {\n            show: noop\n        };\n    \n    Loading = true;\n    \n    showLoad();\n    exec.series([\n        CloudCmd.View,\n        (callback) => {\n            Loading = false;\n            exec(callback);\n            DOM.loadSocket(initSocket);\n        },\n        show\n    ]);\n    \n    return module.exports;\n}\n\nconst config = CloudCmd.config;\n\nconst {Key} = CloudCmd;\n\nlet Element;\nlet Template;\n\nfunction getHost() {\n    const {host, origin, protocol} = location;\n    const href = origin || `${protocol}//${host}`;\n    \n    return href;\n}\n\nfunction initSocket() {\n    const href = getHost();\n    const prefix = CloudCmd.PREFIX;\n    const FIVE_SECONDS = 5000;\n    \n    const socket  = io.connect(href + prefix + '/config', {\n        'max reconnection attempts' : Math.pow(2, 32),\n        'reconnection limit'        : FIVE_SECONDS,\n        path: prefix + '/socket.io'\n    });\n    \n    const save = (data) => {\n        onSave(data);\n        socket.send(data);\n    };\n    \n    authCheck(socket);\n    \n    socket.on('connect', () => {\n        Config.save = save;\n    });\n    \n    socket.on('config', (config) => {\n        DOM.Storage.setAllowed(config.localStorage);\n    });\n    \n    socket.on('message', onSave);\n    socket.on('log', CloudCmd.log);\n    \n    socket.on('disconnect', () => {\n        Config.save = saveHttp;\n    });\n    \n    socket.on('err', alert);\n}\n\nfunction authCheck(socket) {\n    socket.emit('auth', config('username'), config('password'));\n    \n    socket.on('reject', () => {\n        alert('Wrong credentials!');\n    });\n}\n\nConfig.save = saveHttp;\n\nmodule.exports.show = show;\n\nfunction show() {\n    const prefix = CloudCmd.PREFIX;\n    const funcs = [\n        exec.with(Files.get, 'config-tmpl'),\n        exec.with(DOM.load.parallel, [\n            prefix + '/dist/config.css'\n        ])\n    ];\n    \n    if (Loading)\n        return;\n    \n    showLoad();\n    exec.parallel(funcs, fillTemplate);\n}\n\nfunction fillTemplate(error, template) {\n    if (!Template)\n        Template = template;\n    \n    Files.get('config', (error, config) => {\n        if (error)\n            return alert('Could not load config!');\n        \n        const obj = input.convert(config);\n        \n        obj[obj.editor + '-selected'] = 'selected';\n        delete obj.editor;\n        \n        obj[obj.packer + '-selected'] = 'selected';\n        delete obj.packer;\n        \n        obj[obj.columns + '-selected'] = 'selected';\n        delete obj.columns;\n        \n        const inner = rendy(Template, obj);\n        \n        Element = DOM.load({\n            name        : 'form',\n            className   : 'config',\n            inner,\n            attribute   : {\n                'data-name': 'js-config'\n            }\n        });\n        \n        const inputs = document.querySelectorAll('input, select', Element);\n        const [inputFirst] = inputs;\n        \n        let afterShow;\n        if (inputFirst) {\n            onAuthChange(inputFirst.checked);\n            afterShow = inputFirst.focus.bind(inputFirst);\n        }\n        \n        const getTarget = ({target}) => target;\n        const handleChange = squad(onChange, getTarget);\n        \n        [...inputs]\n            .map(addKey(onKey))\n            .map(addChange(handleChange));\n        \n        const autoSize = true;\n        CloudCmd.View.show(Element, {\n            autoSize,\n            afterShow,\n        });\n    });\n}\n\nmodule.exports.hide = () => {\n    CloudCmd.View.hide();\n};\n\nfunction onChange(el) {\n    const obj = {};\n    const name = input.getName(el);\n    const data = input.getValue(name, Element);\n    const type = el.type;\n    \n    if (name === 'name')\n        onNameChange(data);\n    else if (type === 'checkbox')\n        if (/^(diff|buffer|dirStorage)$/.test(name))\n            onLSChange(name, data);\n        else if (name === 'localStorage')\n            onLocalStorageChange();\n        else if (name === 'auth')\n            onAuthChange(data);\n    \n    obj[name] = data;\n    \n    Config.save(obj);\n}\n\nfunction onSave(obj) {\n    Object.keys(obj).forEach((name) => {\n        const data = obj[name];\n        \n        CloudCmd._config(name, data);\n        input.setValue(name, data, Element);\n    });\n    \n    DOM.Storage.setAllowed(obj.localStorage);\n}\n\nfunction saveHttp(obj) {\n    const {RESTful} = DOM;\n    \n    RESTful.Config.write(obj, (error) => {\n        if (error)\n            return;\n        \n        onSave(obj);\n    });\n}\n\nfunction onLocalStorageChange() {\n    const names = ['diff', 'buffer', 'dirStorage', 'localStorage'];\n    const elements = names.map((name) => {\n        return input.getElementByName(name, Element);\n    });\n    const el = {};\n    const msg = 'Diff, Buffer and Directory Storage do not work without localStorage';\n    \n    let isChecked;\n    \n    elements.forEach((element) => {\n        const name = input.getName(element);\n        \n        el[name] = element;\n        \n        if (element.checked)\n            isChecked = true;\n    });\n    \n    if (!isChecked || el.localStorage.checked)\n        return;\n    \n    alert(msg);\n    \n    elements.forEach((element) => {\n        if (!element.checked)\n            return;\n        \n        element.checked = false;\n        onChange(element);\n    });\n}\n\nfunction onLSChange(name, data) {\n    const elLocalStorage = input.getElementByName('localStorage', Element);\n    const msg = `${name} depends on localStorage`;\n    \n    if (!data || elLocalStorage.checked)\n        return;\n    \n    Dialog.alert(TITLE, msg);\n    elLocalStorage.checked = true;\n}\n\nfunction onAuthChange(checked) {\n    const elUsername = input.getElementByName('username', Element);\n    const elPassword = input.getElementByName('password', Element);\n    \n    elUsername.disabled =\n    elPassword.disabled = !checked;\n}\n\nfunction onNameChange(name) {\n    setTitle(getTitle({\n        name\n    }));\n}\n\nfunction onKey({keyCode, target}) {\n    switch (keyCode) {\n    case Key.ESC:\n        Config.hide();\n        break;\n    \n    case Key.ENTER:\n        onChange(target);\n        break;\n    }\n}\n\n\n\n//# sourceURL=file://cloudcmd/client/modules/config.js");

/***/ }),

/***/ "./css/config.css":
/*!************************!*\
  !*** ./css/config.css ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// removed by extract-text-webpack-plugin\n\n//# sourceURL=file://cloudcmd/css/config.css");

/***/ })

/******/ });