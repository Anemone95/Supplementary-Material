"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _url = _interopRequireDefault(require("url"));

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _Terms = require("./Terms");

var _MatrixClientPeg = require("./MatrixClientPeg");

var _browserRequest = _interopRequireDefault(require("browser-request"));

var _SdkConfig = _interopRequireDefault(require("./SdkConfig"));

var _serviceTypes = require("matrix-js-sdk/src/service-types");

/*
Copyright 2016, 2019, 2021 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
// The version of the integration manager API we're intending to work with
const imApiVersion = "1.1"; // TODO: Generify the name of this class and all components within - it's not just for Scalar.

class ScalarAuthClient {
  constructor(apiUrl
  /*: string*/
  , uiUrl
  /*: string*/
  ) {
    this.apiUrl
    /*:: */
    = apiUrl
    /*:: */
    ;
    this.uiUrl
    /*:: */
    = uiUrl
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "scalarToken", void 0);
    (0, _defineProperty2.default)(this, "termsInteractionCallback", void 0);
    (0, _defineProperty2.default)(this, "isDefaultManager", void 0);
    this.scalarToken = null; // `undefined` to allow `startTermsFlow` to fallback to a default
    // callback if this is unset.

    this.termsInteractionCallback = undefined; // We try and store the token on a per-manager basis, but need a fallback
    // for the default manager.

    const configApiUrl = _SdkConfig.default.get()['integrations_rest_url'];

    const configUiUrl = _SdkConfig.default.get()['integrations_ui_url'];

    this.isDefaultManager = apiUrl === configApiUrl && configUiUrl === uiUrl;
  }

  writeTokenToStore() {
    window.localStorage.setItem("mx_scalar_token_at_" + this.apiUrl, this.scalarToken);

    if (this.isDefaultManager) {
      // We remove the old token from storage to migrate upwards. This is safe
      // to do because even if the user switches to /app when this is on /develop
      // they'll at worst register for a new token.
      window.localStorage.removeItem("mx_scalar_token"); // no-op when not present
    }
  }

  readTokenFromStore()
  /*: string*/
  {
    let token = window.localStorage.getItem("mx_scalar_token_at_" + this.apiUrl);

    if (!token && this.isDefaultManager) {
      token = window.localStorage.getItem("mx_scalar_token");
    }

    return token;
  }

  readToken()
  /*: string*/
  {
    if (this.scalarToken) return this.scalarToken;
    return this.readTokenFromStore();
  }

  setTermsInteractionCallback(callback) {
    this.termsInteractionCallback = callback;
  }

  connect()
  /*: Promise<void>*/
  {
    return this.getScalarToken().then(tok => {
      this.scalarToken = tok;
    });
  }

  hasCredentials()
  /*: boolean*/
  {
    return this.scalarToken != null; // undef or null
  } // Returns a promise that resolves to a scalar_token string


  getScalarToken()
  /*: Promise<string>*/
  {
    const token = this.readToken();

    if (!token) {
      return this.registerForToken();
    } else {
      return this.checkToken(token).catch(e => {
        if (e instanceof _Terms.TermsNotSignedError) {
          // retrying won't help this
          throw e;
        }

        return this.registerForToken();
      });
    }
  }

  getAccountName(token
  /*: string*/
  )
  /*: Promise<string>*/
  {
    const url = this.apiUrl + "/account";
    return new Promise(function (resolve, reject) {
      (0, _browserRequest.default)({
        method: "GET",
        uri: url,
        qs: {
          scalar_token: token,
          v: imApiVersion
        },
        json: true
      }, (err, response, body) => {
        if (err) {
          reject(err);
        } else if (body && body.errcode === 'M_TERMS_NOT_SIGNED') {
          reject(new _Terms.TermsNotSignedError());
        } else if (response.statusCode / 100 !== 2) {
          reject(body);
        } else if (!body || !body.user_id) {
          reject(new Error("Missing user_id in response"));
        } else {
          resolve(body.user_id);
        }
      });
    });
  }

  checkToken(token
  /*: string*/
  )
  /*: Promise<string>*/
  {
    return this.getAccountName(token).then(userId => {
      const me = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

      if (userId !== me) {
        throw new Error("Scalar token is owned by someone else: " + me);
      }

      return token;
    }).catch(e => {
      if (e instanceof _Terms.TermsNotSignedError) {
        console.log("Integration manager requires new terms to be agreed to"); // The terms endpoints are new and so live on standard _matrix prefixes,
        // but IM rest urls are currently configured with paths, so remove the
        // path from the base URL before passing it to the js-sdk
        // We continue to use the full URL for the calls done by
        // matrix-react-sdk, but the standard terms API called
        // by the js-sdk lives on the standard _matrix path. This means we
        // don't support running IMs on a non-root path, but it's the only
        // realistic way of transitioning to _matrix paths since configs in
        // the wild contain bits of the API path.
        // Once we've fully transitioned to _matrix URLs, we can give people
        // a grace period to update their configs, then use the rest url as
        // a regular base url.

        const parsedImRestUrl = _url.default.parse(this.apiUrl);

        parsedImRestUrl.path = '';
        parsedImRestUrl.pathname = '';
        return (0, _Terms.startTermsFlow)([new _Terms.Service(_serviceTypes.SERVICE_TYPES.IM, _url.default.format(parsedImRestUrl), token)], this.termsInteractionCallback).then(() => {
          return token;
        });
      } else {
        throw e;
      }
    });
  }

  registerForToken()
  /*: Promise<string>*/
  {
    // Get openid bearer token from the HS as the first part of our dance
    return _MatrixClientPeg.MatrixClientPeg.get().getOpenIdToken().then(tokenObject => {
      // Now we can send that to scalar and exchange it for a scalar token
      return this.exchangeForScalarToken(tokenObject);
    }).then(token => {
      // Validate it (this mostly checks to see if the IM needs us to agree to some terms)
      return this.checkToken(token);
    }).then(token => {
      this.scalarToken = token;
      this.writeTokenToStore();
      return token;
    });
  }

  exchangeForScalarToken(openidTokenObject
  /*: any*/
  )
  /*: Promise<string>*/
  {
    const scalarRestUrl = this.apiUrl;
    return new Promise(function (resolve, reject) {
      (0, _browserRequest.default)({
        method: 'POST',
        uri: scalarRestUrl + '/register',
        qs: {
          v: imApiVersion
        },
        body: openidTokenObject,
        json: true
      }, (err, response, body) => {
        if (err) {
          reject(err);
        } else if (response.statusCode / 100 !== 2) {
          reject(new Error(`Scalar request failed: ${response.statusCode}`));
        } else if (!body || !body.scalar_token) {
          reject(new Error("Missing scalar_token in response"));
        } else {
          resolve(body.scalar_token);
        }
      });
    });
  }

  getScalarPageTitle(url
  /*: string*/
  )
  /*: Promise<string>*/
  {
    let scalarPageLookupUrl = this.apiUrl + '/widgets/title_lookup';
    scalarPageLookupUrl = this.getStarterLink(scalarPageLookupUrl);
    scalarPageLookupUrl += '&curl=' + encodeURIComponent(url);
    return new Promise(function (resolve, reject) {
      (0, _browserRequest.default)({
        method: 'GET',
        uri: scalarPageLookupUrl,
        json: true
      }, (err, response, body) => {
        if (err) {
          reject(err);
        } else if (response.statusCode / 100 !== 2) {
          reject(new Error(`Scalar request failed: ${response.statusCode}`));
        } else if (!body) {
          reject(new Error("Missing page title in response"));
        } else {
          let title = "";

          if (body.page_title_cache_item && body.page_title_cache_item.cached_title) {
            title = body.page_title_cache_item.cached_title;
          }

          resolve(title);
        }
      });
    });
  }
  /**
   * Mark all assets associated with the specified widget as "disabled" in the
   * integration manager database.
   * This can be useful to temporarily prevent purchased assets from being displayed.
   * @param  {WidgetType} widgetType The Widget Type to disable assets for
   * @param  {string} widgetId   The widget ID to disable assets for
   * @return {Promise}           Resolves on completion
   */


  disableWidgetAssets(widgetType
  /*: WidgetType*/
  , widgetId
  /*: string*/
  )
  /*: Promise<void>*/
  {
    let url = this.apiUrl + '/widgets/set_assets_state';
    url = this.getStarterLink(url);
    return new Promise((resolve, reject) => {
      (0, _browserRequest.default)({
        method: 'GET',
        // XXX: Actions shouldn't be GET requests
        uri: url,
        json: true,
        qs: {
          'widget_type': widgetType.preferred,
          'widget_id': widgetId,
          'state': 'disable'
        }
      }, (err, response, body) => {
        if (err) {
          reject(err);
        } else if (response.statusCode / 100 !== 2) {
          reject(new Error(`Scalar request failed: ${response.statusCode}`));
        } else if (!body) {
          reject(new Error("Failed to set widget assets state"));
        } else {
          resolve();
        }
      });
    });
  }

  getScalarInterfaceUrlForRoom(room
  /*: Room*/
  , screen
  /*: string*/
  , id
  /*: string*/
  )
  /*: string*/
  {
    const roomId = room.roomId;
    const roomName = room.name;
    let url = this.uiUrl;
    url += "?scalar_token=" + encodeURIComponent(this.scalarToken);
    url += "&room_id=" + encodeURIComponent(roomId);
    url += "&room_name=" + encodeURIComponent(roomName);
    url += "&theme=" + encodeURIComponent(_SettingsStore.default.getValue("theme"));

    if (id) {
      url += '&integ_id=' + encodeURIComponent(id);
    }

    if (screen) {
      url += '&screen=' + encodeURIComponent(screen);
    }

    return url;
  }

  getStarterLink(starterLinkUrl
  /*: string*/
  )
  /*: string*/
  {
    return starterLinkUrl + "?scalar_token=" + encodeURIComponent(this.scalarToken);
  }

}

