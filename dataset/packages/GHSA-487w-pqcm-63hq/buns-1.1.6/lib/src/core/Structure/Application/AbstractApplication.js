#!namespace Structure.Application;
#!use Environment.Tools.Tools;

class AbstractApplication extends Abstract.Core.AbstractCore {
    onConstruct(/*Object*/settings = {}) {
        var i;
        for(i in settings) {
            this[i] = settings[i];
        }
        console.log(this);
    }

    set api(/*Http*/api = null) {
        this._api = api;
    }

    get api() {
        return this._api;
    }

    set db(/*Adapter*/db = null) {
        this._db = db;
    }

    get db() {
        return this._db;
    }

    set router(/*Router*/router = null) {
        this._router = router || new Structure.Router.HashRouter();
    }

    get router() {
        return this._router;
    }

    set socket(/*Socket*/socket = null) {
        this._socket = socket;
    }

    get socket() {
        return this._socket;
    }

    set url(/*String*/url = null) {
        this._url = url || window.location.domain;
    }

    get url() {
        return this._url;
    }

    set viewEngine(/*ViewEngine*/viewEngine = null) {
        this._viewEngine = viewEngine;
    }

    get viewEngine() {
        return this._viewEngine;
    }

    exec() {
        if(this.router) {
            this.router.handle();
        } else if(BUNS_IS_DEV) {
            throw new Error('The router is not defined.');
        }
    }
}
