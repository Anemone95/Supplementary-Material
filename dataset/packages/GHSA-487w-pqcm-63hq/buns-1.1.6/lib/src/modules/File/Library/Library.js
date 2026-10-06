#!namespace File.Library;
#!use Environment.Tools.Tools;

class Library extends Abstract.Core.AbstractCore {
    static init() {
        if(!this._items)
            this._items = [];
        if(!this._calls)//Used to lock and prevent multiple AJAX request
            this._calls = [];
        if(!this._promises)
            this._promises = [];
    }

    static register(/*String*/name, /*String*/url, /*String*/group = '') {
        this.init();
        var match = false;

        this._items.forEach(function(val) {
            if(val.url === url || val.name === name)
                return false;
        });
        this._items.push({
            name: name,
            url: url,
            group: group
        });
        this._calls[name] = 0;
        return true;
    }

    static import(/*String*/name) {
        var promise, item, thus = this;
        this.init();
        if(0 === this._calls[name]) {
            item = this._items.filter(function(val) {
                return val.name === name;
            })[0];
            this._calls[name] = 1;
            promise = new Promise(function(resolve, reject) {
                var request = new Request.Http.Http({
                    method: 'get',
                    url: item.url,
                    onSuccess: function(data) {
                        resolve({
                            name: name,
                            content: data
                        });
                    },
                    onTimeout: function() {
                        reject();
                    },
                    onFailure: function() {
                        reject();
                    }
                });
                request.send();
            });
            promise.name = name;
        }
        return promise;
    }

    static importGroup(/*String*/group) {
        var thus = this, promises = [];
        this.init();
        this._items.filter(function(val) {
            return val.group === group;
        }).forEach(function(val) {
            promises.push(thus.import(val.name));
        });
        return promises;
    }

    static exec(/*String*/name, /*Function*/callback = null) {
        var thus = this;
        this.init();
        if(!this._calls[name]) {
            var promise = this.import(name);
            if(promise) {
                promise.then(function(val) {
                    eval.call(window, val.content);
                    thus._calls[name] = 2;
                    if(callback)
                        callback();
                });
            }
        } else {
            console.log('Error, script with name "' + name + '" has already been imported.');
            //throw new Error();
        }

    }

    static execGroup(/*String*/name, /*Function*/callback = null) {
        var i, thus = this;
        this.init();
        Promise.all(this.importGroup(name)).then(function(vals) {
            for(i = 0; i < vals.length; ++i) {
                if(2 === thus._calls[vals[i].name]) {
                    console.log('Error, script with name "' + vals[i].name + '" has already been imported.');
                    //throw new Error();
                } else {
                    eval.call(window, vals[i].content);
                    thus._calls[name] = 2;
                }
            }
            if(callback)
                callback();
        });
    }
}
