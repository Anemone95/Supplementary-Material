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

var _matrix = require("matrix-js-sdk/src/matrix");

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
          const cli = (0, _matrix.createClient)({
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

  const client = (0, _matrix.createClient)({
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9MaWZlY3ljbGUudHMiXSwibmFtZXMiOlsiSE9NRVNFUlZFUl9VUkxfS0VZIiwiSURfU0VSVkVSX1VSTF9LRVkiLCJsb2FkU2Vzc2lvbiIsIm9wdHMiLCJlbmFibGVHdWVzdCIsImd1ZXN0SHNVcmwiLCJndWVzdElzVXJsIiwiZnJhZ21lbnRRdWVyeVBhcmFtcyIsImRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSIsImNvbnNvbGUiLCJ3YXJuIiwiZ3Vlc3RfdXNlcl9pZCIsImd1ZXN0X2FjY2Vzc190b2tlbiIsImxvZyIsImRvU2V0TG9nZ2VkSW4iLCJ1c2VySWQiLCJhY2Nlc3NUb2tlbiIsImhvbWVzZXJ2ZXJVcmwiLCJpZGVudGl0eVNlcnZlclVybCIsImd1ZXN0IiwidGhlbiIsInN1Y2Nlc3MiLCJyZXN0b3JlRnJvbUxvY2FsU3RvcmFnZSIsImlnbm9yZUd1ZXN0IiwiQm9vbGVhbiIsInJlZ2lzdGVyQXNHdWVzdCIsImUiLCJBYm9ydExvZ2luQW5kUmVidWlsZFN0b3JhZ2UiLCJoYW5kbGVMb2FkU2Vzc2lvbkZhaWx1cmUiLCJnZXRTdG9yZWRTZXNzaW9uT3duZXIiLCJoc1VybCIsImhhc0FjY2Vzc1Rva2VuIiwiaXNHdWVzdCIsImdldFN0b3JlZFNlc3Npb25WYXJzIiwiYXR0ZW1wdFRva2VuTG9naW4iLCJxdWVyeVBhcmFtcyIsImZyYWdtZW50QWZ0ZXJMb2dpbiIsImxvZ2luVG9rZW4iLCJQcm9taXNlIiwicmVzb2x2ZSIsImhvbWVzZXJ2ZXIiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiU1NPX0hPTUVTRVJWRVJfVVJMX0tFWSIsImlkZW50aXR5U2VydmVyIiwiU1NPX0lEX1NFUlZFUl9VUkxfS0VZIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiYnV0dG9uIiwidG9rZW4iLCJpbml0aWFsX2RldmljZV9kaXNwbGF5X25hbWUiLCJjcmVkcyIsImNsZWFyU3RvcmFnZSIsInBlcnNpc3RDcmVkZW50aWFscyIsInNlc3Npb25TdG9yYWdlIiwic2V0SXRlbSIsIlN0cmluZyIsImNhdGNoIiwiZXJyIiwibmFtZSIsIm9uRmluaXNoZWQiLCJ0cnlBZ2FpbiIsImNsaSIsImJhc2VVcmwiLCJpZEJhc2VVcmwiLCJpZHBJZCIsIlNTT19JRFBfSURfS0VZIiwidW5kZWZpbmVkIiwiUGxhdGZvcm1QZWciLCJnZXQiLCJzdGFydFNpbmdsZVNpZ25PbiIsImVycm9yIiwiaGFuZGxlSW52YWxpZFN0b3JlRXJyb3IiLCJyZWFzb24iLCJJbnZhbGlkU3RvcmVFcnJvciIsIlRPR0dMRURfTEFaWV9MT0FESU5HIiwibGF6eUxvYWRFbmFibGVkIiwidmFsdWUiLCJMYXp5TG9hZGluZ1Jlc3luY0RpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsImNyZWF0ZURpYWxvZyIsIkxhenlMb2FkaW5nRGlzYWJsZWREaWFsb2ciLCJob3N0Iiwid2luZG93IiwibG9jYXRpb24iLCJNYXRyaXhDbGllbnRQZWciLCJzdG9yZSIsImRlbGV0ZUFsbERhdGEiLCJyZWxvYWQiLCJpc1VybCIsImNsaWVudCIsInJlZ2lzdGVyR3Vlc3QiLCJib2R5IiwidXNlcl9pZCIsImRldmljZUlkIiwiZGV2aWNlX2lkIiwiYWNjZXNzX3Rva2VuIiwiU3RvcmFnZU1hbmFnZXIiLCJpZGJMb2FkIiwiaWRiU2F2ZSIsInJlbW92ZUl0ZW0iLCJwaWNrbGVLZXlUb0Flc0tleSIsInBpY2tsZUtleSIsInBpY2tsZUtleUJ1ZmZlciIsIlVpbnQ4QXJyYXkiLCJsZW5ndGgiLCJpIiwiY2hhckNvZGVBdCIsImhrZGZLZXkiLCJjcnlwdG8iLCJzdWJ0bGUiLCJpbXBvcnRLZXkiLCJmaWxsIiwiZGVyaXZlQml0cyIsImhhc2giLCJzYWx0IiwiaW5mbyIsImFib3J0TG9naW4iLCJzaWduT3V0Iiwic2hvd1N0b3JhZ2VFdmljdGVkRGlhbG9nIiwiZGVjcnlwdGVkQWNjZXNzVG9rZW4iLCJnZXRQaWNrbGVLZXkiLCJlbmNyS2V5IiwiZnJlc2hMb2dpbiIsIlNlc3Npb25SZXN0b3JlRXJyb3JEaWFsb2ciLCJtb2RhbCIsIm1lc3NhZ2UiLCJmaW5pc2hlZCIsInNldExvZ2dlZEluIiwiY3JlZGVudGlhbHMiLCJzdG9wTWF0cml4Q2xpZW50IiwiY3JlYXRlUGlja2xlS2V5IiwiT2JqZWN0IiwiYXNzaWduIiwiaHlkcmF0ZVNlc3Npb24iLCJvbGRVc2VySWQiLCJnZXRVc2VySWQiLCJvbGREZXZpY2VJZCIsImdldERldmljZUlkIiwiX2lzTG9nZ2luZ091dCIsIm92ZXJ3cml0ZSIsImNsZWFyU3RvcmFnZUVuYWJsZWQiLCJzb2Z0TG9nb3V0IiwiaXNTb2Z0TG9nb3V0IiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJyZXN1bHRzIiwiY2hlY2tDb25zaXN0ZW5jeSIsImRhdGFJbkxvY2FsU3RvcmFnZSIsImNyeXB0b0luaXRlZCIsImRhdGFJbkNyeXB0b1N0b3JlIiwiQW5hbHl0aWNzIiwicmVwbGFjZVVzaW5nQ3JlZHMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJuZXdEZXZpY2VJZCIsInJlaHlkcmF0ZURldmljZSIsInN0YXJ0TWF0cml4Q2xpZW50IiwiU3RvcmFnZUV2aWN0ZWREaWFsb2ciLCJFcnJvciIsIkpTT04iLCJzdHJpbmdpZnkiLCJkZWxldGVJdGVtIiwiZW5jcnlwdGVkQWNjZXNzVG9rZW4iLCJTZWN1cml0eUN1c3RvbWlzYXRpb25zIiwibG9nb3V0IiwiQ291bnRseUFuYWx5dGljcyIsImluc3RhbmNlIiwiZGlzYWJsZWQiLCJlbmFibGUiLCJzZXRJbW1lZGlhdGUiLCJvbkxvZ2dlZE91dCIsImRlc3Ryb3lQaWNrbGVLZXkiLCJpc0xvZ2dpbmdPdXQiLCJzdGFydFN5bmNpbmciLCJUeXBpbmdTdG9yZSIsInNoYXJlZEluc3RhbmNlIiwicmVzZXQiLCJUb2FzdFN0b3JlIiwiTm90aWZpZXIiLCJzdGFydCIsIlVzZXJBY3Rpdml0eSIsIkRNUm9vbU1hcCIsIm1ha2VTaGFyZWQiLCJJbnRlZ3JhdGlvbk1hbmFnZXJzIiwic3RhcnRXYXRjaGluZyIsIkFjdGl2ZVdpZGdldFN0b3JlIiwiQ2FsbEhhbmRsZXIiLCJNam9sbmlyIiwiRXZlbnRJbmRleFBlZyIsImluaXQiLCJEZXZpY2VMaXN0ZW5lciIsIlByZXNlbmNlIiwiSml0c2kiLCJnZXRJbnN0YW5jZSIsImRlbGV0ZUV2ZXJ5dGhpbmciLCJMaWZlY3ljbGVDdXN0b21pc2F0aW9ucyIsIm9uTG9nZ2VkT3V0QW5kU3RvcmFnZUNsZWFyZWQiLCJkaXNhYmxlIiwicGVuZGluZ0ludml0ZXMiLCJUaHJlZXBpZEludml0ZVN0b3JlIiwiZ2V0V2lyZUludml0ZXMiLCJjbGVhciIsImlkYkRlbGV0ZSIsImZvckVhY2giLCJyb29tSWQiLCJzdG9yZUludml0ZSIsImRlbGV0ZUV2ZW50SW5kZXgiLCJjbGVhclN0b3JlcyIsInVuc2V0Q2xpZW50Iiwic3RvcCIsInN0b3BXYXRjaGluZyIsInNoYXJlZCIsInN0b3BDbGllbnQiLCJyZW1vdmVBbGxMaXN0ZW5lcnMiLCJ1bnNldCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBOztBQUNBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXJEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFzQ0EsTUFBTUEsa0JBQWtCLEdBQUcsV0FBM0I7QUFDQSxNQUFNQyxpQkFBaUIsR0FBRyxXQUExQjs7QUFXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QXdCOUIsbUJBQVU4QixNQUFWLEdBQW1CRixJQUFuQjs7QUFDeEJyQix5QkFBY3FCLElBQWQ7O0FBQ0EsUUFBTXRKLEdBQUcsR0FBR3dCLGlDQUFnQmpCLEdBQWhCLEVBQVo7O0FBQ0EsTUFBSVAsR0FBSixFQUFTO0FBQ0xBLElBQUFBLEdBQUcsQ0FBQ3lKLFVBQUo7QUFDQXpKLElBQUFBLEdBQUcsQ0FBQzBKLGtCQUFKOztBQUVBLFFBQUlMLFdBQUosRUFBaUI7QUFDYjdILHVDQUFnQm1JLEtBQWhCOztBQUNBMUIsNkJBQWMwQixLQUFkO0FBQ0g7QUFDSjtBQUNKIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbWF0cml4JztcbmltcG9ydCB7IEludmFsaWRTdG9yZUVycm9yIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2Vycm9yc1wiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuaW1wb3J0IHtkZWNyeXB0QUVTLCBlbmNyeXB0QUVTfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL2Flc1wiO1xuXG5pbXBvcnQge0lNYXRyaXhDbGllbnRDcmVkcywgTWF0cml4Q2xpZW50UGVnfSBmcm9tICcuL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgU2VjdXJpdHlDdXN0b21pc2F0aW9ucyBmcm9tIFwiLi9jdXN0b21pc2F0aW9ucy9TZWN1cml0eVwiO1xuaW1wb3J0IEV2ZW50SW5kZXhQZWcgZnJvbSAnLi9pbmRleGluZy9FdmVudEluZGV4UGVnJztcbmltcG9ydCBjcmVhdGVNYXRyaXhDbGllbnQgZnJvbSAnLi91dGlscy9jcmVhdGVNYXRyaXhDbGllbnQnO1xuaW1wb3J0IEFuYWx5dGljcyBmcm9tICcuL0FuYWx5dGljcyc7XG5pbXBvcnQgTm90aWZpZXIgZnJvbSAnLi9Ob3RpZmllcic7XG5pbXBvcnQgVXNlckFjdGl2aXR5IGZyb20gJy4vVXNlckFjdGl2aXR5JztcbmltcG9ydCBQcmVzZW5jZSBmcm9tICcuL1ByZXNlbmNlJztcbmltcG9ydCBkaXMgZnJvbSAnLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IERNUm9vbU1hcCBmcm9tICcuL3V0aWxzL0RNUm9vbU1hcCc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi9Nb2RhbCc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgQWN0aXZlV2lkZ2V0U3RvcmUgZnJvbSAnLi9zdG9yZXMvQWN0aXZlV2lkZ2V0U3RvcmUnO1xuaW1wb3J0IFBsYXRmb3JtUGVnIGZyb20gXCIuL1BsYXRmb3JtUGVnXCI7XG5pbXBvcnQgeyBzZW5kTG9naW5SZXF1ZXN0IH0gZnJvbSBcIi4vTG9naW5cIjtcbmltcG9ydCAqIGFzIFN0b3JhZ2VNYW5hZ2VyIGZyb20gJy4vdXRpbHMvU3RvcmFnZU1hbmFnZXInO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IFR5cGluZ1N0b3JlIGZyb20gXCIuL3N0b3Jlcy9UeXBpbmdTdG9yZVwiO1xuaW1wb3J0IFRvYXN0U3RvcmUgZnJvbSBcIi4vc3RvcmVzL1RvYXN0U3RvcmVcIjtcbmltcG9ydCB7SW50ZWdyYXRpb25NYW5hZ2Vyc30gZnJvbSBcIi4vaW50ZWdyYXRpb25zL0ludGVncmF0aW9uTWFuYWdlcnNcIjtcbmltcG9ydCB7TWpvbG5pcn0gZnJvbSBcIi4vbWpvbG5pci9Nam9sbmlyXCI7XG5pbXBvcnQgRGV2aWNlTGlzdGVuZXIgZnJvbSBcIi4vRGV2aWNlTGlzdGVuZXJcIjtcbmltcG9ydCB7Sml0c2l9IGZyb20gXCIuL3dpZGdldHMvSml0c2lcIjtcbmltcG9ydCB7U1NPX0hPTUVTRVJWRVJfVVJMX0tFWSwgU1NPX0lEX1NFUlZFUl9VUkxfS0VZLCBTU09fSURQX0lEX0tFWX0gZnJvbSBcIi4vQmFzZVBsYXRmb3JtXCI7XG5pbXBvcnQgVGhyZWVwaWRJbnZpdGVTdG9yZSBmcm9tIFwiLi9zdG9yZXMvVGhyZWVwaWRJbnZpdGVTdG9yZVwiO1xuaW1wb3J0IENvdW50bHlBbmFseXRpY3MgZnJvbSBcIi4vQ291bnRseUFuYWx5dGljc1wiO1xuaW1wb3J0IENhbGxIYW5kbGVyIGZyb20gJy4vQ2FsbEhhbmRsZXInO1xuaW1wb3J0IExpZmVjeWNsZUN1c3RvbWlzYXRpb25zIGZyb20gXCIuL2N1c3RvbWlzYXRpb25zL0xpZmVjeWNsZVwiO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gXCIuL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9FcnJvckRpYWxvZ1wiO1xuaW1wb3J0IHtfdH0gZnJvbSBcIi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5cbmNvbnN0IEhPTUVTRVJWRVJfVVJMX0tFWSA9IFwibXhfaHNfdXJsXCI7XG5jb25zdCBJRF9TRVJWRVJfVVJMX0tFWSA9IFwibXhfaXNfdXJsXCI7XG5cbmludGVyZmFjZSBJTG9hZFNlc3Npb25PcHRzIHtcbiAgICBlbmFibGVHdWVzdD86IGJvb2xlYW47XG4gICAgZ3Vlc3RIc1VybD86IHN0cmluZztcbiAgICBndWVzdElzVXJsPzogc3RyaW5nO1xuICAgIGlnbm9yZUd1ZXN0PzogYm9vbGVhbjtcbiAgICBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU/OiBzdHJpbmc7XG4gICAgZnJhZ21lbnRRdWVyeVBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbi8qKlxuICogQ2FsbGVkIGF0IHN0YXJ0dXAsIHRvIGF0dGVtcHQgdG8gYnVpbGQgYSBsb2dnZWQtaW4gTWF0cml4IHNlc3Npb24uIEl0IHRyaWVzXG4gKiBhIG51bWJlciBvZiB0aGluZ3M6XG4gKlxuICogMS4gaWYgd2UgaGF2ZSBhIGd1ZXN0IGFjY2VzcyB0b2tlbiBpbiB0aGUgZnJhZ21lbnQgcXVlcnkgcGFyYW1zLCBpdCB1c2VzXG4gKiAgICB0aGF0LlxuICogMi4gaWYgYW4gYWNjZXNzIHRva2VuIGlzIHN0b3JlZCBpbiBsb2NhbCBzdG9yYWdlIChmcm9tIGEgcHJldmlvdXMgc2Vzc2lvbiksXG4gKiAgICBpdCB1c2VzIHRoYXQuXG4gKiAzLiBpdCBhdHRlbXB0cyB0byBhdXRvLXJlZ2lzdGVyIGFzIGEgZ3Vlc3QgdXNlci5cbiAqXG4gKiBJZiBhbnkgb2Ygc3RlcHMgMS00IGFyZSBzdWNjZXNzZnVsLCBpdCB3aWxsIGNhbGwge19kb1NldExvZ2dlZElufSwgd2hpY2ggaW5cbiAqIHR1cm4gd2lsbCByYWlzZSBvbl9sb2dnZWRfaW4gYW5kIHdpbGxfc3RhcnRfY2xpZW50IGV2ZW50cy5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdHNdXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdHMuZnJhZ21lbnRRdWVyeVBhcmFtc106IHN0cmluZy0+c3RyaW5nIG1hcCBvZiB0aGVcbiAqICAgICBxdWVyeS1wYXJhbWV0ZXJzIGV4dHJhY3RlZCBmcm9tIHRoZSAjLWZyYWdtZW50IG9mIHRoZSBzdGFydGluZyBVUkkuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRzLmVuYWJsZUd1ZXN0XTogc2V0IHRvIHRydWUgdG8gZW5hYmxlIGd1ZXN0IGFjY2Vzc1xuICogICAgIHRva2VucyBhbmQgYXV0by1ndWVzdCByZWdpc3RyYXRpb25zLlxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRzLmd1ZXN0SHNVcmxdOiBob21lc2VydmVyIFVSTC4gT25seSB1c2VkIGlmIGVuYWJsZUd1ZXN0XG4gKiAgICAgaXMgdHJ1ZTsgZGVmaW5lcyB0aGUgSFMgdG8gcmVnaXN0ZXIgYWdhaW5zdC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0cy5ndWVzdElzVXJsXTogaG9tZXNlcnZlciBVUkwuIE9ubHkgdXNlZCBpZiBlbmFibGVHdWVzdFxuICogICAgIGlzIHRydWU7IGRlZmluZXMgdGhlIElTIHRvIHVzZS5cbiAqIEBwYXJhbSB7Ym9vbH0gW29wdHMuaWdub3JlR3Vlc3RdOiBJZiB0aGUgc3RvcmVkIHNlc3Npb24gaXMgYSBndWVzdCBhY2NvdW50LFxuICogICAgIGlnbm9yZSBpdCBhbmQgZG9uJ3QgbG9hZCBpdC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0cy5kZWZhdWx0RGV2aWNlRGlzcGxheU5hbWVdOiBEZWZhdWx0IGRpc3BsYXkgbmFtZSB0byB1c2VcbiAqICAgICB3aGVuIHJlZ2lzdGVyaW5nIGFzIGEgZ3Vlc3QuXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gYSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHdoZW4gdGhlIGFib3ZlIHByb2Nlc3MgY29tcGxldGVzLlxuICogICAgIFJlc29sdmVzIHRvIGB0cnVlYCBpZiB3ZSBlbmRlZCB1cCBzdGFydGluZyBhIHNlc3Npb24sIG9yIGBmYWxzZWAgaWYgd2VcbiAqICAgICBmYWlsZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkU2Vzc2lvbihvcHRzOiBJTG9hZFNlc3Npb25PcHRzID0ge30pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgICBsZXQgZW5hYmxlR3Vlc3QgPSBvcHRzLmVuYWJsZUd1ZXN0IHx8IGZhbHNlO1xuICAgICAgICBjb25zdCBndWVzdEhzVXJsID0gb3B0cy5ndWVzdEhzVXJsO1xuICAgICAgICBjb25zdCBndWVzdElzVXJsID0gb3B0cy5ndWVzdElzVXJsO1xuICAgICAgICBjb25zdCBmcmFnbWVudFF1ZXJ5UGFyYW1zID0gb3B0cy5mcmFnbWVudFF1ZXJ5UGFyYW1zIHx8IHt9O1xuICAgICAgICBjb25zdCBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWUgPSBvcHRzLmRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZTtcblxuICAgICAgICBpZiAoZW5hYmxlR3Vlc3QgJiYgIWd1ZXN0SHNVcmwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkNhbm5vdCBlbmFibGUgZ3Vlc3QgYWNjZXNzOiBjYW4ndCBkZXRlcm1pbmUgSFMgVVJMIHRvIHVzZVwiKTtcbiAgICAgICAgICAgIGVuYWJsZUd1ZXN0ID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBlbmFibGVHdWVzdCAmJlxuICAgICAgICAgICAgZnJhZ21lbnRRdWVyeVBhcmFtcy5ndWVzdF91c2VyX2lkICYmXG4gICAgICAgICAgICBmcmFnbWVudFF1ZXJ5UGFyYW1zLmd1ZXN0X2FjY2Vzc190b2tlblxuICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVXNpbmcgZ3Vlc3QgYWNjZXNzIGNyZWRlbnRpYWxzXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGRvU2V0TG9nZ2VkSW4oe1xuICAgICAgICAgICAgICAgIHVzZXJJZDogZnJhZ21lbnRRdWVyeVBhcmFtcy5ndWVzdF91c2VyX2lkLFxuICAgICAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiBmcmFnbWVudFF1ZXJ5UGFyYW1zLmd1ZXN0X2FjY2Vzc190b2tlbixcbiAgICAgICAgICAgICAgICBob21lc2VydmVyVXJsOiBndWVzdEhzVXJsLFxuICAgICAgICAgICAgICAgIGlkZW50aXR5U2VydmVyVXJsOiBndWVzdElzVXJsLFxuICAgICAgICAgICAgICAgIGd1ZXN0OiB0cnVlLFxuICAgICAgICAgICAgfSwgdHJ1ZSkudGhlbigoKSA9PiB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdWNjZXNzID0gYXdhaXQgcmVzdG9yZUZyb21Mb2NhbFN0b3JhZ2Uoe1xuICAgICAgICAgICAgaWdub3JlR3Vlc3Q6IEJvb2xlYW4ob3B0cy5pZ25vcmVHdWVzdCksXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW5hYmxlR3Vlc3QpIHtcbiAgICAgICAgICAgIHJldHVybiByZWdpc3RlckFzR3Vlc3QoZ3Vlc3RIc1VybCwgZ3Vlc3RJc1VybCwgZGVmYXVsdERldmljZURpc3BsYXlOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZhbGwgYmFjayB0byB3ZWxjb21lIHNjcmVlblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIEFib3J0TG9naW5BbmRSZWJ1aWxkU3RvcmFnZSkge1xuICAgICAgICAgICAgLy8gSWYgd2UncmUgYWJvcnRpbmcgbG9naW4gYmVjYXVzZSBvZiBhIHN0b3JhZ2UgaW5jb25zaXN0ZW5jeSwgd2UgZG9uJ3RcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gc2hvdyB0aGUgZ2VuZXJhbCBmYWlsdXJlIGRpYWxvZy4gSW5zdGVhZCwganVzdCBnbyBiYWNrIHRvIHdlbGNvbWUuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhbmRsZUxvYWRTZXNzaW9uRmFpbHVyZShlKTtcbiAgICB9XG59XG5cbi8qKlxuICogR2V0cyB0aGUgdXNlciBJRCBvZiB0aGUgcGVyc2lzdGVkIHNlc3Npb24sIGlmIG9uZSBleGlzdHMuIFRoaXMgZG9lcyBub3QgdmFsaWRhdGVcbiAqIHRoYXQgdGhlIHVzZXIncyBjcmVkZW50aWFscyBzdGlsbCB3b3JrLCBqdXN0IHRoYXQgdGhleSBleGlzdCBhbmQgdGhhdCBhIHVzZXIgSURcbiAqIGlzIGFzc29jaWF0ZWQgd2l0aCB0aGVtLiBUaGUgc2Vzc2lvbiBpcyBub3QgbG9hZGVkLlxuICogQHJldHVybnMge1tTdHJpbmcsIGJvb2xdfSBUaGUgcGVyc2lzdGVkIHNlc3Npb24ncyBvd25lciBhbmQgd2hldGhlciB0aGUgc3RvcmVkXG4gKiAgICAgc2Vzc2lvbiBpcyBmb3IgYSBndWVzdCB1c2VyLCBpZiBhbiBvd25lciBleGlzdHMuIElmIHRoZXJlIGlzIG5vIHN0b3JlZCBzZXNzaW9uLFxuICogICAgIHJldHVybiBbbnVsbCwgbnVsbF0uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTdG9yZWRTZXNzaW9uT3duZXIoKTogUHJvbWlzZTxbc3RyaW5nLCBib29sZWFuXT4ge1xuICAgIGNvbnN0IHtoc1VybCwgdXNlcklkLCBoYXNBY2Nlc3NUb2tlbiwgaXNHdWVzdH0gPSBhd2FpdCBnZXRTdG9yZWRTZXNzaW9uVmFycygpO1xuICAgIHJldHVybiBoc1VybCAmJiB1c2VySWQgJiYgaGFzQWNjZXNzVG9rZW4gPyBbdXNlcklkLCBpc0d1ZXN0XSA6IFtudWxsLCBudWxsXTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge09iamVjdH0gcXVlcnlQYXJhbXMgICAgc3RyaW5nLT5zdHJpbmcgbWFwIG9mIHRoZVxuICogICAgIHF1ZXJ5LXBhcmFtZXRlcnMgZXh0cmFjdGVkIGZyb20gdGhlIHJlYWwgcXVlcnktc3RyaW5nIG9mIHRoZSBzdGFydGluZ1xuICogICAgIFVSSS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZGVmYXVsdERldmljZURpc3BsYXlOYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gZnJhZ21lbnRBZnRlckxvZ2luIHBhdGggdG8gZ28gdG8gYWZ0ZXIgYSBzdWNjZXNzZnVsIGxvZ2luLCBvbmx5IHVzZWQgZm9yIFwiVHJ5IGFnYWluXCJcbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSB3aGljaCByZXNvbHZlcyB0byB0cnVlIGlmIHdlIGNvbXBsZXRlZCB0aGUgdG9rZW5cbiAqICAgIGxvZ2luLCBlbHNlIGZhbHNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhdHRlbXB0VG9rZW5Mb2dpbihcbiAgICBxdWVyeVBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPixcbiAgICBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU/OiBzdHJpbmcsXG4gICAgZnJhZ21lbnRBZnRlckxvZ2luPzogc3RyaW5nLFxuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKCFxdWVyeVBhcmFtcy5sb2dpblRva2VuKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuICAgIH1cblxuICAgIGNvbnN0IGhvbWVzZXJ2ZXIgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShTU09fSE9NRVNFUlZFUl9VUkxfS0VZKTtcbiAgICBjb25zdCBpZGVudGl0eVNlcnZlciA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFNTT19JRF9TRVJWRVJfVVJMX0tFWSk7XG4gICAgaWYgKCFob21lc2VydmVyKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIkNhbm5vdCBsb2cgaW4gd2l0aCB0b2tlbjogY2FuJ3QgZGV0ZXJtaW5lIEhTIFVSTCB0byB1c2VcIik7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coXCJTU09cIiwgXCJVbmtub3duIEhTXCIsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoXCJXZSBjb3VsZG4ndCBsb2cgeW91IGluXCIpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiV2UgYXNrZWQgdGhlIGJyb3dzZXIgdG8gcmVtZW1iZXIgd2hpY2ggaG9tZXNlcnZlciB5b3UgdXNlIHRvIGxldCB5b3Ugc2lnbiBpbiwgXCIgK1xuICAgICAgICAgICAgICAgIFwiYnV0IHVuZm9ydHVuYXRlbHkgeW91ciBicm93c2VyIGhhcyBmb3Jnb3R0ZW4gaXQuIEdvIHRvIHRoZSBzaWduIGluIHBhZ2UgYW5kIHRyeSBhZ2Fpbi5cIiksXG4gICAgICAgICAgICBidXR0b246IF90KFwiVHJ5IGFnYWluXCIpLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbmRMb2dpblJlcXVlc3QoXG4gICAgICAgIGhvbWVzZXJ2ZXIsXG4gICAgICAgIGlkZW50aXR5U2VydmVyLFxuICAgICAgICBcIm0ubG9naW4udG9rZW5cIiwge1xuICAgICAgICAgICAgdG9rZW46IHF1ZXJ5UGFyYW1zLmxvZ2luVG9rZW4sXG4gICAgICAgICAgICBpbml0aWFsX2RldmljZV9kaXNwbGF5X25hbWU6IGRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSxcbiAgICAgICAgfSxcbiAgICApLnRoZW4oZnVuY3Rpb24oY3JlZHMpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJMb2dnZWQgaW4gd2l0aCB0b2tlblwiKTtcbiAgICAgICAgcmV0dXJuIGNsZWFyU3RvcmFnZSgpLnRoZW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgYXdhaXQgcGVyc2lzdENyZWRlbnRpYWxzKGNyZWRzKTtcbiAgICAgICAgICAgIC8vIHJlbWVtYmVyIHRoYXQgd2UganVzdCBsb2dnZWQgaW5cbiAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXCJteF9mcmVzaF9sb2dpblwiLCBTdHJpbmcodHJ1ZSkpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhcIlNTT1wiLCBcIlRva2VuIFJlamVjdGVkXCIsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoXCJXZSBjb3VsZG4ndCBsb2cgeW91IGluXCIpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGVyci5uYW1lID09PSBcIkNvbm5lY3Rpb25FcnJvclwiXG4gICAgICAgICAgICAgICAgPyBfdChcIllvdXIgaG9tZXNlcnZlciB3YXMgdW5yZWFjaGFibGUgYW5kIHdhcyBub3QgYWJsZSB0byBsb2cgeW91IGluLiBQbGVhc2UgdHJ5IGFnYWluLiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiSWYgdGhpcyBjb250aW51ZXMsIHBsZWFzZSBjb250YWN0IHlvdXIgaG9tZXNlcnZlciBhZG1pbmlzdHJhdG9yLlwiKVxuICAgICAgICAgICAgICAgIDogX3QoXCJZb3VyIGhvbWVzZXJ2ZXIgcmVqZWN0ZWQgeW91ciBsb2cgaW4gYXR0ZW1wdC4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIlRoaXMgY291bGQgYmUgZHVlIHRvIHRoaW5ncyBqdXN0IHRha2luZyB0b28gbG9uZy4gUGxlYXNlIHRyeSBhZ2Fpbi4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIklmIHRoaXMgY29udGludWVzLCBwbGVhc2UgY29udGFjdCB5b3VyIGhvbWVzZXJ2ZXIgYWRtaW5pc3RyYXRvci5cIiksXG4gICAgICAgICAgICBidXR0b246IF90KFwiVHJ5IGFnYWluXCIpLFxuICAgICAgICAgICAgb25GaW5pc2hlZDogdHJ5QWdhaW4gPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0cnlBZ2Fpbikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGkgPSBjcmVhdGVDbGllbnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVVybDogaG9tZXNlcnZlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkQmFzZVVybDogaWRlbnRpdHlTZXJ2ZXIsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZHBJZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFNTT19JRFBfSURfS0VZKSB8fCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIFBsYXRmb3JtUGVnLmdldCgpLnN0YXJ0U2luZ2xlU2lnbk9uKGNsaSwgXCJzc29cIiwgZnJhZ21lbnRBZnRlckxvZ2luLCBpZHBJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gbG9nIGluIHdpdGggbG9naW4gdG9rZW46XCIpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZUludmFsaWRTdG9yZUVycm9yKGU6IEludmFsaWRTdG9yZUVycm9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGUucmVhc29uID09PSBJbnZhbGlkU3RvcmVFcnJvci5UT0dHTEVEX0xBWllfTE9BRElORykge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsYXp5TG9hZEVuYWJsZWQgPSBlLnZhbHVlO1xuICAgICAgICAgICAgaWYgKGxhenlMb2FkRW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IExhenlMb2FkaW5nUmVzeW5jRGlhbG9nID1cbiAgICAgICAgICAgICAgICAgICAgc2RrLmdldENvbXBvbmVudChcInZpZXdzLmRpYWxvZ3MuTGF6eUxvYWRpbmdSZXN5bmNEaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhMYXp5TG9hZGluZ1Jlc3luY0RpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZDogcmVzb2x2ZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHNob3cgd2FybmluZyBhYm91dCBzaW11bHRhbmVvdXMgdXNlXG4gICAgICAgICAgICAgICAgLy8gYmV0d2VlbiBMTC9ub24tTEwgdmVyc2lvbiBvbiBzYW1lIGhvc3QuXG4gICAgICAgICAgICAgICAgLy8gYXMgZGlzYWJsaW5nIExMIHdoZW4gcHJldmlvdXNseSBlbmFibGVkXG4gICAgICAgICAgICAgICAgLy8gaXMgYSBzdHJvbmcgaW5kaWNhdG9yIG9mIHRoaXMgKC9kZXZlbG9wICYgL2FwcClcbiAgICAgICAgICAgICAgICBjb25zdCBMYXp5TG9hZGluZ0Rpc2FibGVkRGlhbG9nID1cbiAgICAgICAgICAgICAgICAgICAgc2RrLmdldENvbXBvbmVudChcInZpZXdzLmRpYWxvZ3MuTGF6eUxvYWRpbmdEaXNhYmxlZERpYWxvZ1wiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKExhenlMb2FkaW5nRGlzYWJsZWREaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6IHJlc29sdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBob3N0OiB3aW5kb3cubG9jYXRpb24uaG9zdCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zdG9yZS5kZWxldGVBbGxEYXRhKCk7XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgUGxhdGZvcm1QZWcuZ2V0KCkucmVsb2FkKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJBc0d1ZXN0KFxuICAgIGhzVXJsOiBzdHJpbmcsXG4gICAgaXNVcmw6IHN0cmluZyxcbiAgICBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU6IHN0cmluZyxcbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnNvbGUubG9nKGBEb2luZyBndWVzdCBsb2dpbiBvbiAke2hzVXJsfWApO1xuXG4gICAgLy8gY3JlYXRlIGEgdGVtcG9yYXJ5IE1hdHJpeENsaWVudCB0byBkbyB0aGUgbG9naW5cbiAgICBjb25zdCBjbGllbnQgPSBjcmVhdGVDbGllbnQoe1xuICAgICAgICBiYXNlVXJsOiBoc1VybCxcbiAgICB9KTtcblxuICAgIHJldHVybiBjbGllbnQucmVnaXN0ZXJHdWVzdCh7XG4gICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgIGluaXRpYWxfZGV2aWNlX2Rpc3BsYXlfbmFtZTogZGVmYXVsdERldmljZURpc3BsYXlOYW1lLFxuICAgICAgICB9LFxuICAgIH0pLnRoZW4oKGNyZWRzKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBSZWdpc3RlcmVkIGFzIGd1ZXN0OiAke2NyZWRzLnVzZXJfaWR9YCk7XG4gICAgICAgIHJldHVybiBkb1NldExvZ2dlZEluKHtcbiAgICAgICAgICAgIHVzZXJJZDogY3JlZHMudXNlcl9pZCxcbiAgICAgICAgICAgIGRldmljZUlkOiBjcmVkcy5kZXZpY2VfaWQsXG4gICAgICAgICAgICBhY2Nlc3NUb2tlbjogY3JlZHMuYWNjZXNzX3Rva2VuLFxuICAgICAgICAgICAgaG9tZXNlcnZlclVybDogaHNVcmwsXG4gICAgICAgICAgICBpZGVudGl0eVNlcnZlclVybDogaXNVcmwsXG4gICAgICAgICAgICBndWVzdDogdHJ1ZSxcbiAgICAgICAgfSwgdHJ1ZSkudGhlbigoKSA9PiB0cnVlKTtcbiAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gcmVnaXN0ZXIgYXMgZ3Vlc3RcIiwgZXJyKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElTdG9yZWRTZXNzaW9uIHtcbiAgICBoc1VybDogc3RyaW5nO1xuICAgIGlzVXJsOiBzdHJpbmc7XG4gICAgaGFzQWNjZXNzVG9rZW46IGJvb2xlYW47XG4gICAgYWNjZXNzVG9rZW46IHN0cmluZyB8IG9iamVjdDtcbiAgICB1c2VySWQ6IHN0cmluZztcbiAgICBkZXZpY2VJZDogc3RyaW5nO1xuICAgIGlzR3Vlc3Q6IGJvb2xlYW47XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBzdG9yZWQgc2Vzc2lvbiBmcm9tIHRoZSBicm93c2VyJ3Mgc3RvcmFnZS4gVGhlIHNlc3Npb25cbiAqIG1heSBub3QgYmUgdmFsaWQsIGFzIGl0IGlzIG5vdCB0ZXN0ZWQgZm9yIGNvbnNpc3RlbmN5IGhlcmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBJbmZvcm1hdGlvbiBhYm91dCB0aGUgc2Vzc2lvbiAtIHNlZSBpbXBsZW1lbnRhdGlvbiBmb3IgdmFyaWFibGVzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U3RvcmVkU2Vzc2lvblZhcnMoKTogUHJvbWlzZTxJU3RvcmVkU2Vzc2lvbj4ge1xuICAgIGNvbnN0IGhzVXJsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oSE9NRVNFUlZFUl9VUkxfS0VZKTtcbiAgICBjb25zdCBpc1VybCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKElEX1NFUlZFUl9VUkxfS0VZKTtcbiAgICBsZXQgYWNjZXNzVG9rZW47XG4gICAgdHJ5IHtcbiAgICAgICAgYWNjZXNzVG9rZW4gPSBhd2FpdCBTdG9yYWdlTWFuYWdlci5pZGJMb2FkKFwiYWNjb3VudFwiLCBcIm14X2FjY2Vzc190b2tlblwiKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIGlmICghYWNjZXNzVG9rZW4pIHtcbiAgICAgICAgYWNjZXNzVG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm14X2FjY2Vzc190b2tlblwiKTtcbiAgICAgICAgaWYgKGFjY2Vzc1Rva2VuKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIHRyeSB0byBtaWdyYXRlIGFjY2VzcyB0b2tlbiB0byBJbmRleGVkREIgaWYgd2UgY2FuXG4gICAgICAgICAgICAgICAgYXdhaXQgU3RvcmFnZU1hbmFnZXIuaWRiU2F2ZShcImFjY291bnRcIiwgXCJteF9hY2Nlc3NfdG9rZW5cIiwgYWNjZXNzVG9rZW4pO1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwibXhfYWNjZXNzX3Rva2VuXCIpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBpZiB3ZSBwcmUtZGF0ZSBzdG9yaW5nIFwibXhfaGFzX2FjY2Vzc190b2tlblwiLCBidXQgd2UgcmV0cmlldmVkIGFuIGFjY2Vzc1xuICAgIC8vIHRva2VuLCB0aGVuIHdlIHNob3VsZCBzYXkgd2UgaGF2ZSBhbiBhY2Nlc3MgdG9rZW5cbiAgICBjb25zdCBoYXNBY2Nlc3NUb2tlbiA9XG4gICAgICAgIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm14X2hhc19hY2Nlc3NfdG9rZW5cIikgPT09IFwidHJ1ZVwiKSB8fCAhIWFjY2Vzc1Rva2VuO1xuICAgIGNvbnN0IHVzZXJJZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibXhfdXNlcl9pZFwiKTtcbiAgICBjb25zdCBkZXZpY2VJZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibXhfZGV2aWNlX2lkXCIpO1xuXG4gICAgbGV0IGlzR3Vlc3Q7XG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibXhfaXNfZ3Vlc3RcIikgIT09IG51bGwpIHtcbiAgICAgICAgaXNHdWVzdCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibXhfaXNfZ3Vlc3RcIikgPT09IFwidHJ1ZVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGxlZ2FjeSBrZXkgbmFtZVxuICAgICAgICBpc0d1ZXN0ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJtYXRyaXgtaXMtZ3Vlc3RcIikgPT09IFwidHJ1ZVwiO1xuICAgIH1cblxuICAgIHJldHVybiB7aHNVcmwsIGlzVXJsLCBoYXNBY2Nlc3NUb2tlbiwgYWNjZXNzVG9rZW4sIHVzZXJJZCwgZGV2aWNlSWQsIGlzR3Vlc3R9O1xufVxuXG4vLyBUaGUgcGlja2xlIGtleSBpcyBhIHN0cmluZyBvZiB1bnNwZWNpZmllZCBsZW5ndGggYW5kIGZvcm1hdC4gIEZvciBBRVMsIHdlXG4vLyBuZWVkIGEgMjU2LWJpdCBVaW50OEFycmF5LiAgU28gd2UgSEtERiB0aGUgcGlja2xlIGtleSB0byBnZW5lcmF0ZSB0aGUgQUVTXG4vLyBrZXkuICBUaGUgQUVTIGtleSBzaG91bGQgYmUgemVyb2VkIGFmdGVyIGl0IGlzIHVzZWQuXG5hc3luYyBmdW5jdGlvbiBwaWNrbGVLZXlUb0Flc0tleShwaWNrbGVLZXk6IHN0cmluZyk6IFByb21pc2U8VWludDhBcnJheT4ge1xuICAgIGNvbnN0IHBpY2tsZUtleUJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KHBpY2tsZUtleS5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGlja2xlS2V5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBpY2tsZUtleUJ1ZmZlcltpXSA9IHBpY2tsZUtleS5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbiAgICBjb25zdCBoa2RmS2V5ID0gYXdhaXQgd2luZG93LmNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICBcInJhd1wiLCBwaWNrbGVLZXlCdWZmZXIsIFwiSEtERlwiLCBmYWxzZSwgW1wiZGVyaXZlQml0c1wiXSxcbiAgICApO1xuICAgIHBpY2tsZUtleUJ1ZmZlci5maWxsKDApO1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCB3aW5kb3cuY3J5cHRvLnN1YnRsZS5kZXJpdmVCaXRzKFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiBcIkhLREZcIiwgaGFzaDogXCJTSEEtMjU2XCIsXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlOiBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQtRE9NLWxpYi1nZW5lcmF0b3IvcHVsbC84NzlcbiAgICAgICAgICAgIHNhbHQ6IG5ldyBVaW50OEFycmF5KDMyKSwgaW5mbzogbmV3IFVpbnQ4QXJyYXkoMCksXG4gICAgICAgIH0sXG4gICAgICAgIGhrZGZLZXksXG4gICAgICAgIDI1NixcbiAgICApKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gYWJvcnRMb2dpbigpIHtcbiAgICBjb25zdCBzaWduT3V0ID0gYXdhaXQgc2hvd1N0b3JhZ2VFdmljdGVkRGlhbG9nKCk7XG4gICAgaWYgKHNpZ25PdXQpIHtcbiAgICAgICAgYXdhaXQgY2xlYXJTdG9yYWdlKCk7XG4gICAgICAgIC8vIFRoaXMgZXJyb3IgZmVlbHMgYSBiaXQgY2x1bmt5LCBidXQgd2Ugd2FudCB0byBtYWtlIHN1cmUgd2UgZG9uJ3QgZ28gYW55XG4gICAgICAgIC8vIGZ1cnRoZXIgYW5kIGluc3RlYWQgaGVhZCBiYWNrIHRvIHNpZ24gaW4uXG4gICAgICAgIHRocm93IG5ldyBBYm9ydExvZ2luQW5kUmVidWlsZFN0b3JhZ2UoXG4gICAgICAgICAgICBcIkFib3J0aW5nIGxvZ2luIGluIHByb2dyZXNzIGJlY2F1c2Ugb2Ygc3RvcmFnZSBpbmNvbnNpc3RlbmN5XCIsXG4gICAgICAgICk7XG4gICAgfVxufVxuXG4vLyByZXR1cm5zIGEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB0byB0cnVlIGlmIGEgc2Vzc2lvbiBpcyBmb3VuZCBpblxuLy8gbG9jYWxzdG9yYWdlXG4vL1xuLy8gTi5CLiBMaWZlY3ljbGUuanMgc2hvdWxkIG5vdCBtYWludGFpbiBhbnkgZnVydGhlciBsb2NhbFN0b3JhZ2Ugc3RhdGUsIHdlXG4vLyAgICAgIGFyZSBtb3ZpbmcgdG93YXJkcyB1c2luZyBTZXNzaW9uU3RvcmUgdG8ga2VlcCB0cmFjayBvZiBzdGF0ZSByZWxhdGVkXG4vLyAgICAgIHRvIHRoZSBjdXJyZW50IHNlc3Npb24gKHdoaWNoIGlzIHR5cGljYWxseSBiYWNrZWQgYnkgbG9jYWxTdG9yYWdlKS5cbi8vXG4vLyAgICAgIFRoZSBwbGFuIGlzIHRvIGdyYWR1YWxseSBtb3ZlIHRoZSBsb2NhbFN0b3JhZ2UgYWNjZXNzIGRvbmUgaGVyZSBpbnRvXG4vLyAgICAgIFNlc3Npb25TdG9yZSB0byBhdm9pZCBidWdzIHdoZXJlIHRoZSB2aWV3IGJlY29tZXMgb3V0LW9mLXN5bmMgd2l0aFxuLy8gICAgICBsb2NhbFN0b3JhZ2UgKGUuZy4gaXNHdWVzdCBldGMuKVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc3RvcmVGcm9tTG9jYWxTdG9yYWdlKG9wdHM/OiB7IGlnbm9yZUd1ZXN0PzogYm9vbGVhbiB9KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaWdub3JlR3Vlc3QgPSBvcHRzPy5pZ25vcmVHdWVzdDtcblxuICAgIGlmICghbG9jYWxTdG9yYWdlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCB7aHNVcmwsIGlzVXJsLCBoYXNBY2Nlc3NUb2tlbiwgYWNjZXNzVG9rZW4sIHVzZXJJZCwgZGV2aWNlSWQsIGlzR3Vlc3R9ID0gYXdhaXQgZ2V0U3RvcmVkU2Vzc2lvblZhcnMoKTtcblxuICAgIGlmIChoYXNBY2Nlc3NUb2tlbiAmJiAhYWNjZXNzVG9rZW4pIHtcbiAgICAgICAgYWJvcnRMb2dpbigpO1xuICAgIH1cblxuICAgIGlmIChhY2Nlc3NUb2tlbiAmJiB1c2VySWQgJiYgaHNVcmwpIHtcbiAgICAgICAgaWYgKGlnbm9yZUd1ZXN0ICYmIGlzR3Vlc3QpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSWdub3Jpbmcgc3RvcmVkIGd1ZXN0IGFjY291bnQ6IFwiICsgdXNlcklkKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkZWNyeXB0ZWRBY2Nlc3NUb2tlbiA9IGFjY2Vzc1Rva2VuO1xuICAgICAgICBjb25zdCBwaWNrbGVLZXkgPSBhd2FpdCBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRQaWNrbGVLZXkodXNlcklkLCBkZXZpY2VJZCk7XG4gICAgICAgIGlmIChwaWNrbGVLZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiR290IHBpY2tsZSBrZXlcIik7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGFjY2Vzc1Rva2VuICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5jcktleSA9IGF3YWl0IHBpY2tsZUtleVRvQWVzS2V5KHBpY2tsZUtleSk7XG4gICAgICAgICAgICAgICAgZGVjcnlwdGVkQWNjZXNzVG9rZW4gPSBhd2FpdCBkZWNyeXB0QUVTKGFjY2Vzc1Rva2VuLCBlbmNyS2V5LCBcImFjY2Vzc190b2tlblwiKTtcbiAgICAgICAgICAgICAgICBlbmNyS2V5LmZpbGwoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIk5vIHBpY2tsZSBrZXkgYXZhaWxhYmxlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZnJlc2hMb2dpbiA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJteF9mcmVzaF9sb2dpblwiKSA9PT0gXCJ0cnVlXCI7XG4gICAgICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oXCJteF9mcmVzaF9sb2dpblwiKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhgUmVzdG9yaW5nIHNlc3Npb24gZm9yICR7dXNlcklkfWApO1xuICAgICAgICBhd2FpdCBkb1NldExvZ2dlZEluKHtcbiAgICAgICAgICAgIHVzZXJJZDogdXNlcklkLFxuICAgICAgICAgICAgZGV2aWNlSWQ6IGRldmljZUlkLFxuICAgICAgICAgICAgYWNjZXNzVG9rZW46IGRlY3J5cHRlZEFjY2Vzc1Rva2VuIGFzIHN0cmluZyxcbiAgICAgICAgICAgIGhvbWVzZXJ2ZXJVcmw6IGhzVXJsLFxuICAgICAgICAgICAgaWRlbnRpdHlTZXJ2ZXJVcmw6IGlzVXJsLFxuICAgICAgICAgICAgZ3Vlc3Q6IGlzR3Vlc3QsXG4gICAgICAgICAgICBwaWNrbGVLZXk6IHBpY2tsZUtleSxcbiAgICAgICAgICAgIGZyZXNoTG9naW46IGZyZXNoTG9naW4sXG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJObyBwcmV2aW91cyBzZXNzaW9uIGZvdW5kLlwiKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTG9hZFNlc3Npb25GYWlsdXJlKGU6IEVycm9yKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc29sZS5lcnJvcihcIlVuYWJsZSB0byBsb2FkIHNlc3Npb25cIiwgZSk7XG5cbiAgICBjb25zdCBTZXNzaW9uUmVzdG9yZUVycm9yRGlhbG9nID1cbiAgICAgICAgICBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5kaWFsb2dzLlNlc3Npb25SZXN0b3JlRXJyb3JEaWFsb2cnKTtcblxuICAgIGNvbnN0IG1vZGFsID0gTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnU2Vzc2lvbiBSZXN0b3JlIEVycm9yJywgJycsIFNlc3Npb25SZXN0b3JlRXJyb3JEaWFsb2csIHtcbiAgICAgICAgZXJyb3I6IGUubWVzc2FnZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IFtzdWNjZXNzXSA9IGF3YWl0IG1vZGFsLmZpbmlzaGVkO1xuICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgIC8vIHVzZXIgY2xpY2tlZCBjb250aW51ZS5cbiAgICAgICAgYXdhaXQgY2xlYXJTdG9yYWdlKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyB0cnksIHRyeSBhZ2FpblxuICAgIHJldHVybiBsb2FkU2Vzc2lvbigpO1xufVxuXG4vKipcbiAqIFRyYW5zaXRpb25zIHRvIGEgbG9nZ2VkLWluIHN0YXRlIHVzaW5nIHRoZSBnaXZlbiBjcmVkZW50aWFscy5cbiAqXG4gKiBTdGFydHMgdGhlIG1hdHJpeCBjbGllbnQgYW5kIGFsbCBvdGhlciByZWFjdC1zZGsgc2VydmljZXMgdGhhdFxuICogbGlzdGVuIGZvciBldmVudHMgd2hpbGUgYSBzZXNzaW9uIGlzIGxvZ2dlZCBpbi5cbiAqXG4gKiBBbHNvIHN0b3BzIHRoZSBvbGQgTWF0cml4Q2xpZW50IGFuZCBjbGVhcnMgb2xkIGNyZWRlbnRpYWxzL2V0YyBvdXQgb2ZcbiAqIHN0b3JhZ2UgYmVmb3JlIHN0YXJ0aW5nIHRoZSBuZXcgY2xpZW50LlxuICpcbiAqIEBwYXJhbSB7TWF0cml4Q2xpZW50Q3JlZHN9IGNyZWRlbnRpYWxzIFRoZSBjcmVkZW50aWFscyB0byB1c2VcbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSB3aGljaCByZXNvbHZlcyB0byB0aGUgbmV3IE1hdHJpeENsaWVudCBvbmNlIGl0IGhhcyBiZWVuIHN0YXJ0ZWRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldExvZ2dlZEluKGNyZWRlbnRpYWxzOiBJTWF0cml4Q2xpZW50Q3JlZHMpOiBQcm9taXNlPE1hdHJpeENsaWVudD4ge1xuICAgIGNyZWRlbnRpYWxzLmZyZXNoTG9naW4gPSB0cnVlO1xuICAgIHN0b3BNYXRyaXhDbGllbnQoKTtcbiAgICBjb25zdCBwaWNrbGVLZXkgPSBjcmVkZW50aWFscy51c2VySWQgJiYgY3JlZGVudGlhbHMuZGV2aWNlSWRcbiAgICAgICAgPyBhd2FpdCBQbGF0Zm9ybVBlZy5nZXQoKS5jcmVhdGVQaWNrbGVLZXkoY3JlZGVudGlhbHMudXNlcklkLCBjcmVkZW50aWFscy5kZXZpY2VJZClcbiAgICAgICAgOiBudWxsO1xuXG4gICAgaWYgKHBpY2tsZUtleSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNyZWF0ZWQgcGlja2xlIGtleVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlBpY2tsZSBrZXkgbm90IGNyZWF0ZWRcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRvU2V0TG9nZ2VkSW4oT2JqZWN0LmFzc2lnbih7fSwgY3JlZGVudGlhbHMsIHtwaWNrbGVLZXl9KSwgdHJ1ZSk7XG59XG5cbi8qKlxuICogSHlkcmF0ZXMgYW4gZXhpc3Rpbmcgc2Vzc2lvbiBieSB1c2luZyB0aGUgY3JlZGVudGlhbHMgcHJvdmlkZWQuIFRoaXMgd2lsbFxuICogbm90IGNsZWFyIGFueSBsb2NhbCBzdG9yYWdlLCB1bmxpa2Ugc2V0TG9nZ2VkSW4oKS5cbiAqXG4gKiBTdG9wcyB0aGUgZXhpc3RpbmcgTWF0cml4IGNsaWVudCAod2l0aG91dCBjbGVhcmluZyBpdHMgZGF0YSkgYW5kIHN0YXJ0cyBhXG4gKiBuZXcgb25lIGluIGl0cyBwbGFjZS4gVGhpcyBhZGRpdGlvbmFsbHkgc3RhcnRzIGFsbCBvdGhlciByZWFjdC1zZGsgc2VydmljZXNcbiAqIHdoaWNoIHVzZSB0aGUgbmV3IE1hdHJpeCBjbGllbnQuXG4gKlxuICogSWYgdGhlIGNyZWRlbnRpYWxzIGJlbG9uZyB0byBhIGRpZmZlcmVudCB1c2VyIGZyb20gdGhlIHNlc3Npb24gYWxyZWFkeSBzdG9yZWQsXG4gKiB0aGUgb2xkIHNlc3Npb24gd2lsbCBiZSBjbGVhcmVkIGF1dG9tYXRpY2FsbHkuXG4gKlxuICogQHBhcmFtIHtNYXRyaXhDbGllbnRDcmVkc30gY3JlZGVudGlhbHMgVGhlIGNyZWRlbnRpYWxzIHRvIHVzZVxuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHRvIHRoZSBuZXcgTWF0cml4Q2xpZW50IG9uY2UgaXQgaGFzIGJlZW4gc3RhcnRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gaHlkcmF0ZVNlc3Npb24oY3JlZGVudGlhbHM6IElNYXRyaXhDbGllbnRDcmVkcyk6IFByb21pc2U8TWF0cml4Q2xpZW50PiB7XG4gICAgY29uc3Qgb2xkVXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpO1xuICAgIGNvbnN0IG9sZERldmljZUlkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldERldmljZUlkKCk7XG5cbiAgICBzdG9wTWF0cml4Q2xpZW50KCk7IC8vIHVuc2V0cyBNYXRyaXhDbGllbnRQZWcuZ2V0KClcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcIm14X3NvZnRfbG9nb3V0XCIpO1xuICAgIF9pc0xvZ2dpbmdPdXQgPSBmYWxzZTtcblxuICAgIGNvbnN0IG92ZXJ3cml0ZSA9IGNyZWRlbnRpYWxzLnVzZXJJZCAhPT0gb2xkVXNlcklkIHx8IGNyZWRlbnRpYWxzLmRldmljZUlkICE9PSBvbGREZXZpY2VJZDtcbiAgICBpZiAob3ZlcndyaXRlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIkNsZWFyaW5nIGFsbCBkYXRhOiBPbGQgc2Vzc2lvbiBiZWxvbmdzIHRvIGEgZGlmZmVyZW50IHVzZXIvc2Vzc2lvblwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZG9TZXRMb2dnZWRJbihjcmVkZW50aWFscywgb3ZlcndyaXRlKTtcbn1cblxuLyoqXG4gKiBmaXJlcyBvbl9sb2dnaW5nX2luLCBvcHRpb25hbGx5IGNsZWFycyBsb2NhbHN0b3JhZ2UsIHBlcnNpc3RzIG5ldyBjcmVkZW50aWFsc1xuICogdG8gbG9jYWxzdG9yYWdlLCBzdGFydHMgdGhlIG5ldyBjbGllbnQuXG4gKlxuICogQHBhcmFtIHtNYXRyaXhDbGllbnRDcmVkc30gY3JlZGVudGlhbHNcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2xlYXJTdG9yYWdlXG4gKlxuICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgdG8gdGhlIG5ldyBNYXRyaXhDbGllbnQgb25jZSBpdCBoYXMgYmVlbiBzdGFydGVkXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRvU2V0TG9nZ2VkSW4oXG4gICAgY3JlZGVudGlhbHM6IElNYXRyaXhDbGllbnRDcmVkcyxcbiAgICBjbGVhclN0b3JhZ2VFbmFibGVkOiBib29sZWFuLFxuKTogUHJvbWlzZTxNYXRyaXhDbGllbnQ+IHtcbiAgICBjcmVkZW50aWFscy5ndWVzdCA9IEJvb2xlYW4oY3JlZGVudGlhbHMuZ3Vlc3QpO1xuXG4gICAgY29uc3Qgc29mdExvZ291dCA9IGlzU29mdExvZ291dCgpO1xuXG4gICAgY29uc29sZS5sb2coXG4gICAgICAgIFwic2V0TG9nZ2VkSW46IG14aWQ6IFwiICsgY3JlZGVudGlhbHMudXNlcklkICtcbiAgICAgICAgXCIgZGV2aWNlSWQ6IFwiICsgY3JlZGVudGlhbHMuZGV2aWNlSWQgK1xuICAgICAgICBcIiBndWVzdDogXCIgKyBjcmVkZW50aWFscy5ndWVzdCArXG4gICAgICAgIFwiIGhzOiBcIiArIGNyZWRlbnRpYWxzLmhvbWVzZXJ2ZXJVcmwgK1xuICAgICAgICBcIiBzb2Z0TG9nb3V0OiBcIiArIHNvZnRMb2dvdXQsXG4gICAgICAgIFwiIGZyZXNoTG9naW46IFwiICsgY3JlZGVudGlhbHMuZnJlc2hMb2dpbixcbiAgICApO1xuXG4gICAgLy8gVGhpcyBpcyBkaXNwYXRjaGVkIHRvIGluZGljYXRlIHRoYXQgdGhlIHVzZXIgaXMgc3RpbGwgaW4gdGhlIHByb2Nlc3Mgb2YgbG9nZ2luZyBpblxuICAgIC8vIGJlY2F1c2UgYXN5bmMgY29kZSBtYXkgdGFrZSBzb21lIHRpbWUgdG8gcmVzb2x2ZSwgYnJlYWtpbmcgdGhlIGFzc3VtcHRpb24gdGhhdFxuICAgIC8vIGBzZXRMb2dnZWRJbmAgdGFrZXMgYW4gXCJpbnN0YW50XCIgdG8gY29tcGxldGUsIGFuZCBkaXNwYXRjaCBgb25fbG9nZ2VkX2luYCBhIGZldyBtc1xuICAgIC8vIGxhdGVyIHRoYW4gTWF0cml4Q2hhdCBtaWdodCBhc3N1bWUuXG4gICAgLy9cbiAgICAvLyB3ZSBmaXJlIGl0ICpzeW5jaHJvbm91c2x5KiB0byBtYWtlIHN1cmUgaXQgZmlyZXMgYmVmb3JlIG9uX2xvZ2dlZF9pbi5cbiAgICAvLyAoZGlzLmRpc3BhdGNoIHVzZXMgYHNldFRpbWVvdXRgLCB3aGljaCBkb2VzIG5vdCBndWFyYW50ZWUgb3JkZXJpbmcuKVxuICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAnb25fbG9nZ2luZ19pbid9LCB0cnVlKTtcblxuICAgIGlmIChjbGVhclN0b3JhZ2VFbmFibGVkKSB7XG4gICAgICAgIGF3YWl0IGNsZWFyU3RvcmFnZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBTdG9yYWdlTWFuYWdlci5jaGVja0NvbnNpc3RlbmN5KCk7XG4gICAgLy8gSWYgdGhlcmUncyBhbiBpbmNvbnNpc3RlbmN5IGJldHdlZW4gYWNjb3VudCBkYXRhIGluIGxvY2FsIHN0b3JhZ2UgYW5kIHRoZVxuICAgIC8vIGNyeXB0byBzdG9yZSwgd2UnbGwgYmUgZ2VuZXJhbGx5IGNvbmZ1c2VkIHdoZW4gaGFuZGxpbmcgZW5jcnlwdGVkIGRhdGEuXG4gICAgLy8gU2hvdyBhIG1vZGFsIHJlY29tbWVuZGluZyBhIGZ1bGwgcmVzZXQgb2Ygc3RvcmFnZS5cbiAgICBpZiAocmVzdWx0cy5kYXRhSW5Mb2NhbFN0b3JhZ2UgJiYgcmVzdWx0cy5jcnlwdG9Jbml0ZWQgJiYgIXJlc3VsdHMuZGF0YUluQ3J5cHRvU3RvcmUpIHtcbiAgICAgICAgYXdhaXQgYWJvcnRMb2dpbigpO1xuICAgIH1cblxuICAgIEFuYWx5dGljcy5zZXRMb2dnZWRJbihjcmVkZW50aWFscy5ndWVzdCwgY3JlZGVudGlhbHMuaG9tZXNlcnZlclVybCk7XG5cbiAgICBNYXRyaXhDbGllbnRQZWcucmVwbGFjZVVzaW5nQ3JlZHMoY3JlZGVudGlhbHMpO1xuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgIGlmIChjcmVkZW50aWFscy5mcmVzaExvZ2luICYmIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX2RlaHlkcmF0aW9uXCIpKSB7XG4gICAgICAgIC8vIElmIHdlIGp1c3QgbG9nZ2VkIGluLCB0cnkgdG8gcmVoeWRyYXRlIGEgZGV2aWNlIGluc3RlYWQgb2YgdXNpbmcgYVxuICAgICAgICAvLyBuZXcgZGV2aWNlLiAgSWYgaXQgc3VjY2VlZHMsIHdlJ2xsIGdldCBhIG5ldyBkZXZpY2UgSUQsIHNvIG1ha2Ugc3VyZVxuICAgICAgICAvLyB3ZSBwZXJzaXN0IHRoYXQgSUQgdG8gbG9jYWxTdG9yYWdlXG4gICAgICAgIGNvbnN0IG5ld0RldmljZUlkID0gYXdhaXQgY2xpZW50LnJlaHlkcmF0ZURldmljZSgpO1xuICAgICAgICBpZiAobmV3RGV2aWNlSWQpIHtcbiAgICAgICAgICAgIGNyZWRlbnRpYWxzLmRldmljZUlkID0gbmV3RGV2aWNlSWQ7XG4gICAgICAgIH1cblxuICAgICAgICBkZWxldGUgY3JlZGVudGlhbHMuZnJlc2hMb2dpbjtcbiAgICB9XG5cbiAgICBpZiAobG9jYWxTdG9yYWdlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBwZXJzaXN0Q3JlZGVudGlhbHMoY3JlZGVudGlhbHMpO1xuICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGRvbid0IHRoaW5rIHRoYXQgaXQncyBhIGZyZXNoIGxvZ2luIGFueSBtb3JlXG4gICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKFwibXhfZnJlc2hfbG9naW5cIik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkVycm9yIHVzaW5nIGxvY2FsIHN0b3JhZ2U6IGNhbid0IHBlcnNpc3Qgc2Vzc2lvbiFcIiwgZSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJObyBsb2NhbCBzdG9yYWdlIGF2YWlsYWJsZTogY2FuJ3QgcGVyc2lzdCBzZXNzaW9uIVwiKTtcbiAgICB9XG5cbiAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdvbl9sb2dnZWRfaW4nIH0pO1xuXG4gICAgYXdhaXQgc3RhcnRNYXRyaXhDbGllbnQoLypzdGFydFN5bmNpbmc9Ki8hc29mdExvZ291dCk7XG4gICAgcmV0dXJuIGNsaWVudDtcbn1cblxuZnVuY3Rpb24gc2hvd1N0b3JhZ2VFdmljdGVkRGlhbG9nKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IFN0b3JhZ2VFdmljdGVkRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5TdG9yYWdlRXZpY3RlZERpYWxvZycpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnU3RvcmFnZSBldmljdGVkJywgJycsIFN0b3JhZ2VFdmljdGVkRGlhbG9nLCB7XG4gICAgICAgICAgICBvbkZpbmlzaGVkOiByZXNvbHZlLFxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuLy8gTm90ZTogQmFiZWwgNiByZXF1aXJlcyB0aGUgYHRyYW5zZm9ybS1idWlsdGluLWV4dGVuZGAgcGx1Z2luIGZvciB0aGlzIHRvIHNhdGlzZnlcbi8vIGBpbnN0YW5jZW9mYC4gQmFiZWwgNyBzdXBwb3J0cyB0aGlzIG5hdGl2ZWx5IGluIHRoZWlyIGNsYXNzIGhhbmRsaW5nLlxuY2xhc3MgQWJvcnRMb2dpbkFuZFJlYnVpbGRTdG9yYWdlIGV4dGVuZHMgRXJyb3IgeyB9XG5cbmFzeW5jIGZ1bmN0aW9uIHBlcnNpc3RDcmVkZW50aWFscyhjcmVkZW50aWFsczogSU1hdHJpeENsaWVudENyZWRzKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oSE9NRVNFUlZFUl9VUkxfS0VZLCBjcmVkZW50aWFscy5ob21lc2VydmVyVXJsKTtcbiAgICBpZiAoY3JlZGVudGlhbHMuaWRlbnRpdHlTZXJ2ZXJVcmwpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oSURfU0VSVkVSX1VSTF9LRVksIGNyZWRlbnRpYWxzLmlkZW50aXR5U2VydmVyVXJsKTtcbiAgICB9XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJteF91c2VyX2lkXCIsIGNyZWRlbnRpYWxzLnVzZXJJZCk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJteF9pc19ndWVzdFwiLCBKU09OLnN0cmluZ2lmeShjcmVkZW50aWFscy5ndWVzdCkpO1xuXG4gICAgLy8gc3RvcmUgd2hldGhlciB3ZSBleHBlY3QgdG8gZmluZCBhbiBhY2Nlc3MgdG9rZW4sIHRvIGRldGVjdCB0aGUgY2FzZVxuICAgIC8vIHdoZXJlIEluZGV4ZWREQiBpcyBibG93biBhd2F5XG4gICAgaWYgKGNyZWRlbnRpYWxzLmFjY2Vzc1Rva2VuKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibXhfaGFzX2FjY2Vzc190b2tlblwiLCBcInRydWVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLmRlbGV0ZUl0ZW0oXCJteF9oYXNfYWNjZXNzX3Rva2VuXCIpO1xuICAgIH1cblxuICAgIGlmIChjcmVkZW50aWFscy5waWNrbGVLZXkpIHtcbiAgICAgICAgbGV0IGVuY3J5cHRlZEFjY2Vzc1Rva2VuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gdHJ5IHRvIGVuY3J5cHQgdGhlIGFjY2VzcyB0b2tlbiB1c2luZyB0aGUgcGlja2xlIGtleVxuICAgICAgICAgICAgY29uc3QgZW5jcktleSA9IGF3YWl0IHBpY2tsZUtleVRvQWVzS2V5KGNyZWRlbnRpYWxzLnBpY2tsZUtleSk7XG4gICAgICAgICAgICBlbmNyeXB0ZWRBY2Nlc3NUb2tlbiA9IGF3YWl0IGVuY3J5cHRBRVMoY3JlZGVudGlhbHMuYWNjZXNzVG9rZW4sIGVuY3JLZXksIFwiYWNjZXNzX3Rva2VuXCIpO1xuICAgICAgICAgICAgZW5jcktleS5maWxsKDApO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJDb3VsZCBub3QgZW5jcnlwdCBhY2Nlc3MgdG9rZW5cIiwgZSk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHNhdmUgZWl0aGVyIHRoZSBlbmNyeXB0ZWQgYWNjZXNzIHRva2VuLCBvciB0aGUgcGxhaW4gYWNjZXNzXG4gICAgICAgICAgICAvLyB0b2tlbiBpZiB3ZSB3ZXJlIHVuYWJsZSB0byBlbmNyeXB0IChlLmcuIGlmIHRoZSBicm93c2VyIGRvZXNuJ3RcbiAgICAgICAgICAgIC8vIGhhdmUgV2ViQ3J5cHRvKS5cbiAgICAgICAgICAgIGF3YWl0IFN0b3JhZ2VNYW5hZ2VyLmlkYlNhdmUoXG4gICAgICAgICAgICAgICAgXCJhY2NvdW50XCIsIFwibXhfYWNjZXNzX3Rva2VuXCIsXG4gICAgICAgICAgICAgICAgZW5jcnlwdGVkQWNjZXNzVG9rZW4gfHwgY3JlZGVudGlhbHMuYWNjZXNzVG9rZW4sXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBpZiB3ZSBjb3VsZG4ndCBzYXZlIHRvIGluZGV4ZWREQiwgZmFsbCBiYWNrIHRvIGxvY2FsU3RvcmFnZS4gIFdlXG4gICAgICAgICAgICAvLyBzdG9yZSB0aGUgYWNjZXNzIHRva2VuIHVuZW5jcnlwdGVkIHNpbmNlIGxvY2FsU3RvcmFnZSBvbmx5IHNhdmVzXG4gICAgICAgICAgICAvLyBzdHJpbmdzLlxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJteF9hY2Nlc3NfdG9rZW5cIiwgY3JlZGVudGlhbHMuYWNjZXNzVG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibXhfaGFzX3BpY2tsZV9rZXlcIiwgU3RyaW5nKHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgU3RvcmFnZU1hbmFnZXIuaWRiU2F2ZShcbiAgICAgICAgICAgICAgICBcImFjY291bnRcIiwgXCJteF9hY2Nlc3NfdG9rZW5cIiwgY3JlZGVudGlhbHMuYWNjZXNzVG9rZW4sXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm14X2FjY2Vzc190b2tlblwiLCBjcmVkZW50aWFscy5hY2Nlc3NUb2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibXhfaGFzX3BpY2tsZV9rZXlcIikpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFeHBlY3RlZCBhIHBpY2tsZSBrZXksIGJ1dCBub25lIHByb3ZpZGVkLiAgRW5jcnlwdGlvbiBtYXkgbm90IHdvcmsuXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gaWYgd2UgZGlkbid0IGdldCBhIGRldmljZUlkIGZyb20gdGhlIGxvZ2luLCBsZWF2ZSBteF9kZXZpY2VfaWQgdW5zZXQsXG4gICAgLy8gcmF0aGVyIHRoYW4gc2V0dGluZyBpdCB0byBcInVuZGVmaW5lZFwiLlxuICAgIC8vXG4gICAgLy8gKGluIHRoaXMgY2FzZSBNYXRyaXhDbGllbnQgZG9lc24ndCBib3RoZXIgd2l0aCB0aGUgY3J5cHRvIHN0dWZmXG4gICAgLy8gLSB0aGF0J3MgZmluZSBmb3IgdXMpLlxuICAgIGlmIChjcmVkZW50aWFscy5kZXZpY2VJZCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm14X2RldmljZV9pZFwiLCBjcmVkZW50aWFscy5kZXZpY2VJZCk7XG4gICAgfVxuXG4gICAgU2VjdXJpdHlDdXN0b21pc2F0aW9ucy5wZXJzaXN0Q3JlZGVudGlhbHM/LihjcmVkZW50aWFscyk7XG5cbiAgICBjb25zb2xlLmxvZyhgU2Vzc2lvbiBwZXJzaXN0ZWQgZm9yICR7Y3JlZGVudGlhbHMudXNlcklkfWApO1xufVxuXG5sZXQgX2lzTG9nZ2luZ091dCA9IGZhbHNlO1xuXG4vKipcbiAqIExvZ3MgdGhlIGN1cnJlbnQgc2Vzc2lvbiBvdXQgYW5kIHRyYW5zaXRpb25zIHRvIHRoZSBsb2dnZWQtb3V0IHN0YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2dvdXQoKTogdm9pZCB7XG4gICAgaWYgKCFNYXRyaXhDbGllbnRQZWcuZ2V0KCkpIHJldHVybjtcbiAgICBpZiAoIUNvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UuZGlzYWJsZWQpIHtcbiAgICAgICAgLy8gdXNlciBoYXMgbG9nZ2VkIG91dCwgZmFsbCBiYWNrIHRvIGFub255bW91c1xuICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLmVuYWJsZSgvKiBhbm9ueW1vdXMgPSAqLyB0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzR3Vlc3QoKSkge1xuICAgICAgICAvLyBsb2dvdXQgZG9lc24ndCB3b3JrIGZvciBndWVzdCBzZXNzaW9uc1xuICAgICAgICAvLyBBbHNvIHdlIHNvbWV0aW1lcyB3YW50IHRvIHJlLWxvZyBpbiBhIGd1ZXN0IHNlc3Npb24gaWYgd2UgYWJvcnQgdGhlIGxvZ2luLlxuICAgICAgICAvLyBkZWZlciB1bnRpbCBuZXh0IHRpY2sgYmVjYXVzZSBpdCBjYWxscyBhIHN5bmNocm9ub3VzIGRpc3BhdGNoIGFuZCB3ZSBhcmUgbGlrZWx5IGhlcmUgZnJvbSBhIGRpc3BhdGNoLlxuICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4gb25Mb2dnZWRPdXQoKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBfaXNMb2dnaW5nT3V0ID0gdHJ1ZTtcbiAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgUGxhdGZvcm1QZWcuZ2V0KCkuZGVzdHJveVBpY2tsZUtleShjbGllbnQuZ2V0VXNlcklkKCksIGNsaWVudC5nZXREZXZpY2VJZCgpKTtcbiAgICBjbGllbnQubG9nb3V0KCkudGhlbihvbkxvZ2dlZE91dCxcbiAgICAgICAgKGVycikgPT4ge1xuICAgICAgICAgICAgLy8gSnVzdCB0aHJvd2luZyBhbiBlcnJvciBoZXJlIGlzIGdvaW5nIHRvIGJlIHZlcnkgdW5oZWxwZnVsXG4gICAgICAgICAgICAvLyBpZiB5b3UncmUgdHJ5aW5nIHRvIGxvZyBvdXQgYmVjYXVzZSB5b3VyIHNlcnZlcidzIGRvd24gYW5kXG4gICAgICAgICAgICAvLyB5b3Ugd2FudCB0byBsb2cgaW50byBhIGRpZmZlcmVudCBzZXJ2ZXIsIHNvIGp1c3QgZm9yZ2V0IHRoZVxuICAgICAgICAgICAgLy8gYWNjZXNzIHRva2VuLiBJdCdzIGFubm95aW5nIHRoYXQgdGhpcyB3aWxsIGxlYXZlIHRoZSBhY2Nlc3NcbiAgICAgICAgICAgIC8vIHRva2VuIHN0aWxsIHZhbGlkLCBidXQgd2Ugc2hvdWxkIGZpeCB0aGlzIGJ5IGhhdmluZyBhY2Nlc3NcbiAgICAgICAgICAgIC8vIHRva2VucyBleHBpcmUgKGFuZCBpZiB5b3UgcmVhbGx5IHRoaW5rIHlvdSd2ZSBiZWVuIGNvbXByb21pc2VkLFxuICAgICAgICAgICAgLy8gY2hhbmdlIHlvdXIgcGFzc3dvcmQpLlxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJGYWlsZWQgdG8gY2FsbCBsb2dvdXQgQVBJOiB0b2tlbiB3aWxsIG5vdCBiZSBpbnZhbGlkYXRlZFwiKTtcbiAgICAgICAgICAgIG9uTG9nZ2VkT3V0KCk7XG4gICAgICAgIH0sXG4gICAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvZnRMb2dvdXQoKTogdm9pZCB7XG4gICAgaWYgKCFNYXRyaXhDbGllbnRQZWcuZ2V0KCkpIHJldHVybjtcblxuICAgIC8vIFRyYWNrIHRoYXQgd2UndmUgZGV0ZWN0ZWQgYW5kIHRyYXBwZWQgYSBzb2Z0IGxvZ291dC4gVGhpcyBoZWxwcyBwcmV2ZW50IG90aGVyXG4gICAgLy8gcGFydHMgb2YgdGhlIGFwcCBmcm9tIHN0YXJ0aW5nIGlmIHRoZXJlJ3Mgbm8gcG9pbnQgKGllOiBkb24ndCBzeW5jIGlmIHdlJ3ZlXG4gICAgLy8gYmVlbiBzb2Z0IGxvZ2dlZCBvdXQsIGRlc3BpdGUgaGF2aW5nIGNyZWRlbnRpYWxzIGFuZCBkYXRhIGZvciBhIE1hdHJpeENsaWVudCkuXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJteF9zb2Z0X2xvZ291dFwiLCBcInRydWVcIik7XG5cbiAgICAvLyBEZXYgbm90ZTogcGxlYXNlIGtlZXAgdGhpcyBsb2cgbGluZSBhcm91bmQuIEl0IGNhbiBiZSB1c2VmdWwgZm9yIHRyYWNrIGRvd25cbiAgICAvLyByYW5kb20gY2xpZW50cyBzdG9wcGluZyBpbiB0aGUgbWlkZGxlIG9mIHRoZSBsb2dzLlxuICAgIGNvbnNvbGUubG9nKFwiU29mdCBsb2dvdXQgaW5pdGlhdGVkXCIpO1xuICAgIF9pc0xvZ2dpbmdPdXQgPSB0cnVlOyAvLyB0byBhdm9pZCByZXBlYXRlZCBmbGFnc1xuICAgIC8vIEVuc3VyZSB0aGF0IHdlIGRpc3BhdGNoIGEgdmlldyBjaGFuZ2UgKipiZWZvcmUqKiBzdG9wcGluZyB0aGUgY2xpZW50IHNvXG4gICAgLy8gc28gdGhhdCBSZWFjdCBjb21wb25lbnRzIHVubW91bnQgZmlyc3QuIFRoaXMgYXZvaWRzIFJlYWN0IHNvZnQgY3Jhc2hlc1xuICAgIC8vIHRoYXQgY2FuIG9jY3VyIHdoZW4gY29tcG9uZW50cyB0cnkgdG8gdXNlIGEgbnVsbCBjbGllbnQuXG4gICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdvbl9jbGllbnRfbm90X3ZpYWJsZSd9KTsgLy8gZ2VuZXJpYyB2ZXJzaW9uIG9mIG9uX2xvZ2dlZF9vdXRcbiAgICBzdG9wTWF0cml4Q2xpZW50KC8qdW5zZXRDbGllbnQ9Ki9mYWxzZSk7XG5cbiAgICAvLyBETyBOT1QgQ0FMTCBMT0dPVVQuIEEgc29mdCBsb2dvdXQgcHJlc2VydmVzIGRhdGEsIGxvZ291dCBkb2VzIG5vdC5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU29mdExvZ291dCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJteF9zb2Z0X2xvZ291dFwiKSA9PT0gXCJ0cnVlXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0xvZ2dpbmdPdXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIF9pc0xvZ2dpbmdPdXQ7XG59XG5cbi8qKlxuICogU3RhcnRzIHRoZSBtYXRyaXggY2xpZW50IGFuZCBhbGwgb3RoZXIgcmVhY3Qtc2RrIHNlcnZpY2VzIHRoYXRcbiAqIGxpc3RlbiBmb3IgZXZlbnRzIHdoaWxlIGEgc2Vzc2lvbiBpcyBsb2dnZWQgaW4uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHN0YXJ0U3luY2luZyBUcnVlIChkZWZhdWx0KSB0byBhY3R1YWxseSBzdGFydFxuICogc3luY2luZyB0aGUgY2xpZW50LlxuICovXG5hc3luYyBmdW5jdGlvbiBzdGFydE1hdHJpeENsaWVudChzdGFydFN5bmNpbmcgPSB0cnVlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc29sZS5sb2coYExpZmVjeWNsZTogU3RhcnRpbmcgTWF0cml4Q2xpZW50YCk7XG5cbiAgICAvLyBkaXNwYXRjaCB0aGlzIGJlZm9yZSBzdGFydGluZyB0aGUgbWF0cml4IGNsaWVudDogaXQncyB1c2VkXG4gICAgLy8gdG8gYWRkIGxpc3RlbmVycyBmb3IgdGhlICdzeW5jJyBldmVudCBzbyBvdGhlcndpc2Ugd2UnZCBoYXZlXG4gICAgLy8gYSByYWNlIGNvbmRpdGlvbiAoYW5kIHdlIG5lZWQgdG8gZGlzcGF0Y2ggc3luY2hyb25vdXNseSBmb3IgdGhpc1xuICAgIC8vIHRvIHdvcmspLlxuICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAnd2lsbF9zdGFydF9jbGllbnQnfSwgdHJ1ZSk7XG5cbiAgICAvLyByZXNldCB0aGluZ3MgZmlyc3QganVzdCBpbiBjYXNlXG4gICAgVHlwaW5nU3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5yZXNldCgpO1xuICAgIFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5yZXNldCgpO1xuXG4gICAgTm90aWZpZXIuc3RhcnQoKTtcbiAgICBVc2VyQWN0aXZpdHkuc2hhcmVkSW5zdGFuY2UoKS5zdGFydCgpO1xuICAgIERNUm9vbU1hcC5tYWtlU2hhcmVkKCkuc3RhcnQoKTtcbiAgICBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCkuc3RhcnRXYXRjaGluZygpO1xuICAgIEFjdGl2ZVdpZGdldFN0b3JlLnN0YXJ0KCk7XG4gICAgQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5zdGFydCgpO1xuXG4gICAgLy8gU3RhcnQgTWpvbG5pciBldmVuIHRob3VnaCB3ZSBoYXZlbid0IGNoZWNrZWQgdGhlIGZlYXR1cmUgZmxhZyB5ZXQuIFN0YXJ0aW5nXG4gICAgLy8gdGhlIHRoaW5nIGp1c3Qgd2FzdGVzIENQVSBjeWNsZXMsIGJ1dCBzaG91bGQgcmVzdWx0IGluIG5vIGFjdHVhbCBmdW5jdGlvbmFsaXR5XG4gICAgLy8gYmVpbmcgZXhwb3NlZCB0byB0aGUgdXNlci5cbiAgICBNam9sbmlyLnNoYXJlZEluc3RhbmNlKCkuc3RhcnQoKTtcblxuICAgIGlmIChzdGFydFN5bmNpbmcpIHtcbiAgICAgICAgLy8gVGhlIGNsaWVudCBtaWdodCB3YW50IHRvIHBvcHVsYXRlIHNvbWUgdmlld3Mgd2l0aCBldmVudHMgZnJvbSB0aGVcbiAgICAgICAgLy8gaW5kZXggKGUuZy4gdGhlIEZpbGVQYW5lbCksIHRoZXJlZm9yZSBpbml0aWFsaXplIHRoZSBldmVudCBpbmRleFxuICAgICAgICAvLyBiZWZvcmUgdGhlIGNsaWVudC5cbiAgICAgICAgYXdhaXQgRXZlbnRJbmRleFBlZy5pbml0KCk7XG4gICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5zdGFydCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIkNhbGxlciByZXF1ZXN0ZWQgb25seSBhdXhpbGlhcnkgc2VydmljZXMgYmUgc3RhcnRlZFwiKTtcbiAgICAgICAgYXdhaXQgTWF0cml4Q2xpZW50UGVnLmFzc2lnbigpO1xuICAgIH1cblxuICAgIC8vIFRoaXMgbmVlZHMgdG8gYmUgc3RhcnRlZCBhZnRlciBjcnlwdG8gaXMgc2V0IHVwXG4gICAgRGV2aWNlTGlzdGVuZXIuc2hhcmVkSW5zdGFuY2UoKS5zdGFydCgpO1xuICAgIC8vIFNpbWlsYXJseSwgZG9uJ3Qgc3RhcnQgc2VuZGluZyBwcmVzZW5jZSB1cGRhdGVzIHVudGlsIHdlJ3ZlIHN0YXJ0ZWRcbiAgICAvLyB0aGUgY2xpZW50XG4gICAgaWYgKCFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwibG93QmFuZHdpZHRoXCIpKSB7XG4gICAgICAgIFByZXNlbmNlLnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgLy8gTm93IHRoYXQgd2UgaGF2ZSBhIE1hdHJpeENsaWVudFBlZywgdXBkYXRlIHRoZSBKaXRzaSBpbmZvXG4gICAgYXdhaXQgSml0c2kuZ2V0SW5zdGFuY2UoKS5zdGFydCgpO1xuXG4gICAgLy8gZGlzcGF0Y2ggdGhhdCB3ZSBmaW5pc2hlZCBzdGFydGluZyB1cCB0byB3aXJlIHVwIGFueSBvdGhlciBiaXRzXG4gICAgLy8gb2YgdGhlIG1hdHJpeCBjbGllbnQgdGhhdCBjYW5ub3QgYmUgc2V0IHByaW9yIHRvIHN0YXJ0aW5nIHVwLlxuICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAnY2xpZW50X3N0YXJ0ZWQnfSk7XG5cbiAgICBpZiAoaXNTb2Z0TG9nb3V0KCkpIHtcbiAgICAgICAgc29mdExvZ291dCgpO1xuICAgIH1cbn1cblxuLypcbiAqIFN0b3BzIGEgcnVubmluZyBjbGllbnQgYW5kIGFsbCByZWxhdGVkIHNlcnZpY2VzLCBhbmQgY2xlYXJzIHBlcnNpc3RlbnRcbiAqIHN0b3JhZ2UuIFVzZWQgYWZ0ZXIgYSBzZXNzaW9uIGhhcyBiZWVuIGxvZ2dlZCBvdXQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvbkxvZ2dlZE91dCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBfaXNMb2dnaW5nT3V0ID0gZmFsc2U7XG4gICAgLy8gRW5zdXJlIHRoYXQgd2UgZGlzcGF0Y2ggYSB2aWV3IGNoYW5nZSAqKmJlZm9yZSoqIHN0b3BwaW5nIHRoZSBjbGllbnQgc29cbiAgICAvLyBzbyB0aGF0IFJlYWN0IGNvbXBvbmVudHMgdW5tb3VudCBmaXJzdC4gVGhpcyBhdm9pZHMgUmVhY3Qgc29mdCBjcmFzaGVzXG4gICAgLy8gdGhhdCBjYW4gb2NjdXIgd2hlbiBjb21wb25lbnRzIHRyeSB0byB1c2UgYSBudWxsIGNsaWVudC5cbiAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ29uX2xvZ2dlZF9vdXQnfSwgdHJ1ZSk7XG4gICAgc3RvcE1hdHJpeENsaWVudCgpO1xuICAgIGF3YWl0IGNsZWFyU3RvcmFnZSh7ZGVsZXRlRXZlcnl0aGluZzogdHJ1ZX0pO1xuICAgIExpZmVjeWNsZUN1c3RvbWlzYXRpb25zLm9uTG9nZ2VkT3V0QW5kU3RvcmFnZUNsZWFyZWQ/LigpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRzIE9wdGlvbnMgZm9yIGhvdyB0byBjbGVhciBzdG9yYWdlLlxuICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgb25jZSB0aGUgc3RvcmVzIGhhdmUgYmVlbiBjbGVhcmVkXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNsZWFyU3RvcmFnZShvcHRzPzogeyBkZWxldGVFdmVyeXRoaW5nPzogYm9vbGVhbiB9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgQW5hbHl0aWNzLmRpc2FibGUoKTtcblxuICAgIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlKSB7XG4gICAgICAgIC8vIHRyeSB0byBzYXZlIGFueSAzcGlkIGludml0ZXMgZnJvbSBiZWluZyBvYmxpdGVyYXRlZFxuICAgICAgICBjb25zdCBwZW5kaW5nSW52aXRlcyA9IFRocmVlcGlkSW52aXRlU3RvcmUuaW5zdGFuY2UuZ2V0V2lyZUludml0ZXMoKTtcblxuICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLmNsZWFyKCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IFN0b3JhZ2VNYW5hZ2VyLmlkYkRlbGV0ZShcImFjY291bnRcIiwgXCJteF9hY2Nlc3NfdG9rZW5cIik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICAgICAgLy8gbm93IHJlc3RvcmUgdGhvc2UgaW52aXRlc1xuICAgICAgICBpZiAoIW9wdHM/LmRlbGV0ZUV2ZXJ5dGhpbmcpIHtcbiAgICAgICAgICAgIHBlbmRpbmdJbnZpdGVzLmZvckVhY2goaSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gaS5yb29tSWQ7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGkucm9vbUlkOyAvLyBkZWxldGUgdG8gYXZvaWQgY29uZnVzaW5nIHRoZSBzdG9yZVxuICAgICAgICAgICAgICAgIFRocmVlcGlkSW52aXRlU3RvcmUuaW5zdGFuY2Uuc3RvcmVJbnZpdGUocm9vbUlkLCBpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHdpbmRvdy5zZXNzaW9uU3RvcmFnZSkge1xuICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuY2xlYXIoKTtcbiAgICB9XG5cbiAgICAvLyBjcmVhdGUgYSB0ZW1wb3JhcnkgY2xpZW50IHRvIGNsZWFyIG91dCB0aGUgcGVyc2lzdGVudCBzdG9yZXMuXG4gICAgY29uc3QgY2xpID0gY3JlYXRlTWF0cml4Q2xpZW50KHtcbiAgICAgICAgLy8gd2UnbGwgbmV2ZXIgbWFrZSBhbnkgcmVxdWVzdHMsIHNvIGNhbiBwYXNzIGEgYm9ndXMgSFMgVVJMXG4gICAgICAgIGJhc2VVcmw6IFwiXCIsXG4gICAgfSk7XG5cbiAgICBhd2FpdCBFdmVudEluZGV4UGVnLmRlbGV0ZUV2ZW50SW5kZXgoKTtcbiAgICBhd2FpdCBjbGkuY2xlYXJTdG9yZXMoKTtcbn1cblxuLyoqXG4gKiBTdG9wIGFsbCB0aGUgYmFja2dyb3VuZCBwcm9jZXNzZXMgcmVsYXRlZCB0byB0aGUgY3VycmVudCBjbGllbnQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHVuc2V0Q2xpZW50IFRydWUgKGRlZmF1bHQpIHRvIGFiYW5kb24gdGhlIGNsaWVudFxuICogb24gTWF0cml4Q2xpZW50UGVnIGFmdGVyIHN0b3BwaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RvcE1hdHJpeENsaWVudCh1bnNldENsaWVudCA9IHRydWUpOiB2b2lkIHtcbiAgICBOb3RpZmllci5zdG9wKCk7XG4gICAgQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5zdG9wKCk7XG4gICAgVXNlckFjdGl2aXR5LnNoYXJlZEluc3RhbmNlKCkuc3RvcCgpO1xuICAgIFR5cGluZ1N0b3JlLnNoYXJlZEluc3RhbmNlKCkucmVzZXQoKTtcbiAgICBQcmVzZW5jZS5zdG9wKCk7XG4gICAgQWN0aXZlV2lkZ2V0U3RvcmUuc3RvcCgpO1xuICAgIEludGVncmF0aW9uTWFuYWdlcnMuc2hhcmVkSW5zdGFuY2UoKS5zdG9wV2F0Y2hpbmcoKTtcbiAgICBNam9sbmlyLnNoYXJlZEluc3RhbmNlKCkuc3RvcCgpO1xuICAgIERldmljZUxpc3RlbmVyLnNoYXJlZEluc3RhbmNlKCkuc3RvcCgpO1xuICAgIGlmIChETVJvb21NYXAuc2hhcmVkKCkpIERNUm9vbU1hcC5zaGFyZWQoKS5zdG9wKCk7XG4gICAgRXZlbnRJbmRleFBlZy5zdG9wKCk7XG4gICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgIGlmIChjbGkpIHtcbiAgICAgICAgY2xpLnN0b3BDbGllbnQoKTtcbiAgICAgICAgY2xpLnJlbW92ZUFsbExpc3RlbmVycygpO1xuXG4gICAgICAgIGlmICh1bnNldENsaWVudCkge1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLnVuc2V0KCk7XG4gICAgICAgICAgICBFdmVudEluZGV4UGVnLnVuc2V0KCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=