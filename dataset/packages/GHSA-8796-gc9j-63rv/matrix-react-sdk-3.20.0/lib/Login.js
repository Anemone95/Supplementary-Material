"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendLoginRequest = sendLoginRequest;
exports.default = exports.IdentityProviderBrand = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _matrix = require("matrix-js-sdk/src/matrix");

var _Security = _interopRequireDefault(require("./customisations/Security"));

/*
Copyright 2015-2021 The Matrix.org Foundation C.I.C.
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>

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
// @ts-ignore - XXX: tsc doesn't like this: our js-sdk imports are complex so this isn't surprising
let IdentityProviderBrand;
exports.IdentityProviderBrand = IdentityProviderBrand;

(function (IdentityProviderBrand) {
  IdentityProviderBrand["Gitlab"] = "org.matrix.gitlab";
  IdentityProviderBrand["Github"] = "org.matrix.github";
  IdentityProviderBrand["Apple"] = "org.matrix.apple";
  IdentityProviderBrand["Google"] = "org.matrix.google";
  IdentityProviderBrand["Facebook"] = "org.matrix.facebook";
  IdentityProviderBrand["Twitter"] = "org.matrix.twitter";
})(IdentityProviderBrand || (exports.IdentityProviderBrand = IdentityProviderBrand = {}));
/*:: export interface IIdentityProvider {
    id: string;
    name: string;
    icon?: string;
    brand?: IdentityProviderBrand | string;
}*/

/*:: export interface ISSOFlow {
    type: "m.login.sso" | "m.login.cas";
    "org.matrix.msc2858.identity_providers": IIdentityProvider[]; // Unstable prefix for MSC2858
}*/

/*:: export type LoginFlow = ISSOFlow | IPasswordFlow;*/


/* eslint-enable camelcase */
class Login {
  // TODO: Flows need a type in JS SDK
  constructor(hsUrl
  /*: string*/
  , isUrl
  /*: string*/
  , fallbackHsUrl
  /*: string*/
  , opts
  /*: ILoginOptions*/
  ) {
    (0, _defineProperty2.default)(this, "hsUrl", void 0);
    (0, _defineProperty2.default)(this, "isUrl", void 0);
    (0, _defineProperty2.default)(this, "fallbackHsUrl", void 0);
    (0, _defineProperty2.default)(this, "flows", void 0);
    (0, _defineProperty2.default)(this, "defaultDeviceDisplayName", void 0);
    (0, _defineProperty2.default)(this, "tempClient", void 0);
    this.hsUrl = hsUrl;
    this.isUrl = isUrl;
    this.fallbackHsUrl = fallbackHsUrl;
    this.flows = [];
    this.defaultDeviceDisplayName = opts.defaultDeviceDisplayName;
    this.tempClient = null; // memoize
  }

  getHomeserverUrl()
  /*: string*/
  {
    return this.hsUrl;
  }

  getIdentityServerUrl()
  /*: string*/
  {
    return this.isUrl;
  }

  setHomeserverUrl(hsUrl
  /*: string*/
  )
  /*: void*/
  {
    this.tempClient = null; // clear memoization

    this.hsUrl = hsUrl;
  }

  setIdentityServerUrl(isUrl
  /*: string*/
  )
  /*: void*/
  {
    this.tempClient = null; // clear memoization

    this.isUrl = isUrl;
  }
  /**
   * Get a temporary MatrixClient, which can be used for login or register
   * requests.
   * @returns {MatrixClient}
   */


  createTemporaryClient()
  /*: MatrixClient*/
  {
    if (this.tempClient) return this.tempClient; // use memoization

    return this.tempClient = (0, _matrix.createClient)({
      baseUrl: this.hsUrl,
      idBaseUrl: this.isUrl
    });
  }

  async getFlows()
  /*: Promise<Array<LoginFlow>>*/
  {
    const client = this.createTemporaryClient();
    const {
      flows
    } = await client.loginFlows();
    this.flows = flows;
    return this.flows;
  }

