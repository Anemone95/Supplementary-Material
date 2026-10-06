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
/******/ 		"./modules/operation": 0
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
/******/ 	deferredModules.push(["./client/modules/operation/index.js","cloudcmd.common"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./client/modules/operation/index.js":
/*!*******************************************!*\
  !*** ./client/modules/operation/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* global CloudCmd */\n/* global Util */\n/* global DOM */\n/* global fileop */\n\n\n\nCloudCmd.Operation = OperationProto;\n\nconst currify = __webpack_require__(/*! currify/legacy */ \"./node_modules/currify/legacy/index.js\");\nconst wraptile = __webpack_require__(/*! wraptile/legacy */ \"./node_modules/wraptile/legacy/index.js\");\nconst exec = __webpack_require__(/*! execon */ \"./node_modules/execon/lib/exec.js\");\n\nconst RESTful = __webpack_require__(/*! ../../dom/rest */ \"./client/dom/rest.js\");\nconst removeExtension = __webpack_require__(/*! ./remove-extension */ \"./client/modules/operation/remove-extension.js\");\nconst setListeners = __webpack_require__(/*! ./set-listeners */ \"./client/modules/operation/set-listeners.js\");\n\nconst removeQuery = (a) => a.replace(/\\?.*/, '');\n\nfunction OperationProto(operation, data) {\n    const Name = 'Operation';\n    const {\n        TITLE,\n        config,\n    } = CloudCmd;\n    const {Dialog, Images} = DOM;\n    const initOperations = wraptile(_initOperations);\n    const authCheck = wraptile(_authCheck);\n    \n    let Loaded;\n    \n    let {\n        cp: copyFn,\n        mv: moveFn,\n        delete: deleteFn,\n        extract: extractFn,\n    } = RESTful;\n    \n    let packZipFn = RESTful.pack;\n    let packTarFn = RESTful.pack;\n    \n    const Info = DOM.CurrentInfo;\n    const showLoad = Images.show.load.bind(null, 'top');\n    const Operation = this;\n    const processFiles = currify(_processFiles);\n    \n    const noFilesCheck = () => {\n        const {length} = DOM.getActiveFiles();\n        const is = Boolean(!length);\n        \n        if (is)\n            return Dialog.alert.noFiles(TITLE);\n        \n        return is;\n    };\n    \n    function init() {\n        showLoad();\n        \n        exec.series([\n            DOM.loadSocket,\n            (callback) => {\n                if (!config('progress'))\n                    return callback();\n                \n                load(initOperations(CloudCmd.PREFIX, callback));\n            },\n            () => {\n                Loaded = true;\n                Images.hide();\n                Operation.show(operation, data);\n            }\n        ]);\n    }\n    \n    function _authCheck(spawn, ok) {\n        const accept = wraptile(ok);\n        const alertDialog = wraptile(Dialog.alert);\n        \n        spawn.on('accept', accept(spawn));\n        spawn.on('reject', alertDialog (TITLE, 'Wrong credentials!'));\n        spawn.emit('auth', config('username'), config('password'));\n    }\n    \n    function _initOperations(socketPrefix, fn) {\n        const prefix = `${socketPrefix}/fileop`;\n        fileop({prefix, socketPrefix}, (e, operator) => {\n            fn();\n            \n            operator.on('connect', authCheck(operator, onConnect));\n            operator.on('disconnect', onDisconnect);\n        });\n    }\n    \n    function onConnect(operator) {\n        packTarFn = (data, callback) => {\n            operator.tar(data.from, data.to, data.names)\n                .then(setListeners({noContinue: true}, callback));\n        };\n        \n        packZipFn = (data, callback) => {\n            operator.zip(data.from, data.to, data.names)\n                .then(setListeners({noContinue: true}, callback));\n        };\n        \n        deleteFn = (from, files, callback) => {\n            from = removeQuery(from);\n            operator.remove(from, files)\n                .then(setListeners(callback));\n        };\n        \n        copyFn = (data, callback) => {\n            operator.copy(data.from, data.to, data.names)\n                .then(setListeners(callback));\n        };\n        \n        extractFn = (data, callback) => {\n            operator.extract(data.from, data.to)\n                .then(setListeners({noContinue: true}, callback));\n        };\n    }\n    \n    function onDisconnect() {\n        packZipFn = RESTful.pack;\n        packTarFn = RESTful.pack;\n        deleteFn = RESTful.delete;\n        copyFn = RESTful.cp;\n        extractFn = RESTful.extract;\n    }\n    \n    function getPacker(type) {\n        if (type === 'zip')\n            return packZipFn;\n        \n        return packTarFn;\n    }\n    \n    this.hide = () => {\n        CloudCmd.View.hide();\n    };\n    \n    this.show = (operation, data) => {\n        if (!Loaded)\n            return;\n        \n        if (operation === 'copy')\n            return Operation.copy(data);\n        \n        if (operation === 'move')\n            return Operation.move(data);\n        \n        if (operation === 'delete')\n            return Operation.delete();\n        \n        if (operation === 'delete:silent')\n            return Operation.deleteSilent();\n        \n        if (operation === 'pack')\n            return Operation.pack();\n        \n        if (operation === 'extract')\n            return Operation.extract();\n    };\n    \n    this.copy = processFiles({\n        type: 'copy',\n    });\n    \n    this.move = processFiles({\n        type: 'move'\n    });\n    \n    this.delete = () => {\n        promptDelete();\n    };\n    \n    this.deleteSilent = () => {\n        deleteSilent();\n    };\n    \n    this.pack = () => {\n        const isZip = config('packer') === 'zip';\n        twopack('pack', isZip ? 'zip' : 'tar');\n    };\n    \n    this.extract = () => {\n        twopack('extract');\n    };\n    \n    /**\n     * prompt and delete current file or selected files\n     *\n     * @currentFile\n     */\n    function promptDelete() {\n        if (noFilesCheck())\n            return;\n        \n        const msgAsk = 'Do you really want to delete the ';\n        const msgSel = 'selected ';\n        \n        const files = DOM.getActiveFiles();\n        const names = DOM.getFilenames(files);\n        const n = names.length;\n        \n        let msg;\n        if (n) {\n            let name = '';\n            \n            for (let i = 0; i < 5 && i < n; i++)\n                name += '\\n' + names[i];\n            \n            if (n >= 5)\n                name += '\\n...';\n            \n            msg = msgAsk + msgSel + n + ' files/directories?\\n' + name ;\n        } else {\n            const current = DOM.getCurrentFile();\n            const isDir = DOM.isCurrentIsDir(current);\n            const getType = (isDir) => {\n                return isDir ? 'directory' : 'file';\n            };\n            \n            const type = getType(isDir) + ' ';\n            \n            const name = DOM.getCurrentName(current);\n            msg = msgAsk + msgSel + type + name + '?';\n        }\n        \n        const cancel = false;\n        \n        Dialog.confirm(TITLE, msg, {cancel}).then(() => {\n            deleteSilent(files);\n        });\n    }\n    \n    /**\n     * delete current or selected files\n     *\n     * @files\n     */\n    function deleteSilent(files = DOM.getActiveFiles()) {\n        const query = '?files';\n        const path = Info.dirPath;\n        \n        if (noFilesCheck())\n            return;\n        \n        showLoad();\n        \n        const names = DOM.getFilenames(files);\n        \n        deleteFn(path + query, names, (error) => {\n            const Storage = DOM.Storage;\n            const dirPath = Info.dirPath;\n            \n            if (error)\n                return CloudCmd.refresh();\n             \n            DOM.deleteSelected(files);\n            Storage.removeMatch(dirPath);\n        });\n    }\n    \n    /*\n     * process files (copy or move)\n     * @param data\n     * @param operation\n     */\n    function _processFiles(options, data) {\n        let selFiles, files;\n        let panel;\n        let shouldAsk;\n        let sameName;\n        let ok;\n        \n        let from = '';\n        let to = '';\n        \n        let names = [];\n        \n        if (data) {\n            from        = data.from;\n            to          = data.to;\n            names       = data.names;\n            panel       = Info.panel;\n        } else {\n            from        = Info.dirPath;\n            to          = DOM.getNotCurrentDirPath();\n            selFiles    = DOM.getSelectedFiles();\n            names       = DOM.getFilenames(selFiles);\n            data        = {};\n            shouldAsk   = true;\n            panel       = Info.panelPassive;\n        }\n        \n        if (!names.length)\n            names.push(DOM.getCurrentName());\n        \n        const name = names[0];\n        \n        sameName = DOM.getCurrentByName(name, panel);\n        \n        if (!data && noFilesCheck())\n            return;\n        \n        const {type} = options;\n        \n        const isCopy = type === 'copy';\n        const option = isCopy ? 'confirmCopy' : 'confirmMove';\n        const title = isCopy ? 'Copy' : 'Rename/Move';\n        const operation = isCopy ? copyFn : moveFn;\n        \n        if (shouldAsk && config(option))\n            return message(title, to, names)\n                .then(ask);\n        \n        ask(to);\n        \n        function ask(to) {\n            ok = from !== to && to;\n            \n            if (ok && !shouldAsk || !sameName)\n                return go();\n            \n            const str = `\"${ name }\" already exist. Overwrite?`;\n            const cancel = false;\n            \n            Dialog.confirm(TITLE, str, {cancel}).then(go);\n            \n            function go() {\n                showLoad();\n                 \n                files   = {\n                    from    : from,\n                    to      : to,\n                    names   : names\n                };\n                \n                operation(files, (error) => {\n                    !error && DOM.Storage.remove(from, () => {\n                        const {\n                            panel,\n                            panelPassive,\n                        } = Info;\n                        \n                        const setCurrent = () => {\n                            const currentName = name || data.names[0];\n                            DOM.setCurrentByName(currentName);\n                        };\n                        \n                        if (!Info.isOnePanel)\n                            CloudCmd.refresh({\n                                panel: panelPassive,\n                                noCurrent: true,\n                            });\n                        \n                        CloudCmd.refresh({panel}, setCurrent);\n                    });\n                });\n            }\n        }\n    }\n    \n    function checkEmpty(name, operation) {\n        if (!operation)\n            throw Error(name + ' could not be empty!');\n    }\n    \n    function twopack(operation, type) {\n        let op;\n        let fileFrom;\n        let currentName = Info.name;\n        \n        const Images = DOM.Images;\n        const path = Info.path;\n        const dirPath = Info.dirPath;\n        const activeFiles = DOM.getActiveFiles();\n        const names = DOM.getFilenames(activeFiles);\n        \n        checkEmpty('operation', operation);\n        \n        if (!names.length)\n            return Dialog.alert.noFiles(TITLE);\n        \n        switch(operation) {\n        case 'extract':\n            op = extractFn;\n            \n            fileFrom   = {\n                from: path,\n                to: dirPath\n            };\n            \n            currentName = removeExtension(currentName);\n            \n            break;\n        \n        case 'pack':\n            op = getPacker(type);\n            \n            if (names.length > 1)\n                currentName  = Info.dir;\n            \n            currentName += DOM.getPackerExt(type);\n            \n            fileFrom = {\n                from: dirPath,\n                to: dirPath + currentName,\n                names,\n            };\n            break;\n        }\n        \n        Images.show.load('top');\n        \n        op(fileFrom, (error) => {\n            !error && CloudCmd.refresh({\n                currentName\n            });\n        });\n    }\n    \n    function message(msg, to, names) {\n        const n = names.length;\n        const name = names[0];\n        \n        msg += ' ';\n        \n        if (names.length > 1)\n            msg     += n + ' file(s)';\n        else\n            msg     += '\"' + name + '\"';\n        \n        msg += ' to';\n        \n        const cancel = false;\n        \n        return Dialog.prompt(TITLE, msg, to, {cancel});\n    }\n    \n    function load(callback) {\n        const prefix = CloudCmd.PREFIX;\n        const file = `${prefix}/fileop/fileop.js`;\n        \n        DOM.load.js(file, (error) => {\n            if (error) {\n                Dialog.alert(TITLE, error.message);\n                return exec(callback);\n            }\n            \n            Loaded = true;\n            Util.timeEnd(Name + ' load');\n            exec(callback);\n        });\n        \n        Util.time(Name + ' load');\n    }\n    \n    init();\n}\n\n\n\n//# sourceURL=file://cloudcmd/client/modules/operation/index.js");

/***/ }),

