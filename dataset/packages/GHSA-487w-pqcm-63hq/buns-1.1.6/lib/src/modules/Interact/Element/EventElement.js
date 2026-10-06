#!namespace Interact.Element;
#!use Environment.Tools.Tools;

class EventElement extends Interact.Element.AbstractElement {
    onConstruct(/*String*/selector) {
        super.onConstruct(selector);
    }

    on(/*Array*/events, /*Function*/callback, /*Object*/data = {}) {
        var thus = this, constructor = this.constructor,
            handler = constructor.EVENT_ELEMENT_HANDLER(thus, callback);

        events.forEach(function(val) {
            thus.addEvent(val, callback, handler);
        });
        return this;
    }

    one(/*Array*/events, /*Function*/callback, /*Object*/data = {}) {

        return this;
    }

    off(/*Array*/events = [], /*Function*/callback = null) {
        var thus = this, i;
        if(callback && events) {//Remove a specific event handler
            events.forEach(function(event) {
                for(i in thus._registeredEvents) {
                    if(thus._registeredEvents[i].event === event && thus._registeredEvents[i].callback === callback)
                        thus.removeEvent(event, thus._registeredEvents[i]);
                }
            })
        } else if(events) {//Remove a specific event
            events.forEach(function(event) {
                thus._registeredEvents.forEach(function(val) {
                    if(val.event === event)
                        thus.removeEvent(event, val);
                });
            })
        } else {//Remove all events
            this._registeredEvents.forEach(function(val) {
                thus.removeEvent(val.event, val);
            });
        }
        return this;
    }

    addEvent(event, callback, handler) {
        if(!this._registeredEvents) {
            this._registeredEvents = {};
        }
        this._registeredEvents[this.getPointer()] = {
            event: event,
            callback: callback,
            handler: handler
        };
        document.addEventListener(event, handler);
    }

    removeEvent(event, object) {
        if(Tools.isSet(this._registeredEvents[this.getPointer()])) {
            this._registeredEvents[this.getPointer()] = undefined;
            document.removeEventListener(event, object.handler);
        }
    }

    static delegate(/*String*/selector, /*Array*/events, /*Function*/callback) {
        var constructor = this.constructor;
        events.forEach(function(val) {
            document.addEventListener(val, function(e) {
                var target = new constructor(selector);
                target.forEach(function() {
                    if(e.target === this.getTag()) {
                        callback.call(this, e);
                    }
                });

            });
        });

    }

    static EVENT_ELEMENT_HANDLER(current, callback) {
        var constructor = current.constructor, element = new constructor(current.getTag().rootPath());
        return function(e) {
            if(element.getTag() === e.target && Tools.isSet(current._registeredEvents[current.getPointer()])) {
                callback.call(current, e);
            }
        };
    }
}
