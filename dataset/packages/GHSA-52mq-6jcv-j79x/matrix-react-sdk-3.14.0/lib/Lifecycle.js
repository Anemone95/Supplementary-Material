"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadSession = loadSession;
exports.getStoredSessionOwner = getStoredSessionOwner;
exports.attemptTokenLogin = attemptTokenLogin;
exports.handleInvalidStoreError = handleInvalidStoreError;
exports.getStoredSessionVars = getStoredSessionVars;
exports.restoreFromLocalStorage = restoreFromLocalStorage;
exports.setLoggedIn = setLoggedIn;
exports.hydrateSession = hydrateSession;
exports.logout = logout;
exports.softLogout = softLogout;
exports.isSoftLogout = isSoftLogout;
exports.isLoggingOut = isLoggingOut;
exports.onLoggedOut = onLoggedOut;
exports.stopMatrixClient = stopMatrixClient;

var _matrixJsSdk = _interopRequireDefault(require("matrix-js-sdk"));

var _errors = require("matrix-js-sdk/src/errors");

var _aes = require("matrix-js-sdk/src/crypto/aes");

var _MatrixClientPeg = require("./MatrixClientPeg");

var _Security = _interopRequireDefault(require("./customisations/Security"));

var _EventIndexPeg = _interopRequireDefault(require("./indexing/EventIndexPeg"));

var _createMatrixClient = _interopRequireDefault(require("./utils/createMatrixClient"));

var _Analytics = _interopRequireDefault(require("./Analytics"));

var _Notifier = _interopRequireDefault(require("./Notifier"));

var _UserActivity = _interopRequireDefault(require("./UserActivity"));

var _Presence = _interopRequireDefault(require("./Presence"));

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _DMRoomMap = _interopRequireDefault(require("./utils/DMRoomMap"));

var _Modal = _interopRequireDefault(require("./Modal"));

var sdk = _interopRequireWildcard(require("./index"));

var _ActiveWidgetStore = _interopRequireDefault(require("./stores/ActiveWidgetStore"));

var _PlatformPeg = _interopRequireDefault(require("./PlatformPeg"));

var _Login = require("./Login");

var StorageManager = _interopRequireWildcard(require("./utils/StorageManager"));

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _TypingStore = _interopRequireDefault(require("./stores/TypingStore"));

var _ToastStore = _interopRequireDefault(require("./stores/ToastStore"));

var _IntegrationManagers = require("./integrations/IntegrationManagers");

var _Mjolnir = require("./mjolnir/Mjolnir");

var _DeviceListener = _interopRequireDefault(require("./DeviceListener"));

var _Jitsi = require("./widgets/Jitsi");

var _BasePlatform = require("./BasePlatform");

var _ThreepidInviteStore = _interopRequireDefault(require("./stores/ThreepidInviteStore"));

var _CountlyAnalytics = _interopRequireDefault(require("./CountlyAnalytics"));

var _CallHandler = _interopRequireDefault(require("./CallHandler"));

var _Lifecycle = _interopRequireDefault(require("./customisations/Lifecycle"));

var _ErrorDialog = _interopRequireDefault(require("./components/views/dialogs/ErrorDialog"));

var _languageHandler = require("./languageHandler");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2018 New Vector Ltd
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
const HOMESERVER_URL_KEY = "mx_hs_url";
const ID_SERVER_URL_KEY = "mx_is_url";

/**
 * Called at startup, to attempt to build a logged-in Matrix session. It tries
 * a number of things:
 *
 * 1. if we have a guest access token in the fragment query params, it uses
 *    that.
 * 2. if an access token is stored in local storage (from a previous session),
 *    it uses that.
 * 3. it attempts to auto-register as a guest user.
 *
 * If any of steps 1-4 are successful, it will call {_doSetLoggedIn}, which in
 * turn will raise on_logged_in and will_start_client events.
 *
 * @param {object} [opts]
 * @param {object} [opts.fragmentQueryParams]: string->string map of the
 *     query-parameters extracted from the #-fragment of the starting URI.
 * @param {boolean} [opts.enableGuest]: set to true to enable guest access
 *     tokens and auto-guest registrations.
 * @param {string} [opts.guestHsUrl]: homeserver URL. Only used if enableGuest
 *     is true; defines the HS to register against.
 * @param {string} [opts.guestIsUrl]: homeserver URL. Only used if enableGuest
 *     is true; defines the IS to use.
 * @param {bool} [opts.ignoreGuest]: If the stored session is a guest account,
 *     ignore it and don't load it.
 * @param {string} [opts.defaultDeviceDisplayName]: Default display name to use
 *     when registering as a guest.
 * @returns {Promise} a promise which resolves when the above process completes.
 *     Resolves to `true` if we ended up starting a session, or `false` if we
 *     failed.
 */
async function loadSession(opts
/*: ILoadSessionOpts*/
= {})
/*: Promise<boolean>*/
{
  try {
    let enableGuest = opts.enableGuest || false;
    const guestHsUrl = opts.guestHsUrl;
    const guestIsUrl = opts.guestIsUrl;
    const fragmentQueryParams = opts.fragmentQueryParams || {};
    const defaultDeviceDisplayName = opts.defaultDeviceDisplayName;

    if (enableGuest && !guestHsUrl) {
      console.warn("Cannot enable guest access: can't determine HS URL to use");
      enableGuest = false;
    }

    if (enableGuest && fragmentQueryParams.guest_user_id && fragmentQueryParams.guest_access_token) {
      console.log("Using guest access credentials");
      return doSetLoggedIn({
        userId: fragmentQueryParams.guest_user_id,
        accessToken: fragmentQueryParams.guest_access_token,
        homeserverUrl: guestHsUrl,
        identityServerUrl: guestIsUrl,
        guest: true
      }, true).then(() => true);
    }

    const success = await restoreFromLocalStorage({
      ignoreGuest: Boolean(opts.ignoreGuest)
    });

    if (success) {
      return true;
    }

    if (enableGuest) {
      return registerAsGuest(guestHsUrl, guestIsUrl, defaultDeviceDisplayName);
    } // fall back to welcome screen


    return false;
  } catch (e) {
    if (e instanceof AbortLoginAndRebuildStorage) {
      // If we're aborting login because of a storage inconsistency, we don't
      // need to show the general failure dialog. Instead, just go back to welcome.
      return false;
    }

    return handleLoadSessionFailure(e);
  }
}
/**
 * Gets the user ID of the persisted session, if one exists. This does not validate
 * that the user's credentials still work, just that they exist and that a user ID
 * is associated with them. The session is not loaded.
 * @returns {[String, bool]} The persisted session's owner and whether the stored
 *     session is for a guest user, if an owner exists. If there is no stored session,
 *     return [null, null].
 */


async function getStoredSessionOwner()
/*: Promise<[string, boolean]>*/
{
  const {
    hsUrl,
    userId,
    hasAccessToken,
    isGuest
  } = await getStoredSessionVars();
  return hsUrl && userId && hasAccessToken ? [userId, isGuest] : [null, null];
}
/**
 * @param {Object} queryParams    string->string map of the
 *     query-parameters extracted from the real query-string of the starting
 *     URI.
 *
 * @param {string} defaultDeviceDisplayName
 * @param {string} fragmentAfterLogin path to go to after a successful login, only used for "Try again"
 *
 * @returns {Promise} promise which resolves to true if we completed the token
 *    login, else false
 */


function attemptTokenLogin(queryParams
/*: Record<string, string>*/
, defaultDeviceDisplayName
/*: string*/
, fragmentAfterLogin
/*: string*/
)
/*: Promise<boolean>*/
{
  if (!queryParams.loginToken) {
    return Promise.resolve(false);
  }

  const homeserver = localStorage.getItem(_BasePlatform.SSO_HOMESERVER_URL_KEY);
  const identityServer = localStorage.getItem(_BasePlatform.SSO_ID_SERVER_URL_KEY);

  if (!homeserver) {
    console.warn("Cannot log in with token: can't determine HS URL to use");

    _Modal.default.createTrackedDialog("SSO", "Unknown HS", _ErrorDialog.default, {
      title: (0, _languageHandler._t)("We couldn't log you in"),
      description: (0, _languageHandler._t)("We asked the browser to remember which homeserver you use to let you sign in, " + "but unfortunately your browser has forgotten it. Go to the sign in page and try again."),
      button: (0, _languageHandler._t)("Try again")
    });

    return Promise.resolve(false);
  }

  return (0, _Login.sendLoginRequest)(homeserver, identityServer, "m.login.token", {
    token: queryParams.loginToken,
    initial_device_display_name: defaultDeviceDisplayName
  }).then(function (creds) {
    console.log("Logged in with token");
    return clearStorage().then(async () => {
      await persistCredentials(creds); // remember that we just logged in

      sessionStorage.setItem("mx_fresh_login", String(true));
      return true;
    });
  }).catch(err => {
    _Modal.default.createTrackedDialog("SSO", "Token Rejected", _ErrorDialog.default, {
      title: (0, _languageHandler._t)("We couldn't log you in"),
      description: err.name === "ConnectionError" ? (0, _languageHandler._t)("Your homeserver was unreachable and was not able to log you in. Please try again. " + "If this continues, please contact your homeserver administrator.") : (0, _languageHandler._t)("Your homeserver rejected your log in attempt. " + "This could be due to things just taking too long. Please try again. " + "If this continues, please contact your homeserver administrator."),
      button: (0, _languageHandler._t)("Try again"),
      onFinished: tryAgain => {
        if (tryAgain) {
          const cli = _matrixJsSdk.default.createClient({
            baseUrl: homeserver,
            idBaseUrl: identityServer
          });

          const idpId = localStorage.getItem(_BasePlatform.SSO_IDP_ID_KEY) || undefined;

          _PlatformPeg.default.get().startSingleSignOn(cli, "sso", fragmentAfterLogin, idpId);
        }
      }
    });

    console.error("Failed to log in with login token:");
    console.error(err);
    return false;
  });
}

function handleInvalidStoreError(e
/*: InvalidStoreError*/
)
/*: Promise<void>*/
{
  if (e.reason === _errors.InvalidStoreError.TOGGLED_LAZY_LOADING) {
    return Promise.resolve().then(() => {
      const lazyLoadEnabled = e.value;

      if (lazyLoadEnabled) {
        const LazyLoadingResyncDialog = sdk.getComponent("views.dialogs.LazyLoadingResyncDialog");
        return new Promise(resolve => {
          _Modal.default.createDialog(LazyLoadingResyncDialog, {
            onFinished: resolve
          });
        });
      } else {
        // show warning about simultaneous use
        // between LL/non-LL version on same host.
        // as disabling LL when previously enabled
        // is a strong indicator of this (/develop & /app)
        const LazyLoadingDisabledDialog = sdk.getComponent("views.dialogs.LazyLoadingDisabledDialog");
        return new Promise(resolve => {
          _Modal.default.createDialog(LazyLoadingDisabledDialog, {
            onFinished: resolve,
            host: window.location.host
          });
        });
      }
    }).then(() => {
      return _MatrixClientPeg.MatrixClientPeg.get().store.deleteAllData();
    }).then(() => {
      _PlatformPeg.default.get().reload();
    });
  }
}

function registerAsGuest(hsUrl
/*: string*/
, isUrl
/*: string*/
, defaultDeviceDisplayName
/*: string*/
)
/*: Promise<boolean>*/
{
  console.log(`Doing guest login on ${hsUrl}`); // create a temporary MatrixClient to do the login

  const client = _matrixJsSdk.default.createClient({
    baseUrl: hsUrl
  });

  return client.registerGuest({
    body: {
      initial_device_display_name: defaultDeviceDisplayName
    }
  }).then(creds => {
    console.log(`Registered as guest: ${creds.user_id}`);
    return doSetLoggedIn({
      userId: creds.user_id,
      deviceId: creds.device_id,
      accessToken: creds.access_token,
      homeserverUrl: hsUrl,
      identityServerUrl: isUrl,
      guest: true
    }, true).then(() => true);
  }, err => {
    console.error("Failed to register as guest", err);
    return false;
  });
}
/*:: export interface IStoredSession {
    hsUrl: string;
    isUrl: string;
    hasAccessToken: boolean;
    accessToken: string | object;
    userId: string;
    deviceId: string;
    isGuest: boolean;
}*/


/**
 * Retrieves information about the stored session from the browser's storage. The session
 * may not be valid, as it is not tested for consistency here.
 * @returns {Object} Information about the session - see implementation for variables.
 */
async function getStoredSessionVars()
/*: Promise<IStoredSession>*/
{
  const hsUrl = localStorage.getItem(HOMESERVER_URL_KEY);
  const isUrl = localStorage.getItem(ID_SERVER_URL_KEY);
  let accessToken;

  try {
    accessToken = await StorageManager.idbLoad("account", "mx_access_token");
  } catch (e) {}

  if (!accessToken) {
    accessToken = localStorage.getItem("mx_access_token");

    if (accessToken) {
      try {
        // try to migrate access token to IndexedDB if we can
        await StorageManager.idbSave("account", "mx_access_token", accessToken);
        localStorage.removeItem("mx_access_token");
      } catch (e) {}
    }
  } // if we pre-date storing "mx_has_access_token", but we retrieved an access
  // token, then we should say we have an access token


  const hasAccessToken = localStorage.getItem("mx_has_access_token") === "true" || !!accessToken;
  const userId = localStorage.getItem("mx_user_id");
  const deviceId = localStorage.getItem("mx_device_id");
  let isGuest;

  if (localStorage.getItem("mx_is_guest") !== null) {
    isGuest = localStorage.getItem("mx_is_guest") === "true";
  } else {
    // legacy key name
    isGuest = localStorage.getItem("matrix-is-guest") === "true";
  }

  return {
    hsUrl,
    isUrl,
    hasAccessToken,
    accessToken,
    userId,
    deviceId,
    isGuest
  };
} // The pickle key is a string of unspecified length and format.  For AES, we
// need a 256-bit Uint8Array.  So we HKDF the pickle key to generate the AES
// key.  The AES key should be zeroed after it is used.


async function pickleKeyToAesKey(pickleKey
/*: string*/
)
/*: Promise<Uint8Array>*/
{
  const pickleKeyBuffer = new Uint8Array(pickleKey.length);

  for (let i = 0; i < pickleKey.length; i++) {
    pickleKeyBuffer[i] = pickleKey.charCodeAt(i);
  }

  const hkdfKey = await window.crypto.subtle.importKey("raw", pickleKeyBuffer, "HKDF", false, ["deriveBits"]);
  pickleKeyBuffer.fill(0);
  return new Uint8Array(await window.crypto.subtle.deriveBits({
    name: "HKDF",
    hash: "SHA-256",
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/879
    salt: new Uint8Array(32),
    info: new Uint8Array(0)
  }, hkdfKey, 256));
}

async function abortLogin() {
  const signOut = await showStorageEvictedDialog();

  if (signOut) {
    await clearStorage(); // This error feels a bit clunky, but we want to make sure we don't go any
    // further and instead head back to sign in.

    throw new AbortLoginAndRebuildStorage("Aborting login in progress because of storage inconsistency");
  }
} // returns a promise which resolves to true if a session is found in
// localstorage
//
// N.B. Lifecycle.js should not maintain any further localStorage state, we
//      are moving towards using SessionStore to keep track of state related
//      to the current session (which is typically backed by localStorage).
//
//      The plan is to gradually move the localStorage access done here into
//      SessionStore to avoid bugs where the view becomes out-of-sync with
//      localStorage (e.g. isGuest etc.)


async function restoreFromLocalStorage(opts
/*: { ignoreGuest?: boolean }*/
)
/*: Promise<boolean>*/
{
  const ignoreGuest = opts?.ignoreGuest;

  if (!localStorage) {
    return false;
  }

  const {
    hsUrl,
    isUrl,
    hasAccessToken,
    accessToken,
    userId,
    deviceId,
    isGuest
  } = await getStoredSessionVars();

  if (hasAccessToken && !accessToken) {
    abortLogin();
  }

  if (accessToken && userId && hsUrl) {
    if (ignoreGuest && isGuest) {
      console.log("Ignoring stored guest account: " + userId);
      return false;
    }

    let decryptedAccessToken = accessToken;
    const pickleKey = await _PlatformPeg.default.get().getPickleKey(userId, deviceId);

    if (pickleKey) {
      console.log("Got pickle key");

      if (typeof accessToken !== "string") {
        const encrKey = await pickleKeyToAesKey(pickleKey);
        decryptedAccessToken = await (0, _aes.decryptAES)(accessToken, encrKey, "access_token");
        encrKey.fill(0);
      }
    } else {
      console.log("No pickle key available");
    }

    const freshLogin = sessionStorage.getItem("mx_fresh_login") === "true";
    sessionStorage.removeItem("mx_fresh_login");
    console.log(`Restoring session for ${userId}`);
    await doSetLoggedIn({
      userId: userId,
      deviceId: deviceId,
      accessToken: decryptedAccessToken,
      homeserverUrl: hsUrl,
      identityServerUrl: isUrl,
      guest: isGuest,
      pickleKey: pickleKey,
      freshLogin: freshLogin
    }, false);
    return true;
  } else {
    console.log("No previous session found.");
    return false;
  }
}

async function handleLoadSessionFailure(e
/*: Error*/
)
/*: Promise<boolean>*/
{
  console.error("Unable to load session", e);
  const SessionRestoreErrorDialog = sdk.getComponent('views.dialogs.SessionRestoreErrorDialog');

  const modal = _Modal.default.createTrackedDialog('Session Restore Error', '', SessionRestoreErrorDialog, {
    error: e.message
  });

  const [success] = await modal.finished;

  if (success) {
    // user clicked continue.
    await clearStorage();
    return false;
  } // try, try again


  return loadSession();
}
/**
 * Transitions to a logged-in state using the given credentials.
 *
 * Starts the matrix client and all other react-sdk services that
 * listen for events while a session is logged in.
 *
 * Also stops the old MatrixClient and clears old credentials/etc out of
 * storage before starting the new client.
 *
 * @param {MatrixClientCreds} credentials The credentials to use
 *
 * @returns {Promise} promise which resolves to the new MatrixClient once it has been started
 */


async function setLoggedIn(credentials
/*: IMatrixClientCreds*/
)
/*: Promise<MatrixClient>*/
{
  credentials.freshLogin = true;
  stopMatrixClient();
  const pickleKey = credentials.userId && credentials.deviceId ? await _PlatformPeg.default.get().createPickleKey(credentials.userId, credentials.deviceId) : null;

  if (pickleKey) {
    console.log("Created pickle key");
  } else {
    console.log("Pickle key not created");
  }

  return doSetLoggedIn(Object.assign({}, credentials, {
    pickleKey
  }), true);
}
/**
 * Hydrates an existing session by using the credentials provided. This will
 * not clear any local storage, unlike setLoggedIn().
 *
 * Stops the existing Matrix client (without clearing its data) and starts a
 * new one in its place. This additionally starts all other react-sdk services
 * which use the new Matrix client.
 *
 * If the credentials belong to a different user from the session already stored,
 * the old session will be cleared automatically.
 *
 * @param {MatrixClientCreds} credentials The credentials to use
 *
 * @returns {Promise} promise which resolves to the new MatrixClient once it has been started
 */


function hydrateSession(credentials
/*: IMatrixClientCreds*/
)
/*: Promise<MatrixClient>*/
{
  const oldUserId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

  const oldDeviceId = _MatrixClientPeg.MatrixClientPeg.get().getDeviceId();

  stopMatrixClient(); // unsets MatrixClientPeg.get()

  localStorage.removeItem("mx_soft_logout");
  _isLoggingOut = false;
  const overwrite = credentials.userId !== oldUserId || credentials.deviceId !== oldDeviceId;

  if (overwrite) {
    console.warn("Clearing all data: Old session belongs to a different user/session");
  }

  return doSetLoggedIn(credentials, overwrite);
}
/**
 * fires on_logging_in, optionally clears localstorage, persists new credentials
 * to localstorage, starts the new client.
 *
 * @param {MatrixClientCreds} credentials
 * @param {Boolean} clearStorage
 *
 * @returns {Promise} promise which resolves to the new MatrixClient once it has been started
 */


async function doSetLoggedIn(credentials
/*: IMatrixClientCreds*/
, clearStorageEnabled
/*: boolean*/
)
/*: Promise<MatrixClient>*/
{
  credentials.guest = Boolean(credentials.guest);
  const softLogout = isSoftLogout();
  console.log("setLoggedIn: mxid: " + credentials.userId + " deviceId: " + credentials.deviceId + " guest: " + credentials.guest + " hs: " + credentials.homeserverUrl + " softLogout: " + softLogout, " freshLogin: " + credentials.freshLogin); // This is dispatched to indicate that the user is still in the process of logging in
  // because async code may take some time to resolve, breaking the assumption that
  // `setLoggedIn` takes an "instant" to complete, and dispatch `on_logged_in` a few ms
  // later than MatrixChat might assume.
  //
  // we fire it *synchronously* to make sure it fires before on_logged_in.
  // (dis.dispatch uses `setTimeout`, which does not guarantee ordering.)

  _dispatcher.default.dispatch({
    action: 'on_logging_in'
  }, true);

  if (clearStorageEnabled) {
    await clearStorage();
  }

  const results = await StorageManager.checkConsistency(); // If there's an inconsistency between account data in local storage and the
  // crypto store, we'll be generally confused when handling encrypted data.
  // Show a modal recommending a full reset of storage.

  if (results.dataInLocalStorage && results.cryptoInited && !results.dataInCryptoStore) {
    await abortLogin();
  }

  _Analytics.default.setLoggedIn(credentials.guest, credentials.homeserverUrl);

  _MatrixClientPeg.MatrixClientPeg.replaceUsingCreds(credentials);

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (credentials.freshLogin && _SettingsStore.default.getValue("feature_dehydration")) {
    // If we just logged in, try to rehydrate a device instead of using a
    // new device.  If it succeeds, we'll get a new device ID, so make sure
    // we persist that ID to localStorage
    const newDeviceId = await client.rehydrateDevice();

    if (newDeviceId) {
      credentials.deviceId = newDeviceId;
    }

    delete credentials.freshLogin;
  }

  if (localStorage) {
    try {
      await persistCredentials(credentials); // make sure we don't think that it's a fresh login any more

      sessionStorage.removeItem("mx_fresh_login");
    } catch (e) {
      console.warn("Error using local storage: can't persist session!", e);
    }
  } else {
    console.warn("No local storage available: can't persist session!");
  }

  _dispatcher.default.dispatch({
    action: 'on_logged_in'
  });

  await startMatrixClient(
  /*startSyncing=*/
  !softLogout);
  return client;
}

