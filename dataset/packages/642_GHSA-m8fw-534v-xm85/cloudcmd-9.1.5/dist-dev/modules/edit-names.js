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
/******/ 		"./modules/edit-names": 0
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
/******/ 	deferredModules.push(["./client/modules/edit-names.js","cloudcmd.common"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./client/modules/edit-names.js":
/*!**************************************!*\
  !*** ./client/modules/edit-names.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/* global CloudCmd, DOM */\n\nconst currify = __webpack_require__(/*! currify/legacy */ \"./node_modules/currify/legacy/index.js\");\nconst exec = __webpack_require__(/*! execon */ \"./node_modules/execon/lib/exec.js\");\n\nconst reject = Promise.reject.bind(Promise);\n\nCloudCmd.EditNames = function EditNamesProto(callback) {\n    const Info = DOM.CurrentInfo;\n    const Dialog = DOM.Dialog;\n    \n    const TITLE = 'Edit Names';\n    const alert = currify(Dialog.alert, TITLE);\n    const refresh = currify(_refresh);\n    \n    const EditNames = this;\n    let Menu, MenuIO;\n    const ConfigView  = {\n        beforeClose: () => {\n            exec.ifExist(Menu, 'hide');\n            isChanged();\n            DOM.Events.remove('keydown', keyListener);\n        }\n    };\n    \n    function init(callback) {\n        let editor;\n        \n        exec.series([\n            CloudCmd.Edit,\n            \n            (callback) => {\n                editor = CloudCmd.Edit.getEditor();\n                callback();\n            },\n            \n            (callback) => {\n                setListeners(editor);\n                callback();\n            },\n            \n            (callback) => {\n                EditNames.show();\n                callback();\n            },\n        ], callback);\n    }\n    \n    this.show = () => {\n        const names = getActiveNames().join('\\n');\n        \n        if (Info.name === '..' && names.length === 1)\n            return Dialog.alert.noFiles(TITLE);\n        \n        CloudCmd.Edit\n            .getEditor()\n            .setValueFirst('edit-names', names)\n            .setMode()\n            .setOption('keyMap', 'default')\n            .disableKey();\n        \n        DOM.Events.addKey(keyListener);\n        \n        CloudCmd.Edit.show(ConfigView);\n    };\n    \n    function keyListener(event) {\n        const ctrl = event.ctrlKey;\n        const meta = event.metaKey;\n        const ctrlMeta = ctrl || meta;\n        const Key = CloudCmd.Key;\n        \n        if (!ctrlMeta || event.keyCode !== Key.S)\n            return;\n        \n        EditNames.hide();\n    }\n    \n    function getActiveNames() {\n        return DOM.getFilenames(DOM.getActiveFiles());\n    }\n    \n    this.hide = () => {\n        CloudCmd.Edit.hide();\n    };\n    \n    function setListeners() {\n        const element = CloudCmd.Edit.getElement();\n        \n        DOM.Events.addOnce('contextmenu', element, setMenu);\n    }\n    \n    function applyNames() {\n        const dir = Info.dirPath;\n        const from = getActiveNames();\n        const nameIndex = from.indexOf(Info.name);\n        \n        const editor = CloudCmd.Edit.getEditor();\n        const to = editor\n            .getValue()\n            .split('\\n');\n        \n        const root = CloudCmd.config('root');\n        \n        Promise.resolve(root)\n            .then(rename(dir, from, to))\n            .then(refresh(to, nameIndex))\n            .catch(alert);\n    }\n    \n    function _refresh(to, nameIndex, res) {\n        if (res.status === 404)\n            return res.text().then(reject);\n        \n        const currentName = to[nameIndex];\n        \n        CloudCmd.refresh({\n            currentName\n        });\n    }\n    \n    function getDir(root, dir) {\n        if (root === '/')\n            return dir;\n        \n        return root + dir;\n    }\n    \n    function rename(dir, from, to) {\n        return (root) => {\n            return fetch(CloudCmd.PREFIX + '/rename', {\n                method: 'put',\n                credentials: 'include',\n                body: JSON.stringify({\n                    from: from,\n                    to: to,\n                    dir: getDir(root, dir)\n                })\n            });\n        };\n    }\n    \n    function setMenu(event) {\n        const position = {\n            x: event.clientX,\n            y: event.clientY\n        };\n        \n        event.preventDefault();\n        \n        !Menu && DOM.loadRemote('menu', (error) => {\n            MenuIO = window.MenuIO;\n            let noFocus;\n            const editor = CloudCmd.Edit.getEditor();\n            const options = {\n                beforeShow: (params) => {\n                    params.x -= 18;\n                    params.y -= 27;\n                },\n                \n                afterClick: () => {\n                    !noFocus && editor.focus();\n                }\n            };\n            \n            const menuData = {\n                'Save           Ctrl+S' : () => {\n                    editor.save();\n                    EditNames.hide();\n                },\n                'Go To Line     Ctrl+G' : () => {\n                    noFocus = true;\n                    editor.goToLine();\n                },\n                'Cut            Ctrl+X' : () => {\n                    editor.cutToClipboard();\n                },\n                'Copy           Ctrl+C' : () => {\n                    editor.copyToClipboard();\n                },\n                'Paste          Ctrl+V' : () => {\n                    editor.pasteFromClipboard();\n                },\n                'Delete         Del'    : () => {\n                    editor.remove('right');\n                },\n                'Select All     Ctrl+A' : () => {\n                    editor.selectAll();\n                },\n                'Close          Esc'    : () => {\n                    EditNames.hide();\n                }\n            };\n            \n            if (error)\n                return alert(error);\n            \n            if (Menu || !MenuIO)\n                return;\n                \n            const element = CloudCmd.Edit.getElement();\n            \n            Menu = new MenuIO(element, options, menuData);\n            Menu.show(position.x, position.y);\n        });\n    }\n    \n    function isChanged() {\n        const editor = CloudCmd.Edit.getEditor();\n        const msg = 'Apply new names?';\n        \n        if (!editor.isChanged())\n            return;\n        \n        Dialog.confirm(TITLE, msg)\n            .then(EditNames.hide)\n            .then(applyNames)\n            .catch(EditNames.hide);\n    }\n    \n    init(callback);\n};\n\n\n\n//# sourceURL=file://cloudcmd/client/modules/edit-names.js");

/***/ })

/******/ });