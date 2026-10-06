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
/******/ 		"cloudcmd": 0
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
/******/ 	deferredModules.push(["./client/cloudcmd.js","cloudcmd.common"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./client/client.js":
/*!**************************!*\
  !*** ./client/client.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/* global Util, DOM */\n\nconst itype = __webpack_require__(/*! itype/legacy */ \"./node_modules/itype/legacy/index.js\");\nconst Emitify = __webpack_require__(/*! emitify/legacy */ \"./node_modules/emitify/legacy/index.js\");\nconst inherits = __webpack_require__(/*! inherits */ \"./node_modules/inherits/inherits_browser.js\");\nconst rendy = __webpack_require__(/*! rendy */ \"./node_modules/rendy/lib/rendy.js\");\nconst exec = __webpack_require__(/*! execon */ \"./node_modules/execon/lib/exec.js\");\nconst Images = __webpack_require__(/*! ./dom/images */ \"./client/dom/images.js\");\nconst join = __webpack_require__(/*! join-io/www/join */ \"./node_modules/join-io/www/join.js\");\nconst jonny = __webpack_require__(/*! jonny/legacy */ \"./node_modules/jonny/legacy/index.js\");\nconst currify = __webpack_require__(/*! currify/legacy */ \"./node_modules/currify/legacy/index.js\");\n\nconst bind = (f, ...a) => () => f(...a);\n\nconst {\n    apiURL,\n    formatMsg,\n    buildFromJSON,\n} = __webpack_require__(/*! ../common/cloudfunc */ \"./common/cloudfunc.js\");\n\n/* global Util, DOM */\n\ninherits(CloudCmdProto, Emitify);\n\nmodule.exports = new CloudCmdProto(Util, DOM);\n\nfunction CloudCmdProto(Util, DOM) {\n    let Key;\n    let Debug;\n    let Listeners;\n    \n    const log = (str) => {\n        if (!Debug)\n            return;\n        \n        console.log(str);\n    };\n    \n    Emitify.call(this);\n    \n    const CloudCmd = this;\n    const Info = DOM.CurrentInfo;\n    const Storage = DOM.Storage;\n    const Files = DOM.Files;\n    \n    this.log = log;\n    this.PREFIX = '';\n    this.PREFIX_URL = '';\n    this.DIRCLIENT = '/dist/';\n    this.DIRCLIENT_MODULES = this.DIRCLIENT + 'modules/';\n    \n    this.MIN_ONE_PANEL_WIDTH    = 1155;\n    this.HOST                   = location.origin ||\n                                  location.protocol + '//' + location.host;\n    \n    const TITLE = 'Cloud Commander';\n    this.TITLE = TITLE;\n    \n    this.sort = {\n        left: 'name',\n        right: 'name',\n    };\n    \n    this.order = {\n        left: 'asc',\n        right: 'asc',\n    };\n    \n    log.enable = () => {\n        Debug = true;\n    };\n    \n    log.disable = () => {\n        Debug = false;\n    };\n    \n    const kebabToCamelCase = Util.kebabToCamelCase;\n    \n    /**\n     * Функция привязываеться ко всем ссылкам и\n     *  загружает содержимое каталогов\n     *\n     * @param params - {\n     *          paramLink - ссылка\n     *          needRefresh - необходимость обязательной загрузки данных с сервера\n     *          panel\n     *      }\n     * @param callback\n     */\n    this.loadDir = (params, callback) => {\n        const p = params;\n        \n        const refresh = p.isRefresh;\n        const panel = p.panel;\n        const history = p.history;\n        const noCurrent = p.noCurrent;\n        const currentName = p.currentName;\n        \n        let panelChanged;\n        if (!noCurrent)\n            if (panel && panel !== Info.panel) {\n                DOM.changePanel();\n                panelChanged = true;\n            }\n        \n        let imgPosition;\n        if (panelChanged || refresh || !history)\n            imgPosition = 'top';\n        \n        Images.show.load(imgPosition, panel);\n        \n        /* загружаем содержимое каталога */\n        ajaxLoad(p.path, {\n            refresh,\n            history,\n            noCurrent,\n            currentName,\n        }, panel, callback);\n    };\n    \n    /**\n     * function load modules\n     * @params = {name, path, func, dobefore, arg}\n     */\n    function loadModule(params) {\n        if (!params)\n            return;\n        \n        let path = params.path;\n        const name = params.name || path && kebabToCamelCase(path);\n        const func = params.func;\n        const funcName = params.funcName;\n        const doBefore = params.dobefore;\n        \n        const isContain = /\\.js/.test(path);\n        \n        if (!isContain)\n            path += '.js';\n        \n        if (CloudCmd[name])\n            return;\n        \n        CloudCmd[name] = (...args) => {\n            const prefix = CloudCmd.PREFIX;\n            const pathFull = prefix + CloudCmd.DIRCLIENT_MODULES + path;\n            \n            exec(doBefore);\n            \n            const done = (error) => {\n                const Proto = CloudCmd[name];\n                \n                if (error || !itype.function(Proto))\n                    return;\n                \n                CloudCmd[name] = applyConstructor(Proto, args);\n            };\n            \n            return DOM.load.js(pathFull, func || done);\n        };\n        \n        CloudCmd[name][funcName] = CloudCmd[name];\n    }\n    \n    /*\n     * apply arguemnts to constructor\n     *\n     * @param constructor\n     * @param args\n     */\n    function applyConstructor(constructor, args) {\n        const F = function () {\n            return constructor.apply(this, args);\n        };\n        \n        F.prototype = constructor.prototype;\n        return new F();\n    }\n    \n    /**\n     * Конструктор CloudClient, который\n     * выполняет весь функционал по\n     * инициализации\n     */\n    this.init = (prefix, config) => {\n        const func = bind(exec.series, [\n            initModules,\n            baseInit,\n            loadPlugins,\n            exec.with(CloudCmd.route, location.hash),\n        ]);\n        \n        const funcBefore  = (callback) => {\n            const src = prefix + '/join:' + [\n                CloudCmd.DIRCLIENT_MODULES + 'polyfill.js',\n                '/modules/domtokenlist-shim/dist/domtokenlist.min.js',\n            ].join(':');\n            \n            DOM.loadJquery(() => {\n                DOM.load.js(src, callback);\n            });\n        };\n        \n        CloudCmd.PREFIX = prefix;\n        CloudCmd.PREFIX_URL = prefix + apiURL;\n        \n        CloudCmd.config = (key) => config[key];\n        CloudCmd.config.if = currify((key, fn, a) => config[key] && fn(a));\n        CloudCmd._config = (key, value) => {\n            /*\n             * should be called from config.js only\n             * after successful update on server\n             */\n            config[key] = value;\n        };\n        \n        DOM.Storage.setAllowed(CloudCmd.config('localStorage'));\n        \n        if (config.onePanelMode)\n            CloudCmd.MIN_ONE_PANEL_WIDTH = Infinity;\n        \n        exec.if(document.body.scrollIntoViewIfNeeded, func, funcBefore);\n    };\n    \n    function loadPlugins(callback) {\n        const prefix = CloudCmd.PREFIX;\n        const plugins = prefix + '/plugins.js';\n        \n        DOM.load.js(plugins, callback);\n    }\n    \n    this.join = (urls) => {\n        const prefix  = CloudCmd.PREFIX;\n        \n        if (!Array.isArray(urls))\n            throw Error('urls should be array!');\n        \n        const noPrefixUrls = urls.map((url) => {\n            return url.replace(prefix, '');\n        });\n        \n        return prefix + join(noPrefixUrls);\n    };\n    \n    this.route = (path) => {\n        const query = path.split('/');\n        \n        if (!path)\n            return;\n        \n        const [kebabModule] = query;\n        const module = kebabToCamelCase(kebabModule.slice(1));\n        \n        const file = query[1];\n        const current = DOM.getCurrentByName(file);\n        \n        if (file && !current) {\n            const msg = formatMsg('set current file', file, 'error');\n            CloudCmd.log(msg);\n            return;\n        }\n        \n        DOM.setCurrentFile(current);\n        \n        CloudCmd.execFromModule(module, 'show');\n    };\n    \n    this.logOut = () => {\n        const url = CloudCmd.PREFIX + '/logout';\n        const error = () => document.location.reload();\n        \n        DOM.load.ajax({url, error});\n    };\n    \n    function initModules(callback) {\n        exec.if(CloudCmd.Key, () => {\n            Key = new CloudCmd.Key();\n            CloudCmd.Key = Key;\n            Key.bind();\n        }, (func) => {\n            /* привязываем клавиши к функциям */\n            const path = 'key.js';\n            \n            loadModule({\n                path,\n                func\n            });\n        });\n        \n        Files.get('modules', (error, modules) => {\n            const showLoad = Images.show.load;\n            \n            const doBefore = {\n                'edit': showLoad,\n                'menu': showLoad,\n            };\n            \n            const load = (name, path, dobefore) => {\n                const isTmpl = path === 'template';\n                const funcName = isTmpl ? 'get' : 'show';\n                \n                loadModule({\n                    name,\n                    path,\n                    dobefore,\n                    funcName,\n                });\n            };\n            \n            if (!modules)\n                modules = [];\n            \n            modules.local.forEach((module) => {\n                load(null, module, doBefore[module]);\n            });\n            \n            callback();\n        });\n    }\n    \n    function baseInit(callback) {\n        const files = DOM.getFiles();\n        \n        CloudCmd.on('current-file', DOM.updateCurrentInfo);\n        \n        /* выделяем строку с первым файлом */\n        if (files)\n            DOM.setCurrentFile(files[0], {\n                // when hash is present\n                // it should be handled with this.route\n                // overwre otherwise\n                history: !location.hash\n            });\n        \n        const dirPath = DOM.getCurrentDirPath();\n        Listeners = CloudCmd.Listeners;\n        Listeners.init();\n        \n        const panels = getPanels();\n        panels.forEach(Listeners.setOnPanel);\n        \n        Listeners.initKeysPanel();\n        \n        if (!CloudCmd.config('dirStorage'))\n            return callback();\n        \n        Storage.get(dirPath, (error, data) => {\n            if (!data) {\n                data = getJSONfromFileTable();\n                Storage.set(dirPath, data);\n            }\n            callback();\n        });\n    }\n    \n    function getPanels() {\n        const panels = ['left'];\n        \n        if (CloudCmd.config('onePanelMode'))\n            return panels;\n        \n        return [\n            ...panels,\n            'right',\n        ];\n    }\n    \n    this.execFromModule = (moduleName, funcName, ...args) => {\n        const obj = CloudCmd[moduleName];\n        const isObj = itype.object(obj);\n        \n        exec.if(isObj, () => {\n            const obj = CloudCmd[moduleName];\n            const func = obj[funcName];\n            \n            func(...args);\n        }, obj);\n    };\n    \n    this.refresh = (options = {}, callback) => {\n        if (!callback && typeof options === 'function') {\n            callback = options;\n            options = {};\n        }\n       \n        const panel = options.panel || Info.panel;\n        const path = DOM.getCurrentDirPath(panel);\n        \n        const isRefresh = true;\n        const history = false;\n        const noCurrent = options ? options.noCurrent : false;\n        const currentName = options.currentName;\n        \n        CloudCmd.loadDir({\n            path,\n            isRefresh,\n            history,\n            panel,\n            noCurrent,\n            currentName,\n        }, callback);\n    };\n    \n    /**\n     * Функция загружает json-данные о Файловой Системе\n     * через ajax-запрос.\n     * @param path - каталог для чтения\n     * @param options\n     * { refresh, history } - необходимость обновить данные о каталоге\n     * @param panel\n     * @param callback\n     *\n     */\n    function ajaxLoad(path, options, panel, callback) {\n        const create = (error, json) => {\n            const RESTful = DOM.RESTful;\n            const name = options.currentName || Info.name;\n            const obj = jonny.parse(json);\n            const isRefresh = options.refresh;\n            const noCurrent = options.noCurrent;\n            \n            if (!isRefresh && json)\n                return createFileTable(obj, panel, options, callback);\n            \n            const position = DOM.getPanelPosition(panel);\n            const sort = CloudCmd.sort[position];\n            const order = CloudCmd.order[position];\n            \n            const query = rendy('?sort={{ sort }}&order={{ order }}', {\n                sort,\n                order,\n            });\n            \n            RESTful.read(path + query, 'json', (error, obj) => {\n                if (error)\n                    return;\n                \n                options.sort = sort;\n                options.order = order;\n                \n                createFileTable(obj, panel, options, () => {\n                    if (isRefresh && !noCurrent)\n                        DOM.setCurrentByName(name);\n                    \n                    exec(callback);\n                });\n                \n                if (!CloudCmd.config('dirStorage'))\n                    return;\n                \n                Storage.set(path, obj);\n            });\n        };\n        \n        if (!options)\n            options    = {};\n        \n        CloudCmd.log('reading dir: \"' + path + '\";');\n        \n        if (!CloudCmd.config('dirStorage'))\n            return create();\n        \n        Storage.get(path, create);\n    }\n    \n    /**\n     * Функция строит файловую таблицу\n     * @param json  - данные о файлах\n     * @param panelParam\n     * @param history\n     * @param callback\n     */\n    function createFileTable(json, panelParam, options, callback) {\n        const {\n            history,\n            noCurrent,\n        } = options;\n        \n        const names = ['file', 'path', 'link', 'pathLink'];\n        \n        Files.get(names, (error, templFile, templPath, templLink, templPathLink) => {\n            const Dialog = DOM.Dialog;\n            const panel = panelParam || DOM.getPanel();\n            \n            const {\n                dir,\n                name,\n            } = Info;\n            \n            if (error)\n                return Dialog.alert(TITLE, error.responseText);\n            \n            const childNodes = panel.childNodes;\n            let i = childNodes.length;\n            \n            while (i--)\n                panel.removeChild(panel.lastChild);\n            \n            panel.innerHTML = buildFromJSON({\n                sort        : options.sort,\n                order       : options.order,\n                data        : json,\n                id          : panel.id,\n                prefix      : CloudCmd.PREFIX,\n                template    : {\n                    file        : templFile,\n                    path        : templPath,\n                    pathLink    : templPathLink,\n                    link        : templLink\n                }\n            });\n            \n            Listeners.setOnPanel(panel);\n            \n            if (!noCurrent) {\n                let current;\n                \n                if (name === '..' && dir !== '/')\n                    current = DOM.getCurrentByName(dir);\n                \n                if (!current)\n                    current = DOM.getFiles(panel)[0];\n                \n                DOM.setCurrentFile(current, {\n                    history: history\n                });\n                \n                CloudCmd.emit('active-dir', Info.dirPath);\n            }\n            \n            exec(callback);\n        });\n    }\n    \n    /**\n     * Функция генерирует JSON из html-таблицы файлов и\n     * используеться при первом заходе в корень\n     */\n    function getJSONfromFileTable() {\n        const path = DOM.getCurrentDirPath();\n        const infoFiles = Info.files || [];\n        \n        const notParent = (current) => {\n            const name = DOM.getCurrentName(current);\n            return name !== '..';\n        };\n        \n        const parse = (current) => {\n            const name = DOM.getCurrentName(current);\n            const size = DOM.getCurrentSize(current);\n            const owner = DOM.getCurrentOwner(current);\n            const mode = DOM.getCurrentMode(current);\n            const date = DOM.getCurrentDate(current);\n            \n            return {\n                name,\n                size,\n                mode,\n                owner,\n                date,\n            };\n        };\n        \n        const files = infoFiles\n            .filter(notParent)\n            .map(parse);\n        \n        const fileTable = {\n            path,\n            files,\n        };\n        \n        return fileTable;\n    }\n    \n    this.goToParentDir = () => {\n        const dir = Info.dir;\n        const {\n            dirPath,\n            parentDirPath,\n        } = Info;\n        \n        if (dirPath === parentDirPath)\n            return;\n        \n        const path = parentDirPath;\n        \n        CloudCmd.loadDir({path}, () => {\n            const {panel} = Info;\n            const current = DOM.getCurrentByName(dir);\n            const first = DOM.getFiles(panel)[0];\n            \n            DOM.setCurrentFile(current || first, {\n                history\n            });\n        });\n    };\n}\n\n\n\n//# sourceURL=file://cloudcmd/client/client.js");

/***/ }),

