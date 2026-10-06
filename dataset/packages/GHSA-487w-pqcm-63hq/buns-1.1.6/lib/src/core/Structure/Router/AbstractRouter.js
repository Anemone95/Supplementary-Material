#!namespace Structure.Router;
#!use Development.Debugger.Debugger, Environment.Tools.Tools, Development.Toolbar.Element;
#!use Development.Toolbar.Toolbar, Structure.Event.Listener;

class AbstractRouter extends Abstract.Core.AbstractCore {
    onConstruct(/*Boolean*/extraSlash = false) {
        this.extraSlash = extraSlash;
        this.routes = new Structure.Router.RouteGroup([
            {
                pattern: ':controller/:action/:params',
                route: {}
            },
            {
                pattern: ':controller/:action',
                route: {}
            },
            {
                pattern: ':controller',
                route: {}
            },
            {
                pattern: ':empty',
                route: {
                    controller: 'default',
                    action: 'main'
                }
            }
        ]);
    }

    dispatch(/*String*/controllerName, /*String*/action, /*Array*/params = []) {
        var controller = new Structure.Controller[Tools.toController(controllerName)](),
            actionName = action + 'Action';
        controller.beforeDispatch();
        if(controller.onCall(actionName, params)) {
            if(Tools.isSet(controller[actionName]))
                controller[actionName].apply(controller, params);
            else
                this.dispatch('error', 'notFound');
        }
        controller.afterDispatch();
    }

    clearRoutes() {
        this.routes = [];
    }

    addRoute(/*Object*/route, /*Boolean*/prepend = false) {
        if(!prepend) {
            this.routes.push(route);
        } else {
            this.routes.unshift(route);
        }

    }

    addRoutes(/*RouteGroup*/routeGroup, /*Boolean*/prepend = false) {
        var i, j, temp = {}, length = 0;
        if(!prepend) {
            length = Tools.size(this.routes);
            for(i in routeGroup)
                this.routes[length + parseInt(i)] = routeGroup[i];
        } else {
            length = Tools.size(routeGroup);
            for(i in routeGroup)
                temp[i] = routeGroup[i];
            for(j in this.routes)
                temp[length + parseInt(j)] = this.routes[j];
            this.routes = temp;
        }
    }

    beforeHandle() {}

    afterHandle() {}

    handle() {
        var i, j, actionName, controllerName, match, request = [], paramsIndex, splitted, controller;
        this.beforeHandle();
        //Listener.trigger(this.constructor.name, 'before:handle', this.constructor);
        if(BUNS_IS_DEV) {
            Debugger.timeStart = Date.now();
        }
//console.log('Request', this.request);

        for(i in this.routes) {
            match = this.request.match(new RegExp('(' + this.routes[i].pattern + ')' + (this.extraSlash ? '\\/?' : '')));
            console.log('(' + this.routes[i].pattern + ')' + (this.extraSlash ? '\\/?' : ''));
            if(null !== match)
                break;
        }

//console.log('Match', match);
//console.log('RouteGroup', this.routes);


        if(null !== match) {
            paramsIndex = this.routes[i].matching.indexOf('params');
            if(this.extraSlash) {
                match[0] = match[0].replace(/\/$/, '');
            }
            console.log(match[0]);
            request = -1 !== paramsIndex ? match[0].split('/', paramsIndex + 1) : match[0].split('/');

            splitted = match[0].split('/');
            this.controller = this.routes[i].route.controller || request[this.routes[i].matching.indexOf('controller')];

//console.log(request);
//console.log(this.routes[i].matching.indexOf('action'));
            this.action = (this.routes[i].route.action || request[this.routes[i].matching.indexOf('action')] || 'main').toLowerCase();
            this.params = [];
            if(-1 !== paramsIndex) {
                for(j = 0; j < splitted.length; ++j) {
                    if(j >= paramsIndex) {
                        if(this.extraSlash && !Tools.isEmpty(splitted[j]))
                            this.params.push(splitted[j]);
                    }
                }
            }

        } else {
            this.params = [this.controller, this.action];
            this.controller = 'error';
            this.action = 'notFound';
        }


        if(BUNS_IS_DEV) {

            //Buns.debugger.file = splitPathname.controller + '.js';
        }
        controllerName = Tools.toController(this.controller);
        if(Tools.isSet(Structure.Controller[controllerName])) {
            this.dispatch(this.controller, this.action, this.params);
        } else if(BUNS_IS_DEV){
            throw new Error('Controller "' + controllerName + '" was not found. Be sure to namespace it with "Structure.Controller".');
        }

        if(BUNS_IS_DEV) {
            // Listener.trigger(this.constructor.name, 'after:handle', this.constructor, [
            //     Date.now() - Debugger.timeStart, Debugger.timeStart
            // ]);

            Toolbar.refresh(
                'time',
                Date.now() - Debugger.timeStart,
                'Loading time: ' + (BUNS_LOADED - BUNS_START) + 'ms<br>' +
                'Action time: ' + (Date.now() - Debugger.timeStart) + 'ms'
            );
            Toolbar.refresh(
                'controller',
                controllerName + '.' + this.action + 'Action',
                'Router: ' + this.constructor.name + '<br>' +
                'Controller: ' + controllerName + '.' + this.action + 'Action<br>' +
                'Pattern: ' + this.routes[i].pattern + '<br>' +
                'Expression: ' + this.routes[i].originalPattern
            );

        }

        this.afterHandle();
    }

}
