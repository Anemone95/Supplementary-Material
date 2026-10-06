#!namespace Structure.Router;

class ParamRouter extends Structure.Router.AbstractRouter {
    onConstruct() {

        // parameters = window.location.search.replace('?', '').split('&');
        // for(i = 0; i < parameters.length; ++i) {
        //     combi = parameters[i].split('=');
        //     if(combi[0] === settings.controllerKey)
        //         request[0] = combi[1];
        //     if(combi[0] === settings.actionKey)
        //         request[1] = combi[1];
        // }
    }
}