/***/ "./client/cloudcmd.js":
/*!****************************!*\
  !*** ./client/cloudcmd.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n__webpack_require__(/*! ../css/main.css */ \"./css/main.css\");\n__webpack_require__(/*! ../css/nojs.css */ \"./css/nojs.css\");\n__webpack_require__(/*! ../css/columns/name-size-date.css */ \"./css/columns/name-size-date.css\");\n__webpack_require__(/*! ../css/columns/name-size.css */ \"./css/columns/name-size.css\");\n\n// prevent additional loading of exec by spero, remedy, ishtar, salam, omnes\nwindow.exec = __webpack_require__(/*! execon */ \"./node_modules/execon/lib/exec.js\");\n\n// prevent additional loading of emitify\nwindow.Emitify = __webpack_require__(/*! emitify/legacy */ \"./node_modules/emitify/legacy/index.js\");\n\nmodule.exports = window.CloudCmd = (config) => {\n    window.Promise = window.Promise || __webpack_require__(/*! es6-promise */ \"es6-promise\");\n    window.Util = __webpack_require__(/*! ../common/util */ \"./common/util.js\");\n    window.CloudFunc = __webpack_require__(/*! ../common/cloudfunc */ \"./common/cloudfunc.js\");\n    \n    const DOM = __webpack_require__(/*! ./dom */ \"./client/dom/index.js\");\n    \n    window.DOM = DOM;\n    window.CloudCmd = __webpack_require__(/*! ./client */ \"./client/client.js\");\n    \n    const Dialog = __webpack_require__(/*! ./dom/dialog */ \"./client/dom/dialog.js\");\n    \n    const prefix = getPrefix(config.prefix);\n    const {htmlDialogs} = config;\n    \n    DOM.Dialog = Dialog(prefix, {\n        htmlDialogs\n    });\n    \n    __webpack_require__(/*! ./listeners */ \"./client/listeners/index.js\");\n    __webpack_require__(/*! ./key */ \"./client/key/index.js\");\n    __webpack_require__(/*! ./sort */ \"./client/sort.js\");\n    \n    window.CloudCmd.init(prefix, config);\n};\n\nfunction getPrefix(prefix) {\n    if (!prefix)\n        return '';\n   \n    if (!prefix.indexOf('/'))\n        return prefix;\n    \n    return '/' + prefix;\n}\n\n\n\n//# sourceURL=file://cloudcmd/client/cloudcmd.js");

