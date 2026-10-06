#!namespace Structure.Router;

class RewriteRouter extends Structure.Router.AbstractRouter {
    onConstruct() {
        this.request = '' !== window.location.pathname ? window.location.pathname.replace('/', '').split('/') : '';
    }
}
