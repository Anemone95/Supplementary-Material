"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hideToast = exports.showToast = exports.Kind = void 0;

var _Modal = _interopRequireDefault(require("../Modal"));

var sdk = _interopRequireWildcard(require("../index"));

var _languageHandler = require("../languageHandler");

var _DeviceListener = _interopRequireDefault(require("../DeviceListener"));

var _SetupEncryptionDialog = _interopRequireDefault(require("../components/views/dialogs/security/SetupEncryptionDialog"));

var _SecurityManager = require("../SecurityManager");

var _ToastStore = _interopRequireDefault(require("../stores/ToastStore"));

var _GenericToast = _interopRequireDefault(require("../components/views/toasts/GenericToast"));

var _Security = _interopRequireDefault(require("../customisations/Security"));

/*
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
const TOAST_KEY = "setupencryption";

const getTitle = (kind
/*: Kind*/
) => {
  switch (kind) {
    case Kind.SET_UP_ENCRYPTION:
      return (0, _languageHandler._t)("Set up Secure Backup");

    case Kind.UPGRADE_ENCRYPTION:
      return (0, _languageHandler._t)("Encryption upgrade available");

    case Kind.VERIFY_THIS_SESSION:
      return (0, _languageHandler._t)("Verify this session");
  }
};

const getIcon = (kind
/*: Kind*/
) => {
  switch (kind) {
    case Kind.SET_UP_ENCRYPTION:
    case Kind.UPGRADE_ENCRYPTION:
      return "secure_backup";

    case Kind.VERIFY_THIS_SESSION:
      return "verification_warning";
  }
};

const getSetupCaption = (kind
/*: Kind*/
) => {
  switch (kind) {
    case Kind.SET_UP_ENCRYPTION:
      return (0, _languageHandler._t)("Continue");

    case Kind.UPGRADE_ENCRYPTION:
      return (0, _languageHandler._t)("Upgrade");

    case Kind.VERIFY_THIS_SESSION:
      return (0, _languageHandler._t)("Verify");
  }
};

const getDescription = (kind
/*: Kind*/
) => {
  switch (kind) {
    case Kind.SET_UP_ENCRYPTION:
    case Kind.UPGRADE_ENCRYPTION:
      return (0, _languageHandler._t)("Safeguard against losing access to encrypted messages & data");

    case Kind.VERIFY_THIS_SESSION:
      return (0, _languageHandler._t)("Other users may not trust it");
  }
};

let Kind;
exports.Kind = Kind;

(function (Kind) {
  Kind["SET_UP_ENCRYPTION"] = "set_up_encryption";
  Kind["UPGRADE_ENCRYPTION"] = "upgrade_encryption";
  Kind["VERIFY_THIS_SESSION"] = "verify_this_session";
})(Kind || (exports.Kind = Kind = {}));

const onReject = () => {
  _DeviceListener.default.sharedInstance().dismissEncryptionSetup();
};

const showToast = (kind
/*: Kind*/
) => {
  if (_Security.default.setupEncryptionNeeded?.(kind)) {
    return;
  }

  const onAccept = async () => {
    if (kind === Kind.VERIFY_THIS_SESSION) {
      _Modal.default.createTrackedDialog("Verify session", "Verify session", _SetupEncryptionDialog.default, {}, null,
      /* priority = */
      false,
      /* static = */
      true);
    } else {
      const Spinner = sdk.getComponent("elements.Spinner");

      const modal = _Modal.default.createDialog(Spinner, null, "mx_Dialog_spinner",
      /* priority */
      false,
      /* static */
      true);

      try {
        await (0, _SecurityManager.accessSecretStorage)();
      } finally {
        modal.close();
      }
    }
  };

  _ToastStore.default.sharedInstance().addOrReplaceToast({
    key: TOAST_KEY,
    title: getTitle(kind),
    icon: getIcon(kind),
    props: {
      description: getDescription(kind),
      acceptLabel: getSetupCaption(kind),
      onAccept,
      rejectLabel: (0, _languageHandler._t)("Later"),
      onReject
    },
    component: _GenericToast.default,
    priority: kind === Kind.VERIFY_THIS_SESSION ? 95 : 40
  });
};

