#!namespace Interact.Element;

class AbstractEvent extends Abstract.Core.AbstractCore {
    onConstruct() {
        this.list = eventNames;
        this.callback = callback;
    }

    static get CUSTOM_EVENTS() {
        return {
            contentmodified: {//TODO event contentmodified
                check: function() {
                    return true;
                },
                init: function(callback) {
                    Buns(this.element).on('DOMSubtreeModified', {event: this, callback: callback}, this.innerCallback);
                },
                remove: function() {
                    Buns(this.element).off('DOMSubtreeModified', {event: this}, this.innerCallback);
                },
                innerCallback: function(event) {
                    //var this = event.data.event;
                    //var element = Buns(this.element);
                    //event.data.callback.apply(element, event);
                }
            },
            clickout: {
                check: function() {
                    return true;
                },
                init: function(settings) {
                    var innerCallback = this.innerCallback;
                    document.addEventListener('click', (function(settings) {
                        return function(e) {
                            innerCallback(e, settings);
                        };
                    })(settings), true);
                },
                remove: function() {
                    document.removeEventListener('click', this.innerCallback, true);
                },
                innerCallback: function(event, settings) {
                    var element = settings.element, elementOffset = element.offset();
                    if((event.pageX < elementOffset.left || event.pageX > elementOffset.left + element.outerWidth()) ||
                            (event.pageY < elementOffset.top || event.pageY > elementOffset.top + element.outerHeight())) {
                        settings.callback.apply(element, event);
                    }
                }
            },
            enter: {
                check: function(event) {
                    return event.keyCode === 13 && event.type === 'keypress';
                }
            },
            escape: {
                check: function(event) {
                    return event.keyCode === 27 && event.type === 'keypress';
                }
            },
            hovering: {//TODO
                check: function(event) {
                    return true;
                }
            },
            lclick: {
                check: function(event) {
                    return event.which === 1 && event.type === 'mouseup';
                }
            },
            mclick: {
                check: function(event) {
                    return event.which === 2 && event.type === 'mouseup';
                }
            },
            rclick: {
                check: function(event) {
                    return event.which === 3 && event.type === 'mouseup';
                }
            },
            swipe: {
            }
        };
    }

    static get NATIVE_EVENTS() {
        return [
            'abort', 'activate', 'blur', 'change', 'click', 'copy', 'cut', 'dblclick',
            'drag', 'dragend', 'dragenter', 'dragleave', 'dragover', 'dragstart', 'drop',
            'error', 'finish', 'focus', 'focusin', 'focusout', 'hashchange', 'help', 'hover',
            'keydown', 'keypress', 'keyup', 'load', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove',
            'mouseout', 'mouseover', 'mouseup', 'offline', 'online', 'paste', 'resize', 'scroll',
            'select', 'submit', 'touchcancel', 'touchend', 'touchenter', 'touchleave', 'touchmove', 'touchstart'
        ];
    }


}