  loginViaPassword(username
  /*: string*/
  , phoneCountry
  /*: string*/
  , phoneNumber
  /*: string*/
  , password
  /*: string*/
  )
  /*: Promise<IMatrixClientCreds>*/
  {
    const isEmail = username.indexOf("@") > 0;
    let identifier;

    if (phoneCountry && phoneNumber) {
      identifier = {
        type: 'm.id.phone',
        country: phoneCountry,
        phone: phoneNumber,
        // XXX: Synapse historically wanted `number` and not `phone`
        number: phoneNumber
      };
    } else if (isEmail) {
      identifier = {
        type: 'm.id.thirdparty',
        medium: 'email',
        address: username
      };
    } else {
      identifier = {
        type: 'm.id.user',
        user: username
      };
    }

    const loginParams = {
      password,
      identifier,
      initial_device_display_name: this.defaultDeviceDisplayName
    };

    const tryFallbackHs = originalError => {
      return sendLoginRequest(this.fallbackHsUrl, this.isUrl, 'm.login.password', loginParams).catch(fallbackError => {
        console.log("fallback HS login failed", fallbackError); // throw the original error

        throw originalError;
      });
    };

    let originalLoginError = null;
    return sendLoginRequest(this.hsUrl, this.isUrl, 'm.login.password', loginParams).catch(error => {
      originalLoginError = error;

      if (error.httpStatus === 403) {
        if (this.fallbackHsUrl) {
          return tryFallbackHs(originalLoginError);
        }
      }

      throw originalLoginError;
    }).catch(error => {
      console.log("Login failed", error);
      throw error;
    });
  }

}
/**
 * Send a login request to the given server, and format the response
 * as a MatrixClientCreds
 *
 * @param {string} hsUrl   the base url of the Homeserver used to log in.
 * @param {string} isUrl   the base url of the default identity server
 * @param {string} loginType the type of login to do
 * @param {ILoginParams} loginParams the parameters for the login
 *
 * @returns {MatrixClientCreds}
 */


exports.default = Login;

