#!namespace Structure.Router;

#!use Development.Debugger.Debugger;

class HashRouter extends Structure.Router.AbstractRouter {
    onConstruct(/*Boolean*/extraSlash = false) {
        var thus = this;
        super.onConstruct(extraSlash);
        this.setRequest();
        //this.request += this.extraSlash ? '/' : '';
        window.addEventListener('hashchange', function() {
            if(BUNS_IS_DEV) {
                Debugger.timeStart = Date.now();
            }
            thus.setRequest();
            thus.handle();
        }, true);
    }

    setRequest() {
        this.request = '' !== window.location.hash ? window.location.hash.replace('#', '') : '';
    }
}