/***/ }),

/***/ "./client/dom/dialog.js":
/*!******************************!*\
  !*** ./client/dom/dialog.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* global DOM */\n/* global smalltalk */\n\n\n\nmodule.exports = Dialog;\n\nfunction Dialog(prefix, config) {\n    if (!(this instanceof Dialog))\n        return new Dialog(prefix, config);\n    \n    load(config.htmlDialogs);\n    \n    function getJsName(htmlDialogs) {\n        const is = window.Promise;\n        const js = '.min.js';\n        const jsName = is ? js : '.poly' + js;\n        \n        if (!htmlDialogs)\n            return '.native' + jsName;\n        \n        return jsName;\n    }\n    \n    function load(htmlDialogs) {\n        const noop = () => {};\n        const name = 'smalltalk';\n        const dir = '/modules/' + name + '/dist/';\n        const jsName = getJsName(htmlDialogs);\n        \n        const names = [jsName, '.min.css'].map((ext) => {\n            return prefix + dir + name + ext;\n        });\n        \n        DOM.load.parallel(names, noop);\n    }\n    \n    const alert = (title, message) => {\n        return smalltalk.alert(title, message);\n    };\n    \n    this.alert = alert;\n    \n    this.prompt = (title, message, value, options) => {\n        return smalltalk.prompt(title, message, value, options);\n    };\n    \n    this.confirm = (title, message, options) => {\n        return smalltalk.confirm(title, message, options);\n    };\n    \n    this.alert.noFiles = (title) => {\n        return alert(title, 'No files selected!');\n    };\n}\n\n\n\n//# sourceURL=file://cloudcmd/client/dom/dialog.js");

/***/ }),

