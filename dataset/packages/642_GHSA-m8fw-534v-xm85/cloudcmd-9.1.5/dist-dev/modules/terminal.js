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
/******/ 		"./modules/terminal": 0
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
/******/ 	deferredModules.push(["./client/modules/terminal.js","cloudcmd.common"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./client/modules/terminal.js":
/*!************************************!*\
  !*** ./client/modules/terminal.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/* global CloudCmd, gritty */\n\n__webpack_require__(/*! ../../css/terminal.css */ \"./css/terminal.css\");\n\nconst exec = __webpack_require__(/*! execon */ \"./node_modules/execon/lib/exec.js\");\nconst load = __webpack_require__(/*! ../dom/load */ \"./client/dom/load.js\");\nconst DOM = __webpack_require__(/*! ../dom */ \"./client/dom/index.js\");\nconst Images = __webpack_require__(/*! ../dom/images */ \"./client/dom/images.js\");\nconst {Dialog} = DOM;\n\nconst TITLE = 'Terminal';\n\nCloudCmd.Terminal = TerminalProto;\n\nconst {Key} = CloudCmd;\n\nlet Element;\nlet Loaded;\nlet Terminal;\n\nconst {config} = CloudCmd;\n\nfunction TerminalProto() {\n    const noop = () => {};\n    \n    if (!config('terminal'))\n        return {\n            show: noop\n        };\n    \n    Images.show.load('top');\n    \n    exec.series([\n        CloudCmd.View,\n        loadAll,\n        create,\n        show,\n    ]);\n    \n    Element = load({\n        name: 'div',\n        className : 'terminal',\n    });\n    \n    return module.exports;\n}\n\nmodule.exports.show = show;\nmodule.exports.hide = hide;\n\nfunction hide () {\n    CloudCmd.View.hide();\n}\n\nfunction getPrefix() {\n    return CloudCmd.PREFIX + '/gritty';\n}\n\nfunction getEnv() {\n    return {\n        ACTIVE_DIR: DOM.getCurrentDirPath,\n        PASSIVE_DIR: DOM.getNotCurrentDirPath,\n        CURRENT_NAME: DOM.getCurrentName,\n        CURRENT_PATH: DOM.getCurrentPath,\n    };\n}\n\nfunction create(callback) {\n    const options = {\n        env: getEnv(),\n        prefix: getPrefix(),\n        socketPath: CloudCmd.PREFIX,\n    };\n    \n    const {socket, terminal} = gritty(Element, options);\n    \n    Terminal = terminal;\n    \n    terminal.on('key', (char, {keyCode, shiftKey}) => {\n        if (shiftKey && keyCode === Key.ESC) {\n            hide();\n        }\n    });\n    \n    socket.on('connect', exec.with(authCheck, socket));\n    exec(callback);\n}\n\nfunction authCheck(spawn) {\n    spawn.emit('auth', config('username'), config('password'));\n    \n    spawn.on('reject', () => {\n        Dialog.alert(TITLE, 'Wrong credentials!');\n    });\n}\n\nfunction show(callback) {\n    if (!Loaded)\n        return;\n    \n    CloudCmd.View.show(Element, {\n        afterShow: () => {\n            if (Terminal)\n                Terminal.focus();\n            \n            exec(callback);\n        }\n    });\n}\n\nfunction loadAll(callback) {\n    const prefix = getPrefix();\n    const url = prefix + '/gritty.js';\n    \n    DOM.load.js(url, (error) => {\n        if (error)\n            return Dialog.alert(TITLE, error.message);\n        \n        Loaded = true;\n        exec(callback);\n    });\n}\n\n\n\n//# sourceURL=file://cloudcmd/client/modules/terminal.js");

/***/ }),

/***/ "./css/terminal.css":
/*!**************************!*\
  !*** ./css/terminal.css ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// removed by extract-text-webpack-plugin\n\n//# sourceURL=file://cloudcmd/css/terminal.css");

/***/ })

/******/ });