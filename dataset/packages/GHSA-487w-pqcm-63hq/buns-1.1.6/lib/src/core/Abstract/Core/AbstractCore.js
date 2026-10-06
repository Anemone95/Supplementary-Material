#!namespace Abstract.Core;
#!use Environment.Tools.Tools;

class AbstractCore {
    /**
     * Do not override, use "onConstruct" instead. Provides default functionalities for each abstract classes.
     */
    constructor() {
        // if(0 === this.constructor.name.indexOf('Abstract')) {
        //     throw new Error('Error, trying to instantiate "' + this.constructor.name + '" : class is abstract, action is forbidden.');
        // }

        if(!this.constructor.__initializedClasses)
            this.constructor.__initializedClasses = [];

        if(!this.constructor.__initializedClasses[this.constructor.name]) {
            this.constructor.__initializedClasses[this.constructor.name] = true;
            this.onInitialize();
            this._listeners = {};
        }

        this.onConstruct.apply(this, arguments);

        this.onFinish();
    }

    /**
     * Used if a class is instantiated for the first time.
     */
    onInitialize() {}

    /**
     * Used each time an object is created, replaces "constructor" method.
     */
    onConstruct() {}

    /**
     * Used each time an object has finished being instantiated.
     */
    onFinish() {}

    static listen(/*String*/event, /*Function*/callback) {

        if(!Tools.isSet(this._listeners)) {
            this._listeners = {};
        }

        if(!Tools.isSet(this._listeners[event])) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
    }

    static denyListener(/*String*/event) {
        this._listeners[event] = [];
    }

    static triggerListener(/*String*/event, /*Array*/args = []) {
        let i;
        if(this._listeners && this._listeners[event]) {
            for(i = 0; i < this._listeners[event].length; ++i) {
                this._listeners[event][i].apply(this, args);
            }
        }
    }
}
