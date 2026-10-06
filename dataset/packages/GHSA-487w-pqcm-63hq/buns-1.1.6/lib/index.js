'use strict';
//Requirements
var fs = require('fs'), path = require('path'),
    babel = require('babel-core'), esprima = require('esprima'),
    uglify = require('uglify-js'), walk = require('esprima-walk'),
    exec = require('child_process').execSync;


//Main vars and consts
var DS = path.sep, __callerDir = process.cwd() + DS, modulesPath =  __callerDir + 'node_modules' + DS;

//Paths
const __buns = __dirname.replace(DS + 'lib', '') + DS,
    __core = __dirname + DS + 'src' + DS + 'core' + DS,
    __inc = __dirname + DS + 'src' + DS + 'includes' + DS,
    __mod = __buns + 'node_modules' + DS,
    __tpl = __dirname + DS + 'src' + DS + 'templates' + DS,
    __tmp = __buns + '.tmp' + DS,

    __tmpUri = '/' + __buns.replace(__callerDir, '').replace(/\\/g, '/') + '.tmp/';

//Overriding Babel preset loader (when installing es2015 in Buns' node_modules dir, like in Windows)
try {
    fs.lstatSync(__mod + 'babel-preset-es2015').isDirectory();
    babel.OptionManager.prototype.resolvePresets = function resolvePresets(presets, dirname, onResolve) {
        return presets.map(function(val) {
            var presetLoc = __mod + 'babel-preset-' + val;
            return require(presetLoc);
        });
    };
} catch(e) {}

//Configuration files
const BUILD_CONF = 'buns.json', MOD_CONF = __mod + 'modules.json';

//File names
const BOOT_FILE = 'bootstrap.js', TEMP_FILE = 'temp.js';

//Counters and not significant vars
var i, j, e, currentModule, loopModules = false;

//Configuration data, extending from configuration files
var config = {
         output: 'output',
         source: 'source',
         mode: 'dev',
         watch: [],
         modules: {}
     }, modules, currentPath, NL = "\n\n\n", file,
     moduleName, requiredPaths = [], isWatching = false, flagValue, outputName,
     localConfig = {}, configExists = true, moduleOrder = [];


