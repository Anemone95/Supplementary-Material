"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.UpdateCheckStatus = exports.SSO_IDP_ID_KEY = exports.SSO_ID_SERVER_URL_KEY = exports.SSO_HOMESERVER_URL_KEY = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _olmlib = require("matrix-js-sdk/src/crypto/olmlib");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _actions = require("./dispatcher/actions");

var _UpdateToast = require("./toasts/UpdateToast");

var _MatrixClientPeg = require("./MatrixClientPeg");

var _StorageManager = require("./utils/StorageManager");

/*
Copyright 2016 Aviral Dasgupta
Copyright 2016 OpenMarket Ltd
Copyright 2018 New Vector Ltd
Copyright 2020 The Matrix.org Foundation C.I.C.

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
const SSO_HOMESERVER_URL_KEY = "mx_sso_hs_url";
exports.SSO_HOMESERVER_URL_KEY = SSO_HOMESERVER_URL_KEY;
const SSO_ID_SERVER_URL_KEY = "mx_sso_is_url";
exports.SSO_ID_SERVER_URL_KEY = SSO_ID_SERVER_URL_KEY;
const SSO_IDP_ID_KEY = "mx_sso_idp_id";
exports.SSO_IDP_ID_KEY = SSO_IDP_ID_KEY;
let UpdateCheckStatus;
exports.UpdateCheckStatus = UpdateCheckStatus;

(function (UpdateCheckStatus) {
  UpdateCheckStatus["Checking"] = "CHECKING";
  UpdateCheckStatus["Error"] = "ERROR";
  UpdateCheckStatus["NotAvailable"] = "NOTAVAILABLE";
  UpdateCheckStatus["Downloading"] = "DOWNLOADING";
  UpdateCheckStatus["Ready"] = "READY";
})(UpdateCheckStatus || (exports.UpdateCheckStatus = UpdateCheckStatus = {}));

const UPDATE_DEFER_KEY = "mx_defer_update";
/**
 * Base class for classes that provide platform-specific functionality
 * eg. Setting an application badge or displaying notifications
 *
 * Instances of this class are provided by the application.
 */

class BasePlatform {
  constructor() {
    (0, _defineProperty2.default)(this, "notificationCount", 0);
    (0, _defineProperty2.default)(this, "errorDidOccur", false);
    (0, _defineProperty2.default)(this, "onAction", (payload
    /*: ActionPayload*/
    ) => {
      switch (payload.action) {
        case 'on_client_not_viable':
        case 'on_logged_out':
          this.setNotificationCount(0);
          break;
      }
    });

    _dispatcher.default.register(this.onAction);

    this.startUpdateCheck = this.startUpdateCheck.bind(this);
  }

  setNotificationCount(count
  /*: number*/
  ) {
    this.notificationCount = count;
  }

  setErrorStatus(errorDidOccur
  /*: boolean*/
  ) {
    this.errorDidOccur = errorDidOccur;
  }
  /**
   * Whether we can call checkForUpdate on this platform build
   */


  async canSelfUpdate()
  /*: Promise<boolean>*/
  {
    return false;
  }

  startUpdateCheck() {
    (0, _UpdateToast.hideToast)();
    localStorage.removeItem(UPDATE_DEFER_KEY);

    _dispatcher.default.dispatch({
      action: _actions.Action.CheckUpdates,
      status: UpdateCheckStatus.Checking
    });
  }
  /**
   * Update the currently running app to the latest available version
   * and replace this instance of the app with the new version.
   */


  installUpdate() {}
  /**
   * Check if the version update has been deferred and that deferment is still in effect
   * @param newVersion the version string to check
   */


  shouldShowUpdate(newVersion
  /*: string*/
  )
  /*: boolean*/
  {
    // If the user registered on this client in the last 24 hours then do not show them the update toast
    if (_MatrixClientPeg.MatrixClientPeg.userRegisteredWithinLastHours(24)) return false;

    try {
      const [version, deferUntil] = JSON.parse(localStorage.getItem(UPDATE_DEFER_KEY));
      return newVersion !== version || Date.now() > deferUntil;
    } catch (e) {
      return true;
    }
  }
  /**
   * Ignore the pending update and don't prompt about this version
   * until the next morning (8am).
   */


  deferUpdate(newVersion
  /*: string*/
  ) {
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
    date.setHours(8, 0, 0, 0); // set to next 8am

    localStorage.setItem(UPDATE_DEFER_KEY, JSON.stringify([newVersion, date.getTime()]));
    (0, _UpdateToast.hideToast)();
  }
  /**
   * Returns true if the platform supports displaying
   * notifications, otherwise false.
   * @returns {boolean} whether the platform supports displaying notifications
   */


  supportsNotifications()
  /*: boolean*/
  {
    return false;
  }
  /**
   * Returns true if the application currently has permission
   * to display notifications. Otherwise false.
   * @returns {boolean} whether the application has permission to display notifications
   */


  maySendNotifications()
  /*: boolean*/
  {
    return false;
  }
  /**
   * Requests permission to send notifications. Returns
   * a promise that is resolved when the user has responded
   * to the request. The promise has a single string argument
   * that is 'granted' if the user allowed the request or
   * 'denied' otherwise.
   */


  loudNotification(ev
  /*: Event*/
  , room
  /*: Object*/
  ) {}

  clearNotification(notif
  /*: Notification*/
  ) {
    // Some browsers don't support this, e.g Safari on iOS
    // https://developer.mozilla.org/en-US/docs/Web/API/Notification/close
    if (notif.close) {
      notif.close();
    }
  }
  /**
   * Returns a promise that resolves to a string representing the current version of the application.
   */


