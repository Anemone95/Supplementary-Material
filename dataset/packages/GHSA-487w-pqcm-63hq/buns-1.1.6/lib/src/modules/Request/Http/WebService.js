#!namespace Request.Http;
#!use Environment.Tools.Tools;

class WebService extends Request.Http.AbstractHttp {
    onConstruct(/*String*/url, /*String*/method = 'get') {
        this._baseUrl = url;
        super.onConstruct({
            url: url,
            method: method
        });

    }

    query(/*String*/query, /*Function*/onSuccess, /*Object*/data = null, /*Function*/onError = null) {
        this._url = this._baseUrl + query;
        this._onSuccess = onSuccess;
        this._data = data;
        if(Tools.isSet(onError)) {
            this._onError = onError;
        }
        this.send();
        this._url = this._baseUrl;
        return this;
    }
}
