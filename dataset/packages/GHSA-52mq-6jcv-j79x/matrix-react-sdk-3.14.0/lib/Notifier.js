"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Notifier = void 0;

var _MatrixClientPeg = require("./MatrixClientPeg");

var _SdkConfig = _interopRequireDefault(require("./SdkConfig"));

var _PlatformPeg = _interopRequireDefault(require("./PlatformPeg"));

var TextForEvent = _interopRequireWildcard(require("./TextForEvent"));

var _Analytics = _interopRequireDefault(require("./Analytics"));

var Avatar = _interopRequireWildcard(require("./Avatar"));

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var sdk = _interopRequireWildcard(require("./index"));

var _languageHandler = require("./languageHandler");

var _Modal = _interopRequireDefault(require("./Modal"));

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _DesktopNotificationsToast = require("./toasts/DesktopNotificationsToast");

var _SettingLevel = require("./settings/SettingLevel");

var _NotificationControllers = require("./settings/controllers/NotificationControllers");

var _RoomViewStore = _interopRequireDefault(require("./stores/RoomViewStore"));

var _UserActivity = _interopRequireDefault(require("./UserActivity"));

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2017 New Vector Ltd
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

/*
 * Dispatches:
 * {
 *   action: "notifier_enabled",
 *   value: boolean
 * }
 */
const MAX_PENDING_ENCRYPTED = 20;
/*
Override both the content body and the TextForEvent handler for specific msgtypes, in notifications.
This is useful when the content body contains fallback text that would explain that the client can't handle a particular
type of tile.
*/

const typehandlers = {
  "m.key.verification.request": event => {
    const name = (event.sender || {}).name;
    return (0, _languageHandler._t)("%(name)s is requesting verification", {
      name
    });
  }
};
const Notifier = {
  notifsByRoom: {},
  // A list of event IDs that we've received but need to wait until
  // they're decrypted until we decide whether to notify for them
  // or not
  pendingEncryptedEventIds: [],
  notificationMessageForEvent: function (ev
  /*: MatrixEvent*/
  ) {
    if (typehandlers.hasOwnProperty(ev.getContent().msgtype)) {
      return typehandlers[ev.getContent().msgtype](ev);
    }

    return TextForEvent.textForEvent(ev);
  },
  _displayPopupNotification: function (ev
  /*: MatrixEvent*/
  , room
  /*: Room*/
  ) {
    const plaf = _PlatformPeg.default.get();

    if (!plaf) {
      return;
    }

    if (!plaf.supportsNotifications() || !plaf.maySendNotifications()) {
      return;
    }

    if (global.document.hasFocus()) {
      return;
    }

    let msg = this.notificationMessageForEvent(ev);
    if (!msg) return;
    let title;

    if (!ev.sender || room.name === ev.sender.name) {
      title = room.name; // notificationMessageForEvent includes sender,
      // but we already have the sender here

      if (ev.getContent().body && !typehandlers.hasOwnProperty(ev.getContent().msgtype)) {
        msg = ev.getContent().body;
      }
    } else if (ev.getType() === 'm.room.member') {
      // context is all in the message here, we don't need
      // to display sender info
      title = room.name;
    } else if (ev.sender) {
      title = ev.sender.name + " (" + room.name + ")"; // notificationMessageForEvent includes sender,
      // but we've just out sender in the title

      if (ev.getContent().body && !typehandlers.hasOwnProperty(ev.getContent().msgtype)) {
        msg = ev.getContent().body;
      }
    }

    if (!this.isBodyEnabled()) {
      msg = '';
    }

    let avatarUrl = null;

    if (ev.sender && !_SettingsStore.default.getValue("lowBandwidth")) {
      avatarUrl = Avatar.avatarUrlForMember(ev.sender, 40, 40, 'crop');
    }

    const notif = plaf.displayNotification(title, msg, avatarUrl, room); // if displayNotification returns non-null,  the platform supports
    // clearing notifications later, so keep track of this.

    if (notif) {
      if (this.notifsByRoom[ev.getRoomId()] === undefined) this.notifsByRoom[ev.getRoomId()] = [];
      this.notifsByRoom[ev.getRoomId()].push(notif);
    }
  },
  getSoundForRoom: function (roomId
  /*: string*/
  ) {
    // We do no caching here because the SDK caches setting
    // and the browser will cache the sound.
    const content = _SettingsStore.default.getValue("notificationSound", roomId);

    if (!content) {
      return null;
    }

    if (!content.url) {
      console.warn(`${roomId} has custom notification sound event, but no url key`);
      return null;
    }

    if (!content.url.startsWith("mxc://")) {
      console.warn(`${roomId} has custom notification sound event, but url is not a mxc url`);
      return null;
    } // Ideally in here we could use MSC1310 to detect the type of file, and reject it.


    return {
      url: _MatrixClientPeg.MatrixClientPeg.get().mxcUrlToHttp(content.url),
      name: content.name,
      type: content.type,
      size: content.size
    };
  },
  _playAudioNotification: async function (ev
  /*: MatrixEvent*/
  , room
  /*: Room*/
  ) {
    const sound = this.getSoundForRoom(room.roomId);
    console.log(`Got sound ${sound && sound.name || "default"} for ${room.roomId}`);

    try {
      const selector = document.querySelector(sound ? `audio[src='${sound.url}']` : "#messageAudio");
      let audioElement = selector;

      if (!selector) {
        if (!sound) {
          console.error("No audio element or sound to play for notification");
          return;
        }

        audioElement = new Audio(sound.url);

        if (sound.type) {
          audioElement.type = sound.type;
        }

        document.body.appendChild(audioElement);
      }

      await audioElement.play();
    } catch (ex) {
      console.warn("Caught error when trying to fetch room notification sound:", ex);
    }
  },
  start: function () {
    // do not re-bind in the case of repeated call
    this.boundOnEvent = this.boundOnEvent || this.onEvent.bind(this);
    this.boundOnSyncStateChange = this.boundOnSyncStateChange || this.onSyncStateChange.bind(this);
    this.boundOnRoomReceipt = this.boundOnRoomReceipt || this.onRoomReceipt.bind(this);
    this.boundOnEventDecrypted = this.boundOnEventDecrypted || this.onEventDecrypted.bind(this);

    _MatrixClientPeg.MatrixClientPeg.get().on('event', this.boundOnEvent);

    _MatrixClientPeg.MatrixClientPeg.get().on('Room.receipt', this.boundOnRoomReceipt);

    _MatrixClientPeg.MatrixClientPeg.get().on('Event.decrypted', this.boundOnEventDecrypted);

    _MatrixClientPeg.MatrixClientPeg.get().on("sync", this.boundOnSyncStateChange);

    this.toolbarHidden = false;
    this.isSyncing = false;
  },
  stop: function () {
    if (_MatrixClientPeg.MatrixClientPeg.get()) {
      _MatrixClientPeg.MatrixClientPeg.get().removeListener('Event', this.boundOnEvent);

      _MatrixClientPeg.MatrixClientPeg.get().removeListener('Room.receipt', this.boundOnRoomReceipt);

      _MatrixClientPeg.MatrixClientPeg.get().removeListener('Event.decrypted', this.boundOnEventDecrypted);

      _MatrixClientPeg.MatrixClientPeg.get().removeListener('sync', this.boundOnSyncStateChange);
    }

    this.isSyncing = false;
  },
  supportsDesktopNotifications: function () {
    const plaf = _PlatformPeg.default.get();

    return plaf && plaf.supportsNotifications();
  },
  setEnabled: function (enable
  /*: boolean*/
  , callback
  /*: () => void*/
  ) {
    const plaf = _PlatformPeg.default.get();

    if (!plaf) return; // Dev note: We don't set the "notificationsEnabled" setting to true here because it is a
    // calculated value. It is determined based upon whether or not the master rule is enabled
    // and other flags. Setting it here would cause a circular reference.

    _Analytics.default.trackEvent('Notifier', 'Set Enabled', String(enable)); // make sure that we persist the current setting audio_enabled setting
    // before changing anything


    if (_SettingsStore.default.isLevelSupported(_SettingLevel.SettingLevel.DEVICE)) {
      _SettingsStore.default.setValue("audioNotificationsEnabled", null, _SettingLevel.SettingLevel.DEVICE, this.isEnabled());
    }

    if (enable) {
      // Attempt to get permission from user
      plaf.requestNotificationPermission().then(result => {
        if (result !== 'granted') {
          // The permission request was dismissed or denied
          // TODO: Support alternative branding in messaging
          const brand = _SdkConfig.default.get().brand;

          const description = result === 'denied' ? (0, _languageHandler._t)('%(brand)s does not have permission to send you notifications - ' + 'please check your browser settings', {
            brand
          }) : (0, _languageHandler._t)('%(brand)s was not given permission to send notifications - please try again', {
            brand
          });
          const ErrorDialog = sdk.getComponent('dialogs.ErrorDialog');

          _Modal.default.createTrackedDialog('Unable to enable Notifications', result, ErrorDialog, {
            title: (0, _languageHandler._t)('Unable to enable Notifications'),
            description
          });

          return;
        }

        if (callback) callback();

        _dispatcher.default.dispatch({
          action: "notifier_enabled",
          value: true
        });
      });
    } else {
      _dispatcher.default.dispatch({
        action: "notifier_enabled",
        value: false
      });
    } // set the notifications_hidden flag, as the user has knowingly interacted
    // with the setting we shouldn't nag them any further


    this.setPromptHidden(true);
  },
  isEnabled: function () {
    return this.isPossible() && _SettingsStore.default.getValue("notificationsEnabled");
  },
  isPossible: function () {
    const plaf = _PlatformPeg.default.get();

    if (!plaf) return false;
    if (!plaf.supportsNotifications()) return false;
    if (!plaf.maySendNotifications()) return false;
    return true; // possible, but not necessarily enabled
  },
  isBodyEnabled: function () {
    return this.isEnabled() && _SettingsStore.default.getValue("notificationBodyEnabled");
  },
  isAudioEnabled: function () {
    // We don't route Audio via the HTML Notifications API so it is possible regardless of other things
    return _SettingsStore.default.getValue("audioNotificationsEnabled");
  },
  setPromptHidden: function (hidden
  /*: boolean*/
  , persistent = true) {
    this.toolbarHidden = hidden;

    _Analytics.default.trackEvent('Notifier', 'Set Toolbar Hidden', String(hidden));

    (0, _DesktopNotificationsToast.hideToast)(); // update the info to localStorage for persistent settings

    if (persistent && global.localStorage) {
      global.localStorage.setItem("notifications_hidden", String(hidden));
    }
  },
  shouldShowPrompt: function () {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (!client) {
      return false;
    }

    const isGuest = client.isGuest();
    return !isGuest && this.supportsDesktopNotifications() && !(0, _NotificationControllers.isPushNotifyDisabled)() && !this.isEnabled() && !this._isPromptHidden();
  },
  _isPromptHidden: function () {
    // Check localStorage for any such meta data
    if (global.localStorage) {
      return global.localStorage.getItem("notifications_hidden") === "true";
    }

    return this.toolbarHidden;
  },
  onSyncStateChange: function (state
  /*: string*/
  ) {
    if (state === "SYNCING") {
      this.isSyncing = true;
    } else if (state === "STOPPED" || state === "ERROR") {
      this.isSyncing = false;
    }
  },
  onEvent: function (ev
  /*: MatrixEvent*/
  ) {
    if (!this.isSyncing) return; // don't alert for any messages initially

    if (ev.sender && ev.sender.userId === _MatrixClientPeg.MatrixClientPeg.get().credentials.userId) return; // If it's an encrypted event and the type is still 'm.room.encrypted',
    // it hasn't yet been decrypted, so wait until it is.

    if (ev.isBeingDecrypted() || ev.isDecryptionFailure()) {
      this.pendingEncryptedEventIds.push(ev.getId()); // don't let the list fill up indefinitely

      while (this.pendingEncryptedEventIds.length > MAX_PENDING_ENCRYPTED) {
        this.pendingEncryptedEventIds.shift();
      }

      return;
    }

    this._evaluateEvent(ev);
  },
  onEventDecrypted: function (ev
  /*: MatrixEvent*/
  ) {
    // 'decrypted' means the decryption process has finished: it may have failed,
    // in which case it might decrypt soon if the keys arrive
    if (ev.isDecryptionFailure()) return;
    const idx = this.pendingEncryptedEventIds.indexOf(ev.getId());
    if (idx === -1) return;
    this.pendingEncryptedEventIds.splice(idx, 1);

    this._evaluateEvent(ev);
  },
  onRoomReceipt: function (ev
  /*: MatrixEvent*/
  , room
  /*: Room*/
  ) {
    if (room.getUnreadNotificationCount() === 0) {
      // ideally we would clear each notification when it was read,
      // but we have no way, given a read receipt, to know whether
      // the receipt comes before or after an event, so we can't
      // do this. Instead, clear all notifications for a room once
      // there are no notifs left in that room., which is not quite
      // as good but it's something.
      const plaf = _PlatformPeg.default.get();

      if (!plaf) return;
      if (this.notifsByRoom[room.roomId] === undefined) return;

      for (const notif of this.notifsByRoom[room.roomId]) {
        plaf.clearNotification(notif);
      }

      delete this.notifsByRoom[room.roomId];
    }
  },
  _evaluateEvent: function (ev) {
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(ev.getRoomId());

    const actions = _MatrixClientPeg.MatrixClientPeg.get().getPushActionsForEvent(ev);

    if (actions && actions.notify) {
      if (_RoomViewStore.default.getRoomId() === room.roomId && _UserActivity.default.sharedInstance().userActiveRecently()) {
        // don't bother notifying as user was recently active in this room
        return;
      }

      if (this.isEnabled()) {
        this._displayPopupNotification(ev, room);
      }

      if (actions.tweaks.sound && this.isAudioEnabled()) {
        _PlatformPeg.default.get().loudNotification(ev, room);

        this._playAudioNotification(ev, room);
      }
    }
  }
};
exports.Notifier = Notifier;