exports.default = ScalarAuthClient;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TY2FsYXJBdXRoQ2xpZW50LnRzIl0sIm5hbWVzIjpbImltQXBpVmVyc2lvbiIsIlNjYWxhckF1dGhDbGllbnQiLCJjb25zdHJ1Y3RvciIsImFwaVVybCIsInVpVXJsIiwic2NhbGFyVG9rZW4iLCJ0ZXJtc0ludGVyYWN0aW9uQ2FsbGJhY2siLCJ1bmRlZmluZWQiLCJjb25maWdBcGlVcmwiLCJTZGtDb25maWciLCJnZXQiLCJjb25maWdVaVVybCIsImlzRGVmYXVsdE1hbmFnZXIiLCJ3cml0ZVRva2VuVG9TdG9yZSIsIndpbmRvdyIsImxvY2FsU3RvcmFnZSIsInNldEl0ZW0iLCJyZW1vdmVJdGVtIiwicmVhZFRva2VuRnJvbVN0b3JlIiwidG9rZW4iLCJnZXRJdGVtIiwicmVhZFRva2VuIiwic2V0VGVybXNJbnRlcmFjdGlvbkNhbGxiYWNrIiwiY2FsbGJhY2siLCJjb25uZWN0IiwiZ2V0U2NhbGFyVG9rZW4iLCJ0aGVuIiwidG9rIiwiaGFzQ3JlZGVudGlhbHMiLCJyZWdpc3RlckZvclRva2VuIiwiY2hlY2tUb2tlbiIsImNhdGNoIiwiZSIsIlRlcm1zTm90U2lnbmVkRXJyb3IiLCJnZXRBY2NvdW50TmFtZSIsInVybCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwibWV0aG9kIiwidXJpIiwicXMiLCJzY2FsYXJfdG9rZW4iLCJ2IiwianNvbiIsImVyciIsInJlc3BvbnNlIiwiYm9keSIsImVycmNvZGUiLCJzdGF0dXNDb2RlIiwidXNlcl9pZCIsIkVycm9yIiwidXNlcklkIiwibWUiLCJNYXRyaXhDbGllbnRQZWciLCJnZXRVc2VySWQiLCJjb25zb2xlIiwibG9nIiwicGFyc2VkSW1SZXN0VXJsIiwicGFyc2UiLCJwYXRoIiwicGF0aG5hbWUiLCJTZXJ2aWNlIiwiU0VSVklDRV9UWVBFUyIsIklNIiwiZm9ybWF0IiwiZ2V0T3BlbklkVG9rZW4iLCJ0b2tlbk9iamVjdCIsImV4Y2hhbmdlRm9yU2NhbGFyVG9rZW4iLCJvcGVuaWRUb2tlbk9iamVjdCIsInNjYWxhclJlc3RVcmwiLCJnZXRTY2FsYXJQYWdlVGl0bGUiLCJzY2FsYXJQYWdlTG9va3VwVXJsIiwiZ2V0U3RhcnRlckxpbmsiLCJlbmNvZGVVUklDb21wb25lbnQiLCJ0aXRsZSIsInBhZ2VfdGl0bGVfY2FjaGVfaXRlbSIsImNhY2hlZF90aXRsZSIsImRpc2FibGVXaWRnZXRBc3NldHMiLCJ3aWRnZXRUeXBlIiwid2lkZ2V0SWQiLCJwcmVmZXJyZWQiLCJnZXRTY2FsYXJJbnRlcmZhY2VVcmxGb3JSb29tIiwicm9vbSIsInNjcmVlbiIsImlkIiwicm9vbUlkIiwicm9vbU5hbWUiLCJuYW1lIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwic3RhcnRlckxpbmtVcmwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUVBOztBQXhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFhQTtBQUNBLE1BQU1BLFlBQVksR0FBRyxLQUFyQixDLENBRUE7O0FBRWUsTUFBTUMsZ0JBQU4sQ0FBdUI7QUFLbENDLEVBQUFBLFdBQVcsQ0FBU0M7QUFBVDtBQUFBLElBQWlDQztBQUFqQztBQUFBLElBQWdEO0FBQUEsU0FBdkNEO0FBQXVDO0FBQUEsTUFBdkNBO0FBQXVDO0FBQUE7QUFBQSxTQUFmQztBQUFlO0FBQUEsTUFBZkE7QUFBZTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ3ZELFNBQUtDLFdBQUwsR0FBbUIsSUFBbkIsQ0FEdUQsQ0FFdkQ7QUFDQTs7QUFDQSxTQUFLQyx3QkFBTCxHQUFnQ0MsU0FBaEMsQ0FKdUQsQ0FNdkQ7QUFDQTs7QUFDQSxVQUFNQyxZQUFZLEdBQUdDLG1CQUFVQyxHQUFWLEdBQWdCLHVCQUFoQixDQUFyQjs7QUFDQSxVQUFNQyxXQUFXLEdBQUdGLG1CQUFVQyxHQUFWLEdBQWdCLHFCQUFoQixDQUFwQjs7QUFD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SUFBQUEsR0FBRyxJQUFJLGdCQUFnQnVDLGtCQUFrQixDQUFDYSxRQUFELENBQXpDO0FBQ0FwRCxJQUFBQSxHQUFHLElBQUksWUFBWXVDLGtCQUFrQixDQUFDZSx1QkFBY0MsUUFBZCxDQUF1QixPQUF2QixDQUFELENBQXJDOztBQUNBLFFBQUlMLEVBQUosRUFBUTtBQUNKbEQsTUFBQUEsR0FBRyxJQUFJLGVBQWV1QyxrQkFBa0IsQ0FBQ1csRUFBRCxDQUF4QztBQUNIOztBQUNELFFBQUlELE1BQUosRUFBWTtBQUNSakQsTUFBQUEsR0FBRyxJQUFJLGFBQWF1QyxrQkFBa0IsQ0FBQ1UsTUFBRCxDQUF0QztBQUNIOztBQUNELFdBQU9qRCxHQUFQO0FBQ0g7O0FBRURzQyxFQUFBQSxjQUFjLENBQUNrQjtBQUFEO0FBQUE7QUFBQTtBQUFpQztBQUMzQyxXQUFPQSxjQUFjLEdBQUcsZ0JBQWpCLEdBQW9DakIsa0JBQWtCLENBQUMsS0FBS3JFLFdBQU4sQ0FBN0Q7QUFDSDs7QUFsUWlDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2LCAyMDE5LCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgU2VydmljZSwgc3RhcnRUZXJtc0Zsb3csIFRlcm1zSW50ZXJhY3Rpb25DYWxsYmFjaywgVGVybXNOb3RTaWduZWRFcnJvciB9IGZyb20gJy4vVGVybXMnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHJlcXVlc3QgZnJvbSBcImJyb3dzZXItcmVxdWVzdFwiO1xuXG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IHtXaWRnZXRUeXBlfSBmcm9tIFwiLi93aWRnZXRzL1dpZGdldFR5cGVcIjtcbmltcG9ydCB7U0VSVklDRV9UWVBFU30gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3NlcnZpY2UtdHlwZXNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuLy8gVGhlIHZlcnNpb24gb2YgdGhlIGludGVncmF0aW9uIG1hbmFnZXIgQVBJIHdlJ3JlIGludGVuZGluZyB0byB3b3JrIHdpdGhcbmNvbnN0IGltQXBpVmVyc2lvbiA9IFwiMS4xXCI7XG5cbi8vIFRPRE86IEdlbmVyaWZ5IHRoZSBuYW1lIG9mIHRoaXMgY2xhc3MgYW5kIGFsbCBjb21wb25lbnRzIHdpdGhpbiAtIGl0J3Mgbm90IGp1c3QgZm9yIFNjYWxhci5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NhbGFyQXV0aENsaWVudCB7XG4gICAgcHJpdmF0ZSBzY2FsYXJUb2tlbjogc3RyaW5nO1xuICAgIHByaXZhdGUgdGVybXNJbnRlcmFjdGlvbkNhbGxiYWNrOiBUZXJtc0ludGVyYWN0aW9uQ2FsbGJhY2s7XG4gICAgcHJpdmF0ZSBpc0RlZmF1bHRNYW5hZ2VyOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBhcGlVcmw6IHN0cmluZywgcHJpdmF0ZSB1aVVybDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2NhbGFyVG9rZW4gPSBudWxsO1xuICAgICAgICAvLyBgdW5kZWZpbmVkYCB0byBhbGxvdyBgc3RhcnRUZXJtc0Zsb3dgIHRvIGZhbGxiYWNrIHRvIGEgZGVmYXVsdFxuICAgICAgICAvLyBjYWxsYmFjayBpZiB0aGlzIGlzIHVuc2V0LlxuICAgICAgICB0aGlzLnRlcm1zSW50ZXJhY3Rpb25DYWxsYmFjayA9IHVuZGVmaW5lZDtcblxuICAgICAgICAvLyBXZSB0cnkgYW5kIHN0b3JlIHRoZSB0b2tlbiBvbiBhIHBlci1tYW5hZ2VyIGJhc2lzLCBidXQgbmVlZCBhIGZhbGxiYWNrXG4gICAgICAgIC8vIGZvciB0aGUgZGVmYXVsdCBtYW5hZ2VyLlxuICAgICAgICBjb25zdCBjb25maWdBcGlVcmwgPSBTZGtDb25maWcuZ2V0KClbJ2ludGVncmF0aW9uc19yZXN0X3VybCddO1xuICAgICAgICBjb25zdCBjb25maWdVaVVybCA9IFNka0NvbmZpZy5nZXQoKVsnaW50ZWdyYXRpb25zX3VpX3VybCddO1xuICAgICAgICB0aGlzLmlzRGVmYXVsdE1hbmFnZXIgPSBhcGlVcmwgPT09IGNvbmZpZ0FwaVVybCAmJiBjb25maWdVaVVybCA9PT0gdWlVcmw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB3cml0ZVRva2VuVG9TdG9yZSgpIHtcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibXhfc2NhbGFyX3Rva2VuX2F0X1wiICsgdGhpcy5hcGlVcmwsIHRoaXMuc2NhbGFyVG9rZW4pO1xuICAgICAgICBpZiAodGhpcy5pc0RlZmF1bHRNYW5hZ2VyKSB7XG4gICAgICAgICAgICAvLyBXZSByZW1vdmUgdGhlIG9sZCB0b2tlbiBmcm9tIHN0b3JhZ2UgdG8gbWlncmF0ZSB1cHdhcmRzLiBUaGlzIGlzIHNhZmVcbiAgICAgICAgICAgIC8vIHRvIGRvIGJlY2F1c2UgZXZlbiBpZiB0aGUgdXNlciBzd2l0Y2hlcyB0byAvYXBwIHdoZW4gdGhpcyBpcyBvbiAvZGV2ZWxvcFxuICAgICAgICAgICAgLy8gdGhleSdsbCBhdCB3b3JzdCByZWdpc3RlciBmb3IgYSBuZXcgdG9rZW4uXG4gICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJteF9zY2FsYXJfdG9rZW5cIik7IC8vIG5vLW9wIHdoZW4gbm90IHByZXNlbnRcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVhZFRva2VuRnJvbVN0b3JlKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCB0b2tlbiA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm14X3NjYWxhcl90b2tlbl9hdF9cIiArIHRoaXMuYXBpVXJsKTtcbiAgICAgICAgaWYgKCF0b2tlbiAmJiB0aGlzLmlzRGVmYXVsdE1hbmFnZXIpIHtcbiAgICAgICAgICAgIHRva2VuID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibXhfc2NhbGFyX3Rva2VuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlYWRUb2tlbigpOiBzdHJpbmcge1xuICAgICAgICBpZiAodGhpcy5zY2FsYXJUb2tlbikgcmV0dXJuIHRoaXMuc2NhbGFyVG9rZW47XG4gICAgICAgIHJldHVybiB0aGlzLnJlYWRUb2tlbkZyb21TdG9yZSgpO1xuICAgIH1cblxuICAgIHNldFRlcm1zSW50ZXJhY3Rpb25DYWxsYmFjayhjYWxsYmFjaykge1xuICAgICAgICB0aGlzLnRlcm1zSW50ZXJhY3Rpb25DYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cblxuICAgIGNvbm5lY3QoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFNjYWxhclRva2VuKCkudGhlbigodG9rKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNjYWxhclRva2VuID0gdG9rO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBoYXNDcmVkZW50aWFscygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NhbGFyVG9rZW4gIT0gbnVsbDsgLy8gdW5kZWYgb3IgbnVsbFxuICAgIH1cblxuICAgIC8vIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBzY2FsYXJfdG9rZW4gc3RyaW5nXG4gICAgZ2V0U2NhbGFyVG9rZW4oKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSB0aGlzLnJlYWRUb2tlbigpO1xuXG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyRm9yVG9rZW4oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrVG9rZW4odG9rZW4pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBUZXJtc05vdFNpZ25lZEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldHJ5aW5nIHdvbid0IGhlbHAgdGhpc1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZWdpc3RlckZvclRva2VuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0QWNjb3VudE5hbWUodG9rZW46IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IHVybCA9IHRoaXMuYXBpVXJsICsgXCIvYWNjb3VudFwiO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgICAgICAgICB1cmk6IHVybCxcbiAgICAgICAgICAgICAgICBxczoge3NjYWxhcl90b2tlbjogdG9rZW4sIHY6IGltQXBpVmVyc2lvbn0sXG4gICAgICAgICAgICAgICAganNvbjogdHJ1ZSxcbiAgICAgICAgICAgIH0sIChlcnIsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJvZHkgJiYgYm9keS5lcnJjb2RlID09PSAnTV9URVJNU19OT1RfU0lHTkVEJykge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IFRlcm1zTm90U2lnbmVkRXJyb3IoKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlIC8gMTAwICE9PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChib2R5KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFib2R5IHx8ICFib2R5LnVzZXJfaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIk1pc3NpbmcgdXNlcl9pZCBpbiByZXNwb25zZVwiKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShib2R5LnVzZXJfaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrVG9rZW4odG9rZW46IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEFjY291bnROYW1lKHRva2VuKS50aGVuKHVzZXJJZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKTtcbiAgICAgICAgICAgIGlmICh1c2VySWQgIT09IG1lKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NhbGFyIHRva2VuIGlzIG93bmVkIGJ5IHNvbWVvbmUgZWxzZTogXCIgKyBtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIFRlcm1zTm90U2lnbmVkRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkludGVncmF0aW9uIG1hbmFnZXIgcmVxdWlyZXMgbmV3IHRlcm1zIHRvIGJlIGFncmVlZCB0b1wiKTtcbiAgICAgICAgICAgICAgICAvLyBUaGUgdGVybXMgZW5kcG9pbnRzIGFyZSBuZXcgYW5kIHNvIGxpdmUgb24gc3RhbmRhcmQgX21hdHJpeCBwcmVmaXhlcyxcbiAgICAgICAgICAgICAgICAvLyBidXQgSU0gcmVzdCB1cmxzIGFyZSBjdXJyZW50bHkgY29uZmlndXJlZCB3aXRoIHBhdGhzLCBzbyByZW1vdmUgdGhlXG4gICAgICAgICAgICAgICAgLy8gcGF0aCBmcm9tIHRoZSBiYXNlIFVSTCBiZWZvcmUgcGFzc2luZyBpdCB0byB0aGUganMtc2RrXG5cbiAgICAgICAgICAgICAgICAvLyBXZSBjb250aW51ZSB0byB1c2UgdGhlIGZ1bGwgVVJMIGZvciB0aGUgY2FsbHMgZG9uZSBieVxuICAgICAgICAgICAgICAgIC8vIG1hdHJpeC1yZWFjdC1zZGssIGJ1dCB0aGUgc3RhbmRhcmQgdGVybXMgQVBJIGNhbGxlZFxuICAgICAgICAgICAgICAgIC8vIGJ5IHRoZSBqcy1zZGsgbGl2ZXMgb24gdGhlIHN0YW5kYXJkIF9tYXRyaXggcGF0aC4gVGhpcyBtZWFucyB3ZVxuICAgICAgICAgICAgICAgIC8vIGRvbid0IHN1cHBvcnQgcnVubmluZyBJTXMgb24gYSBub24tcm9vdCBwYXRoLCBidXQgaXQncyB0aGUgb25seVxuICAgICAgICAgICAgICAgIC8vIHJlYWxpc3RpYyB3YXkgb2YgdHJhbnNpdGlvbmluZyB0byBfbWF0cml4IHBhdGhzIHNpbmNlIGNvbmZpZ3MgaW5cbiAgICAgICAgICAgICAgICAvLyB0aGUgd2lsZCBjb250YWluIGJpdHMgb2YgdGhlIEFQSSBwYXRoLlxuXG4gICAgICAgICAgICAgICAgLy8gT25jZSB3ZSd2ZSBmdWxseSB0cmFuc2l0aW9uZWQgdG8gX21hdHJpeCBVUkxzLCB3ZSBjYW4gZ2l2ZSBwZW9wbGVcbiAgICAgICAgICAgICAgICAvLyBhIGdyYWNlIHBlcmlvZCB0byB1cGRhdGUgdGhlaXIgY29uZmlncywgdGhlbiB1c2UgdGhlIHJlc3QgdXJsIGFzXG4gICAgICAgICAgICAgICAgLy8gYSByZWd1bGFyIGJhc2UgdXJsLlxuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZEltUmVzdFVybCA9IHVybC5wYXJzZSh0aGlzLmFwaVVybCk7XG4gICAgICAgICAgICAgICAgcGFyc2VkSW1SZXN0VXJsLnBhdGggPSAnJztcbiAgICAgICAgICAgICAgICBwYXJzZWRJbVJlc3RVcmwucGF0aG5hbWUgPSAnJztcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhcnRUZXJtc0Zsb3coW25ldyBTZXJ2aWNlKFxuICAgICAgICAgICAgICAgICAgICBTRVJWSUNFX1RZUEVTLklNLFxuICAgICAgICAgICAgICAgICAgICB1cmwuZm9ybWF0KHBhcnNlZEltUmVzdFVybCksXG4gICAgICAgICAgICAgICAgICAgIHRva2VuLFxuICAgICAgICAgICAgICAgICldLCB0aGlzLnRlcm1zSW50ZXJhY3Rpb25DYWxsYmFjaykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJGb3JUb2tlbigpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICAvLyBHZXQgb3BlbmlkIGJlYXJlciB0b2tlbiBmcm9tIHRoZSBIUyBhcyB0aGUgZmlyc3QgcGFydCBvZiBvdXIgZGFuY2VcbiAgICAgICAgcmV0dXJuIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRPcGVuSWRUb2tlbigpLnRoZW4oKHRva2VuT2JqZWN0KSA9PiB7XG4gICAgICAgICAgICAvLyBOb3cgd2UgY2FuIHNlbmQgdGhhdCB0byBzY2FsYXIgYW5kIGV4Y2hhbmdlIGl0IGZvciBhIHNjYWxhciB0b2tlblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhjaGFuZ2VGb3JTY2FsYXJUb2tlbih0b2tlbk9iamVjdCk7XG4gICAgICAgIH0pLnRoZW4oKHRva2VuKSA9PiB7XG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSBpdCAodGhpcyBtb3N0bHkgY2hlY2tzIHRvIHNlZSBpZiB0aGUgSU0gbmVlZHMgdXMgdG8gYWdyZWUgdG8gc29tZSB0ZXJtcylcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrVG9rZW4odG9rZW4pO1xuICAgICAgICB9KS50aGVuKCh0b2tlbikgPT4ge1xuICAgICAgICAgICAgdGhpcy5zY2FsYXJUb2tlbiA9IHRva2VuO1xuICAgICAgICAgICAgdGhpcy53cml0ZVRva2VuVG9TdG9yZSgpO1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBleGNoYW5nZUZvclNjYWxhclRva2VuKG9wZW5pZFRva2VuT2JqZWN0OiBhbnkpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBjb25zdCBzY2FsYXJSZXN0VXJsID0gdGhpcy5hcGlVcmw7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgcmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgdXJpOiBzY2FsYXJSZXN0VXJsICsgJy9yZWdpc3RlcicsXG4gICAgICAgICAgICAgICAgcXM6IHt2OiBpbUFwaVZlcnNpb259LFxuICAgICAgICAgICAgICAgIGJvZHk6IG9wZW5pZFRva2VuT2JqZWN0LFxuICAgICAgICAgICAgICAgIGpzb246IHRydWUsXG4gICAgICAgICAgICB9LCAoZXJyLCByZXNwb25zZSwgYm9keSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS5zdGF0dXNDb2RlIC8gMTAwICE9PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFNjYWxhciByZXF1ZXN0IGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXNDb2RlfWApKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFib2R5IHx8ICFib2R5LnNjYWxhcl90b2tlbikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiTWlzc2luZyBzY2FsYXJfdG9rZW4gaW4gcmVzcG9uc2VcIikpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoYm9keS5zY2FsYXJfdG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRTY2FsYXJQYWdlVGl0bGUodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBsZXQgc2NhbGFyUGFnZUxvb2t1cFVybCA9IHRoaXMuYXBpVXJsICsgJy93aWRnZXRzL3RpdGxlX2xvb2t1cCc7XG4gICAgICAgIHNjYWxhclBhZ2VMb29rdXBVcmwgPSB0aGlzLmdldFN0YXJ0ZXJMaW5rKHNjYWxhclBhZ2VMb29rdXBVcmwpO1xuICAgICAgICBzY2FsYXJQYWdlTG9va3VwVXJsICs9ICcmY3VybD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHVybCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgcmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICB1cmk6IHNjYWxhclBhZ2VMb29rdXBVcmwsXG4gICAgICAgICAgICAgICAganNvbjogdHJ1ZSxcbiAgICAgICAgICAgIH0sIChlcnIsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgLyAxMDAgIT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgU2NhbGFyIHJlcXVlc3QgZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9YCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWJvZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIk1pc3NpbmcgcGFnZSB0aXRsZSBpbiByZXNwb25zZVwiKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRpdGxlID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJvZHkucGFnZV90aXRsZV9jYWNoZV9pdGVtICYmIGJvZHkucGFnZV90aXRsZV9jYWNoZV9pdGVtLmNhY2hlZF90aXRsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBib2R5LnBhZ2VfdGl0bGVfY2FjaGVfaXRlbS5jYWNoZWRfdGl0bGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0aXRsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1hcmsgYWxsIGFzc2V0cyBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCB3aWRnZXQgYXMgXCJkaXNhYmxlZFwiIGluIHRoZVxuICAgICAqIGludGVncmF0aW9uIG1hbmFnZXIgZGF0YWJhc2UuXG4gICAgICogVGhpcyBjYW4gYmUgdXNlZnVsIHRvIHRlbXBvcmFyaWx5IHByZXZlbnQgcHVyY2hhc2VkIGFzc2V0cyBmcm9tIGJlaW5nIGRpc3BsYXllZC5cbiAgICAgKiBAcGFyYW0gIHtXaWRnZXRUeXBlfSB3aWRnZXRUeXBlIFRoZSBXaWRnZXQgVHlwZSB0byBkaXNhYmxlIGFzc2V0cyBmb3JcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHdpZGdldElkICAgVGhlIHdpZGdldCBJRCB0byBkaXNhYmxlIGFzc2V0cyBmb3JcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSAgICAgICAgICAgUmVzb2x2ZXMgb24gY29tcGxldGlvblxuICAgICAqL1xuICAgIGRpc2FibGVXaWRnZXRBc3NldHMod2lkZ2V0VHlwZTogV2lkZ2V0VHlwZSwgd2lkZ2V0SWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy5hcGlVcmwgKyAnL3dpZGdldHMvc2V0X2Fzc2V0c19zdGF0ZSc7XG4gICAgICAgIHVybCA9IHRoaXMuZ2V0U3RhcnRlckxpbmsodXJsKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsIC8vIFhYWDogQWN0aW9ucyBzaG91bGRuJ3QgYmUgR0VUIHJlcXVlc3RzXG4gICAgICAgICAgICAgICAgdXJpOiB1cmwsXG4gICAgICAgICAgICAgICAganNvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBxczoge1xuICAgICAgICAgICAgICAgICAgICAnd2lkZ2V0X3R5cGUnOiB3aWRnZXRUeXBlLnByZWZlcnJlZCxcbiAgICAgICAgICAgICAgICAgICAgJ3dpZGdldF9pZCc6IHdpZGdldElkLFxuICAgICAgICAgICAgICAgICAgICAnc3RhdGUnOiAnZGlzYWJsZScsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sIChlcnIsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgLyAxMDAgIT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgU2NhbGFyIHJlcXVlc3QgZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c0NvZGV9YCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWJvZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIkZhaWxlZCB0byBzZXQgd2lkZ2V0IGFzc2V0cyBzdGF0ZVwiKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRTY2FsYXJJbnRlcmZhY2VVcmxGb3JSb29tKHJvb206IFJvb20sIHNjcmVlbjogc3RyaW5nLCBpZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gcm9vbS5yb29tSWQ7XG4gICAgICAgIGNvbnN0IHJvb21OYW1lID0gcm9vbS5uYW1lO1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51aVVybDtcbiAgICAgICAgdXJsICs9IFwiP3NjYWxhcl90b2tlbj1cIiArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLnNjYWxhclRva2VuKTtcbiAgICAgICAgdXJsICs9IFwiJnJvb21faWQ9XCIgKyBlbmNvZGVVUklDb21wb25lbnQocm9vbUlkKTtcbiAgICAgICAgdXJsICs9IFwiJnJvb21fbmFtZT1cIiArIGVuY29kZVVSSUNvbXBvbmVudChyb29tTmFtZSk7XG4gICAgICAgIHVybCArPSBcIiZ0aGVtZT1cIiArIGVuY29kZVVSSUNvbXBvbmVudChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwidGhlbWVcIikpO1xuICAgICAgICBpZiAoaWQpIHtcbiAgICAgICAgICAgIHVybCArPSAnJmludGVnX2lkPScgKyBlbmNvZGVVUklDb21wb25lbnQoaWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzY3JlZW4pIHtcbiAgICAgICAgICAgIHVybCArPSAnJnNjcmVlbj0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHNjcmVlbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG5cbiAgICBnZXRTdGFydGVyTGluayhzdGFydGVyTGlua1VybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHN0YXJ0ZXJMaW5rVXJsICsgXCI/c2NhbGFyX3Rva2VuPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuc2NhbGFyVG9rZW4pO1xuICAgIH1cbn1cbiJdfQ==