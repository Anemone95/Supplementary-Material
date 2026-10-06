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
   * Return true if platform supports multi-language
   * spell-checking, otherwise false.
   */


  supportsMultiLanguageSpellCheck()
  /*: boolean*/
  {
    return false;
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

  supportsWarnBeforeExit()
  /*: boolean*/
  {
    return false;
  }

  async shouldWarnBeforeExit()
  /*: Promise<boolean>*/
  {
    return false;
  }

  async setWarnBeforeExit(enabled
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

  async setLanguage(preferredLangs
  /*: string[]*/
  ) {}

  setSpellCheckLanguages(preferredLangs
  /*: string[]*/
  ) {}

  getSpellCheckLanguages()
  /*: Promise<string[]> | null*/
  {
    return null;
  }

  getAvailableSpellCheckLanguages()
  /*: Promise<string[]> | null*/
  {
    return null;
  }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9CYXNlUGxhdGZvcm0udHMiXSwibmFtZXMiOlsiU1NPX0hPTUVTRVJWRVJfVVJMX0tFWSIsIlNTT19JRF9TRVJWRVJfVVJMX0tFWSIsIlNTT19JRFBfSURfS0VZIiwiVXBkYXRlQ2hlY2tTdGF0dXMiLCJVUERBVEVfREVGRVJfS0VZIiwiQmFzZVBsYXRmb3JtIiwiY29uc3RydWN0b3IiLCJwYXlsb2FkIiwiYWN0aW9uIiwic2V0Tm90aWZpY2F0aW9uQ291bnQiLCJkaXMiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwic3RhcnRVcGRhdGVDaGVjayIsImJpbmQiLCJjb3VudCIsIm5vdGlmaWNhdGlvbkNvdW50Iiwic2V0RXJyb3JTdGF0dXMiLCJlcnJvckRpZE9jY3VyIiwiY2FuU2VsZlVwZGF0ZSIsImxvY2FsU3RvcmFnZSIsInJlbW92ZUl0ZW0iLCJkaXNwYXRjaCIsIkFjdGlvbiIsIkNoZWNrVXBkYXRlcyIsInN0YXR1cyIsIkNoZWNraW5nIiwiaW5zdGFsbFVwZGF0ZSIsInNob3VsZFNob3dVcGRhdGUiLCJuZXdWZXJzaW9uIiwiTWF0cml4Q2xpZW50UGVnIiwidXNlclJlZ2lzdGVyZWRXaXRoaW5MYXN0SG91cnMiLCJ2ZXJzaW9uIiwiZGVmZXJVbnRpbCIsIkpTT04iLCJwYXJzZSIsImdldEl0ZW0iLCJEYXRlIiwibm93IiwiZSIsImRlZmVyVXBkYXRlIiwiZGF0ZSIsInNldEhvdXJzIiwic2V0SXRlbSIsInN0cmluZ2lmeSIsImdldFRpbWUiLCJzdXBwb3J0c011bHRpTGFuZ3VhZ2VTcGVsbENoZWNrIiwic3VwcG9ydHNOb3RpZmljYXRpb25zIiwibWF5U2VuZE5vdGlmaWNhdGlvbnMiLCJsb3VkTm90aWZpY2F0aW9uIiwiZXYiLCJyb29tIiwiY2xlYXJOb3RpZmljYXRpb24iLCJub3RpZiIsImNsb3NlIiwic2NyZWVuQ2FwdHVyZUVycm9yU3RyaW5nIiwic3VwcG9ydHNBdXRvTGF1bmNoIiwiZ2V0QXV0b0xhdW5jaEVuYWJsZWQiLCJzZXRBdXRvTGF1bmNoRW5hYmxlZCIsImVuYWJsZWQiLCJFcnJvciIsInN1cHBvcnRzV2FybkJlZm9yZUV4aXQiLCJzaG91bGRXYXJuQmVmb3JlRXhpdCIsInNldFdhcm5CZWZvcmVFeGl0Iiwic3VwcG9ydHNBdXRvSGlkZU1lbnVCYXIiLCJnZXRBdXRvSGlkZU1lbnVCYXJFbmFibGVkIiwic2V0QXV0b0hpZGVNZW51QmFyRW5hYmxlZCIsInN1cHBvcnRzTWluaW1pemVUb1RyYXkiLCJnZXRNaW5pbWl6ZVRvVHJheUVuYWJsZWQiLCJzZXRNaW5pbWl6ZVRvVHJheUVuYWJsZWQiLCJnZXRFdmVudEluZGV4aW5nTWFuYWdlciIsInNldExhbmd1YWdlIiwicHJlZmVycmVkTGFuZ3MiLCJzZXRTcGVsbENoZWNrTGFuZ3VhZ2VzIiwiZ2V0U3BlbGxDaGVja0xhbmd1YWdlcyIsImdldEF2YWlsYWJsZVNwZWxsQ2hlY2tMYW5ndWFnZXMiLCJnZXRTU09DYWxsYmFja1VybCIsImZyYWdtZW50QWZ0ZXJMb2dpbiIsInVybCIsIlVSTCIsIndpbmRvdyIsImxvY2F0aW9uIiwiaHJlZiIsImhhc2giLCJzdGFydFNpbmdsZVNpZ25PbiIsIm14Q2xpZW50IiwibG9naW5UeXBlIiwiaWRwSWQiLCJnZXRIb21lc2VydmVyVXJsIiwiZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJjYWxsYmFja1VybCIsImdldFNzb0xvZ2luVXJsIiwidG9TdHJpbmciLCJvbktleURvd24iLCJnZXRQaWNrbGVLZXkiLCJ1c2VySWQiLCJkZXZpY2VJZCIsImNyeXB0byIsInN1YnRsZSIsImRhdGEiLCJlbmNyeXB0ZWQiLCJpdiIsImNyeXB0b0tleSIsImNvbnNvbGUiLCJlcnJvciIsImFkZGl0aW9uYWxEYXRhIiwiVWludDhBcnJheSIsImxlbmd0aCIsImkiLCJjaGFyQ29kZUF0Iiwia2V5IiwiZGVjcnlwdCIsIm5hbWUiLCJjcmVhdGVQaWNrbGVLZXkiLCJyYW5kb21BcnJheSIsImdldFJhbmRvbVZhbHVlcyIsImdlbmVyYXRlS2V5IiwiZW5jcnlwdCIs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S0FEb0IsRUFDbUJILFNBRG5CLEVBQzhCWSxXQUQ5QixDQUF4Qjs7QUFJQSxRQUFJO0FBQ0EsWUFBTSw2QkFBUSxXQUFSLEVBQXFCLENBQUNuQixNQUFELEVBQVNDLFFBQVQsQ0FBckIsRUFBeUM7QUFBQ0ksUUFBQUEsU0FBRDtBQUFZQyxRQUFBQSxFQUFaO0FBQWdCQyxRQUFBQTtBQUFoQixPQUF6QyxDQUFOO0FBQ0gsS0FGRCxDQUVFLE9BQU8vRCxDQUFQLEVBQVU7QUFDUixhQUFPLElBQVA7QUFDSDs7QUFDRCxXQUFPLGtDQUFxQjJFLFdBQXJCLENBQVA7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7OztBQUNJLFFBQU1JLGdCQUFOLENBQXVCdkI7QUFBdkI7QUFBQSxJQUF1Q0M7QUFBdkM7QUFBQTtBQUFBO0FBQXdFO0FBQ3BFLFFBQUk7QUFDQSxZQUFNLCtCQUFVLFdBQVYsRUFBdUIsQ0FBQ0QsTUFBRCxFQUFTQyxRQUFULENBQXZCLENBQU47QUFDSCxLQUZELENBRUUsT0FBT3pELENBQVAsRUFBVSxDQUFFO0FBQ2pCOztBQTNWc0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYgQXZpcmFsIERhc2d1cHRhXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHtNYXRyaXhDbGllbnR9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcbmltcG9ydCB7ZW5jb2RlVW5wYWRkZWRCYXNlNjR9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vb2xtbGliXCI7XG5pbXBvcnQgZGlzIGZyb20gJy4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCBCYXNlRXZlbnRJbmRleE1hbmFnZXIgZnJvbSAnLi9pbmRleGluZy9CYXNlRXZlbnRJbmRleE1hbmFnZXInO1xuaW1wb3J0IHtBY3Rpb25QYXlsb2FkfSBmcm9tIFwiLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQge0NoZWNrVXBkYXRlc1BheWxvYWR9IGZyb20gXCIuL2Rpc3BhdGNoZXIvcGF5bG9hZHMvQ2hlY2tVcGRhdGVzUGF5bG9hZFwiO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gXCIuL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHtoaWRlVG9hc3QgYXMgaGlkZVVwZGF0ZVRvYXN0fSBmcm9tIFwiLi90b2FzdHMvVXBkYXRlVG9hc3RcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCB7aWRiTG9hZCwgaWRiU2F2ZSwgaWRiRGVsZXRlfSBmcm9tIFwiLi91dGlscy9TdG9yYWdlTWFuYWdlclwiO1xuXG5leHBvcnQgY29uc3QgU1NPX0hPTUVTRVJWRVJfVVJMX0tFWSA9IFwibXhfc3NvX2hzX3VybFwiO1xuZXhwb3J0IGNvbnN0IFNTT19JRF9TRVJWRVJfVVJMX0tFWSA9IFwibXhfc3NvX2lzX3VybFwiO1xuZXhwb3J0IGNvbnN0IFNTT19JRFBfSURfS0VZID0gXCJteF9zc29faWRwX2lkXCI7XG5cbmV4cG9ydCBlbnVtIFVwZGF0ZUNoZWNrU3RhdHVzIHtcbiAgICBDaGVja2luZyA9IFwiQ0hFQ0tJTkdcIixcbiAgICBFcnJvciA9IFwiRVJST1JcIixcbiAgICBOb3RBdmFpbGFibGUgPSBcIk5PVEFWQUlMQUJMRVwiLFxuICAgIERvd25sb2FkaW5nID0gXCJET1dOTE9BRElOR1wiLFxuICAgIFJlYWR5ID0gXCJSRUFEWVwiLFxufVxuXG5jb25zdCBVUERBVEVfREVGRVJfS0VZID0gXCJteF9kZWZlcl91cGRhdGVcIjtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBjbGFzc2VzIHRoYXQgcHJvdmlkZSBwbGF0Zm9ybS1zcGVjaWZpYyBmdW5jdGlvbmFsaXR5XG4gKiBlZy4gU2V0dGluZyBhbiBhcHBsaWNhdGlvbiBiYWRnZSBvciBkaXNwbGF5aW5nIG5vdGlmaWNhdGlvbnNcbiAqXG4gKiBJbnN0YW5jZXMgb2YgdGhpcyBjbGFzcyBhcmUgcHJvdmlkZWQgYnkgdGhlIGFwcGxpY2F0aW9uLlxuICovXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBCYXNlUGxhdGZvcm0ge1xuICAgIHByb3RlY3RlZCBub3RpZmljYXRpb25Db3VudCA9IDA7XG4gICAgcHJvdGVjdGVkIGVycm9yRGlkT2NjdXIgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBkaXMucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAgIHRoaXMuc3RhcnRVcGRhdGVDaGVjayA9IHRoaXMuc3RhcnRVcGRhdGVDaGVjay5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIGFic3RyYWN0IGdldENvbmZpZygpOiBQcm9taXNlPHt9PjtcblxuICAgIGFic3RyYWN0IGdldERlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSgpOiBzdHJpbmc7XG5cbiAgICBwcm90ZWN0ZWQgb25BY3Rpb24gPSAocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICdvbl9jbGllbnRfbm90X3ZpYWJsZSc6XG4gICAgICAgICAgICBjYXNlICdvbl9sb2dnZWRfb3V0JzpcbiAgICAgICAgICAgICAgICB0aGlzLnNldE5vdGlmaWNhdGlvbkNvdW50KDApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFVzZWQgcHJpbWFyaWx5IGZvciBBbmFseXRpY3NcbiAgICBhYnN0cmFjdCBnZXRIdW1hblJlYWRhYmxlTmFtZSgpOiBzdHJpbmc7XG5cbiAgICBzZXROb3RpZmljYXRpb25Db3VudChjb3VudDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMubm90aWZpY2F0aW9uQ291bnQgPSBjb3VudDtcbiAgICB9XG5cbiAgICBzZXRFcnJvclN0YXR1cyhlcnJvckRpZE9jY3VyOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuZXJyb3JEaWRPY2N1ciA9IGVycm9yRGlkT2NjdXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB3ZSBjYW4gY2FsbCBjaGVja0ZvclVwZGF0ZSBvbiB0aGlzIHBsYXRmb3JtIGJ1aWxkXG4gICAgICovXG4gICAgYXN5bmMgY2FuU2VsZlVwZGF0ZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHN0YXJ0VXBkYXRlQ2hlY2soKSB7XG4gICAgICAgIGhpZGVVcGRhdGVUb2FzdCgpO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShVUERBVEVfREVGRVJfS0VZKTtcbiAgICAgICAgZGlzLmRpc3BhdGNoPENoZWNrVXBkYXRlc1BheWxvYWQ+KHtcbiAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLkNoZWNrVXBkYXRlcyxcbiAgICAgICAgICAgIHN0YXR1czogVXBkYXRlQ2hlY2tTdGF0dXMuQ2hlY2tpbmcsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSB0aGUgY3VycmVudGx5IHJ1bm5pbmcgYXBwIHRvIHRoZSBsYXRlc3QgYXZhaWxhYmxlIHZlcnNpb25cbiAgICAgKiBhbmQgcmVwbGFjZSB0aGlzIGluc3RhbmNlIG9mIHRoZSBhcHAgd2l0aCB0aGUgbmV3IHZlcnNpb24uXG4gICAgICovXG4gICAgaW5zdGFsbFVwZGF0ZSgpIHtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgdmVyc2lvbiB1cGRhdGUgaGFzIGJlZW4gZGVmZXJyZWQgYW5kIHRoYXQgZGVmZXJtZW50IGlzIHN0aWxsIGluIGVmZmVjdFxuICAgICAqIEBwYXJhbSBuZXdWZXJzaW9uIHRoZSB2ZXJzaW9uIHN0cmluZyB0byBjaGVja1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBzaG91bGRTaG93VXBkYXRlKG5ld1ZlcnNpb246IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICAvLyBJZiB0aGUgdXNlciByZWdpc3RlcmVkIG9uIHRoaXMgY2xpZW50IGluIHRoZSBsYXN0IDI0IGhvdXJzIHRoZW4gZG8gbm90IHNob3cgdGhlbSB0aGUgdXBkYXRlIHRvYXN0XG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcudXNlclJlZ2lzdGVyZWRXaXRoaW5MYXN0SG91cnMoMjQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IFt2ZXJzaW9uLCBkZWZlclVudGlsXSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oVVBEQVRFX0RFRkVSX0tFWSkpO1xuICAgICAgICAgICAgcmV0dXJuIG5ld1ZlcnNpb24gIT09IHZlcnNpb24gfHwgRGF0ZS5ub3coKSA+IGRlZmVyVW50aWw7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSWdub3JlIHRoZSBwZW5kaW5nIHVwZGF0ZSBhbmQgZG9uJ3QgcHJvbXB0IGFib3V0IHRoaXMgdmVyc2lvblxuICAgICAqIHVudGlsIHRoZSBuZXh0IG1vcm5pbmcgKDhhbSkuXG4gICAgICovXG4gICAgZGVmZXJVcGRhdGUobmV3VmVyc2lvbjogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShEYXRlLm5vdygpICsgMjQgKiA2MCAqIDYwICogMTAwMCk7XG4gICAgICAgIGRhdGUuc2V0SG91cnMoOCwgMCwgMCwgMCk7IC8vIHNldCB0byBuZXh0IDhhbVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShVUERBVEVfREVGRVJfS0VZLCBKU09OLnN0cmluZ2lmeShbbmV3VmVyc2lvbiwgZGF0ZS5nZXRUaW1lKCldKSk7XG4gICAgICAgIGhpZGVVcGRhdGVUb2FzdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0cnVlIGlmIHBsYXRmb3JtIHN1cHBvcnRzIG11bHRpLWxhbmd1YWdlXG4gICAgICogc3BlbGwtY2hlY2tpbmcsIG90aGVyd2lzZSBmYWxzZS5cbiAgICAgKi9cbiAgICBzdXBwb3J0c011bHRpTGFuZ3VhZ2VTcGVsbENoZWNrKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBwbGF0Zm9ybSBzdXBwb3J0cyBkaXNwbGF5aW5nXG4gICAgICogbm90aWZpY2F0aW9ucywgb3RoZXJ3aXNlIGZhbHNlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB3aGV0aGVyIHRoZSBwbGF0Zm9ybSBzdXBwb3J0cyBkaXNwbGF5aW5nIG5vdGlmaWNhdGlvbnNcbiAgICAgKi9cbiAgICBzdXBwb3J0c05vdGlmaWNhdGlvbnMoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGFwcGxpY2F0aW9uIGN1cnJlbnRseSBoYXMgcGVybWlzc2lvblxuICAgICAqIHRvIGRpc3BsYXkgbm90aWZpY2F0aW9ucy4gT3RoZXJ3aXNlIGZhbHNlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB3aGV0aGVyIHRoZSBhcHBsaWNhdGlvbiBoYXMgcGVybWlzc2lvbiB0byBkaXNwbGF5IG5vdGlmaWNhdGlvbnNcbiAgICAgKi9cbiAgICBtYXlTZW5kTm90aWZpY2F0aW9ucygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3RzIHBlcm1pc3Npb24gdG8gc2VuZCBub3RpZmljYXRpb25zLiBSZXR1cm5zXG4gICAgICogYSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgdXNlciBoYXMgcmVzcG9uZGVkXG4gICAgICogdG8gdGhlIHJlcXVlc3QuIFRoZSBwcm9taXNlIGhhcyBhIHNpbmdsZSBzdHJpbmcgYXJndW1lbnRcbiAgICAgKiB0aGF0IGlzICdncmFudGVkJyBpZiB0aGUgdXNlciBhbGxvd2VkIHRoZSByZXF1ZXN0IG9yXG4gICAgICogJ2RlbmllZCcgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGFic3RyYWN0IHJlcXVlc3ROb3RpZmljYXRpb25QZXJtaXNzaW9uKCk6IFByb21pc2U8c3RyaW5nPjtcblxuICAgIGFic3RyYWN0IGRpc3BsYXlOb3RpZmljYXRpb24odGl0bGU6IHN0cmluZywgbXNnOiBzdHJpbmcsIGF2YXRhclVybDogc3RyaW5nLCByb29tOiBPYmplY3QpO1xuXG4gICAgbG91ZE5vdGlmaWNhdGlvbihldjogRXZlbnQsIHJvb206IE9iamVjdCkge1xuICAgIH1cblxuICAgIGNsZWFyTm90aWZpY2F0aW9uKG5vdGlmOiBOb3RpZmljYXRpb24pIHtcbiAgICAgICAgLy8gU29tZSBicm93c2VycyBkb24ndCBzdXBwb3J0IHRoaXMsIGUuZyBTYWZhcmkgb24gaU9TXG4gICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ob3RpZmljYXRpb24vY2xvc2VcbiAgICAgICAgaWYgKG5vdGlmLmNsb3NlKSB7XG4gICAgICAgICAgICBub3RpZi5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgdmVyc2lvbiBvZiB0aGUgYXBwbGljYXRpb24uXG4gICAgICovXG4gICAgYWJzdHJhY3QgZ2V0QXBwVmVyc2lvbigpOiBQcm9taXNlPHN0cmluZz47XG5cbiAgICAvKlxuICAgICAqIElmIGl0J3Mgbm90IGV4cGVjdGVkIHRoYXQgY2FwdHVyaW5nIHRoZSBzY3JlZW4gd2lsbCB3b3JrXG4gICAgICogd2l0aCBnZXRVc2VyTWVkaWEsIHJldHVybiBhIHN0cmluZyBleHBsYWluaW5nIHdoeSBub3QuXG4gICAgICogT3RoZXJ3aXNlLCByZXR1cm4gbnVsbC5cbiAgICAgKi9cbiAgICBzY3JlZW5DYXB0dXJlRXJyb3JTdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiTm90IGltcGxlbWVudGVkXCI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzdGFydHMgdGhlIGFwcGxpY2F0aW9uLCB3aXRob3V0IG5lY2Nlc3NhcmlseSByZWxvYWRpbmdcbiAgICAgKiBhbnkgYXBwbGljYXRpb24gY29kZVxuICAgICAqL1xuICAgIGFic3RyYWN0IHJlbG9hZCgpO1xuXG4gICAgc3VwcG9ydHNBdXRvTGF1bmNoKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gWFhYOiBTdXJlbHkgdGhpcyBzaG91bGQgYmUgYSBzZXR0aW5nIGxpa2UgYW55IG90aGVyP1xuICAgIGFzeW5jIGdldEF1dG9MYXVuY2hFbmFibGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgYXN5bmMgc2V0QXV0b0xhdW5jaEVuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIHN1cHBvcnRzV2FybkJlZm9yZUV4aXQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBhc3luYyBzaG91bGRXYXJuQmVmb3JlRXhpdCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGFzeW5jIHNldFdhcm5CZWZvcmVFeGl0KGVuYWJsZWQ6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICBzdXBwb3J0c0F1dG9IaWRlTWVudUJhcigpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGFzeW5jIGdldEF1dG9IaWRlTWVudUJhckVuYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBhc3luYyBzZXRBdXRvSGlkZU1lbnVCYXJFbmFibGVkKGVuYWJsZWQ6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICBzdXBwb3J0c01pbmltaXplVG9UcmF5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgYXN5bmMgZ2V0TWluaW1pemVUb1RyYXlFbmFibGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgYXN5bmMgc2V0TWluaW1pemVUb1RyYXlFbmFibGVkKGVuYWJsZWQ6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgb3VyIHBsYXRmb3JtIHNwZWNpZmljIEV2ZW50SW5kZXhNYW5hZ2VyLlxuICAgICAqXG4gICAgICogQHJldHVybiB7QmFzZUV2ZW50SW5kZXhNYW5hZ2VyfSBUaGUgRXZlbnRJbmRleCBtYW5hZ2VyIGZvciBvdXIgcGxhdGZvcm0sXG4gICAgICogY2FuIGJlIG51bGwgaWYgdGhlIHBsYXRmb3JtIGRvZXNuJ3Qgc3VwcG9ydCBldmVudCBpbmRleGluZy5cbiAgICAgKi9cbiAgICBnZXRFdmVudEluZGV4aW5nTWFuYWdlcigpOiBCYXNlRXZlbnRJbmRleE1hbmFnZXIgfCBudWxsIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgYXN5bmMgc2V0TGFuZ3VhZ2UocHJlZmVycmVkTGFuZ3M6IHN0cmluZ1tdKSB7fVxuXG4gICAgc2V0U3BlbGxDaGVja0xhbmd1YWdlcyhwcmVmZXJyZWRMYW5nczogc3RyaW5nW10pIHt9XG5cbiAgICBnZXRTcGVsbENoZWNrTGFuZ3VhZ2VzKCk6IFByb21pc2U8c3RyaW5nW10+IHwgbnVsbCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGdldEF2YWlsYWJsZVNwZWxsQ2hlY2tMYW5ndWFnZXMoKTogUHJvbWlzZTxzdHJpbmdbXT4gfCBudWxsIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldFNTT0NhbGxiYWNrVXJsKGZyYWdtZW50QWZ0ZXJMb2dpbjogc3RyaW5nKTogVVJMIHtcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gICAgICAgIHVybC5oYXNoID0gZnJhZ21lbnRBZnRlckxvZ2luIHx8IFwiXCI7XG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQmVnaW4gU2luZ2xlIFNpZ24gT24gZmxvd3MuXG4gICAgICogQHBhcmFtIHtNYXRyaXhDbGllbnR9IG14Q2xpZW50IHRoZSBtYXRyaXggY2xpZW50IHVzaW5nIHdoaWNoIHdlIHNob3VsZCBzdGFydCB0aGUgZmxvd1xuICAgICAqIEBwYXJhbSB7XCJzc29cInxcImNhc1wifSBsb2dpblR5cGUgdGhlIHR5cGUgb2YgU1NPIGl0IGlzLCBDQVMvU1NPLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmcmFnbWVudEFmdGVyTG9naW4gdGhlIGhhc2ggdG8gcGFzcyB0byB0aGUgYXBwIGR1cmluZyBzc28gY2FsbGJhY2suXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGlkcElkIFRoZSBJRCBvZiB0aGUgSWRlbnRpdHkgUHJvdmlkZXIgYmVpbmcgdGFyZ2V0ZWQsIG9wdGlvbmFsLlxuICAgICAqL1xuICAgIHN0YXJ0U2luZ2xlU2lnbk9uKG14Q2xpZW50OiBNYXRyaXhDbGllbnQsIGxvZ2luVHlwZTogXCJzc29cIiB8IFwiY2FzXCIsIGZyYWdtZW50QWZ0ZXJMb2dpbjogc3RyaW5nLCBpZHBJZD86IHN0cmluZykge1xuICAgICAgICAvLyBwZXJzaXN0IGhzIHVybCBhbmQgaXMgdXJsIGZvciB3aGVuIHRoZSB1c2VyIGlzIHJldHVybmVkIHRvIHRoZSBhcHAgd2l0aCB0aGUgbG9naW4gdG9rZW5cbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oU1NPX0hPTUVTRVJWRVJfVVJMX0tFWSwgbXhDbGllbnQuZ2V0SG9tZXNlcnZlclVybCgpKTtcbiAgICAgICAgaWYgKG14Q2xpZW50LmdldElkZW50aXR5U2VydmVyVXJsKCkpIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFNTT19JRF9TRVJWRVJfVVJMX0tFWSwgbXhDbGllbnQuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlkcElkKSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShTU09fSURQX0lEX0tFWSwgaWRwSWQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNhbGxiYWNrVXJsID0gdGhpcy5nZXRTU09DYWxsYmFja1VybChmcmFnbWVudEFmdGVyTG9naW4pO1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IG14Q2xpZW50LmdldFNzb0xvZ2luVXJsKGNhbGxiYWNrVXJsLnRvU3RyaW5nKCksIGxvZ2luVHlwZSwgaWRwSWQpOyAvLyByZWRpcmVjdCB0byBTU09cbiAgICB9XG5cbiAgICBvbktleURvd24oZXY6IEtleWJvYXJkRXZlbnQpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBubyBzaG9ydGN1dHMgaW1wbGVtZW50ZWRcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYSBwcmV2aW91c2x5IHN0b3JlZCBwaWNrbGUga2V5LiAgVGhlIHBpY2tsZSBrZXkgaXMgdXNlZCBmb3JcbiAgICAgKiBlbmNyeXB0aW5nIGxpYm9sbSBvYmplY3RzLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1c2VySWQgdGhlIHVzZXIgSUQgZm9yIHRoZSB1c2VyIHRoYXQgdGhlIHBpY2tsZSBrZXkgaXMgZm9yLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1c2VySWQgdGhlIGRldmljZSBJRCB0aGF0IHRoZSBwaWNrbGUga2V5IGlzIGZvci5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfG51bGx9IHRoZSBwcmV2aW91c2x5IHN0b3JlZCBwaWNrbGUga2V5LCBvciBudWxsIGlmIG5vXG4gICAgICogICAgIHBpY2tsZSBrZXkgaGFzIGJlZW4gc3RvcmVkLlxuICAgICAqL1xuICAgIGFzeW5jIGdldFBpY2tsZUtleSh1c2VySWQ6IHN0cmluZywgZGV2aWNlSWQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgICAgICBpZiAoIXdpbmRvdy5jcnlwdG8gfHwgIXdpbmRvdy5jcnlwdG8uc3VidGxlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGF0YTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRhdGEgPSBhd2FpdCBpZGJMb2FkKFwicGlja2xlS2V5XCIsIFt1c2VySWQsIGRldmljZUlkXSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIGlmICghZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkYXRhLmVuY3J5cHRlZCB8fCAhZGF0YS5pdiB8fCAhZGF0YS5jcnlwdG9LZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJCYWRseSBmb3JtYXR0ZWQgcGlja2xlIGtleVwiKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWRkaXRpb25hbERhdGEgPSBuZXcgVWludDhBcnJheSh1c2VySWQubGVuZ3RoICsgZGV2aWNlSWQubGVuZ3RoICsgMSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdXNlcklkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhZGRpdGlvbmFsRGF0YVtpXSA9IHVzZXJJZC5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB9XG4gICAgICAgIGFkZGl0aW9uYWxEYXRhW3VzZXJJZC5sZW5ndGhdID0gMTI0OyAvLyBcInxcIlxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRldmljZUlkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhZGRpdGlvbmFsRGF0YVt1c2VySWQubGVuZ3RoICsgMSArIGldID0gZGV2aWNlSWQuY2hhckNvZGVBdChpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgICAgICAgICAge25hbWU6IFwiQUVTLUdDTVwiLCBpdjogZGF0YS5pdiwgYWRkaXRpb25hbERhdGF9LCBkYXRhLmNyeXB0b0tleSxcbiAgICAgICAgICAgICAgICBkYXRhLmVuY3J5cHRlZCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gZW5jb2RlVW5wYWRkZWRCYXNlNjQoa2V5KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGRlY3J5cHRpbmcgcGlja2xlIGtleVwiKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGFuZCBzdG9yZSBhIHBpY2tsZSBrZXkgZm9yIGVuY3J5cHRpbmcgbGlib2xtIG9iamVjdHMuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXJJZCB0aGUgdXNlciBJRCBmb3IgdGhlIHVzZXIgdGhhdCB0aGUgcGlja2xlIGtleSBpcyBmb3IuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXJJZCB0aGUgZGV2aWNlIElEIHRoYXQgdGhlIHBpY2tsZSBrZXkgaXMgZm9yLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd8bnVsbH0gdGhlIHBpY2tsZSBrZXksIG9yIG51bGwgaWYgdGhlIHBsYXRmb3JtIGRvZXMgbm90XG4gICAgICogICAgIHN1cHBvcnQgc3RvcmluZyBwaWNrbGUga2V5cy5cbiAgICAgKi9cbiAgICBhc3luYyBjcmVhdGVQaWNrbGVLZXkodXNlcklkOiBzdHJpbmcsIGRldmljZUlkOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICAgICAgaWYgKCF3aW5kb3cuY3J5cHRvIHx8ICF3aW5kb3cuY3J5cHRvLnN1YnRsZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY3J5cHRvID0gd2luZG93LmNyeXB0bztcbiAgICAgICAgY29uc3QgcmFuZG9tQXJyYXkgPSBuZXcgVWludDhBcnJheSgzMik7XG4gICAgICAgIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMocmFuZG9tQXJyYXkpO1xuICAgICAgICBjb25zdCBjcnlwdG9LZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmdlbmVyYXRlS2V5KFxuICAgICAgICAgICAge25hbWU6IFwiQUVTLUdDTVwiLCBsZW5ndGg6IDI1Nn0sIGZhbHNlLCBbXCJlbmNyeXB0XCIsIFwiZGVjcnlwdFwiXSxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgaXYgPSBuZXcgVWludDhBcnJheSgzMik7XG4gICAgICAgIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoaXYpO1xuXG4gICAgICAgIGNvbnN0IGFkZGl0aW9uYWxEYXRhID0gbmV3IFVpbnQ4QXJyYXkodXNlcklkLmxlbmd0aCArIGRldmljZUlkLmxlbmd0aCArIDEpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVzZXJJZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYWRkaXRpb25hbERhdGFbaV0gPSB1c2VySWQuY2hhckNvZGVBdChpKTtcbiAgICAgICAgfVxuICAgICAgICBhZGRpdGlvbmFsRGF0YVt1c2VySWQubGVuZ3RoXSA9IDEyNDsgLy8gXCJ8XCJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXZpY2VJZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYWRkaXRpb25hbERhdGFbdXNlcklkLmxlbmd0aCArIDEgKyBpXSA9IGRldmljZUlkLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlbmNyeXB0ZWQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICAgICAgICB7bmFtZTogXCJBRVMtR0NNXCIsIGl2LCBhZGRpdGlvbmFsRGF0YX0sIGNyeXB0b0tleSwgcmFuZG9tQXJyYXksXG4gICAgICAgICk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGlkYlNhdmUoXCJwaWNrbGVLZXlcIiwgW3VzZXJJZCwgZGV2aWNlSWRdLCB7ZW5jcnlwdGVkLCBpdiwgY3J5cHRvS2V5fSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbmNvZGVVbnBhZGRlZEJhc2U2NChyYW5kb21BcnJheSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlIGEgcHJldmlvdXNseSBzdG9yZWQgcGlja2xlIGtleSBmcm9tIHN0b3JhZ2UuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXJJZCB0aGUgdXNlciBJRCBmb3IgdGhlIHVzZXIgdGhhdCB0aGUgcGlja2xlIGtleSBpcyBmb3IuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXJJZCB0aGUgZGV2aWNlIElEIHRoYXQgdGhlIHBpY2tsZSBrZXkgaXMgZm9yLlxuICAgICAqL1xuICAgIGFzeW5jIGRlc3Ryb3lQaWNrbGVLZXkodXNlcklkOiBzdHJpbmcsIGRldmljZUlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGlkYkRlbGV0ZShcInBpY2tsZUtleVwiLCBbdXNlcklkLCBkZXZpY2VJZF0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cbn1cbiJdfQ==