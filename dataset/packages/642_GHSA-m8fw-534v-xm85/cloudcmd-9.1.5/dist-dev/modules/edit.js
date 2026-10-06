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
/******/ 		"./modules/edit": 0
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
/******/ 	deferredModules.push(["./client/modules/edit.js","cloudcmd.common"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./client/modules/edit.js":
/*!********************************!*\
  !*** ./client/modules/edit.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* global CloudCmd */\n\n\n\nconst exec = __webpack_require__(/*! execon */ \"./node_modules/execon/lib/exec.js\");\nconst currify = __webpack_require__(/*! currify/legacy */ \"./node_modules/currify/legacy/index.js\");\n\nconst load = __webpack_require__(/*! ../dom/load */ \"./client/dom/load.js\");\n\nconst {MAX_FILE_SIZE: maxSize} = __webpack_require__(/*! ../../common/cloudfunc */ \"./common/cloudfunc.js\");\nconst {time, timeEnd} = __webpack_require__(/*! ../../common/util */ \"./common/util.js\");\n\nCloudCmd.Edit = EditProto;\n\nfunction EditProto(callback) {\n    const Name = 'Edit';\n    const EditorName = CloudCmd.config('editor');\n    const loadFiles = currify(_loadFiles);\n    \n    let Loading = true;\n    let Element;\n    let editor;\n    \n    const ConfigView = {\n        afterShow: () => {\n            editor\n                .moveCursorTo(0, 0)\n                .focus();\n        }\n    };\n    \n    const Edit = exec.bind();\n    \n    function init(callback) {\n        const element = createElement();\n        \n        exec.series([\n            CloudCmd.View,\n            loadFiles(element)\n        ], callback);\n    }\n    \n    function createElement() {\n        const element = load({\n            name: 'div',\n            style:\n                'width      : 100%;'                +\n                'height     : 100%;'                +\n                'font-family: \"Droid Sans Mono\";'   +\n                'position   : absolute;',\n            notAppend: true\n        });\n        \n        Element = element;\n        \n        return element;\n    }\n    \n    function checkFn(name, fn) {\n        if (typeof fn !== 'function')\n            throw Error(name + ' should be a function!');\n    }\n    \n    function initConfig(options = {}) {\n        const config = Object.assign({}, options, ConfigView);\n        \n        if (!options.afterShow)\n            return config;\n        \n        checkFn('options.afterShow', options.afterShow);\n        \n        const afterShow = {config};\n        \n        config.afterShow = () => {\n            afterShow();\n            options.afterShow();\n        };\n        \n        return config;\n    }\n    \n    Edit.show = (options) => {\n        if (Loading)\n            return;\n         \n        CloudCmd.View.show(Element, initConfig(options));\n        \n        Edit.getEditor()\n            .setOptions({\n                fontSize: 16,\n            });\n        \n        return Edit;\n    };\n    \n    Edit.getEditor = () => {\n        return editor;\n    };\n    \n    Edit.getElement = () => {\n        return Element;\n    };\n    \n    Edit.hide = () => {\n        CloudCmd.View.hide();\n        return Edit;\n    };\n    \n    function _loadFiles(element, callback) {\n        const socketPath = CloudCmd.PREFIX;\n        const prefix = socketPath + '/' + EditorName;\n        const url = prefix + '/' + EditorName + '.js';\n        \n        time(Name + ' load');\n        \n        load.js(url, () => {\n            const word = window[EditorName];\n            const options = {\n                maxSize,\n                prefix,\n                socketPath,\n            };\n            \n            word(element, options, (ed) => {\n                timeEnd(Name + ' load');\n                editor  = ed;\n                Loading = false;\n                \n                exec(callback);\n            });\n        });\n    }\n    \n    init(callback);\n    \n    return Edit;\n}\n\n\n\n//# sourceURL=file://cloudcmd/client/modules/edit.js");

/***/ })

/******/ });