/***/ "./client/key/index.js":
/*!*****************************!*\
  !*** ./client/key/index.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* global CloudCmd, DOM */\n\n\n\nconst Info = DOM.CurrentInfo;\n\nconst exec = __webpack_require__(/*! execon */ \"./node_modules/execon/lib/exec.js\");\n\nconst Events = __webpack_require__(/*! ../dom/events */ \"./client/dom/events.js\");\nconst Buffer = __webpack_require__(/*! ../dom/buffer */ \"./client/dom/buffer.js\");\nconst KEY = __webpack_require__(/*! ./key */ \"./client/key/key.js\");\nconst vim = __webpack_require__(/*! ./vim */ \"./client/key/vim/index.js\");\nconst setCurrentByChar = __webpack_require__(/*! ./set-current-by-char */ \"./client/key/set-current-by-char.js\");\nconst fullstore = __webpack_require__(/*! fullstore/legacy */ \"./node_modules/fullstore/legacy/index.js\");\nconst Chars = fullstore();\n\nChars([]);\n\nKeyProto.prototype = KEY;\nCloudCmd.Key = KeyProto;\n\nfunction KeyProto() {\n    let Binded;\n    \n    const Key = this;\n    \n    this.isBind = () => {\n        return Binded;\n    };\n    \n    this.setBind = () => {\n        Binded = true;\n    };\n    \n    this.unsetBind = () => {\n        Binded = false;\n    };\n    \n    this.bind = () => {\n        Events.addKey(listener);\n        Binded = true;\n    };\n    \n    function getChar(event) {\n        /*\n          * event.keyIdentifier deprecated in chrome v51\n          * but event.key is absent in chrome <= v51\n          */\n        \n        if (event.key)\n            return event.key;\n        \n        return fromCharCode(event.keyIdentifier);\n    }\n    \n    function listener(event) {\n        const keyCode = event.keyCode;\n        const alt = event.altKey;\n        const ctrl = event.ctrlKey;\n        const shift = event.shiftKey;\n        const meta = event.metaKey;\n        const isBetween = keyCode >= KEY.ZERO && keyCode <= KEY.Z;\n        const isNumpad = /Numpad/.test(event.code);\n        \n        let char = getChar(event);\n        let isSymbol = ~['.', '_', '-', '+', '='].indexOf(char);\n        \n        if (!isSymbol) {\n            isSymbol = getSymbol(shift, keyCode);\n            \n            if (isSymbol)\n                char = isSymbol;\n        }\n        \n        if (!Key.isBind())\n            return;\n        \n        const isVim = CloudCmd.config('vim');\n        \n        if (!isVim && !isNumpad && !alt && !ctrl && !meta && (isBetween || isSymbol))\n            return setCurrentByChar(char, Chars);\n        \n        Chars([]);\n        switchKey(event);\n        \n        if (isVim)\n            vim(char, event);\n    }\n    \n    function getSymbol(shift, keyCode) {\n        switch (keyCode) {\n        case KEY.DOT:\n            return '.';\n        \n        case KEY.HYPHEN:\n            return shift ? '_' : '-';\n        \n        case KEY.EQUAL:\n            return shift ? '+' : '=';\n        }\n    }\n    \n    function fromCharCode(keyIdentifier) {\n        const code = keyIdentifier.substring(2);\n        const hex = parseInt(code, 16);\n        const char = String.fromCharCode(hex);\n        \n        return char;\n    }\n    \n    function switchKey(event) {\n        let i, isSelected, prev, next;\n        let current = Info.element;\n        let dataName;\n        \n        const name = Info.name;\n        \n        const {Operation} = CloudCmd;\n        const panel = Info.panel;\n        const path = Info.path;\n        const isDir = Info.isDir;\n        \n        const keyCode = event.keyCode;\n        const alt = event.altKey;\n        const shift = event.shiftKey;\n        const ctrl = event.ctrlKey;\n        const meta = event.metaKey;\n        const ctrlMeta = ctrl || meta;\n        \n        if (current) {\n            prev = current.previousSibling;\n            next = current.nextSibling;\n        }\n        \n        switch (keyCode) {\n        case Key.TAB:\n            DOM.changePanel();\n            event.preventDefault();\n            break;\n        \n        case Key.INSERT:\n            DOM .toggleSelectedFile(current)\n                .setCurrentFile(next);\n            break;\n        \n        case Key.INSERT_MAC:\n            DOM .toggleSelectedFile(current)\n                .setCurrentFile(next);\n            break;\n        \n        case Key.DELETE:\n            if (shift)\n                Operation.show('delete:silent');\n            else\n                Operation.show('delete');\n            break;\n        \n        case Key.ASTERISK:\n            DOM.toggleAllSelectedFiles(current);\n            break;\n        \n        case Key.PLUS:\n            DOM.expandSelection();\n            event.preventDefault();\n            break;\n        \n        case Key.MINUS:\n            DOM.shrinkSelection();\n            event.preventDefault();\n            break;\n        \n        case Key.F1:\n            CloudCmd.Help.show();\n            event.preventDefault();\n            break;\n        \n        case Key.F2:\n            DOM.renameCurrent(current);\n            break;\n            \n        case Key.F3:\n            if (shift)\n                CloudCmd.Markdown.show(path);\n            else if (ctrlMeta)\n                CloudCmd.sortPanel('name');\n            else\n                CloudCmd.View.show();\n            \n            event.preventDefault();\n            break;\n        \n        case Key.F4:\n            if (shift)\n                CloudCmd.EditFileVim.show();\n            else\n                CloudCmd.EditFile.show();\n            \n            event.preventDefault();\n            break;\n        \n        case Key.F5:\n            if (ctrlMeta)\n                CloudCmd.sortPanel('date');\n            else if (alt)\n                Operation.show('pack');\n            else\n                Operation.show('copy');\n            \n            event.preventDefault();\n            break;\n        \n        case Key.F6:\n            if (ctrlMeta)\n                CloudCmd.sortPanel('size');\n            else\n                Operation.show('move');\n            \n            event.preventDefault();\n            break;\n        \n        case Key.F7:\n            if (shift)\n                DOM.promptNewFile();\n            else\n                DOM.promptNewDir();\n            \n            event.preventDefault();\n            break;\n        \n        case Key.F8:\n            Operation.show('delete');\n            event.preventDefault();\n            break;\n        \n        case Key.F9:\n            if (alt)\n                Operation.show('extract');\n            else\n                CloudCmd.Menu.show();\n            event.preventDefault();\n            break;\n        \n        case Key.F10:\n            CloudCmd.Config.show();\n            event.preventDefault();\n            break;\n        \n        case Key.TRA:\n            event.preventDefault();\n            \n            if (shift)\n                return CloudCmd.Terminal.show();\n            \n            CloudCmd.Konsole.show();\n            break;\n        \n        case KEY.BRACKET_CLOSE:\n            CloudCmd.Konsole.show();\n            event.preventDefault();\n            break;\n        \n        case Key.SPACE:\n            if (!isDir || name === '..')\n                isSelected = true;\n            else\n                isSelected = DOM.isSelected(current);\n            \n            exec.if(isSelected, () => {\n                DOM.toggleSelectedFile(current);\n            }, (callback) => {\n                DOM.loadCurrentSize(callback, current);\n            });\n            \n            event.preventDefault();\n            break;\n        \n        case Key.U:\n            if (ctrlMeta) {\n                DOM.swapPanels();\n                event.preventDefault();\n            }\n            break;\n        \n        /* navigation on file table:        *\n         * in case of pressing button 'up', *\n         * select previous row              */\n        case Key.UP:\n            if (shift)\n                DOM.toggleSelectedFile(current);\n            \n            DOM.setCurrentFile(prev);\n            event.preventDefault();\n            break;\n        \n        /* in case of pressing button 'down', *\n         * select next row                    */\n        case Key.DOWN:\n            if (shift)\n                DOM.toggleSelectedFile(current);\n            \n            DOM.setCurrentFile(next);\n            event.preventDefault();\n            break;\n        \n        case Key.LEFT:\n            if (!alt)\n                return;\n            \n            event.preventDefault();\n            \n            dataName = Info.panel.getAttribute('data-name');\n            \n            if (dataName === 'js-right')\n                DOM.duplicatePanel();\n            \n            break;\n        \n        case Key.RIGHT:\n            if (!alt)\n                return;\n           \n            event.preventDefault();\n            \n            dataName = Info.panel.getAttribute('data-name');\n            \n            if (dataName === 'js-left')\n                DOM.duplicatePanel();\n            \n            break;\n        \n        /* in case of pressing button 'Home',  *\n         * go to top element                   */\n        case Key.HOME:\n            DOM.setCurrentFile(Info.first);\n            event.preventDefault();\n            break;\n        \n        /* in case of pressing button 'End', select last element */\n        case Key.END:\n            DOM.setCurrentFile(Info.last);\n            event.preventDefault();\n            break;\n        \n        /* если нажали клавишу page down проматываем экран */\n        case Key.PAGE_DOWN:\n            DOM.scrollByPages(panel, 1);\n            \n            for (i = 0; i < 30; i++) {\n                if (!current.nextSibling)\n                    break;\n                \n                current = current.nextSibling;\n            }\n            \n            DOM.setCurrentFile(current);\n            event.preventDefault();\n            break;\n        \n        /* если нажали клавишу page up проматываем экран */\n        case Key.PAGE_UP:\n            DOM.scrollByPages(panel, -1);\n            \n            for (i = 0; i < 30; i++) {\n                if (!current.previousSibling)\n                    break;\n                \n                current = current.previousSibling;\n            }\n            \n            DOM.setCurrentFile(current);\n            event.preventDefault();\n            break;\n            \n        /* open directory */\n        case Key.ENTER:\n            if (Info.isDir)\n                CloudCmd.loadDir({\n                    path: path === '/' ? '/' : path + '/'\n                });\n            break;\n            \n        case Key.BACKSPACE:\n            CloudCmd.goToParentDir();\n            event.preventDefault();\n            break;\n        \n        case Key.BACKSLASH:\n            if (ctrlMeta)\n                CloudCmd.loadDir({\n                    path: '/'\n                });\n            break;\n        \n        case Key.A:\n            if (ctrlMeta) {\n                DOM.selectAllFiles();\n                event.preventDefault();\n            }\n            \n            break;\n        \n        case Key.G:\n            if (alt) {\n                DOM.goToDirectory();\n                event.preventDefault();\n            }\n            \n            break;\n        \n        case Key.M:\n            if (ctrlMeta) {\n                CloudCmd.EditNames.show();\n                event.preventDefault();\n            }\n            \n            break;\n        \n        /**\n         * обновляем страницу,\n         * загружаем содержимое каталога\n         * при этом данные берём всегда с\n         * сервера, а не из кэша\n         * (обновляем кэш)\n         */\n        case Key.R:\n            if (ctrlMeta) {\n                CloudCmd.log('reloading page...\\n');\n                CloudCmd.refresh();\n                event.preventDefault();\n            }\n            break;\n        \n        case Key.C:\n            if (ctrlMeta)\n                Buffer.copy();\n            break;\n        \n        case Key.X:\n            if (ctrlMeta)\n                Buffer.cut();\n            break;\n            \n        case Key.V:\n            if (ctrlMeta)\n                Buffer.paste();\n            break;\n        \n        case Key.Z:\n            if (ctrlMeta)\n                Buffer.clear();\n            break;\n        \n        /* чистим хранилище */\n        case Key.D:\n            if (ctrlMeta) {\n                CloudCmd.log('clearing storage...');\n                \n                DOM.Storage.clear(() => {\n                    CloudCmd.log('storage cleared');\n                });\n                \n                event.preventDefault();\n            }\n            break;\n        }\n    }\n}\n\n\n\n//# sourceURL=file://cloudcmd/client/key/index.js");

