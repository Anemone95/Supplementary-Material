"use strict";

var _interopRequireWildcard3 = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isSecretStorageBeingAccessed = isSecretStorageBeingAccessed;
exports.getDehydrationKey = getDehydrationKey;
exports.promptForBackupPassphrase = promptForBackupPassphrase;
exports.accessSecretStorage = accessSecretStorage;
exports.tryToUnlockSecretStorageWithDehydrationKey = tryToUnlockSecretStorageWithDehydrationKey;
exports.crossSigningCallbacks = exports.AccessCancelledError = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _Modal = _interopRequireDefault(require("./Modal"));

var sdk = _interopRequireWildcard3(require("./index"));

var _MatrixClientPeg = require("./MatrixClientPeg");

var _key_passphrase = require("matrix-js-sdk/src/crypto/key_passphrase");

var _recoverykey = require("matrix-js-sdk/src/crypto/recoverykey");

var _languageHandler = require("./languageHandler");

var _olmlib = require("matrix-js-sdk/src/crypto/olmlib");

var _WellKnownUtils = require("./utils/WellKnownUtils");

var _AccessSecretStorageDialog = _interopRequireDefault(require("./components/views/dialogs/security/AccessSecretStorageDialog"));

var _RestoreKeyBackupDialog = _interopRequireDefault(require("./components/views/dialogs/security/RestoreKeyBackupDialog"));

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _Security = _interopRequireDefault(require("./customisations/Security"));

/*
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
// This stores the secret storage private keys in memory for the JS SDK. This is
// only meant to act as a cache to avoid prompting the user multiple times
// during the same single operation. Use `accessSecretStorage` below to scope a
// single secret storage operation, as it will clear the cached keys once the
// operation ends.
let secretStorageKeys
/*: Record<string, Uint8Array>*/
= {};
let secretStorageKeyInfo
/*: Record<string, ISecretStorageKeyInfo>*/
= {};
let secretStorageBeingAccessed = false;
let nonInteractive = false;
let dehydrationCache
/*: {
    key?: Uint8Array,
    keyInfo?: ISecretStorageKeyInfo,
}*/
= {};

function isCachingAllowed()
/*: boolean*/
{
  return secretStorageBeingAccessed;
}
/**
 * This can be used by other components to check if secret storage access is in
 * progress, so that we can e.g. avoid intermittently showing toasts during
 * secret storage setup.
 *
 * @returns {bool}
 */


function isSecretStorageBeingAccessed()
/*: boolean*/
{
  return secretStorageBeingAccessed;
}

class AccessCancelledError extends Error {
  constructor() {
    super("Secret storage access canceled");
  }

}

exports.AccessCancelledError = AccessCancelledError;

async function confirmToDismiss()
/*: Promise<boolean>*/
{
  const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");
  const [sure] = await _Modal.default.createDialog(QuestionDialog, {
    title: (0, _languageHandler._t)("Cancel entering passphrase?"),
    description: (0, _languageHandler._t)("Are you sure you want to cancel entering passphrase?"),
    danger: false,
    button: (0, _languageHandler._t)("Go Back"),
    cancelButton: (0, _languageHandler._t)("Cancel")
  }).finished;
  return !sure;
}

function makeInputToKey(keyInfo
/*: ISecretStorageKeyInfo*/
)
/*: (keyParams: { passphrase: string, recoveryKey: string }) => Promise<Uint8Array>*/
{
  return async ({
    passphrase,
    recoveryKey
  }) => {
    if (passphrase) {
      return (0, _key_passphrase.deriveKey)(passphrase, keyInfo.passphrase.salt, keyInfo.passphrase.iterations);
    } else {
      return (0, _recoverykey.decodeRecoveryKey)(recoveryKey);
    }
  };
}

async function getSecretStorageKey({
  keys: keyInfos
}
/*: { keys: Record<string, ISecretStorageKeyInfo> }*/
, ssssItemName)
/*: Promise<[string, Uint8Array]>*/
{
  const keyInfoEntries = Object.entries(keyInfos);

  if (keyInfoEntries.length > 1) {
    throw new Error("Multiple storage key requests not implemented");
  }

  const [keyId, keyInfo] = keyInfoEntries[0]; // Check the in-memory cache

  if (isCachingAllowed() && secretStorageKeys[keyId]) {
    return [keyId, secretStorageKeys[keyId]];
  }

  if (dehydrationCache.key) {
    if (await _MatrixClientPeg.MatrixClientPeg.get().checkSecretStorageKey(dehydrationCache.key, keyInfo)) {
      cacheSecretStorageKey(keyId, keyInfo, dehydrationCache.key);
      return [keyId, dehydrationCache.key];
    }
  }

  const keyFromCustomisations = _Security.default.getSecretStorageKey?.();

  if (keyFromCustomisations) {
    console.log("Using key from security customisations (secret storage)");
    cacheSecretStorageKey(keyId, keyInfo, keyFromCustomisations);
    return [keyId, keyFromCustomisations];
  }

  if (nonInteractive) {
    throw new Error("Could not unlock non-interactively");
  }

  const inputToKey = makeInputToKey(keyInfo);

  const {
    finished
  } = _Modal.default.createTrackedDialog("Access Secret Storage dialog", "", _AccessSecretStorageDialog.default,
  /* props= */
  {
    keyInfo,
    checkPrivateKey: async input => {
      const key = await inputToKey(input);
      return await _MatrixClientPeg.MatrixClientPeg.get().checkSecretStorageKey(key, keyInfo);
    }
  },
  /* className= */
  null,
  /* isPriorityModal= */
  false,
  /* isStaticModal= */
  false,
  /* options= */
  {
    onBeforeClose: async reason => {
      if (reason === "backgroundClick") {
        return confirmToDismiss();
      }

      return true;
    }
  });

  const [input] = await finished;

  if (!input) {
    throw new AccessCancelledError();
  }

  const key = await inputToKey(input); // Save to cache to avoid future prompts in the current session

  cacheSecretStorageKey(keyId, keyInfo, key);
  return [keyId, key];
}

async function getDehydrationKey(keyInfo
/*: ISecretStorageKeyInfo*/
, checkFunc
/*: (Uint8Array) => void*/
)
/*: Promise<Uint8Array>*/
{
  const keyFromCustomisations = _Security.default.getSecretStorageKey?.();

  if (keyFromCustomisations) {
    console.log("Using key from security customisations (dehydration)");
    return keyFromCustomisations;
  }

  const inputToKey = makeInputToKey(keyInfo);

  const {
    finished
  } = _Modal.default.createTrackedDialog("Access Secret Storage dialog", "", _AccessSecretStorageDialog.default,
  /* props= */
  {
    keyInfo,
    checkPrivateKey: async input => {
      const key = await inputToKey(input);

      try {
        checkFunc(key);
        return true;
      } catch (e) {
        return false;
      }
    }
  },
  /* className= */
  null,
  /* isPriorityModal= */
  false,
  /* isStaticModal= */
  false,
  /* options= */
  {
    onBeforeClose: async reason => {
      if (reason === "backgroundClick") {
        return confirmToDismiss();
      }

      return true;
    }
  });

  const [input] = await finished;

  if (!input) {
    throw new AccessCancelledError();
  }

  const key = await inputToKey(input); // need to copy the key because rehydration (unpickling) will clobber it

  dehydrationCache = {
    key: new Uint8Array(key),
    keyInfo
  };
  return key;
}

function cacheSecretStorageKey(keyId
/*: string*/
, keyInfo
/*: ISecretStorageKeyInfo*/
, key
/*: Uint8Array*/
)
/*: void*/
{
  if (isCachingAllowed()) {
    secretStorageKeys[keyId] = key;
    secretStorageKeyInfo[keyId] = keyInfo;
  }
}

async function onSecretRequested(userId
/*: string*/
, deviceId
/*: string*/
, requestId
/*: string*/
, name
/*: string*/
, deviceTrust
/*: IDeviceTrustLevel*/
)
/*: Promise<string>*/
{
  console.log("onSecretRequested", userId, deviceId, requestId, name, deviceTrust);

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (userId !== client.getUserId()) {
    return;
  }

  if (!deviceTrust || !deviceTrust.isVerified()) {
    console.log(`Ignoring secret request from untrusted device ${deviceId}`);
    return;
  }

  if (name === "m.cross_signing.master" || name === "m.cross_signing.self_signing" || name === "m.cross_signing.user_signing") {
    const callbacks = client.getCrossSigningCacheCallbacks();
    if (!callbacks.getCrossSigningKeyCache) return;
    const keyId = name.replace("m.cross_signing.", "");
    const key = await callbacks.getCrossSigningKeyCache(keyId);

    if (!key) {
      console.log(`${keyId} requested by ${deviceId}, but not found in cache`);
    }

    return key && (0, _olmlib.encodeBase64)(key);
  } else if (name === "m.megolm_backup.v1") {
    const key = await client._crypto.getSessionBackupPrivateKey();

    if (!key) {
      console.log(`session backup key requested by ${deviceId}, but not found in cache`);
    }

    return key && (0, _olmlib.encodeBase64)(key);
  }

  console.warn("onSecretRequested didn't recognise the secret named ", name);
}

const crossSigningCallbacks
/*: ICryptoCallbacks*/
= {
  getSecretStorageKey,
  cacheSecretStorageKey,
  onSecretRequested,
  getDehydrationKey
};
exports.crossSigningCallbacks = crossSigningCallbacks;

async function promptForBackupPassphrase()
/*: Promise<Uint8Array>*/
{
  let key;

  const {
    finished
  } = _Modal.default.createTrackedDialog('Restore Backup', '', _RestoreKeyBackupDialog.default, {
    showSummary: false,
    keyCallback: k => key = k
  }, null,
  /* priority = */
  false,
  /* static = */
  true);

  const success = await finished;
  if (!success) throw new Error("Key backup prompt cancelled");
  return key;
}
/**
 * This helper should be used whenever you need to access secret storage. It
 * ensures that secret storage (and also cross-signing since they each depend on
 * each other in a cycle of sorts) have been bootstrapped before running the
 * provided function.
 *
 * Bootstrapping secret storage may take one of these paths:
 * 1. Create secret storage from a passphrase and store cross-signing keys
 *    in secret storage.
 * 2. Access existing secret storage by requesting passphrase and accessing
 *    cross-signing keys as needed.
 * 3. All keys are loaded and there's nothing to do.
 *
 * Additionally, the secret storage keys are cached during the scope of this function
 * to ensure the user is prompted only once for their secret storage
 * passphrase. The cache is then cleared once the provided function completes.
 *
 * @param {Function} [func] An operation to perform once secret storage has been
 * bootstrapped. Optional.
 * @param {bool} [forceReset] Reset secret storage even if it's already set up
 */