  /*
   * If it's not expected that capturing the screen will work
   * with getUserMedia, return a string explaining why not.
   * Otherwise, return null.
   */
  screenCaptureErrorString()
  /*: string*/
  {
    return "Not implemented";
  }
  /**
   * Restarts the application, without neccessarily reloading
   * any application code
   */


  supportsAutoLaunch()
  /*: boolean*/
  {
    return false;
  } // XXX: Surely this should be a setting like any other?


  async getAutoLaunchEnabled()
  /*: Promise<boolean>*/
  {
    return false;
  }

  async setAutoLaunchEnabled(enabled
  /*: boolean*/
  )
  /*: Promise<void>*/
  {
    throw new Error("Unimplemented");
  }

  supportsAutoHideMenuBar()
  /*: boolean*/
  {
    return false;
  }

  async getAutoHideMenuBarEnabled()
  /*: Promise<boolean>*/
  {
    return false;
  }

  async setAutoHideMenuBarEnabled(enabled
  /*: boolean*/
  )
  /*: Promise<void>*/
  {
    throw new Error("Unimplemented");
  }

  supportsMinimizeToTray()
  /*: boolean*/
  {
    return false;
  }

  async getMinimizeToTrayEnabled()
  /*: Promise<boolean>*/
  {
    return false;
  }

  async setMinimizeToTrayEnabled(enabled
  /*: boolean*/
  )
  /*: Promise<void>*/
  {
    throw new Error("Unimplemented");
  }
  /**
   * Get our platform specific EventIndexManager.
   *
   * @return {BaseEventIndexManager} The EventIndex manager for our platform,
   * can be null if the platform doesn't support event indexing.
   */


  getEventIndexingManager()
  /*: BaseEventIndexManager | null*/
  {
    return null;
  }

  setLanguage(preferredLangs
  /*: string[]*/
  ) {}

  getSSOCallbackUrl(fragmentAfterLogin
  /*: string*/
  )
  /*: URL*/
  {
    const url = new URL(window.location.href);
    url.hash = fragmentAfterLogin || "";
    return url;
  }
  /**
   * Begin Single Sign On flows.
   * @param {MatrixClient} mxClient the matrix client using which we should start the flow
   * @param {"sso"|"cas"} loginType the type of SSO it is, CAS/SSO.
   * @param {string} fragmentAfterLogin the hash to pass to the app during sso callback.
   * @param {string} idpId The ID of the Identity Provider being targeted, optional.
   */


  startSingleSignOn(mxClient
  /*: MatrixClient*/
  , loginType
  /*: "sso" | "cas"*/
  , fragmentAfterLogin
  /*: string*/
  , idpId
  /*: string*/
  ) {
    // persist hs url and is url for when the user is returned to the app with the login token
    localStorage.setItem(SSO_HOMESERVER_URL_KEY, mxClient.getHomeserverUrl());

    if (mxClient.getIdentityServerUrl()) {
      localStorage.setItem(SSO_ID_SERVER_URL_KEY, mxClient.getIdentityServerUrl());
    }

    if (idpId) {
      localStorage.setItem(SSO_IDP_ID_KEY, idpId);
    }

    const callbackUrl = this.getSSOCallbackUrl(fragmentAfterLogin);
    window.location.href = mxClient.getSsoLoginUrl(callbackUrl.toString(), loginType, idpId); // redirect to SSO
  }

  onKeyDown(ev
  /*: KeyboardEvent*/
  )
  /*: boolean*/
  {
    return false; // no shortcuts implemented
  }
  /**
   * Get a previously stored pickle key.  The pickle key is used for
   * encrypting libolm objects.
   * @param {string} userId the user ID for the user that the pickle key is for.
   * @param {string} userId the device ID that the pickle key is for.
   * @returns {string|null} the previously stored pickle key, or null if no
   *     pickle key has been stored.
   */


  async getPickleKey(userId
  /*: string*/
  , deviceId
  /*: string*/
  )
  /*: Promise<string | null>*/
  {
    if (!window.crypto || !window.crypto.subtle) {
      return null;
    }

    let data;

    try {
      data = await (0, _StorageManager.idbLoad)("pickleKey", [userId, deviceId]);
    } catch (e) {}

    if (!data) {
      return null;
    }

    if (!data.encrypted || !data.iv || !data.cryptoKey) {
      console.error("Badly formatted pickle key");
      return null;
    }

    const additionalData = new Uint8Array(userId.length + deviceId.length + 1);

    for (let i = 0; i < userId.length; i++) {
      additionalData[i] = userId.charCodeAt(i);
    }

    additionalData[userId.length] = 124; // "|"

    for (let i = 0; i < deviceId.length; i++) {
      additionalData[userId.length + 1 + i] = deviceId.charCodeAt(i);
    }

    try {
      const key = await crypto.subtle.decrypt({
        name: "AES-GCM",
        iv: data.iv,
        additionalData
      }, data.cryptoKey, data.encrypted);
      return (0, _olmlib.encodeUnpaddedBase64)(key);
    } catch (e) {
      console.error("Error decrypting pickle key");
      return null;
    }
  }
  /**
   * Create and store a pickle key for encrypting libolm objects.
   * @param {string} userId the user ID for the user that the pickle key is for.
   * @param {string} userId the device ID that the pickle key is for.
   * @returns {string|null} the pickle key, or null if the platform does not
   *     support storing pickle keys.
   */