try {
    localConfig = JSON.parse(fs.readFileSync(BUILD_CONF), 'utf-8')
} catch(e) {
    configExists = false;
}

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for(var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

e = __callerDir.split(DS);

if(localConfig)
    config = extend(config, localConfig);

//Functions & tools

/**
 * Esprima-walk callback
 * @param  {[type]} node         [description]
 * @param  {[type]} tempCode     [description]
 * @param  {[type]} code         [description]
 * @param  {[type]} explodedName [description]
 * @return {string}
 */
function walkCallback(node, tempCode, code, explodedName) {
    var parsedData = {}, sub;
    if(node && node.type) {
        switch(node.type) {
            case 'CallExpression' :
                sub = code.substr(node.callee.range[0], node.callee.range[1] - node.callee.range[0]);
                e = sub.split('.');
                parsedData.dbg = node.callee.loc.start;
                parsedData.method = e[e.length - 1];
                parsedData.member = sub.replace('.' + parsedData.method, '');

                if(0 !== parsedData.member.indexOf('function(') && 'super' !== parsedData.member) {

                    if(parsedData.member === parsedData.method) {
                        parsedData.member = 'null';
                    } else {
                        parsedData.method = `'` + parsedData.method + `'`;
                    }

                    parsedData.arguments = [];
                    node.arguments.forEach(function(val) {
                        parsedData.arguments.push(code.substr(val.range[0], val.range[1] - val.range[0]));
                    });

                    tempCode = tempCode.replace(
                        new RegExp(code.substr(node.range[0], node.range[1] - node.range[0]).escape() + '(?!\\s+{)'),
                        `trace(` + parsedData.member + `,` + parsedData.method + `,[` + parsedData.arguments.join(',') + `],` + parsedData.dbg.line + `,` + parsedData.dbg.column + `,` + explodedName + `)`
                    );
                }

                break;
            case 'NewExpression' :
                sub = code.substr(node.callee.range[0], node.callee.range[1] - node.callee.range[0]);
                parsedData.dbg = node.loc.start;
                parsedData.method = e[e.length - 1];
                parsedData.className = sub;

                parsedData.arguments = [];
                node.arguments.forEach(function(val) {
                    parsedData.arguments.push(code.substr(val.range[0], val.range[1] - val.range[0]));
                });

                tempCode = tempCode.replace(
                    new RegExp(code.substr(node.range[0], node.range[1] - node.range[0]).escape() + '(?!\\s+{)'),
                    `traceInstance(` + parsedData.className + `, [` + parsedData.arguments.join(',') + `], ` + parsedData.dbg.line + `, ` + parsedData.dbg.column + `,` + explodedName + `)`
                );

                break;
            case 'MethodDefinition' :
                // console.log('Method :');
                // console.log(node.key.name);
                // console.log(node.range);
                // console.log(node.loc);
                break;
            default:
                break;
        }
    }
    return tempCode;
}

/**
 * String matches 0 or n array entries.
 * @param  {array} regexes
 * @return {boolean} Returns false if nothing matched, true if something matched.
 */
String.prototype.matchIn = function(regexes) {
    var thus = this;
    return regexes.some(function(val) {
        return thus.match(new RegExp(val));
    });
};

/**
 * String must match at least n entries from the array
 * @param  {integer} number  The number of entries that have to match
 * @param  {array} regexes
 * @return {boolean} Returns false if not enough entries matched else, true.
 */
String.prototype.matchAtLeast = function(number, regexes) {
    var thus = this, matches = 0;
    return regexes.some(function(val) {
        if(thus.match(new RegExp(val)))
            ++matches;
        if(matches === number)
            return true;
    });
};

/**
 * String must match between 1 and n entries from the array
 * @param  {integer} number  The number of entries that have to match
 * @param  {array} regexes
 * @return {boolean} Returns false if the number of matches exceeds the desired number.
 */
String.prototype.matchAtMost = function(number, regexes) {
    var thus = this, flag = true, matches = 0;
    regexes.forEach(function(val) {
        if(thus.match(new RegExp(val)))
            ++matches;
        if(matches > number)
            flag = false;
    });
    return flag;
};


String.prototype.matchAll = function(regexp) {
    var matches = [];
    this.replace(regexp, function() {
        var arr = ([]).slice.call(arguments, 0);
        var extras = arr.splice(-2);
        arr.index = extras[0];
        arr.input = extras[1];
        matches.push(arr);
    });
    return matches.length ? matches : null;
};

/**
 * Escapes "\" path separator.
 * @return {string}
 */
String.prototype.adjustPath = function() {
    return this.replace(/\\/g, '\\\\');
};

String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

String.prototype.escape = function() {
    return this.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

String.prototype.slugify = function() {
    var slug = '';
    var trimmed = this.trim();
    slug = trimmed.replace(/[^a-z0-9-]/gi, '-').
        replace(/-+/g, '-').
        replace(/^-|-$/g, '');
    return slug.toLowerCase();
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.camelCaseToDash = function() {
    return this.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

String.prototype.dashToCamelCase = function() {
    return this.replace(/-([a-z])/g, function(g) {
        return g[1].toUpperCase();
    });
};

/**
 * Replaces namespaces, adds debugging to methods, other Buns main functionalities
 * @param  {[type]} fileName [description]
 * @param  {[type]} code     [description]
 * @return {[type]}          [description]
 */
function preprocess(fileName, code) {

    var classMatch = code.match(/class\s+(\S+)(?:\s+extends\s+(?:\S+))?/),
        parentMatch = code.match(/class\s+(?:\S+)(?:\s+extends\s+(\S+))?/),
        currentClass, parentClass, i, replacements, explodedName;

    e = fileName.split(DS);
    explodedName = '\'' + e[e.length - 3] + DS + e[e.length - 2] + DS + e[e.length - 1].replace(/\\/g, '\\\\') + '\'';

    if(classMatch)
        currentClass = classMatch[1];
    if(parentMatch)
        parentClass = parentMatch[1];
    /**
     * Put namespace to corresponding classes called by "use" directive.
     */
    function namespacify() {
        var namespace = code.match(/#!namespace\s+([^;\r\n]*)/), uses = code.matchAll(/#!use\s+([^;\r\n]*)/g), classNameSplit,
            used = [];

        if(uses) {
            uses.forEach(function(val, key) {
                replacements = val[1].matchAll(/([^\s,]+)(?:\s+as\s+([^,]+))?/g);
                code = code.replace(val[0], val[0].replace(/(.)/g, '/'));//Removes the use directives, replaces all characters by slashes

                replacements.forEach(function(val1, key1) {
                    if(undefined !== val1[2]) {
                        code = code.replace(new RegExp("\\b" + val1[2] + "\\b", 'g'), val1[1]);
                    } else {
                        classNameSplit = val1[1].split('.');
                        used.push(classNameSplit[classNameSplit.length - 1]);
                        code = code.replace(new RegExp("\\b" + classNameSplit[classNameSplit.length - 1] + "\\b", 'g'), val1[1]);
                    }
                })
            });
        }

        if(namespace) {
            code = namespace[1] + ' = ' + namespace[1] + ' || {};' + code;
            code = code.replace(namespace[0], namespace[0].replace(/(.)/g, '/'));//Removes the namespace directive

            code = code.replace('class', namespace[1] + '.' + currentClass + ' = class');
            currentClass = namespace[1] + '.' + currentClass;
        }
    }

    /**
     * Add arguments check for every class method and debug backtrace before any call (even core JS functions).
     */
    function enableDebug() {
        var tempCode = code, parsed = esprima.parse(code, {
            range: true,//set to true to inject code at nth char
            attachComment: true,//
            loc: true//set to true to get file position of function calls
        });
        var excludeClasses = [//Namespaces to exclude,
            '^Development', '^Environment', '^Abstract'
        ];
        if(currentClass && !currentClass.matchIn(excludeClasses)) {
            if(parsed && parsed.body) {
                walk(parsed, function(node) {
                    tempCode = walkCallback(node, tempCode, code, explodedName);
                });
            }
            code = tempCode;

            var methods = code.match(/((?!\b(if|while|for|function|typeof|switch)\b)\b[\w]+\s*\(([^().]*)\)\s*{)/g),
                args, toCheck = [], codeWalk, codeReplaced = [],
                calls,
                matchKey, matchVal, key, output = '', funcName;


            if(methods) {
                methods.forEach(function(val) {
                    //As previous regex matches "function X()", this will exlude them.
                    if(!code.match(new RegExp('function\\s+' + val.replace('*', '\\*')))) {
                        funcName = val.match(/([^()]+)\(/);
                        args = val.match(/\w*\((.*)\) {/);
                        if(args) {
                            args = args[1].split(/\s*,\s*/);
                            toCheck = [];
                            output = '';
                            for(i = 0; i < args.length; ++i) {
                                matchKey = args[i].match(/\/\*(\w*)\*\//);
                                matchVal = args[i].match(/(?:\/\*\w*\*\/)?(\w*)/);
                                if(matchVal[1]) {
                                    toCheck[i] = {};
                                    toCheck[i][matchKey ? matchKey[1] : 'mixed'] = matchVal[1];
                                    output += '{"' + (matchKey ? matchKey[1] : 'mixed') + '": ' + matchVal[1] + '}';
                                    if((i + 1) !== args.length)
                                        output += ', ';
                                }
                            }
                            code = code.replace(val, val + `Development.Debugger.Argument.check([` + output + `], '` + funcName[1] + `', ` + explodedName + `);`);
                        }
                    }
                });
            }
        }
    }

    namespacify();
    if('dev' === config.mode)
        enableDebug();
    return code;
}


/**
 * [treatFile description]
 * @param  {[type]} dirname  [description]
 * @param  {[type]} filename [description]
 * @return {[type]}          [description]
 */
function treatFile(dirname, filename) {
    file = path.resolve(dirname, filename);

    if('.js' === path.extname(file)) {

        if(-1 < file.indexOf(BOOT_FILE))
            return;

        if('dev' === config.mode) {//If dev, we add the file to the files to be loaded and we create a compiled copy

            if(-1 < file.indexOf(__dirname)) {//if we are browsing core dir
                var parentDirs = dirname.replace(__dirname, '');
            } else if(loopModules) {//if we are browsing a module
                var parentDirs = dirname.replace(modulesPath, '');
            } else {//if we are browsing source dir
                var parentDirs = dirname.replace(__callerDir + config.source, '');
            }

            var result = babel.transform(preprocess(file, fs.readFileSync(file,'utf-8')), {
                presets: [
                    'es2015', 'stage-0'
                ]
            });

            var filePath = parentDirs.replace(/\\/g, '/');

            requiredPaths.push(__tmpUri + (0 === filePath.indexOf('/') ? filePath.substr(1) : filePath) + '/' + filename);

            fs.writeFileSync(__tmp + parentDirs + DS + filename, result.code);

        } else {//Else, file content is appended to temp.js for later compilation
            var temp = fs.readFileSync(file, 'utf-8');
            fs.appendFileSync(currentPath + TEMP_FILE, '\n' + preprocess(file, temp));
        }
    } else if('' === path.extname(file)) {

        if('dev' === config.mode) {
            if(-1 < file.indexOf(__dirname)) {//if we are browsing core dir
                var parentDirs = file.replace(__dirname, '').split(DS);
            } else if(loopModules) {//if we are browsing a module
                var parentDirs = file.replace(modulesPath, '').split(DS);
            } else {//if we are browsing source dir
                var parentDirs = file.replace(__callerDir, '').split(DS);
            }

            var tempPath = __tmp;
            parentDirs.forEach(function(val) {
                tempPath += val + DS;

                if(!fs.existsSync(tempPath))
                    fs.mkdirSync(tempPath);
            });
        }

        if((-1 < file.indexOf(__buns)|| loopModules) && file !== MOD_CONF) {
            var roots = [
                'core', 'modules'
            ], splittedName = file.split(DS), newNamespace;


            if(-1 < roots.indexOf(splittedName[splittedName.length - 2])) {
                newNamespace = 'var ' + splittedName[splittedName.length - 1] + ' = ' + splittedName[splittedName.length - 1] + ' || {};';
            } else if(loopModules) {

                if('buns' === splittedName[splittedName.length - 2]) {
                    newNamespace = 'var ' + splittedName[splittedName.length - 1] + ' = ' + splittedName[splittedName.length - 1] + ' || {};';
                } else {
                    newNamespace = splittedName[splittedName.length - 2] + '.' + splittedName[splittedName.length - 1] + ' = ' + splittedName[splittedName.length - 2] + '.' + splittedName[splittedName.length - 1] + ' || {};';
                }
            } else {
                newNamespace = splittedName[splittedName.length - 2] + '.' + splittedName[splittedName.length - 1] + ' = ' + splittedName[splittedName.length - 2] + '.' + splittedName[splittedName.length - 1] + ' || {};';
            }

            fs.appendFileSync(currentPath + TEMP_FILE, newNamespace);
        }
    } else {

    }


}

/**
 * Reads dirs synchronously.
 * @param  {[type]} path1 [description]
 * @return {[type]}       [description]
 */
function recursiveReaddirSync(path1) {
  var list = [], files = fs.readdirSync(path1), stats;

    files.forEach(function (file) {
        treatFile(path1, file);
        stats = fs.lstatSync(path.join(path1, file));
        if(stats.isDirectory()) {
            list = list.concat(recursiveReaddirSync(path.join(path1, file)));
        } else {
            list.push(path.join(path1, file));
        }
    });

    return list;
}


function getDependencies(moduleDir, name) {

    var path = moduleDir + name + DS, moduleConf = JSON.parse(fs.readFileSync(path + 'package.json', 'utf-8')),
        loadedModules = moduleOrder.map(function(val) {
            return val.name;
        });

    if(-1 === loadedModules.indexOf(name) && (('dev' === config.mode && moduleConf.bunsDev) || (moduleConf.buns))) {
        if(moduleConf.dependencies) {
            for(j in moduleConf.dependencies) {
                getDependencies(modulesPath, j);
            }
        }
        moduleOrder.push({
            path, name
        });
    }

}

/**
 * Execute Babel transpilation and remove temp.js file
 */
function executeBabel() {
    fs.stat(currentPath + DS + outputName, function(error) {
        if(!error)
            fs.unlinkSync(currentPath + DS + outputName);
        //Executes Babel transpilation on main file
        var result = babel.transform(fs.readFileSync(currentPath + TEMP_FILE, 'utf-8'), {
            presets: [
                'es2015', 'stage-0'
            ]
        });

        fs.writeFileSync(currentPath + DS + outputName, result.code);
        if('prod' === config.mode && false) {//Code is minified for production environment.
            var minified = uglify.minify(currentPath + DS + outputName);
            fs.writeFileSync(currentPath + DS + outputName, minified.code);
        }

        fs.unlinkSync(currentPath + TEMP_FILE);
    });
}

//Module
var buns = {
    build: function(flag) {
        if(!configExists) {
            throw new Error('Error, buns.json does not exist. You can create it with "buns init" command.');
        }
        //Add .tmp dir if it doesn't exist
        if(!fs.existsSync(__tmp))
            fs.mkdirSync(__tmp);

        var bunsBase = __tmp + 'buns-base.js';

        outputName = config.outputName || 'buns-' + flag + '.js';
        currentPath = config.output + DS;

        try {
            fs.unlinkSync(currentPath + TEMP_FILE);
        } catch(e) {}

        config.mode = flag || config.mode;

        if(!fs.existsSync(currentPath))
            fs.mkdirSync(currentPath);

        if('dev' === config.mode) {
            fs.appendFileSync(currentPath + TEMP_FILE, NL + fs.readFileSync(__inc + 'errorInit.js'));
        } else //Code is put in a self invoking function in prod mode
            fs.appendFileSync(currentPath + TEMP_FILE, NL + '(function() {');
        recursiveReaddirSync(__core);

        if(0 < Object.keys(config.modules).length) {
            loopModules = true;
            //First, we sort modules by their dependencies
            for(i in config.modules) {
                currentModule = i;
                var modulePath = modulesPath + i + DS + 'buns' + DS, loadedModules = moduleOrder.map(function(val) {
                    return val.name;
                });

                if(-1 === loadedModules.indexOf(i)) {
                    try {
                        getDependencies(modulesPath, i);
                    } catch (e) {
                        throw new Error('Error, module "' + i + '" is not installed.');
                    }
                }

            }

            //Then, we load them
            for(i = 0; i < moduleOrder.length; ++i) {
                currentModule = moduleOrder[i].name;
                recursiveReaddirSync(moduleOrder[i].path + 'buns' + DS);
                //Trying to add module bootstrap file (if it exists)
                try {
                    var currentModuleDir = moduleOrder[i].path.replace(modulesPath, ''),
                     result = babel.transform(preprocess(moduleOrder[i].path + 'buns' + DS + BOOT_FILE, fs.readFileSync(moduleOrder[i].path + 'buns' + DS + BOOT_FILE,'utf-8')), {
                        presets: [
                            'es2015', 'stage-0'
                        ]
                    });

                    requiredPaths.push(__tmpUri + (currentModuleDir + 'buns' + DS + BOOT_FILE).replace(modulesPath + 'buns', '').replace(/\\/g, '/'));
                    fs.writeFileSync(__tmp + currentModuleDir + 'buns' + DS + BOOT_FILE, '(function() {' + result.code + '})();');
                } catch (e) {}
            }
            loopModules = false;
        }

        try {
            recursiveReaddirSync(config.source);
        } catch (e) {
            throw new Error('Source code directory is not defined or does not exist, check your buns.json file.');
        }

        fs.appendFileSync(currentPath + TEMP_FILE, NL + 'var BUNS_IS_DEV = ' + ('dev' === config.mode ? 'true' : 'false') + ';');
        if('dev' === config.mode) {
            var confBuns = JSON.parse(fs.readFileSync(__buns + 'package.json')),
                infos = JSON.parse(exec('npm info buns --json').toString('utf8'));
            fs.appendFileSync(currentPath + TEMP_FILE, NL + `var BUNS_FILES = ["` + requiredPaths.join('","') + `"],`);
            fs.appendFileSync(currentPath + TEMP_FILE, NL + ` BUNS_VERSION = "` + confBuns.version + `",`);
            fs.appendFileSync(currentPath + TEMP_FILE, NL + ` BUNS_LATEST_VERSION = "` + infos.version + `",`);
            fs.appendFileSync(currentPath + TEMP_FILE, NL + ` BUNS_DEPRECATED_VERSION = "` + infos.deprecatedVersion + `";`);
            fs.appendFileSync(currentPath + TEMP_FILE, NL + fs.readFileSync(__inc + 'devLaunch.js'));
        }

        if('dev' === config.mode) {
            fs.writeFileSync(bunsBase, babel.transform(fs.readFileSync(currentPath + TEMP_FILE, 'utf-8'), {
                presets: [
                    'es2015', 'stage-0'
                ]
            }).code);
        }

        var code, sub, parsedData = {};
        try {
            fs.statSync(config.source + DS + BOOT_FILE);
            code = fs.readFileSync(config.source + DS + BOOT_FILE, 'utf-8');
        } catch(e) {
            code = fs.readFileSync(__inc + BOOT_FILE, 'utf-8');
        }

        var tempCode = code;

        if('dev' === config.mode) {
            walk(esprima.parse(code, {
                range: true,//set to true to inject code at nth char
                attachComment: true,//
                loc: true//set to true to get file position of function calls
            }), function(node) {
                tempCode = walkCallback(node, tempCode, code, '"' + BOOT_FILE + '"');
            });
        }
        fs.appendFileSync(currentPath + TEMP_FILE, NL + 'document.addEventListener("DOMContentLoaded", function(BUNS_DOM_READY) {');
        fs.appendFileSync(currentPath + TEMP_FILE, tempCode);
        fs.appendFileSync(currentPath + TEMP_FILE, NL + '});');

        if('prod' === config.mode)
            fs.appendFileSync(currentPath + TEMP_FILE, NL + '})();');
        executeBabel();
    },
    clear: function() {
        var deleteFolderRecursive = function(path) {
            if(fs.existsSync(path)) {
                fs.readdirSync(path).forEach(function(file, index){
                    var curPath = path + DS + file;
                    if(fs.lstatSync(curPath).isDirectory()) {
                        deleteFolderRecursive(curPath);
                    } else {
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            }
        };
        deleteFolderRecursive(__tmp);
    },
    init: function(data) {
        data = extend(config, data);
        fs.writeFileSync(BUILD_CONF, JSON.stringify(data, null, 2));
    },
    install: function(requestedModule) {
        var name = requestedModule;

        function saveModule(module) {
            if(module.buns || module.bunsDev) {
                if(!localConfig.modules) {
                    localConfig.modules = {};
                }
                localConfig.modules[module.name] = '^' + module.version;
                fs.writeFileSync(BUILD_CONF, JSON.stringify(localConfig, null, 2));
            } else {
                throw new Error('This module is not made for Buns.');
            }
        }

        // var command = 'npm i --prefix ' + __buns;
        var command = 'npm i';
        if(requestedModule) {
            command += ' --save-dev ' + name;
        } else {
            command += ' --only=dev';
            var confBuns = JSON.parse(fs.readFileSync(__buns + 'package.json'));
            confBuns.devDependencies = localConfig.modules;
            fs.writeFileSync(__buns + 'package.json', JSON.stringify(confBuns, null, 2));
        }

        exec(command);

        if(requestedModule) {
            var conf = JSON.parse(fs.readFileSync(modulesPath + name + DS + 'package.json'));
            saveModule(conf);
        }
    },
    generate: function(type, name) {
        if(!configExists) {
            throw new Error('Error, buns.json does not exist. You can create it with "buns init" command.');
        }
        //Generate a controller, a model or anything that can be generated
    },
    watch: function() {
        if(!configExists) {
            throw new Error('Error, buns.json does not exist. You can create it with "buns init" command.');
        }
        config.mode = 'dev';

        this.build();

        var bs = require('browser-sync').create(), callbacks = {};

        //File change
        callbacks.change = function(file) {
            if(-1 === requiredPaths.indexOf(__tmp + file)) {
                if(-1 < file.indexOf(__dirname)) {//if we are browsing core dir
                    var parentDirs = file.replace(__dirname, '');
                } else {//if we are browsing source dir
                    var parentDirs = file.replace(__callerDir + config.source, '');
                }
                e = parentDirs.split(DS);
                var filename = e.pop();
                parentDirs = e.join(DS);

                var filePath = parentDirs.replace(/\\/g, '/');
                requiredPaths.push(__tmpUri + (0 === filePath.indexOf('/') ? filePath.substr(1) : filePath) + '/' + filename);
            }

            if(config.source + DS + BOOT_FILE !== file) {
                console.log('Recompiled : ' + __callerDir + file);
                var result = babel.transform(preprocess(__callerDir + DS + file, fs.readFileSync(__callerDir + file, 'utf-8')), {
                    presets: [
                        'es2015', 'stage-0'
                    ]
                });

                fs.writeFileSync(__tmp + file, result.code);

            } else {
                //Will have to reload the whole buns output file
                var code = fs.readFileSync(config.source + DS + BOOT_FILE, 'utf-8'), tempCode = code;

                if('dev' === config.mode) {
                    walk(esprima.parse(code, {
                        range: true,//set to true to inject code at nth char
                        attachComment: true,//
                        loc: true//set to true to get file position of function calls
                    }), function(node) {
                        tempCode = walkCallback(node, tempCode, code, '"' + BOOT_FILE + '"');
                    });
                }

                fs.writeFileSync(
                    currentPath + outputName,
                    fs.readFileSync(__tmp + 'buns-base.js') +
                    NL + 'document.addEventListener("DOMContentLoaded", function(BUNS_DOM_READY) {' +
                    tempCode +
                    NL + '});'
                );
            }
            bs.sockets.emit('browser:reload', {file: file});
        };

        //File creation
        callbacks.add = function(file) {
            if(-1 === requiredPaths.indexOf(__tmp + file)) {
                if(-1 < file.indexOf(__dirname)) {//if we are browsing core dir
                    var parentDirs = file.replace(__dirname, '');
                } else {//if we are browsing source dir
                    var parentDirs = file.replace(__callerDir + config.source, '');
                }
                e = parentDirs.split(DS);
                var filename = e.pop();
                parentDirs = e.join(DS);

                var filePath = parentDirs.replace(/\\/g, '/'),
                    newFile = __tmpUri + (0 === filePath.indexOf('/') ? filePath.substr(1) : filePath) + '/' + filename;
                if(-1 === requiredPaths.indexOf(newFile)) {
                    requiredPaths.push(newFile);
                }

            }

            if(config.source + DS + BOOT_FILE !== file) {
                console.log('Added : ' + __callerDir + file);
                var result = babel.transform(preprocess(__callerDir + DS + file, fs.readFileSync(__callerDir + file, 'utf-8')), {
                    presets: [
                        'es2015', 'stage-0'
                    ]
                });

                fs.writeFileSync(__tmp + file, result.code);
                //console.log(fs.readFileSync(currentPath + outputName, 'utf-8').replace('var BUNS_FILES = \[(?:.*)\];', `var BUNS_FILES = ["` + requiredPaths.join('","') + `"];`))
                fs.writeFileSync(
                    currentPath + outputName,
                    fs.readFileSync(currentPath + outputName, 'utf-8').replace(/var BUNS_FILES = \[(?:.*)\];/, `var BUNS_FILES = ["` + requiredPaths.join('","') + `"];`)
                );
            } else {
                //Will have to reload the whole buns output file
                var code = fs.readFileSync(config.source + DS + BOOT_FILE, 'utf-8'), tempCode = code;

                if('dev' === config.mode) {
                    walk(esprima.parse(code, {
                        range: true,//set to true to inject code at nth char
                        attachComment: true,//
                        loc: true//set to true to get file position of function calls
                    }), function(node) {
                        tempCode = walkCallback(node, tempCode, code, '"' + BOOT_FILE + '"');
                    });
                }

                fs.writeFileSync(
                    currentPath + outputName,
                    fs.readFileSync(__tmp + 'buns-base.js') +
                    NL + 'document.addEventListener("DOMContentLoaded", function(BUNS_DOM_READY) {' +
                    tempCode +
                    NL + '});'
                );
            }
            bs.sockets.emit('browser:reload', {file: file});
        };

        //File deletion
        callbacks.unlink = function(file) {
            if(-1 === requiredPaths.indexOf(__tmp + file)) {
                if(-1 < file.indexOf(__dirname)) {//if we are browsing core dir
                    var parentDirs = file.replace(__dirname, '');
                } else {//if we are browsing source dir
                    var parentDirs = file.replace(__callerDir + config.source, '');
                }
                e = parentDirs.split(DS);
                var filename = e.pop();
                parentDirs = e.join(DS);

                var filePath = parentDirs.replace(/\\/g, '/'),
                    newFile = __tmpUri + (0 === filePath.indexOf('/') ? filePath.substr(1) : filePath) + '/' + filename;
                if(-1 === requiredPaths.indexOf(newFile)) {
                    requiredPaths.push(newFile);
                }

            }

            if(config.source + DS + BOOT_FILE !== file) {
                console.log('Removed : ' + __callerDir + file);
                var index = requiredPaths.indexOf(newFile);
                if(-1 !== index) {
                    requiredPaths.splice(index, 1);
                    //fs.unlinkSync();
                    fs.writeFileSync(
                        currentPath + outputName,
                        fs.readFileSync(currentPath + outputName, 'utf-8').replace(/var BUNS_FILES = \[(?:.*)\];/, `var BUNS_FILES = ["` + requiredPaths.join('","') + `"];`)
                    );
                }
            } else {

                //Will have to reload the whole buns output file
                var code = fs.readFileSync(__inc + BOOT_FILE, 'utf-8'), tempCode = code;

                if('dev' === config.mode) {
                    walk(esprima.parse(code, {
                        range: true,//set to true to inject code at nth char
                        attachComment: true,//
                        loc: true//set to true to get file position of function calls
                    }), function(node) {
                        tempCode = walkCallback(node, tempCode, code, '"' + BOOT_FILE + '"');
                    });
                }

                fs.writeFileSync(
                    currentPath + outputName,
                    fs.readFileSync(__tmp + 'buns-base.js') +
                    NL + 'document.addEventListener("DOMContentLoaded", function(BUNS_DOM_READY) {' +
                    tempCode +
                    NL + '});'
                );
            }
            bs.sockets.emit('browser:reload', {file: file});
        };

        var bsConf = {
            files: [
                {
                    match: [config.source + DS + '**' + DS + '*.js'],
                    fn: function(event, file) {
                        callbacks[event](file);
                    }
                }
            ],
            notify: false
        };

        if(config.bs) {
            bsConf = extend(config.bs, bsConf);
        }
        if(!bsConf.proxy && !bsConf.server)
            bsConf.server = __callerDir;

        bs.init(bsConf);

        //Files watching
        //bs.watch(config.source + DS + '**/*.js').on('change', onUpdate);

        //Custom watching
        if(0 < config.watch.length) {
            for(i = 0; i < config.watch.length; ++i) {
                bs.watch(config.source + DS + config.watch.length[i]).on('change', function(file) {
                    bs.sockets.emit('browser:reload', {file: file});
                });
            }
        }

        process.stdin.resume();
        function onExit(options) {
            //Setting watcher to false
            try {
                fs.writeFileSync(
                    currentPath + outputName,
                    fs.readFileSync(currentPath + outputName, 'utf-8').replace('BUNS_WATCH_ENABLED = true;', 'BUNS_WATCH_ENABLED = false;')
                );
            } catch (e) {}

            process.exit();
        };

        process.on('uncaughtException', onExit);
        process.on('SIGHUP', onExit);
        process.on('SIGINT', onExit);
        process.on('SIGTERM', onExit);
        process.on('exit', onExit);
        process.on('beforeExit', onExit);
    }
}

//Exporting module
for(var methods in buns) {
    exports[methods] = buns[methods];
}
