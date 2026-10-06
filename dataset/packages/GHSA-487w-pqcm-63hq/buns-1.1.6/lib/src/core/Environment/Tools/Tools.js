#!namespace Environment.Tools

class Tools {
    //TODO Google -> github badges http://shields.io/
    static get Constants() {
        return {
            MAX_TIME_INT    : 2147483647,
        }
    }

    static addScript(/*String*/name, /*String*/content) {
        //Buns.store(name, content);
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.textContent = content;
        document.getElementsByTagName('body')[0].appendChild(script);
    }

    static addStyle(/*String*/name, /*String*/content) {
        //Buns.store(name, content);
        var style = document.createElement('style');
        style.type = 'text/css';
        style.textContent = content;
        document.head.appendChild(style);
    }

    static cast(/*String*/type, /*mixed*/value) {
        const types = {

            int: function() {
                return parseInt(value);
            },
            float: function() {
                return parseFloat(value);
            },
            object: function() {
                if(this.isString(value)) {
                    try {
                        return JSON.parse(value);
                    } catch (e) {}
                } else {

                }

            },
            string: function() {
                if(value.toString) {
                    return value.toString();
                } else if(this.isObject(value)) {
                    JSON.stringify(value);
                } else {
                    return '' + value;
                }
            },
        };
        if(this.isFunction(types[type])) {
            return types[type]();
        } else if(type){
            Object.create(type, value);
        }
    }

    static checkArguments(/*String*/functionName, /*Array*/args,
        /*Array*/settings, /*Integer*/countTotalArgs, /*Integer*/countOptional) {
        var i, type, check;
        if(countOptional + args.length < countTotalArgs)
            throw new Error('Invalid number of arguments');//Number of args invalid
        for(i = 0; i < settings.length; ++i) {
            if(this.isSet(args[i]) && 'mixed' !== settings[i]) {
                type = typeof(args[i]), check = 'is' + settings[i].capitalize();
                if(!this[check](args[i]))
                    throw new Error('Argument #' + (i + 1) + ' in "' + functionName +
                    '" should be ' + settings[i] + ', ' + type + ' passed.');
            }
        }
    }

    static cleanArray(array) {//TODO adapt jQuery cleanArray
        var newArray = {};
        Buns.each(array, function(key, val) {
            if(typeof val === 'object')
                val = cleanArray(val);
            if(val)
                newArray[key] = val;
        });
        return newArray;
    }

    static extend(target) {
        var sources = [].slice.call(arguments, 1);
        sources.forEach(function (source) {
            for(var prop in source) {
                target[prop] = source[prop];
            }
        });
        return target;
    }