  async createPickleKey(userId
  /*: string*/
  , deviceId
  /*: string*/
  )
  /*: Promise<string | null>*/
  {
    if (!window.crypto || !window.crypto.subtle) {
      return null;
    }

    const crypto = window.crypto;
    const randomArray = new Uint8Array(32);
    crypto.getRandomValues(randomArray);
    const cryptoKey = await crypto.subtle.generateKey({
      name: "AES-GCM",
      length: 256
    }, false, ["encrypt", "decrypt"]);
    const iv = new Uint8Array(32);
    crypto.getRandomValues(iv);
    const additionalData = new Uint8Array(userId.length + deviceId.length + 1);

    for (let i = 0; i < userId.length; i++) {
      additionalData[i] = userId.charCodeAt(i);
    }

    additionalData[userId.length] = 124; // "|"

    for (let i = 0; i < deviceId.length; i++) {
      additionalData[userId.length + 1 + i] = deviceId.charCodeAt(i);
    }

    const encrypted = await crypto.subtle.encrypt({
      name: "AES-GCM",
      iv,
      additionalData
    }, cryptoKey, randomArray);

    try {
      await (0, _StorageManager.idbSave)("pickleKey", [userId, deviceId], {
        encrypted,
        iv,
        cryptoKey
      });
    } catch (e) {
      return null;
    }

    return (0, _olmlib.encodeUnpaddedBase64)(randomArray);
  }
  /**
   * Delete a previously stored pickle key from storage.
   * @param {string} userId the user ID for the user that the pickle key is for.
   * @param {string} userId the device ID that the pickle key is for.
   */


  async destroyPickleKey(userId
  /*: string*/
  , deviceId
  /*: string*/
  )
  /*: Promise<void>*/
  {
    try {
      await (0, _StorageManager.idbDelete)("pickleKey", [userId, deviceId]);
    } catch (e) {}
  }

}