/***/ }),

/***/ "./client/key/key.js":
/*!***************************!*\
  !*** ./client/key/key.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = {\n    BACKSPACE   : 8,\n    TAB         : 9,\n    ENTER       : 13,\n    ESC         : 27,\n    \n    SPACE       : 32,\n    PAGE_UP     : 33,\n    PAGE_DOWN   : 34,\n    END         : 35,\n    HOME        : 36,\n    \n    LEFT        : 37,\n    UP          : 38,\n    RIGHT       : 39,\n    DOWN        : 40,\n    \n    INSERT      : 45,\n    DELETE      : 46,\n    \n    ZERO        : 48,\n    \n    SEMICOLON   : 52,\n    \n    COLON       : 54,\n    \n    A           : 65,\n    \n    C           : 67,\n    D           : 68,\n    \n    G           : 71,\n    \n    J           : 74,\n    K           : 75,\n    \n    M           : 77,\n    \n    O           : 79,\n    Q           : 81,\n    R           : 82,\n    S           : 83,\n    T           : 84,\n    U           : 85,\n    \n    V           : 86,\n    \n    X           : 88,\n    \n    Z           : 90,\n    \n    INSERT_MAC  : 96,\n    \n    ASTERISK    : 106,\n    PLUS        : 107,\n    MINUS       : 109,\n    \n    F1          : 112,\n    F2          : 113,\n    F3          : 114,\n    F4          : 115,\n    F5          : 116,\n    F6          : 117,\n    F7          : 118,\n    F8          : 119,\n    F9          : 120,\n    F10         : 121,\n    \n    EQUAL       : 187,\n    HYPHEN      : 189,\n    DOT         : 190,\n    SLASH       : 191,\n    TRA         : 192, /* Typewritten Reverse Apostrophe (`) */\n    BACKSLASH   : 220,\n    \n    BRACKET_CLOSE: 221\n};\n\n\n\n//# sourceURL=file://cloudcmd/client/key/key.js");

/***/ }),

/***/ "./client/key/set-current-by-char.js":
/*!*******************************************!*\
  !*** ./client/key/set-current-by-char.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* global DOM */\n\n\n\nconst Info = DOM.CurrentInfo;\nconst {escapeRegExp} = __webpack_require__(/*! ../../common/util */ \"./common/util.js\");\n\nmodule.exports = function setCurrentByChar(char, charStore) {\n    let firstByName;\n    let skipCount = 0;\n    let setted = false;\n    let i = 0;\n    \n    const escapeChar = escapeRegExp(char);\n    const regExp = new RegExp('^' + escapeChar + '.*$', 'i');\n    const {files} = Info;\n    const chars = charStore();\n    const n = chars.length;\n    \n    while(i < n && char === chars[i])\n        i++;\n    \n    if (!i)\n        charStore([]);\n    \n    const skipN = skipCount = i;\n    \n    charStore(charStore().concat(char));\n    \n    const names = DOM.getFilenames(files);\n    const isTest = (a) => regExp.test(a);\n    const isRoot = (a) => a === '..';\n    const not = (f) => (a) => !f(a);\n    const setCurrent = (name) => {\n        const byName = DOM.getCurrentByName(name);\n        \n        if (!skipCount) {\n            setted = true;\n            DOM.setCurrentFile(byName);\n            return true;\n        } else {\n            if (skipN === skipCount)\n                firstByName = byName;\n            \n            --skipCount;\n        }\n    };\n    \n    names\n        .filter(isTest)\n        .filter(not(isRoot))\n        .some(setCurrent);\n    \n    if (!setted) {\n        DOM.setCurrentFile(firstByName);\n        charStore([char]);\n    }\n};\n\n\n\n//# sourceURL=file://cloudcmd/client/key/set-current-by-char.js");

/***/ }),

/***/ "./client/key/vim/find.js":
/*!********************************!*\
  !*** ./client/key/vim/find.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n/* global DOM */\n\nconst fullstore = __webpack_require__(/*! fullstore/legacy */ \"./node_modules/fullstore/legacy/index.js\");\nconst limier = __webpack_require__(/*! limier/legacy */ \"./node_modules/limier/legacy/index.js\");\nconst Info = DOM.CurrentInfo;\n\nconst searchStore = fullstore([]);\nconst searchIndex = fullstore(0);\n\nmodule.exports.find = (value) => {\n    const names = Info.files.map(DOM.getCurrentName);\n    const result = limier(value, names);\n    \n    searchStore(result);\n    searchIndex(0);\n    \n    DOM.setCurrentByName(result[0]);\n};\n\nmodule.exports.findNext = () => {\n    const names = searchStore();\n    const index = next(searchIndex(), names.length);\n    \n    searchIndex(index);\n    DOM.setCurrentByName(names[searchIndex()]);\n};\n\nmodule.exports.findPrevious = () => {\n    const names = searchStore();\n    const index = previous(searchIndex(), names.length);\n    \n    searchIndex(index);\n    DOM.setCurrentByName(names[index]);\n};\n\nmodule.exports._next = next;\nmodule.exports._previous = previous;\n\nfunction next(index, length) {\n    if (index === length - 1)\n        return 0;\n    \n    return ++index;\n}\n\nfunction previous(index, length) {\n    if (!index)\n        return length - 1;\n    \n    return --index;\n}\n\n\n\n//# sourceURL=file://cloudcmd/client/key/vim/find.js");

/***/ }),

/***/ "./client/key/vim/index.js":
/*!*********************************!*\
  !*** ./client/key/vim/index.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n/* global CloudCmd, DOM */\n\nconst KEY = __webpack_require__(/*! ../key */ \"./client/key/key.js\");\nconst Info = DOM.CurrentInfo;\nconst Dialog = DOM.Dialog;\n\nconst fullstore = __webpack_require__(/*! fullstore/legacy */ \"./node_modules/fullstore/legacy/index.js\");\nconst store = fullstore('');\nconst visual = fullstore(false);\nconst {\n    find,\n    findNext,\n    findPrevious,\n} = __webpack_require__(/*! ./find */ \"./client/key/vim/find.js\");\n\nconst TITLE = 'Cloud Commander';\n\nconst stopVisual = () => {\n    visual(false);\n};\n\nconst end = () => {\n    store('');\n};\n\nconst rmFirst = (a) => {\n    return a\n        .split('')\n        .slice(1)\n        .join('');\n};\n\nmodule.exports = (key, event) => {\n    const current = Info.element;\n    const keyCode = event.keyCode;\n    const prevStore = store();\n    \n    const value = store(prevStore.concat(key));\n    \n    if (keyCode === KEY.ENTER)\n        return end();\n    \n    if (keyCode === KEY.ESC) {\n        DOM.unselectFiles();\n        visual(false);\n        return end();\n    }\n    \n    if (key === 'j') {\n        move('next', {\n            prevStore,\n            current,\n        });\n        \n        return end();\n    }\n    \n    if (key === 'k') {\n        move('previous', {\n            prevStore,\n            current,\n        });\n        \n        return end();\n    }\n    \n    if (/gg/.test(value)) {\n        move('previous', {\n            current,\n            prevStore,\n            max: Infinity,\n        });\n        \n        return end();\n    }\n    \n    if (key === 'd' && (visual() || prevStore === 'd')) {\n        CloudCmd.Operation.show('delete');\n        stopVisual();\n        return end();\n    }\n    \n    if (key === 'G') {\n        move('next', {\n            current,\n            prevStore,\n            max: Infinity,\n        });\n        \n        return end();\n    }\n    \n    if (key === 'y') {\n        if (!visual())\n            return end();\n        \n        DOM.Buffer.copy();\n        stopVisual();\n        DOM.unselectFiles();\n        return end();\n    }\n    \n    if (/^p$/i.test(key)) {\n        DOM.Buffer.paste();\n        return end();\n    }\n    \n    if (/^v$/i.test(key)) {\n        DOM.toggleSelectedFile(current);\n        visual(!visual());\n        \n        return end();\n    }\n    \n    if (key === '/') {\n        event.preventDefault();\n        \n        Dialog.prompt(TITLE, 'Find', '', {cancel: false})\n            .then(find);\n       \n        return end();\n    }\n    \n    if (key === 'n') {\n        findNext();\n        return end();\n    }\n    \n    if (key === 'N') {\n        findPrevious();\n        return end();\n    }\n};\n\nmodule.exports.selectFile = selectFile;\n\nfunction move(sibling, {max, current, prevStore}) {\n    const isDelete = prevStore[0] === 'd';\n    \n    if (isDelete) {\n        visual(true);\n        prevStore = rmFirst(prevStore);\n    }\n    \n    const n = max || getNumber(prevStore);\n    \n    if (isNaN(n))\n        return;\n    \n    setCurrent({\n        n,\n        current,\n        sibling,\n        visual: visual(),\n    });\n    \n    if (isDelete)\n        CloudCmd.Operation.show('delete');\n}\n\nfunction getNumber(value) {\n    if (!value)\n        return 1;\n    \n    if (value === 'g')\n        return 1;\n    \n    return parseInt(value);\n}\n\nfunction selectFile(current) {\n    const name = DOM.getCurrentName(current);\n    \n    if (name === '..')\n        return;\n    \n    DOM.selectFile(current);\n}\n\nfunction setCurrent({n, current, visual, sibling}) {\n    const select = visual ? selectFile : DOM.unselectFile;\n    \n    select(current);\n    \n    const position = `${sibling}Sibling`;\n    for (let i = 0; i < n; i++) {\n        const next = current[position];\n        \n        if (!next)\n            break;\n        \n        current = next;\n        select(current);\n    }\n    \n    DOM.setCurrentFile(current);\n}\n\n\n\n//# sourceURL=file://cloudcmd/client/key/vim/index.js");

/***/ }),

/***/ "./client/listeners/get-index.js":
/*!***************************************!*\
  !*** ./client/listeners/get-index.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = (array, item) => {\n    const index = array.indexOf(item);\n    \n    if (!~index)\n        return 0;\n    \n    return index;\n};\n\n\n\n//# sourceURL=file://cloudcmd/client/listeners/get-index.js");

/***/ }),

/***/ "./client/listeners/get-range.js":
/*!***************************************!*\
  !*** ./client/listeners/get-range.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nmodule.exports = (indexFrom, indexTo, files) => {\n    if (indexFrom < indexTo)\n        return files.slice(indexFrom, indexTo + 1);\n    \n    if (indexFrom > indexTo)\n        return files.slice(indexTo, indexFrom + 1);\n    \n    return [files[indexFrom]];\n};\n\n\n\n//# sourceURL=file://cloudcmd/client/listeners/get-range.js");

/***/ }),

/***/ "./client/listeners/index.js":
/*!***********************************!*\
  !*** ./client/listeners/index.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* global DOM, CloudCmd */\n\n\n\nconst exec = __webpack_require__(/*! execon */ \"./node_modules/execon/lib/exec.js\");\nconst itype = __webpack_require__(/*! itype/legacy */ \"./node_modules/itype/legacy/index.js\");\nconst currify = __webpack_require__(/*! currify/legacy */ \"./node_modules/currify/legacy/index.js\");\nconst getRange = __webpack_require__(/*! ./get-range */ \"./client/listeners/get-range.js\");\n\nconst getIndex = currify(__webpack_require__(/*! ./get-index */ \"./client/listeners/get-index.js\"));\n\nconst uploadFiles = __webpack_require__(/*! ../dom/upload-files */ \"./client/dom/upload-files.js\");\n\nconst {\n    FS,\n    apiURL\n} = __webpack_require__(/*! ../../common/cloudfunc */ \"./common/cloudfunc.js\");\n\nmodule.exports.init = () => {\n    contextMenu();\n    dragndrop();\n    unload();\n    pop();\n    resize();\n    config();\n    header();\n};\n\nCloudCmd.Listeners = module.exports;\n\nconst unselect = (event) => {\n    const isMac = /Mac/.test(window.navigator.platform);\n    const {\n        shiftKey,\n        metaKey,\n        ctrlKey,\n    } = event;\n    \n    if (shiftKey || isMac && metaKey || ctrlKey)\n        return;\n    \n    DOM.unselectFiles();\n};\n\nconst execAll = currify((funcs, event) => {\n    funcs.forEach((fn) => {\n        fn(event);\n    });\n});\n\nconst Info = DOM.CurrentInfo;\nconst Storage = DOM.Storage;\nconst Events = DOM.Events;\nconst EventsFiles = {\n    mousedown: exec.with(execIfNotUL, setCurrentFileByEvent),\n    click: execAll([\n        onClick,\n        unselect,\n    ]),\n    dragstart: exec.with(execIfNotUL, onDragStart),\n    dblclick: exec.with(execIfNotUL, onDblClick),\n    touchstart: exec.with(execIfNotUL, onTouch)\n};\n\nlet EXT;\n\nfunction header() {\n    const fm = DOM.getFM();\n    const isDataset = (el) => el.dataset;\n    const isPanel = (el) => {\n        return /^js-(left|right)$/.test(el.dataset.name);\n    };\n    \n    Events.addClick(fm, (event) => {\n        const el = event.target;\n        const parent = el.parentElement;\n        \n        if (parent.dataset.name !== 'js-fm-header')\n            return;\n        \n        const name = (el.dataset.name || '')\n            .replace('js-', '');\n        \n        if (!/^(name|size|date)$/.test(name))\n            return;\n        \n        const panel = getPath(el)\n            .filter(isDataset)\n            .filter(isPanel)\n            .pop();\n        \n        CloudCmd.sortPanel(name, panel);\n    });\n}\n\nfunction getPath(el, path = []) {\n    if (!el)\n        return path;\n    \n    return getPath(el.parentElement, path.concat(el));\n}\n\nfunction config() {\n    DOM.Files.get('config', (e, config) => {\n        const type = config && config.packer;\n        EXT = DOM.getPackerExt(type);\n    });\n}\n\nmodule.exports.initKeysPanel = () => {\n    const keysElement = DOM.getById('js-keyspanel');\n    \n    if (!keysElement)\n        return;\n    \n    Events.addClick(keysElement, ({target}) => {\n        const id = target.id;\n        const operation = (name) => {\n            const Operation = CloudCmd.Operation;\n            const fn = Operation.show.bind(null, name);\n            \n            return fn;\n        };\n        \n        const clickFuncs = {\n            'f1'        : CloudCmd.Help.show,\n            'f2'        : DOM.renameCurrent,\n            'f3'        : CloudCmd.View.show,\n            'f4'        : CloudCmd.EditFile.show,\n            'f5'        : operation('copy'),\n            'f6'        : operation('move'),\n            'f7'        : DOM.promptNewDir,\n            'f8'        : operation('delete'),\n            'f9'        : CloudCmd.Menu.show,\n            'f10'       : CloudCmd.Config.show,\n            '~'         : CloudCmd.Konsole.show,\n            'shift~'    : CloudCmd.Terminal.show,\n            'contact'   : CloudCmd.Contact.show,\n        };\n       \n        exec(clickFuncs[id]);\n    });\n};\n\nconst getPanel = (side) => {\n    if (!itype.string(side))\n        return side;\n    \n    return DOM.getByDataName('js-' + side);\n};\n\nmodule.exports.setOnPanel = (side) => {\n    const panel = getPanel(side);\n    \n    const filesElement = DOM.getByDataName('js-files', panel);\n    const pathElement = DOM.getByDataName('js-path', panel);\n    \n    /* ставим загрузку гифа на клик*/\n    Events.addClick(pathElement, getPathListener(panel));\n    Events.add(filesElement, EventsFiles);\n};\n\nfunction getPathListener(panel) {\n    return onPathElementClick.bind(null, panel);\n}\n\nfunction isNoCurrent(panel) {\n    const infoPanel = Info.panel;\n    const namePanel = panel.getAttribute('data-name');\n    const nameInfoPanel = infoPanel.getAttribute('data-name');\n        \n    if (namePanel !== nameInfoPanel)\n        return true;\n    \n    return false;\n}\n\nfunction onPathElementClick(panel, event) {\n    let link, href, url, noCurrent;\n    \n    const prefix = CloudCmd.PREFIX;\n    const element = event.target;\n    const attr = element.getAttribute('data-name');\n    \n    switch (attr) {\n    case 'js-clear-storage':\n        Storage.clear();\n        break;\n    \n    case 'js-refresh':\n        noCurrent = isNoCurrent(panel);\n        \n        CloudCmd.refresh({\n            panel,\n            noCurrent\n        });\n        \n        event.preventDefault();\n        break;\n    \n    case 'js-path-link':\n        url         = CloudCmd.HOST;\n        href        = element.href;\n        link        = href.replace(url, '');\n        /**\n         * browser doesn't replace % -> %25%\n         * do it for him\n         */\n        link        = link.replace('%%', '%25%');\n        link        = decodeURI(link);\n        link        = link.replace(RegExp('^' + prefix + FS), '') || '/';\n        \n        noCurrent   = isNoCurrent(panel);\n        \n        CloudCmd.loadDir({\n            path        : link,\n            isRefresh   : false,\n            panel       : noCurrent ? panel : Info.panel\n        });\n        \n        event.preventDefault();\n    }\n}\n\nfunction execIfNotUL(callback, event) {\n    const {target} = event;\n    const {tagName} = target;\n    \n    if (tagName !== 'UL')\n        callback(event);\n}\n\nfunction onClick(event) {\n    const ctrl = event.ctrlKey;\n    \n    if (!ctrl)\n        event.preventDefault();\n    \n    changePanel(event.target);\n}\n\nfunction toggleSelect(key, files) {\n    const isMac = /Mac/.test(window.navigator.platform);\n    \n    if (!key)\n        throw Error('key should not be undefined!');\n    \n    const [file] = files;\n    \n    if (isMac && key.meta || key.ctrl)\n        return DOM.toggleSelectedFile(file);\n    \n    if (key.shift)\n        return files.forEach(DOM.selectFile);\n}\n\nfunction changePanel(element) {\n    const {panel} = Info;\n    const files = DOM.getByDataName('js-files', panel);\n    const ul = getULElement(element);\n    \n    if (ul !== files)\n        DOM.changePanel();\n}\n\nfunction onDblClick(event) {\n    const current = getLIElement(event.target);\n    const isDir = DOM.isCurrentIsDir(current);\n    const path = DOM.getCurrentPath(current);\n    \n    if (isDir) {\n        CloudCmd.loadDir({\n            path: path === '/' ? '/' : path + '/'\n        });\n        \n        event.preventDefault();\n    }\n}\n\nfunction onTouch(event) {\n    const current = getLIElement(event.target);\n    const isDir = DOM.isCurrentIsDir(current);\n    \n    if (!isDir)\n        return;\n    \n    const isCurrent = DOM.isCurrentFile(current);\n    \n    if (!isCurrent)\n        return;\n    \n    CloudCmd.loadDir({\n        path: DOM.getCurrentPath(current)\n    });\n    \n    event.preventDefault();\n}\n\n/*\n  * download file from browser to desktop\n  * in Chrome (HTML5)\n  */\nfunction onDragStart(event) {\n    const element = getLIElement(event.target);\n    const isDir = Info.isDir;\n    let link = DOM.getCurrentLink(element);\n    let name = DOM.getCurrentName(element);\n    \n    /* if it's directory - adding json extension */\n    if (isDir) {\n        name += EXT;\n        link = document.createElement('a');\n        link.textContent = name;\n        link.href = apiURL + '/pack' + Info.path + EXT;\n    }\n    \n    event.dataTransfer.setData('DownloadURL',\n        'application/octet-stream'  + ':' +\n        name                        + ':' +\n        link);\n}\n\nfunction getLIElement(element) {\n    if (!element)\n        return element;\n    \n    while (element.tagName !== 'LI')\n        element = element.parentElement;\n    \n    return element;\n}\n\nfunction getULElement(element) {\n    while (element.tagName !== 'UL')\n        element = element.parentElement;\n    \n    return element;\n}\n\nfunction setCurrentFileByEvent(event) {\n    const BUTTON_LEFT = 0;\n    \n    const key = {\n        alt: event.altKey,\n        ctrl: event.ctrlKey,\n        meta: event.metaKey,\n        shift: event.shiftKey\n    };\n    \n    const element = getLIElement(event.target);\n    \n    const fromName = Info.name;\n    DOM.setCurrentFile(element);\n    const toName = Info.name;\n    \n    let files = [];\n    \n    if (key.shift)\n        files = getFilesRange(fromName, toName);\n    else\n        files.push(Info.element);\n    \n    if (event.button === BUTTON_LEFT)\n        toggleSelect(key, files);\n}\n\nfunction getFilesRange(from, to) {\n    const files = DOM.getAllFiles();\n    const names = DOM.getFilenames(files);\n    const getNameIndex = getIndex(names);\n    \n    const indexFrom = getNameIndex(from);\n    const indexTo = getNameIndex(to);\n    \n    return getRange(indexFrom, indexTo, files);\n}\n\nfunction contextMenu() {\n    const fm = DOM.getFM();\n    \n    Events.addOnce('contextmenu', fm, (event) => {\n        CloudCmd.Menu.show({\n            x: event.clientX,\n            y: event.clientY\n        });\n    });\n    \n    Events.addContextMenu(fm, (event) => {\n        CloudCmd.Menu.ENABLED || event.preventDefault();\n    });\n}\n\nfunction dragndrop() {\n    const panels = DOM.getByClassAll('panel');\n    const select = () => {\n        [...panels].forEach((panel) => {\n            panel.classList.add('selected-panel');\n        });\n    };\n    \n    const unselect = () => {\n        [...panels].forEach((panel) => {\n            panel.classList.remove('selected-panel');\n        });\n    };\n    \n    const onDrop = (event) => {\n        const files = event.dataTransfer.files;\n        const items = event.dataTransfer.items;\n        const {length: filesCount} = files;\n        \n        event.preventDefault();\n        \n        if (filesCount && (!items || !items.length || !items[0].webkitGetAsEntry))\n            return uploadFiles(files);\n        \n        const isFile = (item) => item.kind === 'file';\n        const dirFiles = [...items].filter(isFile);\n        \n        if (dirFiles.length)\n            return DOM.uploadDirectory(dirFiles);\n        \n        const {Operation} = CloudCmd;\n        const operation = event.shiftKey ? 'move' : 'copy';\n        \n        return Operation.show(operation);\n    };\n    \n    /**\n     * In Mac OS Chrome dropEffect = 'none'\n     * so drop do not firing up when try\n     * to upload file from download bar\n     */\n    const onDragOver = (event) => {\n        const dataTransfer = event.dataTransfer;\n        const effectAllowed = dataTransfer.effectAllowed;\n        \n        if (/move|linkMove/.test(effectAllowed))\n            dataTransfer.dropEffect = 'move';\n        else\n            dataTransfer.dropEffect = 'copy';\n        \n        event.preventDefault();\n    };\n    \n    Events.add('dragenter', select);\n    Events.add(['dragleave', 'drop'], unselect);\n    \n    [...panels].forEach((panel) => {\n        Events.add('dragover', panel, onDragOver)\n            .add('drop', panel, onDrop);\n    });\n}\n\nfunction unload() {\n    DOM.Events.add(['unload', 'beforeunload'], (event) => {\n        const Key = CloudCmd.Key;\n        const isBind = Key && Key.isBind();\n        \n        if (isBind)\n            return;\n        \n        event.preventDefault();\n        return 'Please make sure that you saved all work.';\n    });\n}\n\nfunction pop() {\n    Events.add('popstate', ({state}) => {\n        const path = (state || '').replace(FS, '');\n        \n        if (!path)\n            return CloudCmd.route(location.hash);\n        \n        const history = false;\n        CloudCmd.loadDir({\n            path,\n            history,\n        });\n    });\n}\n\nfunction resize() {\n    Events.add('resize', () => {\n        const is = window.innerWidth < CloudCmd.MIN_ONE_PANEL_WIDTH;\n        \n        if (!is)\n            return;\n        \n        const {panel} = Info;\n        const isEmptyRoot = !panel;\n        \n        if (isEmptyRoot)\n            return;\n        \n        const name = panel.getAttribute('data-name');\n        const isLeft = name === 'js-left';\n        \n        if (isLeft)\n            return;\n        \n        DOM.changePanel();\n    });\n}\n\n\n\n//# sourceURL=file://cloudcmd/client/listeners/index.js");

/***/ }),

/***/ "./client/sort.js":
/*!************************!*\
  !*** ./client/sort.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n/* global CloudCmd */\nconst DOM = __webpack_require__(/*! ./dom */ \"./client/dom/index.js\");\n\nconst Info = DOM.CurrentInfo;\nconst sort = CloudCmd.sort;\nconst order = CloudCmd.order;\nconst position = DOM.getPanelPosition();\n\nlet sortPrevious = sort[position];\n\nconst {getPanel} = DOM;\n\nCloudCmd.sortPanel = (name, panel = getPanel()) => {\n    const position = panel\n        .dataset\n        .name\n        .replace('js-', '');\n    \n    if (name !== sortPrevious) {\n        order[position] = 'asc';\n    } else {\n        if (order[position] === 'asc')\n            order[position] = 'desc';\n        else\n            order[position] = 'asc';\n    }\n    \n    sortPrevious =\n    sort[position] = name;\n    \n    const noCurrent = position !== Info.panelPosition;\n    \n    CloudCmd.refresh({\n        panel,\n        noCurrent,\n    });\n};\n\n\n\n//# sourceURL=file://cloudcmd/client/sort.js");

/***/ }),

/***/ "./css/columns/name-size-date.css":
/*!****************************************!*\
  !*** ./css/columns/name-size-date.css ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// removed by extract-text-webpack-plugin\n\n//# sourceURL=file://cloudcmd/css/columns/name-size-date.css");

/***/ }),

/***/ "./css/columns/name-size.css":
/*!***********************************!*\
  !*** ./css/columns/name-size.css ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// removed by extract-text-webpack-plugin\n\n//# sourceURL=file://cloudcmd/css/columns/name-size.css");

/***/ }),

/***/ "./css/main.css":
/*!**********************!*\
  !*** ./css/main.css ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// removed by extract-text-webpack-plugin\n\n//# sourceURL=file://cloudcmd/css/main.css");

/***/ }),

/***/ "./css/nojs.css":
/*!**********************!*\
  !*** ./css/nojs.css ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// removed by extract-text-webpack-plugin\n\n//# sourceURL=file://cloudcmd/css/nojs.css");

/***/ }),

/***/ "es6-promise":
/*!******************************!*\
  !*** external "es6-promise" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = es6-promise;\n\n//# sourceURL=file://cloudcmd/external_%22es6-promise%22");

/***/ })

/******/ });