function showStorageEvictedDialog()
/*: Promise<boolean>*/
{
  const StorageEvictedDialog = sdk.getComponent('views.dialogs.StorageEvictedDialog');
  return new Promise(resolve => {
    _Modal.default.createTrackedDialog('Storage evicted', '', StorageEvictedDialog, {
      onFinished: resolve
    });
  });
} // Note: Babel 6 requires the `transform-builtin-extend` plugin for this to satisfy
// `instanceof`. Babel 7 supports this natively in their class handling.


class AbortLoginAndRebuildStorage extends Error {}

async function persistCredentials(credentials
/*: IMatrixClientCreds*/
)
/*: Promise<void>*/
{
  localStorage.setItem(HOMESERVER_URL_KEY, credentials.homeserverUrl);

  if (credentials.identityServerUrl) {
    localStorage.setItem(ID_SERVER_URL_KEY, credentials.identityServerUrl);
  }

  localStorage.setItem("mx_user_id", credentials.userId);
  localStorage.setItem("mx_is_guest", JSON.stringify(credentials.guest)); // store whether we expect to find an access token, to detect the case
  // where IndexedDB is blown away

  if (credentials.accessToken) {
    localStorage.setItem("mx_has_access_token", "true");
  } else {
    localStorage.deleteItem("mx_has_access_token");
  }

  if (credentials.pickleKey) {
    let encryptedAccessToken;

    try {
      // try to encrypt the access token using the pickle key
      const encrKey = await pickleKeyToAesKey(credentials.pickleKey);
      encryptedAccessToken = await (0, _aes.encryptAES)(credentials.accessToken, encrKey, "access_token");
      encrKey.fill(0);
    } catch (e) {
      console.warn("Could not encrypt access token", e);
    }

    try {
      // save either the encrypted access token, or the plain access
      // token if we were unable to encrypt (e.g. if the browser doesn't
      // have WebCrypto).
      await StorageManager.idbSave("account", "mx_access_token", encryptedAccessToken || credentials.accessToken);
    } catch (e) {
      // if we couldn't save to indexedDB, fall back to localStorage.  We
      // store the access token unencrypted since localStorage only saves
      // strings.
      localStorage.setItem("mx_access_token", credentials.accessToken);
    }

    localStorage.setItem("mx_has_pickle_key", String(true));
  } else {
    try {
      await StorageManager.idbSave("account", "mx_access_token", credentials.accessToken);
    } catch (e) {
      localStorage.setItem("mx_access_token", credentials.accessToken);
    }

    if (localStorage.getItem("mx_has_pickle_key")) {
      console.error("Expected a pickle key, but none provided.  Encryption may not work.");
    }
  } // if we didn't get a deviceId from the login, leave mx_device_id unset,
  // rather than setting it to "undefined".
  //
  // (in this case MatrixClient doesn't bother with the crypto stuff
  // - that's fine for us).


  if (credentials.deviceId) {
    localStorage.setItem("mx_device_id", credentials.deviceId);
  }

  _Security.default.persistCredentials?.(credentials);
  console.log(`Session persisted for ${credentials.userId}`);
}

let _isLoggingOut = false;
/**
 * Logs the current session out and transitions to the logged-out state
 */

function logout()
/*: void*/
{
  if (!_MatrixClientPeg.MatrixClientPeg.get()) return;

  if (!_CountlyAnalytics.default.instance.disabled) {
    // user has logged out, fall back to anonymous
    _CountlyAnalytics.default.instance.enable(
    /* anonymous = */
    true);
  }

  if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
    // logout doesn't work for guest sessions
    // Also we sometimes want to re-log in a guest session if we abort the login.
    // defer until next tick because it calls a synchronous dispatch and we are likely here from a dispatch.
    setImmediate(() => onLoggedOut());
    return;
  }

  _isLoggingOut = true;

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  _PlatformPeg.default.get().destroyPickleKey(client.getUserId(), client.getDeviceId());

  client.logout().then(onLoggedOut, err => {
    // Just throwing an error here is going to be very unhelpful
    // if you're trying to log out because your server's down and
    // you want to log into a different server, so just forget the
    // access token. It's annoying that this will leave the access
    // token still valid, but we should fix this by having access
    // tokens expire (and if you really think you've been compromised,
    // change your password).
    console.log("Failed to call logout API: token will not be invalidated");
    onLoggedOut();
  });
}

function softLogout()
/*: void*/
{
  if (!_MatrixClientPeg.MatrixClientPeg.get()) return; // Track that we've detected and trapped a soft logout. This helps prevent other
  // parts of the app from starting if there's no point (ie: don't sync if we've
  // been soft logged out, despite having credentials and data for a MatrixClient).

  localStorage.setItem("mx_soft_logout", "true"); // Dev note: please keep this log line around. It can be useful for track down
  // random clients stopping in the middle of the logs.

  console.log("Soft logout initiated");
  _isLoggingOut = true; // to avoid repeated flags
  // Ensure that we dispatch a view change **before** stopping the client so
  // so that React components unmount first. This avoids React soft crashes
  // that can occur when components try to use a null client.

  _dispatcher.default.dispatch({
    action: 'on_client_not_viable'
  }); // generic version of on_logged_out


  stopMatrixClient(
  /*unsetClient=*/
  false); // DO NOT CALL LOGOUT. A soft logout preserves data, logout does not.
}

function isSoftLogout()
/*: boolean*/
{
  return localStorage.getItem("mx_soft_logout") === "true";
}

function isLoggingOut()
/*: boolean*/
{
  return _isLoggingOut;
}
/**
 * Starts the matrix client and all other react-sdk services that
 * listen for events while a session is logged in.
 * @param {boolean} startSyncing True (default) to actually start
 * syncing the client.
 */


async function startMatrixClient(startSyncing = true)
/*: Promise<void>*/
{
  console.log(`Lifecycle: Starting MatrixClient`); // dispatch this before starting the matrix client: it's used
  // to add listeners for the 'sync' event so otherwise we'd have
  // a race condition (and we need to dispatch synchronously for this
  // to work).

  _dispatcher.default.dispatch({
    action: 'will_start_client'
  }, true); // reset things first just in case


  _TypingStore.default.sharedInstance().reset();

  _ToastStore.default.sharedInstance().reset();

  _Notifier.default.start();

  _UserActivity.default.sharedInstance().start();

  _DMRoomMap.default.makeShared().start();

  _IntegrationManagers.IntegrationManagers.sharedInstance().startWatching();

  _ActiveWidgetStore.default.start();

  _CallHandler.default.sharedInstance().start(); // Start Mjolnir even though we haven't checked the feature flag yet. Starting
  // the thing just wastes CPU cycles, but should result in no actual functionality
  // being exposed to the user.


  _Mjolnir.Mjolnir.sharedInstance().start();

  if (startSyncing) {
    // The client might want to populate some views with events from the
    // index (e.g. the FilePanel), therefore initialize the event index
    // before the client.
    await _EventIndexPeg.default.init();
    await _MatrixClientPeg.MatrixClientPeg.start();
  } else {
    console.warn("Caller requested only auxiliary services be started");
    await _MatrixClientPeg.MatrixClientPeg.assign();
  } // This needs to be started after crypto is set up


  _DeviceListener.default.sharedInstance().start(); // Similarly, don't start sending presence updates until we've started
  // the client


  if (!_SettingsStore.default.getValue("lowBandwidth")) {
    _Presence.default.start();
  } // Now that we have a MatrixClientPeg, update the Jitsi info


  await _Jitsi.Jitsi.getInstance().start(); // dispatch that we finished starting up to wire up any other bits
  // of the matrix client that cannot be set prior to starting up.

  _dispatcher.default.dispatch({
    action: 'client_started'
  });

  if (isSoftLogout()) {
    softLogout();
  }
}
/*
 * Stops a running client and all related services, and clears persistent
 * storage. Used after a session has been logged out.
 */


async function onLoggedOut()
/*: Promise<void>*/
{
  _isLoggingOut = false; // Ensure that we dispatch a view change **before** stopping the client so
  // so that React components unmount first. This avoids React soft crashes
  // that can occur when components try to use a null client.

  _dispatcher.default.dispatch({
    action: 'on_logged_out'
  }, true);

  stopMatrixClient();
  await clearStorage({
    deleteEverything: true
  });
  _Lifecycle.default.onLoggedOutAndStorageCleared?.();
}
/**
 * @param {object} opts Options for how to clear storage.
 * @returns {Promise} promise which resolves once the stores have been cleared
 */


async function clearStorage(opts
/*: { deleteEverything?: boolean }*/
)
/*: Promise<void>*/
{
  _Analytics.default.disable();

  if (window.localStorage) {
    // try to save any 3pid invites from being obliterated
    const pendingInvites = _ThreepidInviteStore.default.instance.getWireInvites();

    window.localStorage.clear();

    try {
      await StorageManager.idbDelete("account", "mx_access_token");
    } catch (e) {} // now restore those invites


    if (!opts?.deleteEverything) {
      pendingInvites.forEach(i => {
        const roomId = i.roomId;
        delete i.roomId; // delete to avoid confusing the store

        _ThreepidInviteStore.default.instance.storeInvite(roomId, i);
      });
    }
  }

  if (window.sessionStorage) {
    window.sessionStorage.clear();
  } // create a temporary client to clear out the persistent stores.


  const cli = (0, _createMatrixClient.default)({
    // we'll never make any requests, so can pass a bogus HS URL
    baseUrl: ""
  });
  await _EventIndexPeg.default.deleteEventIndex();
  await cli.clearStores();
}
/**
 * Stop all the background processes related to the current client.
 * @param {boolean} unsetClient True (default) to abandon the client
 * on MatrixClientPeg after stopping.
 */