exports.default = BasePlatform;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9CYXNlUGxhdGZvcm0udHMiXSwibmFtZXMiOlsiU1NPX0hPTUVTRVJWRVJfVVJMX0tFWSIsIlNTT19JRF9TRVJWRVJfVVJMX0tFWSIsIlNTT19JRFBfSURfS0VZIiwiVXBkYXRlQ2hlY2tTdGF0dXMiLCJVUERBVEVfREVGRVJfS0VZIiwiQmFzZVBsYXRmb3JtIiwiY29uc3RydWN0b3IiLCJwYXlsb2FkIiwiYWN0aW9uIiwic2V0Tm90aWZpY2F0aW9uQ291bnQiLCJkaXMiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwic3RhcnRVcGRhdGVDaGVjayIsImJpbmQiLCJjb3VudCIsIm5vdGlmaWNhdGlvbkNvdW50Iiwic2V0RXJyb3JTdGF0dXMiLCJlcnJvckRpZE9jY3VyIiwiY2FuU2VsZlVwZGF0ZSIsImxvY2FsU3RvcmFnZSIsInJlbW92ZUl0ZW0iLCJkaXNwYXRjaCIsIkFjdGlvbiIsIkNoZWNrVXBkYXRlcyIsInN0YXR1cyIsIkNoZWNraW5nIiwiaW5zdGFsbFVwZGF0ZSIsInNob3VsZFNob3dVcGRhdGUiLCJuZXdWZXJzaW9uIiwiTWF0cml4Q2xpZW50UGVnIiwidXNlclJlZ2lzdGVyZWRXaXRoaW5MYXN0SG91cnMiLCJ2ZXJzaW9uIiwiZGVmZXJVbnRpbCIsIkpTT04iLCJwYXJzZSIsImdldEl0ZW0iLCJEYXRlIiwibm93IiwiZSIsImRlZmVyVXBkYXRlIiwiZGF0ZSIsInNldEhvdXJzIiwic2V0SXRlbSIsInN0cmluZ2lmeSIsImdldFRpbWUiLCJzdXBwb3J0c05vdGlmaWNhdGlvbnMiLCJtYXlTZW5kTm90aWZpY2F0aW9ucyIsImxvdWROb3RpZmljYXRpb24iLCJldiIsInJvb20iLCJjbGVhck5vdGlmaWNhdGlvbiIsIm5vdGlmIiwiY2xvc2UiLCJzY3JlZW5DYXB0dXJlRXJyb3JTdHJpbmciLCJzdXBwb3J0c0F1dG9MYXVuY2giLCJnZXRBdXRvTGF1bmNoRW5hYmxlZCIsInNldEF1dG9MYXVuY2hFbmFibGVkIiwiZW5hYmxlZCIsIkVycm9yIiwic3VwcG9ydHNBdXRvSGlkZU1lbnVCYXIiLCJnZXRBdXRvSGlkZU1lbnVCYXJFbmFibGVkIiwic2V0QXV0b0hpZGVNZW51QmFyRW5hYmxlZCIsInN1cHBvcnRzTWluaW1pemVUb1RyYXkiLCJnZXRNaW5pbWl6ZVRvVHJheUVuYWJsZWQiLCJzZXRNaW5pbWl6ZVRvVHJheUVuYWJsZWQiLCJnZXRFdmVudEluZGV4aW5nTWFuYWdlciIsInNldExhbmd1YWdlIiwicHJlZmVycmVkTGFuZ3MiLCJnZXRTU09DYWxsYmFja1VybCIsImZyYWdtZW50QWZ0ZXJMb2dpbiIsInVybCIsIlVSTCIsIndpbmRvdyIsImxvY2F0aW9uIiwiaHJlZiIsImhhc2giLCJzdGFydFNpbmdsZVNpZ25PbiIsIm14Q2xpZW50IiwibG9naW5UeXBlIiwiaWRwSWQiLCJnZXRIb21lc2VydmVyVXJsIiwiZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJjYWxsYmFja1VybCIsImdldFNzb0xvZ2luVXJsIiwidG9TdHJpbmciLCJvbktleURvd24iLCJnZXRQaWNrbGVLZXkiLCJ1c2VySWQiLCJkZXZpY2VJZCIsImNyeXB0byIsInN1YnRsZSIsImRhdGEiLCJlbmNyeXB0ZWQiLCJpdiIsImNyeXB0b0tleSIsImNvbnNvbGUiLCJlcnJvciIsImFkZGl0aW9uYWxEYXRhIiwiVWludDhBcnJheSIsImxlbmd0aCIsImkiLCJjaGFyQ29kZUF0Iiwia2V5IiwiZGVjcnlwdCIsIm5hbWUiLCJjcmVhdGVQaWNrbGVLZXkiLCJyYW5kb21BcnJheSIsImdldFJhbmRvbVZhbHVlcyIsImdlbmVyYXRlS2V5IiwiZW5jcnlwdCIsImRlc3Ryb3lQaWNrbGVLZXkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUlBOztBQUNBOztBQUNBOztBQUNBOztBQTVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFhTyxNQUFNQSxzQkFB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QkEsQ0FBQyxHQUFHWixRQUFRLENBQUNXLE1BQTdCLEVBQXFDQyxDQUFDLEVBQXRDLEVBQTBDO0FBQ3RDSCxNQUFBQSxjQUFjLENBQUNWLE1BQU0sQ0FBQ1ksTUFBUCxHQUFnQixDQUFoQixHQUFvQkMsQ0FBckIsQ0FBZCxHQUF3Q1osUUFBUSxDQUFDYSxVQUFULENBQW9CRCxDQUFwQixDQUF4QztBQUNIOztBQUVELFVBQU1SLFNBQVMsR0FBRyxNQUFNSCxNQUFNLENBQUNDLE1BQVAsQ0FBY21CLE9BQWQsQ0FDcEI7QUFBQ0wsTUFBQUEsSUFBSSxFQUFFLFNBQVA7QUFBa0JYLE1BQUFBLEVBQWxCO0FBQXNCSSxNQUFBQTtBQUF0QixLQURvQixFQUNtQkgsU0FEbkIsRUFDOEJZLFdBRDlCLENBQXhCOztBQUlBLFFBQUk7QUFDQSxZQUFNLDZCQUFRLFdBQVIsRUFBcUIsQ0FBQ25CLE1BQUQsRUFBU0MsUUFBVCxDQUFyQixFQUF5QztBQUFDSSxRQUFBQSxTQUFEO0FBQVlDLFFBQUFBLEVBQVo7QUFBZ0JDLFFBQUFBO0FBQWhCLE9BQXpDLENBQU47QUFDSCxLQUZELENBRUUsT0FBT3hELENBQVAsRUFBVTtBQUNSLGFBQU8sSUFBUDtBQUNIOztBQUNELFdBQU8sa0NBQXFCb0UsV0FBckIsQ0FBUDtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0ksUUFBTUksZ0JBQU4sQ0FBdUJ2QjtBQUF2QjtBQUFBLElBQXVDQztBQUF2QztBQUFBO0FBQUE7QUFBd0U7QUFDcEUsUUFBSTtBQUNBLFlBQU0sK0JBQVUsV0FBVixFQUF1QixDQUFDRCxNQUFELEVBQVNDLFFBQVQsQ0FBdkIsQ0FBTjtBQUNILEtBRkQsQ0FFRSxPQUFPbEQsQ0FBUCxFQUFVLENBQUU7QUFDakI7O0FBN1RzQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBBdmlyYWwgRGFzZ3VwdGFcbkNvcHlyaWdodCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQge01hdHJpeENsaWVudH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuaW1wb3J0IHtlbmNvZGVVbnBhZGRlZEJhc2U2NH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by9vbG1saWJcIjtcbmltcG9ydCBkaXMgZnJvbSAnLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IEJhc2VFdmVudEluZGV4TWFuYWdlciBmcm9tICcuL2luZGV4aW5nL0Jhc2VFdmVudEluZGV4TWFuYWdlcic7XG5pbXBvcnQge0FjdGlvblBheWxvYWR9IGZyb20gXCIuL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCB7Q2hlY2tVcGRhdGVzUGF5bG9hZH0gZnJvbSBcIi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9DaGVja1VwZGF0ZXNQYXlsb2FkXCI7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSBcIi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQge2hpZGVUb2FzdCBhcyBoaWRlVXBkYXRlVG9hc3R9IGZyb20gXCIuL3RvYXN0cy9VcGRhdGVUb2FzdFwiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHtpZGJMb2FkLCBpZGJTYXZlLCBpZGJEZWxldGV9IGZyb20gXCIuL3V0aWxzL1N0b3JhZ2VNYW5hZ2VyXCI7XG5cbmV4cG9ydCBjb25zdCBTU09fSE9NRVNFUlZFUl9VUkxfS0VZID0gXCJteF9zc29faHNfdXJsXCI7XG5leHBvcnQgY29uc3QgU1NPX0lEX1NFUlZFUl9VUkxfS0VZID0gXCJteF9zc29faXNfdXJsXCI7XG5leHBvcnQgY29uc3QgU1NPX0lEUF9JRF9LRVkgPSBcIm14X3Nzb19pZHBfaWRcIjtcblxuZXhwb3J0IGVudW0gVXBkYXRlQ2hlY2tTdGF0dXMge1xuICAgIENoZWNraW5nID0gXCJDSEVDS0lOR1wiLFxuICAgIEVycm9yID0gXCJFUlJPUlwiLFxuICAgIE5vdEF2YWlsYWJsZSA9IFwiTk9UQVZBSUxBQkxFXCIsXG4gICAgRG93bmxvYWRpbmcgPSBcIkRPV05MT0FESU5HXCIsXG4gICAgUmVhZHkgPSBcIlJFQURZXCIsXG59XG5cbmNvbnN0IFVQREFURV9ERUZFUl9LRVkgPSBcIm14X2RlZmVyX3VwZGF0ZVwiO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGNsYXNzZXMgdGhhdCBwcm92aWRlIHBsYXRmb3JtLXNwZWNpZmljIGZ1bmN0aW9uYWxpdHlcbiAqIGVnLiBTZXR0aW5nIGFuIGFwcGxpY2F0aW9uIGJhZGdlIG9yIGRpc3BsYXlpbmcgbm90aWZpY2F0aW9uc1xuICpcbiAqIEluc3RhbmNlcyBvZiB0aGlzIGNsYXNzIGFyZSBwcm92aWRlZCBieSB0aGUgYXBwbGljYXRpb24uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIEJhc2VQbGF0Zm9ybSB7XG4gICAgcHJvdGVjdGVkIG5vdGlmaWNhdGlvbkNvdW50ID0gMDtcbiAgICBwcm90ZWN0ZWQgZXJyb3JEaWRPY2N1ciA9IGZhbHNlO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgdGhpcy5zdGFydFVwZGF0ZUNoZWNrID0gdGhpcy5zdGFydFVwZGF0ZUNoZWNrLmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgYWJzdHJhY3QgZ2V0Q29uZmlnKCk6IFByb21pc2U8e30+O1xuXG4gICAgYWJzdHJhY3QgZ2V0RGVmYXVsdERldmljZURpc3BsYXlOYW1lKCk6IHN0cmluZztcblxuICAgIHByb3RlY3RlZCBvbkFjdGlvbiA9IChwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKSA9PiB7XG4gICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ29uX2NsaWVudF9ub3RfdmlhYmxlJzpcbiAgICAgICAgICAgIGNhc2UgJ29uX2xvZ2dlZF9vdXQnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0Tm90aWZpY2F0aW9uQ291bnQoMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gVXNlZCBwcmltYXJpbHkgZm9yIEFuYWx5dGljc1xuICAgIGFic3RyYWN0IGdldEh1bWFuUmVhZGFibGVOYW1lKCk6IHN0cmluZztcblxuICAgIHNldE5vdGlmaWNhdGlvbkNvdW50KGNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5ub3RpZmljYXRpb25Db3VudCA9IGNvdW50O1xuICAgIH1cblxuICAgIHNldEVycm9yU3RhdHVzKGVycm9yRGlkT2NjdXI6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5lcnJvckRpZE9jY3VyID0gZXJyb3JEaWRPY2N1cjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHdlIGNhbiBjYWxsIGNoZWNrRm9yVXBkYXRlIG9uIHRoaXMgcGxhdGZvcm0gYnVpbGRcbiAgICAgKi9cbiAgICBhc3luYyBjYW5TZWxmVXBkYXRlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgc3RhcnRVcGRhdGVDaGVjaygpIHtcbiAgICAgICAgaGlkZVVwZGF0ZVRvYXN0KCk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFVQREFURV9ERUZFUl9LRVkpO1xuICAgICAgICBkaXMuZGlzcGF0Y2g8Q2hlY2tVcGRhdGVzUGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uQ2hlY2tVcGRhdGVzLFxuICAgICAgICAgICAgc3RhdHVzOiBVcGRhdGVDaGVja1N0YXR1cy5DaGVja2luZyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHRoZSBjdXJyZW50bHkgcnVubmluZyBhcHAgdG8gdGhlIGxhdGVzdCBhdmFpbGFibGUgdmVyc2lvblxuICAgICAqIGFuZCByZXBsYWNlIHRoaXMgaW5zdGFuY2Ugb2YgdGhlIGFwcCB3aXRoIHRoZSBuZXcgdmVyc2lvbi5cbiAgICAgKi9cbiAgICBpbnN0YWxsVXBkYXRlKCkge1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSB2ZXJzaW9uIHVwZGF0ZSBoYXMgYmVlbiBkZWZlcnJlZCBhbmQgdGhhdCBkZWZlcm1lbnQgaXMgc3RpbGwgaW4gZWZmZWN0XG4gICAgICogQHBhcmFtIG5ld1ZlcnNpb24gdGhlIHZlcnNpb24gc3RyaW5nIHRvIGNoZWNrXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHNob3VsZFNob3dVcGRhdGUobmV3VmVyc2lvbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIElmIHRoZSB1c2VyIHJlZ2lzdGVyZWQgb24gdGhpcyBjbGllbnQgaW4gdGhlIGxhc3QgMjQgaG91cnMgdGhlbiBkbyBub3Qgc2hvdyB0aGVtIHRoZSB1cGRhdGUgdG9hc3RcbiAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy51c2VyUmVnaXN0ZXJlZFdpdGhpbkxhc3RIb3VycygyNCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgW3ZlcnNpb24sIGRlZmVyVW50aWxdID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShVUERBVEVfREVGRVJfS0VZKSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3VmVyc2lvbiAhPT0gdmVyc2lvbiB8fCBEYXRlLm5vdygpID4gZGVmZXJVbnRpbDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZ25vcmUgdGhlIHBlbmRpbmcgdXBkYXRlIGFuZCBkb24ndCBwcm9tcHQgYWJvdXQgdGhpcyB2ZXJzaW9uXG4gICAgICogdW50aWwgdGhlIG5leHQgbW9ybmluZyAoOGFtKS5cbiAgICAgKi9cbiAgICBkZWZlclVwZGF0ZShuZXdWZXJzaW9uOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKERhdGUubm93KCkgKyAyNCAqIDYwICogNjAgKiAxMDAwKTtcbiAgICAgICAgZGF0ZS5zZXRIb3Vycyg4LCAwLCAwLCAwKTsgLy8gc2V0IHRvIG5leHQgOGFtXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFVQREFURV9ERUZFUl9LRVksIEpTT04uc3RyaW5naWZ5KFtuZXdWZXJzaW9uLCBkYXRlLmdldFRpbWUoKV0pKTtcbiAgICAgICAgaGlkZVVwZGF0ZVRvYXN0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBwbGF0Zm9ybSBzdXBwb3J0cyBkaXNwbGF5aW5nXG4gICAgICogbm90aWZpY2F0aW9ucywgb3RoZXJ3aXNlIGZhbHNlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB3aGV0aGVyIHRoZSBwbGF0Zm9ybSBzdXBwb3J0cyBkaXNwbGF5aW5nIG5vdGlmaWNhdGlvbnNcbiAgICAgKi9cbiAgICBzdXBwb3J0c05vdGlmaWNhdGlvbnMoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGFwcGxpY2F0aW9uIGN1cnJlbnRseSBoYXMgcGVybWlzc2lvblxuICAgICAqIHRvIGRpc3BsYXkgbm90aWZpY2F0aW9ucy4gT3RoZXJ3aXNlIGZhbHNlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB3aGV0aGVyIHRoZSBhcHBsaWNhdGlvbiBoYXMgcGVybWlzc2lvbiB0byBkaXNwbGF5IG5vdGlmaWNhdGlvbnNcbiAgICAgKi9cbiAgICBtYXlTZW5kTm90aWZpY2F0aW9ucygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3RzIHBlcm1pc3Npb24gdG8gc2VuZCBub3RpZmljYXRpb25zLiBSZXR1cm5zXG4gICAgICogYSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgdXNlciBoYXMgcmVzcG9uZGVkXG4gICAgICogdG8gdGhlIHJlcXVlc3QuIFRoZSBwcm9taXNlIGhhcyBhIHNpbmdsZSBzdHJpbmcgYXJndW1lbnRcbiAgICAgKiB0aGF0IGlzICdncmFudGVkJyBpZiB0aGUgdXNlciBhbGxvd2VkIHRoZSByZXF1ZXN0IG9yXG4gICAgICogJ2RlbmllZCcgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGFic3RyYWN0IHJlcXVlc3ROb3RpZmljYXRpb25QZXJtaXNzaW9uKCk6IFByb21pc2U8c3RyaW5nPjtcblxuICAgIGFic3RyYWN0IGRpc3BsYXlOb3RpZmljYXRpb24odGl0bGU6IHN0cmluZywgbXNnOiBzdHJpbmcsIGF2YXRhclVybDogc3RyaW5nLCByb29tOiBPYmplY3QpO1xuXG4gICAgbG91ZE5vdGlmaWNhdGlvbihldjogRXZlbnQsIHJvb206IE9iamVjdCkge1xuICAgIH1cblxuICAgIGNsZWFyTm90aWZpY2F0aW9uKG5vdGlmOiBOb3RpZmljYXRpb24pIHtcbiAgICAgICAgLy8gU29tZSBicm93c2VycyBkb24ndCBzdXBwb3J0IHRoaXMsIGUuZyBTYWZhcmkgb24gaU9TXG4gICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ob3RpZmljYXRpb24vY2xvc2VcbiAgICAgICAgaWYgKG5vdGlmLmNsb3NlKSB7XG4gICAgICAgICAgICBub3RpZi5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgdmVyc2lvbiBvZiB0aGUgYXBwbGljYXRpb24uXG4gICAgICovXG4gICAgYWJzdHJhY3QgZ2V0QXBwVmVyc2lvbigpOiBQcm9taXNlPHN0cmluZz47XG5cbiAgICAvKlxuICAgICAqIElmIGl0J3Mgbm90IGV4cGVjdGVkIHRoYXQgY2FwdHVyaW5nIHRoZSBzY3JlZW4gd2lsbCB3b3JrXG4gICAgICogd2l0aCBnZXRVc2VyTWVkaWEsIHJldHVybiBhIHN0cmluZyBleHBsYWluaW5nIHdoeSBub3QuXG4gICAgICogT3RoZXJ3aXNlLCByZXR1cm4gbnVsbC5cbiAgICAgKi9cbiAgICBzY3JlZW5DYXB0dXJlRXJyb3JTdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiTm90IGltcGxlbWVudGVkXCI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzdGFydHMgdGhlIGFwcGxpY2F0aW9uLCB3aXRob3V0IG5lY2Nlc3NhcmlseSByZWxvYWRpbmdcbiAgICAgKiBhbnkgYXBwbGljYXRpb24gY29kZVxuICAgICAqL1xuICAgIGFic3RyYWN0IHJlbG9hZCgpO1xuXG4gICAgc3VwcG9ydHNBdXRvTGF1bmNoKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gWFhYOiBTdXJlbHkgdGhpcyBzaG91bGQgYmUgYSBzZXR0aW5nIGxpa2UgYW55IG90aGVyP1xuICAgIGFzeW5jIGdldEF1dG9MYXVuY2hFbmFibGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgYXN5bmMgc2V0QXV0b0xhdW5jaEVuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIHN1cHBvcnRzQXV0b0hpZGVNZW51QmFyKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgYXN5bmMgZ2V0QXV0b0hpZGVNZW51QmFyRW5hYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGFzeW5jIHNldEF1dG9IaWRlTWVudUJhckVuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIHN1cHBvcnRzTWluaW1pemVUb1RyYXkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBhc3luYyBnZXRNaW5pbWl6ZVRvVHJheUVuYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBhc3luYyBzZXRNaW5pbWl6ZVRvVHJheUVuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBvdXIgcGxhdGZvcm0gc3BlY2lmaWMgRXZlbnRJbmRleE1hbmFnZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtCYXNlRXZlbnRJbmRleE1hbmFnZXJ9IFRoZSBFdmVudEluZGV4IG1hbmFnZXIgZm9yIG91ciBwbGF0Zm9ybSxcbiAgICAgKiBjYW4gYmUgbnVsbCBpZiB0aGUgcGxhdGZvcm0gZG9lc24ndCBzdXBwb3J0IGV2ZW50IGluZGV4aW5nLlxuICAgICAqL1xuICAgIGdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyKCk6IEJhc2VFdmVudEluZGV4TWFuYWdlciB8IG51bGwge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBzZXRMYW5ndWFnZShwcmVmZXJyZWRMYW5nczogc3RyaW5nW10pIHt9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0U1NPQ2FsbGJhY2tVcmwoZnJhZ21lbnRBZnRlckxvZ2luOiBzdHJpbmcpOiBVUkwge1xuICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbiAgICAgICAgdXJsLmhhc2ggPSBmcmFnbWVudEFmdGVyTG9naW4gfHwgXCJcIjtcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCZWdpbiBTaW5nbGUgU2lnbiBPbiBmbG93cy5cbiAgICAgKiBAcGFyYW0ge01hdHJpeENsaWVudH0gbXhDbGllbnQgdGhlIG1hdHJpeCBjbGllbnQgdXNpbmcgd2hpY2ggd2Ugc2hvdWxkIHN0YXJ0IHRoZSBmbG93XG4gICAgICogQHBhcmFtIHtcInNzb1wifFwiY2FzXCJ9IGxvZ2luVHlwZSB0aGUgdHlwZSBvZiBTU08gaXQgaXMsIENBUy9TU08uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZyYWdtZW50QWZ0ZXJMb2dpbiB0aGUgaGFzaCB0byBwYXNzIHRvIHRoZSBhcHAgZHVyaW5nIHNzbyBjYWxsYmFjay5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWRwSWQgVGhlIElEIG9mIHRoZSBJZGVudGl0eSBQcm92aWRlciBiZWluZyB0YXJnZXRlZCwgb3B0aW9uYWwuXG4gICAgICovXG4gICAgc3RhcnRTaW5nbGVTaWduT24obXhDbGllbnQ6IE1hdHJpeENsaWVudCwgbG9naW5UeXBlOiBcInNzb1wiIHwgXCJjYXNcIiwgZnJhZ21lbnRBZnRlckxvZ2luOiBzdHJpbmcsIGlkcElkPzogc3RyaW5nKSB7XG4gICAgICAgIC8vIHBlcnNpc3QgaHMgdXJsIGFuZCBpcyB1cmwgZm9yIHdoZW4gdGhlIHVzZXIgaXMgcmV0dXJuZWQgdG8gdGhlIGFwcCB3aXRoIHRoZSBsb2dpbiB0b2tlblxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShTU09fSE9NRVNFUlZFUl9VUkxfS0VZLCBteENsaWVudC5nZXRIb21lc2VydmVyVXJsKCkpO1xuICAgICAgICBpZiAobXhDbGllbnQuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSkge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oU1NPX0lEX1NFUlZFUl9VUkxfS0VZLCBteENsaWVudC5nZXRJZGVudGl0eVNlcnZlclVybCgpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaWRwSWQpIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFNTT19JRFBfSURfS0VZLCBpZHBJZCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2FsbGJhY2tVcmwgPSB0aGlzLmdldFNTT0NhbGxiYWNrVXJsKGZyYWdtZW50QWZ0ZXJMb2dpbik7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gbXhDbGllbnQuZ2V0U3NvTG9naW5VcmwoY2FsbGJhY2tVcmwudG9TdHJpbmcoKSwgbG9naW5UeXBlLCBpZHBJZCk7IC8vIHJlZGlyZWN0IHRvIFNTT1xuICAgIH1cblxuICAgIG9uS2V5RG93bihldjogS2V5Ym9hcmRFdmVudCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIG5vIHNob3J0Y3V0cyBpbXBsZW1lbnRlZFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhIHByZXZpb3VzbHkgc3RvcmVkIHBpY2tsZSBrZXkuICBUaGUgcGlja2xlIGtleSBpcyB1c2VkIGZvclxuICAgICAqIGVuY3J5cHRpbmcgbGlib2xtIG9iamVjdHMuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXJJZCB0aGUgdXNlciBJRCBmb3IgdGhlIHVzZXIgdGhhdCB0aGUgcGlja2xlIGtleSBpcyBmb3IuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXJJZCB0aGUgZGV2aWNlIElEIHRoYXQgdGhlIHBpY2tsZSBrZXkgaXMgZm9yLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd8bnVsbH0gdGhlIHByZXZpb3VzbHkgc3RvcmVkIHBpY2tsZSBrZXksIG9yIG51bGwgaWYgbm9cbiAgICAgKiAgICAgcGlja2xlIGtleSBoYXMgYmVlbiBzdG9yZWQuXG4gICAgICovXG4gICAgYXN5bmMgZ2V0UGlja2xlS2V5KHVzZXJJZDogc3RyaW5nLCBkZXZpY2VJZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgICAgIGlmICghd2luZG93LmNyeXB0byB8fCAhd2luZG93LmNyeXB0by5zdWJ0bGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxldCBkYXRhO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZGF0YSA9IGF3YWl0IGlkYkxvYWQoXCJwaWNrbGVLZXlcIiwgW3VzZXJJZCwgZGV2aWNlSWRdKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRhdGEuZW5jcnlwdGVkIHx8ICFkYXRhLml2IHx8ICFkYXRhLmNyeXB0b0tleSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkJhZGx5IGZvcm1hdHRlZCBwaWNrbGUga2V5XCIpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhZGRpdGlvbmFsRGF0YSA9IG5ldyBVaW50OEFycmF5KHVzZXJJZC5sZW5ndGggKyBkZXZpY2VJZC5sZW5ndGggKyAxKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1c2VySWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFkZGl0aW9uYWxEYXRhW2ldID0gdXNlcklkLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIH1cbiAgICAgICAgYWRkaXRpb25hbERhdGFbdXNlcklkLmxlbmd0aF0gPSAxMjQ7IC8vIFwifFwiXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGV2aWNlSWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFkZGl0aW9uYWxEYXRhW3VzZXJJZC5sZW5ndGggKyAxICsgaV0gPSBkZXZpY2VJZC5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgICAgICAgICB7bmFtZTogXCJBRVMtR0NNXCIsIGl2OiBkYXRhLml2LCBhZGRpdGlvbmFsRGF0YX0sIGRhdGEuY3J5cHRvS2V5LFxuICAgICAgICAgICAgICAgIGRhdGEuZW5jcnlwdGVkLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiBlbmNvZGVVbnBhZGRlZEJhc2U2NChrZXkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZGVjcnlwdGluZyBwaWNrbGUga2V5XCIpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYW5kIHN0b3JlIGEgcGlja2xlIGtleSBmb3IgZW5jcnlwdGluZyBsaWJvbG0gb2JqZWN0cy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXNlcklkIHRoZSB1c2VyIElEIGZvciB0aGUgdXNlciB0aGF0IHRoZSBwaWNrbGUga2V5IGlzIGZvci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXNlcklkIHRoZSBkZXZpY2UgSUQgdGhhdCB0aGUgcGlja2xlIGtleSBpcyBmb3IuXG4gICAgICogQHJldHVybnMge3N0cmluZ3xudWxsfSB0aGUgcGlja2xlIGtleSwgb3IgbnVsbCBpZiB0aGUgcGxhdGZvcm0gZG9lcyBub3RcbiAgICAgKiAgICAgc3VwcG9ydCBzdG9yaW5nIHBpY2tsZSBrZXlzLlxuICAgICAqL1xuICAgIGFzeW5jIGNyZWF0ZVBpY2tsZUtleSh1c2VySWQ6IHN0cmluZywgZGV2aWNlSWQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgICAgICBpZiAoIXdpbmRvdy5jcnlwdG8gfHwgIXdpbmRvdy5jcnlwdG8uc3VidGxlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjcnlwdG8gPSB3aW5kb3cuY3J5cHRvO1xuICAgICAgICBjb25zdCByYW5kb21BcnJheSA9IG5ldyBVaW50OEFycmF5KDMyKTtcbiAgICAgICAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhyYW5kb21BcnJheSk7XG4gICAgICAgIGNvbnN0IGNyeXB0b0tleSA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZ2VuZXJhdGVLZXkoXG4gICAgICAgICAgICB7bmFtZTogXCJBRVMtR0NNXCIsIGxlbmd0aDogMjU2fSwgZmFsc2UsIFtcImVuY3J5cHRcIiwgXCJkZWNyeXB0XCJdLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBpdiA9IG5ldyBVaW50OEFycmF5KDMyKTtcbiAgICAgICAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhpdik7XG5cbiAgICAgICAgY29uc3QgYWRkaXRpb25hbERhdGEgPSBuZXcgVWludDhBcnJheSh1c2VySWQubGVuZ3RoICsgZGV2aWNlSWQubGVuZ3RoICsgMSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdXNlcklkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhZGRpdGlvbmFsRGF0YVtpXSA9IHVzZXJJZC5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB9XG4gICAgICAgIGFkZGl0aW9uYWxEYXRhW3VzZXJJZC5sZW5ndGhdID0gMTI0OyAvLyBcInxcIlxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRldmljZUlkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhZGRpdGlvbmFsRGF0YVt1c2VySWQubGVuZ3RoICsgMSArIGldID0gZGV2aWNlSWQuY2hhckNvZGVBdChpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVuY3J5cHRlZCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgICAgIHtuYW1lOiBcIkFFUy1HQ01cIiwgaXYsIGFkZGl0aW9uYWxEYXRhfSwgY3J5cHRvS2V5LCByYW5kb21BcnJheSxcbiAgICAgICAgKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgaWRiU2F2ZShcInBpY2tsZUtleVwiLCBbdXNlcklkLCBkZXZpY2VJZF0sIHtlbmNyeXB0ZWQsIGl2LCBjcnlwdG9LZXl9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVuY29kZVVucGFkZGVkQmFzZTY0KHJhbmRvbUFycmF5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWxldGUgYSBwcmV2aW91c2x5IHN0b3JlZCBwaWNrbGUga2V5IGZyb20gc3RvcmFnZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXNlcklkIHRoZSB1c2VyIElEIGZvciB0aGUgdXNlciB0aGF0IHRoZSBwaWNrbGUga2V5IGlzIGZvci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXNlcklkIHRoZSBkZXZpY2UgSUQgdGhhdCB0aGUgcGlja2xlIGtleSBpcyBmb3IuXG4gICAgICovXG4gICAgYXN5bmMgZGVzdHJveVBpY2tsZUtleSh1c2VySWQ6IHN0cmluZywgZGV2aWNlSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgaWRiRGVsZXRlKFwicGlja2xlS2V5XCIsIFt1c2VySWQsIGRldmljZUlkXSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgfVxufVxuIl19