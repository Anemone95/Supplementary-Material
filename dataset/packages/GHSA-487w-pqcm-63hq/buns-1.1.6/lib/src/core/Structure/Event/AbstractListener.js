#!namespace Structure.Event;
#!use Environment.Tools.Tools;

class AbstractListener extends Abstract.Core.AbstractCore {
    static initClassListener(/*String*/className, /*String*/event) {
        if(!Tools.isSet(this.constructor[className])) {
            this.constructor[className] = {};
        }

        if(!Toos.isSet(this.constructor[className][event])) {
            this.constructor[className][event] = [];
        }
    }


    static on(/*String*/className, /*String*/event, /*Function*/callback) {
        initClassListener(className, event);
        this.constructor[className][event].push(callback);
    }

    static off(/*String*/className, /*String*/event) {

    }

    static add(/*String*/className, /*Array*/events) {
        for(var event in events) {
            initClassListener(className, event);
            this.constructor[className][event].push(events[event]);
        }
    }

    static remove(/*String*/className) {

    }

    static trigger(/*String*/className, /*String*/event, /*mixed*/currentThis, /*Array*/args = []) {
        if(this.constructor[className] && this.constructor[className][event]) {
            for(var i = 0; i < this.constructor[className][event].length; ++i) {
                this.constructor[className][event].apply(currentThis, args);
            }
        }
    }

}
