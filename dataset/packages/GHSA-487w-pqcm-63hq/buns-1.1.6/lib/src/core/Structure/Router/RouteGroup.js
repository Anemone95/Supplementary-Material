#!namespace Structure.Router;

class RouteGroup extends Abstract.Core.AbstractCore {
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

            // if(!Environment.Tools.Tools.isEmpty(routes[i].route)) {
            //     for(j in routes[i].route) {
            //         if(this[i].pattern.match(new RegExp(':' + j)))
            //             this[i].matching.push(j);
            //         this[i].pattern = this[i].pattern.replace(':' + j, this[i].route[j]);
            //     }
            //     for(k in patterns) {
            //         if(this[i].pattern.match(new RegExp(':' + k)))
            //             this[i].matching.push(k);
            //         this[i].pattern = this[i].pattern.replace(':' + k, patterns[k]);
            //     }
            // } else {
            //     for(k in patterns) {
            //         if(this[i].pattern.match(new RegExp(':' + k)))
            //             this[i].matching.push(k);
            //         this[i].pattern = this[i].pattern.replace(':' + k, patterns[k]);
            //     }
            // }
            for(k in patterns) {
                // if(this[i].pattern.match(new RegExp(':' + k)))
                //     this[i].matching.push(k);
                this[i].matching.push(k);
                this[i].pattern = this[i].pattern.replace(':' + k, patterns[k]);
            }
        }
    }
}
