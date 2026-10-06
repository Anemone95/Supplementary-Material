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
/******/ 		"./modules/menu": 0
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
/******/ 	deferredModules.push(["./client/modules/menu.js","cloudcmd.common"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./client/modules/menu.js":
/*!********************************!*\
  !*** ./client/modules/menu.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* global CloudCmd, DOM */\n\n\n\nCloudCmd.Menu = MenuProto;\n\nconst exec = __webpack_require__(/*! execon */ \"./node_modules/execon/lib/exec.js\");\nconst currify = __webpack_require__(/*! currify/legacy */ \"./node_modules/currify/legacy/index.js\");\nconst wrap = __webpack_require__(/*! wraptile/legacy */ \"./node_modules/wraptile/legacy/index.js\");\n\nconst {FS} = __webpack_require__(/*! ../../common/cloudfunc */ \"./common/cloudfunc.js\");\n\nconst load = __webpack_require__(/*! ../dom/load */ \"./client/dom/load.js\");\nconst RESTful = __webpack_require__(/*! ../dom/rest */ \"./client/dom/rest.js\");\n\nfunction MenuProto(Position) {\n    const config = CloudCmd.config;\n    const Buffer = DOM.Buffer;\n    const Info = DOM.CurrentInfo;\n    \n    let Loading = true;\n    const Key = CloudCmd.Key;\n    const Events = DOM.Events;\n    const Dialog = DOM.Dialog;\n    const Images = DOM.Images;\n    const Menu = this;\n    const TITLE = 'Cloud Commander';\n    const alert = currify(Dialog.alert, TITLE);\n    const alertNoFiles = wrap(Dialog.alert.noFiles)(TITLE);\n    const uploadTo = wrap(_uploadTo);\n    \n    let MenuShowedName;\n    let MenuContext;\n    let MenuContextFile;\n    \n    this.ENABLED = false;\n    \n    function init() {\n        Loading  = true;\n        Menu.show();\n        \n        Events.addKey(listener);\n    }\n    \n    this.hide = () => {\n        MenuContext.hide();\n        MenuContextFile.hide();\n    };\n    \n    this.show = (position) => {\n        const showFunc = () => {\n            show(position);\n            Images.hide();\n        };\n        \n        exec.if(window.MenuIO, showFunc, () => {\n            DOM.loadMenu((error) => {\n                if (error)\n                    return alert(error);\n                \n                showFunc();\n            });\n        });\n    };\n    \n    function getPosition(position) {\n        if (position)\n            return {\n                x: position.x,\n                y: position.y,\n            };\n        \n        if (Position)\n            return {\n                x: Position.x,\n                y: Position.y,\n            };\n        if (position)\n            return {\n                x: position.x,\n                y: position.y,\n            };\n       \n        return getCurrentPosition();\n    }\n    \n    function getMenuNameByEl(el) {\n        if (!el)\n            return 'context';\n        \n        const name = DOM.getCurrentName(el);\n        \n        if (name === '..')\n            return 'context';\n        \n        return 'contextFile';\n    }\n    \n    function getMenuByName(name) {\n        if (name === 'context')\n            return MenuContext;\n        \n        return MenuContextFile;\n    }\n    \n    function show(position) {\n        const {x, y} = getPosition(position);\n        \n        if (!Loading) {\n            MenuContext.show(x, y);\n            MenuContextFile.show(x, y);\n            return;\n        }\n        \n        loadFileMenuData((isAuth, menuDataFile) => {\n            const NOT_FILE = true;\n            const fm = DOM.getFM();\n            const menuData = getMenuData(isAuth);\n            const options = getOptions(NOT_FILE);\n            const optionsFile = getOptions();\n            const MenuIO = window.MenuIO;\n            \n            MenuContext = new MenuIO(fm, options, menuData);\n            MenuContextFile = new MenuIO(fm, optionsFile, menuDataFile);\n            \n            const el = DOM.getCurrentByPosition({x, y});\n            const menuName = getMenuNameByEl(el);\n            const menu = getMenuByName(menuName);\n            \n            menu.show(x, y);\n            \n            Loading = false;\n            Position = null;\n        });\n    }\n    \n    function getOptions(notFile) {\n        let name, func;\n        \n        if (notFile) {\n            name    = 'context';\n            func    = Key.unsetBind;\n        } else {\n            name    = 'contextFile';\n        }\n        \n        const options = {\n            icon        : true,\n            beforeClose : Key.setBind,\n            beforeShow  : exec.with(beforeShow, func),\n            beforeClick,\n            name,\n        };\n        \n        return options;\n    }\n    \n    function getMenuData(isAuth) {\n        const menu = {\n            'Paste': Buffer.paste,\n            'New': {\n                'File': DOM.promptNewFile,\n                'Directory': DOM.promptNewDir\n            },\n            'Upload': () => {\n                CloudCmd.Upload.show();\n            },\n            'Upload From Cloud': uploadFromCloud,\n            '(Un)Select All': DOM.toggleAllSelectedFiles\n        };\n        \n        if (isAuth)\n            menu['Log Out'] = CloudCmd.logOut;\n        \n        return menu;\n    }\n    \n    function loadFileMenuData(callback) {\n        const is = CloudCmd.config('auth');\n        const show = wrap((name) => {\n            CloudCmd[name].show();\n        });\n        \n        const menuBottom = getMenuData(is);\n        \n        const menuTop = {\n            'View': show('View'),\n            'Edit': show('EditFile'),\n            'Rename': () => {\n                setTimeout(DOM.renameCurrent, 100);\n            },\n            'Delete': () => {\n                CloudCmd.Operation.show('delete');\n            },\n            'Pack': () => {\n                CloudCmd.Operation.show('pack');\n            },\n            'Extract': () => {\n                CloudCmd.Operation.show('extract');\n            },\n            'Download': preDownload,\n            'Upload To Cloud': uploadTo('Cloud'),\n            'Cut': () => {\n                isCurrent(Buffer.cut, alertNoFiles);\n            },\n            'Copy': () => {\n                isCurrent(Buffer.copy, alertNoFiles);\n            },\n        };\n        \n        const menu = Object.assign({}, menuTop, menuBottom);\n        \n        callback(is, menu);\n    }\n    \n    function isCurrent(yesFn, noFn) {\n        if (Info.name !== '..')\n            return yesFn();\n        \n        noFn();\n    }\n    \n    function isPath(x, y) {\n        const {panel} = Info;\n        const isEmptyRoot = !panel;\n        \n        if (isEmptyRoot)\n            return false;\n        \n        const el = document.elementFromPoint(x, y);\n        const elements = panel.querySelectorAll('[data-name=\"js-path\"] *');\n        const is = ~[].indexOf.call(elements, el);\n        \n        return is;\n    }\n    \n    function beforeShow(callback, params) {\n        const name = params.name;\n        let el = DOM.getCurrentByPosition({\n            x: params.x,\n            y: params.y\n        });\n        \n        const menuName = getMenuNameByEl(el);\n        let notShow = menuName === 'contextFile';\n        \n        if (params.name === 'contextFile') {\n            notShow = !notShow;\n        }\n        \n        if (!notShow)\n            MenuShowedName = name;\n        \n        exec(callback);\n        \n        if (!notShow)\n            notShow = isPath(params.x, params.y);\n        \n        return notShow;\n    }\n    \n    function beforeClick(name) {\n        return MenuShowedName !== name;\n    }\n    \n    function _uploadTo(nameModule) {\n        Info.getData((error, data) => {\n            if (error)\n                return;\n            \n            const name = Info.name;\n            const execFrom = CloudCmd.execFromModule;\n             \n            execFrom(nameModule, 'uploadFile', name, data);\n        });\n        \n        CloudCmd.log('Uploading to ' + name + '...');\n    }\n    \n    function uploadFromCloud() {\n        Images.show.load('top');\n        \n        CloudCmd.execFromModule('Cloud', 'saveFile', (currentName, data) => {\n            const path = DOM.getCurrentDirPath() + currentName;\n            \n            RESTful.write(path,  data, (error) => {\n                if (error)\n                    return;\n                 \n                CloudCmd.refresh({currentName});\n            });\n        });\n    }\n    \n    function preDownload() {\n        download(config('packer'));\n    }\n    \n    function download(type) {\n        const TIME = 30 * 1000;\n        const prefixUr = CloudCmd.PREFIX_URL;\n        const PACK = '/pack';\n        const date = Date.now();\n        const files = DOM.getActiveFiles();\n        \n        if (!files.length)\n            return alertNoFiles();\n            \n        files.forEach((file) => {\n            const selected = DOM.isSelected(file);\n            const isDir = DOM.isCurrentIsDir(file);\n            const path = DOM.getCurrentPath(file);\n            \n            CloudCmd.log('downloading file ' + path + '...');\n            /*\n              * if we send ajax request -\n              * no need in hash so we escape #\n              * and all other characters, like \"%\"\n              */\n            const encodedPath = encodeURI(path).replace(/#/g, '%23');\n            const id = load.getIdBySrc(path);\n            \n            let src;\n            \n            if (isDir)\n                src = prefixUr + PACK + encodedPath + DOM.getPackerExt(type);\n            else\n                src = prefixUr + FS + encodedPath + '?download';\n            \n            const element = load({\n                id          : id + '-' + date,\n                name        : 'iframe',\n                async       : false,\n                className   : 'hidden',\n                src,\n            });\n            \n            const {body} = document;\n            const removeChild = body.removeChild.bind(body, element);\n            \n            setTimeout(removeChild, TIME);\n            \n            if (selected)\n                DOM.toggleSelectedFile(file);\n        });\n    }\n    \n    function getCurrentPosition() {\n        const current = Info.element;\n        const rect = current.getBoundingClientRect();\n        \n        const position = {\n            x: Math.round(rect.left + rect.width / 3),\n            y: Math.round(rect.top)\n        };\n        \n        return position;\n    }\n    \n    function listener(event) {\n        const F9 = Key.F9;\n        const ESC = Key.ESC;\n        const key = event.keyCode;\n        const isBind = Key.isBind();\n        \n        if (!isBind)\n            return;\n        \n        if (key === ESC)\n            return Menu.hide();\n        \n        if (key === F9) {\n            const position = getCurrentPosition();\n            MenuContext.show(position.x, position.y);\n            \n            event.preventDefault();\n        }\n    }\n    \n    init();\n}\n\n\n//# sourceURL=file://cloudcmd/client/modules/menu.js");

/***/ })

/******/ });