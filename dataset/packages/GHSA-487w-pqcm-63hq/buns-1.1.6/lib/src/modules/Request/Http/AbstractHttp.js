#!namespace Request.Http;
#!use Environment.Tools.Tools;

class AbstractHttp extends Abstract.Core.AbstractCore {
    onConstruct(/*Object*/settings) {
        var i;
        for(i in settings) {
            this[i] = settings[i];
        }
        this._request = new XMLHttpRequest();
    }

    set url(/*String*/url) {
        this._url = url;
    }

    set method(/*String*/method = 'get') {
        this._method = method;
    }

    set data(/*Object*/data = {}) {
        this._data = data;
    }

    set parseResponse(/*String*/parsing = 'text') {
        this._parseResponse = parsing;
    }

    set onSuccess(/*Function*/callback = null) {
        this._onSuccess = callback;
    }

    set onFailure(/*Function*/callback = null) {
        this._onFailure = callback;
    }

    set onTimeout(/*Function*/callback = null) {
        this._onTimeout = callback;
    }

    send() {
        var thus = this;
        this._request.open(this._method, this._url, true);
        if(this._onSuccess)
            this._request.onload = function(response) {
                thus._onSuccess.call(this, response.target.responseText, response.status, response);
            };
        if(this._onFailure)
            this._request.onerror = this._onFailure;
        if(this._onTimeout)
            this._request.ontimeout = this._onTimeout;
        this._request.send(Tools.parameters(this._data));
        return this;
    }
}
