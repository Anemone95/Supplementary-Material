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
/******/ 		"./modules/edit-file": 0
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
/******/ 	deferredModules.push(["./client/modules/edit-file.js","cloudcmd.common"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./client/modules/edit-file.js":
/*!*************************************!*\
  !*** ./client/modules/edit-file.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/* global CloudCmd, DOM, MenuIO */\n\nconst Format = __webpack_require__(/*! format-io */ \"./node_modules/format-io/lib/format.js\");\nconst currify = __webpack_require__(/*! currify/legacy */ \"./node_modules/currify/legacy/index.js\");\nconst store = __webpack_require__(/*! fullstore/legacy */ \"./node_modules/fullstore/legacy/index.js\");\nconst squad = __webpack_require__(/*! squad/legacy */ \"./node_modules/squad/legacy/index.js\");\nconst exec = __webpack_require__(/*! execon */ \"./node_modules/execon/lib/exec.js\");\n\nconst call = currify((fn, callback) => {\n    fn();\n    callback();\n});\n\nCloudCmd.EditFile = function EditFileProto(callback) {\n    const Info = DOM.CurrentInfo;\n    const Dialog = DOM.Dialog;\n    const EditFile = exec.bind();\n    const config = CloudCmd.config;\n    \n    let Menu;\n    \n    const TITLE = 'Edit';\n    const Images = DOM.Images;\n    \n    let MSG_CHANGED;\n    const ConfigView  = {\n        beforeClose: () => {\n            exec.ifExist(Menu, 'hide');\n            isChanged();\n        }\n    };\n    \n    function init(callback) {\n        const editor = store();\n        \n        const getMainEditor = () => CloudCmd.Edit.getEditor();\n        const getEditor = squad(editor, getMainEditor);\n        const auth = squad(authCheck, editor);\n        const listeners = squad(setListeners, editor);\n        \n        const show = callback ? exec : EditFile.show;\n        \n        exec.series([\n            CloudCmd.Edit,\n            call(getEditor),\n            call(auth),\n            call(listeners),\n            show,\n        ], callback);\n    }\n    \n    function getName() {\n        const {name, isDir} = Info;\n        \n        if (isDir)\n            return `${name}.json`;\n        \n        return name;\n    }\n    \n    EditFile.show = (options) => {\n        const config = Object.assign({}, ConfigView, options);\n        \n        Images.show.load();\n        \n        CloudCmd.Edit\n            .getEditor()\n            .setOption('keyMap', 'default');\n        \n        Info.getData((error, data) => {\n            const path = Info.path;\n            const name = getName();\n            \n            if (error)\n                return Images.hide();\n            \n            setMsgChanged(name);\n            \n            CloudCmd.Edit\n                .getEditor()\n                .setValueFirst(path, data)\n                .setModeForPath(name)\n                .enableKey();\n            \n            CloudCmd.Edit.show(config);\n        });\n        \n        return CloudCmd.Edit;\n    };\n    \n    EditFile.hide = () => {\n        CloudCmd.Edit.hide();\n    };\n    \n    function setListeners(editor) {\n        const element = CloudCmd.Edit.getElement();\n        \n        DOM.Events.addOnce('contextmenu', element, setMenu);\n        \n        editor.on('save', (value) => {\n            DOM.setCurrentSize(Format.size(value));\n        });\n    }\n    \n    function authCheck(spawn) {\n        spawn.emit('auth', config('username'), config('password'));\n        spawn.on('reject', () => {\n            Dialog.alert(TITLE, 'Wrong credentials!');\n        });\n    }\n    \n    function setMenu(event) {\n        const position = {\n            x: event.clientX,\n            y: event.clientY\n        };\n        \n        event.preventDefault();\n        \n        !Menu && DOM.loadRemote('menu', (error) => {\n            let noFocus;\n            const editor = CloudCmd.Edit.getEditor();\n            const options = {\n                beforeShow: (params) => {\n                    params.x -= 18;\n                    params.y -= 27;\n                },\n                \n                afterClick: () => {\n                    !noFocus && editor.focus();\n                }\n            };\n            \n            const menuData = {\n                'Save           Ctrl+S' : () => {\n                    editor.save();\n                },\n                'Go To Line     Ctrl+G' : () => {\n                    noFocus = true;\n                    editor.goToLine();\n                },\n                'Cut            Ctrl+X' : () => {\n                    editor.cutToClipboard();\n                },\n                'Copy           Ctrl+C' : () => {\n                    editor.copyToClipboard();\n                },\n                'Paste          Ctrl+V' : () => {\n                    editor.pasteFromClipboard();\n                },\n                'Delete         Del'    : () => {\n                    editor.remove('right');\n                },\n                'Select All     Ctrl+A' : () => {\n                    editor.selectAll();\n                },\n                'Beautify       Ctrl+B' : () => {\n                    editor.beautify();\n                },\n                'Minify         Ctrl+M' : () => {\n                    editor.minify();\n                },\n                'Close          Esc'    : () => {\n                    EditFile.hide();\n                }\n            };\n            \n            if (error)\n                return Dialog.alert(TITLE, error);\n            \n            if (Menu || !MenuIO)\n                return;\n                \n            const element = CloudCmd.Edit.getElement();\n            \n            Menu = new MenuIO(element, options, menuData);\n            Menu.show(position.x, position.y);\n        });\n    }\n    \n    function setMsgChanged(name) {\n        MSG_CHANGED = 'Do you want to save changes to ' + name + '?';\n    }\n    \n    function isChanged() {\n        const editor = CloudCmd.Edit.getEditor();\n        const is = editor.isChanged();\n        \n        if (!is)\n            return;\n        \n        const cancel = false;\n        Dialog.confirm(TITLE, MSG_CHANGED, {cancel})\n            .then(() => {\n                editor.save();\n            });\n    }\n    \n    init(callback);\n    \n    return EditFile;\n};\n\n\n\n//# sourceURL=file://cloudcmd/client/modules/edit-file.js");

/***/ })

/******/ });