if (!window.mxNotifier) {
  window.mxNotifier = Notifier;
}

var _default = window.mxNotifier;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Ob3RpZmllci50cyJdLCJuYW1lcyI6WyJNQVhfUEVORElOR19FTkNSWVBURUQiLCJ0eXBlaGFuZGxlcnMiLCJldmVudCIsIm5hbWUiLCJzZW5kZXIiLCJOb3RpZmllciIsIm5vdGlmc0J5Um9vbSIsInBlbmRpbmdFbmNyeXB0ZWRFdmVudElkcyIsIm5vdGlmaWNhdGlvbk1lc3NhZ2VGb3JFdmVudCIsImV2IiwiaGFzT3duUHJvcGVydHkiLCJnZXRDb250ZW50IiwibXNndHlwZSIsIlRleHRGb3JFdmVudCIsInRleHRGb3JFdmVudCIsIl9kaXNwbGF5UG9wdXBOb3RpZmljYXRpb24iLCJyb29tIiwicGxhZiIsIlBsYXRmb3JtUGVnIiwiZ2V0Iiwic3VwcG9ydHNOb3RpZmljYXRpb25zIiwibWF5U2VuZE5vdGlmaWNhdGlvbnMiLCJnbG9iYWwiLCJkb2N1bWVudCIsImhhc0ZvY3VzIiwibXNnIiwidGl0bGUiLCJib2R5IiwiZ2V0VHlwZSIsImlzQm9keUVuYWJsZWQiLCJhdmF0YXJVcmwiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJBdmF0YXIiLCJhdmF0YXJVcmxGb3JNZW1iZXIiLCJub3RpZiIsImRpc3BsYXlOb3RpZmljYXRpb24iLCJnZXRSb29tSWQiLCJ1bmRlZmluZWQiLCJwdXNoIiwiZ2V0U291bmRGb3JSb29tIiwicm9vbUlkIiwiY29udGVudCIsInVybCIsImNvbnNvbGUiLCJ3YXJuIiwic3RhcnRzV2l0aCIsIk1hdHJpeENsaWVudFBlZyIsIm14Y1VybFRvSHR0cCIsInR5cGUiLCJzaXplIiwiX3BsYXlBdWRpb05vdGlmaWNhdGlvbiIsInNvdW5kIiwibG9nIiwic2VsZWN0b3IiLCJxdWVyeVNlbGVjdG9yIiwiYXVkaW9FbGVtZW50IiwiZXJyb3IiLCJBdWRpbyIsImFwcGVuZENoaWxkIiwicGxheSIsImV4Iiwic3RhcnQiLCJib3VuZE9uRXZlbnQiLCJvbkV2ZW50IiwiYmluZCIsImJvdW5kT25TeW5jU3RhdGVDaGFuZ2UiLCJvblN5bmNTdGF0ZUNoYW5nZSIsImJvdW5kT25Sb29tUmVjZWlwdCIsIm9uUm9vbVJlY2VpcHQiLCJib3VuZE9uRXZlbnREZWNyeXB0ZWQiLCJvbkV2ZW50RGVjcnlwdGVkIiwib24iLCJ0b29sYmFySGlkZGVuIiwiaXNTeW5jaW5nIiwic3RvcCIsInJlbW92ZUxpc3RlbmVyIiwic3VwcG9ydHNEZXNrdG9wTm90aWZpY2F0aW9ucyIsInNldEVuYWJsZWQiLCJlbmFibGUiLCJjYWxsYmFjayIsIkFuYWx5dGljcyIsInRyYWNrRXZlbnQiLCJTdHJpbmciLCJpc0xldmVsU3VwcG9ydGVkIiwiU2V0dGluZ0xldmVsIiwiREVWSUNFIiwic2V0VmFsdWUiLCJpc0VuYWJsZWQiLCJyZXF1ZXN0Tm90aWZpY2F0aW9uUGVybWlzc2lvbiIsInRoZW4iLCJyZXN1bHQiLCJicmFuZCIsIlNka0NvbmZpZyIsImRlc2NyaXB0aW9uIiwiRXJyb3JEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInZhbHVlIiwic2V0UHJvbXB0SGlkZGVuIiwiaXNQb3NzaWJsZSIsImlzQXVkaW9FbmFibGVkIiwiaGlkZGVuIiwicGVyc2lzdGVudCIsImxvY2FsU3RvcmFnZSIsInNldEl0ZW0iLCJzaG91bGRTaG93UHJvbXB0IiwiY2xpZW50IiwiaXNHdWVzdCIsIl9pc1Byb21wdEhpZGRlbiIsImdldEl0ZW0iLCJzdGF0ZSIsInVzZXJJZCIsImNyZWRlbnRpYWxzIiwiaXNCZWluZ0RlY3J5cHRlZCIsImlzRGVjcnlwdGlvbkZhaWx1cmUiLCJnZXRJZCIsImxlbmd0aCIsInNoaWZ0IiwiX2V2YWx1YXRlRXZlbnQiLCJpZHgiLCJpbmRleE9mIiwic3BsaWNlIiwiZ2V0VW5yZWFkTm90aWZpY2F0aW9uQ291bnQiLCJjbGVhck5vdGlmaWNhdGlvbiIsImdldFJvb20iLCJhY3Rpb25zIiwiZ2V0UHVzaEFjdGlvbnNGb3JFdmVudCIsIm5vdGlmeSIsIlJvb21WaWV3U3RvcmUiLCJVc2VyQWN0aXZpdHkiLCJzaGFyZWRJbnN0YW5jZSIsInVzZXJBY3RpdmVSZWNlbnRseSIsInR3ZWFrcyIsImxvdWROb3RpZmljYXRpb24iLCJ3aW5kb3ciLCJteE5vdGlmaWVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQXNCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLE1BQU1BLHFCQUFxQixHQUFHLEVBQTlCO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFDQSxNQUFNQyxZQUFZLEdBQUc7QUFDakIsZ0NBQStCQyxLQUFELElBQVc7QUFDckMsVUFBTUMsSUFBSSxHQUFHLENBQUNELEtBQUssQ0FBQ0UsTUFBTixJQUFnQixFQUFqQixFQUFxQkQsSUFBbEM7QUFDQSxXQUFPLHlCQUFHLHFDQUFILEVBQTBDO0FBQUVBLE1BQUFBO0FBQUYsS0FBMUMsQ0FBUDtBQUNIO0FBSmdCLENBQXJCO0FBT08sTUFBTUUsUUFBUSxHQUFHO0FBQ3BCQyxFQUFBQSxZQUFZLEVBQUUsRUFETTtBQUdwQjtBQUNBO0FBQ0E7QUFDQUMsRUFBQUEsd0JBQXdCLEVBQUUsRUFOTjtBQVFwQkMsRUFBQUEsMkJBQTJCLEVBQUUsVUFBU0M7QUFBVDtBQUFBLElBQTBCO0FBQ25ELFFBQUlSLFlBQVksQ0FBQ1MsY0FBYixDQUE0QkQsRUFBRSxDQUFDRSxVQUFILEdBQWdCQyxPQUE1QyxDQUFKLEVBQTBEO0FBQ3RELGFBQU9YLFlBQVksQ0FBQ1EsRUFBRSxDQUFDRSxVQUFILEdBQWdCQyxPQUFqQixDQUFaLENBQXNDSCxFQUF0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LEVBQStCO0FBQzNCLFVBQUlDLHVCQUFjakcsU0FBZCxPQUE4QnJCLElBQUksQ0FBQ3lCLE1BQW5DLElBQTZDOEYsc0JBQWFDLGNBQWIsR0FBOEJDLGtCQUE5QixFQUFqRCxFQUFxRztBQUNqRztBQUNBO0FBQ0g7O0FBRUQsVUFBSSxLQUFLakQsU0FBTCxFQUFKLEVBQXNCO0FBQ2xCLGFBQUt6RSx5QkFBTCxDQUErQk4sRUFBL0IsRUFBbUNPLElBQW5DO0FBQ0g7O0FBQ0QsVUFBSW1ILE9BQU8sQ0FBQ08sTUFBUixDQUFldEYsS0FBZixJQUF3QixLQUFLc0QsY0FBTCxFQUE1QixFQUFtRDtBQUMvQ3hGLDZCQUFZQyxHQUFaLEdBQWtCd0gsZ0JBQWxCLENBQW1DbEksRUFBbkMsRUFBdUNPLElBQXZDOztBQUNBLGFBQUttQyxzQkFBTCxDQUE0QjFDLEVBQTVCLEVBQWdDTyxJQUFoQztBQUNIO0FBQ0o7QUFDSjtBQTVVbUIsQ0FBakI7OztBQStVUCxJQUFJLENBQUM0SCxNQUFNLENBQUNDLFVBQVosRUFBd0I7QUFDcEJELEVBQUFBLE1BQU0sQ0FBQ0MsVUFBUCxHQUFvQnhJLFFBQXBCO0FBQ0g7O2VBRWN1SSxNQUFNLENBQUNDLFUiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5Db3B5cmlnaHQgMjAxNyBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tICcuL1Nka0NvbmZpZyc7XG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSAnLi9QbGF0Zm9ybVBlZyc7XG5pbXBvcnQgKiBhcyBUZXh0Rm9yRXZlbnQgZnJvbSAnLi9UZXh0Rm9yRXZlbnQnO1xuaW1wb3J0IEFuYWx5dGljcyBmcm9tICcuL0FuYWx5dGljcyc7XG5pbXBvcnQgKiBhcyBBdmF0YXIgZnJvbSAnLi9BdmF0YXInO1xuaW1wb3J0IGRpcyBmcm9tICcuL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBNb2RhbCBmcm9tICcuL01vZGFsJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IGhpZGVUb2FzdCBhcyBoaWRlTm90aWZpY2F0aW9uc1RvYXN0IH0gZnJvbSBcIi4vdG9hc3RzL0Rlc2t0b3BOb3RpZmljYXRpb25zVG9hc3RcIjtcbmltcG9ydCB7U2V0dGluZ0xldmVsfSBmcm9tIFwiLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCB7aXNQdXNoTm90aWZ5RGlzYWJsZWR9IGZyb20gXCIuL3NldHRpbmdzL2NvbnRyb2xsZXJzL05vdGlmaWNhdGlvbkNvbnRyb2xsZXJzXCI7XG5pbXBvcnQgUm9vbVZpZXdTdG9yZSBmcm9tIFwiLi9zdG9yZXMvUm9vbVZpZXdTdG9yZVwiO1xuaW1wb3J0IFVzZXJBY3Rpdml0eSBmcm9tIFwiLi9Vc2VyQWN0aXZpdHlcIjtcblxuLypcbiAqIERpc3BhdGNoZXM6XG4gKiB7XG4gKiAgIGFjdGlvbjogXCJub3RpZmllcl9lbmFibGVkXCIsXG4gKiAgIHZhbHVlOiBib29sZWFuXG4gKiB9XG4gKi9cblxuY29uc3QgTUFYX1BFTkRJTkdfRU5DUllQVEVEID0gMjA7XG5cbi8qXG5PdmVycmlkZSBib3RoIHRoZSBjb250ZW50IGJvZHkgYW5kIHRoZSBUZXh0Rm9yRXZlbnQgaGFuZGxlciBmb3Igc3BlY2lmaWMgbXNndHlwZXMsIGluIG5vdGlmaWNhdGlvbnMuXG5UaGlzIGlzIHVzZWZ1bCB3aGVuIHRoZSBjb250ZW50IGJvZHkgY29udGFpbnMgZmFsbGJhY2sgdGV4dCB0aGF0IHdvdWxkIGV4cGxhaW4gdGhhdCB0aGUgY2xpZW50IGNhbid0IGhhbmRsZSBhIHBhcnRpY3VsYXJcbnR5cGUgb2YgdGlsZS5cbiovXG5jb25zdCB0eXBlaGFuZGxlcnMgPSB7XG4gICAgXCJtLmtleS52ZXJpZmljYXRpb24ucmVxdWVzdFwiOiAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IChldmVudC5zZW5kZXIgfHwge30pLm5hbWU7XG4gICAgICAgIHJldHVybiBfdChcIiUobmFtZSlzIGlzIHJlcXVlc3RpbmcgdmVyaWZpY2F0aW9uXCIsIHsgbmFtZSB9KTtcbiAgICB9LFxufTtcblxuZXhwb3J0IGNvbnN0IE5vdGlmaWVyID0ge1xuICAgIG5vdGlmc0J5Um9vbToge30sXG5cbiAgICAvLyBBIGxpc3Qgb2YgZXZlbnQgSURzIHRoYXQgd2UndmUgcmVjZWl2ZWQgYnV0IG5lZWQgdG8gd2FpdCB1bnRpbFxuICAgIC8vIHRoZXkncmUgZGVjcnlwdGVkIHVudGlsIHdlIGRlY2lkZSB3aGV0aGVyIHRvIG5vdGlmeSBmb3IgdGhlbVxuICAgIC8vIG9yIG5vdFxuICAgIHBlbmRpbmdFbmNyeXB0ZWRFdmVudElkczogW10sXG5cbiAgICBub3RpZmljYXRpb25NZXNzYWdlRm9yRXZlbnQ6IGZ1bmN0aW9uKGV2OiBNYXRyaXhFdmVudCkge1xuICAgICAgICBpZiAodHlwZWhhbmRsZXJzLmhhc093blByb3BlcnR5KGV2LmdldENvbnRlbnQoKS5tc2d0eXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVoYW5kbGVyc1tldi5nZXRDb250ZW50KCkubXNndHlwZV0oZXYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBUZXh0Rm9yRXZlbnQudGV4dEZvckV2ZW50KGV2KTtcbiAgICB9LFxuXG4gICAgX2Rpc3BsYXlQb3B1cE5vdGlmaWNhdGlvbjogZnVuY3Rpb24oZXY6IE1hdHJpeEV2ZW50LCByb29tOiBSb29tKSB7XG4gICAgICAgIGNvbnN0IHBsYWYgPSBQbGF0Zm9ybVBlZy5nZXQoKTtcbiAgICAgICAgaWYgKCFwbGFmKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFwbGFmLnN1cHBvcnRzTm90aWZpY2F0aW9ucygpIHx8ICFwbGFmLm1heVNlbmROb3RpZmljYXRpb25zKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2xvYmFsLmRvY3VtZW50Lmhhc0ZvY3VzKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBtc2cgPSB0aGlzLm5vdGlmaWNhdGlvbk1lc3NhZ2VGb3JFdmVudChldik7XG4gICAgICAgIGlmICghbXNnKSByZXR1cm47XG5cbiAgICAgICAgbGV0IHRpdGxlO1xuICAgICAgICBpZiAoIWV2LnNlbmRlciB8fCByb29tLm5hbWUgPT09IGV2LnNlbmRlci5uYW1lKSB7XG4gICAgICAgICAgICB0aXRsZSA9IHJvb20ubmFtZTtcbiAgICAgICAgICAgIC8vIG5vdGlmaWNhdGlvbk1lc3NhZ2VGb3JFdmVudCBpbmNsdWRlcyBzZW5kZXIsXG4gICAgICAgICAgICAvLyBidXQgd2UgYWxyZWFkeSBoYXZlIHRoZSBzZW5kZXIgaGVyZVxuICAgICAgICAgICAgaWYgKGV2LmdldENvbnRlbnQoKS5ib2R5ICYmICF0eXBlaGFuZGxlcnMuaGFzT3duUHJvcGVydHkoZXYuZ2V0Q29udGVudCgpLm1zZ3R5cGUpKSB7XG4gICAgICAgICAgICAgICAgbXNnID0gZXYuZ2V0Q29udGVudCgpLmJvZHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXYuZ2V0VHlwZSgpID09PSAnbS5yb29tLm1lbWJlcicpIHtcbiAgICAgICAgICAgIC8vIGNvbnRleHQgaXMgYWxsIGluIHRoZSBtZXNzYWdlIGhlcmUsIHdlIGRvbid0IG5lZWRcbiAgICAgICAgICAgIC8vIHRvIGRpc3BsYXkgc2VuZGVyIGluZm9cbiAgICAgICAgICAgIHRpdGxlID0gcm9vbS5uYW1lO1xuICAgICAgICB9IGVsc2UgaWYgKGV2LnNlbmRlcikge1xuICAgICAgICAgICAgdGl0bGUgPSBldi5zZW5kZXIubmFtZSArIFwiIChcIiArIHJvb20ubmFtZSArIFwiKVwiO1xuICAgICAgICAgICAgLy8gbm90aWZpY2F0aW9uTWVzc2FnZUZvckV2ZW50IGluY2x1ZGVzIHNlbmRlcixcbiAgICAgICAgICAgIC8vIGJ1dCB3ZSd2ZSBqdXN0IG91dCBzZW5kZXIgaW4gdGhlIHRpdGxlXG4gICAgICAgICAgICBpZiAoZXYuZ2V0Q29udGVudCgpLmJvZHkgJiYgIXR5cGVoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eShldi5nZXRDb250ZW50KCkubXNndHlwZSkpIHtcbiAgICAgICAgICAgICAgICBtc2cgPSBldi5nZXRDb250ZW50KCkuYm9keTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5pc0JvZHlFbmFibGVkKCkpIHtcbiAgICAgICAgICAgIG1zZyA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGF2YXRhclVybCA9IG51bGw7XG4gICAgICAgIGlmIChldi5zZW5kZXIgJiYgIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJsb3dCYW5kd2lkdGhcIikpIHtcbiAgICAgICAgICAgIGF2YXRhclVybCA9IEF2YXRhci5hdmF0YXJVcmxGb3JNZW1iZXIoZXYuc2VuZGVyLCA0MCwgNDAsICdjcm9wJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBub3RpZiA9IHBsYWYuZGlzcGxheU5vdGlmaWNhdGlvbih0aXRsZSwgbXNnLCBhdmF0YXJVcmwsIHJvb20pO1xuXG4gICAgICAgIC8vIGlmIGRpc3BsYXlOb3RpZmljYXRpb24gcmV0dXJucyBub24tbnVsbCwgIHRoZSBwbGF0Zm9ybSBzdXBwb3J0c1xuICAgICAgICAvLyBjbGVhcmluZyBub3RpZmljYXRpb25zIGxhdGVyLCBzbyBrZWVwIHRyYWNrIG9mIHRoaXMuXG4gICAgICAgIGlmIChub3RpZikge1xuICAgICAgICAgICAgaWYgKHRoaXMubm90aWZzQnlSb29tW2V2LmdldFJvb21JZCgpXSA9PT0gdW5kZWZpbmVkKSB0aGlzLm5vdGlmc0J5Um9vbVtldi5nZXRSb29tSWQoKV0gPSBbXTtcbiAgICAgICAgICAgIHRoaXMubm90aWZzQnlSb29tW2V2LmdldFJvb21JZCgpXS5wdXNoKG5vdGlmKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRTb3VuZEZvclJvb206IGZ1bmN0aW9uKHJvb21JZDogc3RyaW5nKSB7XG4gICAgICAgIC8vIFdlIGRvIG5vIGNhY2hpbmcgaGVyZSBiZWNhdXNlIHRoZSBTREsgY2FjaGVzIHNldHRpbmdcbiAgICAgICAgLy8gYW5kIHRoZSBicm93c2VyIHdpbGwgY2FjaGUgdGhlIHNvdW5kLlxuICAgICAgICBjb25zdCBjb250ZW50ID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIm5vdGlmaWNhdGlvblNvdW5kXCIsIHJvb21JZCk7XG4gICAgICAgIGlmICghY29udGVudCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWNvbnRlbnQudXJsKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7cm9vbUlkfSBoYXMgY3VzdG9tIG5vdGlmaWNhdGlvbiBzb3VuZCBldmVudCwgYnV0IG5vIHVybCBrZXlgKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjb250ZW50LnVybC5zdGFydHNXaXRoKFwibXhjOi8vXCIpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7cm9vbUlkfSBoYXMgY3VzdG9tIG5vdGlmaWNhdGlvbiBzb3VuZCBldmVudCwgYnV0IHVybCBpcyBub3QgYSBteGMgdXJsYCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElkZWFsbHkgaW4gaGVyZSB3ZSBjb3VsZCB1c2UgTVNDMTMxMCB0byBkZXRlY3QgdGhlIHR5cGUgb2YgZmlsZSwgYW5kIHJlamVjdCBpdC5cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdXJsOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkubXhjVXJsVG9IdHRwKGNvbnRlbnQudXJsKSxcbiAgICAgICAgICAgIG5hbWU6IGNvbnRlbnQubmFtZSxcbiAgICAgICAgICAgIHR5cGU6IGNvbnRlbnQudHlwZSxcbiAgICAgICAgICAgIHNpemU6IGNvbnRlbnQuc2l6ZSxcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgX3BsYXlBdWRpb05vdGlmaWNhdGlvbjogYXN5bmMgZnVuY3Rpb24oZXY6IE1hdHJpeEV2ZW50LCByb29tOiBSb29tKSB7XG4gICAgICAgIGNvbnN0IHNvdW5kID0gdGhpcy5nZXRTb3VuZEZvclJvb20ocm9vbS5yb29tSWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhgR290IHNvdW5kICR7c291bmQgJiYgc291bmQubmFtZSB8fCBcImRlZmF1bHRcIn0gZm9yICR7cm9vbS5yb29tSWR9YCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdG9yID1cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxBdWRpb0VsZW1lbnQ+KHNvdW5kID8gYGF1ZGlvW3NyYz0nJHtzb3VuZC51cmx9J11gIDogXCIjbWVzc2FnZUF1ZGlvXCIpO1xuICAgICAgICAgICAgbGV0IGF1ZGlvRWxlbWVudCA9IHNlbGVjdG9yO1xuICAgICAgICAgICAgaWYgKCFzZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgIGlmICghc291bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIk5vIGF1ZGlvIGVsZW1lbnQgb3Igc291bmQgdG8gcGxheSBmb3Igbm90aWZpY2F0aW9uXCIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGF1ZGlvRWxlbWVudCA9IG5ldyBBdWRpbyhzb3VuZC51cmwpO1xuICAgICAgICAgICAgICAgIGlmIChzb3VuZC50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGF1ZGlvRWxlbWVudC50eXBlID0gc291bmQudHlwZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhdWRpb0VsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgYXVkaW9FbGVtZW50LnBsYXkoKTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkNhdWdodCBlcnJvciB3aGVuIHRyeWluZyB0byBmZXRjaCByb29tIG5vdGlmaWNhdGlvbiBzb3VuZDpcIiwgZXgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gZG8gbm90IHJlLWJpbmQgaW4gdGhlIGNhc2Ugb2YgcmVwZWF0ZWQgY2FsbFxuICAgICAgICB0aGlzLmJvdW5kT25FdmVudCA9IHRoaXMuYm91bmRPbkV2ZW50IHx8IHRoaXMub25FdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJvdW5kT25TeW5jU3RhdGVDaGFuZ2UgPSB0aGlzLmJvdW5kT25TeW5jU3RhdGVDaGFuZ2UgfHwgdGhpcy5vblN5bmNTdGF0ZUNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJvdW5kT25Sb29tUmVjZWlwdCA9IHRoaXMuYm91bmRPblJvb21SZWNlaXB0IHx8IHRoaXMub25Sb29tUmVjZWlwdC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJvdW5kT25FdmVudERlY3J5cHRlZCA9IHRoaXMuYm91bmRPbkV2ZW50RGVjcnlwdGVkIHx8IHRoaXMub25FdmVudERlY3J5cHRlZC5iaW5kKHRoaXMpO1xuXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbignZXZlbnQnLCB0aGlzLmJvdW5kT25FdmVudCk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbignUm9vbS5yZWNlaXB0JywgdGhpcy5ib3VuZE9uUm9vbVJlY2VpcHQpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oJ0V2ZW50LmRlY3J5cHRlZCcsIHRoaXMuYm91bmRPbkV2ZW50RGVjcnlwdGVkKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFwic3luY1wiLCB0aGlzLmJvdW5kT25TeW5jU3RhdGVDaGFuZ2UpO1xuICAgICAgICB0aGlzLnRvb2xiYXJIaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1N5bmNpbmcgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkpIHtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcignRXZlbnQnLCB0aGlzLmJvdW5kT25FdmVudCk7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoJ1Jvb20ucmVjZWlwdCcsIHRoaXMuYm91bmRPblJvb21SZWNlaXB0KTtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcignRXZlbnQuZGVjcnlwdGVkJywgdGhpcy5ib3VuZE9uRXZlbnREZWNyeXB0ZWQpO1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKCdzeW5jJywgdGhpcy5ib3VuZE9uU3luY1N0YXRlQ2hhbmdlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzU3luY2luZyA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBzdXBwb3J0c0Rlc2t0b3BOb3RpZmljYXRpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgcGxhZiA9IFBsYXRmb3JtUGVnLmdldCgpO1xuICAgICAgICByZXR1cm4gcGxhZiAmJiBwbGFmLnN1cHBvcnRzTm90aWZpY2F0aW9ucygpO1xuICAgIH0sXG5cbiAgICBzZXRFbmFibGVkOiBmdW5jdGlvbihlbmFibGU6IGJvb2xlYW4sIGNhbGxiYWNrPzogKCkgPT4gdm9pZCkge1xuICAgICAgICBjb25zdCBwbGFmID0gUGxhdGZvcm1QZWcuZ2V0KCk7XG4gICAgICAgIGlmICghcGxhZikgcmV0dXJuO1xuXG4gICAgICAgIC8vIERldiBub3RlOiBXZSBkb24ndCBzZXQgdGhlIFwibm90aWZpY2F0aW9uc0VuYWJsZWRcIiBzZXR0aW5nIHRvIHRydWUgaGVyZSBiZWNhdXNlIGl0IGlzIGFcbiAgICAgICAgLy8gY2FsY3VsYXRlZCB2YWx1ZS4gSXQgaXMgZGV0ZXJtaW5lZCBiYXNlZCB1cG9uIHdoZXRoZXIgb3Igbm90IHRoZSBtYXN0ZXIgcnVsZSBpcyBlbmFibGVkXG4gICAgICAgIC8vIGFuZCBvdGhlciBmbGFncy4gU2V0dGluZyBpdCBoZXJlIHdvdWxkIGNhdXNlIGEgY2lyY3VsYXIgcmVmZXJlbmNlLlxuXG4gICAgICAgIEFuYWx5dGljcy50cmFja0V2ZW50KCdOb3RpZmllcicsICdTZXQgRW5hYmxlZCcsIFN0cmluZyhlbmFibGUpKTtcblxuICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB3ZSBwZXJzaXN0IHRoZSBjdXJyZW50IHNldHRpbmcgYXVkaW9fZW5hYmxlZCBzZXR0aW5nXG4gICAgICAgIC8vIGJlZm9yZSBjaGFuZ2luZyBhbnl0aGluZ1xuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5pc0xldmVsU3VwcG9ydGVkKFNldHRpbmdMZXZlbC5ERVZJQ0UpKSB7XG4gICAgICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwiYXVkaW9Ob3RpZmljYXRpb25zRW5hYmxlZFwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCB0aGlzLmlzRW5hYmxlZCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbmFibGUpIHtcbiAgICAgICAgICAgIC8vIEF0dGVtcHQgdG8gZ2V0IHBlcm1pc3Npb24gZnJvbSB1c2VyXG4gICAgICAgICAgICBwbGFmLnJlcXVlc3ROb3RpZmljYXRpb25QZXJtaXNzaW9uKCkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gJ2dyYW50ZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBwZXJtaXNzaW9uIHJlcXVlc3Qgd2FzIGRpc21pc3NlZCBvciBkZW5pZWRcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogU3VwcG9ydCBhbHRlcm5hdGl2ZSBicmFuZGluZyBpbiBtZXNzYWdpbmdcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gcmVzdWx0ID09PSAnZGVuaWVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgPyBfdCgnJShicmFuZClzIGRvZXMgbm90IGhhdmUgcGVybWlzc2lvbiB0byBzZW5kIHlvdSBub3RpZmljYXRpb25zIC0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3BsZWFzZSBjaGVjayB5b3VyIGJyb3dzZXIgc2V0dGluZ3MnLCB7IGJyYW5kIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICA6IF90KCclKGJyYW5kKXMgd2FzIG5vdCBnaXZlbiBwZXJtaXNzaW9uIHRvIHNlbmQgbm90aWZpY2F0aW9ucyAtIHBsZWFzZSB0cnkgYWdhaW4nLCB7IGJyYW5kIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ2RpYWxvZ3MuRXJyb3JEaWFsb2cnKTtcbiAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnVW5hYmxlIHRvIGVuYWJsZSBOb3RpZmljYXRpb25zJywgcmVzdWx0LCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdVbmFibGUgdG8gZW5hYmxlIE5vdGlmaWNhdGlvbnMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwibm90aWZpZXJfZW5hYmxlZFwiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IFwibm90aWZpZXJfZW5hYmxlZFwiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIHNldCB0aGUgbm90aWZpY2F0aW9uc19oaWRkZW4gZmxhZywgYXMgdGhlIHVzZXIgaGFzIGtub3dpbmdseSBpbnRlcmFjdGVkXG4gICAgICAgIC8vIHdpdGggdGhlIHNldHRpbmcgd2Ugc2hvdWxkbid0IG5hZyB0aGVtIGFueSBmdXJ0aGVyXG4gICAgICAgIHRoaXMuc2V0UHJvbXB0SGlkZGVuKHRydWUpO1xuICAgIH0sXG5cbiAgICBpc0VuYWJsZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc1Bvc3NpYmxlKCkgJiYgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIm5vdGlmaWNhdGlvbnNFbmFibGVkXCIpO1xuICAgIH0sXG5cbiAgICBpc1Bvc3NpYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgcGxhZiA9IFBsYXRmb3JtUGVnLmdldCgpO1xuICAgICAgICBpZiAoIXBsYWYpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKCFwbGFmLnN1cHBvcnRzTm90aWZpY2F0aW9ucygpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICghcGxhZi5tYXlTZW5kTm90aWZpY2F0aW9ucygpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIHBvc3NpYmxlLCBidXQgbm90IG5lY2Vzc2FyaWx5IGVuYWJsZWRcbiAgICB9LFxuXG4gICAgaXNCb2R5RW5hYmxlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzRW5hYmxlZCgpICYmIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJub3RpZmljYXRpb25Cb2R5RW5hYmxlZFwiKTtcbiAgICB9LFxuXG4gICAgaXNBdWRpb0VuYWJsZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBXZSBkb24ndCByb3V0ZSBBdWRpbyB2aWEgdGhlIEhUTUwgTm90aWZpY2F0aW9ucyBBUEkgc28gaXQgaXMgcG9zc2libGUgcmVnYXJkbGVzcyBvZiBvdGhlciB0aGluZ3NcbiAgICAgICAgcmV0dXJuIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhdWRpb05vdGlmaWNhdGlvbnNFbmFibGVkXCIpO1xuICAgIH0sXG5cbiAgICBzZXRQcm9tcHRIaWRkZW46IGZ1bmN0aW9uKGhpZGRlbjogYm9vbGVhbiwgcGVyc2lzdGVudCA9IHRydWUpIHtcbiAgICAgICAgdGhpcy50b29sYmFySGlkZGVuID0gaGlkZGVuO1xuXG4gICAgICAgIEFuYWx5dGljcy50cmFja0V2ZW50KCdOb3RpZmllcicsICdTZXQgVG9vbGJhciBIaWRkZW4nLCBTdHJpbmcoaGlkZGVuKSk7XG5cbiAgICAgICAgaGlkZU5vdGlmaWNhdGlvbnNUb2FzdCgpO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgaW5mbyB0byBsb2NhbFN0b3JhZ2UgZm9yIHBlcnNpc3RlbnQgc2V0dGluZ3NcbiAgICAgICAgaWYgKHBlcnNpc3RlbnQgJiYgZ2xvYmFsLmxvY2FsU3RvcmFnZSkge1xuICAgICAgICAgICAgZ2xvYmFsLmxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibm90aWZpY2F0aW9uc19oaWRkZW5cIiwgU3RyaW5nKGhpZGRlbikpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHNob3VsZFNob3dQcm9tcHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmICghY2xpZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXNHdWVzdCA9IGNsaWVudC5pc0d1ZXN0KCk7XG4gICAgICAgIHJldHVybiAhaXNHdWVzdCAmJiB0aGlzLnN1cHBvcnRzRGVza3RvcE5vdGlmaWNhdGlvbnMoKSAmJiAhaXNQdXNoTm90aWZ5RGlzYWJsZWQoKSAmJlxuICAgICAgICAgICAgIXRoaXMuaXNFbmFibGVkKCkgJiYgIXRoaXMuX2lzUHJvbXB0SGlkZGVuKCk7XG4gICAgfSxcblxuICAgIF9pc1Byb21wdEhpZGRlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIENoZWNrIGxvY2FsU3RvcmFnZSBmb3IgYW55IHN1Y2ggbWV0YSBkYXRhXG4gICAgICAgIGlmIChnbG9iYWwubG9jYWxTdG9yYWdlKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2xvYmFsLmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibm90aWZpY2F0aW9uc19oaWRkZW5cIikgPT09IFwidHJ1ZVwiO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudG9vbGJhckhpZGRlbjtcbiAgICB9LFxuXG4gICAgb25TeW5jU3RhdGVDaGFuZ2U6IGZ1bmN0aW9uKHN0YXRlOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHN0YXRlID09PSBcIlNZTkNJTkdcIikge1xuICAgICAgICAgICAgdGhpcy5pc1N5bmNpbmcgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBcIlNUT1BQRURcIiB8fCBzdGF0ZSA9PT0gXCJFUlJPUlwiKSB7XG4gICAgICAgICAgICB0aGlzLmlzU3luY2luZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uRXZlbnQ6IGZ1bmN0aW9uKGV2OiBNYXRyaXhFdmVudCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNTeW5jaW5nKSByZXR1cm47IC8vIGRvbid0IGFsZXJ0IGZvciBhbnkgbWVzc2FnZXMgaW5pdGlhbGx5XG4gICAgICAgIGlmIChldi5zZW5kZXIgJiYgZXYuc2VuZGVyLnVzZXJJZCA9PT0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmNyZWRlbnRpYWxzLnVzZXJJZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIElmIGl0J3MgYW4gZW5jcnlwdGVkIGV2ZW50IGFuZCB0aGUgdHlwZSBpcyBzdGlsbCAnbS5yb29tLmVuY3J5cHRlZCcsXG4gICAgICAgIC8vIGl0IGhhc24ndCB5ZXQgYmVlbiBkZWNyeXB0ZWQsIHNvIHdhaXQgdW50aWwgaXQgaXMuXG4gICAgICAgIGlmIChldi5pc0JlaW5nRGVjcnlwdGVkKCkgfHwgZXYuaXNEZWNyeXB0aW9uRmFpbHVyZSgpKSB7XG4gICAgICAgICAgICB0aGlzLnBlbmRpbmdFbmNyeXB0ZWRFdmVudElkcy5wdXNoKGV2LmdldElkKCkpO1xuICAgICAgICAgICAgLy8gZG9uJ3QgbGV0IHRoZSBsaXN0IGZpbGwgdXAgaW5kZWZpbml0ZWx5XG4gICAgICAgICAgICB3aGlsZSAodGhpcy5wZW5kaW5nRW5jcnlwdGVkRXZlbnRJZHMubGVuZ3RoID4gTUFYX1BFTkRJTkdfRU5DUllQVEVEKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wZW5kaW5nRW5jcnlwdGVkRXZlbnRJZHMuc2hpZnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2V2YWx1YXRlRXZlbnQoZXYpO1xuICAgIH0sXG5cbiAgICBvbkV2ZW50RGVjcnlwdGVkOiBmdW5jdGlvbihldjogTWF0cml4RXZlbnQpIHtcbiAgICAgICAgLy8gJ2RlY3J5cHRlZCcgbWVhbnMgdGhlIGRlY3J5cHRpb24gcHJvY2VzcyBoYXMgZmluaXNoZWQ6IGl0IG1heSBoYXZlIGZhaWxlZCxcbiAgICAgICAgLy8gaW4gd2hpY2ggY2FzZSBpdCBtaWdodCBkZWNyeXB0IHNvb24gaWYgdGhlIGtleXMgYXJyaXZlXG4gICAgICAgIGlmIChldi5pc0RlY3J5cHRpb25GYWlsdXJlKCkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBpZHggPSB0aGlzLnBlbmRpbmdFbmNyeXB0ZWRFdmVudElkcy5pbmRleE9mKGV2LmdldElkKCkpO1xuICAgICAgICBpZiAoaWR4ID09PSAtMSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMucGVuZGluZ0VuY3J5cHRlZEV2ZW50SWRzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICB0aGlzLl9ldmFsdWF0ZUV2ZW50KGV2KTtcbiAgICB9LFxuXG4gICAgb25Sb29tUmVjZWlwdDogZnVuY3Rpb24oZXY6IE1hdHJpeEV2ZW50LCByb29tOiBSb29tKSB7XG4gICAgICAgIGlmIChyb29tLmdldFVucmVhZE5vdGlmaWNhdGlvbkNvdW50KCkgPT09IDApIHtcbiAgICAgICAgICAgIC8vIGlkZWFsbHkgd2Ugd291bGQgY2xlYXIgZWFjaCBub3RpZmljYXRpb24gd2hlbiBpdCB3YXMgcmVhZCxcbiAgICAgICAgICAgIC8vIGJ1dCB3ZSBoYXZlIG5vIHdheSwgZ2l2ZW4gYSByZWFkIHJlY2VpcHQsIHRvIGtub3cgd2hldGhlclxuICAgICAgICAgICAgLy8gdGhlIHJlY2VpcHQgY29tZXMgYmVmb3JlIG9yIGFmdGVyIGFuIGV2ZW50LCBzbyB3ZSBjYW4ndFxuICAgICAgICAgICAgLy8gZG8gdGhpcy4gSW5zdGVhZCwgY2xlYXIgYWxsIG5vdGlmaWNhdGlvbnMgZm9yIGEgcm9vbSBvbmNlXG4gICAgICAgICAgICAvLyB0aGVyZSBhcmUgbm8gbm90aWZzIGxlZnQgaW4gdGhhdCByb29tLiwgd2hpY2ggaXMgbm90IHF1aXRlXG4gICAgICAgICAgICAvLyBhcyBnb29kIGJ1dCBpdCdzIHNvbWV0aGluZy5cbiAgICAgICAgICAgIGNvbnN0IHBsYWYgPSBQbGF0Zm9ybVBlZy5nZXQoKTtcbiAgICAgICAgICAgIGlmICghcGxhZikgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHRoaXMubm90aWZzQnlSb29tW3Jvb20ucm9vbUlkXSA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG5vdGlmIG9mIHRoaXMubm90aWZzQnlSb29tW3Jvb20ucm9vbUlkXSkge1xuICAgICAgICAgICAgICAgIHBsYWYuY2xlYXJOb3RpZmljYXRpb24obm90aWYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlIHRoaXMubm90aWZzQnlSb29tW3Jvb20ucm9vbUlkXTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfZXZhbHVhdGVFdmVudDogZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKGV2LmdldFJvb21JZCgpKTtcbiAgICAgICAgY29uc3QgYWN0aW9ucyA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRQdXNoQWN0aW9uc0ZvckV2ZW50KGV2KTtcbiAgICAgICAgaWYgKGFjdGlvbnMgJiYgYWN0aW9ucy5ub3RpZnkpIHtcbiAgICAgICAgICAgIGlmIChSb29tVmlld1N0b3JlLmdldFJvb21JZCgpID09PSByb29tLnJvb21JZCAmJiBVc2VyQWN0aXZpdHkuc2hhcmVkSW5zdGFuY2UoKS51c2VyQWN0aXZlUmVjZW50bHkoKSkge1xuICAgICAgICAgICAgICAgIC8vIGRvbid0IGJvdGhlciBub3RpZnlpbmcgYXMgdXNlciB3YXMgcmVjZW50bHkgYWN0aXZlIGluIHRoaXMgcm9vbVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNFbmFibGVkKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNwbGF5UG9wdXBOb3RpZmljYXRpb24oZXYsIHJvb20pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjdGlvbnMudHdlYWtzLnNvdW5kICYmIHRoaXMuaXNBdWRpb0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgICAgIFBsYXRmb3JtUGVnLmdldCgpLmxvdWROb3RpZmljYXRpb24oZXYsIHJvb20pO1xuICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlBdWRpb05vdGlmaWNhdGlvbihldiwgcm9vbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxufTtcblxuaWYgKCF3aW5kb3cubXhOb3RpZmllcikge1xuICAgIHdpbmRvdy5teE5vdGlmaWVyID0gTm90aWZpZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHdpbmRvdy5teE5vdGlmaWVyO1xuIl19