exports.showToast = showToast;

const hideToast = () => {
  _ToastStore.default.sharedInstance().dismissToast(TOAST_KEY);
};

exports.hideToast = hideToast;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90b2FzdHMvU2V0dXBFbmNyeXB0aW9uVG9hc3QudHMiXSwibmFtZXMiOlsiVE9BU1RfS0VZIiwiZ2V0VGl0bGUiLCJraW5kIiwiS2luZCIsIlNFVF9VUF9FTkNSWVBUSU9OIiwiVVBHUkFERV9FTkNSWVBUSU9OIiwiVkVSSUZZX1RISVNfU0VTU0lPTiIsImdldEljb24iLCJnZXRTZXR1cENhcHRpb24iLCJnZXREZXNjcmlwdGlvbiIsIm9uUmVqZWN0IiwiRGV2aWNlTGlzdGVuZXIiLCJzaGFyZWRJbnN0YW5jZSIsImRpc21pc3NFbmNyeXB0aW9uU2V0dXAiLCJzaG93VG9hc3QiLCJTZWN1cml0eUN1c3RvbWlzYXRpb25zIiwic2V0dXBFbmNyeXB0aW9uTmVlZGVkIiwib25BY2NlcHQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJTZXR1cEVuY3J5cHRpb25EaWFsb2ciLCJTcGlubmVyIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwibW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJjbG9zZSIsIlRvYXN0U3RvcmUiLCJhZGRPclJlcGxhY2VUb2FzdCIsImtleSIsInRpdGxlIiwiaWNvbiIsInByb3BzIiwiZGVzY3JpcHRpb24iLCJhY2NlcHRMYWJlbCIsInJlamVjdExhYmVsIiwiY29tcG9uZW50IiwiR2VuZXJpY1RvYXN0IiwicHJpb3JpdHkiLCJoaWRlVG9hc3QiLCJkaXNtaXNzVG9hc3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFZQSxNQUFNQSxTQUFTLEdBQUcsaUJBQWxCOztBQUVBLE1BQU1DLFFBQVEsR0FBRyxDQUFDQztBQUFEO0FBQUEsS0FBZ0I7QUFDN0IsVUFBUUEsSUFBUjtBQUNJLFNB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QUFDTixJQUFELENBRnpCO0FBR0hlLE1BQUFBLFFBSEc7QUFJSGtCLE1BQUFBLFdBQVcsRUFBRSx5QkFBRyxPQUFILENBSlY7QUFLSHpCLE1BQUFBO0FBTEcsS0FKbUM7QUFXMUMwQixJQUFBQSxTQUFTLEVBQUVDLHFCQVgrQjtBQVkxQ0MsSUFBQUEsUUFBUSxFQUFFcEMsSUFBSSxLQUFLQyxJQUFJLENBQUNHLG1CQUFkLEdBQW9DLEVBQXBDLEdBQXlDO0FBWlQsR0FBOUM7QUFjSCxDQXBDTTs7OztBQXNDQSxNQUFNaUMsU0FBUyxHQUFHLE1BQU07QUFDM0JaLHNCQUFXZixjQUFYLEdBQTRCNEIsWUFBNUIsQ0FBeUN4QyxTQUF6QztBQUNILENBRk0iLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG5odHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vTW9kYWxcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vaW5kZXhcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IERldmljZUxpc3RlbmVyIGZyb20gXCIuLi9EZXZpY2VMaXN0ZW5lclwiO1xuaW1wb3J0IFNldHVwRW5jcnlwdGlvbkRpYWxvZyBmcm9tIFwiLi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L1NldHVwRW5jcnlwdGlvbkRpYWxvZ1wiO1xuaW1wb3J0IHsgYWNjZXNzU2VjcmV0U3RvcmFnZSB9IGZyb20gXCIuLi9TZWN1cml0eU1hbmFnZXJcIjtcbmltcG9ydCBUb2FzdFN0b3JlIGZyb20gXCIuLi9zdG9yZXMvVG9hc3RTdG9yZVwiO1xuaW1wb3J0IEdlbmVyaWNUb2FzdCBmcm9tIFwiLi4vY29tcG9uZW50cy92aWV3cy90b2FzdHMvR2VuZXJpY1RvYXN0XCI7XG5pbXBvcnQgU2VjdXJpdHlDdXN0b21pc2F0aW9ucyBmcm9tIFwiLi4vY3VzdG9taXNhdGlvbnMvU2VjdXJpdHlcIjtcblxuY29uc3QgVE9BU1RfS0VZID0gXCJzZXR1cGVuY3J5cHRpb25cIjtcblxuY29uc3QgZ2V0VGl0bGUgPSAoa2luZDogS2luZCkgPT4ge1xuICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgICBjYXNlIEtpbmQuU0VUX1VQX0VOQ1JZUFRJT046XG4gICAgICAgICAgICByZXR1cm4gX3QoXCJTZXQgdXAgU2VjdXJlIEJhY2t1cFwiKTtcbiAgICAgICAgY2FzZSBLaW5kLlVQR1JBREVfRU5DUllQVElPTjpcbiAgICAgICAgICAgIHJldHVybiBfdChcIkVuY3J5cHRpb24gdXBncmFkZSBhdmFpbGFibGVcIik7XG4gICAgICAgIGNhc2UgS2luZC5WRVJJRllfVEhJU19TRVNTSU9OOlxuICAgICAgICAgICAgcmV0dXJuIF90KFwiVmVyaWZ5IHRoaXMgc2Vzc2lvblwiKTtcbiAgICB9XG59O1xuXG5jb25zdCBnZXRJY29uID0gKGtpbmQ6IEtpbmQpID0+IHtcbiAgICBzd2l0Y2ggKGtpbmQpIHtcbiAgICAgICAgY2FzZSBLaW5kLlNFVF9VUF9FTkNSWVBUSU9OOlxuICAgICAgICBjYXNlIEtpbmQuVVBHUkFERV9FTkNSWVBUSU9OOlxuICAgICAgICAgICAgcmV0dXJuIFwic2VjdXJlX2JhY2t1cFwiO1xuICAgICAgICBjYXNlIEtpbmQuVkVSSUZZX1RISVNfU0VTU0lPTjpcbiAgICAgICAgICAgIHJldHVybiBcInZlcmlmaWNhdGlvbl93YXJuaW5nXCI7XG4gICAgfVxufTtcblxuY29uc3QgZ2V0U2V0dXBDYXB0aW9uID0gKGtpbmQ6IEtpbmQpID0+IHtcbiAgICBzd2l0Y2ggKGtpbmQpIHtcbiAgICAgICAgY2FzZSBLaW5kLlNFVF9VUF9FTkNSWVBUSU9OOlxuICAgICAgICAgICAgcmV0dXJuIF90KFwiQ29udGludWVcIik7XG4gICAgICAgIGNhc2UgS2luZC5VUEdSQURFX0VOQ1JZUFRJT046XG4gICAgICAgICAgICByZXR1cm4gX3QoXCJVcGdyYWRlXCIpO1xuICAgICAgICBjYXNlIEtpbmQuVkVSSUZZX1RISVNfU0VTU0lPTjpcbiAgICAgICAgICAgIHJldHVybiBfdChcIlZlcmlmeVwiKTtcbiAgICB9XG59O1xuXG5jb25zdCBnZXREZXNjcmlwdGlvbiA9IChraW5kOiBLaW5kKSA9PiB7XG4gICAgc3dpdGNoIChraW5kKSB7XG4gICAgICAgIGNhc2UgS2luZC5TRVRfVVBfRU5DUllQVElPTjpcbiAgICAgICAgY2FzZSBLaW5kLlVQR1JBREVfRU5DUllQVElPTjpcbiAgICAgICAgICAgIHJldHVybiBfdChcIlNhZmVndWFyZCBhZ2FpbnN0IGxvc2luZyBhY2Nlc3MgdG8gZW5jcnlwdGVkIG1lc3NhZ2VzICYgZGF0YVwiKTtcbiAgICAgICAgY2FzZSBLaW5kLlZFUklGWV9USElTX1NFU1NJT046XG4gICAgICAgICAgICByZXR1cm4gX3QoXCJPdGhlciB1c2VycyBtYXkgbm90IHRydXN0IGl0XCIpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBlbnVtIEtpbmQge1xuICAgIFNFVF9VUF9FTkNSWVBUSU9OID0gXCJzZXRfdXBfZW5jcnlwdGlvblwiLFxuICAgIFVQR1JBREVfRU5DUllQVElPTiA9IFwidXBncmFkZV9lbmNyeXB0aW9uXCIsXG4gICAgVkVSSUZZX1RISVNfU0VTU0lPTiA9IFwidmVyaWZ5X3RoaXNfc2Vzc2lvblwiLFxufVxuXG5jb25zdCBvblJlamVjdCA9ICgpID0+IHtcbiAgICBEZXZpY2VMaXN0ZW5lci5zaGFyZWRJbnN0YW5jZSgpLmRpc21pc3NFbmNyeXB0aW9uU2V0dXAoKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzaG93VG9hc3QgPSAoa2luZDogS2luZCkgPT4ge1xuICAgIGlmIChTZWN1cml0eUN1c3RvbWlzYXRpb25zLnNldHVwRW5jcnlwdGlvbk5lZWRlZD8uKGtpbmQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvbkFjY2VwdCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKGtpbmQgPT09IEtpbmQuVkVSSUZZX1RISVNfU0VTU0lPTikge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhcIlZlcmlmeSBzZXNzaW9uXCIsIFwiVmVyaWZ5IHNlc3Npb25cIiwgU2V0dXBFbmNyeXB0aW9uRGlhbG9nLFxuICAgICAgICAgICAgICAgIHt9LCBudWxsLCAvKiBwcmlvcml0eSA9ICovIGZhbHNlLCAvKiBzdGF0aWMgPSAqLyB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuU3Bpbm5lclwiKTtcbiAgICAgICAgICAgIGNvbnN0IG1vZGFsID0gTW9kYWwuY3JlYXRlRGlhbG9nKFxuICAgICAgICAgICAgICAgIFNwaW5uZXIsIG51bGwsIFwibXhfRGlhbG9nX3NwaW5uZXJcIiwgLyogcHJpb3JpdHkgKi8gZmFsc2UsIC8qIHN0YXRpYyAqLyB0cnVlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgYWNjZXNzU2VjcmV0U3RvcmFnZSgpO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBtb2RhbC5jbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5hZGRPclJlcGxhY2VUb2FzdCh7XG4gICAgICAgIGtleTogVE9BU1RfS0VZLFxuICAgICAgICB0aXRsZTogZ2V0VGl0bGUoa2luZCksXG4gICAgICAgIGljb246IGdldEljb24oa2luZCksXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZ2V0RGVzY3JpcHRpb24oa2luZCksXG4gICAgICAgICAgICBhY2NlcHRMYWJlbDogZ2V0U2V0dXBDYXB0aW9uKGtpbmQpLFxuICAgICAgICAgICAgb25BY2NlcHQsXG4gICAgICAgICAgICByZWplY3RMYWJlbDogX3QoXCJMYXRlclwiKSxcbiAgICAgICAgICAgIG9uUmVqZWN0LFxuICAgICAgICB9LFxuICAgICAgICBjb21wb25lbnQ6IEdlbmVyaWNUb2FzdCxcbiAgICAgICAgcHJpb3JpdHk6IGtpbmQgPT09IEtpbmQuVkVSSUZZX1RISVNfU0VTU0lPTiA/IDk1IDogNDAsXG4gICAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgaGlkZVRvYXN0ID0gKCkgPT4ge1xuICAgIFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5kaXNtaXNzVG9hc3QoVE9BU1RfS0VZKTtcbn07XG4iXX0=