    static getCookie(/*String*/index) {
        var name = index + '=', ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; ++i) {
            var c = ca[i].trim();
            if(0 === c.indexOf(name))
                return c.substring(name.length, c.length);
        }
        return '';
    }

    static getType(/*Object*/object) {
        return Object.prototype.toString.call(object).replace(/^\[object (.+)\]$/, "'$1'").toLowerCase();
    }

    static hashCode(/*String*/string) {
        var hash = 0, char, i;
        if(0 === string.length)
            return hash;
        for(i = 0; i < string.length; ++i) {
            char = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    static isArray(/*mixed*/value) {
        return Array.isArray(value);
    }

    static isAdapter(/*mixed*/value) {
        return value instanceof(Data.Adapter.AbstractAdapter);
    }

    static isBoolean(/*mixed*/value) {
        return 'boolean' === typeof(value);
    }

    static isController(/*mixed*/value) {
        return value instanceof(Structure.Controller.AbstractController);
    }

    static isEmpty(/*mixed*/value) {
        if(!this.isSet(value))
            return true;
        return 0 === Object.getOwnPropertyNames(value).length || '' === value;
    }

    static isElement(/*mixed*/value) {
        return value instanceof(Interact.Element.AbstractElement);
    }

    static isEventManager(/*Object*/object) {
        return object instanceof(Interact.Event.AbstractEvent);
    }

    static isFloat(/*mixed*/value) {
        return 'number' === typeof(value) && -1 < value.indexOf('.');
    }

    static isFunction(/*mixed*/value) {
        return 'function' === typeof(value);
    }

    static isHttp(/*mixed*/value) {
        return value instanceof(Request.Http.AbstractHttp);
    }

    static isInteger(/*mixed*/value) {
        return 'number' === typeof(value) && value === parseInt(value, 10);
    }

    static isMixed(/*mixed*/value) {
        return true;
    }

    static isNumber(/*mixed*/value) {
        return 'number' === typeof(value);
    }

    static isObject(/*mixed*/value) {
        return 'object' === typeof(value);
    }

    static isPluginManager(/*Object*/object) {
        return true;//return object instanceof(Buns.Framework.Interact.Plugin.AbstractPlugin);
    }

    static isRouteGroup(/*mixed*/value) {
        return value instanceof(Structure.Router.RouteGroup);
    }

    static isRouter(/*mixed*/value) {
        return value instanceof(Structure.Router.AbstractRouter);
    }

    static isSocket(/*mixed*/value) {
        return value instanceof(Request.Socket.AbstractSocket);
    }

    static isSet(/*mixed*/primitive) {
        return 'undefined' !== typeof(primitive) && null !== primitive;
    }

    static isTrace(/*mixed*/value) {
        return value instanceof(Development.Debugger.Trace);
    }

    static isString(/*mixed*/value) {
        return 'string' === typeof(value);
    }

    static isViewEngine(/*mixed*/value) {
        return value instanceof(Structure.View.AbstractViewEngine);
    }

    static init(/*Function*/callback, /*[Object]*/settings) {
        var classes, style, classesHashCode = Buns.hashCode('classes'),
            coreHashCode = Buns.hashCode('core');
        Buns.settingsPath = (settings.settingsPath || 'dependencies/core/');
        Buns.isDev = settings.isDev || false;
        if(Buns.isDev) {
            sessionStorage.clear();
            Buns.debugger = {type: Buns.Constants.FILE_TYPE_CLASS};
        }

        Buns.Framework.Environment.Compatibility.check();

        classes = Buns.require(Buns.settingsPath + 'classes.js');
        style = Buns.require(Buns.settingsPath + 'Buns.css');

        Promise.all([classes, style]).then(function(contents) {
            Buns.addScript(Buns.settingsPath + 'classes.js', contents[0]);

            Buns.addStyle(Buns.settingsPath + 'Buns.css',
                contents[1].replace(/url\("/g, 'url("' + Buns.settingsPath));
            Application = Buns.use('Application'), Router = Buns.use('Router'),
                PluginManager = Buns.use('PluginManager');

            callback();
            //delete Application;
            //delete Router;
            //delete PluginManager;
        });
    }

    static log() {
        if(Buns.isDev)
            console.log(arguments);
    }

    static merge(/*Object*/to, /*Object*/from, /*[Boolean]*/overwrite) {
        if(!this.isSet(overwrite))
            overwrite = false;
        var out = {}, property;
        for(property in to)
            out[property] = to[property];
        for(property in from) {
            if(this.isSet(from[property]))
                out[property] = from[property];
        }
        return out;
    }

    static parameters(object) {
        var str = [];
        for(var property in object)
            if (object.hasOwnProperty(property))
                str.push(encodeURIComponent(property) + '=' + encodeURIComponent(object[property]));
        return str.join('&');
    }

    static parseHtml(/*String*/html) {
        var temp = document.implementation.createHTMLDocument();
        temp.body.innerHTML = html;
        return temp.body.children;
    }

    static registerPrototype(/*String*/classObj, /*String*/name, /*Function*/pluginBody) {
        // if(!window[class][name])
        //     window[class].prototype[name] = pluginBody;
        // else {
        //     throw new Error('"' + name + '" is already defined for "' + classObj + '", you must inherit the class instead.');
        // }
    }

    static size(/*Object*/object) {
        var size = 0, key;
        for(key in object)
            if(object.hasOwnProperty(key))
                ++size;
        return size;
    }

    static store(/*String*/key, /*String*/content) {
        var fileHashCode = Buns.hashCode(key);
        if(!Buns.isSet(sessionStorage[fileHashCode]))
            sessionStorage.setItem(fileHashCode, content);
    }

    static toBoolean(/*mixed*/value) {
        if('boolean' === typeof(value))
            return value;
        if('number' === typeof(value))
            value = value.toString();
        var trueBooleans = ['true', 1, '1', 'yes', 'on'],
                falseBooleans = ['false', 0, '0', 'no', 'off'];
        if(trueBooleans.indexOf(value.toLowerCase()) > -1)
            return true;
        else if(falseBooleans.indexOf(value.toLowerCase()) > -1)
            return false;
        else
            return false;
    }

    static toController(/*String*/value) {
        return value.capitalize() + 'Controller';
    }

}
