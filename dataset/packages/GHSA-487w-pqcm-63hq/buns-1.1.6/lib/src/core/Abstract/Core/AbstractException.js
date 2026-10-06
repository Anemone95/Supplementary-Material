#!namespace Abstract.Core;

class AbstractException extends Error {
    /**
     * Do not override, use "onConstruct" instead. Provides default functionalities for each abstract classes.
     */
    constructor() {
        super();
        this.onConstruct.apply(this, arguments);
    }

    onConstruct(message) {
        Development.Debugger.Debugger.message = message;
    }
}