async function sendLoginRequest(hsUrl
/*: string*/
, isUrl
/*: string*/
, loginType
/*: string*/
, loginParams
/*: ILoginParams*/
)
/*: Promise<IMatrixClientCreds>*/
{
  const client = (0, _matrix.createClient)({
    baseUrl: hsUrl,
    idBaseUrl: isUrl
  });
  const data = await client.login(loginType, loginParams);
  const wellknown = data.well_known;

  if (wellknown) {
    if (wellknown["m.homeserver"] && wellknown["m.homeserver"]["base_url"]) {
      hsUrl = wellknown["m.homeserver"]["base_url"];
      console.log(`Overrode homeserver setting with ${hsUrl} from login response`);
    }

    if (wellknown["m.identity_server"] && wellknown["m.identity_server"]["base_url"]) {
      // TODO: should we prompt here?
      isUrl = wellknown["m.identity_server"]["base_url"];
      console.log(`Overrode IS setting with ${isUrl} from login response`);
    }
  }

  const creds
  /*: IMatrixClientCreds*/
  = {
    homeserverUrl: hsUrl,
    identityServerUrl: isUrl,
    userId: data.user_id,
    deviceId: data.device_id,
    accessToken: data.access_token
  };
  _Security.default.examineLoginResponse?.(data, creds);
  return creds;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Mb2dpbi50cyJdLCJuYW1lcyI6WyJJZGVudGl0eVByb3ZpZGVyQnJhbmQiLCJMb2dpbiIsImNvbnN0cnVjdG9yIiwiaHNVcmwiLCJpc1VybCIsImZhbGxiYWNrSHNVcmwiLCJvcHRzIiwiZmxvd3MiLCJkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWUiLCJ0ZW1wQ2xpZW50IiwiZ2V0SG9tZXNlcnZlclVybCIsImdldElkZW50aXR5U2VydmVyVXJsIiwic2V0SG9tZXNlcnZlclVybCIsInNldElkZW50aXR5U2VydmVyVXJsIiwiY3JlYXRlVGVtcG9yYXJ5Q2xpZW50IiwiYmFzZVVybCIsImlkQmFzZVVybCIsImdldEZsb3dzIiwiY2xpZW50IiwibG9naW5GbG93cyIsImxvZ2luVmlhUGFzc3dvcmQiLCJ1c2VybmFtZSIsInBob25lQ291bnRyeSIsInBob25lTnVtYmVyIiwicGFzc3dvcmQiLCJpc0VtYWlsIiwiaW5kZXhPZiIsImlkZW50aWZpZXIiLCJ0eXBlIiwiY291bnRyeSIsInBob25lIiwibnVtYmVyIiwibWVkaXVtIiwiYWRkcmVzcyIsInVzZXIiLCJsb2dpblBhcmFtcyIsImluaXRpYWxfZGV2aWNlX2Rpc3BsYXlfbmFtZSIsInRyeUZhbGxiYWNrSHMiLCJvcmlnaW5hbEVycm9yIiwic2VuZExvZ2luUmVxdWVzdCIsImNhdGNoIiwiZmFsbGJhY2tFcnJvciIsImNvbnNvbGUiLCJsb2ciLCJvcmlnaW5hbExvZ2luRXJyb3IiLCJlcnJvciIsImh0dHBTdGF0dXMiLCJsb2dpblR5cGUiLCJkYXRhIiwibG9naW4iLCJ3ZWxsa25vd24iLCJ3ZWxsX2tub3duIiwiY3JlZHMiLCJob21lc2VydmVyVXJsIiwiaWRlbnRpdHlTZXJ2ZXJVcmwiLCJ1c2VySWQiLCJ1c2VyX2lkIiwiZGV2aWNlSWQiLCJkZXZpY2VfaWQiLCJhY2Nlc3NUb2tlbiIsImFjY2Vzc190b2tlbiIsIlNlY3VyaXR5Q3VzdG9taXNhdGlvbnMiLCJleGFtaW5lTG9naW5SZXNwb25z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NEJBQTJCdkMsS0FBTSxzQkFBOUM7QUFDSDtBQUNKOztBQUVELFFBQU1nRDtBQUF5QjtBQUFBLElBQUc7QUFDOUJDLElBQUFBLGFBQWEsRUFBRWxELEtBRGU7QUFFOUJtRCxJQUFBQSxpQkFBaUIsRUFBRWxELEtBRlc7QUFHOUJtRCxJQUFBQSxNQUFNLEVBQUVQLElBQUksQ0FBQ1EsT0FIaUI7QUFJOUJDLElBQUFBLFFBQVEsRUFBRVQsSUFBSSxDQUFDVSxTQUplO0FBSzlCQyxJQUFBQSxXQUFXLEVBQUVYLElBQUksQ0FBQ1k7QUFMWSxHQUFsQztBQVFBQyxvQkFBdUJDLG9CQUF2QixHQUE4Q2QsSUFBOUMsRUFBb0RJLEtBQXBEO0FBRUEsU0FBT0EsS0FBUDtBQUNIIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbi8vIEB0cy1pZ25vcmUgLSBYWFg6IHRzYyBkb2Vzbid0IGxpa2UgdGhpczogb3VyIGpzLXNkayBpbXBvcnRzIGFyZSBjb21wbGV4IHNvIHRoaXMgaXNuJ3Qgc3VycHJpc2luZ1xuaW1wb3J0IHtjcmVhdGVDbGllbnR9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tYXRyaXhcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcbmltcG9ydCB7IElNYXRyaXhDbGllbnRDcmVkcyB9IGZyb20gXCIuL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IFNlY3VyaXR5Q3VzdG9taXNhdGlvbnMgZnJvbSBcIi4vY3VzdG9taXNhdGlvbnMvU2VjdXJpdHlcIjtcblxuaW50ZXJmYWNlIElMb2dpbk9wdGlvbnMge1xuICAgIGRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZT86IHN0cmluZztcbn1cblxuLy8gVE9ETzogTW92ZSB0aGlzIHRvIEpTIFNES1xuaW50ZXJmYWNlIElQYXNzd29yZEZsb3cge1xuICAgIHR5cGU6IFwibS5sb2dpbi5wYXNzd29yZFwiO1xufVxuXG5leHBvcnQgZW51bSBJZGVudGl0eVByb3ZpZGVyQnJhbmQge1xuICAgIEdpdGxhYiA9IFwib3JnLm1hdHJpeC5naXRsYWJcIixcbiAgICBHaXRodWIgPSBcIm9yZy5tYXRyaXguZ2l0aHViXCIsXG4gICAgQXBwbGUgPSBcIm9yZy5tYXRyaXguYXBwbGVcIixcbiAgICBHb29nbGUgPSBcIm9yZy5tYXRyaXguZ29vZ2xlXCIsXG4gICAgRmFjZWJvb2sgPSBcIm9yZy5tYXRyaXguZmFjZWJvb2tcIixcbiAgICBUd2l0dGVyID0gXCJvcmcubWF0cml4LnR3aXR0ZXJcIixcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJSWRlbnRpdHlQcm92aWRlciB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgaWNvbj86IHN0cmluZztcbiAgICBicmFuZD86IElkZW50aXR5UHJvdmlkZXJCcmFuZCB8IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJU1NPRmxvdyB7XG4gICAgdHlwZTogXCJtLmxvZ2luLnNzb1wiIHwgXCJtLmxvZ2luLmNhc1wiO1xuICAgIFwib3JnLm1hdHJpeC5tc2MyODU4LmlkZW50aXR5X3Byb3ZpZGVyc1wiOiBJSWRlbnRpdHlQcm92aWRlcltdOyAvLyBVbnN0YWJsZSBwcmVmaXggZm9yIE1TQzI4NThcbn1cblxuZXhwb3J0IHR5cGUgTG9naW5GbG93ID0gSVNTT0Zsb3cgfCBJUGFzc3dvcmRGbG93O1xuXG4vLyBUT0RPOiBNb3ZlIHRoaXMgdG8gSlMgU0RLXG4vKiBlc2xpbnQtZGlzYWJsZSBjYW1lbGNhc2UgKi9cbmludGVyZmFjZSBJTG9naW5QYXJhbXMge1xuICAgIGlkZW50aWZpZXI/OiBvYmplY3Q7XG4gICAgcGFzc3dvcmQ/OiBzdHJpbmc7XG4gICAgdG9rZW4/OiBzdHJpbmc7XG4gICAgZGV2aWNlX2lkPzogc3RyaW5nO1xuICAgIGluaXRpYWxfZGV2aWNlX2Rpc3BsYXlfbmFtZT86IHN0cmluZztcbn1cbi8qIGVzbGludC1lbmFibGUgY2FtZWxjYXNlICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExvZ2luIHtcbiAgICBwcml2YXRlIGhzVXJsOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBpc1VybDogc3RyaW5nO1xuICAgIHByaXZhdGUgZmFsbGJhY2tIc1VybDogc3RyaW5nO1xuICAgIC8vIFRPRE86IEZsb3dzIG5lZWQgYSB0eXBlIGluIEpTIFNES1xuICAgIHByaXZhdGUgZmxvd3M6IEFycmF5PExvZ2luRmxvdz47XG4gICAgcHJpdmF0ZSBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU6IHN0cmluZztcbiAgICBwcml2YXRlIHRlbXBDbGllbnQ6IE1hdHJpeENsaWVudDtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBoc1VybDogc3RyaW5nLFxuICAgICAgICBpc1VybDogc3RyaW5nLFxuICAgICAgICBmYWxsYmFja0hzVXJsPzogc3RyaW5nLFxuICAgICAgICBvcHRzPzogSUxvZ2luT3B0aW9ucyxcbiAgICApIHtcbiAgICAgICAgdGhpcy5oc1VybCA9IGhzVXJsO1xuICAgICAgICB0aGlzLmlzVXJsID0gaXNVcmw7XG4gICAgICAgIHRoaXMuZmFsbGJhY2tIc1VybCA9IGZhbGxiYWNrSHNVcmw7XG4gICAgICAgIHRoaXMuZmxvd3MgPSBbXTtcbiAgICAgICAgdGhpcy5kZWZhdWx0RGV2aWNlRGlzcGxheU5hbWUgPSBvcHRzLmRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZTtcbiAgICAgICAgdGhpcy50ZW1wQ2xpZW50ID0gbnVsbDsgLy8gbWVtb2l6ZVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRIb21lc2VydmVyVXJsKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmhzVXJsO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRJZGVudGl0eVNlcnZlclVybCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5pc1VybDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0SG9tZXNlcnZlclVybChoc1VybDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHRoaXMudGVtcENsaWVudCA9IG51bGw7IC8vIGNsZWFyIG1lbW9pemF0aW9uXG4gICAgICAgIHRoaXMuaHNVcmwgPSBoc1VybDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0SWRlbnRpdHlTZXJ2ZXJVcmwoaXNVcmw6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB0aGlzLnRlbXBDbGllbnQgPSBudWxsOyAvLyBjbGVhciBtZW1vaXphdGlvblxuICAgICAgICB0aGlzLmlzVXJsID0gaXNVcmw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGEgdGVtcG9yYXJ5IE1hdHJpeENsaWVudCwgd2hpY2ggY2FuIGJlIHVzZWQgZm9yIGxvZ2luIG9yIHJlZ2lzdGVyXG4gICAgICogcmVxdWVzdHMuXG4gICAgICogQHJldHVybnMge01hdHJpeENsaWVudH1cbiAgICAgKi9cbiAgICBwdWJsaWMgY3JlYXRlVGVtcG9yYXJ5Q2xpZW50KCk6IE1hdHJpeENsaWVudCB7XG4gICAgICAgIGlmICh0aGlzLnRlbXBDbGllbnQpIHJldHVybiB0aGlzLnRlbXBDbGllbnQ7IC8vIHVzZSBtZW1vaXphdGlvblxuICAgICAgICByZXR1cm4gdGhpcy50ZW1wQ2xpZW50ID0gY3JlYXRlQ2xpZW50KHtcbiAgICAgICAgICAgIGJhc2VVcmw6IHRoaXMuaHNVcmwsXG4gICAgICAgICAgICBpZEJhc2VVcmw6IHRoaXMuaXNVcmwsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBnZXRGbG93cygpOiBQcm9taXNlPEFycmF5PExvZ2luRmxvdz4+IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gdGhpcy5jcmVhdGVUZW1wb3JhcnlDbGllbnQoKTtcbiAgICAgICAgY29uc3QgeyBmbG93cyB9ID0gYXdhaXQgY2xpZW50LmxvZ2luRmxvd3MoKTtcbiAgICAgICAgdGhpcy5mbG93cyA9IGZsb3dzO1xuICAgICAgICByZXR1cm4gdGhpcy5mbG93cztcbiAgICB9XG5cbiAgICBwdWJsaWMgbG9naW5WaWFQYXNzd29yZChcbiAgICAgICAgdXNlcm5hbWU6IHN0cmluZyxcbiAgICAgICAgcGhvbmVDb3VudHJ5OiBzdHJpbmcsXG4gICAgICAgIHBob25lTnVtYmVyOiBzdHJpbmcsXG4gICAgICAgIHBhc3N3b3JkOiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxJTWF0cml4Q2xpZW50Q3JlZHM+IHtcbiAgICAgICAgY29uc3QgaXNFbWFpbCA9IHVzZXJuYW1lLmluZGV4T2YoXCJAXCIpID4gMDtcblxuICAgICAgICBsZXQgaWRlbnRpZmllcjtcbiAgICAgICAgaWYgKHBob25lQ291bnRyeSAmJiBwaG9uZU51bWJlcikge1xuICAgICAgICAgICAgaWRlbnRpZmllciA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbS5pZC5waG9uZScsXG4gICAgICAgICAgICAgICAgY291bnRyeTogcGhvbmVDb3VudHJ5LFxuICAgICAgICAgICAgICAgIHBob25lOiBwaG9uZU51bWJlcixcbiAgICAgICAgICAgICAgICAvLyBYWFg6IFN5bmFwc2UgaGlzdG9yaWNhbGx5IHdhbnRlZCBgbnVtYmVyYCBhbmQgbm90IGBwaG9uZWBcbiAgICAgICAgICAgICAgICBudW1iZXI6IHBob25lTnVtYmVyLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0VtYWlsKSB7XG4gICAgICAgICAgICBpZGVudGlmaWVyID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdtLmlkLnRoaXJkcGFydHknLFxuICAgICAgICAgICAgICAgIG1lZGl1bTogJ2VtYWlsJyxcbiAgICAgICAgICAgICAgICBhZGRyZXNzOiB1c2VybmFtZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZGVudGlmaWVyID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdtLmlkLnVzZXInLFxuICAgICAgICAgICAgICAgIHVzZXI6IHVzZXJuYW1lLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxvZ2luUGFyYW1zID0ge1xuICAgICAgICAgICAgcGFzc3dvcmQsXG4gICAgICAgICAgICBpZGVudGlmaWVyLFxuICAgICAgICAgICAgaW5pdGlhbF9kZXZpY2VfZGlzcGxheV9uYW1lOiB0aGlzLmRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB0cnlGYWxsYmFja0hzID0gKG9yaWdpbmFsRXJyb3IpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzZW5kTG9naW5SZXF1ZXN0KFxuICAgICAgICAgICAgICAgIHRoaXMuZmFsbGJhY2tIc1VybCwgdGhpcy5pc1VybCwgJ20ubG9naW4ucGFzc3dvcmQnLCBsb2dpblBhcmFtcyxcbiAgICAgICAgICAgICkuY2F0Y2goKGZhbGxiYWNrRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZhbGxiYWNrIEhTIGxvZ2luIGZhaWxlZFwiLCBmYWxsYmFja0Vycm9yKTtcbiAgICAgICAgICAgICAgICAvLyB0aHJvdyB0aGUgb3JpZ2luYWwgZXJyb3JcbiAgICAgICAgICAgICAgICB0aHJvdyBvcmlnaW5hbEVycm9yO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IG9yaWdpbmFsTG9naW5FcnJvciA9IG51bGw7XG4gICAgICAgIHJldHVybiBzZW5kTG9naW5SZXF1ZXN0KFxuICAgICAgICAgICAgdGhpcy5oc1VybCwgdGhpcy5pc1VybCwgJ20ubG9naW4ucGFzc3dvcmQnLCBsb2dpblBhcmFtcyxcbiAgICAgICAgKS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIG9yaWdpbmFsTG9naW5FcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgaWYgKGVycm9yLmh0dHBTdGF0dXMgPT09IDQwMykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZhbGxiYWNrSHNVcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRyeUZhbGxiYWNrSHMob3JpZ2luYWxMb2dpbkVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBvcmlnaW5hbExvZ2luRXJyb3I7XG4gICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJMb2dpbiBmYWlsZWRcIiwgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuXG4vKipcbiAqIFNlbmQgYSBsb2dpbiByZXF1ZXN0IHRvIHRoZSBnaXZlbiBzZXJ2ZXIsIGFuZCBmb3JtYXQgdGhlIHJlc3BvbnNlXG4gKiBhcyBhIE1hdHJpeENsaWVudENyZWRzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGhzVXJsICAgdGhlIGJhc2UgdXJsIG9mIHRoZSBIb21lc2VydmVyIHVzZWQgdG8gbG9nIGluLlxuICogQHBhcmFtIHtzdHJpbmd9IGlzVXJsICAgdGhlIGJhc2UgdXJsIG9mIHRoZSBkZWZhdWx0IGlkZW50aXR5IHNlcnZlclxuICogQHBhcmFtIHtzdHJpbmd9IGxvZ2luVHlwZSB0aGUgdHlwZSBvZiBsb2dpbiB0byBkb1xuICogQHBhcmFtIHtJTG9naW5QYXJhbXN9IGxvZ2luUGFyYW1zIHRoZSBwYXJhbWV0ZXJzIGZvciB0aGUgbG9naW5cbiAqXG4gKiBAcmV0dXJucyB7TWF0cml4Q2xpZW50Q3JlZHN9XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kTG9naW5SZXF1ZXN0KFxuICAgIGhzVXJsOiBzdHJpbmcsXG4gICAgaXNVcmw6IHN0cmluZyxcbiAgICBsb2dpblR5cGU6IHN0cmluZyxcbiAgICBsb2dpblBhcmFtczogSUxvZ2luUGFyYW1zLFxuKTogUHJvbWlzZTxJTWF0cml4Q2xpZW50Q3JlZHM+IHtcbiAgICBjb25zdCBjbGllbnQgPSBjcmVhdGVDbGllbnQoe1xuICAgICAgICBiYXNlVXJsOiBoc1VybCxcbiAgICAgICAgaWRCYXNlVXJsOiBpc1VybCxcbiAgICB9KTtcblxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBjbGllbnQubG9naW4obG9naW5UeXBlLCBsb2dpblBhcmFtcyk7XG5cbiAgICBjb25zdCB3ZWxsa25vd24gPSBkYXRhLndlbGxfa25vd247XG4gICAgaWYgKHdlbGxrbm93bikge1xuICAgICAgICBpZiAod2VsbGtub3duW1wibS5ob21lc2VydmVyXCJdICYmIHdlbGxrbm93bltcIm0uaG9tZXNlcnZlclwiXVtcImJhc2VfdXJsXCJdKSB7XG4gICAgICAgICAgICBoc1VybCA9IHdlbGxrbm93bltcIm0uaG9tZXNlcnZlclwiXVtcImJhc2VfdXJsXCJdO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE92ZXJyb2RlIGhvbWVzZXJ2ZXIgc2V0dGluZyB3aXRoICR7aHNVcmx9IGZyb20gbG9naW4gcmVzcG9uc2VgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAod2VsbGtub3duW1wibS5pZGVudGl0eV9zZXJ2ZXJcIl0gJiYgd2VsbGtub3duW1wibS5pZGVudGl0eV9zZXJ2ZXJcIl1bXCJiYXNlX3VybFwiXSkge1xuICAgICAgICAgICAgLy8gVE9ETzogc2hvdWxkIHdlIHByb21wdCBoZXJlP1xuICAgICAgICAgICAgaXNVcmwgPSB3ZWxsa25vd25bXCJtLmlkZW50aXR5X3NlcnZlclwiXVtcImJhc2VfdXJsXCJdO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE92ZXJyb2RlIElTIHNldHRpbmcgd2l0aCAke2lzVXJsfSBmcm9tIGxvZ2luIHJlc3BvbnNlYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBjcmVkczogSU1hdHJpeENsaWVudENyZWRzID0ge1xuICAgICAgICBob21lc2VydmVyVXJsOiBoc1VybCxcbiAgICAgICAgaWRlbnRpdHlTZXJ2ZXJVcmw6IGlzVXJsLFxuICAgICAgICB1c2VySWQ6IGRhdGEudXNlcl9pZCxcbiAgICAgICAgZGV2aWNlSWQ6IGRhdGEuZGV2aWNlX2lkLFxuICAgICAgICBhY2Nlc3NUb2tlbjogZGF0YS5hY2Nlc3NfdG9rZW4sXG4gICAgfTtcblxuICAgIFNlY3VyaXR5Q3VzdG9taXNhdGlvbnMuZXhhbWluZUxvZ2luUmVzcG9uc2U/LihkYXRhLCBjcmVkcyk7XG5cbiAgICByZXR1cm4gY3JlZHM7XG59XG4iXX0=