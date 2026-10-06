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
/******/ 		"./modules/konsole": 0
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
/******/ 	deferredModules.push(["./client/modules/konsole.js","cloudcmd.common"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./client/modules/konsole.js":
/*!***********************************!*\
  !*** ./client/modules/konsole.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/* global CloudCmd */\n/* global Util */\n/* global DOM */\n/* global Console */\n\nconst exec = __webpack_require__(/*! execon */ \"./node_modules/execon/lib/exec.js\");\nconst currify = __webpack_require__(/*! currify/legacy */ \"./node_modules/currify/legacy/index.js\");\nconst Images = __webpack_require__(/*! ../dom/images */ \"./client/dom/images.js\");\nconst {\n    Dialog,\n    CurrentInfo:Info,\n} = DOM;\n\nconst rmLastSlash = (a) => a.replace(/\\/$/, '') || '/';\n\nCloudCmd.Konsole = ConsoleProto;\n\nfunction ConsoleProto() {\n    let konsole;\n    const {config} = CloudCmd;\n    \n    const noop = () => {};\n    const cd = currify((fn, dir) => fn(`cd ${rmLastSlash(dir)}`));\n    \n    if (!config('console'))\n        return {\n            show: noop\n        };\n    \n    const Name = 'Konsole';\n    const TITLE = 'Console';\n    \n    let Element;\n    let Loaded;\n    \n    const Konsole = this;\n    \n    function init() {\n        Images.show.load('top');\n        \n        exec.series([\n            CloudCmd.View,\n            load,\n            create,\n            Konsole.show,\n        ]);\n        \n        Element = DOM.load({\n            name        : 'div',\n            className   : 'console'\n        });\n    }\n    \n    this.hide = () => {\n        CloudCmd.View.hide();\n    };\n    \n    this.clear = () => {\n        konsole.clear();\n    };\n    \n    function getPrefix() {\n        return CloudCmd.PREFIX + '/console';\n    }\n    \n    function getEnv() {\n        return {\n            ACTIVE_DIR: DOM.getCurrentDirPath.bind(DOM),\n            PASSIVE_DIR: DOM.getNotCurrentDirPath.bind(DOM),\n            CURRENT_NAME: DOM.getCurrentName.bind(DOM),\n            CURRENT_PATH: () => {\n                return Info.path;\n            }\n        };\n    }\n    \n    function onPath(path) {\n        if (Info.dirPath === path)\n            return;\n        \n        CloudCmd.loadDir({\n            path,\n        });\n    }\n    \n    const getDirPath = () => {\n        if (config('syncConsolePath'))\n            return Info.dirPath;\n    };\n    \n    function create(callback) {\n        const options = {\n            cwd: getDirPath(),\n            env: getEnv(),\n            prefix: getPrefix(),\n            socketPath: CloudCmd.PREFIX,\n        };\n        \n        konsole = Console(Element, options, (spawn) => {\n            spawn.on('connect', exec.with(authCheck, spawn));\n            spawn.on('path', config.if('syncConsolePath', onPath));\n            \n            CloudCmd.on('active-dir', config.if('syncConsolePath', cd(spawn.handler)));\n            \n            exec(callback);\n        });\n        \n        konsole.addShortCuts({\n            'P': () => {\n                const command = Console.getPromptText();\n                const path = DOM.getCurrentDirPath();\n                \n                Console.setPromptText(command + path);\n            }\n        });\n    }\n    \n    function authCheck(spawn) {\n        spawn.emit('auth', config('username'), config('password'));\n        \n        spawn.on('reject', () => {\n            Dialog.alert(TITLE, 'Wrong credentials!');\n        });\n    }\n    \n    this.show = (callback) => {\n        if (!Loaded)\n            return;\n        \n        CloudCmd.View.show(Element, {\n            afterShow: () => {\n                konsole.focus();\n                exec(callback);\n            }\n        });\n    };\n    \n    function load(callback) {\n        const prefix = getPrefix();\n        const url = prefix + '/console.js';\n        \n        DOM.load.js(url, (error) => {\n            if (error)\n                return Dialog.alert(TITLE, error.message);\n            \n            Loaded = true;\n            Util.timeEnd(Name + ' load');\n            exec(callback);\n        });\n        \n        Util.time(Name + ' load');\n    }\n    \n    init();\n}\n\n\n\n//# sourceURL=file://cloudcmd/client/modules/konsole.js");

/***/ })

/******/ });