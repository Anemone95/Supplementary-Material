#!namespace Structure.Router;

class AbsractRouteGroup extends Abstract.Core.AbstractCore {
    onConstruct(/*Array*/routes) {
        var i, j, k, patterns = {
            controller: '(?:[a-zA-Z0-9\_\-]+)',
            action: '(?:[a-zA-Z0-9\_]+)',
            params: '(?:.*)',
            empty: '^[0-9]?$'
        };

        for(i = 0; i < routes.length; ++i) {
            this[i] = routes[i];
            this[i].originalPattern = this[i].pattern;
            this[i].pattern = this[i].pattern.replace(/\//g, '\\/');
            this[i].matching = [];

            for(k in patterns) {
                this[i].matching.push(k);
                this[i].pattern = this[i].pattern.replace(':' + k, patterns[k]);
            }
        }
    }
}
