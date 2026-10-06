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
  const cli = _MatrixClientPeg.MatrixClientPeg.get();

  let keyId = await cli.getDefaultSecretStorageKeyId();
  let keyInfo;

  if (keyId) {
    // use the default SSSS key if set
    keyInfo = keyInfos[keyId];

    if (!keyInfo) {
      // if the default key is not available, pretend the default key
      // isn't set
      keyId = undefined;
    }
  }

  if (!keyId) {
    // if no default SSSS key is set, fall back to a heuristic of using the
    // only available key, if only one key is set
    const keyInfoEntries = Object.entries(keyInfos);

    if (keyInfoEntries.length > 1) {
      throw new Error("Multiple storage key requests not implemented");
    }

    [keyId, keyInfo] = keyInfoEntries[0];
  } // Check the in-memory cache


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
    console.error(e); // Re-throw so that higher level logic can abort as needed

    throw e;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9TZWN1cml0eU1hbmFnZXIudHMiXSwibmFtZXMiOlsic2VjcmV0U3RvcmFnZUtleXMiLCJzZWNyZXRTdG9yYWdlS2V5SW5mbyIsInNlY3JldFN0b3JhZ2VCZWluZ0FjY2Vzc2VkIiwibm9uSW50ZXJhY3RpdmUiLCJkZWh5ZHJhdGlvbkNhY2hlIiwiaXNDYWNoaW5nQWxsb3dlZCIsImlzU2VjcmV0U3RvcmFnZUJlaW5nQWNjZXNzZWQiLCJBY2Nlc3NDYW5jZWxsZWRFcnJvciIsIkVycm9yIiwiY29uc3RydWN0b3IiLCJjb25maXJtVG9EaXNtaXNzIiwiUXVlc3Rpb25EaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJzdXJlIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiZGFuZ2VyIiwiYnV0dG9uIiwiY2FuY2VsQnV0dG9uIiwiZmluaXNoZWQiLCJtYWtlSW5wdXRUb0tleSIsImtleUluZm8iLCJwYXNzcGhyYXNlIiwicmVjb3ZlcnlLZXkiLCJzYWx0IiwiaXRlcmF0aW9ucyIsImdldFNlY3JldFN0b3JhZ2VLZXkiLCJrZXlzIiwia2V5SW5mb3MiLCJzc3NzSXRlbU5hbWUiLCJjbGkiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJrZXlJZCIsImdldERlZmF1bHRTZWNyZXRTdG9yYWdlS2V5SWQiLCJ1bmRlZmluZWQiLCJrZXlJbmZvRW50cmllcyIsIk9iamVjdCIsImVudHJpZXMiLCJsZW5ndGgiLCJrZXkiLCJjaGVja1NlY3JldFN0b3JhZ2VLZXkiLCJjYWNoZVNlY3JldFN0b3JhZ2VLZXkiLCJrZXlGcm9tQ3VzdG9taXNhdGlvbnMiLCJTZWN1cml0eUN1c3RvbWlzYXRpb25zIiwiY29uc29sZSIsImxvZyIsImlucHV0VG9LZXkiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZyIsImNoZWNrUHJpdmF0ZUtleSIsImlucHV0Iiwib25CZWZvcmVDbG9zZSIsInJlYXNvbiIsImdldERlaHlkcmF0aW9uS2V5IiwiY2hlY2tGdW5jIiwiZSIsIlVpbnQ4QXJyYXkiLCJvblNlY3JldFJlcXVlc3RlZCIsInVzZXJJZCIsImRldmljZUlkIiwicmVxdWVzdElkIiwibmFtZSIsImRldmljZVRydXN0IiwiY2xpZW50IiwiZ2V0VXNlcklkIiwiaXNWZXJpZmllZCIsImNhbGxiYWNrcyIsImdldENyb3NzU2lnbmluZ0NhY2hlQ2FsbGJhY2tzIiwiZ2V0Q3Jvc3NTaWduaW5nS2V5Q2FjaGUiLCJyZXBsYWNlIiwiX2NyeXB0byIsImdldFNlc3Npb25CYWNrdXBQcml2YXRlS2V5Iiwid2FybiIsImNyb3NzU2lnbmluZ0NhbGxiYWNrcyIsInByb21wdEZvckJhY2t1cFBhc3NwaHJhc2UiLCJSZXN0b3JlS2V5QmFja3VwRGlhbG9nIiwic2hvd1N1bW1hcnkiLCJrZXlDYWxsYmFjayIsImsiLCJzdWNjZXNzIiwiYWNjZXNzU2VjcmV0U3RvcmFnZSIsImZ1bmMiLCJmb3JjZVJlc2V0IiwiaGFzU2VjcmV0U3RvcmFnZUtleSIsImNyZWF0ZVRyYWNrZWREaWFsb2dBc3luYyIsImNvbmZpcm1lZCIsIkludGVyYWN0aXZlQXV0aERpYWxvZyIsImJvb3RzdHJhcENyb3NzU2lnbmluZyIsImF1dGhVcGxvYWREZXZpY2VTaWduaW5nS2V5cyIsIm1ha2VSZXF1ZXN0IiwibWF0cml4Q2xpZW50IiwiYm9vdHN0cmFwU2VjcmV0U3RvcmFnZSIsImdldEtleUJhY2t1cFBhc3NwaHJhc2UiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJkZWh5ZHJhdGlvbktleUluZm8iLCJzZXREZWh5ZHJhdGlvbktleSIsImNhdGNoQWNjZXNzU2VjcmV0U3RvcmFnZUVycm9yIiwiZXJyb3IiLCJ0cnlUb1VubG9ja1NlY3JldFN0b3JhZ2VXaXRoRGVoeWRyYXRpb25LZXkiLCJyZXN0b3JpbmdCYWNrdXAiLCJpc1NlY3JldFN0b3JhZ2VSZWFkeSIsImNoZWNrT3duQ3Jvc3NTaWduaW5nVHJ1c3QiLCJiYWNrdXBJbmZvIiwiZ2V0S2V5QmFja3VwVmVyc2lvbiIsInJlc3RvcmVLZXlCYWNrdXBXaXRoU2VjcmV0U3RvcmFnZSIsImZpbmFsbHkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUE3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQTtBQUE2QztBQUFBLEVBQUcsRUFBcEQ7QUFDQSxJQUFJQztBQUEyRDtBQUFBLEVBQUcsRUFBbEU7QUFDQSxJQUFJQywwQkFBMEIsR0FBRyxLQUFqQztBQUVBLElBQUlDLGNBQWMsR0FBRyxLQUFyQjtBQUVBLElBQUlDO0FBR0g7QUFDRDtBQUNBO0FBQ0E7QUFIQyxFQUFHLEVBSEo7O0FBS0EsU0FBU0MsZ0JBQVQ7QUFBQTtBQUFxQztBQUNqQyxTQUFPSCwwQkFBUDtBQUNIO0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNPLFNBQVNJLDRCQUFUO0FBQUE7QUFBaUQ7QUFDcEQsU0FBT0osMEJBQVA7QUFDSDs7QUFFTSxNQUFNSyxvQkFBTixTQUFtQ0MsS0FBbkMsQ0FBeUM7QUFDNUNDLEVBQUFBLFdBQVcsR0FBRztBQUNWLFVBQU0sZ0NBQU47QUFDSDs7QUFIMkM7Ozs7QUFNaEQsZUFBZUMsZ0JBQWY7QUFBQTtBQUFvRDtBQUNoRCxRQUFNQyxjQUFjLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQix3QkFBakIsQ0FBdkI7QUFDQSxRQUFNLENBQUNDLElBQUQsSUFBUyxNQUFNQyxlQUFNQyxZQUFOLENBQW1CTCxjQUFuQixFQUFtQztBQUNwRE0sSUFBQUEsS0FBSyxFQUFFLHlCQUFHLDZCQUFILENBRDZDO0FBRXBEQyxJQUFBQSxXQUFXLEVBQUUseUJBQUcsc0RBQUgs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QUFHLEtBQWpCOztBQUNBLFlBQUksQ0FBQ0UsZ0JBQWdCLEVBQXJCLEVBQXlCO0FBQ3JCTCxVQUFBQSxpQkFBaUIsR0FBRyxFQUFwQjtBQUNBQyxVQUFBQSxvQkFBb0IsR0FBRyxFQUF2QjtBQUNIO0FBQ0o7QUFDSjtBQUNKO0FBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBJQ3J5cHRvQ2FsbGJhY2tzLCBJRGV2aWNlVHJ1c3RMZXZlbCwgSVNlY3JldFN0b3JhZ2VLZXlJbmZvIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbWF0cml4JztcbmltcG9ydCB7IE1hdHJpeENsaWVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL2NsaWVudCc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi9Nb2RhbCc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgZGVyaXZlS2V5IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL2tleV9wYXNzcGhyYXNlJztcbmltcG9ydCB7IGRlY29kZVJlY292ZXJ5S2V5IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL3JlY292ZXJ5a2V5JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgZW5jb2RlQmFzZTY0IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by9vbG1saWJcIjtcbmltcG9ydCB7IGlzU2VjdXJlQmFja3VwUmVxdWlyZWQgfSBmcm9tICcuL3V0aWxzL1dlbGxLbm93blV0aWxzJztcbmltcG9ydCBBY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nIGZyb20gJy4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2cnO1xuaW1wb3J0IFJlc3RvcmVLZXlCYWNrdXBEaWFsb2cgZnJvbSAnLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvUmVzdG9yZUtleUJhY2t1cERpYWxvZyc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgU2VjdXJpdHlDdXN0b21pc2F0aW9ucyBmcm9tIFwiLi9jdXN0b21pc2F0aW9ucy9TZWN1cml0eVwiO1xuXG4vLyBUaGlzIHN0b3JlcyB0aGUgc2VjcmV0IHN0b3JhZ2UgcHJpdmF0ZSBrZXlzIGluIG1lbW9yeSBmb3IgdGhlIEpTIFNESy4gVGhpcyBpc1xuLy8gb25seSBtZWFudCB0byBhY3QgYXMgYSBjYWNoZSB0byBhdm9pZCBwcm9tcHRpbmcgdGhlIHVzZXIgbXVsdGlwbGUgdGltZXNcbi8vIGR1cmluZyB0aGUgc2FtZSBzaW5nbGUgb3BlcmF0aW9uLiBVc2UgYGFjY2Vzc1NlY3JldFN0b3JhZ2VgIGJlbG93IHRvIHNjb3BlIGFcbi8vIHNpbmdsZSBzZWNyZXQgc3RvcmFnZSBvcGVyYXRpb24sIGFzIGl0IHdpbGwgY2xlYXIgdGhlIGNhY2hlZCBrZXlzIG9uY2UgdGhlXG4vLyBvcGVyYXRpb24gZW5kcy5cbmxldCBzZWNyZXRTdG9yYWdlS2V5czogUmVjb3JkPHN0cmluZywgVWludDhBcnJheT4gPSB7fTtcbmxldCBzZWNyZXRTdG9yYWdlS2V5SW5mbzogUmVjb3JkPHN0cmluZywgSVNlY3JldFN0b3JhZ2VLZXlJbmZvPiA9IHt9O1xubGV0IHNlY3JldFN0b3JhZ2VCZWluZ0FjY2Vzc2VkID0gZmFsc2U7XG5cbmxldCBub25JbnRlcmFjdGl2ZSA9IGZhbHNlO1xuXG5sZXQgZGVoeWRyYXRpb25DYWNoZToge1xuICAgIGtleT86IFVpbnQ4QXJyYXksXG4gICAga2V5SW5mbz86IElTZWNyZXRTdG9yYWdlS2V5SW5mbyxcbn0gPSB7fTtcblxuZnVuY3Rpb24gaXNDYWNoaW5nQWxsb3dlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gc2VjcmV0U3RvcmFnZUJlaW5nQWNjZXNzZWQ7XG59XG5cbi8qKlxuICogVGhpcyBjYW4gYmUgdXNlZCBieSBvdGhlciBjb21wb25lbnRzIHRvIGNoZWNrIGlmIHNlY3JldCBzdG9yYWdlIGFjY2VzcyBpcyBpblxuICogcHJvZ3Jlc3MsIHNvIHRoYXQgd2UgY2FuIGUuZy4gYXZvaWQgaW50ZXJtaXR0ZW50bHkgc2hvd2luZyB0b2FzdHMgZHVyaW5nXG4gKiBzZWNyZXQgc3RvcmFnZSBzZXR1cC5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU2VjcmV0U3RvcmFnZUJlaW5nQWNjZXNzZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHNlY3JldFN0b3JhZ2VCZWluZ0FjY2Vzc2VkO1xufVxuXG5leHBvcnQgY2xhc3MgQWNjZXNzQ2FuY2VsbGVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKFwiU2VjcmV0IHN0b3JhZ2UgYWNjZXNzIGNhbmNlbGVkXCIpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gY29uZmlybVRvRGlzbWlzcygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuICAgIGNvbnN0IFtzdXJlXSA9IGF3YWl0IE1vZGFsLmNyZWF0ZURpYWxvZyhRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICB0aXRsZTogX3QoXCJDYW5jZWwgZW50ZXJpbmcgcGFzc3BocmFzZT9cIiksXG4gICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBjYW5jZWwgZW50ZXJpbmcgcGFzc3BocmFzZT9cIiksXG4gICAgICAgIGRhbmdlcjogZmFsc2UsXG4gICAgICAgIGJ1dHRvbjogX3QoXCJHbyBCYWNrXCIpLFxuICAgICAgICBjYW5jZWxCdXR0b246IF90KFwiQ2FuY2VsXCIpLFxuICAgIH0pLmZpbmlzaGVkO1xuICAgIHJldHVybiAhc3VyZTtcbn1cblxuZnVuY3Rpb24gbWFrZUlucHV0VG9LZXkoXG4gICAga2V5SW5mbzogSVNlY3JldFN0b3JhZ2VLZXlJbmZvLFxuKTogKGtleVBhcmFtczogeyBwYXNzcGhyYXNlOiBzdHJpbmcsIHJlY292ZXJ5S2V5OiBzdHJpbmcgfSkgPT4gUHJvbWlzZTxVaW50OEFycmF5PiB7XG4gICAgcmV0dXJuIGFzeW5jICh7IHBhc3NwaHJhc2UsIHJlY292ZXJ5S2V5IH0pID0+IHtcbiAgICAgICAgaWYgKHBhc3NwaHJhc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBkZXJpdmVLZXkoXG4gICAgICAgICAgICAgICAgcGFzc3BocmFzZSxcbiAgICAgICAgICAgICAgICBrZXlJbmZvLnBhc3NwaHJhc2Uuc2FsdCxcbiAgICAgICAgICAgICAgICBrZXlJbmZvLnBhc3NwaHJhc2UuaXRlcmF0aW9ucyxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZGVjb2RlUmVjb3ZlcnlLZXkocmVjb3ZlcnlLZXkpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0U2VjcmV0U3RvcmFnZUtleShcbiAgICB7IGtleXM6IGtleUluZm9zIH06IHsga2V5czogUmVjb3JkPHN0cmluZywgSVNlY3JldFN0b3JhZ2VLZXlJbmZvPiB9LFxuICAgIHNzc3NJdGVtTmFtZSxcbik6IFByb21pc2U8W3N0cmluZywgVWludDhBcnJheV0+IHtcbiAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgbGV0IGtleUlkID0gYXdhaXQgY2xpLmdldERlZmF1bHRTZWNyZXRTdG9yYWdlS2V5SWQoKTtcbiAgICBsZXQga2V5SW5mbztcbiAgICBpZiAoa2V5SWQpIHtcbiAgICAgICAgLy8gdXNlIHRoZSBkZWZhdWx0IFNTU1Mga2V5IGlmIHNldFxuICAgICAgICBrZXlJbmZvID0ga2V5SW5mb3Nba2V5SWRdO1xuICAgICAgICBpZiAoIWtleUluZm8pIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZSBkZWZhdWx0IGtleSBpcyBub3QgYXZhaWxhYmxlLCBwcmV0ZW5kIHRoZSBkZWZhdWx0IGtleVxuICAgICAgICAgICAgLy8gaXNuJ3Qgc2V0XG4gICAgICAgICAgICBrZXlJZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWtleUlkKSB7XG4gICAgICAgIC8vIGlmIG5vIGRlZmF1bHQgU1NTUyBrZXkgaXMgc2V0LCBmYWxsIGJhY2sgdG8gYSBoZXVyaXN0aWMgb2YgdXNpbmcgdGhlXG4gICAgICAgIC8vIG9ubHkgYXZhaWxhYmxlIGtleSwgaWYgb25seSBvbmUga2V5IGlzIHNldFxuICAgICAgICBjb25zdCBrZXlJbmZvRW50cmllcyA9IE9iamVjdC5lbnRyaWVzKGtleUluZm9zKTtcbiAgICAgICAgaWYgKGtleUluZm9FbnRyaWVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk11bHRpcGxlIHN0b3JhZ2Uga2V5IHJlcXVlc3RzIG5vdCBpbXBsZW1lbnRlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBba2V5SWQsIGtleUluZm9dID0ga2V5SW5mb0VudHJpZXNbMF07XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIGluLW1lbW9yeSBjYWNoZVxuICAgIGlmIChpc0NhY2hpbmdBbGxvd2VkKCkgJiYgc2VjcmV0U3RvcmFnZUtleXNba2V5SWRdKSB7XG4gICAgICAgIHJldHVybiBba2V5SWQsIHNlY3JldFN0b3JhZ2VLZXlzW2tleUlkXV07XG4gICAgfVxuXG4gICAgaWYgKGRlaHlkcmF0aW9uQ2FjaGUua2V5KSB7XG4gICAgICAgIGlmIChhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY2hlY2tTZWNyZXRTdG9yYWdlS2V5KGRlaHlkcmF0aW9uQ2FjaGUua2V5LCBrZXlJbmZvKSkge1xuICAgICAgICAgICAgY2FjaGVTZWNyZXRTdG9yYWdlS2V5KGtleUlkLCBrZXlJbmZvLCBkZWh5ZHJhdGlvbkNhY2hlLmtleSk7XG4gICAgICAgICAgICByZXR1cm4gW2tleUlkLCBkZWh5ZHJhdGlvbkNhY2hlLmtleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBrZXlGcm9tQ3VzdG9taXNhdGlvbnMgPSBTZWN1cml0eUN1c3RvbWlzYXRpb25zLmdldFNlY3JldFN0b3JhZ2VLZXk/LigpO1xuICAgIGlmIChrZXlGcm9tQ3VzdG9taXNhdGlvbnMpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJVc2luZyBrZXkgZnJvbSBzZWN1cml0eSBjdXN0b21pc2F0aW9ucyAoc2VjcmV0IHN0b3JhZ2UpXCIpXG4gICAgICAgIGNhY2hlU2VjcmV0U3RvcmFnZUtleShrZXlJZCwga2V5SW5mbywga2V5RnJvbUN1c3RvbWlzYXRpb25zKTtcbiAgICAgICAgcmV0dXJuIFtrZXlJZCwga2V5RnJvbUN1c3RvbWlzYXRpb25zXTtcbiAgICB9XG5cbiAgICBpZiAobm9uSW50ZXJhY3RpdmUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IHVubG9jayBub24taW50ZXJhY3RpdmVseVwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBpbnB1dFRvS2V5ID0gbWFrZUlucHV0VG9LZXkoa2V5SW5mbyk7XG4gICAgY29uc3QgeyBmaW5pc2hlZCB9ID0gTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhcIkFjY2VzcyBTZWNyZXQgU3RvcmFnZSBkaWFsb2dcIiwgXCJcIixcbiAgICAgICAgQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZyxcbiAgICAgICAgLyogcHJvcHM9ICovXG4gICAgICAgIHtcbiAgICAgICAgICAgIGtleUluZm8sXG4gICAgICAgICAgICBjaGVja1ByaXZhdGVLZXk6IGFzeW5jIChpbnB1dCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGlucHV0VG9LZXkoaW5wdXQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY2hlY2tTZWNyZXRTdG9yYWdlS2V5KGtleSwga2V5SW5mbyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICAvKiBjbGFzc05hbWU9ICovIG51bGwsXG4gICAgICAgIC8qIGlzUHJpb3JpdHlNb2RhbD0gKi8gZmFsc2UsXG4gICAgICAgIC8qIGlzU3RhdGljTW9kYWw9ICovIGZhbHNlLFxuICAgICAgICAvKiBvcHRpb25zPSAqLyB7XG4gICAgICAgICAgICBvbkJlZm9yZUNsb3NlOiBhc3luYyAocmVhc29uKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlYXNvbiA9PT0gXCJiYWNrZ3JvdW5kQ2xpY2tcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlybVRvRGlzbWlzcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgKTtcbiAgICBjb25zdCBbaW5wdXRdID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgaWYgKCFpbnB1dCkge1xuICAgICAgICB0aHJvdyBuZXcgQWNjZXNzQ2FuY2VsbGVkRXJyb3IoKTtcbiAgICB9XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgaW5wdXRUb0tleShpbnB1dCk7XG5cbiAgICAvLyBTYXZlIHRvIGNhY2hlIHRvIGF2b2lkIGZ1dHVyZSBwcm9tcHRzIGluIHRoZSBjdXJyZW50IHNlc3Npb25cbiAgICBjYWNoZVNlY3JldFN0b3JhZ2VLZXkoa2V5SWQsIGtleUluZm8sIGtleSk7XG5cbiAgICByZXR1cm4gW2tleUlkLCBrZXldO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGVoeWRyYXRpb25LZXkoXG4gICAga2V5SW5mbzogSVNlY3JldFN0b3JhZ2VLZXlJbmZvLFxuICAgIGNoZWNrRnVuYzogKFVpbnQ4QXJyYXkpID0+IHZvaWQsXG4pOiBQcm9taXNlPFVpbnQ4QXJyYXk+IHtcbiAgICBjb25zdCBrZXlGcm9tQ3VzdG9taXNhdGlvbnMgPSBTZWN1cml0eUN1c3RvbWlzYXRpb25zLmdldFNlY3JldFN0b3JhZ2VLZXk/LigpO1xuICAgIGlmIChrZXlGcm9tQ3VzdG9taXNhdGlvbnMpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJVc2luZyBrZXkgZnJvbSBzZWN1cml0eSBjdXN0b21pc2F0aW9ucyAoZGVoeWRyYXRpb24pXCIpXG4gICAgICAgIHJldHVybiBrZXlGcm9tQ3VzdG9taXNhdGlvbnM7XG4gICAgfVxuXG4gICAgY29uc3QgaW5wdXRUb0tleSA9IG1ha2VJbnB1dFRvS2V5KGtleUluZm8pO1xuICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coXCJBY2Nlc3MgU2VjcmV0IFN0b3JhZ2UgZGlhbG9nXCIsIFwiXCIsXG4gICAgICAgIEFjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2csXG4gICAgICAgIC8qIHByb3BzPSAqL1xuICAgICAgICB7XG4gICAgICAgICAgICBrZXlJbmZvLFxuICAgICAgICAgICAgY2hlY2tQcml2YXRlS2V5OiBhc3luYyAoaW5wdXQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBpbnB1dFRvS2V5KGlucHV0KTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjaGVja0Z1bmMoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgLyogY2xhc3NOYW1lPSAqLyBudWxsLFxuICAgICAgICAvKiBpc1ByaW9yaXR5TW9kYWw9ICovIGZhbHNlLFxuICAgICAgICAvKiBpc1N0YXRpY01vZGFsPSAqLyBmYWxzZSxcbiAgICAgICAgLyogb3B0aW9ucz0gKi8ge1xuICAgICAgICAgICAgb25CZWZvcmVDbG9zZTogYXN5bmMgKHJlYXNvbikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZWFzb24gPT09IFwiYmFja2dyb3VuZENsaWNrXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpcm1Ub0Rpc21pc3MoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICk7XG4gICAgY29uc3QgW2lucHV0XSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgIGlmICghaW5wdXQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEFjY2Vzc0NhbmNlbGxlZEVycm9yKCk7XG4gICAgfVxuICAgIGNvbnN0IGtleSA9IGF3YWl0IGlucHV0VG9LZXkoaW5wdXQpO1xuXG4gICAgLy8gbmVlZCB0byBjb3B5IHRoZSBrZXkgYmVjYXVzZSByZWh5ZHJhdGlvbiAodW5waWNrbGluZykgd2lsbCBjbG9iYmVyIGl0XG4gICAgZGVoeWRyYXRpb25DYWNoZSA9IHtrZXk6IG5ldyBVaW50OEFycmF5KGtleSksIGtleUluZm99O1xuXG4gICAgcmV0dXJuIGtleTtcbn1cblxuZnVuY3Rpb24gY2FjaGVTZWNyZXRTdG9yYWdlS2V5KFxuICAgIGtleUlkOiBzdHJpbmcsXG4gICAga2V5SW5mbzogSVNlY3JldFN0b3JhZ2VLZXlJbmZvLFxuICAgIGtleTogVWludDhBcnJheSxcbik6IHZvaWQge1xuICAgIGlmIChpc0NhY2hpbmdBbGxvd2VkKCkpIHtcbiAgICAgICAgc2VjcmV0U3RvcmFnZUtleXNba2V5SWRdID0ga2V5O1xuICAgICAgICBzZWNyZXRTdG9yYWdlS2V5SW5mb1trZXlJZF0gPSBrZXlJbmZvO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gb25TZWNyZXRSZXF1ZXN0ZWQoXG4gICAgdXNlcklkOiBzdHJpbmcsXG4gICAgZGV2aWNlSWQ6IHN0cmluZyxcbiAgICByZXF1ZXN0SWQ6IHN0cmluZyxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgZGV2aWNlVHJ1c3Q6IElEZXZpY2VUcnVzdExldmVsLFxuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zb2xlLmxvZyhcIm9uU2VjcmV0UmVxdWVzdGVkXCIsIHVzZXJJZCwgZGV2aWNlSWQsIHJlcXVlc3RJZCwgbmFtZSwgZGV2aWNlVHJ1c3QpO1xuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBpZiAodXNlcklkICE9PSBjbGllbnQuZ2V0VXNlcklkKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIWRldmljZVRydXN0IHx8ICFkZXZpY2VUcnVzdC5pc1ZlcmlmaWVkKCkpIHtcbiAgICAgICAgY29uc29sZS5sb2coYElnbm9yaW5nIHNlY3JldCByZXF1ZXN0IGZyb20gdW50cnVzdGVkIGRldmljZSAke2RldmljZUlkfWApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChcbiAgICAgICAgbmFtZSA9PT0gXCJtLmNyb3NzX3NpZ25pbmcubWFzdGVyXCIgfHxcbiAgICAgICAgbmFtZSA9PT0gXCJtLmNyb3NzX3NpZ25pbmcuc2VsZl9zaWduaW5nXCIgfHxcbiAgICAgICAgbmFtZSA9PT0gXCJtLmNyb3NzX3NpZ25pbmcudXNlcl9zaWduaW5nXCJcbiAgICApIHtcbiAgICAgICAgY29uc3QgY2FsbGJhY2tzID0gY2xpZW50LmdldENyb3NzU2lnbmluZ0NhY2hlQ2FsbGJhY2tzKCk7XG4gICAgICAgIGlmICghY2FsbGJhY2tzLmdldENyb3NzU2lnbmluZ0tleUNhY2hlKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGtleUlkID0gbmFtZS5yZXBsYWNlKFwibS5jcm9zc19zaWduaW5nLlwiLCBcIlwiKTtcbiAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgY2FsbGJhY2tzLmdldENyb3NzU2lnbmluZ0tleUNhY2hlKGtleUlkKTtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgIGAke2tleUlkfSByZXF1ZXN0ZWQgYnkgJHtkZXZpY2VJZH0sIGJ1dCBub3QgZm91bmQgaW4gY2FjaGVgLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ga2V5ICYmIGVuY29kZUJhc2U2NChrZXkpO1xuICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gXCJtLm1lZ29sbV9iYWNrdXAudjFcIikge1xuICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBjbGllbnQuX2NyeXB0by5nZXRTZXNzaW9uQmFja3VwUHJpdmF0ZUtleSgpO1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgYHNlc3Npb24gYmFja3VwIGtleSByZXF1ZXN0ZWQgYnkgJHtkZXZpY2VJZH0sIGJ1dCBub3QgZm91bmQgaW4gY2FjaGVgLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ga2V5ICYmIGVuY29kZUJhc2U2NChrZXkpO1xuICAgIH1cbiAgICBjb25zb2xlLndhcm4oXCJvblNlY3JldFJlcXVlc3RlZCBkaWRuJ3QgcmVjb2duaXNlIHRoZSBzZWNyZXQgbmFtZWQgXCIsIG5hbWUpO1xufVxuXG5leHBvcnQgY29uc3QgY3Jvc3NTaWduaW5nQ2FsbGJhY2tzOiBJQ3J5cHRvQ2FsbGJhY2tzID0ge1xuICAgIGdldFNlY3JldFN0b3JhZ2VLZXksXG4gICAgY2FjaGVTZWNyZXRTdG9yYWdlS2V5LFxuICAgIG9uU2VjcmV0UmVxdWVzdGVkLFxuICAgIGdldERlaHlkcmF0aW9uS2V5LFxufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb21wdEZvckJhY2t1cFBhc3NwaHJhc2UoKTogUHJvbWlzZTxVaW50OEFycmF5PiB7XG4gICAgbGV0IGtleTtcblxuICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1Jlc3RvcmUgQmFja3VwJywgJycsIFJlc3RvcmVLZXlCYWNrdXBEaWFsb2csIHtcbiAgICAgICAgc2hvd1N1bW1hcnk6IGZhbHNlLCBrZXlDYWxsYmFjazogayA9PiBrZXkgPSBrLFxuICAgIH0sIG51bGwsIC8qIHByaW9yaXR5ID0gKi8gZmFsc2UsIC8qIHN0YXRpYyA9ICovIHRydWUpO1xuXG4gICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IGZpbmlzaGVkO1xuICAgIGlmICghc3VjY2VzcykgdGhyb3cgbmV3IEVycm9yKFwiS2V5IGJhY2t1cCBwcm9tcHQgY2FuY2VsbGVkXCIpO1xuXG4gICAgcmV0dXJuIGtleTtcbn1cblxuLyoqXG4gKiBUaGlzIGhlbHBlciBzaG91bGQgYmUgdXNlZCB3aGVuZXZlciB5b3UgbmVlZCB0byBhY2Nlc3Mgc2VjcmV0IHN0b3JhZ2UuIEl0XG4gKiBlbnN1cmVzIHRoYXQgc2VjcmV0IHN0b3JhZ2UgKGFuZCBhbHNvIGNyb3NzLXNpZ25pbmcgc2luY2UgdGhleSBlYWNoIGRlcGVuZCBvblxuICogZWFjaCBvdGhlciBpbiBhIGN5Y2xlIG9mIHNvcnRzKSBoYXZlIGJlZW4gYm9vdHN0cmFwcGVkIGJlZm9yZSBydW5uaW5nIHRoZVxuICogcHJvdmlkZWQgZnVuY3Rpb24uXG4gKlxuICogQm9vdHN0cmFwcGluZyBzZWNyZXQgc3RvcmFnZSBtYXkgdGFrZSBvbmUgb2YgdGhlc2UgcGF0aHM6XG4gKiAxLiBDcmVhdGUgc2VjcmV0IHN0b3JhZ2UgZnJvbSBhIHBhc3NwaHJhc2UgYW5kIHN0b3JlIGNyb3NzLXNpZ25pbmcga2V5c1xuICogICAgaW4gc2VjcmV0IHN0b3JhZ2UuXG4gKiAyLiBBY2Nlc3MgZXhpc3Rpbmcgc2VjcmV0IHN0b3JhZ2UgYnkgcmVxdWVzdGluZyBwYXNzcGhyYXNlIGFuZCBhY2Nlc3NpbmdcbiAqICAgIGNyb3NzLXNpZ25pbmcga2V5cyBhcyBuZWVkZWQuXG4gKiAzLiBBbGwga2V5cyBhcmUgbG9hZGVkIGFuZCB0aGVyZSdzIG5vdGhpbmcgdG8gZG8uXG4gKlxuICogQWRkaXRpb25hbGx5LCB0aGUgc2VjcmV0IHN0b3JhZ2Uga2V5cyBhcmUgY2FjaGVkIGR1cmluZyB0aGUgc2NvcGUgb2YgdGhpcyBmdW5jdGlvblxuICogdG8gZW5zdXJlIHRoZSB1c2VyIGlzIHByb21wdGVkIG9ubHkgb25jZSBmb3IgdGhlaXIgc2VjcmV0IHN0b3JhZ2VcbiAqIHBhc3NwaHJhc2UuIFRoZSBjYWNoZSBpcyB0aGVuIGNsZWFyZWQgb25jZSB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gY29tcGxldGVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmdW5jXSBBbiBvcGVyYXRpb24gdG8gcGVyZm9ybSBvbmNlIHNlY3JldCBzdG9yYWdlIGhhcyBiZWVuXG4gKiBib290c3RyYXBwZWQuIE9wdGlvbmFsLlxuICogQHBhcmFtIHtib29sfSBbZm9yY2VSZXNldF0gUmVzZXQgc2VjcmV0IHN0b3JhZ2UgZXZlbiBpZiBpdCdzIGFscmVhZHkgc2V0IHVwXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhY2Nlc3NTZWNyZXRTdG9yYWdlKGZ1bmMgPSBhc3luYyAoKSA9PiB7IH0sIGZvcmNlUmVzZXQgPSBmYWxzZSkge1xuICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBzZWNyZXRTdG9yYWdlQmVpbmdBY2Nlc3NlZCA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKCFhd2FpdCBjbGkuaGFzU2VjcmV0U3RvcmFnZUtleSgpIHx8IGZvcmNlUmVzZXQpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgZGlhbG9nIGNhbGxzIGJvb3RzdHJhcCBpdHNlbGYgYWZ0ZXIgZ3VpZGluZyB0aGUgdXNlciB0aHJvdWdoXG4gICAgICAgICAgICAvLyBwYXNzcGhyYXNlIGNyZWF0aW9uLlxuICAgICAgICAgICAgY29uc3QgeyBmaW5pc2hlZCB9ID0gTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZ0FzeW5jKCdDcmVhdGUgU2VjcmV0IFN0b3JhZ2UgZGlhbG9nJywgJycsXG4gICAgICAgICAgICAgICAgaW1wb3J0KFwiLi9hc3luYy1jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZ1wiKSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGZvcmNlUmVzZXQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIC8qIHByaW9yaXR5ID0gKi8gZmFsc2UsXG4gICAgICAgICAgICAgICAgLyogc3RhdGljID0gKi8gdHJ1ZSxcbiAgICAgICAgICAgICAgICAvKiBvcHRpb25zID0gKi8ge1xuICAgICAgICAgICAgICAgICAgICBvbkJlZm9yZUNsb3NlOiBhc3luYyAocmVhc29uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBTZWN1cmUgQmFja3VwIGlzIHJlcXVpcmVkLCB5b3UgY2Fubm90IGxlYXZlIHRoZSBtb2RhbC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZWFzb24gPT09IFwiYmFja2dyb3VuZENsaWNrXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIWlzU2VjdXJlQmFja3VwUmVxdWlyZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgW2NvbmZpcm1lZF0gPSBhd2FpdCBmaW5pc2hlZDtcbiAgICAgICAgICAgIGlmICghY29uZmlybWVkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VjcmV0IHN0b3JhZ2UgY3JlYXRpb24gY2FuY2VsZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBJbnRlcmFjdGl2ZUF1dGhEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5JbnRlcmFjdGl2ZUF1dGhEaWFsb2dcIik7XG4gICAgICAgICAgICBhd2FpdCBjbGkuYm9vdHN0cmFwQ3Jvc3NTaWduaW5nKHtcbiAgICAgICAgICAgICAgICBhdXRoVXBsb2FkRGV2aWNlU2lnbmluZ0tleXM6IGFzeW5jIChtYWtlUmVxdWVzdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IGZpbmlzaGVkIH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0Nyb3NzLXNpZ25pbmcga2V5cyBkaWFsb2cnLCAnJywgSW50ZXJhY3RpdmVBdXRoRGlhbG9nLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIlNldHRpbmcgdXAga2V5c1wiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRyaXhDbGllbnQ6IGNsaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWtlUmVxdWVzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFtjb25maXJtZWRdID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29uZmlybWVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDcm9zcy1zaWduaW5nIGtleSB1cGxvYWQgYXV0aCBjYW5jZWxlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGF3YWl0IGNsaS5ib290c3RyYXBTZWNyZXRTdG9yYWdlKHtcbiAgICAgICAgICAgICAgICBnZXRLZXlCYWNrdXBQYXNzcGhyYXNlOiBwcm9tcHRGb3JCYWNrdXBQYXNzcGhyYXNlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGtleUlkID0gT2JqZWN0LmtleXMoc2VjcmV0U3RvcmFnZUtleXMpWzBdO1xuICAgICAgICAgICAgaWYgKGtleUlkICYmIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX2RlaHlkcmF0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGRlaHlkcmF0aW9uS2V5SW5mbyA9IHt9O1xuICAgICAgICAgICAgICAgIGlmIChzZWNyZXRTdG9yYWdlS2V5SW5mb1trZXlJZF0gJiYgc2VjcmV0U3RvcmFnZUtleUluZm9ba2V5SWRdLnBhc3NwaHJhc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVoeWRyYXRpb25LZXlJbmZvID0geyBwYXNzcGhyYXNlOiBzZWNyZXRTdG9yYWdlS2V5SW5mb1trZXlJZF0ucGFzc3BocmFzZSB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNldHRpbmcgZGVoeWRyYXRpb24ga2V5XCIpO1xuICAgICAgICAgICAgICAgIGF3YWl0IGNsaS5zZXREZWh5ZHJhdGlvbktleShzZWNyZXRTdG9yYWdlS2V5c1trZXlJZF0sIGRlaHlkcmF0aW9uS2V5SW5mbywgXCJCYWNrdXAgZGV2aWNlXCIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgha2V5SWQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJOb3Qgc2V0dGluZyBkZWh5ZHJhdGlvbiBrZXk6IG5vIFNTU1Mga2V5IGZvdW5kXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIk5vdCBzZXR0aW5nIGRlaHlkcmF0aW9uIGtleTogZmVhdHVyZSBkaXNhYmxlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGByZXR1cm4gYXdhaXRgIG5lZWRlZCBoZXJlIHRvIGVuc3VyZSBgZmluYWxseWAgYmxvY2sgcnVucyBhZnRlciB0aGVcbiAgICAgICAgLy8gaW5uZXIgb3BlcmF0aW9uIGNvbXBsZXRlcy5cbiAgICAgICAgcmV0dXJuIGF3YWl0IGZ1bmMoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIFNlY3VyaXR5Q3VzdG9taXNhdGlvbnMuY2F0Y2hBY2Nlc3NTZWNyZXRTdG9yYWdlRXJyb3I/LihlKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgLy8gUmUtdGhyb3cgc28gdGhhdCBoaWdoZXIgbGV2ZWwgbG9naWMgY2FuIGFib3J0IGFzIG5lZWRlZFxuICAgICAgICB0aHJvdyBlO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIC8vIENsZWFyIHNlY3JldCBzdG9yYWdlIGtleSBjYWNoZSBub3cgdGhhdCB3b3JrIGlzIGNvbXBsZXRlXG4gICAgICAgIHNlY3JldFN0b3JhZ2VCZWluZ0FjY2Vzc2VkID0gZmFsc2U7XG4gICAgICAgIGlmICghaXNDYWNoaW5nQWxsb3dlZCgpKSB7XG4gICAgICAgICAgICBzZWNyZXRTdG9yYWdlS2V5cyA9IHt9O1xuICAgICAgICAgICAgc2VjcmV0U3RvcmFnZUtleUluZm8gPSB7fTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLy8gRklYTUU6IHRoaXMgZnVuY3Rpb24gbmFtZSBpcyBhIGJpdCBvZiBhIG1vdXRoZnVsXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdHJ5VG9VbmxvY2tTZWNyZXRTdG9yYWdlV2l0aERlaHlkcmF0aW9uS2V5KFxuICAgIGNsaWVudDogTWF0cml4Q2xpZW50LFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qga2V5ID0gZGVoeWRyYXRpb25DYWNoZS5rZXk7XG4gICAgbGV0IHJlc3RvcmluZ0JhY2t1cCA9IGZhbHNlO1xuICAgIGlmIChrZXkgJiYgYXdhaXQgY2xpZW50LmlzU2VjcmV0U3RvcmFnZVJlYWR5KCkpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJUcnlpbmcgdG8gc2V0IHVwIGNyb3NzLXNpZ25pbmcgdXNpbmcgZGVoeWRyYXRpb24ga2V5XCIpO1xuICAgICAgICBzZWNyZXRTdG9yYWdlQmVpbmdBY2Nlc3NlZCA9IHRydWU7XG4gICAgICAgIG5vbkludGVyYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5jaGVja093bkNyb3NzU2lnbmluZ1RydXN0KCk7XG5cbiAgICAgICAgICAgIC8vIHdlIGFsc28gbmVlZCB0byBzZXQgYSBuZXcgZGVoeWRyYXRlZCBkZXZpY2UgdG8gcmVwbGFjZSB0aGVcbiAgICAgICAgICAgIC8vIGRldmljZSB3ZSByZWh5ZHJhdGVkXG4gICAgICAgICAgICBsZXQgZGVoeWRyYXRpb25LZXlJbmZvID0ge307XG4gICAgICAgICAgICBpZiAoZGVoeWRyYXRpb25DYWNoZS5rZXlJbmZvICYmIGRlaHlkcmF0aW9uQ2FjaGUua2V5SW5mby5wYXNzcGhyYXNlKSB7XG4gICAgICAgICAgICAgICAgZGVoeWRyYXRpb25LZXlJbmZvID0geyBwYXNzcGhyYXNlOiBkZWh5ZHJhdGlvbkNhY2hlLmtleUluZm8ucGFzc3BocmFzZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgY2xpZW50LnNldERlaHlkcmF0aW9uS2V5KGtleSwgZGVoeWRyYXRpb25LZXlJbmZvLCBcIkJhY2t1cCBkZXZpY2VcIik7XG5cbiAgICAgICAgICAgIC8vIGFuZCByZXN0b3JlIGZyb20gYmFja3VwXG4gICAgICAgICAgICBjb25zdCBiYWNrdXBJbmZvID0gYXdhaXQgY2xpZW50LmdldEtleUJhY2t1cFZlcnNpb24oKTtcbiAgICAgICAgICAgIGlmIChiYWNrdXBJbmZvKSB7XG4gICAgICAgICAgICAgICAgcmVzdG9yaW5nQmFja3VwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAvLyBkb24ndCBhd2FpdCwgYmVjYXVzZSB0aGlzIGNhbiB0YWtlIGEgbG9uZyB0aW1lXG4gICAgICAgICAgICAgICAgY2xpZW50LnJlc3RvcmVLZXlCYWNrdXBXaXRoU2VjcmV0U3RvcmFnZShiYWNrdXBJbmZvKVxuICAgICAgICAgICAgICAgICAgICAuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNyZXRTdG9yYWdlQmVpbmdBY2Nlc3NlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9uSW50ZXJhY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNDYWNoaW5nQWxsb3dlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VjcmV0U3RvcmFnZUtleXMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWNyZXRTdG9yYWdlS2V5SW5mbyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGRlaHlkcmF0aW9uQ2FjaGUgPSB7fTtcbiAgICAgICAgICAgIC8vIHRoZSBzZWNyZXQgc3RvcmFnZSBjYWNoZSBpcyBuZWVkZWQgZm9yIHJlc3RvcmluZyBmcm9tIGJhY2t1cCwgc29cbiAgICAgICAgICAgIC8vIGRvbid0IGNsZWFyIGl0IHlldCBpZiB3ZSdyZSByZXN0b3JpbmcgZnJvbSBiYWNrdXBcbiAgICAgICAgICAgIGlmICghcmVzdG9yaW5nQmFja3VwKSB7XG4gICAgICAgICAgICAgICAgc2VjcmV0U3RvcmFnZUJlaW5nQWNjZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBub25JbnRlcmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICghaXNDYWNoaW5nQWxsb3dlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlY3JldFN0b3JhZ2VLZXlzID0ge307XG4gICAgICAgICAgICAgICAgICAgIHNlY3JldFN0b3JhZ2VLZXlJbmZvID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19