/***/ "./client/modules/operation/remove-extension.js":
/*!******************************************************!*\
  !*** ./client/modules/operation/remove-extension.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nconst {getExt} = __webpack_require__(/*! ../../../common/util */ \"./common/util.js\");\n\nmodule.exports = (name) => {\n    const ext = getExtension(name);\n    \n    return name.replace(ext, '');\n};\n\nfunction getExtension(name) {\n    if (/\\.tar\\.gz$/.test(name))\n        return '.tar.gz';\n    \n    if (/\\.tar\\.bz2$/.test(name))\n        return '.tar.bz2';\n    \n    return getExt(name);\n}\n\n\n\n//# sourceURL=file://cloudcmd/client/modules/operation/remove-extension.js");

/***/ }),

/***/ "./client/modules/operation/set-listeners.js":
/*!***************************************************!*\
  !*** ./client/modules/operation/set-listeners.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/* global DOM */\n/* global CloudCmd */\n\nconst {\n    Images,\n    Dialog,\n} = DOM;\n\nconst forEachKey = __webpack_require__(/*! for-each-key/legacy */ \"./node_modules/for-each-key/legacy/index.js\");\nconst {\n    TITLE,\n} = CloudCmd;\n\nmodule.exports = (options, callback) => (emitter) => {\n    if (!callback) {\n        callback = options;\n        options = {};\n    }\n    \n    let done;\n    let lastError;\n    \n    const removeListener = emitter.removeListener.bind(emitter);\n    const on = emitter.on.bind(emitter);\n    \n    const listeners = {\n        progress: (value) => {\n            done = value === 100;\n            Images.setProgress(value);\n        },\n        \n        end: () => {\n            Images\n                .hide()\n                .clearProgress();\n            \n            forEachKey(removeListener, listeners);\n            \n            if (lastError || done)\n                callback(lastError);\n        },\n        \n        error: (error) => {\n            lastError = error;\n            \n            if (options.noContinue) {\n                listeners.end(error);\n                Dialog.alert(TITLE, error);\n                return;\n            }\n            \n            Dialog.confirm(TITLE, error + '\\n Continue?')\n                .then(() => {\n                    emitter.continue();\n                }, () => {\n                    emitter.abort();\n                });\n        }\n    };\n    \n    forEachKey(on, listeners);\n};\n\n\n\n//# sourceURL=file://cloudcmd/client/modules/operation/set-listeners.js");

/***/ })

/******/ });