async function accessSecretStorage(func = async () => {}, forceReset = false) {
  const cli = _MatrixClientPeg.MatrixClientPeg.get();

  secretStorageBeingAccessed = true;

  try {
    if (!(await cli.hasSecretStorageKey()) || forceReset) {
      // This dialog calls bootstrap itself after guiding the user through
      // passphrase creation.
      const {
        finished
      } = _Modal.default.createTrackedDialogAsync('Create Secret Storage dialog', '', Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require("./async-components/views/dialogs/security/CreateSecretStorageDialog"))), {
        forceReset
      }, null,
      /* priority = */
      false,
      /* static = */
      true,
      /* options = */
      {
        onBeforeClose: async reason => {
          // If Secure Backup is required, you cannot leave the modal.
          if (reason === "backgroundClick") {
            return !(0, _WellKnownUtils.isSecureBackupRequired)();
          }

          return true;
        }
      });

      const [confirmed] = await finished;

      if (!confirmed) {
        throw new Error("Secret storage creation canceled");
      }
    } else {
      const InteractiveAuthDialog = sdk.getComponent("dialogs.InteractiveAuthDialog");
      await cli.bootstrapCrossSigning({
        authUploadDeviceSigningKeys: async makeRequest => {
          const {
            finished
          } = _Modal.default.createTrackedDialog('Cross-signing keys dialog', '', InteractiveAuthDialog, {
            title: (0, _languageHandler._t)("Setting up keys"),
            matrixClient: cli,
            makeRequest
          });

          const [confirmed] = await finished;

          if (!confirmed) {
            throw new Error("Cross-signing key upload auth canceled");
          }
        }
      });
      await cli.bootstrapSecretStorage({
        getKeyBackupPassphrase: promptForBackupPassphrase
      });
      const keyId = Object.keys(secretStorageKeys)[0];

      if (keyId && _SettingsStore.default.getValue("feature_dehydration")) {
        let dehydrationKeyInfo = {};

        if (secretStorageKeyInfo[keyId] && secretStorageKeyInfo[keyId].passphrase) {
          dehydrationKeyInfo = {
            passphrase: secretStorageKeyInfo[keyId].passphrase
          };
        }

        console.log("Setting dehydration key");
        await cli.setDehydrationKey(secretStorageKeys[keyId], dehydrationKeyInfo, "Backup device");
      } else if (!keyId) {
        console.warn("Not setting dehydration key: no SSSS key found");
      } else {
        console.log("Not setting dehydration key: feature disabled");
      }
    } // `return await` needed here to ensure `finally` block runs after the
    // inner operation completes.


    return await func();
  } catch (e) {
    _Security.default.catchAccessSecretStorageError?.(e);
    console.error(e);
  } finally {
    // Clear secret storage key cache now that work is complete
    secretStorageBeingAccessed = false;

    if (!isCachingAllowed()) {
      secretStorageKeys = {};
      secretStorageKeyInfo = {};
    }
  }
} // FIXME: this function name is a bit of a mouthful


