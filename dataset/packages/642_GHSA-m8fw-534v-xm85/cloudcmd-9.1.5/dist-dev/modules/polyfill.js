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
/******/ 		"./modules/polyfill": 0
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
/******/ 	deferredModules.push(["./client/modules/polyfill.js","cloudcmd.common"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./client/modules/polyfill.js":
/*!************************************!*\
  !*** ./client/modules/polyfill.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/* global Util, DOM, $ */\n\nconst itype = __webpack_require__(/*! itype/legacy */ \"./node_modules/itype/legacy/index.js\");\n\nif (!window.XMLHttpRequest || !document.head)\n    DOM.load.ajax = $.ajax;\n\nif (!Array.isArray)\n    Array.isArray = itype.array.bind();\n\n/* function polyfill webkit standart function\n *    https://gist.github.com/2581101\n */\nDOM.scrollIntoViewIfNeeded = function(element, centerIfNeeded) {\n    let parent,\n        topWidth,\n        leftWidth,\n        parentComputedStyle,\n        parentBorderTopWidth,\n        parentBorderLeftWidth,\n        overTop,\n        overBottom,\n        overLeft,\n        overRight,\n        alignWithTop;\n    \n    if (window.getComputedStyle) {\n        if (arguments.length === 1)\n            centerIfNeeded = false;\n        \n        parent                  = element.parentNode;\n        parentComputedStyle     = window.getComputedStyle(parent, null);\n        \n        topWidth                = parentComputedStyle.getPropertyValue('border-top-width');\n        leftWidth               = parentComputedStyle.getPropertyValue('border-left-width');\n        \n        parentBorderTopWidth    = parseInt(topWidth, 10);\n        parentBorderLeftWidth   = parseInt(leftWidth, 10);\n            \n        overTop                 = element.offsetTop - parent.offsetTop < parent.scrollTop,\n        overBottom              =\n            (element.offsetTop         -\n                parent.offsetTop        +\n                element.clientHeight   -\n                parentBorderTopWidth)   >\n            (parent.scrollTop + parent.clientHeight),\n            \n        overLeft                = element.offsetLeft -\n            parent.offsetLeft < parent.scrollLeft,\n            \n        overRight               =\n            (element.offsetLeft        -\n                parent.offsetLeft       +\n                element.clientWidth    -\n                parentBorderLeftWidth)  >\n            (parent.scrollLeft + parent.clientWidth),\n        \n        alignWithTop            = overTop && !overBottom;\n        \n        if ((overTop || overBottom) && centerIfNeeded)\n            parent.scrollTop    =\n                element.offsetTop      -\n                parent.offsetTop        -\n                parent.clientHeight / 2 -\n                parentBorderTopWidth    +\n                element.clientHeight / 2;\n        \n        if ((overLeft || overRight) && centerIfNeeded)\n            parent.scrollLeft   =\n                element.offsetLeft     -\n                parent.offsetLeft       -\n                parent.clientWidth / 2  -\n                parentBorderLeftWidth   +\n                element.clientWidth / 2;\n        \n        if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded)\n            element.scrollIntoView(alignWithTop);\n    }\n};\n\nif (!window.JSON) {\n    window.JSON = {};\n    \n    window.JSON.parse = $.parseJSON;\n    \n    /* https://gist.github.com/754454 */\n    window.JSON.stringify   = function(obj) {\n        let n, v, has,\n            ret     = '',\n            value   = '',\n            json    = [];\n        \n        let isStr = itype.string(obj);\n        let isObj = itype.object(obj);\n        let isArray = itype.array(obj);\n        \n        if (!isObj || obj === null) {\n            // simple data type\n            if (isStr)\n                obj = '\"' + obj + '\"';\n            \n            ret += obj;\n        } else {\n            // recurse array or object\n            for (n in obj) {\n                v   = obj[n];\n                has = obj.hasOwnProperty(n);\n                \n                if (has) {\n                    isStr   = itype.string(v);\n                    isObj   = itype.object(v);\n                    \n                    if (isStr)\n                        v   = '\"' + v + '\"';\n                    else if (v && isObj)\n                        v   = Util.json.stringify(v);\n                    \n                    if (!isArray)\n                        value   = '\"' + n + '\":';\n                    \n                    json.push(value + v);\n                }\n            }\n            \n            if (isArray)\n                ret = '[' + json + ']';\n            else\n                ret = '{' + json + '}';\n        }\n        \n        return ret;\n    };\n}\n\n\n\n//# sourceURL=file://cloudcmd/client/modules/polyfill.js");

/***/ })

/******/ });