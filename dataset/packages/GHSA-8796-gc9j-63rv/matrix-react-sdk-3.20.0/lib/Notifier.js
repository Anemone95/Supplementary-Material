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

var _Media = require("./customisations/Media");

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
      url: (0, _Media.mediaFromMxc)(content.url).srcHttp,
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

      if (_SettingsStore.default.getValue("doNotDisturb")) {
        // Don't bother the user if they didn't ask to be bothered
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Ob3RpZmllci50cyJdLCJuYW1lcyI6WyJNQVhfUEVORElOR19FTkNSWVBURUQiLCJ0eXBlaGFuZGxlcnMiLCJldmVudCIsIm5hbWUiLCJzZW5kZXIiLCJOb3RpZmllciIsIm5vdGlmc0J5Um9vbSIsInBlbmRpbmdFbmNyeXB0ZWRFdmVudElkcyIsIm5vdGlmaWNhdGlvbk1lc3NhZ2VGb3JFdmVudCIsImV2IiwiaGFzT3duUHJvcGVydHkiLCJnZXRDb250ZW50IiwibXNndHlwZSIsIlRleHRGb3JFdmVudCIsInRleHRGb3JFdmVudCIsIl9kaXNwbGF5UG9wdXBOb3RpZmljYXRpb24iLCJyb29tIiwicGxhZiIsIlBsYXRmb3JtUGVnIiwiZ2V0Iiwic3VwcG9ydHNOb3RpZmljYXRpb25zIiwibWF5U2VuZE5vdGlmaWNhdGlvbnMiLCJnbG9iYWwiLCJkb2N1bWVudCIsImhhc0ZvY3VzIiwibXNnIiwidGl0bGUiLCJib2R5IiwiZ2V0VHlwZSIsImlzQm9keUVuYWJsZWQiLCJhdmF0YXJVcmwiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJBdmF0YXIiLCJhdmF0YXJVcmxGb3JNZW1iZXIiLCJub3RpZiIsImRpc3BsYXlOb3RpZmljYXRpb24iLCJnZXRSb29tSWQiLCJ1bmRlZmluZWQiLCJwdXNoIiwiZ2V0U291bmRGb3JSb29tIiwicm9vbUlkIiwiY29udGVudCIsInVybCIsImNvbnNvbGUiLCJ3YXJuIiwic3RhcnRzV2l0aCIsInNyY0h0dHAiLCJ0eXBlIiwic2l6ZSIsIl9wbGF5QXVkaW9Ob3RpZmljYXRpb24iLCJzb3VuZCIsImxvZyIsInNlbGVjdG9yIiwicXVlcnlTZWxlY3RvciIsImF1ZGlvRWxlbWVudCIsImVycm9yIiwiQXVkaW8iLCJhcHBlbmRDaGlsZCIsInBsYXkiLCJleCIsInN0YXJ0IiwiYm91bmRPbkV2ZW50Iiwib25FdmVudCIsImJpbmQiLCJib3VuZE9uU3luY1N0YXRlQ2hhbmdlIiwib25TeW5jU3RhdGVDaGFuZ2UiLCJib3VuZE9uUm9vbVJlY2VpcHQiLCJvblJvb21SZWNlaXB0IiwiYm91bmRPbkV2ZW50RGVjcnlwdGVkIiwib25FdmVudERlY3J5cHRlZCIsIk1hdHJpeENsaWVudFBlZyIsIm9uIiwidG9vbGJhckhpZGRlbiIsImlzU3luY2luZyIsInN0b3AiLCJyZW1vdmVMaXN0ZW5lciIsInN1cHBvcnRzRGVza3RvcE5vdGlmaWNhdGlvbnMiLCJzZXRFbmFibGVkIiwiZW5hYmxlIiwiY2FsbGJhY2siLCJBbmFseXRpY3MiLCJ0cmFja0V2ZW50IiwiU3RyaW5nIiwiaXNMZXZlbFN1cHBvcnRlZCIsIlNldHRpbmdMZXZlbCIsIkRFVklDRSIsInNldFZhbHVlIiwiaXNFbmFibGVkIiwicmVxdWVzdE5vdGlmaWNhdGlvblBlcm1pc3Npb24iLCJ0aGVuIiwicmVzdWx0IiwiYnJhbmQiLCJTZGtDb25maWciLCJkZXNjcmlwdGlvbiIsIkVycm9yRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJ2YWx1ZSIsInNldFByb21wdEhpZGRlbiIsImlzUG9zc2libGUiLCJpc0F1ZGlvRW5hYmxlZCIsImhpZGRlbiIsInBlcnNpc3RlbnQiLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwic2hvdWxkU2hvd1Byb21wdCIsImNsaWVudCIsImlzR3Vlc3QiLCJfaXNQcm9tcHRIaWRkZW4iLCJnZXRJdGVtIiwic3RhdGUiLCJ1c2VySWQiLCJjcmVkZW50aWFscyIsImlzQmVpbmdEZWNyeXB0ZWQiLCJpc0RlY3J5cHRpb25GYWlsdXJlIiwiZ2V0SWQiLCJsZW5ndGgiLCJzaGlmdCIsIl9ldmFsdWF0ZUV2ZW50IiwiaWR4IiwiaW5kZXhPZiIsInNwbGljZSIsImdldFVucmVhZE5vdGlmaWNhdGlvbkNvdW50IiwiY2xlYXJOb3RpZmljYXRpb24iLCJnZXRSb29tIiwiYWN0aW9ucyIsImdldFB1c2hBY3Rpb25zRm9yRXZlbnQiLCJub3RpZnkiLCJSb29tVmlld1N0b3JlIiwiVXNlckFjdGl2aXR5Iiwic2hhcmVkSW5zdGFuY2UiLCJ1c2VyQWN0aXZlUmVjZW50bHkiLCJ0d2Vha3MiLCJsb3VkTm90aWZpY2F0aW9uIiwid2luZG93IiwibXhOb3RpZmllciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFzQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxNQUFNQSxxQkFBcUIsR0FBRyxFQUE5QjtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsTUFBTUMsWUFBWSxHQUFHO0FBQ2pCLGdDQUErQkMsS0FBRCxJQUFXO0FBQ3JDLFVBQU1DLElBQUksR0FBRyxDQUFDRCxLQUFLLENBQUNFLE1BQU4sSUFBZ0IsRUFBakIsRUFBcUJELElBQWxDO0FBQ0EsV0FBTyx5QkFBRyxxQ0FBSCxFQUEwQztBQUFFQSxNQUFBQTtBQUFGLEtBQTFDLENBQVA7QUFDSDtBQUpnQixDQUFyQjtBQU9PLE1BQU1FLFFBQVEsR0FBRztBQUNwQkMsRUFBQUEsWUFBWSxFQUFFLEVBRE07QUFHcEI7QUFDQTtBQUNBO0FBQ0FDLEVBQUFBLHdCQUF3QixFQUFFLEVBTk47QUFRcEJDLEVBQUFBLDJCQUEyQixFQUFFLFVBQVNDO0FBQVQ7QUFBQSxJQUEwQjtBQUNuRCxRQUFJUixZQUFZLENBQUNTLGNBQWIsQ0FBNEJELEVBQUUsQ0FBQ0UsVUFBSCxHQUFnQkMsT0FBNUMsQ0FBSixFQUEwRDtBQUN0RCxhQUFPWCxZQUFZLENBQUNRLEVBQUUsQ0FBQ0UsVUFBSCxHQUFnQkMsT0FBakIsQ0FBWixDQUFzQ0gsRUFB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ZCxPQUE4QnJCLElBQUksQ0FBQ3lCLE1BQW5DLElBQTZDOEYsc0JBQWFDLGNBQWIsR0FBOEJDLGtCQUE5QixFQUFqRCxFQUFxRztBQUNqRztBQUNBO0FBQ0g7O0FBQ0QsVUFBSTFHLHVCQUFjQyxRQUFkLENBQXVCLGNBQXZCLENBQUosRUFBNEM7QUFDeEM7QUFDQTtBQUNIOztBQUVELFVBQUksS0FBS3dELFNBQUwsRUFBSixFQUFzQjtBQUNsQixhQUFLekUseUJBQUwsQ0FBK0JOLEVBQS9CLEVBQW1DTyxJQUFuQztBQUNIOztBQUNELFVBQUltSCxPQUFPLENBQUNPLE1BQVIsQ0FBZXZGLEtBQWYsSUFBd0IsS0FBS3VELGNBQUwsRUFBNUIsRUFBbUQ7QUFDL0N4Riw2QkFBWUMsR0FBWixHQUFrQndILGdCQUFsQixDQUFtQ2xJLEVBQW5DLEVBQXVDTyxJQUF2Qzs7QUFDQSxhQUFLa0Msc0JBQUwsQ0FBNEJ6QyxFQUE1QixFQUFnQ08sSUFBaEM7QUFDSDtBQUNKO0FBQ0o7QUFoVm1CLENBQWpCOzs7QUFtVlAsSUFBSSxDQUFDNEgsTUFBTSxDQUFDQyxVQUFaLEVBQXdCO0FBQ3BCRCxFQUFBQSxNQUFNLENBQUNDLFVBQVAsR0FBb0J4SSxRQUFwQjtBQUNIOztlQUVjdUksTUFBTSxDQUFDQyxVIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTcgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5cbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi9TZGtDb25maWcnO1xuaW1wb3J0IFBsYXRmb3JtUGVnIGZyb20gJy4vUGxhdGZvcm1QZWcnO1xuaW1wb3J0ICogYXMgVGV4dEZvckV2ZW50IGZyb20gJy4vVGV4dEZvckV2ZW50JztcbmltcG9ydCBBbmFseXRpY3MgZnJvbSAnLi9BbmFseXRpY3MnO1xuaW1wb3J0ICogYXMgQXZhdGFyIGZyb20gJy4vQXZhdGFyJztcbmltcG9ydCBkaXMgZnJvbSAnLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi9Nb2RhbCc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBoaWRlVG9hc3QgYXMgaGlkZU5vdGlmaWNhdGlvbnNUb2FzdCB9IGZyb20gXCIuL3RvYXN0cy9EZXNrdG9wTm90aWZpY2F0aW9uc1RvYXN0XCI7XG5pbXBvcnQge1NldHRpbmdMZXZlbH0gZnJvbSBcIi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQge2lzUHVzaE5vdGlmeURpc2FibGVkfSBmcm9tIFwiLi9zZXR0aW5ncy9jb250cm9sbGVycy9Ob3RpZmljYXRpb25Db250cm9sbGVyc1wiO1xuaW1wb3J0IFJvb21WaWV3U3RvcmUgZnJvbSBcIi4vc3RvcmVzL1Jvb21WaWV3U3RvcmVcIjtcbmltcG9ydCBVc2VyQWN0aXZpdHkgZnJvbSBcIi4vVXNlckFjdGl2aXR5XCI7XG5pbXBvcnQge21lZGlhRnJvbU14Y30gZnJvbSBcIi4vY3VzdG9taXNhdGlvbnMvTWVkaWFcIjtcblxuLypcbiAqIERpc3BhdGNoZXM6XG4gKiB7XG4gKiAgIGFjdGlvbjogXCJub3RpZmllcl9lbmFibGVkXCIsXG4gKiAgIHZhbHVlOiBib29sZWFuXG4gKiB9XG4gKi9cblxuY29uc3QgTUFYX1BFTkRJTkdfRU5DUllQVEVEID0gMjA7XG5cbi8qXG5PdmVycmlkZSBib3RoIHRoZSBjb250ZW50IGJvZHkgYW5kIHRoZSBUZXh0Rm9yRXZlbnQgaGFuZGxlciBmb3Igc3BlY2lmaWMgbXNndHlwZXMsIGluIG5vdGlmaWNhdGlvbnMuXG5UaGlzIGlzIHVzZWZ1bCB3aGVuIHRoZSBjb250ZW50IGJvZHkgY29udGFpbnMgZmFsbGJhY2sgdGV4dCB0aGF0IHdvdWxkIGV4cGxhaW4gdGhhdCB0aGUgY2xpZW50IGNhbid0IGhhbmRsZSBhIHBhcnRpY3VsYXJcbnR5cGUgb2YgdGlsZS5cbiovXG5jb25zdCB0eXBlaGFuZGxlcnMgPSB7XG4gICAgXCJtLmtleS52ZXJpZmljYXRpb24ucmVxdWVzdFwiOiAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IChldmVudC5zZW5kZXIgfHwge30pLm5hbWU7XG4gICAgICAgIHJldHVybiBfdChcIiUobmFtZSlzIGlzIHJlcXVlc3RpbmcgdmVyaWZpY2F0aW9uXCIsIHsgbmFtZSB9KTtcbiAgICB9LFxufTtcblxuZXhwb3J0IGNvbnN0IE5vdGlmaWVyID0ge1xuICAgIG5vdGlmc0J5Um9vbToge30sXG5cbiAgICAvLyBBIGxpc3Qgb2YgZXZlbnQgSURzIHRoYXQgd2UndmUgcmVjZWl2ZWQgYnV0IG5lZWQgdG8gd2FpdCB1bnRpbFxuICAgIC8vIHRoZXkncmUgZGVjcnlwdGVkIHVudGlsIHdlIGRlY2lkZSB3aGV0aGVyIHRvIG5vdGlmeSBmb3IgdGhlbVxuICAgIC8vIG9yIG5vdFxuICAgIHBlbmRpbmdFbmNyeXB0ZWRFdmVudElkczogW10sXG5cbiAgICBub3RpZmljYXRpb25NZXNzYWdlRm9yRXZlbnQ6IGZ1bmN0aW9uKGV2OiBNYXRyaXhFdmVudCkge1xuICAgICAgICBpZiAodHlwZWhhbmRsZXJzLmhhc093blByb3BlcnR5KGV2LmdldENvbnRlbnQoKS5tc2d0eXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVoYW5kbGVyc1tldi5nZXRDb250ZW50KCkubXNndHlwZV0oZXYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBUZXh0Rm9yRXZlbnQudGV4dEZvckV2ZW50KGV2KTtcbiAgICB9LFxuXG4gICAgX2Rpc3BsYXlQb3B1cE5vdGlmaWNhdGlvbjogZnVuY3Rpb24oZXY6IE1hdHJpeEV2ZW50LCByb29tOiBSb29tKSB7XG4gICAgICAgIGNvbnN0IHBsYWYgPSBQbGF0Zm9ybVBlZy5nZXQoKTtcbiAgICAgICAgaWYgKCFwbGFmKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFwbGFmLnN1cHBvcnRzTm90aWZpY2F0aW9ucygpIHx8ICFwbGFmLm1heVNlbmROb3RpZmljYXRpb25zKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2xvYmFsLmRvY3VtZW50Lmhhc0ZvY3VzKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBtc2cgPSB0aGlzLm5vdGlmaWNhdGlvbk1lc3NhZ2VGb3JFdmVudChldik7XG4gICAgICAgIGlmICghbXNnKSByZXR1cm47XG5cbiAgICAgICAgbGV0IHRpdGxlO1xuICAgICAgICBpZiAoIWV2LnNlbmRlciB8fCByb29tLm5hbWUgPT09IGV2LnNlbmRlci5uYW1lKSB7XG4gICAgICAgICAgICB0aXRsZSA9IHJvb20ubmFtZTtcbiAgICAgICAgICAgIC8vIG5vdGlmaWNhdGlvbk1lc3NhZ2VGb3JFdmVudCBpbmNsdWRlcyBzZW5kZXIsXG4gICAgICAgICAgICAvLyBidXQgd2UgYWxyZWFkeSBoYXZlIHRoZSBzZW5kZXIgaGVyZVxuICAgICAgICAgICAgaWYgKGV2LmdldENvbnRlbnQoKS5ib2R5ICYmICF0eXBlaGFuZGxlcnMuaGFzT3duUHJvcGVydHkoZXYuZ2V0Q29udGVudCgpLm1zZ3R5cGUpKSB7XG4gICAgICAgICAgICAgICAgbXNnID0gZXYuZ2V0Q29udGVudCgpLmJvZHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXYuZ2V0VHlwZSgpID09PSAnbS5yb29tLm1lbWJlcicpIHtcbiAgICAgICAgICAgIC8vIGNvbnRleHQgaXMgYWxsIGluIHRoZSBtZXNzYWdlIGhlcmUsIHdlIGRvbid0IG5lZWRcbiAgICAgICAgICAgIC8vIHRvIGRpc3BsYXkgc2VuZGVyIGluZm9cbiAgICAgICAgICAgIHRpdGxlID0gcm9vbS5uYW1lO1xuICAgICAgICB9IGVsc2UgaWYgKGV2LnNlbmRlcikge1xuICAgICAgICAgICAgdGl0bGUgPSBldi5zZW5kZXIubmFtZSArIFwiIChcIiArIHJvb20ubmFtZSArIFwiKVwiO1xuICAgICAgICAgICAgLy8gbm90aWZpY2F0aW9uTWVzc2FnZUZvckV2ZW50IGluY2x1ZGVzIHNlbmRlcixcbiAgICAgICAgICAgIC8vIGJ1dCB3ZSd2ZSBqdXN0IG91dCBzZW5kZXIgaW4gdGhlIHRpdGxlXG4gICAgICAgICAgICBpZiAoZXYuZ2V0Q29udGVudCgpLmJvZHkgJiYgIXR5cGVoYW5kbGVycy5oYXNPd25Qcm9wZXJ0eShldi5nZXRDb250ZW50KCkubXNndHlwZSkpIHtcbiAgICAgICAgICAgICAgICBtc2cgPSBldi5nZXRDb250ZW50KCkuYm9keTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5pc0JvZHlFbmFibGVkKCkpIHtcbiAgICAgICAgICAgIG1zZyA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGF2YXRhclVybCA9IG51bGw7XG4gICAgICAgIGlmIChldi5zZW5kZXIgJiYgIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJsb3dCYW5kd2lkdGhcIikpIHtcbiAgICAgICAgICAgIGF2YXRhclVybCA9IEF2YXRhci5hdmF0YXJVcmxGb3JNZW1iZXIoZXYuc2VuZGVyLCA0MCwgNDAsICdjcm9wJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBub3RpZiA9IHBsYWYuZGlzcGxheU5vdGlmaWNhdGlvbih0aXRsZSwgbXNnLCBhdmF0YXJVcmwsIHJvb20pO1xuXG4gICAgICAgIC8vIGlmIGRpc3BsYXlOb3RpZmljYXRpb24gcmV0dXJucyBub24tbnVsbCwgIHRoZSBwbGF0Zm9ybSBzdXBwb3J0c1xuICAgICAgICAvLyBjbGVhcmluZyBub3RpZmljYXRpb25zIGxhdGVyLCBzbyBrZWVwIHRyYWNrIG9mIHRoaXMuXG4gICAgICAgIGlmIChub3RpZikge1xuICAgICAgICAgICAgaWYgKHRoaXMubm90aWZzQnlSb29tW2V2LmdldFJvb21JZCgpXSA9PT0gdW5kZWZpbmVkKSB0aGlzLm5vdGlmc0J5Um9vbVtldi5nZXRSb29tSWQoKV0gPSBbXTtcbiAgICAgICAgICAgIHRoaXMubm90aWZzQnlSb29tW2V2LmdldFJvb21JZCgpXS5wdXNoKG5vdGlmKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRTb3VuZEZvclJvb206IGZ1bmN0aW9uKHJvb21JZDogc3RyaW5nKSB7XG4gICAgICAgIC8vIFdlIGRvIG5vIGNhY2hpbmcgaGVyZSBiZWNhdXNlIHRoZSBTREsgY2FjaGVzIHNldHRpbmdcbiAgICAgICAgLy8gYW5kIHRoZSBicm93c2VyIHdpbGwgY2FjaGUgdGhlIHNvdW5kLlxuICAgICAgICBjb25zdCBjb250ZW50ID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIm5vdGlmaWNhdGlvblNvdW5kXCIsIHJvb21JZCk7XG4gICAgICAgIGlmICghY29udGVudCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWNvbnRlbnQudXJsKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7cm9vbUlkfSBoYXMgY3VzdG9tIG5vdGlmaWNhdGlvbiBzb3VuZCBldmVudCwgYnV0IG5vIHVybCBrZXlgKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjb250ZW50LnVybC5zdGFydHNXaXRoKFwibXhjOi8vXCIpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7cm9vbUlkfSBoYXMgY3VzdG9tIG5vdGlmaWNhdGlvbiBzb3VuZCBldmVudCwgYnV0IHVybCBpcyBub3QgYSBteGMgdXJsYCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElkZWFsbHkgaW4gaGVyZSB3ZSBjb3VsZCB1c2UgTVNDMTMxMCB0byBkZXRlY3QgdGhlIHR5cGUgb2YgZmlsZSwgYW5kIHJlamVjdCBpdC5cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdXJsOiBtZWRpYUZyb21NeGMoY29udGVudC51cmwpLnNyY0h0dHAsXG4gICAgICAgICAgICBuYW1lOiBjb250ZW50Lm5hbWUsXG4gICAgICAgICAgICB0eXBlOiBjb250ZW50LnR5cGUsXG4gICAgICAgICAgICBzaXplOiBjb250ZW50LnNpemUsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIF9wbGF5QXVkaW9Ob3RpZmljYXRpb246IGFzeW5jIGZ1bmN0aW9uKGV2OiBNYXRyaXhFdmVudCwgcm9vbTogUm9vbSkge1xuICAgICAgICBjb25zdCBzb3VuZCA9IHRoaXMuZ2V0U291bmRGb3JSb29tKHJvb20ucm9vbUlkKTtcbiAgICAgICAgY29uc29sZS5sb2coYEdvdCBzb3VuZCAke3NvdW5kICYmIHNvdW5kLm5hbWUgfHwgXCJkZWZhdWx0XCJ9IGZvciAke3Jvb20ucm9vbUlkfWApO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RvciA9XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MQXVkaW9FbGVtZW50Pihzb3VuZCA/IGBhdWRpb1tzcmM9JyR7c291bmQudXJsfSddYCA6IFwiI21lc3NhZ2VBdWRpb1wiKTtcbiAgICAgICAgICAgIGxldCBhdWRpb0VsZW1lbnQgPSBzZWxlY3RvcjtcbiAgICAgICAgICAgIGlmICghc2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJObyBhdWRpbyBlbGVtZW50IG9yIHNvdW5kIHRvIHBsYXkgZm9yIG5vdGlmaWNhdGlvblwiKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhdWRpb0VsZW1lbnQgPSBuZXcgQXVkaW8oc291bmQudXJsKTtcbiAgICAgICAgICAgICAgICBpZiAoc291bmQudHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBhdWRpb0VsZW1lbnQudHlwZSA9IHNvdW5kLnR5cGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXVkaW9FbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IGF1ZGlvRWxlbWVudC5wbGF5KCk7XG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJDYXVnaHQgZXJyb3Igd2hlbiB0cnlpbmcgdG8gZmV0Y2ggcm9vbSBub3RpZmljYXRpb24gc291bmQ6XCIsIGV4KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIGRvIG5vdCByZS1iaW5kIGluIHRoZSBjYXNlIG9mIHJlcGVhdGVkIGNhbGxcbiAgICAgICAgdGhpcy5ib3VuZE9uRXZlbnQgPSB0aGlzLmJvdW5kT25FdmVudCB8fCB0aGlzLm9uRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5ib3VuZE9uU3luY1N0YXRlQ2hhbmdlID0gdGhpcy5ib3VuZE9uU3luY1N0YXRlQ2hhbmdlIHx8IHRoaXMub25TeW5jU3RhdGVDaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5ib3VuZE9uUm9vbVJlY2VpcHQgPSB0aGlzLmJvdW5kT25Sb29tUmVjZWlwdCB8fCB0aGlzLm9uUm9vbVJlY2VpcHQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5ib3VuZE9uRXZlbnREZWNyeXB0ZWQgPSB0aGlzLmJvdW5kT25FdmVudERlY3J5cHRlZCB8fCB0aGlzLm9uRXZlbnREZWNyeXB0ZWQuYmluZCh0aGlzKTtcblxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oJ2V2ZW50JywgdGhpcy5ib3VuZE9uRXZlbnQpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oJ1Jvb20ucmVjZWlwdCcsIHRoaXMuYm91bmRPblJvb21SZWNlaXB0KTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKCdFdmVudC5kZWNyeXB0ZWQnLCB0aGlzLmJvdW5kT25FdmVudERlY3J5cHRlZCk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihcInN5bmNcIiwgdGhpcy5ib3VuZE9uU3luY1N0YXRlQ2hhbmdlKTtcbiAgICAgICAgdGhpcy50b29sYmFySGlkZGVuID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTeW5jaW5nID0gZmFsc2U7XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpKSB7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoJ0V2ZW50JywgdGhpcy5ib3VuZE9uRXZlbnQpO1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKCdSb29tLnJlY2VpcHQnLCB0aGlzLmJvdW5kT25Sb29tUmVjZWlwdCk7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoJ0V2ZW50LmRlY3J5cHRlZCcsIHRoaXMuYm91bmRPbkV2ZW50RGVjcnlwdGVkKTtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcignc3luYycsIHRoaXMuYm91bmRPblN5bmNTdGF0ZUNoYW5nZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc1N5bmNpbmcgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgc3VwcG9ydHNEZXNrdG9wTm90aWZpY2F0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHBsYWYgPSBQbGF0Zm9ybVBlZy5nZXQoKTtcbiAgICAgICAgcmV0dXJuIHBsYWYgJiYgcGxhZi5zdXBwb3J0c05vdGlmaWNhdGlvbnMoKTtcbiAgICB9LFxuXG4gICAgc2V0RW5hYmxlZDogZnVuY3Rpb24oZW5hYmxlOiBib29sZWFuLCBjYWxsYmFjaz86ICgpID0+IHZvaWQpIHtcbiAgICAgICAgY29uc3QgcGxhZiA9IFBsYXRmb3JtUGVnLmdldCgpO1xuICAgICAgICBpZiAoIXBsYWYpIHJldHVybjtcblxuICAgICAgICAvLyBEZXYgbm90ZTogV2UgZG9uJ3Qgc2V0IHRoZSBcIm5vdGlmaWNhdGlvbnNFbmFibGVkXCIgc2V0dGluZyB0byB0cnVlIGhlcmUgYmVjYXVzZSBpdCBpcyBhXG4gICAgICAgIC8vIGNhbGN1bGF0ZWQgdmFsdWUuIEl0IGlzIGRldGVybWluZWQgYmFzZWQgdXBvbiB3aGV0aGVyIG9yIG5vdCB0aGUgbWFzdGVyIHJ1bGUgaXMgZW5hYmxlZFxuICAgICAgICAvLyBhbmQgb3RoZXIgZmxhZ3MuIFNldHRpbmcgaXQgaGVyZSB3b3VsZCBjYXVzZSBhIGNpcmN1bGFyIHJlZmVyZW5jZS5cblxuICAgICAgICBBbmFseXRpY3MudHJhY2tFdmVudCgnTm90aWZpZXInLCAnU2V0IEVuYWJsZWQnLCBTdHJpbmcoZW5hYmxlKSk7XG5cbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgd2UgcGVyc2lzdCB0aGUgY3VycmVudCBzZXR0aW5nIGF1ZGlvX2VuYWJsZWQgc2V0dGluZ1xuICAgICAgICAvLyBiZWZvcmUgY2hhbmdpbmcgYW55dGhpbmdcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuaXNMZXZlbFN1cHBvcnRlZChTZXR0aW5nTGV2ZWwuREVWSUNFKSkge1xuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcImF1ZGlvTm90aWZpY2F0aW9uc0VuYWJsZWRcIiwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgdGhpcy5pc0VuYWJsZWQoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW5hYmxlKSB7XG4gICAgICAgICAgICAvLyBBdHRlbXB0IHRvIGdldCBwZXJtaXNzaW9uIGZyb20gdXNlclxuICAgICAgICAgICAgcGxhZi5yZXF1ZXN0Tm90aWZpY2F0aW9uUGVybWlzc2lvbigpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgIT09ICdncmFudGVkJykge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgcGVybWlzc2lvbiByZXF1ZXN0IHdhcyBkaXNtaXNzZWQgb3IgZGVuaWVkXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFN1cHBvcnQgYWx0ZXJuYXRpdmUgYnJhbmRpbmcgaW4gbWVzc2FnaW5nXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJyYW5kID0gU2RrQ29uZmlnLmdldCgpLmJyYW5kO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IHJlc3VsdCA9PT0gJ2RlbmllZCdcbiAgICAgICAgICAgICAgICAgICAgICAgID8gX3QoJyUoYnJhbmQpcyBkb2VzIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gc2VuZCB5b3Ugbm90aWZpY2F0aW9ucyAtICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwbGVhc2UgY2hlY2sgeW91ciBicm93c2VyIHNldHRpbmdzJywgeyBicmFuZCB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBfdCgnJShicmFuZClzIHdhcyBub3QgZ2l2ZW4gcGVybWlzc2lvbiB0byBzZW5kIG5vdGlmaWNhdGlvbnMgLSBwbGVhc2UgdHJ5IGFnYWluJywgeyBicmFuZCB9KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCdkaWFsb2dzLkVycm9yRGlhbG9nJyk7XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1VuYWJsZSB0byBlbmFibGUgTm90aWZpY2F0aW9ucycsIHJlc3VsdCwgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnVW5hYmxlIHRvIGVuYWJsZSBOb3RpZmljYXRpb25zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcIm5vdGlmaWVyX2VuYWJsZWRcIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRydWUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcIm5vdGlmaWVyX2VuYWJsZWRcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzZXQgdGhlIG5vdGlmaWNhdGlvbnNfaGlkZGVuIGZsYWcsIGFzIHRoZSB1c2VyIGhhcyBrbm93aW5nbHkgaW50ZXJhY3RlZFxuICAgICAgICAvLyB3aXRoIHRoZSBzZXR0aW5nIHdlIHNob3VsZG4ndCBuYWcgdGhlbSBhbnkgZnVydGhlclxuICAgICAgICB0aGlzLnNldFByb21wdEhpZGRlbih0cnVlKTtcbiAgICB9LFxuXG4gICAgaXNFbmFibGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNQb3NzaWJsZSgpICYmIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJub3RpZmljYXRpb25zRW5hYmxlZFwiKTtcbiAgICB9LFxuXG4gICAgaXNQb3NzaWJsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHBsYWYgPSBQbGF0Zm9ybVBlZy5nZXQoKTtcbiAgICAgICAgaWYgKCFwbGFmKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICghcGxhZi5zdXBwb3J0c05vdGlmaWNhdGlvbnMoKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoIXBsYWYubWF5U2VuZE5vdGlmaWNhdGlvbnMoKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBwb3NzaWJsZSwgYnV0IG5vdCBuZWNlc3NhcmlseSBlbmFibGVkXG4gICAgfSxcblxuICAgIGlzQm9keUVuYWJsZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0VuYWJsZWQoKSAmJiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwibm90aWZpY2F0aW9uQm9keUVuYWJsZWRcIik7XG4gICAgfSxcblxuICAgIGlzQXVkaW9FbmFibGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gV2UgZG9uJ3Qgcm91dGUgQXVkaW8gdmlhIHRoZSBIVE1MIE5vdGlmaWNhdGlvbnMgQVBJIHNvIGl0IGlzIHBvc3NpYmxlIHJlZ2FyZGxlc3Mgb2Ygb3RoZXIgdGhpbmdzXG4gICAgICAgIHJldHVybiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYXVkaW9Ob3RpZmljYXRpb25zRW5hYmxlZFwiKTtcbiAgICB9LFxuXG4gICAgc2V0UHJvbXB0SGlkZGVuOiBmdW5jdGlvbihoaWRkZW46IGJvb2xlYW4sIHBlcnNpc3RlbnQgPSB0cnVlKSB7XG4gICAgICAgIHRoaXMudG9vbGJhckhpZGRlbiA9IGhpZGRlbjtcblxuICAgICAgICBBbmFseXRpY3MudHJhY2tFdmVudCgnTm90aWZpZXInLCAnU2V0IFRvb2xiYXIgSGlkZGVuJywgU3RyaW5nKGhpZGRlbikpO1xuXG4gICAgICAgIGhpZGVOb3RpZmljYXRpb25zVG9hc3QoKTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIGluZm8gdG8gbG9jYWxTdG9yYWdlIGZvciBwZXJzaXN0ZW50IHNldHRpbmdzXG4gICAgICAgIGlmIChwZXJzaXN0ZW50ICYmIGdsb2JhbC5sb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgICAgIGdsb2JhbC5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm5vdGlmaWNhdGlvbnNfaGlkZGVuXCIsIFN0cmluZyhoaWRkZW4pKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzaG91bGRTaG93UHJvbXB0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlzR3Vlc3QgPSBjbGllbnQuaXNHdWVzdCgpO1xuICAgICAgICByZXR1cm4gIWlzR3Vlc3QgJiYgdGhpcy5zdXBwb3J0c0Rlc2t0b3BOb3RpZmljYXRpb25zKCkgJiYgIWlzUHVzaE5vdGlmeURpc2FibGVkKCkgJiZcbiAgICAgICAgICAgICF0aGlzLmlzRW5hYmxlZCgpICYmICF0aGlzLl9pc1Byb21wdEhpZGRlbigpO1xuICAgIH0sXG5cbiAgICBfaXNQcm9tcHRIaWRkZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBDaGVjayBsb2NhbFN0b3JhZ2UgZm9yIGFueSBzdWNoIG1ldGEgZGF0YVxuICAgICAgICBpZiAoZ2xvYmFsLmxvY2FsU3RvcmFnZSkge1xuICAgICAgICAgICAgcmV0dXJuIGdsb2JhbC5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm5vdGlmaWNhdGlvbnNfaGlkZGVuXCIpID09PSBcInRydWVcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnRvb2xiYXJIaWRkZW47XG4gICAgfSxcblxuICAgIG9uU3luY1N0YXRlQ2hhbmdlOiBmdW5jdGlvbihzdGF0ZTogc3RyaW5nKSB7XG4gICAgICAgIGlmIChzdGF0ZSA9PT0gXCJTWU5DSU5HXCIpIHtcbiAgICAgICAgICAgIHRoaXMuaXNTeW5jaW5nID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gXCJTVE9QUEVEXCIgfHwgc3RhdGUgPT09IFwiRVJST1JcIikge1xuICAgICAgICAgICAgdGhpcy5pc1N5bmNpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkV2ZW50OiBmdW5jdGlvbihldjogTWF0cml4RXZlbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzU3luY2luZykgcmV0dXJuOyAvLyBkb24ndCBhbGVydCBmb3IgYW55IG1lc3NhZ2VzIGluaXRpYWxseVxuICAgICAgICBpZiAoZXYuc2VuZGVyICYmIGV2LnNlbmRlci51c2VySWQgPT09IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVkZW50aWFscy51c2VySWQpIHJldHVybjtcblxuICAgICAgICAvLyBJZiBpdCdzIGFuIGVuY3J5cHRlZCBldmVudCBhbmQgdGhlIHR5cGUgaXMgc3RpbGwgJ20ucm9vbS5lbmNyeXB0ZWQnLFxuICAgICAgICAvLyBpdCBoYXNuJ3QgeWV0IGJlZW4gZGVjcnlwdGVkLCBzbyB3YWl0IHVudGlsIGl0IGlzLlxuICAgICAgICBpZiAoZXYuaXNCZWluZ0RlY3J5cHRlZCgpIHx8IGV2LmlzRGVjcnlwdGlvbkZhaWx1cmUoKSkge1xuICAgICAgICAgICAgdGhpcy5wZW5kaW5nRW5jcnlwdGVkRXZlbnRJZHMucHVzaChldi5nZXRJZCgpKTtcbiAgICAgICAgICAgIC8vIGRvbid0IGxldCB0aGUgbGlzdCBmaWxsIHVwIGluZGVmaW5pdGVseVxuICAgICAgICAgICAgd2hpbGUgKHRoaXMucGVuZGluZ0VuY3J5cHRlZEV2ZW50SWRzLmxlbmd0aCA+IE1BWF9QRU5ESU5HX0VOQ1JZUFRFRCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGVuZGluZ0VuY3J5cHRlZEV2ZW50SWRzLnNoaWZ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9ldmFsdWF0ZUV2ZW50KGV2KTtcbiAgICB9LFxuXG4gICAgb25FdmVudERlY3J5cHRlZDogZnVuY3Rpb24oZXY6IE1hdHJpeEV2ZW50KSB7XG4gICAgICAgIC8vICdkZWNyeXB0ZWQnIG1lYW5zIHRoZSBkZWNyeXB0aW9uIHByb2Nlc3MgaGFzIGZpbmlzaGVkOiBpdCBtYXkgaGF2ZSBmYWlsZWQsXG4gICAgICAgIC8vIGluIHdoaWNoIGNhc2UgaXQgbWlnaHQgZGVjcnlwdCBzb29uIGlmIHRoZSBrZXlzIGFycml2ZVxuICAgICAgICBpZiAoZXYuaXNEZWNyeXB0aW9uRmFpbHVyZSgpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgaWR4ID0gdGhpcy5wZW5kaW5nRW5jcnlwdGVkRXZlbnRJZHMuaW5kZXhPZihldi5nZXRJZCgpKTtcbiAgICAgICAgaWYgKGlkeCA9PT0gLTEpIHJldHVybjtcblxuICAgICAgICB0aGlzLnBlbmRpbmdFbmNyeXB0ZWRFdmVudElkcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgdGhpcy5fZXZhbHVhdGVFdmVudChldik7XG4gICAgfSxcblxuICAgIG9uUm9vbVJlY2VpcHQ6IGZ1bmN0aW9uKGV2OiBNYXRyaXhFdmVudCwgcm9vbTogUm9vbSkge1xuICAgICAgICBpZiAocm9vbS5nZXRVbnJlYWROb3RpZmljYXRpb25Db3VudCgpID09PSAwKSB7XG4gICAgICAgICAgICAvLyBpZGVhbGx5IHdlIHdvdWxkIGNsZWFyIGVhY2ggbm90aWZpY2F0aW9uIHdoZW4gaXQgd2FzIHJlYWQsXG4gICAgICAgICAgICAvLyBidXQgd2UgaGF2ZSBubyB3YXksIGdpdmVuIGEgcmVhZCByZWNlaXB0LCB0byBrbm93IHdoZXRoZXJcbiAgICAgICAgICAgIC8vIHRoZSByZWNlaXB0IGNvbWVzIGJlZm9yZSBvciBhZnRlciBhbiBldmVudCwgc28gd2UgY2FuJ3RcbiAgICAgICAgICAgIC8vIGRvIHRoaXMuIEluc3RlYWQsIGNsZWFyIGFsbCBub3RpZmljYXRpb25zIGZvciBhIHJvb20gb25jZVxuICAgICAgICAgICAgLy8gdGhlcmUgYXJlIG5vIG5vdGlmcyBsZWZ0IGluIHRoYXQgcm9vbS4sIHdoaWNoIGlzIG5vdCBxdWl0ZVxuICAgICAgICAgICAgLy8gYXMgZ29vZCBidXQgaXQncyBzb21ldGhpbmcuXG4gICAgICAgICAgICBjb25zdCBwbGFmID0gUGxhdGZvcm1QZWcuZ2V0KCk7XG4gICAgICAgICAgICBpZiAoIXBsYWYpIHJldHVybjtcbiAgICAgICAgICAgIGlmICh0aGlzLm5vdGlmc0J5Um9vbVtyb29tLnJvb21JZF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgZm9yIChjb25zdCBub3RpZiBvZiB0aGlzLm5vdGlmc0J5Um9vbVtyb29tLnJvb21JZF0pIHtcbiAgICAgICAgICAgICAgICBwbGFmLmNsZWFyTm90aWZpY2F0aW9uKG5vdGlmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm5vdGlmc0J5Um9vbVtyb29tLnJvb21JZF07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2V2YWx1YXRlRXZlbnQ6IGZ1bmN0aW9uKGV2KSB7XG4gICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShldi5nZXRSb29tSWQoKSk7XG4gICAgICAgIGNvbnN0IGFjdGlvbnMgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0UHVzaEFjdGlvbnNGb3JFdmVudChldik7XG4gICAgICAgIGlmIChhY3Rpb25zICYmIGFjdGlvbnMubm90aWZ5KSB7XG4gICAgICAgICAgICBpZiAoUm9vbVZpZXdTdG9yZS5nZXRSb29tSWQoKSA9PT0gcm9vbS5yb29tSWQgJiYgVXNlckFjdGl2aXR5LnNoYXJlZEluc3RhbmNlKCkudXNlckFjdGl2ZVJlY2VudGx5KCkpIHtcbiAgICAgICAgICAgICAgICAvLyBkb24ndCBib3RoZXIgbm90aWZ5aW5nIGFzIHVzZXIgd2FzIHJlY2VudGx5IGFjdGl2ZSBpbiB0aGlzIHJvb21cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImRvTm90RGlzdHVyYlwiKSkge1xuICAgICAgICAgICAgICAgIC8vIERvbid0IGJvdGhlciB0aGUgdXNlciBpZiB0aGV5IGRpZG4ndCBhc2sgdG8gYmUgYm90aGVyZWRcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzcGxheVBvcHVwTm90aWZpY2F0aW9uKGV2LCByb29tKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhY3Rpb25zLnR3ZWFrcy5zb3VuZCAmJiB0aGlzLmlzQXVkaW9FbmFibGVkKCkpIHtcbiAgICAgICAgICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5sb3VkTm90aWZpY2F0aW9uKGV2LCByb29tKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGF5QXVkaW9Ob3RpZmljYXRpb24oZXYsIHJvb20pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbn07XG5cbmlmICghd2luZG93Lm14Tm90aWZpZXIpIHtcbiAgICB3aW5kb3cubXhOb3RpZmllciA9IE5vdGlmaWVyO1xufVxuXG5leHBvcnQgZGVmYXVsdCB3aW5kb3cubXhOb3RpZmllcjtcbiJdfQ==