function stopMatrixClient(unsetClient = true)
/*: void*/
{
  _Notifier.default.stop();

  _CallHandler.default.sharedInstance().stop();

  _UserActivity.default.sharedInstance().stop();

  _TypingStore.default.sharedInstance().reset();

  _Presence.default.stop();

  _ActiveWidgetStore.default.stop();

  _IntegrationManagers.IntegrationManagers.sharedInstance().stopWatching();

  _Mjolnir.Mjolnir.sharedInstance().stop();

  _DeviceListener.default.sharedInstance().stop();

  if (_DMRoomMap.default.shared()) _DMRoomMap.default.shared().stop();

  _EventIndexPeg.default.stop();

  const cli = _MatrixClientPeg.MatrixClientPeg.get();

  if (cli) {
    cli.stopClient();
    cli.removeAllListeners();

    if (unsetClient) {
      _MatrixClientPeg.MatrixClientPeg.unset();

      _EventIndexPeg.default.unset();
    }
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9MaWZlY3ljbGUudHMiXSwibmFtZXMiOlsiSE9NRVNFUlZFUl9VUkxfS0VZIiwiSURfU0VSVkVSX1VSTF9LRVkiLCJsb2FkU2Vzc2lvbiIsIm9wdHMiLCJlbmFibGVHdWVzdCIsImd1ZXN0SHNVcmwiLCJndWVzdElzVXJsIiwiZnJhZ21lbnRRdWVyeVBhcmFtcyIsImRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSIsImNvbnNvbGUiLCJ3YXJuIiwiZ3Vlc3RfdXNlcl9pZCIsImd1ZXN0X2FjY2Vzc190b2tlbiIsImxvZyIsImRvU2V0TG9nZ2VkSW4iLCJ1c2VySWQiLCJhY2Nlc3NUb2tlbiIsImhvbWVzZXJ2ZXJVcmwiLCJpZGVudGl0eVNlcnZlclVybCIsImd1ZXN0IiwidGhlbiIsInN1Y2Nlc3MiLCJyZXN0b3JlRnJvbUxvY2FsU3RvcmFnZSIsImlnbm9yZUd1ZXN0IiwiQm9vbGVhbiIsInJlZ2lzdGVyQXNHdWVzdCIsImUiLCJBYm9ydExvZ2luQW5kUmVidWlsZFN0b3JhZ2UiLCJoYW5kbGVMb2FkU2Vzc2lvbkZhaWx1cmUiLCJnZXRTdG9yZWRTZXNzaW9uT3duZXIiLCJoc1VybCIsImhhc0FjY2Vzc1Rva2VuIiwiaXNHdWVzdCIsImdldFN0b3JlZFNlc3Npb25WYXJzIiwiYXR0ZW1wdFRva2VuTG9naW4iLCJxdWVyeVBhcmFtcyIsImZyYWdtZW50QWZ0ZXJMb2dpbiIsImxvZ2luVG9rZW4iLCJQcm9taXNlIiwicmVzb2x2ZSIsImhvbWVzZXJ2ZXIiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiU1NPX0hPTUVTRVJWRVJfVVJMX0tFWSIsImlkZW50aXR5U2VydmVyIiwiU1NPX0lEX1NFUlZFUl9VUkxfS0VZIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiYnV0dG9uIiwidG9rZW4iLCJpbml0aWFsX2RldmljZV9kaXNwbGF5X25hbWUiLCJjcmVkcyIsImNsZWFyU3RvcmFnZSIsInBlcnNpc3RDcmVkZW50aWFscyIsInNlc3Npb25TdG9yYWdlIiwic2V0SXRlbSIsIlN0cmluZyIsImNhdGNoIiwiZXJyIiwibmFtZSIsIm9uRmluaXNoZWQiLCJ0cnlBZ2FpbiIsImNsaSIsIk1hdHJpeCIsImNyZWF0ZUNsaWVudCIsImJhc2VVcmwiLCJpZEJhc2VVcmwiLCJpZHBJZCIsIlNTT19JRFBfSURfS0VZIiwidW5kZWZpbmVkIiwiUGxhdGZvcm1QZWciLCJnZXQiLCJzdGFydFNpbmdsZVNpZ25PbiIsImVycm9yIiwiaGFuZGxlSW52YWxpZFN0b3JlRXJyb3IiLCJyZWFzb24iLCJJbnZhbGlkU3RvcmVFcnJvciIsIlRPR0dMRURfTEFaWV9MT0FESU5HIiwibGF6eUxvYWRFbmFibGVkIiwidmFsdWUiLCJMYXp5TG9hZGluZ1Jlc3luY0RpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsImNyZWF0ZURpYWxvZyIsIkxhenlMb2FkaW5nRGlzYWJsZWREaWFsb2ciLCJob3N0Iiwid2luZG93IiwibG9jYXRpb24iLCJNYXRyaXhDbGllbnRQZWciLCJzdG9yZSIsImRlbGV0ZUFsbERhdGEiLCJyZWxvYWQiLCJpc1VybCIsImNsaWVudCIsInJlZ2lzdGVyR3Vlc3QiLCJib2R5IiwidXNlcl9pZCIsImRldmljZUlkIiwiZGV2aWNlX2lkIiwiYWNjZXNzX3Rva2VuIiwiU3RvcmFnZU1hbmFnZXIiLCJpZGJMb2FkIiwiaWRiU2F2ZSIsInJlbW92ZUl0ZW0iLCJwaWNrbGVLZXlUb0Flc0tleSIsInBpY2tsZUtleSIsInBpY2tsZUtleUJ1ZmZlciIsIlVpbnQ4QXJyYXkiLCJsZW5ndGgiLCJpIiwiY2hhckNvZGVBdCIsImhrZGZLZXkiLCJjcnlwdG8iLCJzdWJ0bGUiLCJpbXBvcnRLZXkiLCJmaWxsIiwiZGVyaXZlQml0cyIsImhhc2giLCJzYWx0IiwiaW5mbyIsImFib3J0TG9naW4iLCJzaWduT3V0Iiwic2hvd1N0b3JhZ2VFdmljdGVkRGlhbG9nIiwiZGVjcnlwdGVkQWNjZXNzVG9rZW4iLCJnZXRQaWNrbGVLZXkiLCJlbmNyS2V5IiwiZnJlc2hMb2dpbiIsIlNlc3Npb25SZXN0b3JlRXJyb3JEaWFsb2ciLCJtb2RhbCIsIm1lc3NhZ2UiLCJmaW5pc2hlZCIsInNldExvZ2dlZEluIiwiY3JlZGVudGlhbHMiLCJzdG9wTWF0cml4Q2xpZW50IiwiY3JlYXRlUGlja2xlS2V5IiwiT2JqZWN0IiwiYXNzaWduIiwiaHlkcmF0ZVNlc3Npb24iLCJvbGRVc2VySWQiLCJnZXRVc2VySWQiLCJvbGREZXZpY2VJZCIsImdldERldmljZUlkIiwiX2lzTG9nZ2luZ091dCIsIm92ZXJ3cml0ZSIsImNsZWFyU3RvcmFnZUVuYWJsZWQiLCJzb2Z0TG9nb3V0IiwiaXNTb2Z0TG9nb3V0IiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJyZXN1bHRzIiwiY2hlY2tDb25zaXN0ZW5jeSIsImRhdGFJbkxvY2FsU3RvcmFnZSIsImNyeXB0b0luaXRlZCIsImRhdGFJbkNyeXB0b1N0b3JlIiwiQW5hbHl0aWNzIiwicmVwbGFjZVVzaW5nQ3JlZHMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJuZXdEZXZpY2VJZCIsInJlaHlkcmF0ZURldmljZSIsInN0YXJ0TWF0cml4Q2xpZW50IiwiU3RvcmFnZUV2aWN0ZWREaWFsb2ciLCJFcnJvciIsIkpTT04iLCJzdHJpbmdpZnkiLCJkZWxldGVJdGVtIiwiZW5jcnlwdGVkQWNjZXNzVG9rZW4iLCJTZWN1cml0eUN1c3RvbWlzYXRpb25zIiwibG9nb3V0IiwiQ291bnRseUFuYWx5dGljcyIsImluc3RhbmNlIiwiZGlzYWJsZWQiLCJlbmFibGUiLCJzZXRJbW1lZGlhdGUiLCJvbkxvZ2dlZE91dCIsImRlc3Ryb3lQaWNrbGVLZXkiLCJpc0xvZ2dpbmdPdXQiLCJzdGFydFN5bmNpbmciLCJUeXBpbmdTdG9yZSIsInNoYXJlZEluc3RhbmNlIiwicmVzZXQiLCJUb2FzdFN0b3JlIiwiTm90aWZpZXIiLCJzdGFydCIsIlVzZXJBY3Rpdml0eSIsIkRNUm9vbU1hcCIsIm1ha2VTaGFyZWQiLCJJbnRlZ3JhdGlvbk1hbmFnZXJzIiwic3RhcnRXYXRjaGluZyIsIkFjdGl2ZVdpZGdldFN0b3JlIiwiQ2FsbEhhbmRsZXIiLCJNam9sbmlyIiwiRXZlbnRJbmRleFBlZyIsImluaXQiLCJEZXZpY2VMaXN0ZW5lciIsIlByZXNlbmNlIiwiSml0c2kiLCJnZXRJbnN0YW5jZSIsImRlbGV0ZUV2ZXJ5dGhpbmciLCJMaWZlY3ljbGVDdXN0b21pc2F0aW9ucyIsIm9uTG9nZ2VkT3V0QW5kU3RvcmFnZUNsZWFyZWQiLCJkaXNhYmxlIiwicGVuZGluZ0ludml0ZXMiLCJUaHJlZXBpZEludml0ZVN0b3JlIiwiZ2V0V2lyZUludml0ZXMiLCJjbGVhciIsImlkYkRlbGV0ZSIsImZvckVhY2giLCJyb29tSWQiLCJzdG9yZUludml0ZSIsImRlbGV0ZUV2ZW50SW5kZXgiLCJjbGVhclN0b3JlcyIsInVuc2V0Q2xpZW50Iiwic3RvcCIsInN0b3BXYXRjaGluZyIsInNoYXJlZCIsInN0b3BDbGllbnQiLCJyZW1vdmVBbGxMaXN0ZW5lcnMiLCJ1bnNldCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXREQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQXFDQSxNQUFNQSxrQkFBa0IsR0FBRyxXQUEzQjtBQUNBLE1BQU1DLGlCQUFpQixHQUFHLFdBQTFCOztBQVdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLGVBQWVDLFdBQWYsQ0FBMkJDO0FBQXNCO0FBQUEsRUFBRyxFQUFwRDtBQUFBO0FBQTBFO0FBQzdFLE1BQUk7QUFDQSxRQUFJQyxXQUFXLEdBQUdELElBQUksQ0FBQ0MsV0FBTCxJQUFvQixLQUF0QztBQUNBLFVBQU1DLFVBQVUsR0FBR0YsSUFBSSxDQUFDRSxVQUF4QjtBQUNBLFVBQU1DLFVBQVUsR0FBR0gsSUFBSSxDQUFDRyxVQUF4QjtBQUNBLFVBQU1DLG1CQUFtQixHQUFHSixJQUFJLENBQUNJLG1CQUFMLElBQTRCLEVBQXhEO0FBQ0EsVUFBTUMsd0JBQXdCLEdBQUdMLElBQUksQ0FBQ0ssd0JBQXRDOztBQUVBLFFBQUlKLFdBQVcsSUFBSSxDQUFDQyxVQUFwQixFQUFnQztBQUM1QkksTUFBQUEsT0FBTyxDQUFDQyxJQUFSLENBQWEsMkRBQWI7QUFDQU4sTUFBQUEsV0FBVyxHQUFHLEtBQWQ7QUFDSDs7QUFFRCxRQUNJQSxXQUFXLElBQ1hHLG1CQUFtQixDQUFDSSxhQURwQixJQUVBSixtQkFBbUIsQ0FBQ0ssa0JBSHhCLEVBSUU7QUFDRUgsTUFBQUEsT0FBTyxDQUFDSSxHQUFSLENBQVksZ0NBQVo7QUFDQSxhQUFPQyxhQUFhLENBQUM7QUFDakJDLFFBQUFBLE1BQU0sRUFBRVIsbUJBQW1CLENBQUNJLGFBRFg7QUFFakJLLFFBQUFBLFdBQVcsRUFBRVQsbUJBQW1CLENBQUNLLGtCQUZoQjtBQUdqQkssUUFBQUEsYUFBYSxFQUFFWixVQUhFO0FBSWpCYSxRQUFBQSxpQkFBaUIsRUFBRVosVUFKRjtBQUtqQmEsUUFBQUEsS0FBSyxFQUFFO0FBTFUsT0FBRCxFQU1qQixJQU5pQixDQUFiLENBTUVDLElBTkYsQ0FNTyxNQUFNLElBTmIsQ0FBUDtBQU9IOztBQUNELFVBQU1DLE9BQU8sR0FBRyxNQUFNQyx1QkFBdUIsQ0FBQztBQUMxQ0MsTUFBQUEsV0FBVyxFQUFFQyxPQUFPLENBQUNyQixJQUFJLENBQUNvQixXQUFOO0FBRHNCLEtBQUQsQ0FBN0M7O0FBR0EsUUFBSUYsT0FBSixFQUFhO0FBQ1QsYUFBTyxJQUFQO0FBQ0g7O0FBRUQsUUFBSWpCLFdBQUosRUFBaUI7QUFDYixhQUFPcUIsZUFBZSxDQUFDcEIsVUFBRCxFQUFhQyxVQUFiLEVBQXlCRSx3QkFBekIsQ0FBdEI7QUFDSCxLQW5DRCxDQXFDQTs7O0FBQ0EsV0FBTyxLQUFQO0FBQ0gsR0F2Q0QsQ0F1Q0UsT0FBT2tCLENBQVAsRUFBVTtBQUNSLFFBQUlBLENBQUMsWUFBWUMsMkJBQWpCLEVBQThDO0FBQzFDO0FBQ0E7QUFDQSxhQUFPLEtBQVA7QUFDSDs7QUFDRCxXQUFPQyx3QkFBd0IsQ0FBQ0YsQ0FBRCxDQUEvQjtBQUNIO0FBQ0o7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDTyxlQUFlRyxxQkFBZjtBQUFBO0FBQW1FO0FBQ3RFLFFBQU07QUFBQ0MsSUFBQUEsS0FBRDtBQUFRZixJQUFBQSxNQUFSO0FBQWdCZ0IsSUFBQUEsY0FBaEI7QUFBZ0NDLElBQUFBO0FBQWhDLE1BQTJDLE1BQU1DLG9CQUFvQixFQUEzRTtBQUNBLFNBQU9ILEtBQUssSUFBSWYsTUFBVCxJQUFtQmdCLGNBQW5CLEdBQW9DLENBQUNoQixNQUFELEVBQVNpQixPQUFULENBQXBDLEdBQXdELENBQUMsSUFBRCxFQUFPLElBQVAsQ0FBL0Q7QUFDSDtBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNPLFNBQVNFLGlCQUFULENBQ0hDO0FBREc7QUFBQSxFQUVIM0I7QUFGRztBQUFBLEVBR0g0QjtBQUhHO0FBQUE7QUFBQTtBQUlhO0FBQ2hCLE1BQUksQ0FBQ0QsV0FBVyxDQUFDRSxVQUFqQixFQUE2QjtBQUN6QixXQUFPQyxPQUFPLENBQUNDLE9BQVIsQ0FBZ0IsS0FBaEIsQ0FBUDtBQUNIOztBQUVELFFBQU1DLFVBQVUsR0FBR0MsWUFBWSxDQUFDQyxPQUFiLENBQXFCQyxvQ0FBckIsQ0FBbkI7QUFDQSxRQUFNQyxjQUFjLEdBQUdILFlBQVksQ0FBQ0MsT0FBYixDQUFxQkcsbUNBQXJCLENBQXZCOztBQUNBLE1BQUksQ0FBQ0wsVUFBTCxFQUFpQjtBQUNiL0IsSUFBQUEsT0FBTyxDQUFDQyxJQUFSLENBQWEseURBQWI7O0FBQ0FvQyxtQkFBTUMsbUJBQU4sQ0FBMEIsS0FBMUIsRUFBaUMsWUFBakMsRUFBK0NDLG9CQUEvQyxFQUE0RDtBQUN4REMsTUFBQUEsS0FBSyxFQUFFLHlCQUFHLHdCQUFILENBRGlEO0FBRXhEQyxNQUFBQSxXQUFXLEVBQUUseUJBQUcsbUZBQ1osd0ZBRFMsQ0FGMkM7QUFJeERDLE1BQUFBLE1BQU0sRUFBRSx5QkFBRyxXQUFIO0FBSmdELEtBQTVEOztBQU1BLFdBQU9iLE9BQU8sQ0FBQ0MsT0FBUixDQUFnQixLQUFoQixDQUFQO0FBQ0g7O0FBRUQsU0FBTyw2QkFDSEMsVUFERyxFQUVISSxjQUZHLEVBR0gsZUFIRyxFQUdjO0FBQ2JRLElBQUFBLEtBQUssRUFBRWpCLFdBQVcsQ0FBQ0UsVUFETjtBQUViZ0IsSUFBQUEsMkJBQTJCLEVBQUU3QztBQUZoQixHQUhkLEVBT0xZLElBUEssQ0FPQSxVQUFTa0MsS0FBVCxFQUFnQjtBQUNuQjdDLElBQUFBLE9BQU8sQ0FBQ0ksR0FBUixDQUFZLHNCQUFaO0FBQ0EsV0FBTzBDLFlBQVksR0FBR25DLElBQWYsQ0FBb0IsWUFBWTtBQUNuQyxZQUFNb0Msa0JBQWtCLENBQUNGLEtBQUQsQ0FBeEIsQ0FEbUMsQ0FFbkM7O0FBQ0FHLE1BQUFBLGNBQWMsQ0FBQ0MsT0FBZixDQUF1QixnQkFBdkIsRUFBeUNDLE1BQU0sQ0FBQyxJQUFELENBQS9DO0FBQ0EsYUFBTyxJQUFQO0FBQ0gsS0FMTSxDQUFQO0FBTUgsR0FmTSxFQWVKQyxLQWZJLENBZUdDLEdBQUQsSUFBUztBQUNkZixtQkFBTUMsbUJBQU4sQ0FBMEIsS0FBMUIsRUFBaUMsZ0JBQWpDLEVBQW1EQyxvQkFBbkQsRUFBZ0U7QUFDNURDLE1BQUFBLEtBQUssRUFBRSx5QkFBRyx3QkFBSCxDQURxRDtBQUU1REMsTUFBQUEsV0FBVyxFQUFFVyxHQUFHLENBQUNDLElBQUosS0FBYSxpQkFBYixHQUNQLHlCQUFHLHVGQUNELGtFQURGLENBRE8sR0FHUCx5QkFBRyxtREFDRCxzRUFEQyxHQUVELGtFQUZGLENBTHNEO0FBUTVEWCxNQUFBQSxNQUFNLEVBQUUseUJBQUcsV0FBSCxDQVJvRDtBQVM1RFksTUFBQUEsVUFBVSxFQUFFQyxRQUFRLElBQUk7QUFDcEIsWUFBSUEsUUFBSixFQUFjO0FBQ1YsZ0JBQU1DLEdBQUcsR0FBR0MscUJBQU9DLFlBQVAsQ0FBb0I7QUFDNUJDLFlBQUFBLE9BQU8sRUFBRTVCLFVBRG1CO0FBRTVCNkIsWUFBQUEsU0FBUyxFQUFFekI7QUFGaUIsV0FBcEIsQ0FBWjs7QUFJQSxnQkFBTTBCLEtBQUssR0FBRzdCLFlBQVksQ0FBQ0MsT0FBYixDQUFxQjZCLDRCQUFyQixLQUF3Q0MsU0FBdEQ7O0FBQ0FDLCtCQUFZQyxHQUFaLEdBQWtCQyxpQkFBbEIsQ0FBb0NWLEdBQXBDLEVBQXlDLEtBQXpDLEVBQWdEN0Isa0JBQWhELEVBQW9Fa0MsS0FBcEU7QUFDSDtBQUNKO0FBbEIyRCxLQUFoRTs7QUFvQkE3RCxJQUFBQSxPQUFPLENBQUNtRSxLQUFSLENBQWMsb0NBQWQ7QUFDQW5FLElBQUFBLE9BQU8sQ0FBQ21FLEtBQVIsQ0FBY2YsR0FBZDtBQUNBLFdBQU8sS0FBUDtBQUNILEdBdkNNLENBQVA7QUF3Q0g7O0FBRU0sU0FBU2dCLHVCQUFULENBQWlDbkQ7QUFBakM7QUFBQTtBQUFBO0FBQXNFO0FBQ3pFLE1BQUlBLENBQUMsQ0FBQ29ELE1BQUYsS0FBYUMsMEJBQWtCQyxvQkFBbkMsRUFBeUQ7QUFDckQsV0FBTzFDLE9BQU8sQ0FBQ0MsT0FBUixHQUFrQm5CLElBQWxCLENBQXVCLE1BQU07QUFDaEMsWUFBTTZELGVBQWUsR0FBR3ZELENBQUMsQ0FBQ3dELEtBQTFCOztBQUNBLFVBQUlELGVBQUosRUFBcUI7QUFDakIsY0FBTUUsdUJBQXVCLEdBQ3pCQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsdUNBQWpCLENBREo7QUFFQSxlQUFPLElBQUkvQyxPQUFKLENBQWFDLE9BQUQsSUFBYTtBQUM1Qk8seUJBQU13QyxZQUFOLENBQW1CSCx1QkFBbkIsRUFBNEM7QUFDeENwQixZQUFBQSxVQUFVLEVBQUV4QjtBQUQ0QixXQUE1QztBQUdILFNBSk0sQ0FBUDtBQUtILE9BUkQsTUFRTztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBTWdELHlCQUF5QixHQUMzQkgsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHlDQUFqQixDQURKO0FBRUEsZUFBTyxJQUFJL0MsT0FBSixDQUFhQyxPQUFELElBQWE7QUFDNUJPLHlCQUFNd0MsWUFBTixDQUFtQkMseUJBQW5CLEVBQThDO0FBQzFDeEIsWUFBQUEsVUFBVSxFQUFFeEIsT0FEOEI7QUFFMUNpRCxZQUFBQSxJQUFJLEVBQUVDLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkY7QUFGb0IsV0FBOUM7QUFJSCxTQUxNLENBQVA7QUFNSDtBQUNKLEtBeEJNLEVBd0JKcEUsSUF4QkksQ0F3QkMsTUFBTTtBQUNWLGFBQU91RSxpQ0FBZ0JqQixHQUFoQixHQUFzQmtCLEtBQXRCLENBQTRCQyxhQUE1QixFQUFQO0FBQ0gsS0ExQk0sRUEwQkp6RSxJQTFCSSxDQTBCQyxNQUFNO0FBQ1ZxRCwyQkFBWUMsR0FBWixHQUFrQm9CLE1BQWxCO0FBQ0gsS0E1Qk0sQ0FBUDtBQTZCSDtBQUNKOztBQUVELFNBQVNyRSxlQUFULENBQ0lLO0FBREo7QUFBQSxFQUVJaUU7QUFGSjtBQUFBLEVBR0l2RjtBQUhKO0FBQUE7QUFBQTtBQUlvQjtBQUNoQkMsRUFBQUEsT0FBTyxDQUFDSSxHQUFSLENBQWEsd0JBQXVCaUIsS0FBTSxFQUExQyxFQURnQixDQUdoQjs7QUFDQSxRQUFNa0UsTUFBTSxHQUFHOUIscUJBQU9DLFlBQVAsQ0FBb0I7QUFDL0JDLElBQUFBLE9BQU8sRUFBRXRDO0FBRHNCLEdBQXBCLENBQWY7O0FBSUEsU0FBT2tFLE1BQU0sQ0FBQ0MsYUFBUCxDQUFxQjtBQUN4QkMsSUFBQUEsSUFBSSxFQUFFO0FBQ0Y3QyxNQUFBQSwyQkFBMkIsRUFBRTdDO0FBRDNCO0FBRGtCLEdBQXJCLEVBSUpZLElBSkksQ0FJRWtDLEtBQUQsSUFBVztBQUNmN0MsSUFBQUEsT0FBTyxDQUFDSSxHQUFSLENBQWEsd0JBQXVCeUMsS0FBSyxDQUFDNkMsT0FBUSxFQUFsRDtBQUNBLFdBQU9yRixhQUFhLENBQUM7QUFDakJDLE1BQUFBLE1BQU0sRUFBRXVDLEtBQUssQ0FBQzZDLE9BREc7QUFFakJDLE1BQUFBLFFBQVEsRUFBRTlDLEtBQUssQ0FBQytDLFNBRkM7QUFHakJyRixNQUFBQSxXQUFXLEVBQUVzQyxLQUFLLENBQUNnRCxZQUhGO0FBSWpCckYsTUFBQUEsYUFBYSxFQUFFYSxLQUpFO0FBS2pCWixNQUFBQSxpQkFBaUIsRUFBRTZFLEtBTEY7QUFNakI1RSxNQUFBQSxLQUFLLEVBQUU7QUFOVSxLQUFELEVBT2pCLElBUGlCLENBQWIsQ0FPRUMsSUFQRixDQU9PLE1BQU0sSUFQYixDQUFQO0FBUUgsR0FkTSxFQWNIeUMsR0FBRCxJQUFTO0FBQ1JwRCxJQUFBQSxPQUFPLENBQUNtRSxLQUFSLENBQWMsNkJBQWQsRUFBNkNmLEdBQTdDO0FBQ0EsV0FBTyxLQUFQO0FBQ0gsR0FqQk0sQ0FBUDtBQWtCSDs7QUE1U0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBaVRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTyxlQUFlNUIsb0JBQWY7QUFBQTtBQUErRDtBQUNsRSxRQUFNSCxLQUFLLEdBQUdXLFlBQVksQ0FBQ0MsT0FBYixDQUFxQjFDLGtCQUFyQixDQUFkO0FBQ0EsUUFBTStGLEtBQUssR0FBR3RELFlBQVksQ0FBQ0MsT0FBYixDQUFxQnpDLGlCQUFyQixDQUFkO0FBQ0EsTUFBSWUsV0FBSjs7QUFDQSxNQUFJO0FBQ0FBLElBQUFBLFdBQVcsR0FBRyxNQUFNdUYsY0FBYyxDQUFDQyxPQUFmLENBQXVCLFNBQXZCLEVBQWtDLGlCQUFsQyxDQUFwQjtBQUNILEdBRkQsQ0FFRSxPQUFPOUUsQ0FBUCxFQUFVLENBQUU7O0FBQ2QsTUFBSSxDQUFDVixXQUFMLEVBQWtCO0FBQ2RBLElBQUFBLFdBQVcsR0FBR3lCLFlBQVksQ0FBQ0MsT0FBYixDQUFxQixpQkFBckIsQ0FBZDs7QUFDQSxRQUFJMUIsV0FBSixFQUFpQjtBQUNiLFVBQUk7QUFDQTtBQUNBLGNBQU11RixjQUFjLENBQUNFLE9BQWYsQ0FBdUIsU0FBdkIsRUFBa0MsaUJBQWxDLEVBQXFEekYsV0FBckQsQ0FBTjtBQUNBeUIsUUFBQUEsWUFBWSxDQUFDaUUsVUFBYixDQUF3QixpQkFBeEI7QUFDSCxPQUpELENBSUUsT0FBT2hGLENBQVAsRUFBVSxDQUFFO0FBQ2pCO0FBQ0osR0FoQmlFLENBaUJsRTtBQUNBOzs7QUFDQSxRQUFNSyxjQUFjLEdBQ2ZVLFlBQVksQ0FBQ0MsT0FBYixDQUFxQixxQkFBckIsTUFBZ0QsTUFBakQsSUFBNEQsQ0FBQyxDQUFDMUIsV0FEbEU7QUFFQSxRQUFNRCxNQUFNLEdBQUcwQixZQUFZLENBQUNDLE9BQWIsQ0FBcUIsWUFBckIsQ0FBZjtBQUNBLFFBQU0wRCxRQUFRLEdBQUczRCxZQUFZLENBQUNDLE9BQWIsQ0FBcUIsY0FBckIsQ0FBakI7QUFFQSxNQUFJVixPQUFKOztBQUNBLE1BQUlTLFlBQVksQ0FBQ0MsT0FBYixDQUFxQixhQUFyQixNQUF3QyxJQUE1QyxFQUFrRDtBQUM5Q1YsSUFBQUEsT0FBTyxHQUFHUyxZQUFZLENBQUNDLE9BQWIsQ0FBcUIsYUFBckIsTUFBd0MsTUFBbEQ7QUFDSCxHQUZELE1BRU87QUFDSDtBQUNBVixJQUFBQSxPQUFPLEdBQUdTLFlBQVksQ0FBQ0MsT0FBYixDQUFxQixpQkFBckIsTUFBNEMsTUFBdEQ7QUFDSDs7QUFFRCxTQUFPO0FBQUNaLElBQUFBLEtBQUQ7QUFBUWlFLElBQUFBLEtBQVI7QUFBZWhFLElBQUFBLGNBQWY7QUFBK0JmLElBQUFBLFdBQS9CO0FBQTRDRCxJQUFBQSxNQUE1QztBQUFvRHFGLElBQUFBLFFBQXBEO0FBQThEcEUsSUFBQUE7QUFBOUQsR0FBUDtBQUNILEMsQ0FFRDtBQUNBO0FBQ0E7OztBQUNBLGVBQWUyRSxpQkFBZixDQUFpQ0M7QUFBakM7QUFBQTtBQUFBO0FBQXlFO0FBQ3JFLFFBQU1DLGVBQWUsR0FBRyxJQUFJQyxVQUFKLENBQWVGLFNBQVMsQ0FBQ0csTUFBekIsQ0FBeEI7O0FBQ0EsT0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHSixTQUFTLENBQUNHLE1BQTlCLEVBQXNDQyxDQUFDLEVBQXZDLEVBQTJDO0FBQ3ZDSCxJQUFBQSxlQUFlLENBQUNHLENBQUQsQ0FBZixHQUFxQkosU0FBUyxDQUFDSyxVQUFWLENBQXFCRCxDQUFyQixDQUFyQjtBQUNIOztBQUNELFFBQU1FLE9BQU8sR0FBRyxNQUFNekIsTUFBTSxDQUFDMEIsTUFBUCxDQUFjQyxNQUFkLENBQXFCQyxTQUFyQixDQUNsQixLQURrQixFQUNYUixlQURXLEVBQ00sTUFETixFQUNjLEtBRGQsRUFDcUIsQ0FBQyxZQUFELENBRHJCLENBQXRCO0FBR0FBLEVBQUFBLGVBQWUsQ0FBQ1MsSUFBaEIsQ0FBcUIsQ0FBckI7QUFDQSxTQUFPLElBQUlSLFVBQUosQ0FBZSxNQUFNckIsTUFBTSxDQUFDMEIsTUFBUCxDQUFjQyxNQUFkLENBQXFCRyxVQUFyQixDQUN4QjtBQUNJekQsSUFBQUEsSUFBSSxFQUFFLE1BRFY7QUFDa0IwRCxJQUFBQSxJQUFJLEVBQUUsU0FEeEI7QUFFSTtBQUNBO0FBQ0FDLElBQUFBLElBQUksRUFBRSxJQUFJWCxVQUFKLENBQWUsRUFBZixDQUpWO0FBSThCWSxJQUFBQSxJQUFJLEVBQUUsSUFBSVosVUFBSixDQUFlLENBQWY7QUFKcEMsR0FEd0IsRUFPeEJJLE9BUHdCLEVBUXhCLEdBUndCLENBQXJCLENBQVA7QUFVSDs7QUFFRCxlQUFlUyxVQUFmLEdBQTRCO0FBQ3hCLFFBQU1DLE9BQU8sR0FBRyxNQUFNQyx3QkFBd0IsRUFBOUM7O0FBQ0EsTUFBSUQsT0FBSixFQUFhO0FBQ1QsVUFBTXJFLFlBQVksRUFBbEIsQ0FEUyxDQUVUO0FBQ0E7O0FBQ0EsVUFBTSxJQUFJNUIsMkJBQUosQ0FDRiw2REFERSxDQUFOO0FBR0g7QUFDSixDLENBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNPLGVBQWVMLHVCQUFmLENBQXVDbkI7QUFBdkM7QUFBQTtBQUFBO0FBQTJGO0FBQzlGLFFBQU1vQixXQUFXLEdBQUdwQixJQUFJLEVBQUVvQixXQUExQjs7QUFFQSxNQUFJLENBQUNrQixZQUFMLEVBQW1CO0FBQ2YsV0FBTyxLQUFQO0FBQ0g7O0FBRUQsUUFBTTtBQUFDWCxJQUFBQSxLQUFEO0FBQVFpRSxJQUFBQSxLQUFSO0FBQWVoRSxJQUFBQSxjQUFmO0FBQStCZixJQUFBQSxXQUEvQjtBQUE0Q0QsSUFBQUEsTUFBNUM7QUFBb0RxRixJQUFBQSxRQUFwRDtBQUE4RHBFLElBQUFBO0FBQTlELE1BQXlFLE1BQU1DLG9CQUFvQixFQUF6Rzs7QUFFQSxNQUFJRixjQUFjLElBQUksQ0FBQ2YsV0FBdkIsRUFBb0M7QUFDaEMyRyxJQUFBQSxVQUFVO0FBQ2I7O0FBRUQsTUFBSTNHLFdBQVcsSUFBSUQsTUFBZixJQUF5QmUsS0FBN0IsRUFBb0M7QUFDaEMsUUFBSVAsV0FBVyxJQUFJUyxPQUFuQixFQUE0QjtBQUN4QnZCLE1BQUFBLE9BQU8sQ0FBQ0ksR0FBUixDQUFZLG9DQUFvQ0UsTUFBaEQ7QUFDQSxhQUFPLEtBQVA7QUFDSDs7QUFFRCxRQUFJK0csb0JBQW9CLEdBQUc5RyxXQUEzQjtBQUNBLFVBQU00RixTQUFTLEdBQUcsTUFBTW5DLHFCQUFZQyxHQUFaLEdBQWtCcUQsWUFBbEIsQ0FBK0JoSCxNQUEvQixFQUF1Q3FGLFFBQXZDLENBQXhCOztBQUNBLFFBQUlRLFNBQUosRUFBZTtBQUNYbkcsTUFBQUEsT0FBTyxDQUFDSSxHQUFSLENBQVksZ0JBQVo7O0FBQ0EsVUFBSSxPQUFPRyxXQUFQLEtBQXVCLFFBQTNCLEVBQXFDO0FBQ2pDLGNBQU1nSCxPQUFPLEdBQUcsTUFBTXJCLGlCQUFpQixDQUFDQyxTQUFELENBQXZDO0FBQ0FrQixRQUFBQSxvQkFBb0IsR0FBRyxNQUFNLHFCQUFXOUcsV0FBWCxFQUF3QmdILE9BQXhCLEVBQWlDLGNBQWpDLENBQTdCO0FBQ0FBLFFBQUFBLE9BQU8sQ0FBQ1YsSUFBUixDQUFhLENBQWI7QUFDSDtBQUNKLEtBUEQsTUFPTztBQUNIN0csTUFBQUEsT0FBTyxDQUFDSSxHQUFSLENBQVkseUJBQVo7QUFDSDs7QUFFRCxVQUFNb0gsVUFBVSxHQUFHeEUsY0FBYyxDQUFDZixPQUFmLENBQXVCLGdCQUF2QixNQUE2QyxNQUFoRTtBQUNBZSxJQUFBQSxjQUFjLENBQUNpRCxVQUFmLENBQTBCLGdCQUExQjtBQUVBakcsSUFBQUEsT0FBTyxDQUFDSSxHQUFSLENBQWEseUJBQXdCRSxNQUFPLEVBQTVDO0FBQ0EsVUFBTUQsYUFBYSxDQUFDO0FBQ2hCQyxNQUFBQSxNQUFNLEVBQUVBLE1BRFE7QUFFaEJxRixNQUFBQSxRQUFRLEVBQUVBLFFBRk07QUFHaEJwRixNQUFBQSxXQUFXLEVBQUU4RyxvQkFIRztBQUloQjdHLE1BQUFBLGFBQWEsRUFBRWEsS0FKQztBQUtoQlosTUFBQUEsaUJBQWlCLEVBQUU2RSxLQUxIO0FBTWhCNUUsTUFBQUEsS0FBSyxFQUFFYSxPQU5TO0FBT2hCNEUsTUFBQUEsU0FBUyxFQUFFQSxTQVBLO0FBUWhCcUIsTUFBQUEsVUFBVSxFQUFFQTtBQVJJLEtBQUQsRUFTaEIsS0FUZ0IsQ0FBbkI7QUFVQSxXQUFPLElBQVA7QUFDSCxHQWxDRCxNQWtDTztBQUNIeEgsSUFBQUEsT0FBTyxDQUFDSSxHQUFSLENBQVksNEJBQVo7QUFDQSxXQUFPLEtBQVA7QUFDSDtBQUNKOztBQUVELGVBQWVlLHdCQUFmLENBQXdDRjtBQUF4QztBQUFBO0FBQUE7QUFBb0U7QUFDaEVqQixFQUFBQSxPQUFPLENBQUNtRSxLQUFSLENBQWMsd0JBQWQsRUFBd0NsRCxDQUF4QztBQUVBLFFBQU13Ryx5QkFBeUIsR0FDekI5QyxHQUFHLENBQUNDLFlBQUosQ0FBaUIseUNBQWpCLENBRE47O0FBR0EsUUFBTThDLEtBQUssR0FBR3JGLGVBQU1DLG1CQUFOLENBQTBCLHVCQUExQixFQUFtRCxFQUFuRCxFQUF1RG1GLHlCQUF2RCxFQUFrRjtBQUM1RnRELElBQUFBLEtBQUssRUFBRWxELENBQUMsQ0FBQzBHO0FBRG1GLEdBQWxGLENBQWQ7O0FBSUEsUUFBTSxDQUFDL0csT0FBRCxJQUFZLE1BQU04RyxLQUFLLENBQUNFLFFBQTlCOztBQUNBLE1BQUloSCxPQUFKLEVBQWE7QUFDVDtBQUNBLFVBQU1rQyxZQUFZLEVBQWxCO0FBQ0EsV0FBTyxLQUFQO0FBQ0gsR0FmK0QsQ0FpQmhFOzs7QUFDQSxTQUFPckQsV0FBVyxFQUFsQjtBQUNIO0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNPLGVBQWVvSSxXQUFmLENBQTJCQztBQUEzQjtBQUFBO0FBQUE7QUFBbUY7QUFDdEZBLEVBQUFBLFdBQVcsQ0FBQ04sVUFBWixHQUF5QixJQUF6QjtBQUNBTyxFQUFBQSxnQkFBZ0I7QUFDaEIsUUFBTTVCLFNBQVMsR0FBRzJCLFdBQVcsQ0FBQ3hILE1BQVosSUFBc0J3SCxXQUFXLENBQUNuQyxRQUFsQyxHQUNaLE1BQU0zQixxQkFBWUMsR0FBWixHQUFrQitELGVBQWxCLENBQWtDRixXQUFXLENBQUN4SCxNQUE5QyxFQUFzRHdILFdBQVcsQ0FBQ25DLFFBQWxFLENBRE0sR0FFWixJQUZOOztBQUlBLE1BQUlRLFNBQUosRUFBZTtBQUNYbkcsSUFBQUEsT0FBTyxDQUFDSSxHQUFSLENBQVksb0JBQVo7QUFDSCxHQUZELE1BRU87QUFDSEosSUFBQUEsT0FBTyxDQUFDSSxHQUFSLENBQVksd0JBQVo7QUFDSDs7QUFFRCxTQUFPQyxhQUFhLENBQUM0SCxNQUFNLENBQUNDLE1BQVAsQ0FBYyxFQUFkLEVBQWtCSixXQUFsQixFQUErQjtBQUFDM0IsSUFBQUE7QUFBRCxHQUEvQixDQUFELEVBQThDLElBQTlDLENBQXBCO0FBQ0g7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNPLFNBQVNnQyxjQUFULENBQXdCTDtBQUF4QjtBQUFBO0FBQUE7QUFBZ0Y7QUFDbkYsUUFBTU0sU0FBUyxHQUFHbEQsaUNBQWdCakIsR0FBaEIsR0FBc0JvRSxTQUF0QixFQUFsQjs7QUFDQSxRQUFNQyxXQUFXLEdBQUdwRCxpQ0FBZ0JqQixHQUFoQixHQUFzQnNFLFdBQXRCLEVBQXBCOztBQUVBUixFQUFBQSxnQkFBZ0IsR0FKbUUsQ0FJL0Q7O0FBQ3BCL0YsRUFBQUEsWUFBWSxDQUFDaUUsVUFBYixDQUF3QixnQkFBeEI7QUFDQXVDLEVBQUFBLGFBQWEsR0FBRyxLQUFoQjtBQUVBLFFBQU1DLFNBQVMsR0FBR1gsV0FBVyxDQUFDeEgsTUFBWixLQUF1QjhILFNBQXZCLElBQW9DTixXQUFXLENBQUNuQyxRQUFaLEtBQXlCMkMsV0FBL0U7O0FBQ0EsTUFBSUcsU0FBSixFQUFlO0FBQ1h6SSxJQUFBQSxPQUFPLENBQUNDLElBQVIsQ0FBYSxvRUFBYjtBQUNIOztBQUVELFNBQU9JLGFBQWEsQ0FBQ3lILFdBQUQsRUFBY1csU0FBZCxDQUFwQjtBQUNIO0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQSxlQUFlcEksYUFBZixDQUNJeUg7QUFESjtBQUFBLEVBRUlZO0FBRko7QUFBQTtBQUFBO0FBR3lCO0FBQ3JCWixFQUFBQSxXQUFXLENBQUNwSCxLQUFaLEdBQW9CSyxPQUFPLENBQUMrRyxXQUFXLENBQUNwSCxLQUFiLENBQTNCO0FBRUEsUUFBTWlJLFVBQVUsR0FBR0MsWUFBWSxFQUEvQjtBQUVBNUksRUFBQUEsT0FBTyxDQUFDSSxHQUFSLENBQ0ksd0JBQXdCMEgsV0FBVyxDQUFDeEgsTUFBcEMsR0FDQSxhQURBLEdBQ2dCd0gsV0FBVyxDQUFDbkMsUUFENUIsR0FFQSxVQUZBLEdBRWFtQyxXQUFXLENBQUNwSCxLQUZ6QixHQUdBLE9BSEEsR0FHVW9ILFdBQVcsQ0FBQ3RILGFBSHRCLEdBSUEsZUFKQSxHQUlrQm1JLFVBTHRCLEVBTUksa0JBQWtCYixXQUFXLENBQUNOLFVBTmxDLEVBTHFCLENBY3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBcUIsc0JBQUlDLFFBQUosQ0FBYTtBQUFDQyxJQUFBQSxNQUFNLEVBQUU7QUFBVCxHQUFiLEVBQXdDLElBQXhDOztBQUVBLE1BQUlMLG1CQUFKLEVBQXlCO0FBQ3JCLFVBQU01RixZQUFZLEVBQWxCO0FBQ0g7O0FBRUQsUUFBTWtHLE9BQU8sR0FBRyxNQUFNbEQsY0FBYyxDQUFDbUQsZ0JBQWYsRUFBdEIsQ0EzQnFCLENBNEJyQjtBQUNBO0FBQ0E7O0FBQ0EsTUFBSUQsT0FBTyxDQUFDRSxrQkFBUixJQUE4QkYsT0FBTyxDQUFDRyxZQUF0QyxJQUFzRCxDQUFDSCxPQUFPLENBQUNJLGlCQUFuRSxFQUFzRjtBQUNsRixVQUFNbEMsVUFBVSxFQUFoQjtBQUNIOztBQUVEbUMscUJBQVV4QixXQUFWLENBQXNCQyxXQUFXLENBQUNwSCxLQUFsQyxFQUF5Q29ILFdBQVcsQ0FBQ3RILGFBQXJEOztBQUVBMEUsbUNBQWdCb0UsaUJBQWhCLENBQWtDeEIsV0FBbEM7O0FBQ0EsUUFBTXZDLE1BQU0sR0FBR0wsaUNBQWdCakIsR0FBaEIsRUFBZjs7QUFFQSxNQUFJNkQsV0FBVyxDQUFDTixVQUFaLElBQTBCK0IsdUJBQWNDLFFBQWQsQ0FBdUIscUJBQXZCLENBQTlCLEVBQTZFO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBLFVBQU1DLFdBQVcsR0FBRyxNQUFNbEUsTUFBTSxDQUFDbUUsZUFBUCxFQUExQjs7QUFDQSxRQUFJRCxXQUFKLEVBQWlCO0FBQ2IzQixNQUFBQSxXQUFXLENBQUNuQyxRQUFaLEdBQXVCOEQsV0FBdkI7QUFDSDs7QUFFRCxXQUFPM0IsV0FBVyxDQUFDTixVQUFuQjtBQUNIOztBQUVELE1BQUl4RixZQUFKLEVBQWtCO0FBQ2QsUUFBSTtBQUNBLFlBQU1lLGtCQUFrQixDQUFDK0UsV0FBRCxDQUF4QixDQURBLENBRUE7O0FBQ0E5RSxNQUFBQSxjQUFjLENBQUNpRCxVQUFmLENBQTBCLGdCQUExQjtBQUNILEtBSkQsQ0FJRSxPQUFPaEYsQ0FBUCxFQUFVO0FBQ1JqQixNQUFBQSxPQUFPLENBQUNDLElBQVIsQ0FBYSxtREFBYixFQUFrRWdCLENBQWxFO0FBQ0g7QUFDSixHQVJELE1BUU87QUFDSGpCLElBQUFBLE9BQU8sQ0FBQ0MsSUFBUixDQUFhLG9EQUFiO0FBQ0g7O0FBRUQ0SSxzQkFBSUMsUUFBSixDQUFhO0FBQUVDLElBQUFBLE1BQU0sRUFBRTtBQUFWLEdBQWI7O0FBRUEsUUFBTVksaUJBQWlCO0FBQUM7QUFBaUIsR0FBQ2hCLFVBQW5CLENBQXZCO0FBQ0EsU0FBT3BELE1BQVA7QUFDSDs7QUFFRCxTQUFTNkIsd0JBQVQ7QUFBQTtBQUFzRDtBQUNsRCxRQUFNd0Msb0JBQW9CLEdBQUdqRixHQUFHLENBQUNDLFlBQUosQ0FBaUIsb0NBQWpCLENBQTdCO0FBQ0EsU0FBTyxJQUFJL0MsT0FBSixDQUFZQyxPQUFPLElBQUk7QUFDMUJPLG1CQUFNQyxtQkFBTixDQUEwQixpQkFBMUIsRUFBNkMsRUFBN0MsRUFBaURzSCxvQkFBakQsRUFBdUU7QUFDbkV0RyxNQUFBQSxVQUFVLEVBQUV4QjtBQUR1RCxLQUF2RTtBQUdILEdBSk0sQ0FBUDtBQUtILEMsQ0FFRDtBQUNBOzs7QUFDQSxNQUFNWiwyQkFBTixTQUEwQzJJLEtBQTFDLENBQWdEOztBQUVoRCxlQUFlOUcsa0JBQWYsQ0FBa0MrRTtBQUFsQztBQUFBO0FBQUE7QUFBa0Y7QUFDOUU5RixFQUFBQSxZQUFZLENBQUNpQixPQUFiLENBQXFCMUQsa0JBQXJCLEVBQXlDdUksV0FBVyxDQUFDdEgsYUFBckQ7O0FBQ0EsTUFBSXNILFdBQVcsQ0FBQ3JILGlCQUFoQixFQUFtQztBQUMvQnVCLElBQUFBLFlBQVksQ0FBQ2lCLE9BQWIsQ0FBcUJ6RCxpQkFBckIsRUFBd0NzSSxXQUFXLENBQUNySCxpQkFBcEQ7QUFDSDs7QUFDRHVCLEVBQUFBLFlBQVksQ0FBQ2lCLE9BQWIsQ0FBcUIsWUFBckIsRUFBbUM2RSxXQUFXLENBQUN4SCxNQUEvQztBQUNBMEIsRUFBQUEsWUFBWSxDQUFDaUIsT0FBYixDQUFxQixhQUFyQixFQUFvQzZHLElBQUksQ0FBQ0MsU0FBTCxDQUFlakMsV0FBVyxDQUFDcEgsS0FBM0IsQ0FBcEMsRUFOOEUsQ0FROUU7QUFDQTs7QUFDQSxNQUFJb0gsV0FBVyxDQUFDdkgsV0FBaEIsRUFBNkI7QUFDekJ5QixJQUFBQSxZQUFZLENBQUNpQixPQUFiLENBQXFCLHFCQUFyQixFQUE0QyxNQUE1QztBQUNILEdBRkQsTUFFTztBQUNIakIsSUFBQUEsWUFBWSxDQUFDZ0ksVUFBYixDQUF3QixxQkFBeEI7QUFDSDs7QUFFRCxNQUFJbEMsV0FBVyxDQUFDM0IsU0FBaEIsRUFBMkI7QUFDdkIsUUFBSThELG9CQUFKOztBQUNBLFFBQUk7QUFDQTtBQUNBLFlBQU0xQyxPQUFPLEdBQUcsTUFBTXJCLGlCQUFpQixDQUFDNEIsV0FBVyxDQUFDM0IsU0FBYixDQUF2QztBQUNBOEQsTUFBQUEsb0JBQW9CLEdBQUcsTUFBTSxxQkFBV25DLFdBQVcsQ0FBQ3ZILFdBQXZCLEVBQW9DZ0gsT0FBcEMsRUFBNkMsY0FBN0MsQ0FBN0I7QUFDQUEsTUFBQUEsT0FBTyxDQUFDVixJQUFSLENBQWEsQ0FBYjtBQUNILEtBTEQsQ0FLRSxPQUFPNUYsQ0FBUCxFQUFVO0FBQ1JqQixNQUFBQSxPQUFPLENBQUNDLElBQVIsQ0FBYSxnQ0FBYixFQUErQ2dCLENBQS9DO0FBQ0g7O0FBQ0QsUUFBSTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQU02RSxjQUFjLENBQUNFLE9BQWYsQ0FDRixTQURFLEVBQ1MsaUJBRFQsRUFFRmlFLG9CQUFvQixJQUFJbkMsV0FBVyxDQUFDdkgsV0FGbEMsQ0FBTjtBQUlILEtBUkQsQ0FRRSxPQUFPVSxDQUFQLEVBQVU7QUFDUjtBQUNBO0FBQ0E7QUFDQWUsTUFBQUEsWUFBWSxDQUFDaUIsT0FBYixDQUFxQixpQkFBckIsRUFBd0M2RSxXQUFXLENBQUN2SCxXQUFwRDtBQUNIOztBQUNEeUIsSUFBQUEsWUFBWSxDQUFDaUIsT0FBYixDQUFxQixtQkFBckIsRUFBMENDLE1BQU0sQ0FBQyxJQUFELENBQWhEO0FBQ0gsR0F6QkQsTUF5Qk87QUFDSCxRQUFJO0FBQ0EsWUFBTTRDLGNBQWMsQ0FBQ0UsT0FBZixDQUNGLFNBREUsRUFDUyxpQkFEVCxFQUM0QjhCLFdBQVcsQ0FBQ3ZILFdBRHhDLENBQU47QUFHSCxLQUpELENBSUUsT0FBT1UsQ0FBUCxFQUFVO0FBQ1JlLE1BQUFBLFlBQVksQ0FBQ2lCLE9BQWIsQ0FBcUIsaUJBQXJCLEVBQXdDNkUsV0FBVyxDQUFDdkgsV0FBcEQ7QUFDSDs7QUFDRCxRQUFJeUIsWUFBWSxDQUFDQyxPQUFiLENBQXFCLG1CQUFyQixDQUFKLEVBQStDO0FBQzNDakMsTUFBQUEsT0FBTyxDQUFDbUUsS0FBUixDQUFjLHFFQUFkO0FBQ0g7QUFDSixHQXBENkUsQ0FzRDlFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBLE1BQUkyRCxXQUFXLENBQUNuQyxRQUFoQixFQUEwQjtBQUN0QjNELElBQUFBLFlBQVksQ0FBQ2lCLE9BQWIsQ0FBcUIsY0FBckIsRUFBcUM2RSxXQUFXLENBQUNuQyxRQUFqRDtBQUNIOztBQUVEdUUsb0JBQXVCbkgsa0JBQXZCLEdBQTRDK0UsV0FBNUM7QUFFQTlILEVBQUFBLE9BQU8sQ0FBQ0ksR0FBUixDQUFhLHlCQUF3QjBILFdBQVcsQ0FBQ3hILE1BQU8sRUFBeEQ7QUFDSDs7QUFFRCxJQUFJa0ksYUFBYSxHQUFHLEtBQXBCO0FBRUE7QUFDQTtBQUNBOztBQUNPLFNBQVMyQixNQUFUO0FBQUE7QUFBd0I7QUFDM0IsTUFBSSxDQUFDakYsaUNBQWdCakIsR0FBaEIsRUFBTCxFQUE0Qjs7QUFDNUIsTUFBSSxDQUFDbUcsMEJBQWlCQyxRQUFqQixDQUEwQkMsUUFBL0IsRUFBeUM7QUFDckM7QUFDQUYsOEJBQWlCQyxRQUFqQixDQUEwQkUsTUFBMUI7QUFBaUM7QUFBa0IsUUFBbkQ7QUFDSDs7QUFFRCxNQUFJckYsaUNBQWdCakIsR0FBaEIsR0FBc0IxQyxPQUF0QixFQUFKLEVBQXFDO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBaUosSUFBQUEsWUFBWSxDQUFDLE1BQU1DLFdBQVcsRUFBbEIsQ0FBWjtBQUNBO0FBQ0g7O0FBRURqQyxFQUFBQSxhQUFhLEdBQUcsSUFBaEI7O0FBQ0EsUUFBTWpELE1BQU0sR0FBR0wsaUNBQWdCakIsR0FBaEIsRUFBZjs7QUFDQUQsdUJBQVlDLEdBQVosR0FBa0J5RyxnQkFBbEIsQ0FBbUNuRixNQUFNLENBQUM4QyxTQUFQLEVBQW5DLEVBQXVEOUMsTUFBTSxDQUFDZ0QsV0FBUCxFQUF2RDs7QUFDQWhELEVBQUFBLE1BQU0sQ0FBQzRFLE1BQVAsR0FBZ0J4SixJQUFoQixDQUFxQjhKLFdBQXJCLEVBQ0tySCxHQUFELElBQVM7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBcEQsSUFBQUEsT0FBTyxDQUFDSSxHQUFSLENBQVksMERBQVo7QUFDQXFLLElBQUFBLFdBQVc7QUFDZCxHQVhMO0FBYUg7O0FBRU0sU0FBUzlCLFVBQVQ7QUFBQTtBQUE0QjtBQUMvQixNQUFJLENBQUN6RCxpQ0FBZ0JqQixHQUFoQixFQUFMLEVBQTRCLE9BREcsQ0FHL0I7QUFDQTtBQUNBOztBQUNBakMsRUFBQUEsWUFBWSxDQUFDaUIsT0FBYixDQUFxQixnQkFBckIsRUFBdUMsTUFBdkMsRUFOK0IsQ0FRL0I7QUFDQTs7QUFDQWpELEVBQUFBLE9BQU8sQ0FBQ0ksR0FBUixDQUFZLHVCQUFaO0FBQ0FvSSxFQUFBQSxhQUFhLEdBQUcsSUFBaEIsQ0FYK0IsQ0FXVDtBQUN0QjtBQUNBO0FBQ0E7O0FBQ0FLLHNCQUFJQyxRQUFKLENBQWE7QUFBQ0MsSUFBQUEsTUFBTSxFQUFFO0FBQVQsR0FBYixFQWYrQixDQWVpQjs7O0FBQ2hEaEIsRUFBQUEsZ0JBQWdCO0FBQUM7QUFBZ0IsT0FBakIsQ0FBaEIsQ0FoQitCLENBa0IvQjtBQUNIOztBQUVNLFNBQVNhLFlBQVQ7QUFBQTtBQUFpQztBQUNwQyxTQUFPNUcsWUFBWSxDQUFDQyxPQUFiLENBQXFCLGdCQUFyQixNQUEyQyxNQUFsRDtBQUNIOztBQUVNLFNBQVMwSSxZQUFUO0FBQUE7QUFBaUM7QUFDcEMsU0FBT25DLGFBQVA7QUFDSDtBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0EsZUFBZW1CLGlCQUFmLENBQWlDaUIsWUFBWSxHQUFHLElBQWhEO0FBQUE7QUFBcUU7QUFDakU1SyxFQUFBQSxPQUFPLENBQUNJLEdBQVIsQ0FBYSxrQ0FBYixFQURpRSxDQUdqRTtBQUNBO0FBQ0E7QUFDQTs7QUFDQXlJLHNCQUFJQyxRQUFKLENBQWE7QUFBQ0MsSUFBQUEsTUFBTSxFQUFFO0FBQVQsR0FBYixFQUE0QyxJQUE1QyxFQVBpRSxDQVNqRTs7O0FBQ0E4Qix1QkFBWUMsY0FBWixHQUE2QkMsS0FBN0I7O0FBQ0FDLHNCQUFXRixjQUFYLEdBQTRCQyxLQUE1Qjs7QUFFQUUsb0JBQVNDLEtBQVQ7O0FBQ0FDLHdCQUFhTCxjQUFiLEdBQThCSSxLQUE5Qjs7QUFDQUUscUJBQVVDLFVBQVYsR0FBdUJILEtBQXZCOztBQUNBSSwyQ0FBb0JSLGNBQXBCLEdBQXFDUyxhQUFyQzs7QUFDQUMsNkJBQWtCTixLQUFsQjs7QUFDQU8sdUJBQVlYLGNBQVosR0FBNkJJLEtBQTdCLEdBbEJpRSxDQW9CakU7QUFDQTtBQUNBOzs7QUFDQVEsbUJBQVFaLGNBQVIsR0FBeUJJLEtBQXpCOztBQUVBLE1BQUlOLFlBQUosRUFBa0I7QUFDZDtBQUNBO0FBQ0E7QUFDQSxVQUFNZSx1QkFBY0MsSUFBZCxFQUFOO0FBQ0EsVUFBTTFHLGlDQUFnQmdHLEtBQWhCLEVBQU47QUFDSCxHQU5ELE1BTU87QUFDSGxMLElBQUFBLE9BQU8sQ0FBQ0MsSUFBUixDQUFhLHFEQUFiO0FBQ0EsVUFBTWlGLGlDQUFnQmdELE1BQWhCLEVBQU47QUFDSCxHQWxDZ0UsQ0FvQ2pFOzs7QUFDQTJELDBCQUFlZixjQUFmLEdBQWdDSSxLQUFoQyxHQXJDaUUsQ0FzQ2pFO0FBQ0E7OztBQUNBLE1BQUksQ0FBQzNCLHVCQUFjQyxRQUFkLENBQXVCLGNBQXZCLENBQUwsRUFBNkM7QUFDekNzQyxzQkFBU1osS0FBVDtBQUNILEdBMUNnRSxDQTRDakU7OztBQUNBLFFBQU1hLGFBQU1DLFdBQU4sR0FBb0JkLEtBQXBCLEVBQU4sQ0E3Q2lFLENBK0NqRTtBQUNBOztBQUNBckMsc0JBQUlDLFFBQUosQ0FBYTtBQUFDQyxJQUFBQSxNQUFNLEVBQUU7QUFBVCxHQUFiOztBQUVBLE1BQUlILFlBQVksRUFBaEIsRUFBb0I7QUFDaEJELElBQUFBLFVBQVU7QUFDYjtBQUNKO0FBRUQ7QUFDQTtBQUNBO0FBQ0E7OztBQUNPLGVBQWU4QixXQUFmO0FBQUE7QUFBNEM7QUFDL0NqQyxFQUFBQSxhQUFhLEdBQUcsS0FBaEIsQ0FEK0MsQ0FFL0M7QUFDQTtBQUNBOztBQUNBSyxzQkFBSUMsUUFBSixDQUFhO0FBQUNDLElBQUFBLE1BQU0sRUFBRTtBQUFULEdBQWIsRUFBd0MsSUFBeEM7O0FBQ0FoQixFQUFBQSxnQkFBZ0I7QUFDaEIsUUFBTWpGLFlBQVksQ0FBQztBQUFDbUosSUFBQUEsZ0JBQWdCLEVBQUU7QUFBbkIsR0FBRCxDQUFsQjtBQUNBQyxxQkFBd0JDLDRCQUF4QjtBQUNIO0FBRUQ7QUFDQTtBQUNBO0FBQ0E7OztBQUNBLGVBQWVySixZQUFmLENBQTRCcEQ7QUFBNUI7QUFBQTtBQUFBO0FBQWtGO0FBQzlFMkoscUJBQVUrQyxPQUFWOztBQUVBLE1BQUlwSCxNQUFNLENBQUNoRCxZQUFYLEVBQXlCO0FBQ3JCO0FBQ0EsVUFBTXFLLGNBQWMsR0FBR0MsNkJBQW9CakMsUUFBcEIsQ0FBNkJrQyxjQUE3QixFQUF2Qjs7QUFFQXZILElBQUFBLE1BQU0sQ0FBQ2hELFlBQVAsQ0FBb0J3SyxLQUFwQjs7QUFFQSxRQUFJO0FBQ0EsWUFBTTFHLGNBQWMsQ0FBQzJHLFNBQWYsQ0FBeUIsU0FBekIsRUFBb0MsaUJBQXBDLENBQU47QUFDSCxLQUZELENBRUUsT0FBT3hMLENBQVAsRUFBVSxDQUFFLENBUk8sQ0FVckI7OztBQUNBLFFBQUksQ0FBQ3ZCLElBQUksRUFBRXVNLGdCQUFYLEVBQTZCO0FBQ3pCSSxNQUFBQSxjQUFjLENBQUNLLE9BQWYsQ0FBdUJuRyxDQUFDLElBQUk7QUFDeEIsY0FBTW9HLE1BQU0sR0FBR3BHLENBQUMsQ0FBQ29HLE1BQWpCO0FBQ0EsZUFBT3BHLENBQUMsQ0FBQ29HLE1BQVQsQ0FGd0IsQ0FFUDs7QUFDakJMLHFDQUFvQmpDLFFBQXBCLENBQTZCdUMsV0FBN0IsQ0FBeUNELE1BQXpDLEVBQWlEcEcsQ0FBakQ7QUFDSCxPQUpEO0FBS0g7QUFDSjs7QUFFRCxNQUFJdkIsTUFBTSxDQUFDaEMsY0FBWCxFQUEyQjtBQUN2QmdDLElBQUFBLE1BQU0sQ0FBQ2hDLGNBQVAsQ0FBc0J3SixLQUF0QjtBQUNILEdBekI2RSxDQTJCOUU7OztBQUNBLFFBQU1oSixHQUFHLEdBQUcsaUNBQW1CO0FBQzNCO0FBQ0FHLElBQUFBLE9BQU8sRUFBRTtBQUZrQixHQUFuQixDQUFaO0FBS0EsUUFBTWdJLHVCQUFja0IsZ0JBQWQsRUFBTjtBQUNBLFFBQU1ySixHQUFHLENBQUNzSixXQUFKLEVBQU47QUFDSDtBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNPLFNBQVMvRSxnQkFBVCxDQUEwQmdGLFdBQVcsR0FBRyxJQUF4QztBQUFBO0FBQW9EO0FBQ3ZEOUIsb0JBQVMrQixJQUFUOztBQUNBdkIsdUJBQVlYLGNBQVosR0FBNkJrQyxJQUE3Qjs7QUFDQTdCLHdCQUFhTCxjQUFiLEdBQThCa0MsSUFBOUI7O0FBQ0FuQyx1QkFBWUMsY0FBWixHQUE2QkMsS0FBN0I7O0FBQ0FlLG9CQUFTa0IsSUFBVDs7QUFDQXhCLDZCQUFrQndCLElBQWxCOztBQUNBMUIsMkNBQW9CUixjQUFwQixHQUFxQ21DLFlBQXJDOztBQUNBdkIsbUJBQVFaLGNBQVIsR0FBeUJrQyxJQUF6Qjs7QUFDQW5CLDBCQUFlZixjQUFmLEdBQWdDa0MsSUFBaEM7O0FBQ0EsTUFBSTVCLG1CQUFVOEIsTUFBVixFQUFKLEVBQXdCOUIsbUJBQVU4QixNQUFWLEdBQW1CRixJQUFuQjs7QUFDeEJyQix5QkFBY3FCLElBQWQ7O0FBQ0EsUUFBTXhKLEdBQUcsR0FBRzBCLGlDQUFnQmpCLEdBQWhCLEVBQVo7O0FBQ0EsTUFBSVQsR0FBSixFQUFTO0FBQ0xBLElBQUFBLEdBQUcsQ0FBQzJKLFVBQUo7QUFDQTNKLElBQUFBLEdBQUcsQ0FBQzRKLGtCQUFKOztBQUVBLFFBQUlMLFdBQUosRUFBaUI7QUFDYjdILHVDQUFnQm1JLEtBQWhCOztBQUNBMUIsNkJBQWMwQixLQUFkO0FBQ0g7QUFDSjtBQUNKIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuLy8gQHRzLWlnbm9yZSAtIFhYWDogdHNjIGRvZXNuJ3QgbGlrZSB0aGlzOiBvdXIganMtc2RrIGltcG9ydHMgYXJlIGNvbXBsZXggc28gdGhpcyBpc24ndCBzdXJwcmlzaW5nXG5pbXBvcnQgTWF0cml4IGZyb20gJ21hdHJpeC1qcy1zZGsnO1xuaW1wb3J0IHsgSW52YWxpZFN0b3JlRXJyb3IgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvZXJyb3JzXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQge2RlY3J5cHRBRVMsIGVuY3J5cHRBRVN9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vYWVzXCI7XG5cbmltcG9ydCB7SU1hdHJpeENsaWVudENyZWRzLCBNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBTZWN1cml0eUN1c3RvbWlzYXRpb25zIGZyb20gXCIuL2N1c3RvbWlzYXRpb25zL1NlY3VyaXR5XCI7XG5pbXBvcnQgRXZlbnRJbmRleFBlZyBmcm9tICcuL2luZGV4aW5nL0V2ZW50SW5kZXhQZWcnO1xuaW1wb3J0IGNyZWF0ZU1hdHJpeENsaWVudCBmcm9tICcuL3V0aWxzL2NyZWF0ZU1hdHJpeENsaWVudCc7XG5pbXBvcnQgQW5hbHl0aWNzIGZyb20gJy4vQW5hbHl0aWNzJztcbmltcG9ydCBOb3RpZmllciBmcm9tICcuL05vdGlmaWVyJztcbmltcG9ydCBVc2VyQWN0aXZpdHkgZnJvbSAnLi9Vc2VyQWN0aXZpdHknO1xuaW1wb3J0IFByZXNlbmNlIGZyb20gJy4vUHJlc2VuY2UnO1xuaW1wb3J0IGRpcyBmcm9tICcuL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgRE1Sb29tTWFwIGZyb20gJy4vdXRpbHMvRE1Sb29tTWFwJztcbmltcG9ydCBNb2RhbCBmcm9tICcuL01vZGFsJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuL2luZGV4JztcbmltcG9ydCBBY3RpdmVXaWRnZXRTdG9yZSBmcm9tICcuL3N0b3Jlcy9BY3RpdmVXaWRnZXRTdG9yZSc7XG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSBcIi4vUGxhdGZvcm1QZWdcIjtcbmltcG9ydCB7IHNlbmRMb2dpblJlcXVlc3QgfSBmcm9tIFwiLi9Mb2dpblwiO1xuaW1wb3J0ICogYXMgU3RvcmFnZU1hbmFnZXIgZnJvbSAnLi91dGlscy9TdG9yYWdlTWFuYWdlcic7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgVHlwaW5nU3RvcmUgZnJvbSBcIi4vc3RvcmVzL1R5cGluZ1N0b3JlXCI7XG5pbXBvcnQgVG9hc3RTdG9yZSBmcm9tIFwiLi9zdG9yZXMvVG9hc3RTdG9yZVwiO1xuaW1wb3J0IHtJbnRlZ3JhdGlvbk1hbmFnZXJzfSBmcm9tIFwiLi9pbnRlZ3JhdGlvbnMvSW50ZWdyYXRpb25NYW5hZ2Vyc1wiO1xuaW1wb3J0IHtNam9sbmlyfSBmcm9tIFwiLi9tam9sbmlyL01qb2xuaXJcIjtcbmltcG9ydCBEZXZpY2VMaXN0ZW5lciBmcm9tIFwiLi9EZXZpY2VMaXN0ZW5lclwiO1xuaW1wb3J0IHtKaXRzaX0gZnJvbSBcIi4vd2lkZ2V0cy9KaXRzaVwiO1xuaW1wb3J0IHtTU09fSE9NRVNFUlZFUl9VUkxfS0VZLCBTU09fSURfU0VSVkVSX1VSTF9LRVksIFNTT19JRFBfSURfS0VZfSBmcm9tIFwiLi9CYXNlUGxhdGZvcm1cIjtcbmltcG9ydCBUaHJlZXBpZEludml0ZVN0b3JlIGZyb20gXCIuL3N0b3Jlcy9UaHJlZXBpZEludml0ZVN0b3JlXCI7XG5pbXBvcnQgQ291bnRseUFuYWx5dGljcyBmcm9tIFwiLi9Db3VudGx5QW5hbHl0aWNzXCI7XG5pbXBvcnQgQ2FsbEhhbmRsZXIgZnJvbSAnLi9DYWxsSGFuZGxlcic7XG5pbXBvcnQgTGlmZWN5Y2xlQ3VzdG9taXNhdGlvbnMgZnJvbSBcIi4vY3VzdG9taXNhdGlvbnMvTGlmZWN5Y2xlXCI7XG5pbXBvcnQgRXJyb3JEaWFsb2cgZnJvbSBcIi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0Vycm9yRGlhbG9nXCI7XG5pbXBvcnQge190fSBmcm9tIFwiLi9sYW5ndWFnZUhhbmRsZXJcIjtcblxuY29uc3QgSE9NRVNFUlZFUl9VUkxfS0VZID0gXCJteF9oc191cmxcIjtcbmNvbnN0IElEX1NFUlZFUl9VUkxfS0VZID0gXCJteF9pc191cmxcIjtcblxuaW50ZXJmYWNlIElMb2FkU2Vzc2lvbk9wdHMge1xuICAgIGVuYWJsZUd1ZXN0PzogYm9vbGVhbjtcbiAgICBndWVzdEhzVXJsPzogc3RyaW5nO1xuICAgIGd1ZXN0SXNVcmw/OiBzdHJpbmc7XG4gICAgaWdub3JlR3Vlc3Q/OiBib29sZWFuO1xuICAgIGRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZT86IHN0cmluZztcbiAgICBmcmFnbWVudFF1ZXJ5UGFyYW1zPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuLyoqXG4gKiBDYWxsZWQgYXQgc3RhcnR1cCwgdG8gYXR0ZW1wdCB0byBidWlsZCBhIGxvZ2dlZC1pbiBNYXRyaXggc2Vzc2lvbi4gSXQgdHJpZXNcbiAqIGEgbnVtYmVyIG9mIHRoaW5nczpcbiAqXG4gKiAxLiBpZiB3ZSBoYXZlIGEgZ3Vlc3QgYWNjZXNzIHRva2VuIGluIHRoZSBmcmFnbWVudCBxdWVyeSBwYXJhbXMsIGl0IHVzZXNcbiAqICAgIHRoYXQuXG4gKiAyLiBpZiBhbiBhY2Nlc3MgdG9rZW4gaXMgc3RvcmVkIGluIGxvY2FsIHN0b3JhZ2UgKGZyb20gYSBwcmV2aW91cyBzZXNzaW9uKSxcbiAqICAgIGl0IHVzZXMgdGhhdC5cbiAqIDMuIGl0IGF0dGVtcHRzIHRvIGF1dG8tcmVnaXN0ZXIgYXMgYSBndWVzdCB1c2VyLlxuICpcbiAqIElmIGFueSBvZiBzdGVwcyAxLTQgYXJlIHN1Y2Nlc3NmdWwsIGl0IHdpbGwgY2FsbCB7X2RvU2V0TG9nZ2VkSW59LCB3aGljaCBpblxuICogdHVybiB3aWxsIHJhaXNlIG9uX2xvZ2dlZF9pbiBhbmQgd2lsbF9zdGFydF9jbGllbnQgZXZlbnRzLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0c11cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0cy5mcmFnbWVudFF1ZXJ5UGFyYW1zXTogc3RyaW5nLT5zdHJpbmcgbWFwIG9mIHRoZVxuICogICAgIHF1ZXJ5LXBhcmFtZXRlcnMgZXh0cmFjdGVkIGZyb20gdGhlICMtZnJhZ21lbnQgb2YgdGhlIHN0YXJ0aW5nIFVSSS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdHMuZW5hYmxlR3Vlc3RdOiBzZXQgdG8gdHJ1ZSB0byBlbmFibGUgZ3Vlc3QgYWNjZXNzXG4gKiAgICAgdG9rZW5zIGFuZCBhdXRvLWd1ZXN0IHJlZ2lzdHJhdGlvbnMuXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdHMuZ3Vlc3RIc1VybF06IGhvbWVzZXJ2ZXIgVVJMLiBPbmx5IHVzZWQgaWYgZW5hYmxlR3Vlc3RcbiAqICAgICBpcyB0cnVlOyBkZWZpbmVzIHRoZSBIUyB0byByZWdpc3RlciBhZ2FpbnN0LlxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRzLmd1ZXN0SXNVcmxdOiBob21lc2VydmVyIFVSTC4gT25seSB1c2VkIGlmIGVuYWJsZUd1ZXN0XG4gKiAgICAgaXMgdHJ1ZTsgZGVmaW5lcyB0aGUgSVMgdG8gdXNlLlxuICogQHBhcmFtIHtib29sfSBbb3B0cy5pZ25vcmVHdWVzdF06IElmIHRoZSBzdG9yZWQgc2Vzc2lvbiBpcyBhIGd1ZXN0IGFjY291bnQsXG4gKiAgICAgaWdub3JlIGl0IGFuZCBkb24ndCBsb2FkIGl0LlxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRzLmRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZV06IERlZmF1bHQgZGlzcGxheSBuYW1lIHRvIHVzZVxuICogICAgIHdoZW4gcmVnaXN0ZXJpbmcgYXMgYSBndWVzdC5cbiAqIEByZXR1cm5zIHtQcm9taXNlfSBhIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2hlbiB0aGUgYWJvdmUgcHJvY2VzcyBjb21wbGV0ZXMuXG4gKiAgICAgUmVzb2x2ZXMgdG8gYHRydWVgIGlmIHdlIGVuZGVkIHVwIHN0YXJ0aW5nIGEgc2Vzc2lvbiwgb3IgYGZhbHNlYCBpZiB3ZVxuICogICAgIGZhaWxlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRTZXNzaW9uKG9wdHM6IElMb2FkU2Vzc2lvbk9wdHMgPSB7fSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICAgIGxldCBlbmFibGVHdWVzdCA9IG9wdHMuZW5hYmxlR3Vlc3QgfHwgZmFsc2U7XG4gICAgICAgIGNvbnN0IGd1ZXN0SHNVcmwgPSBvcHRzLmd1ZXN0SHNVcmw7XG4gICAgICAgIGNvbnN0IGd1ZXN0SXNVcmwgPSBvcHRzLmd1ZXN0SXNVcmw7XG4gICAgICAgIGNvbnN0IGZyYWdtZW50UXVlcnlQYXJhbXMgPSBvcHRzLmZyYWdtZW50UXVlcnlQYXJhbXMgfHwge307XG4gICAgICAgIGNvbnN0IGRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSA9IG9wdHMuZGVmYXVsdERldmljZURpc3BsYXlOYW1lO1xuXG4gICAgICAgIGlmIChlbmFibGVHdWVzdCAmJiAhZ3Vlc3RIc1VybCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiQ2Fubm90IGVuYWJsZSBndWVzdCBhY2Nlc3M6IGNhbid0IGRldGVybWluZSBIUyBVUkwgdG8gdXNlXCIpO1xuICAgICAgICAgICAgZW5hYmxlR3Vlc3QgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGVuYWJsZUd1ZXN0ICYmXG4gICAgICAgICAgICBmcmFnbWVudFF1ZXJ5UGFyYW1zLmd1ZXN0X3VzZXJfaWQgJiZcbiAgICAgICAgICAgIGZyYWdtZW50UXVlcnlQYXJhbXMuZ3Vlc3RfYWNjZXNzX3Rva2VuXG4gICAgICAgICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVc2luZyBndWVzdCBhY2Nlc3MgY3JlZGVudGlhbHNcIik7XG4gICAgICAgICAgICByZXR1cm4gZG9TZXRMb2dnZWRJbih7XG4gICAgICAgICAgICAgICAgdXNlcklkOiBmcmFnbWVudFF1ZXJ5UGFyYW1zLmd1ZXN0X3VzZXJfaWQsXG4gICAgICAgICAgICAgICAgYWNjZXNzVG9rZW46IGZyYWdtZW50UXVlcnlQYXJhbXMuZ3Vlc3RfYWNjZXNzX3Rva2VuLFxuICAgICAgICAgICAgICAgIGhvbWVzZXJ2ZXJVcmw6IGd1ZXN0SHNVcmwsXG4gICAgICAgICAgICAgICAgaWRlbnRpdHlTZXJ2ZXJVcmw6IGd1ZXN0SXNVcmwsXG4gICAgICAgICAgICAgICAgZ3Vlc3Q6IHRydWUsXG4gICAgICAgICAgICB9LCB0cnVlKS50aGVuKCgpID0+IHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN1Y2Nlc3MgPSBhd2FpdCByZXN0b3JlRnJvbUxvY2FsU3RvcmFnZSh7XG4gICAgICAgICAgICBpZ25vcmVHdWVzdDogQm9vbGVhbihvcHRzLmlnbm9yZUd1ZXN0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbmFibGVHdWVzdCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlZ2lzdGVyQXNHdWVzdChndWVzdEhzVXJsLCBndWVzdElzVXJsLCBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZmFsbCBiYWNrIHRvIHdlbGNvbWUgc2NyZWVuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgQWJvcnRMb2dpbkFuZFJlYnVpbGRTdG9yYWdlKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSdyZSBhYm9ydGluZyBsb2dpbiBiZWNhdXNlIG9mIGEgc3RvcmFnZSBpbmNvbnNpc3RlbmN5LCB3ZSBkb24ndFxuICAgICAgICAgICAgLy8gbmVlZCB0byBzaG93IHRoZSBnZW5lcmFsIGZhaWx1cmUgZGlhbG9nLiBJbnN0ZWFkLCBqdXN0IGdvIGJhY2sgdG8gd2VsY29tZS5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFuZGxlTG9hZFNlc3Npb25GYWlsdXJlKGUpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBHZXRzIHRoZSB1c2VyIElEIG9mIHRoZSBwZXJzaXN0ZWQgc2Vzc2lvbiwgaWYgb25lIGV4aXN0cy4gVGhpcyBkb2VzIG5vdCB2YWxpZGF0ZVxuICogdGhhdCB0aGUgdXNlcidzIGNyZWRlbnRpYWxzIHN0aWxsIHdvcmssIGp1c3QgdGhhdCB0aGV5IGV4aXN0IGFuZCB0aGF0IGEgdXNlciBJRFxuICogaXMgYXNzb2NpYXRlZCB3aXRoIHRoZW0uIFRoZSBzZXNzaW9uIGlzIG5vdCBsb2FkZWQuXG4gKiBAcmV0dXJucyB7W1N0cmluZywgYm9vbF19IFRoZSBwZXJzaXN0ZWQgc2Vzc2lvbidzIG93bmVyIGFuZCB3aGV0aGVyIHRoZSBzdG9yZWRcbiAqICAgICBzZXNzaW9uIGlzIGZvciBhIGd1ZXN0IHVzZXIsIGlmIGFuIG93bmVyIGV4aXN0cy4gSWYgdGhlcmUgaXMgbm8gc3RvcmVkIHNlc3Npb24sXG4gKiAgICAgcmV0dXJuIFtudWxsLCBudWxsXS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFN0b3JlZFNlc3Npb25Pd25lcigpOiBQcm9taXNlPFtzdHJpbmcsIGJvb2xlYW5dPiB7XG4gICAgY29uc3Qge2hzVXJsLCB1c2VySWQsIGhhc0FjY2Vzc1Rva2VuLCBpc0d1ZXN0fSA9IGF3YWl0IGdldFN0b3JlZFNlc3Npb25WYXJzKCk7XG4gICAgcmV0dXJuIGhzVXJsICYmIHVzZXJJZCAmJiBoYXNBY2Nlc3NUb2tlbiA/IFt1c2VySWQsIGlzR3Vlc3RdIDogW251bGwsIG51bGxdO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7T2JqZWN0fSBxdWVyeVBhcmFtcyAgICBzdHJpbmctPnN0cmluZyBtYXAgb2YgdGhlXG4gKiAgICAgcXVlcnktcGFyYW1ldGVycyBleHRyYWN0ZWQgZnJvbSB0aGUgcmVhbCBxdWVyeS1zdHJpbmcgb2YgdGhlIHN0YXJ0aW5nXG4gKiAgICAgVVJJLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBmcmFnbWVudEFmdGVyTG9naW4gcGF0aCB0byBnbyB0byBhZnRlciBhIHN1Y2Nlc3NmdWwgbG9naW4sIG9ubHkgdXNlZCBmb3IgXCJUcnkgYWdhaW5cIlxuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHRvIHRydWUgaWYgd2UgY29tcGxldGVkIHRoZSB0b2tlblxuICogICAgbG9naW4sIGVsc2UgZmFsc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGF0dGVtcHRUb2tlbkxvZ2luKFxuICAgIHF1ZXJ5UGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+LFxuICAgIGRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZT86IHN0cmluZyxcbiAgICBmcmFnbWVudEFmdGVyTG9naW4/OiBzdHJpbmcsXG4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAoIXF1ZXJ5UGFyYW1zLmxvZ2luVG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG4gICAgfVxuXG4gICAgY29uc3QgaG9tZXNlcnZlciA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFNTT19IT01FU0VSVkVSX1VSTF9LRVkpO1xuICAgIGNvbnN0IGlkZW50aXR5U2VydmVyID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oU1NPX0lEX1NFUlZFUl9VUkxfS0VZKTtcbiAgICBpZiAoIWhvbWVzZXJ2ZXIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiQ2Fubm90IGxvZyBpbiB3aXRoIHRva2VuOiBjYW4ndCBkZXRlcm1pbmUgSFMgVVJMIHRvIHVzZVwiKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhcIlNTT1wiLCBcIlVua25vd24gSFNcIiwgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdChcIldlIGNvdWxkbid0IGxvZyB5b3UgaW5cIiksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJXZSBhc2tlZCB0aGUgYnJvd3NlciB0byByZW1lbWJlciB3aGljaCBob21lc2VydmVyIHlvdSB1c2UgdG8gbGV0IHlvdSBzaWduIGluLCBcIiArXG4gICAgICAgICAgICAgICAgXCJidXQgdW5mb3J0dW5hdGVseSB5b3VyIGJyb3dzZXIgaGFzIGZvcmdvdHRlbiBpdC4gR28gdG8gdGhlIHNpZ24gaW4gcGFnZSBhbmQgdHJ5IGFnYWluLlwiKSxcbiAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJUcnkgYWdhaW5cIiksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VuZExvZ2luUmVxdWVzdChcbiAgICAgICAgaG9tZXNlcnZlcixcbiAgICAgICAgaWRlbnRpdHlTZXJ2ZXIsXG4gICAgICAgIFwibS5sb2dpbi50b2tlblwiLCB7XG4gICAgICAgICAgICB0b2tlbjogcXVlcnlQYXJhbXMubG9naW5Ub2tlbixcbiAgICAgICAgICAgIGluaXRpYWxfZGV2aWNlX2Rpc3BsYXlfbmFtZTogZGVmYXVsdERldmljZURpc3BsYXlOYW1lLFxuICAgICAgICB9LFxuICAgICkudGhlbihmdW5jdGlvbihjcmVkcykge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkxvZ2dlZCBpbiB3aXRoIHRva2VuXCIpO1xuICAgICAgICByZXR1cm4gY2xlYXJTdG9yYWdlKCkudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCBwZXJzaXN0Q3JlZGVudGlhbHMoY3JlZHMpO1xuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdGhhdCB3ZSBqdXN0IGxvZ2dlZCBpblxuICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShcIm14X2ZyZXNoX2xvZ2luXCIsIFN0cmluZyh0cnVlKSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFwiU1NPXCIsIFwiVG9rZW4gUmVqZWN0ZWRcIiwgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdChcIldlIGNvdWxkbid0IGxvZyB5b3UgaW5cIiksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZXJyLm5hbWUgPT09IFwiQ29ubmVjdGlvbkVycm9yXCJcbiAgICAgICAgICAgICAgICA/IF90KFwiWW91ciBob21lc2VydmVyIHdhcyB1bnJlYWNoYWJsZSBhbmQgd2FzIG5vdCBhYmxlIHRvIGxvZyB5b3UgaW4uIFBsZWFzZSB0cnkgYWdhaW4uIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJJZiB0aGlzIGNvbnRpbnVlcywgcGxlYXNlIGNvbnRhY3QgeW91ciBob21lc2VydmVyIGFkbWluaXN0cmF0b3IuXCIpXG4gICAgICAgICAgICAgICAgOiBfdChcIllvdXIgaG9tZXNlcnZlciByZWplY3RlZCB5b3VyIGxvZyBpbiBhdHRlbXB0LiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiVGhpcyBjb3VsZCBiZSBkdWUgdG8gdGhpbmdzIGp1c3QgdGFraW5nIHRvbyBsb25nLiBQbGVhc2UgdHJ5IGFnYWluLiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiSWYgdGhpcyBjb250aW51ZXMsIHBsZWFzZSBjb250YWN0IHlvdXIgaG9tZXNlcnZlciBhZG1pbmlzdHJhdG9yLlwiKSxcbiAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJUcnkgYWdhaW5cIiksXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiB0cnlBZ2FpbiA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRyeUFnYWluKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeC5jcmVhdGVDbGllbnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVVybDogaG9tZXNlcnZlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkQmFzZVVybDogaWRlbnRpdHlTZXJ2ZXIsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZHBJZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFNTT19JRFBfSURfS0VZKSB8fCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIFBsYXRmb3JtUGVnLmdldCgpLnN0YXJ0U2luZ2xlU2lnbk9uKGNsaSwgXCJzc29cIiwgZnJhZ21lbnRBZnRlckxvZ2luLCBpZHBJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gbG9nIGluIHdpdGggbG9naW4gdG9rZW46XCIpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZUludmFsaWRTdG9yZUVycm9yKGU6IEludmFsaWRTdG9yZUVycm9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGUucmVhc29uID09PSBJbnZhbGlkU3RvcmVFcnJvci5UT0dHTEVEX0xBWllfTE9BRElORykge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsYXp5TG9hZEVuYWJsZWQgPSBlLnZhbHVlO1xuICAgICAgICAgICAgaWYgKGxhenlMb2FkRW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IExhenlMb2FkaW5nUmVzeW5jRGlhbG9nID1cbiAgICAgICAgICAgICAgICAgICAgc2RrLmdldENvbXBvbmVudChcInZpZXdzLmRpYWxvZ3MuTGF6eUxvYWRpbmdSZXN5bmNEaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhMYXp5TG9hZGluZ1Jlc3luY0RpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZDogcmVzb2x2ZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHNob3cgd2FybmluZyBhYm91dCBzaW11bHRhbmVvdXMgdXNlXG4gICAgICAgICAgICAgICAgLy8gYmV0d2VlbiBMTC9ub24tTEwgdmVyc2lvbiBvbiBzYW1lIGhvc3QuXG4gICAgICAgICAgICAgICAgLy8gYXMgZGlzYWJsaW5nIExMIHdoZW4gcHJldmlvdXNseSBlbmFibGVkXG4gICAgICAgICAgICAgICAgLy8gaXMgYSBzdHJvbmcgaW5kaWNhdG9yIG9mIHRoaXMgKC9kZXZlbG9wICYgL2FwcClcbiAgICAgICAgICAgICAgICBjb25zdCBMYXp5TG9hZGluZ0Rpc2FibGVkRGlhbG9nID1cbiAgICAgICAgICAgICAgICAgICAgc2RrLmdldENvbXBvbmVudChcInZpZXdzLmRpYWxvZ3MuTGF6eUxvYWRpbmdEaXNhYmxlZERpYWxvZ1wiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKExhenlMb2FkaW5nRGlzYWJsZWREaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6IHJlc29sdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBob3N0OiB3aW5kb3cubG9jYXRpb24uaG9zdCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zdG9yZS5kZWxldGVBbGxEYXRhKCk7XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgUGxhdGZvcm1QZWcuZ2V0KCkucmVsb2FkKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJBc0d1ZXN0KFxuICAgIGhzVXJsOiBzdHJpbmcsXG4gICAgaXNVcmw6IHN0cmluZyxcbiAgICBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU6IHN0cmluZyxcbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnNvbGUubG9nKGBEb2luZyBndWVzdCBsb2dpbiBvbiAke2hzVXJsfWApO1xuXG4gICAgLy8gY3JlYXRlIGEgdGVtcG9yYXJ5IE1hdHJpeENsaWVudCB0byBkbyB0aGUgbG9naW5cbiAgICBjb25zdCBjbGllbnQgPSBNYXRyaXguY3JlYXRlQ2xpZW50KHtcbiAgICAgICAgYmFzZVVybDogaHNVcmwsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2xpZW50LnJlZ2lzdGVyR3Vlc3Qoe1xuICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICBpbml0aWFsX2RldmljZV9kaXNwbGF5X25hbWU6IGRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSxcbiAgICAgICAgfSxcbiAgICB9KS50aGVuKChjcmVkcykgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgUmVnaXN0ZXJlZCBhcyBndWVzdDogJHtjcmVkcy51c2VyX2lkfWApO1xuICAgICAgICByZXR1cm4gZG9TZXRMb2dnZWRJbih7XG4gICAgICAgICAgICB1c2VySWQ6IGNyZWRzLnVzZXJfaWQsXG4gICAgICAgICAgICBkZXZpY2VJZDogY3JlZHMuZGV2aWNlX2lkLFxuICAgICAgICAgICAgYWNjZXNzVG9rZW46IGNyZWRzLmFjY2Vzc190b2tlbixcbiAgICAgICAgICAgIGhvbWVzZXJ2ZXJVcmw6IGhzVXJsLFxuICAgICAgICAgICAgaWRlbnRpdHlTZXJ2ZXJVcmw6IGlzVXJsLFxuICAgICAgICAgICAgZ3Vlc3Q6IHRydWUsXG4gICAgICAgIH0sIHRydWUpLnRoZW4oKCkgPT4gdHJ1ZSk7XG4gICAgfSwgKGVycikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHJlZ2lzdGVyIGFzIGd1ZXN0XCIsIGVycik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJU3RvcmVkU2Vzc2lvbiB7XG4gICAgaHNVcmw6IHN0cmluZztcbiAgICBpc1VybDogc3RyaW5nO1xuICAgIGhhc0FjY2Vzc1Rva2VuOiBib29sZWFuO1xuICAgIGFjY2Vzc1Rva2VuOiBzdHJpbmcgfCBvYmplY3Q7XG4gICAgdXNlcklkOiBzdHJpbmc7XG4gICAgZGV2aWNlSWQ6IHN0cmluZztcbiAgICBpc0d1ZXN0OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgc3RvcmVkIHNlc3Npb24gZnJvbSB0aGUgYnJvd3NlcidzIHN0b3JhZ2UuIFRoZSBzZXNzaW9uXG4gKiBtYXkgbm90IGJlIHZhbGlkLCBhcyBpdCBpcyBub3QgdGVzdGVkIGZvciBjb25zaXN0ZW5jeSBoZXJlLlxuICogQHJldHVybnMge09iamVjdH0gSW5mb3JtYXRpb24gYWJvdXQgdGhlIHNlc3Npb24gLSBzZWUgaW1wbGVtZW50YXRpb24gZm9yIHZhcmlhYmxlcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFN0b3JlZFNlc3Npb25WYXJzKCk6IFByb21pc2U8SVN0b3JlZFNlc3Npb24+IHtcbiAgICBjb25zdCBoc1VybCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKEhPTUVTRVJWRVJfVVJMX0tFWSk7XG4gICAgY29uc3QgaXNVcmwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShJRF9TRVJWRVJfVVJMX0tFWSk7XG4gICAgbGV0IGFjY2Vzc1Rva2VuO1xuICAgIHRyeSB7XG4gICAgICAgIGFjY2Vzc1Rva2VuID0gYXdhaXQgU3RvcmFnZU1hbmFnZXIuaWRiTG9hZChcImFjY291bnRcIiwgXCJteF9hY2Nlc3NfdG9rZW5cIik7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICBpZiAoIWFjY2Vzc1Rva2VuKSB7XG4gICAgICAgIGFjY2Vzc1Rva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJteF9hY2Nlc3NfdG9rZW5cIik7XG4gICAgICAgIGlmIChhY2Nlc3NUb2tlbikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyB0cnkgdG8gbWlncmF0ZSBhY2Nlc3MgdG9rZW4gdG8gSW5kZXhlZERCIGlmIHdlIGNhblxuICAgICAgICAgICAgICAgIGF3YWl0IFN0b3JhZ2VNYW5hZ2VyLmlkYlNhdmUoXCJhY2NvdW50XCIsIFwibXhfYWNjZXNzX3Rva2VuXCIsIGFjY2Vzc1Rva2VuKTtcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcIm14X2FjY2Vzc190b2tlblwiKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gaWYgd2UgcHJlLWRhdGUgc3RvcmluZyBcIm14X2hhc19hY2Nlc3NfdG9rZW5cIiwgYnV0IHdlIHJldHJpZXZlZCBhbiBhY2Nlc3NcbiAgICAvLyB0b2tlbiwgdGhlbiB3ZSBzaG91bGQgc2F5IHdlIGhhdmUgYW4gYWNjZXNzIHRva2VuXG4gICAgY29uc3QgaGFzQWNjZXNzVG9rZW4gPVxuICAgICAgICAobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJteF9oYXNfYWNjZXNzX3Rva2VuXCIpID09PSBcInRydWVcIikgfHwgISFhY2Nlc3NUb2tlbjtcbiAgICBjb25zdCB1c2VySWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm14X3VzZXJfaWRcIik7XG4gICAgY29uc3QgZGV2aWNlSWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm14X2RldmljZV9pZFwiKTtcblxuICAgIGxldCBpc0d1ZXN0O1xuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm14X2lzX2d1ZXN0XCIpICE9PSBudWxsKSB7XG4gICAgICAgIGlzR3Vlc3QgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm14X2lzX2d1ZXN0XCIpID09PSBcInRydWVcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBsZWdhY3kga2V5IG5hbWVcbiAgICAgICAgaXNHdWVzdCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibWF0cml4LWlzLWd1ZXN0XCIpID09PSBcInRydWVcIjtcbiAgICB9XG5cbiAgICByZXR1cm4ge2hzVXJsLCBpc1VybCwgaGFzQWNjZXNzVG9rZW4sIGFjY2Vzc1Rva2VuLCB1c2VySWQsIGRldmljZUlkLCBpc0d1ZXN0fTtcbn1cblxuLy8gVGhlIHBpY2tsZSBrZXkgaXMgYSBzdHJpbmcgb2YgdW5zcGVjaWZpZWQgbGVuZ3RoIGFuZCBmb3JtYXQuICBGb3IgQUVTLCB3ZVxuLy8gbmVlZCBhIDI1Ni1iaXQgVWludDhBcnJheS4gIFNvIHdlIEhLREYgdGhlIHBpY2tsZSBrZXkgdG8gZ2VuZXJhdGUgdGhlIEFFU1xuLy8ga2V5LiAgVGhlIEFFUyBrZXkgc2hvdWxkIGJlIHplcm9lZCBhZnRlciBpdCBpcyB1c2VkLlxuYXN5bmMgZnVuY3Rpb24gcGlja2xlS2V5VG9BZXNLZXkocGlja2xlS2V5OiBzdHJpbmcpOiBQcm9taXNlPFVpbnQ4QXJyYXk+IHtcbiAgICBjb25zdCBwaWNrbGVLZXlCdWZmZXIgPSBuZXcgVWludDhBcnJheShwaWNrbGVLZXkubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBpY2tsZUtleS5sZW5ndGg7IGkrKykge1xuICAgICAgICBwaWNrbGVLZXlCdWZmZXJbaV0gPSBwaWNrbGVLZXkuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgY29uc3QgaGtkZktleSA9IGF3YWl0IHdpbmRvdy5jcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgXCJyYXdcIiwgcGlja2xlS2V5QnVmZmVyLCBcIkhLREZcIiwgZmFsc2UsIFtcImRlcml2ZUJpdHNcIl0sXG4gICAgKTtcbiAgICBwaWNrbGVLZXlCdWZmZXIuZmlsbCgwKTtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgd2luZG93LmNyeXB0by5zdWJ0bGUuZGVyaXZlQml0cyhcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogXCJIS0RGXCIsIGhhc2g6IFwiU0hBLTI1NlwiLFxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0LURPTS1saWItZ2VuZXJhdG9yL3B1bGwvODc5XG4gICAgICAgICAgICBzYWx0OiBuZXcgVWludDhBcnJheSgzMiksIGluZm86IG5ldyBVaW50OEFycmF5KDApLFxuICAgICAgICB9LFxuICAgICAgICBoa2RmS2V5LFxuICAgICAgICAyNTYsXG4gICAgKSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFib3J0TG9naW4oKSB7XG4gICAgY29uc3Qgc2lnbk91dCA9IGF3YWl0IHNob3dTdG9yYWdlRXZpY3RlZERpYWxvZygpO1xuICAgIGlmIChzaWduT3V0KSB7XG4gICAgICAgIGF3YWl0IGNsZWFyU3RvcmFnZSgpO1xuICAgICAgICAvLyBUaGlzIGVycm9yIGZlZWxzIGEgYml0IGNsdW5reSwgYnV0IHdlIHdhbnQgdG8gbWFrZSBzdXJlIHdlIGRvbid0IGdvIGFueVxuICAgICAgICAvLyBmdXJ0aGVyIGFuZCBpbnN0ZWFkIGhlYWQgYmFjayB0byBzaWduIGluLlxuICAgICAgICB0aHJvdyBuZXcgQWJvcnRMb2dpbkFuZFJlYnVpbGRTdG9yYWdlKFxuICAgICAgICAgICAgXCJBYm9ydGluZyBsb2dpbiBpbiBwcm9ncmVzcyBiZWNhdXNlIG9mIHN0b3JhZ2UgaW5jb25zaXN0ZW5jeVwiLFxuICAgICAgICApO1xuICAgIH1cbn1cblxuLy8gcmV0dXJucyBhIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgdG8gdHJ1ZSBpZiBhIHNlc3Npb24gaXMgZm91bmQgaW5cbi8vIGxvY2Fsc3RvcmFnZVxuLy9cbi8vIE4uQi4gTGlmZWN5Y2xlLmpzIHNob3VsZCBub3QgbWFpbnRhaW4gYW55IGZ1cnRoZXIgbG9jYWxTdG9yYWdlIHN0YXRlLCB3ZVxuLy8gICAgICBhcmUgbW92aW5nIHRvd2FyZHMgdXNpbmcgU2Vzc2lvblN0b3JlIHRvIGtlZXAgdHJhY2sgb2Ygc3RhdGUgcmVsYXRlZFxuLy8gICAgICB0byB0aGUgY3VycmVudCBzZXNzaW9uICh3aGljaCBpcyB0eXBpY2FsbHkgYmFja2VkIGJ5IGxvY2FsU3RvcmFnZSkuXG4vL1xuLy8gICAgICBUaGUgcGxhbiBpcyB0byBncmFkdWFsbHkgbW92ZSB0aGUgbG9jYWxTdG9yYWdlIGFjY2VzcyBkb25lIGhlcmUgaW50b1xuLy8gICAgICBTZXNzaW9uU3RvcmUgdG8gYXZvaWQgYnVncyB3aGVyZSB0aGUgdmlldyBiZWNvbWVzIG91dC1vZi1zeW5jIHdpdGhcbi8vICAgICAgbG9jYWxTdG9yYWdlIChlLmcuIGlzR3Vlc3QgZXRjLilcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXN0b3JlRnJvbUxvY2FsU3RvcmFnZShvcHRzPzogeyBpZ25vcmVHdWVzdD86IGJvb2xlYW4gfSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGlnbm9yZUd1ZXN0ID0gb3B0cz8uaWdub3JlR3Vlc3Q7XG5cbiAgICBpZiAoIWxvY2FsU3RvcmFnZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qge2hzVXJsLCBpc1VybCwgaGFzQWNjZXNzVG9rZW4sIGFjY2Vzc1Rva2VuLCB1c2VySWQsIGRldmljZUlkLCBpc0d1ZXN0fSA9IGF3YWl0IGdldFN0b3JlZFNlc3Npb25WYXJzKCk7XG5cbiAgICBpZiAoaGFzQWNjZXNzVG9rZW4gJiYgIWFjY2Vzc1Rva2VuKSB7XG4gICAgICAgIGFib3J0TG9naW4oKTtcbiAgICB9XG5cbiAgICBpZiAoYWNjZXNzVG9rZW4gJiYgdXNlcklkICYmIGhzVXJsKSB7XG4gICAgICAgIGlmIChpZ25vcmVHdWVzdCAmJiBpc0d1ZXN0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIklnbm9yaW5nIHN0b3JlZCBndWVzdCBhY2NvdW50OiBcIiArIHVzZXJJZCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGVjcnlwdGVkQWNjZXNzVG9rZW4gPSBhY2Nlc3NUb2tlbjtcbiAgICAgICAgY29uc3QgcGlja2xlS2V5ID0gYXdhaXQgUGxhdGZvcm1QZWcuZ2V0KCkuZ2V0UGlja2xlS2V5KHVzZXJJZCwgZGV2aWNlSWQpO1xuICAgICAgICBpZiAocGlja2xlS2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkdvdCBwaWNrbGUga2V5XCIpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBhY2Nlc3NUb2tlbiAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuY3JLZXkgPSBhd2FpdCBwaWNrbGVLZXlUb0Flc0tleShwaWNrbGVLZXkpO1xuICAgICAgICAgICAgICAgIGRlY3J5cHRlZEFjY2Vzc1Rva2VuID0gYXdhaXQgZGVjcnlwdEFFUyhhY2Nlc3NUb2tlbiwgZW5jcktleSwgXCJhY2Nlc3NfdG9rZW5cIik7XG4gICAgICAgICAgICAgICAgZW5jcktleS5maWxsKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJObyBwaWNrbGUga2V5IGF2YWlsYWJsZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZyZXNoTG9naW4gPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwibXhfZnJlc2hfbG9naW5cIikgPT09IFwidHJ1ZVwiO1xuICAgICAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKFwibXhfZnJlc2hfbG9naW5cIik7XG5cbiAgICAgICAgY29uc29sZS5sb2coYFJlc3RvcmluZyBzZXNzaW9uIGZvciAke3VzZXJJZH1gKTtcbiAgICAgICAgYXdhaXQgZG9TZXRMb2dnZWRJbih7XG4gICAgICAgICAgICB1c2VySWQ6IHVzZXJJZCxcbiAgICAgICAgICAgIGRldmljZUlkOiBkZXZpY2VJZCxcbiAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiBkZWNyeXB0ZWRBY2Nlc3NUb2tlbiBhcyBzdHJpbmcsXG4gICAgICAgICAgICBob21lc2VydmVyVXJsOiBoc1VybCxcbiAgICAgICAgICAgIGlkZW50aXR5U2VydmVyVXJsOiBpc1VybCxcbiAgICAgICAgICAgIGd1ZXN0OiBpc0d1ZXN0LFxuICAgICAgICAgICAgcGlja2xlS2V5OiBwaWNrbGVLZXksXG4gICAgICAgICAgICBmcmVzaExvZ2luOiBmcmVzaExvZ2luLFxuICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTm8gcHJldmlvdXMgc2Vzc2lvbiBmb3VuZC5cIik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUxvYWRTZXNzaW9uRmFpbHVyZShlOiBFcnJvcik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJVbmFibGUgdG8gbG9hZCBzZXNzaW9uXCIsIGUpO1xuXG4gICAgY29uc3QgU2Vzc2lvblJlc3RvcmVFcnJvckRpYWxvZyA9XG4gICAgICAgICAgc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5TZXNzaW9uUmVzdG9yZUVycm9yRGlhbG9nJyk7XG5cbiAgICBjb25zdCBtb2RhbCA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1Nlc3Npb24gUmVzdG9yZSBFcnJvcicsICcnLCBTZXNzaW9uUmVzdG9yZUVycm9yRGlhbG9nLCB7XG4gICAgICAgIGVycm9yOiBlLm1lc3NhZ2UsXG4gICAgfSk7XG5cbiAgICBjb25zdCBbc3VjY2Vzc10gPSBhd2FpdCBtb2RhbC5maW5pc2hlZDtcbiAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAvLyB1c2VyIGNsaWNrZWQgY29udGludWUuXG4gICAgICAgIGF3YWl0IGNsZWFyU3RvcmFnZSgpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gdHJ5LCB0cnkgYWdhaW5cbiAgICByZXR1cm4gbG9hZFNlc3Npb24oKTtcbn1cblxuLyoqXG4gKiBUcmFuc2l0aW9ucyB0byBhIGxvZ2dlZC1pbiBzdGF0ZSB1c2luZyB0aGUgZ2l2ZW4gY3JlZGVudGlhbHMuXG4gKlxuICogU3RhcnRzIHRoZSBtYXRyaXggY2xpZW50IGFuZCBhbGwgb3RoZXIgcmVhY3Qtc2RrIHNlcnZpY2VzIHRoYXRcbiAqIGxpc3RlbiBmb3IgZXZlbnRzIHdoaWxlIGEgc2Vzc2lvbiBpcyBsb2dnZWQgaW4uXG4gKlxuICogQWxzbyBzdG9wcyB0aGUgb2xkIE1hdHJpeENsaWVudCBhbmQgY2xlYXJzIG9sZCBjcmVkZW50aWFscy9ldGMgb3V0IG9mXG4gKiBzdG9yYWdlIGJlZm9yZSBzdGFydGluZyB0aGUgbmV3IGNsaWVudC5cbiAqXG4gKiBAcGFyYW0ge01hdHJpeENsaWVudENyZWRzfSBjcmVkZW50aWFscyBUaGUgY3JlZGVudGlhbHMgdG8gdXNlXG4gKlxuICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgdG8gdGhlIG5ldyBNYXRyaXhDbGllbnQgb25jZSBpdCBoYXMgYmVlbiBzdGFydGVkXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRMb2dnZWRJbihjcmVkZW50aWFsczogSU1hdHJpeENsaWVudENyZWRzKTogUHJvbWlzZTxNYXRyaXhDbGllbnQ+IHtcbiAgICBjcmVkZW50aWFscy5mcmVzaExvZ2luID0gdHJ1ZTtcbiAgICBzdG9wTWF0cml4Q2xpZW50KCk7XG4gICAgY29uc3QgcGlja2xlS2V5ID0gY3JlZGVudGlhbHMudXNlcklkICYmIGNyZWRlbnRpYWxzLmRldmljZUlkXG4gICAgICAgID8gYXdhaXQgUGxhdGZvcm1QZWcuZ2V0KCkuY3JlYXRlUGlja2xlS2V5KGNyZWRlbnRpYWxzLnVzZXJJZCwgY3JlZGVudGlhbHMuZGV2aWNlSWQpXG4gICAgICAgIDogbnVsbDtcblxuICAgIGlmIChwaWNrbGVLZXkpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDcmVhdGVkIHBpY2tsZSBrZXlcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJQaWNrbGUga2V5IG5vdCBjcmVhdGVkXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBkb1NldExvZ2dlZEluKE9iamVjdC5hc3NpZ24oe30sIGNyZWRlbnRpYWxzLCB7cGlja2xlS2V5fSksIHRydWUpO1xufVxuXG4vKipcbiAqIEh5ZHJhdGVzIGFuIGV4aXN0aW5nIHNlc3Npb24gYnkgdXNpbmcgdGhlIGNyZWRlbnRpYWxzIHByb3ZpZGVkLiBUaGlzIHdpbGxcbiAqIG5vdCBjbGVhciBhbnkgbG9jYWwgc3RvcmFnZSwgdW5saWtlIHNldExvZ2dlZEluKCkuXG4gKlxuICogU3RvcHMgdGhlIGV4aXN0aW5nIE1hdHJpeCBjbGllbnQgKHdpdGhvdXQgY2xlYXJpbmcgaXRzIGRhdGEpIGFuZCBzdGFydHMgYVxuICogbmV3IG9uZSBpbiBpdHMgcGxhY2UuIFRoaXMgYWRkaXRpb25hbGx5IHN0YXJ0cyBhbGwgb3RoZXIgcmVhY3Qtc2RrIHNlcnZpY2VzXG4gKiB3aGljaCB1c2UgdGhlIG5ldyBNYXRyaXggY2xpZW50LlxuICpcbiAqIElmIHRoZSBjcmVkZW50aWFscyBiZWxvbmcgdG8gYSBkaWZmZXJlbnQgdXNlciBmcm9tIHRoZSBzZXNzaW9uIGFscmVhZHkgc3RvcmVkLFxuICogdGhlIG9sZCBzZXNzaW9uIHdpbGwgYmUgY2xlYXJlZCBhdXRvbWF0aWNhbGx5LlxuICpcbiAqIEBwYXJhbSB7TWF0cml4Q2xpZW50Q3JlZHN9IGNyZWRlbnRpYWxzIFRoZSBjcmVkZW50aWFscyB0byB1c2VcbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSB3aGljaCByZXNvbHZlcyB0byB0aGUgbmV3IE1hdHJpeENsaWVudCBvbmNlIGl0IGhhcyBiZWVuIHN0YXJ0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGh5ZHJhdGVTZXNzaW9uKGNyZWRlbnRpYWxzOiBJTWF0cml4Q2xpZW50Q3JlZHMpOiBQcm9taXNlPE1hdHJpeENsaWVudD4ge1xuICAgIGNvbnN0IG9sZFVzZXJJZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKTtcbiAgICBjb25zdCBvbGREZXZpY2VJZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXREZXZpY2VJZCgpO1xuXG4gICAgc3RvcE1hdHJpeENsaWVudCgpOyAvLyB1bnNldHMgTWF0cml4Q2xpZW50UGVnLmdldCgpXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJteF9zb2Z0X2xvZ291dFwiKTtcbiAgICBfaXNMb2dnaW5nT3V0ID0gZmFsc2U7XG5cbiAgICBjb25zdCBvdmVyd3JpdGUgPSBjcmVkZW50aWFscy51c2VySWQgIT09IG9sZFVzZXJJZCB8fCBjcmVkZW50aWFscy5kZXZpY2VJZCAhPT0gb2xkRGV2aWNlSWQ7XG4gICAgaWYgKG92ZXJ3cml0ZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJDbGVhcmluZyBhbGwgZGF0YTogT2xkIHNlc3Npb24gYmVsb25ncyB0byBhIGRpZmZlcmVudCB1c2VyL3Nlc3Npb25cIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRvU2V0TG9nZ2VkSW4oY3JlZGVudGlhbHMsIG92ZXJ3cml0ZSk7XG59XG5cbi8qKlxuICogZmlyZXMgb25fbG9nZ2luZ19pbiwgb3B0aW9uYWxseSBjbGVhcnMgbG9jYWxzdG9yYWdlLCBwZXJzaXN0cyBuZXcgY3JlZGVudGlhbHNcbiAqIHRvIGxvY2Fsc3RvcmFnZSwgc3RhcnRzIHRoZSBuZXcgY2xpZW50LlxuICpcbiAqIEBwYXJhbSB7TWF0cml4Q2xpZW50Q3JlZHN9IGNyZWRlbnRpYWxzXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNsZWFyU3RvcmFnZVxuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHRvIHRoZSBuZXcgTWF0cml4Q2xpZW50IG9uY2UgaXQgaGFzIGJlZW4gc3RhcnRlZFxuICovXG5hc3luYyBmdW5jdGlvbiBkb1NldExvZ2dlZEluKFxuICAgIGNyZWRlbnRpYWxzOiBJTWF0cml4Q2xpZW50Q3JlZHMsXG4gICAgY2xlYXJTdG9yYWdlRW5hYmxlZDogYm9vbGVhbixcbik6IFByb21pc2U8TWF0cml4Q2xpZW50PiB7XG4gICAgY3JlZGVudGlhbHMuZ3Vlc3QgPSBCb29sZWFuKGNyZWRlbnRpYWxzLmd1ZXN0KTtcblxuICAgIGNvbnN0IHNvZnRMb2dvdXQgPSBpc1NvZnRMb2dvdXQoKTtcblxuICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBcInNldExvZ2dlZEluOiBteGlkOiBcIiArIGNyZWRlbnRpYWxzLnVzZXJJZCArXG4gICAgICAgIFwiIGRldmljZUlkOiBcIiArIGNyZWRlbnRpYWxzLmRldmljZUlkICtcbiAgICAgICAgXCIgZ3Vlc3Q6IFwiICsgY3JlZGVudGlhbHMuZ3Vlc3QgK1xuICAgICAgICBcIiBoczogXCIgKyBjcmVkZW50aWFscy5ob21lc2VydmVyVXJsICtcbiAgICAgICAgXCIgc29mdExvZ291dDogXCIgKyBzb2Z0TG9nb3V0LFxuICAgICAgICBcIiBmcmVzaExvZ2luOiBcIiArIGNyZWRlbnRpYWxzLmZyZXNoTG9naW4sXG4gICAgKTtcblxuICAgIC8vIFRoaXMgaXMgZGlzcGF0Y2hlZCB0byBpbmRpY2F0ZSB0aGF0IHRoZSB1c2VyIGlzIHN0aWxsIGluIHRoZSBwcm9jZXNzIG9mIGxvZ2dpbmcgaW5cbiAgICAvLyBiZWNhdXNlIGFzeW5jIGNvZGUgbWF5IHRha2Ugc29tZSB0aW1lIHRvIHJlc29sdmUsIGJyZWFraW5nIHRoZSBhc3N1bXB0aW9uIHRoYXRcbiAgICAvLyBgc2V0TG9nZ2VkSW5gIHRha2VzIGFuIFwiaW5zdGFudFwiIHRvIGNvbXBsZXRlLCBhbmQgZGlzcGF0Y2ggYG9uX2xvZ2dlZF9pbmAgYSBmZXcgbXNcbiAgICAvLyBsYXRlciB0aGFuIE1hdHJpeENoYXQgbWlnaHQgYXNzdW1lLlxuICAgIC8vXG4gICAgLy8gd2UgZmlyZSBpdCAqc3luY2hyb25vdXNseSogdG8gbWFrZSBzdXJlIGl0IGZpcmVzIGJlZm9yZSBvbl9sb2dnZWRfaW4uXG4gICAgLy8gKGRpcy5kaXNwYXRjaCB1c2VzIGBzZXRUaW1lb3V0YCwgd2hpY2ggZG9lcyBub3QgZ3VhcmFudGVlIG9yZGVyaW5nLilcbiAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ29uX2xvZ2dpbmdfaW4nfSwgdHJ1ZSk7XG5cbiAgICBpZiAoY2xlYXJTdG9yYWdlRW5hYmxlZCkge1xuICAgICAgICBhd2FpdCBjbGVhclN0b3JhZ2UoKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgU3RvcmFnZU1hbmFnZXIuY2hlY2tDb25zaXN0ZW5jeSgpO1xuICAgIC8vIElmIHRoZXJlJ3MgYW4gaW5jb25zaXN0ZW5jeSBiZXR3ZWVuIGFjY291bnQgZGF0YSBpbiBsb2NhbCBzdG9yYWdlIGFuZCB0aGVcbiAgICAvLyBjcnlwdG8gc3RvcmUsIHdlJ2xsIGJlIGdlbmVyYWxseSBjb25mdXNlZCB3aGVuIGhhbmRsaW5nIGVuY3J5cHRlZCBkYXRhLlxuICAgIC8vIFNob3cgYSBtb2RhbCByZWNvbW1lbmRpbmcgYSBmdWxsIHJlc2V0IG9mIHN0b3JhZ2UuXG4gICAgaWYgKHJlc3VsdHMuZGF0YUluTG9jYWxTdG9yYWdlICYmIHJlc3VsdHMuY3J5cHRvSW5pdGVkICYmICFyZXN1bHRzLmRhdGFJbkNyeXB0b1N0b3JlKSB7XG4gICAgICAgIGF3YWl0IGFib3J0TG9naW4oKTtcbiAgICB9XG5cbiAgICBBbmFseXRpY3Muc2V0TG9nZ2VkSW4oY3JlZGVudGlhbHMuZ3Vlc3QsIGNyZWRlbnRpYWxzLmhvbWVzZXJ2ZXJVcmwpO1xuXG4gICAgTWF0cml4Q2xpZW50UGVnLnJlcGxhY2VVc2luZ0NyZWRzKGNyZWRlbnRpYWxzKTtcbiAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICBpZiAoY3JlZGVudGlhbHMuZnJlc2hMb2dpbiAmJiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9kZWh5ZHJhdGlvblwiKSkge1xuICAgICAgICAvLyBJZiB3ZSBqdXN0IGxvZ2dlZCBpbiwgdHJ5IHRvIHJlaHlkcmF0ZSBhIGRldmljZSBpbnN0ZWFkIG9mIHVzaW5nIGFcbiAgICAgICAgLy8gbmV3IGRldmljZS4gIElmIGl0IHN1Y2NlZWRzLCB3ZSdsbCBnZXQgYSBuZXcgZGV2aWNlIElELCBzbyBtYWtlIHN1cmVcbiAgICAgICAgLy8gd2UgcGVyc2lzdCB0aGF0IElEIHRvIGxvY2FsU3RvcmFnZVxuICAgICAgICBjb25zdCBuZXdEZXZpY2VJZCA9IGF3YWl0IGNsaWVudC5yZWh5ZHJhdGVEZXZpY2UoKTtcbiAgICAgICAgaWYgKG5ld0RldmljZUlkKSB7XG4gICAgICAgICAgICBjcmVkZW50aWFscy5kZXZpY2VJZCA9IG5ld0RldmljZUlkO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVsZXRlIGNyZWRlbnRpYWxzLmZyZXNoTG9naW47XG4gICAgfVxuXG4gICAgaWYgKGxvY2FsU3RvcmFnZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgcGVyc2lzdENyZWRlbnRpYWxzKGNyZWRlbnRpYWxzKTtcbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBkb24ndCB0aGluayB0aGF0IGl0J3MgYSBmcmVzaCBsb2dpbiBhbnkgbW9yZVxuICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbShcIm14X2ZyZXNoX2xvZ2luXCIpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJFcnJvciB1c2luZyBsb2NhbCBzdG9yYWdlOiBjYW4ndCBwZXJzaXN0IHNlc3Npb24hXCIsIGUpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiTm8gbG9jYWwgc3RvcmFnZSBhdmFpbGFibGU6IGNhbid0IHBlcnNpc3Qgc2Vzc2lvbiFcIik7XG4gICAgfVxuXG4gICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAnb25fbG9nZ2VkX2luJyB9KTtcblxuICAgIGF3YWl0IHN0YXJ0TWF0cml4Q2xpZW50KC8qc3RhcnRTeW5jaW5nPSovIXNvZnRMb2dvdXQpO1xuICAgIHJldHVybiBjbGllbnQ7XG59XG5cbmZ1bmN0aW9uIHNob3dTdG9yYWdlRXZpY3RlZERpYWxvZygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBTdG9yYWdlRXZpY3RlZERpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuU3RvcmFnZUV2aWN0ZWREaWFsb2cnKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1N0b3JhZ2UgZXZpY3RlZCcsICcnLCBTdG9yYWdlRXZpY3RlZERpYWxvZywge1xuICAgICAgICAgICAgb25GaW5pc2hlZDogcmVzb2x2ZSxcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbi8vIE5vdGU6IEJhYmVsIDYgcmVxdWlyZXMgdGhlIGB0cmFuc2Zvcm0tYnVpbHRpbi1leHRlbmRgIHBsdWdpbiBmb3IgdGhpcyB0byBzYXRpc2Z5XG4vLyBgaW5zdGFuY2VvZmAuIEJhYmVsIDcgc3VwcG9ydHMgdGhpcyBuYXRpdmVseSBpbiB0aGVpciBjbGFzcyBoYW5kbGluZy5cbmNsYXNzIEFib3J0TG9naW5BbmRSZWJ1aWxkU3RvcmFnZSBleHRlbmRzIEVycm9yIHsgfVxuXG5hc3luYyBmdW5jdGlvbiBwZXJzaXN0Q3JlZGVudGlhbHMoY3JlZGVudGlhbHM6IElNYXRyaXhDbGllbnRDcmVkcyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKEhPTUVTRVJWRVJfVVJMX0tFWSwgY3JlZGVudGlhbHMuaG9tZXNlcnZlclVybCk7XG4gICAgaWYgKGNyZWRlbnRpYWxzLmlkZW50aXR5U2VydmVyVXJsKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKElEX1NFUlZFUl9VUkxfS0VZLCBjcmVkZW50aWFscy5pZGVudGl0eVNlcnZlclVybCk7XG4gICAgfVxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibXhfdXNlcl9pZFwiLCBjcmVkZW50aWFscy51c2VySWQpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibXhfaXNfZ3Vlc3RcIiwgSlNPTi5zdHJpbmdpZnkoY3JlZGVudGlhbHMuZ3Vlc3QpKTtcblxuICAgIC8vIHN0b3JlIHdoZXRoZXIgd2UgZXhwZWN0IHRvIGZpbmQgYW4gYWNjZXNzIHRva2VuLCB0byBkZXRlY3QgdGhlIGNhc2VcbiAgICAvLyB3aGVyZSBJbmRleGVkREIgaXMgYmxvd24gYXdheVxuICAgIGlmIChjcmVkZW50aWFscy5hY2Nlc3NUb2tlbikge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm14X2hhc19hY2Nlc3NfdG9rZW5cIiwgXCJ0cnVlXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5kZWxldGVJdGVtKFwibXhfaGFzX2FjY2Vzc190b2tlblwiKTtcbiAgICB9XG5cbiAgICBpZiAoY3JlZGVudGlhbHMucGlja2xlS2V5KSB7XG4gICAgICAgIGxldCBlbmNyeXB0ZWRBY2Nlc3NUb2tlbjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHRyeSB0byBlbmNyeXB0IHRoZSBhY2Nlc3MgdG9rZW4gdXNpbmcgdGhlIHBpY2tsZSBrZXlcbiAgICAgICAgICAgIGNvbnN0IGVuY3JLZXkgPSBhd2FpdCBwaWNrbGVLZXlUb0Flc0tleShjcmVkZW50aWFscy5waWNrbGVLZXkpO1xuICAgICAgICAgICAgZW5jcnlwdGVkQWNjZXNzVG9rZW4gPSBhd2FpdCBlbmNyeXB0QUVTKGNyZWRlbnRpYWxzLmFjY2Vzc1Rva2VuLCBlbmNyS2V5LCBcImFjY2Vzc190b2tlblwiKTtcbiAgICAgICAgICAgIGVuY3JLZXkuZmlsbCgwKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiQ291bGQgbm90IGVuY3J5cHQgYWNjZXNzIHRva2VuXCIsIGUpO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBzYXZlIGVpdGhlciB0aGUgZW5jcnlwdGVkIGFjY2VzcyB0b2tlbiwgb3IgdGhlIHBsYWluIGFjY2Vzc1xuICAgICAgICAgICAgLy8gdG9rZW4gaWYgd2Ugd2VyZSB1bmFibGUgdG8gZW5jcnlwdCAoZS5nLiBpZiB0aGUgYnJvd3NlciBkb2Vzbid0XG4gICAgICAgICAgICAvLyBoYXZlIFdlYkNyeXB0bykuXG4gICAgICAgICAgICBhd2FpdCBTdG9yYWdlTWFuYWdlci5pZGJTYXZlKFxuICAgICAgICAgICAgICAgIFwiYWNjb3VudFwiLCBcIm14X2FjY2Vzc190b2tlblwiLFxuICAgICAgICAgICAgICAgIGVuY3J5cHRlZEFjY2Vzc1Rva2VuIHx8IGNyZWRlbnRpYWxzLmFjY2Vzc1Rva2VuLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gaWYgd2UgY291bGRuJ3Qgc2F2ZSB0byBpbmRleGVkREIsIGZhbGwgYmFjayB0byBsb2NhbFN0b3JhZ2UuICBXZVxuICAgICAgICAgICAgLy8gc3RvcmUgdGhlIGFjY2VzcyB0b2tlbiB1bmVuY3J5cHRlZCBzaW5jZSBsb2NhbFN0b3JhZ2Ugb25seSBzYXZlc1xuICAgICAgICAgICAgLy8gc3RyaW5ncy5cbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibXhfYWNjZXNzX3Rva2VuXCIsIGNyZWRlbnRpYWxzLmFjY2Vzc1Rva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm14X2hhc19waWNrbGVfa2V5XCIsIFN0cmluZyh0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IFN0b3JhZ2VNYW5hZ2VyLmlkYlNhdmUoXG4gICAgICAgICAgICAgICAgXCJhY2NvdW50XCIsIFwibXhfYWNjZXNzX3Rva2VuXCIsIGNyZWRlbnRpYWxzLmFjY2Vzc1Rva2VuLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJteF9hY2Nlc3NfdG9rZW5cIiwgY3JlZGVudGlhbHMuYWNjZXNzVG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm14X2hhc19waWNrbGVfa2V5XCIpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXhwZWN0ZWQgYSBwaWNrbGUga2V5LCBidXQgbm9uZSBwcm92aWRlZC4gIEVuY3J5cHRpb24gbWF5IG5vdCB3b3JrLlwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlmIHdlIGRpZG4ndCBnZXQgYSBkZXZpY2VJZCBmcm9tIHRoZSBsb2dpbiwgbGVhdmUgbXhfZGV2aWNlX2lkIHVuc2V0LFxuICAgIC8vIHJhdGhlciB0aGFuIHNldHRpbmcgaXQgdG8gXCJ1bmRlZmluZWRcIi5cbiAgICAvL1xuICAgIC8vIChpbiB0aGlzIGNhc2UgTWF0cml4Q2xpZW50IGRvZXNuJ3QgYm90aGVyIHdpdGggdGhlIGNyeXB0byBzdHVmZlxuICAgIC8vIC0gdGhhdCdzIGZpbmUgZm9yIHVzKS5cbiAgICBpZiAoY3JlZGVudGlhbHMuZGV2aWNlSWQpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJteF9kZXZpY2VfaWRcIiwgY3JlZGVudGlhbHMuZGV2aWNlSWQpO1xuICAgIH1cblxuICAgIFNlY3VyaXR5Q3VzdG9taXNhdGlvbnMucGVyc2lzdENyZWRlbnRpYWxzPy4oY3JlZGVudGlhbHMpO1xuXG4gICAgY29uc29sZS5sb2coYFNlc3Npb24gcGVyc2lzdGVkIGZvciAke2NyZWRlbnRpYWxzLnVzZXJJZH1gKTtcbn1cblxubGV0IF9pc0xvZ2dpbmdPdXQgPSBmYWxzZTtcblxuLyoqXG4gKiBMb2dzIHRoZSBjdXJyZW50IHNlc3Npb24gb3V0IGFuZCB0cmFuc2l0aW9ucyB0byB0aGUgbG9nZ2VkLW91dCBzdGF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9nb3V0KCk6IHZvaWQge1xuICAgIGlmICghTWF0cml4Q2xpZW50UGVnLmdldCgpKSByZXR1cm47XG4gICAgaWYgKCFDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLmRpc2FibGVkKSB7XG4gICAgICAgIC8vIHVzZXIgaGFzIGxvZ2dlZCBvdXQsIGZhbGwgYmFjayB0byBhbm9ueW1vdXNcbiAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS5lbmFibGUoLyogYW5vbnltb3VzID0gKi8gdHJ1ZSk7XG4gICAgfVxuXG4gICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc0d1ZXN0KCkpIHtcbiAgICAgICAgLy8gbG9nb3V0IGRvZXNuJ3Qgd29yayBmb3IgZ3Vlc3Qgc2Vzc2lvbnNcbiAgICAgICAgLy8gQWxzbyB3ZSBzb21ldGltZXMgd2FudCB0byByZS1sb2cgaW4gYSBndWVzdCBzZXNzaW9uIGlmIHdlIGFib3J0IHRoZSBsb2dpbi5cbiAgICAgICAgLy8gZGVmZXIgdW50aWwgbmV4dCB0aWNrIGJlY2F1c2UgaXQgY2FsbHMgYSBzeW5jaHJvbm91cyBkaXNwYXRjaCBhbmQgd2UgYXJlIGxpa2VseSBoZXJlIGZyb20gYSBkaXNwYXRjaC5cbiAgICAgICAgc2V0SW1tZWRpYXRlKCgpID0+IG9uTG9nZ2VkT3V0KCkpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgX2lzTG9nZ2luZ091dCA9IHRydWU7XG4gICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgIFBsYXRmb3JtUGVnLmdldCgpLmRlc3Ryb3lQaWNrbGVLZXkoY2xpZW50LmdldFVzZXJJZCgpLCBjbGllbnQuZ2V0RGV2aWNlSWQoKSk7XG4gICAgY2xpZW50LmxvZ291dCgpLnRoZW4ob25Mb2dnZWRPdXQsXG4gICAgICAgIChlcnIpID0+IHtcbiAgICAgICAgICAgIC8vIEp1c3QgdGhyb3dpbmcgYW4gZXJyb3IgaGVyZSBpcyBnb2luZyB0byBiZSB2ZXJ5IHVuaGVscGZ1bFxuICAgICAgICAgICAgLy8gaWYgeW91J3JlIHRyeWluZyB0byBsb2cgb3V0IGJlY2F1c2UgeW91ciBzZXJ2ZXIncyBkb3duIGFuZFxuICAgICAgICAgICAgLy8geW91IHdhbnQgdG8gbG9nIGludG8gYSBkaWZmZXJlbnQgc2VydmVyLCBzbyBqdXN0IGZvcmdldCB0aGVcbiAgICAgICAgICAgIC8vIGFjY2VzcyB0b2tlbi4gSXQncyBhbm5veWluZyB0aGF0IHRoaXMgd2lsbCBsZWF2ZSB0aGUgYWNjZXNzXG4gICAgICAgICAgICAvLyB0b2tlbiBzdGlsbCB2YWxpZCwgYnV0IHdlIHNob3VsZCBmaXggdGhpcyBieSBoYXZpbmcgYWNjZXNzXG4gICAgICAgICAgICAvLyB0b2tlbnMgZXhwaXJlIChhbmQgaWYgeW91IHJlYWxseSB0aGluayB5b3UndmUgYmVlbiBjb21wcm9taXNlZCxcbiAgICAgICAgICAgIC8vIGNoYW5nZSB5b3VyIHBhc3N3b3JkKS5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIGNhbGwgbG9nb3V0IEFQSTogdG9rZW4gd2lsbCBub3QgYmUgaW52YWxpZGF0ZWRcIik7XG4gICAgICAgICAgICBvbkxvZ2dlZE91dCgpO1xuICAgICAgICB9LFxuICAgICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb2Z0TG9nb3V0KCk6IHZvaWQge1xuICAgIGlmICghTWF0cml4Q2xpZW50UGVnLmdldCgpKSByZXR1cm47XG5cbiAgICAvLyBUcmFjayB0aGF0IHdlJ3ZlIGRldGVjdGVkIGFuZCB0cmFwcGVkIGEgc29mdCBsb2dvdXQuIFRoaXMgaGVscHMgcHJldmVudCBvdGhlclxuICAgIC8vIHBhcnRzIG9mIHRoZSBhcHAgZnJvbSBzdGFydGluZyBpZiB0aGVyZSdzIG5vIHBvaW50IChpZTogZG9uJ3Qgc3luYyBpZiB3ZSd2ZVxuICAgIC8vIGJlZW4gc29mdCBsb2dnZWQgb3V0LCBkZXNwaXRlIGhhdmluZyBjcmVkZW50aWFscyBhbmQgZGF0YSBmb3IgYSBNYXRyaXhDbGllbnQpLlxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibXhfc29mdF9sb2dvdXRcIiwgXCJ0cnVlXCIpO1xuXG4gICAgLy8gRGV2IG5vdGU6IHBsZWFzZSBrZWVwIHRoaXMgbG9nIGxpbmUgYXJvdW5kLiBJdCBjYW4gYmUgdXNlZnVsIGZvciB0cmFjayBkb3duXG4gICAgLy8gcmFuZG9tIGNsaWVudHMgc3RvcHBpbmcgaW4gdGhlIG1pZGRsZSBvZiB0aGUgbG9ncy5cbiAgICBjb25zb2xlLmxvZyhcIlNvZnQgbG9nb3V0IGluaXRpYXRlZFwiKTtcbiAgICBfaXNMb2dnaW5nT3V0ID0gdHJ1ZTsgLy8gdG8gYXZvaWQgcmVwZWF0ZWQgZmxhZ3NcbiAgICAvLyBFbnN1cmUgdGhhdCB3ZSBkaXNwYXRjaCBhIHZpZXcgY2hhbmdlICoqYmVmb3JlKiogc3RvcHBpbmcgdGhlIGNsaWVudCBzb1xuICAgIC8vIHNvIHRoYXQgUmVhY3QgY29tcG9uZW50cyB1bm1vdW50IGZpcnN0LiBUaGlzIGF2b2lkcyBSZWFjdCBzb2Z0IGNyYXNoZXNcbiAgICAvLyB0aGF0IGNhbiBvY2N1ciB3aGVuIGNvbXBvbmVudHMgdHJ5IHRvIHVzZSBhIG51bGwgY2xpZW50LlxuICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAnb25fY2xpZW50X25vdF92aWFibGUnfSk7IC8vIGdlbmVyaWMgdmVyc2lvbiBvZiBvbl9sb2dnZWRfb3V0XG4gICAgc3RvcE1hdHJpeENsaWVudCgvKnVuc2V0Q2xpZW50PSovZmFsc2UpO1xuXG4gICAgLy8gRE8gTk9UIENBTEwgTE9HT1VULiBBIHNvZnQgbG9nb3V0IHByZXNlcnZlcyBkYXRhLCBsb2dvdXQgZG9lcyBub3QuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NvZnRMb2dvdXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibXhfc29mdF9sb2dvdXRcIikgPT09IFwidHJ1ZVwiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNMb2dnaW5nT3V0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBfaXNMb2dnaW5nT3V0O1xufVxuXG4vKipcbiAqIFN0YXJ0cyB0aGUgbWF0cml4IGNsaWVudCBhbmQgYWxsIG90aGVyIHJlYWN0LXNkayBzZXJ2aWNlcyB0aGF0XG4gKiBsaXN0ZW4gZm9yIGV2ZW50cyB3aGlsZSBhIHNlc3Npb24gaXMgbG9nZ2VkIGluLlxuICogQHBhcmFtIHtib29sZWFufSBzdGFydFN5bmNpbmcgVHJ1ZSAoZGVmYXVsdCkgdG8gYWN0dWFsbHkgc3RhcnRcbiAqIHN5bmNpbmcgdGhlIGNsaWVudC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc3RhcnRNYXRyaXhDbGllbnQoc3RhcnRTeW5jaW5nID0gdHJ1ZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnNvbGUubG9nKGBMaWZlY3ljbGU6IFN0YXJ0aW5nIE1hdHJpeENsaWVudGApO1xuXG4gICAgLy8gZGlzcGF0Y2ggdGhpcyBiZWZvcmUgc3RhcnRpbmcgdGhlIG1hdHJpeCBjbGllbnQ6IGl0J3MgdXNlZFxuICAgIC8vIHRvIGFkZCBsaXN0ZW5lcnMgZm9yIHRoZSAnc3luYycgZXZlbnQgc28gb3RoZXJ3aXNlIHdlJ2QgaGF2ZVxuICAgIC8vIGEgcmFjZSBjb25kaXRpb24gKGFuZCB3ZSBuZWVkIHRvIGRpc3BhdGNoIHN5bmNocm9ub3VzbHkgZm9yIHRoaXNcbiAgICAvLyB0byB3b3JrKS5cbiAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3dpbGxfc3RhcnRfY2xpZW50J30sIHRydWUpO1xuXG4gICAgLy8gcmVzZXQgdGhpbmdzIGZpcnN0IGp1c3QgaW4gY2FzZVxuICAgIFR5cGluZ1N0b3JlLnNoYXJlZEluc3RhbmNlKCkucmVzZXQoKTtcbiAgICBUb2FzdFN0b3JlLnNoYXJlZEluc3RhbmNlKCkucmVzZXQoKTtcblxuICAgIE5vdGlmaWVyLnN0YXJ0KCk7XG4gICAgVXNlckFjdGl2aXR5LnNoYXJlZEluc3RhbmNlKCkuc3RhcnQoKTtcbiAgICBETVJvb21NYXAubWFrZVNoYXJlZCgpLnN0YXJ0KCk7XG4gICAgSW50ZWdyYXRpb25NYW5hZ2Vycy5zaGFyZWRJbnN0YW5jZSgpLnN0YXJ0V2F0Y2hpbmcoKTtcbiAgICBBY3RpdmVXaWRnZXRTdG9yZS5zdGFydCgpO1xuICAgIENhbGxIYW5kbGVyLnNoYXJlZEluc3RhbmNlKCkuc3RhcnQoKTtcblxuICAgIC8vIFN0YXJ0IE1qb2xuaXIgZXZlbiB0aG91Z2ggd2UgaGF2ZW4ndCBjaGVja2VkIHRoZSBmZWF0dXJlIGZsYWcgeWV0LiBTdGFydGluZ1xuICAgIC8vIHRoZSB0aGluZyBqdXN0IHdhc3RlcyBDUFUgY3ljbGVzLCBidXQgc2hvdWxkIHJlc3VsdCBpbiBubyBhY3R1YWwgZnVuY3Rpb25hbGl0eVxuICAgIC8vIGJlaW5nIGV4cG9zZWQgdG8gdGhlIHVzZXIuXG4gICAgTWpvbG5pci5zaGFyZWRJbnN0YW5jZSgpLnN0YXJ0KCk7XG5cbiAgICBpZiAoc3RhcnRTeW5jaW5nKSB7XG4gICAgICAgIC8vIFRoZSBjbGllbnQgbWlnaHQgd2FudCB0byBwb3B1bGF0ZSBzb21lIHZpZXdzIHdpdGggZXZlbnRzIGZyb20gdGhlXG4gICAgICAgIC8vIGluZGV4IChlLmcuIHRoZSBGaWxlUGFuZWwpLCB0aGVyZWZvcmUgaW5pdGlhbGl6ZSB0aGUgZXZlbnQgaW5kZXhcbiAgICAgICAgLy8gYmVmb3JlIHRoZSBjbGllbnQuXG4gICAgICAgIGF3YWl0IEV2ZW50SW5kZXhQZWcuaW5pdCgpO1xuICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuc3RhcnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJDYWxsZXIgcmVxdWVzdGVkIG9ubHkgYXV4aWxpYXJ5IHNlcnZpY2VzIGJlIHN0YXJ0ZWRcIik7XG4gICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5hc3NpZ24oKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIG5lZWRzIHRvIGJlIHN0YXJ0ZWQgYWZ0ZXIgY3J5cHRvIGlzIHNldCB1cFxuICAgIERldmljZUxpc3RlbmVyLnNoYXJlZEluc3RhbmNlKCkuc3RhcnQoKTtcbiAgICAvLyBTaW1pbGFybHksIGRvbid0IHN0YXJ0IHNlbmRpbmcgcHJlc2VuY2UgdXBkYXRlcyB1bnRpbCB3ZSd2ZSBzdGFydGVkXG4gICAgLy8gdGhlIGNsaWVudFxuICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImxvd0JhbmR3aWR0aFwiKSkge1xuICAgICAgICBQcmVzZW5jZS5zdGFydCgpO1xuICAgIH1cblxuICAgIC8vIE5vdyB0aGF0IHdlIGhhdmUgYSBNYXRyaXhDbGllbnRQZWcsIHVwZGF0ZSB0aGUgSml0c2kgaW5mb1xuICAgIGF3YWl0IEppdHNpLmdldEluc3RhbmNlKCkuc3RhcnQoKTtcblxuICAgIC8vIGRpc3BhdGNoIHRoYXQgd2UgZmluaXNoZWQgc3RhcnRpbmcgdXAgdG8gd2lyZSB1cCBhbnkgb3RoZXIgYml0c1xuICAgIC8vIG9mIHRoZSBtYXRyaXggY2xpZW50IHRoYXQgY2Fubm90IGJlIHNldCBwcmlvciB0byBzdGFydGluZyB1cC5cbiAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ2NsaWVudF9zdGFydGVkJ30pO1xuXG4gICAgaWYgKGlzU29mdExvZ291dCgpKSB7XG4gICAgICAgIHNvZnRMb2dvdXQoKTtcbiAgICB9XG59XG5cbi8qXG4gKiBTdG9wcyBhIHJ1bm5pbmcgY2xpZW50IGFuZCBhbGwgcmVsYXRlZCBzZXJ2aWNlcywgYW5kIGNsZWFycyBwZXJzaXN0ZW50XG4gKiBzdG9yYWdlLiBVc2VkIGFmdGVyIGEgc2Vzc2lvbiBoYXMgYmVlbiBsb2dnZWQgb3V0LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb25Mb2dnZWRPdXQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgX2lzTG9nZ2luZ091dCA9IGZhbHNlO1xuICAgIC8vIEVuc3VyZSB0aGF0IHdlIGRpc3BhdGNoIGEgdmlldyBjaGFuZ2UgKipiZWZvcmUqKiBzdG9wcGluZyB0aGUgY2xpZW50IHNvXG4gICAgLy8gc28gdGhhdCBSZWFjdCBjb21wb25lbnRzIHVubW91bnQgZmlyc3QuIFRoaXMgYXZvaWRzIFJlYWN0IHNvZnQgY3Jhc2hlc1xuICAgIC8vIHRoYXQgY2FuIG9jY3VyIHdoZW4gY29tcG9uZW50cyB0cnkgdG8gdXNlIGEgbnVsbCBjbGllbnQuXG4gICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdvbl9sb2dnZWRfb3V0J30sIHRydWUpO1xuICAgIHN0b3BNYXRyaXhDbGllbnQoKTtcbiAgICBhd2FpdCBjbGVhclN0b3JhZ2Uoe2RlbGV0ZUV2ZXJ5dGhpbmc6IHRydWV9KTtcbiAgICBMaWZlY3ljbGVDdXN0b21pc2F0aW9ucy5vbkxvZ2dlZE91dEFuZFN0b3JhZ2VDbGVhcmVkPy4oKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0cyBPcHRpb25zIGZvciBob3cgdG8gY2xlYXIgc3RvcmFnZS5cbiAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIG9uY2UgdGhlIHN0b3JlcyBoYXZlIGJlZW4gY2xlYXJlZFxuICovXG5hc3luYyBmdW5jdGlvbiBjbGVhclN0b3JhZ2Uob3B0cz86IHsgZGVsZXRlRXZlcnl0aGluZz86IGJvb2xlYW4gfSk6IFByb21pc2U8dm9pZD4ge1xuICAgIEFuYWx5dGljcy5kaXNhYmxlKCk7XG5cbiAgICBpZiAod2luZG93LmxvY2FsU3RvcmFnZSkge1xuICAgICAgICAvLyB0cnkgdG8gc2F2ZSBhbnkgM3BpZCBpbnZpdGVzIGZyb20gYmVpbmcgb2JsaXRlcmF0ZWRcbiAgICAgICAgY29uc3QgcGVuZGluZ0ludml0ZXMgPSBUaHJlZXBpZEludml0ZVN0b3JlLmluc3RhbmNlLmdldFdpcmVJbnZpdGVzKCk7XG5cbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5jbGVhcigpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBTdG9yYWdlTWFuYWdlci5pZGJEZWxldGUoXCJhY2NvdW50XCIsIFwibXhfYWNjZXNzX3Rva2VuXCIpO1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuXG4gICAgICAgIC8vIG5vdyByZXN0b3JlIHRob3NlIGludml0ZXNcbiAgICAgICAgaWYgKCFvcHRzPy5kZWxldGVFdmVyeXRoaW5nKSB7XG4gICAgICAgICAgICBwZW5kaW5nSW52aXRlcy5mb3JFYWNoKGkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IGkucm9vbUlkO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBpLnJvb21JZDsgLy8gZGVsZXRlIHRvIGF2b2lkIGNvbmZ1c2luZyB0aGUgc3RvcmVcbiAgICAgICAgICAgICAgICBUaHJlZXBpZEludml0ZVN0b3JlLmluc3RhbmNlLnN0b3JlSW52aXRlKHJvb21JZCwgaSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICh3aW5kb3cuc2Vzc2lvblN0b3JhZ2UpIHtcbiAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIGEgdGVtcG9yYXJ5IGNsaWVudCB0byBjbGVhciBvdXQgdGhlIHBlcnNpc3RlbnQgc3RvcmVzLlxuICAgIGNvbnN0IGNsaSA9IGNyZWF0ZU1hdHJpeENsaWVudCh7XG4gICAgICAgIC8vIHdlJ2xsIG5ldmVyIG1ha2UgYW55IHJlcXVlc3RzLCBzbyBjYW4gcGFzcyBhIGJvZ3VzIEhTIFVSTFxuICAgICAgICBiYXNlVXJsOiBcIlwiLFxuICAgIH0pO1xuXG4gICAgYXdhaXQgRXZlbnRJbmRleFBlZy5kZWxldGVFdmVudEluZGV4KCk7XG4gICAgYXdhaXQgY2xpLmNsZWFyU3RvcmVzKCk7XG59XG5cbi8qKlxuICogU3RvcCBhbGwgdGhlIGJhY2tncm91bmQgcHJvY2Vzc2VzIHJlbGF0ZWQgdG8gdGhlIGN1cnJlbnQgY2xpZW50LlxuICogQHBhcmFtIHtib29sZWFufSB1bnNldENsaWVudCBUcnVlIChkZWZhdWx0KSB0byBhYmFuZG9uIHRoZSBjbGllbnRcbiAqIG9uIE1hdHJpeENsaWVudFBlZyBhZnRlciBzdG9wcGluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0b3BNYXRyaXhDbGllbnQodW5zZXRDbGllbnQgPSB0cnVlKTogdm9pZCB7XG4gICAgTm90aWZpZXIuc3RvcCgpO1xuICAgIENhbGxIYW5kbGVyLnNoYXJlZEluc3RhbmNlKCkuc3RvcCgpO1xuICAgIFVzZXJBY3Rpdml0eS5zaGFyZWRJbnN0YW5jZSgpLnN0b3AoKTtcbiAgICBUeXBpbmdTdG9yZS5zaGFyZWRJbnN0YW5jZSgpLnJlc2V0KCk7XG4gICAgUHJlc2VuY2Uuc3RvcCgpO1xuICAgIEFjdGl2ZVdpZGdldFN0b3JlLnN0b3AoKTtcbiAgICBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCkuc3RvcFdhdGNoaW5nKCk7XG4gICAgTWpvbG5pci5zaGFyZWRJbnN0YW5jZSgpLnN0b3AoKTtcbiAgICBEZXZpY2VMaXN0ZW5lci5zaGFyZWRJbnN0YW5jZSgpLnN0b3AoKTtcbiAgICBpZiAoRE1Sb29tTWFwLnNoYXJlZCgpKSBETVJvb21NYXAuc2hhcmVkKCkuc3RvcCgpO1xuICAgIEV2ZW50SW5kZXhQZWcuc3RvcCgpO1xuICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBpZiAoY2xpKSB7XG4gICAgICAgIGNsaS5zdG9wQ2xpZW50KCk7XG4gICAgICAgIGNsaS5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcblxuICAgICAgICBpZiAodW5zZXRDbGllbnQpIHtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy51bnNldCgpO1xuICAgICAgICAgICAgRXZlbnRJbmRleFBlZy51bnNldCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19