async function tryToUnlockSecretStorageWithDehydrationKey(client
/*: MatrixClient*/
)
/*: Promise<void>*/
{
  const key = dehydrationCache.key;
  let restoringBackup = false;

  if (key && (await client.isSecretStorageReady())) {
    console.log("Trying to set up cross-signing using dehydration key");
    secretStorageBeingAccessed = true;
    nonInteractive = true;

    try {
      await client.checkOwnCrossSigningTrust(); // we also need to set a new dehydrated device to replace the
      // device we rehydrated

      let dehydrationKeyInfo = {};

      if (dehydrationCache.keyInfo && dehydrationCache.keyInfo.passphrase) {
        dehydrationKeyInfo = {
          passphrase: dehydrationCache.keyInfo.passphrase
        };
      }

      await client.setDehydrationKey(key, dehydrationKeyInfo, "Backup device"); // and restore from backup

      const backupInfo = await client.getKeyBackupVersion();

      if (backupInfo) {
        restoringBackup = true; // don't await, because this can take a long time

        client.restoreKeyBackupWithSecretStorage(backupInfo).finally(() => {
          secretStorageBeingAccessed = false;
          nonInteractive = false;

          if (!isCachingAllowed()) {
            secretStorageKeys = {};
            secretStorageKeyInfo = {};
          }
        });
      }
    } finally {
      dehydrationCache = {}; // the secret storage cache is needed for restoring from backup, so
      // don't clear it yet if we're restoring from backup

      if (!restoringBackup) {
        secretStorageBeingAccessed = false;
        nonInteractive = false;

        if (!isCachingAllowed()) {
          secretStorageKeys = {};
          secretStorageKeyInfo = {};
        }
      }
    }
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TZWN1cml0eU1hbmFnZXIudHMiXSwibmFtZXMiOlsic2VjcmV0U3RvcmFnZUtleXMiLCJzZWNyZXRTdG9yYWdlS2V5SW5mbyIsInNlY3JldFN0b3JhZ2VCZWluZ0FjY2Vzc2VkIiwibm9uSW50ZXJhY3RpdmUiLCJkZWh5ZHJhdGlvbkNhY2hlIiwiaXNDYWNoaW5nQWxsb3dlZCIsImlzU2VjcmV0U3RvcmFnZUJlaW5nQWNjZXNzZWQiLCJBY2Nlc3NDYW5jZWxsZWRFcnJvciIsIkVycm9yIiwiY29uc3RydWN0b3IiLCJjb25maXJtVG9EaXNtaXNzIiwiUXVlc3Rpb25EaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJzdXJlIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiZGFuZ2VyIiwiYnV0dG9uIiwiY2FuY2VsQnV0dG9uIiwiZmluaXNoZWQiLCJtYWtlSW5wdXRUb0tleSIsImtleUluZm8iLCJwYXNzcGhyYXNlIiwicmVjb3ZlcnlLZXkiLCJzYWx0IiwiaXRlcmF0aW9ucyIsImdldFNlY3JldFN0b3JhZ2VLZXkiLCJrZXlzIiwia2V5SW5mb3MiLCJzc3NzSXRlbU5hbWUiLCJrZXlJbmZvRW50cmllcyIsIk9iamVjdCIsImVudHJpZXMiLCJsZW5ndGgiLCJrZXlJZCIsImtleSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImNoZWNrU2VjcmV0U3RvcmFnZUtleSIsImNhY2hlU2VjcmV0U3RvcmFnZUtleSIsImtleUZyb21DdXN0b21pc2F0aW9ucyIsIlNlY3VyaXR5Q3VzdG9taXNhdGlvbnMiLCJjb25zb2xlIiwibG9nIiwiaW5wdXRUb0tleSIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJBY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nIiwiY2hlY2tQcml2YXRlS2V5IiwiaW5wdXQiLCJvbkJlZm9yZUNsb3NlIiwicmVhc29uIiwiZ2V0RGVoeWRyYXRpb25LZXkiLCJjaGVja0Z1bmMiLCJlIiwiVWludDhBcnJheSIsIm9uU2VjcmV0UmVxdWVzdGVkIiwidXNlcklkIiwiZGV2aWNlSWQiLCJyZXF1ZXN0SWQiLCJuYW1lIiwiZGV2aWNlVHJ1c3QiLCJjbGllbnQiLCJnZXRVc2VySWQiLCJpc1ZlcmlmaWVkIiwiY2FsbGJhY2tzIiwiZ2V0Q3Jvc3NTaWduaW5nQ2FjaGVDYWxsYmFja3MiLCJnZXRDcm9zc1NpZ25pbmdLZXlDYWNoZSIsInJlcGxhY2UiLCJfY3J5cHRvIiwiZ2V0U2Vzc2lvbkJhY2t1cFByaXZhdGVLZXkiLCJ3YXJuIiwiY3Jvc3NTaWduaW5nQ2FsbGJhY2tzIiwicHJvbXB0Rm9yQmFja3VwUGFzc3BocmFzZSIsIlJlc3RvcmVLZXlCYWNrdXBEaWFsb2ciLCJzaG93U3VtbWFyeSIsImtleUNhbGxiYWNrIiwiayIsInN1Y2Nlc3MiLCJhY2Nlc3NTZWNyZXRTdG9yYWdlIiwiZnVuYyIsImZvcmNlUmVzZXQiLCJjbGkiLCJoYXNTZWNyZXRTdG9yYWdlS2V5IiwiY3JlYXRlVHJhY2tlZERpYWxvZ0FzeW5jIiwiY29uZmlybWVkIiwiSW50ZXJhY3RpdmVBdXRoRGlhbG9nIiwiYm9vdHN0cmFwQ3Jvc3NTaWduaW5nIiwiYXV0aFVwbG9hZERldmljZVNpZ25pbmdLZXlzIiwibWFrZVJlcXVlc3QiLCJtYXRyaXhDbGllbnQiLCJib290c3RyYXBTZWNyZXRTdG9yYWdlIiwiZ2V0S2V5QmFja3VwUGFzc3BocmFzZSIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImRlaHlkcmF0aW9uS2V5SW5mbyIsInNldERlaHlkcmF0aW9uS2V5IiwiY2F0Y2hBY2Nlc3NTZWNyZXRTdG9yYWdlRXJyb3IiLCJlcnJvciIsInRyeVRvVW5sb2NrU2VjcmV0U3RvcmFnZVdpdGhEZWh5ZHJhdGlvbktleSIsInJlc3RvcmluZ0JhY2t1cCIsImlzU2VjcmV0U3RvcmFnZVJlYWR5IiwiY2hlY2tPd25Dcm9zc1NpZ25pbmdUcnVzdCIsImJhY2t1cEluZm8iLCJnZXRLZXlCYWNrdXBWZXJzaW9uIiwicmVzdG9yZUtleUJhY2t1cFdpdGhTZWNyZXRTdG9yYWdlIiwiZmluYWxseSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUlBO0FBQTZDO0FBQUEsRUFBRyxFQUFwRDtBQUNBLElBQUlDO0FBQTJEO0FBQUEsRUFBRyxFQUFsRTtBQUNBLElBQUlDLDBCQUEwQixHQUFHLEtBQWpDO0FBRUEsSUFBSUMsY0FBYyxHQUFHLEtBQXJCO0FBRUEsSUFBSUM7QUFHSDtBQUNEO0FBQ0E7QUFDQTtBQUhDLEVBQUcsRUFISjs7QUFLQSxTQUFTQyxnQkFBVDtBQUFBO0FBQXFDO0FBQ2pDLFNBQU9ILDBCQUFQO0FBQ0g7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ08sU0FBU0ksNEJBQVQ7QUFBQTtBQUFpRDtBQUNwRCxTQUFPSiwwQkFBUDtBQUNIOztBQUVNLE1BQU1LLG9CQUFOLFNBQW1DQyxLQUFuQyxDQUF5QztBQUM1Q0MsRUFBQUEsV0FBVyxHQUFHO0FBQ1YsVUFBTSxnQ0FBTjtBQUNIOztBQUgyQzs7OztBQU1oRCxlQUFlQyxnQkFBZjtBQUFBO0FBQW9EO0FBQ2hELFFBQU1DLGNBQWMsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHdCQUFqQixDQUF2QjtBQUNBLFFBQU0sQ0FBQ0MsSUFBRCxJQUFTLE1BQU1DLGVBQU1DLFlBQU4sQ0FBbUJMLGNBQW5CLEVBQW1DO0FBQ3BETSxJQUFBQSxLQUFLLEVBQUUseUJBQUcsNkJBQUgsQ0FENkM7QUFFcERDLElBQUFBLFdBQVcsRUFBRSx5QkFBRyxzREFBSCxDQUZ1QztBQUdwREMsSUFBQUEsTUFBTSxFQUFFLEtBSDRDO0FBSXBEQyxJQUFBQSxNQUFNLEVBQUUseUJBQUcsU0FBSCxDQUo0QztBQUtwREMsSUFBQUEsWUFBWSxFQUFFLHlCQUFHLFFBQUg7QUFMc0MsR0FBbkMsRUFNbEJDLFFBTkg7QUFPQSxTQUFPLENBQUNSLElBQVI7QUFDSDs7QUFFRCxTQUFTUyxjQUFULENBQ0lDO0FBREo7QUFBQTtBQUFBO0FBRW1GO0FBQy9FLFNBQU8sT0FBTztBQUFFQyxJQUFBQSxVQUFGO0FBQWNDLElBQUFBO0FBQWQsR0FBUCxLQUF1QztBQUMxQyxRQUFJRCxVQUFKLEVBQWdCO0FBQ1osYUFBTywrQkFDSEEsVUFERyxFQUVIRCxPQUFPLENBQUNDLFVBQVIsQ0FBbUJFLElBRmhCLEVBR0hILE9BQU8sQ0FBQ0MsVUFBUixDQUFtQkcsVUFIaEIsQ0FBUDtBQUtILEtBTkQsTUFNTztBQUNILGFBQU8sb0NBQWtCRixXQUFsQixDQUFQO0FBQ0g7QUFDSixHQVZEO0FBV0g7O0FBRUQsZUFBZUcsbUJBQWYsQ0FDSTtBQUFFQyxFQUFBQSxJQUFJLEVBQUVDO0FBQVI7QUFESjtBQUFBLEVBRUlDLFlBRko7QUFBQTtBQUdpQztBQUM3QixRQUFNQyxjQUFjLEdBQUdDLE1BQU0sQ0FBQ0MsT0FBUCxDQUFlSixRQUFmLENBQXZCOztBQUNBLE1BQUlFLGNBQWMsQ0FBQ0csTUFBZixHQUF3QixDQUE1QixFQUErQjtBQUMzQixVQUFNLElBQUk1QixLQUFKLENBQVUsK0NBQVYsQ0FBTjtBQUNIOztBQUNELFFBQU0sQ0FBQzZCLEtBQUQsRUFBUWIsT0FBUixJQUFtQlMsY0FBYyxDQUFDLENBQUQsQ0FBdkMsQ0FMNkIsQ0FPN0I7O0FBQ0EsTUFBSTVCLGdCQUFnQixNQUFNTCxpQkFBaUIsQ0FBQ3FDLEtBQUQsQ0FBM0MsRUFBb0Q7QUFDaEQsV0FBTyxDQUFDQSxLQUFELEVBQVFyQyxpQkFBaUIsQ0FBQ3FDLEtBQUQsQ0FBekIsQ0FBUDtBQUNIOztBQUVELE1BQUlqQyxnQkFBZ0IsQ0FBQ2tDLEdBQXJCLEVBQTBCO0FBQ3RCLFFBQUksTUFBTUMsaUNBQWdCQyxHQUFoQixHQUFzQkMscUJBQXRCLENBQTRDckMsZ0JBQWdCLENBQUNrQyxHQUE3RCxFQUFrRWQsT0FBbEUsQ0FBVixFQUFzRjtBQUNsRmtCLE1BQUFBLHFCQUFxQixDQUFDTCxLQUFELEVBQVFiLE9BQVIsRUFBaUJwQixnQkFBZ0IsQ0FBQ2tDLEdBQWxDLENBQXJCO0FBQ0EsYUFBTyxDQUFDRCxLQUFELEVBQVFqQyxnQkFBZ0IsQ0FBQ2tDLEdBQXpCLENBQVA7QUFDSDtBQUNKOztBQUVELFFBQU1LLHFCQUFxQixHQUFHQyxrQkFBdUJmLG1CQUF2QixJQUE5Qjs7QUFDQSxNQUFJYyxxQkFBSixFQUEyQjtBQUN2QkUsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVkseURBQVo7QUFDQUosSUFBQUEscUJBQXFCLENBQUNMLEtBQUQsRUFBUWIsT0FBUixFQUFpQm1CLHFCQUFqQixDQUFyQjtBQUNBLFdBQU8sQ0FBQ04sS0FBRCxFQUFRTSxxQkFBUixDQUFQO0FBQ0g7O0FBRUQsTUFBSXhDLGNBQUosRUFBb0I7QUFDaEIsVUFBTSxJQUFJSyxLQUFKLENBQVUsb0NBQVYsQ0FBTjtBQUNIOztBQUVELFFBQU11QyxVQUFVLEdBQUd4QixjQUFjLENBQUNDLE9BQUQsQ0FBakM7O0FBQ0EsUUFBTTtBQUFFRixJQUFBQTtBQUFGLE1BQWVQLGVBQU1pQyxtQkFBTixDQUEwQiw4QkFBMUIsRUFBMEQsRUFBMUQsRUFDakJDLGtDQURpQjtBQUVqQjtBQUNBO0FBQ0l6QixJQUFBQSxPQURKO0FBRUkwQixJQUFBQSxlQUFlLEVBQUUsTUFBT0MsS0FBUCxJQUFpQjtBQUM5QixZQUFNYixHQUFHLEdBQUcsTUFBTVMsVUFBVSxDQUFDSSxLQUFELENBQTVCO0FBQ0EsYUFBTyxNQUFNWixpQ0FBZ0JDLEdBQWhCLEdBQXNCQyxxQkFBdEIsQ0FBNENILEdBQTVDLEVBQWlEZCxPQUFqRCxDQUFiO0FBQ0g7QUFMTCxHQUhpQjtBQVVqQjtBQUFpQixNQVZBO0FBV2pCO0FBQXVCLE9BWE47QUFZakI7QUFBcUIsT0FaSjtBQWFqQjtBQUFlO0FBQ1g0QixJQUFBQSxhQUFhLEVBQUUsTUFBT0MsTUFBUCxJQUFrQjtBQUM3QixVQUFJQSxNQUFNLEtBQUssaUJBQWYsRUFBa0M7QUFDOUIsZUFBTzNDLGdCQUFnQixFQUF2QjtBQUNIOztBQUNELGFBQU8sSUFBUDtBQUNIO0FBTlUsR0FiRSxDQUFyQjs7QUFzQkEsUUFBTSxDQUFDeUMsS0FBRCxJQUFVLE1BQU03QixRQUF0Qjs7QUFDQSxNQUFJLENBQUM2QixLQUFMLEVBQVk7QUFDUixVQUFNLElBQUk1QyxvQkFBSixFQUFOO0FBQ0g7O0FBQ0QsUUFBTStCLEdBQUcsR0FBRyxNQUFNUyxVQUFVLENBQUNJLEtBQUQsQ0FBNUIsQ0F6RDZCLENBMkQ3Qjs7QUFDQVQsRUFBQUEscUJBQXFCLENBQUNMLEtBQUQsRUFBUWIsT0FBUixFQUFpQmMsR0FBakIsQ0FBckI7QUFFQSxTQUFPLENBQUNELEtBQUQsRUFBUUMsR0FBUixDQUFQO0FBQ0g7O0FBRU0sZUFBZWdCLGlCQUFmLENBQ0g5QjtBQURHO0FBQUEsRUFFSCtCO0FBRkc7QUFBQTtBQUFBO0FBR2dCO0FBQ25CLFFBQU1aLHFCQUFxQixHQUFHQyxrQkFBdUJmLG1CQUF2QixJQUE5Qjs7QUFDQSxNQUFJYyxxQkFBSixFQUEyQjtBQUN2QkUsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksc0RBQVo7QUFDQSxXQUFPSCxxQkFBUDtBQUNIOztBQUVELFFBQU1JLFVBQVUsR0FBR3hCLGNBQWMsQ0FBQ0MsT0FBRCxDQUFqQzs7QUFDQSxRQUFNO0FBQUVGLElBQUFBO0FBQUYsTUFBZVAsZUFBTWlDLG1CQUFOLENBQTBCLDhCQUExQixFQUEwRCxFQUExRCxFQUNqQkMsa0NBRGlCO0FBRWpCO0FBQ0E7QUFDSXpCLElBQUFBLE9BREo7QUFFSTBCLElBQUFBLGVBQWUsRUFBRSxNQUFPQyxLQUFQLElBQWlCO0FBQzlCLFlBQU1iLEdBQUcsR0FBRyxNQUFNUyxVQUFVLENBQUNJLEtBQUQsQ0FBNUI7O0FBQ0EsVUFBSTtBQUNBSSxRQUFBQSxTQUFTLENBQUNqQixHQUFELENBQVQ7QUFDQSxlQUFPLElBQVA7QUFDSCxPQUhELENBR0UsT0FBT2tCLENBQVAsRUFBVTtBQUNSLGVBQU8sS0FBUDtBQUNIO0FBQ0o7QUFWTCxHQUhpQjtBQWVqQjtBQUFpQixNQWZBO0FBZ0JqQjtBQUF1QixPQWhCTjtBQWlCakI7QUFBcUIsT0FqQko7QUFrQmpCO0FBQWU7QUFDWEosSUFBQUEsYUFBYSxFQUFFLE1BQU9DLE1BQVAsSUFBa0I7QUFDN0IsVUFBSUEsTUFBTSxLQUFLLGlCQUFmLEVBQWtDO0FBQzlCLGVBQU8zQyxnQkFBZ0IsRUFBdkI7QUFDSDs7QUFDRCxhQUFPLElBQVA7QUFDSDtBQU5VLEdBbEJFLENBQXJCOztBQTJCQSxRQUFNLENBQUN5QyxLQUFELElBQVUsTUFBTTdCLFFBQXRCOztBQUNBLE1BQUksQ0FBQzZCLEtBQUwsRUFBWTtBQUNSLFVBQU0sSUFBSTVDLG9CQUFKLEVBQU47QUFDSDs7QUFDRCxRQUFNK0IsR0FBRyxHQUFHLE1BQU1TLFVBQVUsQ0FBQ0ksS0FBRCxDQUE1QixDQXZDbUIsQ0F5Q25COztBQUNBL0MsRUFBQUEsZ0JBQWdCLEdBQUc7QUFBQ2tDLElBQUFBLEdBQUcsRUFBRSxJQUFJbUIsVUFBSixDQUFlbkIsR0FBZixDQUFOO0FBQTJCZCxJQUFBQTtBQUEzQixHQUFuQjtBQUVBLFNBQU9jLEdBQVA7QUFDSDs7QUFFRCxTQUFTSSxxQkFBVCxDQUNJTDtBQURKO0FBQUEsRUFFSWI7QUFGSjtBQUFBLEVBR0ljO0FBSEo7QUFBQTtBQUFBO0FBSVE7QUFDSixNQUFJakMsZ0JBQWdCLEVBQXBCLEVBQXdCO0FBQ3BCTCxJQUFBQSxpQkFBaUIsQ0FBQ3FDLEtBQUQsQ0FBakIsR0FBMkJDLEdBQTNCO0FBQ0FyQyxJQUFBQSxvQkFBb0IsQ0FBQ29DLEtBQUQsQ0FBcEIsR0FBOEJiLE9BQTlCO0FBQ0g7QUFDSjs7QUFFRCxlQUFla0MsaUJBQWYsQ0FDSUM7QUFESjtBQUFBLEVBRUlDO0FBRko7QUFBQSxFQUdJQztBQUhKO0FBQUEsRUFJSUM7QUFKSjtBQUFBLEVBS0lDO0FBTEo7QUFBQTtBQUFBO0FBTW1CO0FBQ2ZsQixFQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxtQkFBWixFQUFpQ2EsTUFBakMsRUFBeUNDLFFBQXpDLEVBQW1EQyxTQUFuRCxFQUE4REMsSUFBOUQsRUFBb0VDLFdBQXBFOztBQUNBLFFBQU1DLE1BQU0sR0FBR3pCLGlDQUFnQkMsR0FBaEIsRUFBZjs7QUFDQSxNQUFJbUIsTUFBTSxLQUFLSyxNQUFNLENBQUNDLFNBQVAsRUFBZixFQUFtQztBQUMvQjtBQUNIOztBQUNELE1BQUksQ0FBQ0YsV0FBRCxJQUFnQixDQUFDQSxXQUFXLENBQUNHLFVBQVosRUFBckIsRUFBK0M7QUFDM0NyQixJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBYSxpREFBZ0RjLFFBQVMsRUFBdEU7QUFDQTtBQUNIOztBQUNELE1BQ0lFLElBQUksS0FBSyx3QkFBVCxJQUNBQSxJQUFJLEtBQUssOEJBRFQsSUFFQUEsSUFBSSxLQUFLLDhCQUhiLEVBSUU7QUFDRSxVQUFNSyxTQUFTLEdBQUdILE1BQU0sQ0FBQ0ksNkJBQVAsRUFBbEI7QUFDQSxRQUFJLENBQUNELFNBQVMsQ0FBQ0UsdUJBQWYsRUFBd0M7QUFDeEMsVUFBTWhDLEtBQUssR0FBR3lCLElBQUksQ0FBQ1EsT0FBTCxDQUFhLGtCQUFiLEVBQWlDLEVBQWpDLENBQWQ7QUFDQSxVQUFNaEMsR0FBRyxHQUFHLE1BQU02QixTQUFTLENBQUNFLHVCQUFWLENBQWtDaEMsS0FBbEMsQ0FBbEI7O0FBQ0EsUUFBSSxDQUFDQyxHQUFMLEVBQVU7QUFDTk8sTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQ0ssR0FBRVQsS0FBTSxpQkFBZ0J1QixRQUFTLDBCQUR0QztBQUdIOztBQUNELFdBQU90QixHQUFHLElBQUksMEJBQWFBLEdBQWIsQ0FBZDtBQUNILEdBZkQsTUFlTyxJQUFJd0IsSUFBSSxLQUFLLG9CQUFiLEVBQW1DO0FBQ3RDLFVBQU14QixHQUFHLEdBQUcsTUFBTTBCLE1BQU0sQ0FBQ08sT0FBUCxDQUFlQywwQkFBZixFQUFsQjs7QUFDQSxRQUFJLENBQUNsQyxHQUFMLEVBQVU7QUFDTk8sTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQ0ssbUNBQWtDYyxRQUFTLDBCQURoRDtBQUdIOztBQUNELFdBQU90QixHQUFHLElBQUksMEJBQWFBLEdBQWIsQ0FBZDtBQUNIOztBQUNETyxFQUFBQSxPQUFPLENBQUM0QixJQUFSLENBQWEsc0RBQWIsRUFBcUVYLElBQXJFO0FBQ0g7O0FBRU0sTUFBTVk7QUFBdUM7QUFBQSxFQUFHO0FBQ25EN0MsRUFBQUEsbUJBRG1EO0FBRW5EYSxFQUFBQSxxQkFGbUQ7QUFHbkRnQixFQUFBQSxpQkFIbUQ7QUFJbkRKLEVBQUFBO0FBSm1ELENBQWhEOzs7QUFPQSxlQUFlcUIseUJBQWY7QUFBQTtBQUFnRTtBQUNuRSxNQUFJckMsR0FBSjs7QUFFQSxRQUFNO0FBQUVoQixJQUFBQTtBQUFGLE1BQWVQLGVBQU1pQyxtQkFBTixDQUEwQixnQkFBMUIsRUFBNEMsRUFBNUMsRUFBZ0Q0QiwrQkFBaEQsRUFBd0U7QUFDekZDLElBQUFBLFdBQVcsRUFBRSxLQUQ0RTtBQUNyRUMsSUFBQUEsV0FBVyxFQUFFQyxDQUFDLElBQUl6QyxHQUFHLEdBQUd5QztBQUQ2QyxHQUF4RSxFQUVsQixJQUZrQjtBQUVaO0FBQWlCLE9BRkw7QUFFWTtBQUFlLE1BRjNCLENBQXJCOztBQUlBLFFBQU1DLE9BQU8sR0FBRyxNQUFNMUQsUUFBdEI7QUFDQSxNQUFJLENBQUMwRCxPQUFMLEVBQWMsTUFBTSxJQUFJeEUsS0FBSixDQUFVLDZCQUFWLENBQU47QUFFZCxTQUFPOEIsR0FBUDtBQUNIO0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDTyxlQUFlMkMsbUJBQWYsQ0FBbUNDLElBQUksR0FBRyxZQUFZLENBQUcsQ0FBekQsRUFBMkRDLFVBQVUsR0FBRyxLQUF4RSxFQUErRTtBQUNsRixRQUFNQyxHQUFHLEdBQUc3QyxpQ0FBZ0JDLEdBQWhCLEVBQVo7O0FBQ0F0QyxFQUFBQSwwQkFBMEIsR0FBRyxJQUE3Qjs7QUFDQSxNQUFJO0FBQ0EsUUFBSSxFQUFDLE1BQU1rRixHQUFHLENBQUNDLG1CQUFKLEVBQVAsS0FBb0NGLFVBQXhDLEVBQW9EO0FBQ2hEO0FBQ0E7QUFDQSxZQUFNO0FBQUU3RCxRQUFBQTtBQUFGLFVBQWVQLGVBQU11RSx3QkFBTixDQUErQiw4QkFBL0IsRUFBK0QsRUFBL0QsNkVBQ1YscUVBRFUsS0FFakI7QUFDSUgsUUFBQUE7QUFESixPQUZpQixFQUtqQixJQUxpQjtBQU1qQjtBQUFpQixXQU5BO0FBT2pCO0FBQWUsVUFQRTtBQVFqQjtBQUFnQjtBQUNaL0IsUUFBQUEsYUFBYSxFQUFFLE1BQU9DLE1BQVAsSUFBa0I7QUFDN0I7QUFDQSxjQUFJQSxNQUFNLEtBQUssaUJBQWYsRUFBa0M7QUFDOUIsbUJBQU8sQ0FBQyw2Q0FBUjtBQUNIOztBQUNELGlCQUFPLElBQVA7QUFDSDtBQVBXLE9BUkMsQ0FBckI7O0FBa0JBLFlBQU0sQ0FBQ2tDLFNBQUQsSUFBYyxNQUFNakUsUUFBMUI7O0FBQ0EsVUFBSSxDQUFDaUUsU0FBTCxFQUFnQjtBQUNaLGNBQU0sSUFBSS9FLEtBQUosQ0FBVSxrQ0FBVixDQUFOO0FBQ0g7QUFDSixLQXpCRCxNQXlCTztBQUNILFlBQU1nRixxQkFBcUIsR0FBRzVFLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiwrQkFBakIsQ0FBOUI7QUFDQSxZQUFNdUUsR0FBRyxDQUFDSyxxQkFBSixDQUEwQjtBQUM1QkMsUUFBQUEsMkJBQTJCLEVBQUUsTUFBT0MsV0FBUCxJQUF1QjtBQUNoRCxnQkFBTTtBQUFFckUsWUFBQUE7QUFBRixjQUFlUCxlQUFNaUMsbUJBQU4sQ0FDakIsMkJBRGlCLEVBQ1ksRUFEWixFQUNnQndDLHFCQURoQixFQUVqQjtBQUNJdkUsWUFBQUEsS0FBSyxFQUFFLHlCQUFHLGlCQUFILENBRFg7QUFFSTJFLFlBQUFBLFlBQVksRUFBRVIsR0FGbEI7QUFHSU8sWUFBQUE7QUFISixXQUZpQixDQUFyQjs7QUFRQSxnQkFBTSxDQUFDSixTQUFELElBQWMsTUFBTWpFLFFBQTFCOztBQUNBLGNBQUksQ0FBQ2lFLFNBQUwsRUFBZ0I7QUFDWixrQkFBTSxJQUFJL0UsS0FBSixDQUFVLHdDQUFWLENBQU47QUFDSDtBQUNKO0FBZDJCLE9BQTFCLENBQU47QUFnQkEsWUFBTTRFLEdBQUcsQ0FBQ1Msc0JBQUosQ0FBMkI7QUFDN0JDLFFBQUFBLHNCQUFzQixFQUFFbkI7QUFESyxPQUEzQixDQUFOO0FBSUEsWUFBTXRDLEtBQUssR0FBR0gsTUFBTSxDQUFDSixJQUFQLENBQVk5QixpQkFBWixFQUErQixDQUEvQixDQUFkOztBQUNBLFVBQUlxQyxLQUFLLElBQUkwRCx1QkFBY0MsUUFBZCxDQUF1QixxQkFBdkIsQ0FBYixFQUE0RDtBQUN4RCxZQUFJQyxrQkFBa0IsR0FBRyxFQUF6Qjs7QUFDQSxZQUFJaEcsb0JBQW9CLENBQUNvQyxLQUFELENBQXBCLElBQStCcEMsb0JBQW9CLENBQUNvQyxLQUFELENBQXBCLENBQTRCWixVQUEvRCxFQUEyRTtBQUN2RXdFLFVBQUFBLGtCQUFrQixHQUFHO0FBQUV4RSxZQUFBQSxVQUFVLEVBQUV4QixvQkFBb0IsQ0FBQ29DLEtBQUQsQ0FBcEIsQ0FBNEJaO0FBQTFDLFdBQXJCO0FBQ0g7O0FBQ0RvQixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSx5QkFBWjtBQUNBLGNBQU1zQyxHQUFHLENBQUNjLGlCQUFKLENBQXNCbEcsaUJBQWlCLENBQUNxQyxLQUFELENBQXZDLEVBQWdENEQsa0JBQWhELEVBQW9FLGVBQXBFLENBQU47QUFDSCxPQVBELE1BT08sSUFBSSxDQUFDNUQsS0FBTCxFQUFZO0FBQ2ZRLFFBQUFBLE9BQU8sQ0FBQzRCLElBQVIsQ0FBYSxnREFBYjtBQUNILE9BRk0sTUFFQTtBQUNINUIsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksK0NBQVo7QUFDSDtBQUNKLEtBN0RELENBK0RBO0FBQ0E7OztBQUNBLFdBQU8sTUFBTW9DLElBQUksRUFBakI7QUFDSCxHQWxFRCxDQWtFRSxPQUFPMUIsQ0FBUCxFQUFVO0FBQ1JaLHNCQUF1QnVELDZCQUF2QixHQUF1RDNDLENBQXZEO0FBQ0FYLElBQUFBLE9BQU8sQ0FBQ3VELEtBQVIsQ0FBYzVDLENBQWQ7QUFDSCxHQXJFRCxTQXFFVTtBQUNOO0FBQ0F0RCxJQUFBQSwwQkFBMEIsR0FBRyxLQUE3Qjs7QUFDQSxRQUFJLENBQUNHLGdCQUFnQixFQUFyQixFQUF5QjtBQUNyQkwsTUFBQUEsaUJBQWlCLEdBQUcsRUFBcEI7QUFDQUMsTUFBQUEsb0JBQW9CLEdBQUcsRUFBdkI7QUFDSDtBQUNKO0FBQ0osQyxDQUVEOzs7QUFDTyxlQUFlb0csMENBQWYsQ0FDSHJDO0FBREc7QUFBQTtBQUFBO0FBRVU7QUFDYixRQUFNMUIsR0FBRyxHQUFHbEMsZ0JBQWdCLENBQUNrQyxHQUE3QjtBQUNBLE1BQUlnRSxlQUFlLEdBQUcsS0FBdEI7O0FBQ0EsTUFBSWhFLEdBQUcsS0FBSSxNQUFNMEIsTUFBTSxDQUFDdUMsb0JBQVAsRUFBVixDQUFQLEVBQWdEO0FBQzVDMUQsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksc0RBQVo7QUFDQTVDLElBQUFBLDBCQUEwQixHQUFHLElBQTdCO0FBQ0FDLElBQUFBLGNBQWMsR0FBRyxJQUFqQjs7QUFDQSxRQUFJO0FBQ0EsWUFBTTZELE1BQU0sQ0FBQ3dDLHlCQUFQLEVBQU4sQ0FEQSxDQUdBO0FBQ0E7O0FBQ0EsVUFBSVAsa0JBQWtCLEdBQUcsRUFBekI7O0FBQ0EsVUFBSTdGLGdCQUFnQixDQUFDb0IsT0FBakIsSUFBNEJwQixnQkFBZ0IsQ0FBQ29CLE9BQWpCLENBQXlCQyxVQUF6RCxFQUFxRTtBQUNqRXdFLFFBQUFBLGtCQUFrQixHQUFHO0FBQUV4RSxVQUFBQSxVQUFVLEVBQUVyQixnQkFBZ0IsQ0FBQ29CLE9BQWpCLENBQXlCQztBQUF2QyxTQUFyQjtBQUNIOztBQUNELFlBQU11QyxNQUFNLENBQUNrQyxpQkFBUCxDQUF5QjVELEdBQXpCLEVBQThCMkQsa0JBQTlCLEVBQWtELGVBQWxELENBQU4sQ0FUQSxDQVdBOztBQUNBLFlBQU1RLFVBQVUsR0FBRyxNQUFNekMsTUFBTSxDQUFDMEMsbUJBQVAsRUFBekI7O0FBQ0EsVUFBSUQsVUFBSixFQUFnQjtBQUNaSCxRQUFBQSxlQUFlLEdBQUcsSUFBbEIsQ0FEWSxDQUVaOztBQUNBdEMsUUFBQUEsTUFBTSxDQUFDMkMsaUNBQVAsQ0FBeUNGLFVBQXpDLEVBQ0tHLE9BREwsQ0FDYSxNQUFNO0FBQ1gxRyxVQUFBQSwwQkFBMEIsR0FBRyxLQUE3QjtBQUNBQyxVQUFBQSxjQUFjLEdBQUcsS0FBakI7O0FBQ0EsY0FBSSxDQUFDRSxnQkFBZ0IsRUFBckIsRUFBeUI7QUFDckJMLFlBQUFBLGlCQUFpQixHQUFHLEVBQXBCO0FBQ0FDLFlBQUFBLG9CQUFvQixHQUFHLEVBQXZCO0FBQ0g7QUFDSixTQVJMO0FBU0g7QUFDSixLQTFCRCxTQTBCVTtBQUNORyxNQUFBQSxnQkFBZ0IsR0FBRyxFQUFuQixDQURNLENBRU47QUFDQTs7QUFDQSxVQUFJLENBQUNrRyxlQUFMLEVBQXNCO0FBQ2xCcEcsUUFBQUEsMEJBQTBCLEdBQUcsS0FBN0I7QUFDQUMsUUFBQUEsY0FBYyxHQUFHLEtBQWpCOztBQUNBLFlBQUksQ0FBQ0UsZ0JBQWdCLEVBQXJCLEVBQXlCO0FBQ3JCTCxVQUFBQSxpQkFBaUIsR0FBRyxFQUFwQjtBQUNBQyxVQUFBQSxvQkFBb0IsR0FBRyxFQUF2QjtBQUNIO0FBQ0o7QUFDSjtBQUNKO0FBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBJQ3J5cHRvQ2FsbGJhY2tzLCBJRGV2aWNlVHJ1c3RMZXZlbCwgSVNlY3JldFN0b3JhZ2VLZXlJbmZvIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbWF0cml4JztcbmltcG9ydCB7IE1hdHJpeENsaWVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL2NsaWVudCc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi9Nb2RhbCc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgZGVyaXZlS2V5IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL2tleV9wYXNzcGhyYXNlJztcbmltcG9ydCB7IGRlY29kZVJlY292ZXJ5S2V5IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL3JlY292ZXJ5a2V5JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgZW5jb2RlQmFzZTY0IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by9vbG1saWJcIjtcbmltcG9ydCB7IGlzU2VjdXJlQmFja3VwUmVxdWlyZWQgfSBmcm9tICcuL3V0aWxzL1dlbGxLbm93blV0aWxzJztcbmltcG9ydCBBY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nIGZyb20gJy4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2cnO1xuaW1wb3J0IFJlc3RvcmVLZXlCYWNrdXBEaWFsb2cgZnJvbSAnLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvUmVzdG9yZUtleUJhY2t1cERpYWxvZyc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgU2VjdXJpdHlDdXN0b21pc2F0aW9ucyBmcm9tIFwiLi9jdXN0b21pc2F0aW9ucy9TZWN1cml0eVwiO1xuXG4vLyBUaGlzIHN0b3JlcyB0aGUgc2VjcmV0IHN0b3JhZ2UgcHJpdmF0ZSBrZXlzIGluIG1lbW9yeSBmb3IgdGhlIEpTIFNESy4gVGhpcyBpc1xuLy8gb25seSBtZWFudCB0byBhY3QgYXMgYSBjYWNoZSB0byBhdm9pZCBwcm9tcHRpbmcgdGhlIHVzZXIgbXVsdGlwbGUgdGltZXNcbi8vIGR1cmluZyB0aGUgc2FtZSBzaW5nbGUgb3BlcmF0aW9uLiBVc2UgYGFjY2Vzc1NlY3JldFN0b3JhZ2VgIGJlbG93IHRvIHNjb3BlIGFcbi8vIHNpbmdsZSBzZWNyZXQgc3RvcmFnZSBvcGVyYXRpb24sIGFzIGl0IHdpbGwgY2xlYXIgdGhlIGNhY2hlZCBrZXlzIG9uY2UgdGhlXG4vLyBvcGVyYXRpb24gZW5kcy5cbmxldCBzZWNyZXRTdG9yYWdlS2V5czogUmVjb3JkPHN0cmluZywgVWludDhBcnJheT4gPSB7fTtcbmxldCBzZWNyZXRTdG9yYWdlS2V5SW5mbzogUmVjb3JkPHN0cmluZywgSVNlY3JldFN0b3JhZ2VLZXlJbmZvPiA9IHt9O1xubGV0IHNlY3JldFN0b3JhZ2VCZWluZ0FjY2Vzc2VkID0gZmFsc2U7XG5cbmxldCBub25JbnRlcmFjdGl2ZSA9IGZhbHNlO1xuXG5sZXQgZGVoeWRyYXRpb25DYWNoZToge1xuICAgIGtleT86IFVpbnQ4QXJyYXksXG4gICAga2V5SW5mbz86IElTZWNyZXRTdG9yYWdlS2V5SW5mbyxcbn0gPSB7fTtcblxuZnVuY3Rpb24gaXNDYWNoaW5nQWxsb3dlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gc2VjcmV0U3RvcmFnZUJlaW5nQWNjZXNzZWQ7XG59XG5cbi8qKlxuICogVGhpcyBjYW4gYmUgdXNlZCBieSBvdGhlciBjb21wb25lbnRzIHRvIGNoZWNrIGlmIHNlY3JldCBzdG9yYWdlIGFjY2VzcyBpcyBpblxuICogcHJvZ3Jlc3MsIHNvIHRoYXQgd2UgY2FuIGUuZy4gYXZvaWQgaW50ZXJtaXR0ZW50bHkgc2hvd2luZyB0b2FzdHMgZHVyaW5nXG4gKiBzZWNyZXQgc3RvcmFnZSBzZXR1cC5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU2VjcmV0U3RvcmFnZUJlaW5nQWNjZXNzZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHNlY3JldFN0b3JhZ2VCZWluZ0FjY2Vzc2VkO1xufVxuXG5leHBvcnQgY2xhc3MgQWNjZXNzQ2FuY2VsbGVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKFwiU2VjcmV0IHN0b3JhZ2UgYWNjZXNzIGNhbmNlbGVkXCIpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gY29uZmlybVRvRGlzbWlzcygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuICAgIGNvbnN0IFtzdXJlXSA9IGF3YWl0IE1vZGFsLmNyZWF0ZURpYWxvZyhRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICB0aXRsZTogX3QoXCJDYW5jZWwgZW50ZXJpbmcgcGFzc3BocmFzZT9cIiksXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBjYW5jZWwgZW50ZXJpbmcgcGFzc3BocmFzZT9cIiksXG4gICAgICAgIGRhbmdlcjogZmFsc2UsXG4gICAgICAgIGJ1dHRvbjogX3QoXCJHbyBCYWNrXCIpLFxuICAgICAgICBjYW5jZWxCdXR0b246IF90KFwiQ2FuY2VsXCIpLFxuICAgIH0pLmZpbmlzaGVkO1xuICAgIHJldHVybiAhc3VyZTtcbn1cblxuZnVuY3Rpb24gbWFrZUlucHV0VG9LZXkoXG4gICAga2V5SW5mbzogSVNlY3JldFN0b3JhZ2VLZXlJbmZvLFxuKTogKGtleVBhcmFtczogeyBwYXNzcGhyYXNlOiBzdHJpbmcsIHJlY292ZXJ5S2V5OiBzdHJpbmcgfSkgPT4gUHJvbWlzZTxVaW50OEFycmF5PiB7XG4gICAgcmV0dXJuIGFzeW5jICh7IHBhc3NwaHJhc2UsIHJlY292ZXJ5S2V5IH0pID0+IHtcbiAgICAgICAgaWYgKHBhc3NwaHJhc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBkZXJpdmVLZXkoXG4gICAgICAgICAgICAgICAgcGFzc3BocmFzZSxcbiAgICAgICAgICAgICAgICBrZXlJbmZvLnBhc3NwaHJhc2Uuc2FsdCxcbiAgICAgICAgICAgICAgICBrZXlJbmZvLnBhc3NwaHJhc2UuaXRlcmF0aW9ucyxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZGVjb2RlUmVjb3ZlcnlLZXkocmVjb3ZlcnlLZXkpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0U2VjcmV0U3RvcmFnZUtleShcbiAgICB7IGtleXM6IGtleUluZm9zIH06IHsga2V5czogUmVjb3JkPHN0cmluZywgSVNlY3JldFN0b3JhZ2VLZXlJbmZvPiB9LFxuICAgIHNzc3NJdGVtTmFtZSxcbik6IFByb21pc2U8W3N0cmluZywgVWludDhBcnJheV0+IHtcbiAgICBjb25zdCBrZXlJbmZvRW50cmllcyA9IE9iamVjdC5lbnRyaWVzKGtleUluZm9zKTtcbiAgICBpZiAoa2V5SW5mb0VudHJpZXMubGVuZ3RoID4gMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNdWx0aXBsZSBzdG9yYWdlIGtleSByZXF1ZXN0cyBub3QgaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuICAgIGNvbnN0IFtrZXlJZCwga2V5SW5mb10gPSBrZXlJbmZvRW50cmllc1swXTtcblxuICAgIC8vIENoZWNrIHRoZSBpbi1tZW1vcnkgY2FjaGVcbiAgICBpZiAoaXNDYWNoaW5nQWxsb3dlZCgpICYmIHNlY3JldFN0b3JhZ2VLZXlzW2tleUlkXSkge1xuICAgICAgICByZXR1cm4gW2tleUlkLCBzZWNyZXRTdG9yYWdlS2V5c1trZXlJZF1dO1xuICAgIH1cblxuICAgIGlmIChkZWh5ZHJhdGlvbkNhY2hlLmtleSkge1xuICAgICAgICBpZiAoYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmNoZWNrU2VjcmV0U3RvcmFnZUtleShkZWh5ZHJhdGlvbkNhY2hlLmtleSwga2V5SW5mbykpIHtcbiAgICAgICAgICAgIGNhY2hlU2VjcmV0U3RvcmFnZUtleShrZXlJZCwga2V5SW5mbywgZGVoeWRyYXRpb25DYWNoZS5rZXkpO1xuICAgICAgICAgICAgcmV0dXJuIFtrZXlJZCwgZGVoeWRyYXRpb25DYWNoZS5rZXldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qga2V5RnJvbUN1c3RvbWlzYXRpb25zID0gU2VjdXJpdHlDdXN0b21pc2F0aW9ucy5nZXRTZWNyZXRTdG9yYWdlS2V5Py4oKTtcbiAgICBpZiAoa2V5RnJvbUN1c3RvbWlzYXRpb25zKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVXNpbmcga2V5IGZyb20gc2VjdXJpdHkgY3VzdG9taXNhdGlvbnMgKHNlY3JldCBzdG9yYWdlKVwiKVxuICAgICAgICBjYWNoZVNlY3JldFN0b3JhZ2VLZXkoa2V5SWQsIGtleUluZm8sIGtleUZyb21DdXN0b21pc2F0aW9ucyk7XG4gICAgICAgIHJldHVybiBba2V5SWQsIGtleUZyb21DdXN0b21pc2F0aW9uc107XG4gICAgfVxuXG4gICAgaWYgKG5vbkludGVyYWN0aXZlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCB1bmxvY2sgbm9uLWludGVyYWN0aXZlbHlcIik7XG4gICAgfVxuXG4gICAgY29uc3QgaW5wdXRUb0tleSA9IG1ha2VJbnB1dFRvS2V5KGtleUluZm8pO1xuICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coXCJBY2Nlc3MgU2VjcmV0IFN0b3JhZ2UgZGlhbG9nXCIsIFwiXCIsXG4gICAgICAgIEFjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2csXG4gICAgICAgIC8qIHByb3BzPSAqL1xuICAgICAgICB7XG4gICAgICAgICAgICBrZXlJbmZvLFxuICAgICAgICAgICAgY2hlY2tQcml2YXRlS2V5OiBhc3luYyAoaW5wdXQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBpbnB1dFRvS2V5KGlucHV0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmNoZWNrU2VjcmV0U3RvcmFnZUtleShrZXksIGtleUluZm8pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgLyogY2xhc3NOYW1lPSAqLyBudWxsLFxuICAgICAgICAvKiBpc1ByaW9yaXR5TW9kYWw9ICovIGZhbHNlLFxuICAgICAgICAvKiBpc1N0YXRpY01vZGFsPSAqLyBmYWxzZSxcbiAgICAgICAgLyogb3B0aW9ucz0gKi8ge1xuICAgICAgICAgICAgb25CZWZvcmVDbG9zZTogYXN5bmMgKHJlYXNvbikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZWFzb24gPT09IFwiYmFja2dyb3VuZENsaWNrXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpcm1Ub0Rpc21pc3MoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICk7XG4gICAgY29uc3QgW2lucHV0XSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgIGlmICghaW5wdXQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEFjY2Vzc0NhbmNlbGxlZEVycm9yKCk7XG4gICAgfVxuICAgIGNvbnN0IGtleSA9IGF3YWl0IGlucHV0VG9LZXkoaW5wdXQpO1xuXG4gICAgLy8gU2F2ZSB0byBjYWNoZSB0byBhdm9pZCBmdXR1cmUgcHJvbXB0cyBpbiB0aGUgY3VycmVudCBzZXNzaW9uXG4gICAgY2FjaGVTZWNyZXRTdG9yYWdlS2V5KGtleUlkLCBrZXlJbmZvLCBrZXkpO1xuXG4gICAgcmV0dXJuIFtrZXlJZCwga2V5XTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERlaHlkcmF0aW9uS2V5KFxuICAgIGtleUluZm86IElTZWNyZXRTdG9yYWdlS2V5SW5mbyxcbiAgICBjaGVja0Z1bmM6IChVaW50OEFycmF5KSA9PiB2b2lkLFxuKTogUHJvbWlzZTxVaW50OEFycmF5PiB7XG4gICAgY29uc3Qga2V5RnJvbUN1c3RvbWlzYXRpb25zID0gU2VjdXJpdHlDdXN0b21pc2F0aW9ucy5nZXRTZWNyZXRTdG9yYWdlS2V5Py4oKTtcbiAgICBpZiAoa2V5RnJvbUN1c3RvbWlzYXRpb25zKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVXNpbmcga2V5IGZyb20gc2VjdXJpdHkgY3VzdG9taXNhdGlvbnMgKGRlaHlkcmF0aW9uKVwiKVxuICAgICAgICByZXR1cm4ga2V5RnJvbUN1c3RvbWlzYXRpb25zO1xuICAgIH1cblxuICAgIGNvbnN0IGlucHV0VG9LZXkgPSBtYWtlSW5wdXRUb0tleShrZXlJbmZvKTtcbiAgICBjb25zdCB7IGZpbmlzaGVkIH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFwiQWNjZXNzIFNlY3JldCBTdG9yYWdlIGRpYWxvZ1wiLCBcIlwiLFxuICAgICAgICBBY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nLFxuICAgICAgICAvKiBwcm9wcz0gKi9cbiAgICAgICAge1xuICAgICAgICAgICAga2V5SW5mbyxcbiAgICAgICAgICAgIGNoZWNrUHJpdmF0ZUtleTogYXN5bmMgKGlucHV0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgaW5wdXRUb0tleShpbnB1dCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tGdW5jKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIC8qIGNsYXNzTmFtZT0gKi8gbnVsbCxcbiAgICAgICAgLyogaXNQcmlvcml0eU1vZGFsPSAqLyBmYWxzZSxcbiAgICAgICAgLyogaXNTdGF0aWNNb2RhbD0gKi8gZmFsc2UsXG4gICAgICAgIC8qIG9wdGlvbnM9ICovIHtcbiAgICAgICAgICAgIG9uQmVmb3JlQ2xvc2U6IGFzeW5jIChyZWFzb24pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVhc29uID09PSBcImJhY2tncm91bmRDbGlja1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb25maXJtVG9EaXNtaXNzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICApO1xuICAgIGNvbnN0IFtpbnB1dF0gPSBhd2FpdCBmaW5pc2hlZDtcbiAgICBpZiAoIWlucHV0KSB7XG4gICAgICAgIHRocm93IG5ldyBBY2Nlc3NDYW5jZWxsZWRFcnJvcigpO1xuICAgIH1cbiAgICBjb25zdCBrZXkgPSBhd2FpdCBpbnB1dFRvS2V5KGlucHV0KTtcblxuICAgIC8vIG5lZWQgdG8gY29weSB0aGUga2V5IGJlY2F1c2UgcmVoeWRyYXRpb24gKHVucGlja2xpbmcpIHdpbGwgY2xvYmJlciBpdFxuICAgIGRlaHlkcmF0aW9uQ2FjaGUgPSB7a2V5OiBuZXcgVWludDhBcnJheShrZXkpLCBrZXlJbmZvfTtcblxuICAgIHJldHVybiBrZXk7XG59XG5cbmZ1bmN0aW9uIGNhY2hlU2VjcmV0U3RvcmFnZUtleShcbiAgICBrZXlJZDogc3RyaW5nLFxuICAgIGtleUluZm86IElTZWNyZXRTdG9yYWdlS2V5SW5mbyxcbiAgICBrZXk6IFVpbnQ4QXJyYXksXG4pOiB2b2lkIHtcbiAgICBpZiAoaXNDYWNoaW5nQWxsb3dlZCgpKSB7XG4gICAgICAgIHNlY3JldFN0b3JhZ2VLZXlzW2tleUlkXSA9IGtleTtcbiAgICAgICAgc2VjcmV0U3RvcmFnZUtleUluZm9ba2V5SWRdID0ga2V5SW5mbztcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG9uU2VjcmV0UmVxdWVzdGVkKFxuICAgIHVzZXJJZDogc3RyaW5nLFxuICAgIGRldmljZUlkOiBzdHJpbmcsXG4gICAgcmVxdWVzdElkOiBzdHJpbmcsXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGRldmljZVRydXN0OiBJRGV2aWNlVHJ1c3RMZXZlbCxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc29sZS5sb2coXCJvblNlY3JldFJlcXVlc3RlZFwiLCB1c2VySWQsIGRldmljZUlkLCByZXF1ZXN0SWQsIG5hbWUsIGRldmljZVRydXN0KTtcbiAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgaWYgKHVzZXJJZCAhPT0gY2xpZW50LmdldFVzZXJJZCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFkZXZpY2VUcnVzdCB8fCAhZGV2aWNlVHJ1c3QuaXNWZXJpZmllZCgpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBJZ25vcmluZyBzZWNyZXQgcmVxdWVzdCBmcm9tIHVudHJ1c3RlZCBkZXZpY2UgJHtkZXZpY2VJZH1gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICAgIG5hbWUgPT09IFwibS5jcm9zc19zaWduaW5nLm1hc3RlclwiIHx8XG4gICAgICAgIG5hbWUgPT09IFwibS5jcm9zc19zaWduaW5nLnNlbGZfc2lnbmluZ1wiIHx8XG4gICAgICAgIG5hbWUgPT09IFwibS5jcm9zc19zaWduaW5nLnVzZXJfc2lnbmluZ1wiXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IGNhbGxiYWNrcyA9IGNsaWVudC5nZXRDcm9zc1NpZ25pbmdDYWNoZUNhbGxiYWNrcygpO1xuICAgICAgICBpZiAoIWNhbGxiYWNrcy5nZXRDcm9zc1NpZ25pbmdLZXlDYWNoZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBrZXlJZCA9IG5hbWUucmVwbGFjZShcIm0uY3Jvc3Nfc2lnbmluZy5cIiwgXCJcIik7XG4gICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGNhbGxiYWNrcy5nZXRDcm9zc1NpZ25pbmdLZXlDYWNoZShrZXlJZCk7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICBgJHtrZXlJZH0gcmVxdWVzdGVkIGJ5ICR7ZGV2aWNlSWR9LCBidXQgbm90IGZvdW5kIGluIGNhY2hlYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGtleSAmJiBlbmNvZGVCYXNlNjQoa2V5KTtcbiAgICB9IGVsc2UgaWYgKG5hbWUgPT09IFwibS5tZWdvbG1fYmFja3VwLnYxXCIpIHtcbiAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgY2xpZW50Ll9jcnlwdG8uZ2V0U2Vzc2lvbkJhY2t1cFByaXZhdGVLZXkoKTtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgIGBzZXNzaW9uIGJhY2t1cCBrZXkgcmVxdWVzdGVkIGJ5ICR7ZGV2aWNlSWR9LCBidXQgbm90IGZvdW5kIGluIGNhY2hlYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGtleSAmJiBlbmNvZGVCYXNlNjQoa2V5KTtcbiAgICB9XG4gICAgY29uc29sZS53YXJuKFwib25TZWNyZXRSZXF1ZXN0ZWQgZGlkbid0IHJlY29nbmlzZSB0aGUgc2VjcmV0IG5hbWVkIFwiLCBuYW1lKTtcbn1cblxuZXhwb3J0IGNvbnN0IGNyb3NzU2lnbmluZ0NhbGxiYWNrczogSUNyeXB0b0NhbGxiYWNrcyA9IHtcbiAgICBnZXRTZWNyZXRTdG9yYWdlS2V5LFxuICAgIGNhY2hlU2VjcmV0U3RvcmFnZUtleSxcbiAgICBvblNlY3JldFJlcXVlc3RlZCxcbiAgICBnZXREZWh5ZHJhdGlvbktleSxcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9tcHRGb3JCYWNrdXBQYXNzcGhyYXNlKCk6IFByb21pc2U8VWludDhBcnJheT4ge1xuICAgIGxldCBrZXk7XG5cbiAgICBjb25zdCB7IGZpbmlzaGVkIH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdSZXN0b3JlIEJhY2t1cCcsICcnLCBSZXN0b3JlS2V5QmFja3VwRGlhbG9nLCB7XG4gICAgICAgIHNob3dTdW1tYXJ5OiBmYWxzZSwga2V5Q2FsbGJhY2s6IGsgPT4ga2V5ID0gayxcbiAgICB9LCBudWxsLCAvKiBwcmlvcml0eSA9ICovIGZhbHNlLCAvKiBzdGF0aWMgPSAqLyB0cnVlKTtcblxuICAgIGNvbnN0IHN1Y2Nlc3MgPSBhd2FpdCBmaW5pc2hlZDtcbiAgICBpZiAoIXN1Y2Nlc3MpIHRocm93IG5ldyBFcnJvcihcIktleSBiYWNrdXAgcHJvbXB0IGNhbmNlbGxlZFwiKTtcblxuICAgIHJldHVybiBrZXk7XG59XG5cbi8qKlxuICogVGhpcyBoZWxwZXIgc2hvdWxkIGJlIHVzZWQgd2hlbmV2ZXIgeW91IG5lZWQgdG8gYWNjZXNzIHNlY3JldCBzdG9yYWdlLiBJdFxuICogZW5zdXJlcyB0aGF0IHNlY3JldCBzdG9yYWdlIChhbmQgYWxzbyBjcm9zcy1zaWduaW5nIHNpbmNlIHRoZXkgZWFjaCBkZXBlbmQgb25cbiAqIGVhY2ggb3RoZXIgaW4gYSBjeWNsZSBvZiBzb3J0cykgaGF2ZSBiZWVuIGJvb3RzdHJhcHBlZCBiZWZvcmUgcnVubmluZyB0aGVcbiAqIHByb3ZpZGVkIGZ1bmN0aW9uLlxuICpcbiAqIEJvb3RzdHJhcHBpbmcgc2VjcmV0IHN0b3JhZ2UgbWF5IHRha2Ugb25lIG9mIHRoZXNlIHBhdGhzOlxuICogMS4gQ3JlYXRlIHNlY3JldCBzdG9yYWdlIGZyb20gYSBwYXNzcGhyYXNlIGFuZCBzdG9yZSBjcm9zcy1zaWduaW5nIGtleXNcbiAqICAgIGluIHNlY3JldCBzdG9yYWdlLlxuICogMi4gQWNjZXNzIGV4aXN0aW5nIHNlY3JldCBzdG9yYWdlIGJ5IHJlcXVlc3RpbmcgcGFzc3BocmFzZSBhbmQgYWNjZXNzaW5nXG4gKiAgICBjcm9zcy1zaWduaW5nIGtleXMgYXMgbmVlZGVkLlxuICogMy4gQWxsIGtleXMgYXJlIGxvYWRlZCBhbmQgdGhlcmUncyBub3RoaW5nIHRvIGRvLlxuICpcbiAqIEFkZGl0aW9uYWxseSwgdGhlIHNlY3JldCBzdG9yYWdlIGtleXMgYXJlIGNhY2hlZCBkdXJpbmcgdGhlIHNjb3BlIG9mIHRoaXMgZnVuY3Rpb25cbiAqIHRvIGVuc3VyZSB0aGUgdXNlciBpcyBwcm9tcHRlZCBvbmx5IG9uY2UgZm9yIHRoZWlyIHNlY3JldCBzdG9yYWdlXG4gKiBwYXNzcGhyYXNlLiBUaGUgY2FjaGUgaXMgdGhlbiBjbGVhcmVkIG9uY2UgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIGNvbXBsZXRlcy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZnVuY10gQW4gb3BlcmF0aW9uIHRvIHBlcmZvcm0gb25jZSBzZWNyZXQgc3RvcmFnZSBoYXMgYmVlblxuICogYm9vdHN0cmFwcGVkLiBPcHRpb25hbC5cbiAqIEBwYXJhbSB7Ym9vbH0gW2ZvcmNlUmVzZXRdIFJlc2V0IHNlY3JldCBzdG9yYWdlIGV2ZW4gaWYgaXQncyBhbHJlYWR5IHNldCB1cFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWNjZXNzU2VjcmV0U3RvcmFnZShmdW5jID0gYXN5bmMgKCkgPT4geyB9LCBmb3JjZVJlc2V0ID0gZmFsc2UpIHtcbiAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgc2VjcmV0U3RvcmFnZUJlaW5nQWNjZXNzZWQgPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICAgIGlmICghYXdhaXQgY2xpLmhhc1NlY3JldFN0b3JhZ2VLZXkoKSB8fCBmb3JjZVJlc2V0KSB7XG4gICAgICAgICAgICAvLyBUaGlzIGRpYWxvZyBjYWxscyBib290c3RyYXAgaXRzZWxmIGFmdGVyIGd1aWRpbmcgdGhlIHVzZXIgdGhyb3VnaFxuICAgICAgICAgICAgLy8gcGFzc3BocmFzZSBjcmVhdGlvbi5cbiAgICAgICAgICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2dBc3luYygnQ3JlYXRlIFNlY3JldCBTdG9yYWdlIGRpYWxvZycsICcnLFxuICAgICAgICAgICAgICAgIGltcG9ydChcIi4vYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dcIiksXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBmb3JjZVJlc2V0LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAvKiBwcmlvcml0eSA9ICovIGZhbHNlLFxuICAgICAgICAgICAgICAgIC8qIHN0YXRpYyA9ICovIHRydWUsXG4gICAgICAgICAgICAgICAgLyogb3B0aW9ucyA9ICovIHtcbiAgICAgICAgICAgICAgICAgICAgb25CZWZvcmVDbG9zZTogYXN5bmMgKHJlYXNvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgU2VjdXJlIEJhY2t1cCBpcyByZXF1aXJlZCwgeW91IGNhbm5vdCBsZWF2ZSB0aGUgbW9kYWwuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVhc29uID09PSBcImJhY2tncm91bmRDbGlja1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFpc1NlY3VyZUJhY2t1cFJlcXVpcmVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IFtjb25maXJtZWRdID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgICAgICBpZiAoIWNvbmZpcm1lZCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlY3JldCBzdG9yYWdlIGNyZWF0aW9uIGNhbmNlbGVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgSW50ZXJhY3RpdmVBdXRoRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuSW50ZXJhY3RpdmVBdXRoRGlhbG9nXCIpO1xuICAgICAgICAgICAgYXdhaXQgY2xpLmJvb3RzdHJhcENyb3NzU2lnbmluZyh7XG4gICAgICAgICAgICAgICAgYXV0aFVwbG9hZERldmljZVNpZ25pbmdLZXlzOiBhc3luYyAobWFrZVJlcXVlc3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBmaW5pc2hlZCB9ID0gTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICdDcm9zcy1zaWduaW5nIGtleXMgZGlhbG9nJywgJycsIEludGVyYWN0aXZlQXV0aERpYWxvZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJTZXR0aW5nIHVwIGtleXNcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0cml4Q2xpZW50OiBjbGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFrZVJlcXVlc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbY29uZmlybWVkXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbmZpcm1lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ3Jvc3Mtc2lnbmluZyBrZXkgdXBsb2FkIGF1dGggY2FuY2VsZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhd2FpdCBjbGkuYm9vdHN0cmFwU2VjcmV0U3RvcmFnZSh7XG4gICAgICAgICAgICAgICAgZ2V0S2V5QmFja3VwUGFzc3BocmFzZTogcHJvbXB0Rm9yQmFja3VwUGFzc3BocmFzZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBrZXlJZCA9IE9iamVjdC5rZXlzKHNlY3JldFN0b3JhZ2VLZXlzKVswXTtcbiAgICAgICAgICAgIGlmIChrZXlJZCAmJiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9kZWh5ZHJhdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIGxldCBkZWh5ZHJhdGlvbktleUluZm8gPSB7fTtcbiAgICAgICAgICAgICAgICBpZiAoc2VjcmV0U3RvcmFnZUtleUluZm9ba2V5SWRdICYmIHNlY3JldFN0b3JhZ2VLZXlJbmZvW2tleUlkXS5wYXNzcGhyYXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlaHlkcmF0aW9uS2V5SW5mbyA9IHsgcGFzc3BocmFzZTogc2VjcmV0U3RvcmFnZUtleUluZm9ba2V5SWRdLnBhc3NwaHJhc2UgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJTZXR0aW5nIGRlaHlkcmF0aW9uIGtleVwiKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBjbGkuc2V0RGVoeWRyYXRpb25LZXkoc2VjcmV0U3RvcmFnZUtleXNba2V5SWRdLCBkZWh5ZHJhdGlvbktleUluZm8sIFwiQmFja3VwIGRldmljZVwiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWtleUlkKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiTm90IHNldHRpbmcgZGVoeWRyYXRpb24ga2V5OiBubyBTU1NTIGtleSBmb3VuZFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJOb3Qgc2V0dGluZyBkZWh5ZHJhdGlvbiBrZXk6IGZlYXR1cmUgZGlzYWJsZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBgcmV0dXJuIGF3YWl0YCBuZWVkZWQgaGVyZSB0byBlbnN1cmUgYGZpbmFsbHlgIGJsb2NrIHJ1bnMgYWZ0ZXIgdGhlXG4gICAgICAgIC8vIGlubmVyIG9wZXJhdGlvbiBjb21wbGV0ZXMuXG4gICAgICAgIHJldHVybiBhd2FpdCBmdW5jKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBTZWN1cml0eUN1c3RvbWlzYXRpb25zLmNhdGNoQWNjZXNzU2VjcmV0U3RvcmFnZUVycm9yPy4oZSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgLy8gQ2xlYXIgc2VjcmV0IHN0b3JhZ2Uga2V5IGNhY2hlIG5vdyB0aGF0IHdvcmsgaXMgY29tcGxldGVcbiAgICAgICAgc2VjcmV0U3RvcmFnZUJlaW5nQWNjZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKCFpc0NhY2hpbmdBbGxvd2VkKCkpIHtcbiAgICAgICAgICAgIHNlY3JldFN0b3JhZ2VLZXlzID0ge307XG4gICAgICAgICAgICBzZWNyZXRTdG9yYWdlS2V5SW5mbyA9IHt9O1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBGSVhNRTogdGhpcyBmdW5jdGlvbiBuYW1lIGlzIGEgYml0IG9mIGEgbW91dGhmdWxcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0cnlUb1VubG9ja1NlY3JldFN0b3JhZ2VXaXRoRGVoeWRyYXRpb25LZXkoXG4gICAgY2xpZW50OiBNYXRyaXhDbGllbnQsXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBrZXkgPSBkZWh5ZHJhdGlvbkNhY2hlLmtleTtcbiAgICBsZXQgcmVzdG9yaW5nQmFja3VwID0gZmFsc2U7XG4gICAgaWYgKGtleSAmJiBhd2FpdCBjbGllbnQuaXNTZWNyZXRTdG9yYWdlUmVhZHkoKSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlRyeWluZyB0byBzZXQgdXAgY3Jvc3Mtc2lnbmluZyB1c2luZyBkZWh5ZHJhdGlvbiBrZXlcIik7XG4gICAgICAgIHNlY3JldFN0b3JhZ2VCZWluZ0FjY2Vzc2VkID0gdHJ1ZTtcbiAgICAgICAgbm9uSW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgY2xpZW50LmNoZWNrT3duQ3Jvc3NTaWduaW5nVHJ1c3QoKTtcblxuICAgICAgICAgICAgLy8gd2UgYWxzbyBuZWVkIHRvIHNldCBhIG5ldyBkZWh5ZHJhdGVkIGRldmljZSB0byByZXBsYWNlIHRoZVxuICAgICAgICAgICAgLy8gZGV2aWNlIHdlIHJlaHlkcmF0ZWRcbiAgICAgICAgICAgIGxldCBkZWh5ZHJhdGlvbktleUluZm8gPSB7fTtcbiAgICAgICAgICAgIGlmIChkZWh5ZHJhdGlvbkNhY2hlLmtleUluZm8gJiYgZGVoeWRyYXRpb25DYWNoZS5rZXlJbmZvLnBhc3NwaHJhc2UpIHtcbiAgICAgICAgICAgICAgICBkZWh5ZHJhdGlvbktleUluZm8gPSB7IHBhc3NwaHJhc2U6IGRlaHlkcmF0aW9uQ2FjaGUua2V5SW5mby5wYXNzcGhyYXNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBjbGllbnQuc2V0RGVoeWRyYXRpb25LZXkoa2V5LCBkZWh5ZHJhdGlvbktleUluZm8sIFwiQmFja3VwIGRldmljZVwiKTtcblxuICAgICAgICAgICAgLy8gYW5kIHJlc3RvcmUgZnJvbSBiYWNrdXBcbiAgICAgICAgICAgIGNvbnN0IGJhY2t1cEluZm8gPSBhd2FpdCBjbGllbnQuZ2V0S2V5QmFja3VwVmVyc2lvbigpO1xuICAgICAgICAgICAgaWYgKGJhY2t1cEluZm8pIHtcbiAgICAgICAgICAgICAgICByZXN0b3JpbmdCYWNrdXAgPSB0cnVlO1xuICAgICAgICAgICAgICAgIC8vIGRvbid0IGF3YWl0LCBiZWNhdXNlIHRoaXMgY2FuIHRha2UgYSBsb25nIHRpbWVcbiAgICAgICAgICAgICAgICBjbGllbnQucmVzdG9yZUtleUJhY2t1cFdpdGhTZWNyZXRTdG9yYWdlKGJhY2t1cEluZm8pXG4gICAgICAgICAgICAgICAgICAgIC5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY3JldFN0b3JhZ2VCZWluZ0FjY2Vzc2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBub25JbnRlcmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0NhY2hpbmdBbGxvd2VkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWNyZXRTdG9yYWdlS2V5cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY3JldFN0b3JhZ2VLZXlJbmZvID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgZGVoeWRyYXRpb25DYWNoZSA9IHt9O1xuICAgICAgICAgICAgLy8gdGhlIHNlY3JldCBzdG9yYWdlIGNhY2hlIGlzIG5lZWRlZCBmb3IgcmVzdG9yaW5nIGZyb20gYmFja3VwLCBzb1xuICAgICAgICAgICAgLy8gZG9uJ3QgY2xlYXIgaXQgeWV0IGlmIHdlJ3JlIHJlc3RvcmluZyBmcm9tIGJhY2t1cFxuICAgICAgICAgICAgaWYgKCFyZXN0b3JpbmdCYWNrdXApIHtcbiAgICAgICAgICAgICAgICBzZWNyZXRTdG9yYWdlQmVpbmdBY2Nlc3NlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIG5vbkludGVyYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0NhY2hpbmdBbGxvd2VkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VjcmV0U3RvcmFnZUtleXMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgc2VjcmV0U3RvcmFnZUtleUluZm8gPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=