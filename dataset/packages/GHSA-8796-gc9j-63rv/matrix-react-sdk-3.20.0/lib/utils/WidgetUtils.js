"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var url = _interopRequireWildcard(require("url"));

var _MatrixClientPeg = require("../MatrixClientPeg");

var _SdkConfig = _interopRequireDefault(require("../SdkConfig"));

var _dispatcher = _interopRequireDefault(require("../dispatcher/dispatcher"));

var _WidgetEchoStore = _interopRequireDefault(require("../stores/WidgetEchoStore"));

var _SettingsStore = _interopRequireDefault(require("../settings/SettingsStore"));

var _IntegrationManagers = require("../integrations/IntegrationManagers");

var _WidgetType = require("../widgets/WidgetType");

var _objects = require("./objects");

var _languageHandler = require("../languageHandler");

var _matrixWidgetApi = require("matrix-widget-api");

/*
Copyright 2019 Travis Ralston
Copyright 2017 - 2020 The Matrix.org Foundation C.I.C.

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
// How long we wait for the state event echo to come back from the server
// before waitFor[Room/User]Widget rejects its promise
const WIDGET_WAIT_TIME = 20000;
/*:: export interface IWidgetEvent {
    id: string;
    type: string;
    sender: string;
    // eslint-disable-next-line camelcase
    state_key: string;
    content: Partial<IApp>;
}*/

class WidgetUtils {
  /* Returns true if user is able to send state events to modify widgets in this room
   * (Does not apply to non-room-based / user widgets)
   * @param roomId -- The ID of the room to check
   * @return Boolean -- true if the user can modify widgets in this room
   * @throws Error -- specifies the error reason
   */
  static canUserModifyWidgets(roomId
  /*: string*/
  )
  /*: boolean*/
  {
    if (!roomId) {
      console.warn('No room ID specified');
      return false;
    }

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (!client) {
      console.warn('User must be be logged in');
      return false;
    }

    const room = client.getRoom(roomId);

    if (!room) {
      console.warn(`Room ID ${roomId} is not recognised`);
      return false;
    }

    const me = client.credentials.userId;

    if (!me) {
      console.warn('Failed to get user ID');
      return false;
    }

    if (room.getMyMembership() !== "join") {
      console.warn(`User ${me} is not in room ${roomId}`);
      return false;
    } // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)


    return room.currentState.maySendStateEvent('im.vector.modular.widgets', me);
  } // TODO: Generify the name of this function. It's not just scalar.

  /**
   * Returns true if specified url is a scalar URL, typically https://scalar.vector.im/api
   * @param  {[type]}  testUrlString URL to check
   * @return {Boolean} True if specified URL is a scalar URL
   */


  static isScalarUrl(testUrlString
  /*: string*/
  )
  /*: boolean*/
  {
    if (!testUrlString) {
      console.error('Scalar URL check failed. No URL specified');
      return false;
    }

    const testUrl = url.parse(testUrlString);

    let scalarUrls = _SdkConfig.default.get().integrations_widgets_urls;

    if (!scalarUrls || scalarUrls.length === 0) {
      const defaultManager = _IntegrationManagers.IntegrationManagers.sharedInstance().getPrimaryManager();

      if (defaultManager) {
        scalarUrls = [defaultManager.apiUrl];
      } else {
        scalarUrls = [];
      }
    }

    for (let i = 0; i < scalarUrls.length; i++) {
      const scalarUrl = url.parse(scalarUrls[i]);

      if (testUrl && scalarUrl) {
        if (testUrl.protocol === scalarUrl.protocol && testUrl.host === scalarUrl.host && testUrl.pathname.startsWith(scalarUrl.pathname)) {
          return true;
        }
      }
    }

    return false;
  }
  /**
   * Returns a promise that resolves when a widget with the given
   * ID has been added as a user widget (ie. the accountData event
   * arrives) or rejects after a timeout
   *
   * @param {string} widgetId The ID of the widget to wait for
   * @param {boolean} add True to wait for the widget to be added,
   *     false to wait for it to be deleted.
   * @returns {Promise} that resolves when the widget is in the
   *     requested state according to the `add` param
   */


  static waitForUserWidget(widgetId
  /*: string*/
  , add
  /*: boolean*/
  )
  /*: Promise<void>*/
  {
    return new Promise((resolve, reject) => {
      // Tests an account data event, returning true if it's in the state
      // we're waiting for it to be in
      function eventInIntendedState(ev) {
        if (!ev || !ev.getContent()) return false;

        if (add) {
          return ev.getContent()[widgetId] !== undefined;
        } else {
          return ev.getContent()[widgetId] === undefined;
        }
      }

      const startingAccountDataEvent = _MatrixClientPeg.MatrixClientPeg.get().getAccountData('m.widgets');

      if (eventInIntendedState(startingAccountDataEvent)) {
        resolve();
        return;
      }

      function onAccountData(ev) {
        const currentAccountDataEvent = _MatrixClientPeg.MatrixClientPeg.get().getAccountData('m.widgets');

        if (eventInIntendedState(currentAccountDataEvent)) {
          _MatrixClientPeg.MatrixClientPeg.get().removeListener('accountData', onAccountData);

          clearTimeout(timerId);
          resolve();
        }
      }

      const timerId = setTimeout(() => {
        _MatrixClientPeg.MatrixClientPeg.get().removeListener('accountData', onAccountData);

        reject(new Error("Timed out waiting for widget ID " + widgetId + " to appear"));
      }, WIDGET_WAIT_TIME);

      _MatrixClientPeg.MatrixClientPeg.get().on('accountData', onAccountData);
    });
  }
  /**
   * Returns a promise that resolves when a widget with the given
   * ID has been added as a room widget in the given room (ie. the
   * room state event arrives) or rejects after a timeout
   *
   * @param {string} widgetId The ID of the widget to wait for
   * @param {string} roomId The ID of the room to wait for the widget in
   * @param {boolean} add True to wait for the widget to be added,
   *     false to wait for it to be deleted.
   * @returns {Promise} that resolves when the widget is in the
   *     requested state according to the `add` param
   */


  static waitForRoomWidget(widgetId
  /*: string*/
  , roomId
  /*: string*/
  , add
  /*: boolean*/
  )
  /*: Promise<void>*/
  {
    return new Promise((resolve, reject) => {
      // Tests a list of state events, returning true if it's in the state
      // we're waiting for it to be in
      function eventsInIntendedState(evList) {
        const widgetPresent = evList.some(ev => {
          return ev.getContent() && ev.getContent()['id'] === widgetId;
        });

        if (add) {
          return widgetPresent;
        } else {
          return !widgetPresent;
        }
      }

      const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId); // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)


      const startingWidgetEvents = room.currentState.getStateEvents('im.vector.modular.widgets');

      if (eventsInIntendedState(startingWidgetEvents)) {
        resolve();
        return;
      }

      function onRoomStateEvents(ev) {
        if (ev.getRoomId() !== roomId) return; // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)

        const currentWidgetEvents = room.currentState.getStateEvents('im.vector.modular.widgets');

        if (eventsInIntendedState(currentWidgetEvents)) {
          _MatrixClientPeg.MatrixClientPeg.get().removeListener('RoomState.events', onRoomStateEvents);

          clearTimeout(timerId);
          resolve();
        }
      }

      const timerId = setTimeout(() => {
        _MatrixClientPeg.MatrixClientPeg.get().removeListener('RoomState.events', onRoomStateEvents);

        reject(new Error("Timed out waiting for widget ID " + widgetId + " to appear"));
      }, WIDGET_WAIT_TIME);

      _MatrixClientPeg.MatrixClientPeg.get().on('RoomState.events', onRoomStateEvents);
    });
  }

  static setUserWidget(widgetId
  /*: string*/
  , widgetType
  /*: WidgetType*/
  , widgetUrl
  /*: string*/
  , widgetName
  /*: string*/
  , widgetData
  /*: IWidgetData*/
  ) {
    const content = {
      type: widgetType.preferred,
      url: widgetUrl,
      name: widgetName,
      data: widgetData
    };

    const client = _MatrixClientPeg.MatrixClientPeg.get(); // Get the current widgets and clone them before we modify them, otherwise
    // we'll modify the content of the old event.


    const userWidgets = (0, _objects.objectClone)(WidgetUtils.getUserWidgets()); // Delete existing widget with ID

    try {
      delete userWidgets[widgetId];
    } catch (e) {
      console.error(`$widgetId is non-configurable`);
    }

    const addingWidget = Boolean(widgetUrl); // Add new widget / update

    if (addingWidget) {
      userWidgets[widgetId] = {
        content: content,
        sender: client.getUserId(),
        state_key: widgetId,
        type: 'm.widget',
        id: widgetId
      };
    } // This starts listening for when the echo comes back from the server
    // since the widget won't appear added until this happens. If we don't
    // wait for this, the action will complete but if the user is fast enough,
    // the widget still won't actually be there.


    return client.setAccountData('m.widgets', userWidgets).then(() => {
      return WidgetUtils.waitForUserWidget(widgetId, addingWidget);
    }).then(() => {
      _dispatcher.default.dispatch({
        action: "user_widget_updated"
      });
    });
  }

  static setRoomWidget(roomId
  /*: string*/
  , widgetId
  /*: string*/
  , widgetType
  /*: WidgetType*/
  , widgetUrl
  /*: string*/
  , widgetName
  /*: string*/
  , widgetData
  /*: object*/
  ) {
    let content;
    const addingWidget = Boolean(widgetUrl);

    if (addingWidget) {
      content = {
        // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
        // For now we'll send the legacy event type for compatibility with older apps/elements
        type: widgetType.legacy,
        url: widgetUrl,
        name: widgetName,
        data: widgetData
      };
    } else {
      content = {};
    }

    return WidgetUtils.setRoomWidgetContent(roomId, widgetId, content);
  }

  static setRoomWidgetContent(roomId
  /*: string*/
  , widgetId
  /*: string*/
  , content
  /*: IWidget*/
  ) {
    const addingWidget = !!content.url;

    _WidgetEchoStore.default.setRoomWidgetEcho(roomId, widgetId, content);

    const client = _MatrixClientPeg.MatrixClientPeg.get(); // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)


    return client.sendStateEvent(roomId, "im.vector.modular.widgets", content, widgetId).then(() => {
      return WidgetUtils.waitForRoomWidget(widgetId, roomId, addingWidget);
    }).finally(() => {
      _WidgetEchoStore.default.removeRoomWidgetEcho(roomId, widgetId);
    });
  }
  /**
   * Get room specific widgets
   * @param  {Room} room The room to get widgets force
   * @return {[object]} Array containing current / active room widgets
   */


  static getRoomWidgets(room
  /*: Room*/
  ) {
    // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
    const appsStateEvents = room.currentState.getStateEvents('im.vector.modular.widgets');

    if (!appsStateEvents) {
      return [];
    }

    return appsStateEvents.filter(ev => {
      return ev.getContent().type && ev.getContent().url;
    });
  }
  /**
   * Get user specific widgets (not linked to a specific room)
   * @return {object} Event content object containing current / active user widgets
   */


  static getUserWidgets()
  /*: Record<string, IWidgetEvent>*/
  {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (!client) {
      throw new Error('User not logged in');
    }

    const userWidgets = client.getAccountData('m.widgets');

    if (userWidgets && userWidgets.getContent()) {
      return userWidgets.getContent();
    }

    return {};
  }
  /**
   * Get user specific widgets (not linked to a specific room) as an array
   * @return {[object]} Array containing current / active user widgets
   */


  static getUserWidgetsArray()
  /*: IWidgetEvent[]*/
  {
    return Object.values(WidgetUtils.getUserWidgets());
  }
  /**
   * Get active stickerpicker widgets (stickerpickers are user widgets by nature)
   * @return {[object]} Array containing current / active stickerpicker widgets
   */


  static getStickerpickerWidgets()
  /*: IWidgetEvent[]*/
  {
    const widgets = WidgetUtils.getUserWidgetsArray();
    return widgets.filter(widget => widget.content && widget.content.type === "m.stickerpicker");
  }
  /**
   * Get all integration manager widgets for this user.
   * @returns {Object[]} An array of integration manager user widgets.
   */


  static getIntegrationManagerWidgets()
  /*: IWidgetEvent[]*/
  {
    const widgets = WidgetUtils.getUserWidgetsArray();
    return widgets.filter(w => w.content && w.content.type === "m.integration_manager");
  }

  static getRoomWidgetsOfType(room
  /*: Room*/
  , type
  /*: WidgetType*/
  )
  /*: IWidgetEvent[]*/
  {
    const widgets = WidgetUtils.getRoomWidgets(room);
    return (widgets || []).filter(w => {
      const content = w.getContent();
      return content.url && type.matches(content.type);
    });
  }

  static removeIntegrationManagerWidgets()
  /*: Promise<void>*/
  {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (!client) {
      throw new Error('User not logged in');
    }

    const widgets = client.getAccountData('m.widgets');
    if (!widgets) return;
    const userWidgets
    /*: IWidgetEvent[]*/
    = widgets.getContent() || {};
    Object.entries(userWidgets).forEach(([key, widget]) => {
      if (widget.content && widget.content.type === "m.integration_manager") {
        delete userWidgets[key];
      }
    });
    return client.setAccountData('m.widgets', userWidgets);
  }

  static addIntegrationManagerWidget(name
  /*: string*/
  , uiUrl
  /*: string*/
  , apiUrl
  /*: string*/
  )
  /*: Promise<void>*/
  {
    return WidgetUtils.setUserWidget("integration_manager_" + new Date().getTime(), _WidgetType.WidgetType.INTEGRATION_MANAGER, uiUrl, "Integration Manager: " + name, {
      "api_url": apiUrl
    });
  }
  /**
   * Remove all stickerpicker widgets (stickerpickers are user widgets by nature)
   * @return {Promise} Resolves on account data updated
   */


  static removeStickerpickerWidgets()
  /*: Promise<void>*/
  {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (!client) {
      throw new Error('User not logged in');
    }

    const widgets = client.getAccountData('m.widgets');
    if (!widgets) return;
    const userWidgets
    /*: Record<string, IWidgetEvent>*/
    = widgets.getContent() || {};
    Object.entries(userWidgets).forEach(([key, widget]) => {
      if (widget.content && widget.content.type === 'm.stickerpicker') {
        delete userWidgets[key];
      }
    });
    return client.setAccountData('m.widgets', userWidgets);
  }

  static makeAppConfig(appId
  /*: string*/
  , app
  /*: Partial<IApp>*/
  , senderUserId
  /*: string*/
  , roomId
  /*: string | null*/
  , eventId
  /*: string*/
  )
  /*: IApp*/
  {
    if (!senderUserId) {
      throw new Error("Widgets must be created by someone - provide a senderUserId");
    }

    app.creatorUserId = senderUserId;
    app.id = appId;
    app.roomId = roomId;
    app.eventId = eventId;
    app.name = app.name || app.type;
    return app;
  }

  static getCapWhitelistForAppTypeInRoomId(appType
  /*: string*/
  , roomId
  /*: string*/
  )
  /*: Capability[]*/
  {
    const enableScreenshots = _SettingsStore.default.getValue("enableWidgetScreenshots", roomId);

    const capWhitelist = enableScreenshots ? [_matrixWidgetApi.MatrixCapabilities.Screenshots] : []; // Obviously anyone that can add a widget can claim it's a jitsi widget,
    // so this doesn't really offer much over the set of domains we load
    // widgets from at all, but it probably makes sense for sanity.

    if (_WidgetType.WidgetType.JITSI.matches(appType)) {
      capWhitelist.push(_matrixWidgetApi.MatrixCapabilities.AlwaysOnScreen);
    }

    return capWhitelist;
  }

  static getLocalJitsiWrapperUrl(opts
  /*: {forLocalRender?: boolean, auth?: string}*/
  = {}) {
    // NB. we can't just encodeURIComponent all of these because the $ signs need to be there
    const queryStringParts = ['conferenceDomain=$domain', 'conferenceId=$conferenceId', 'isAudioOnly=$isAudioOnly', 'displayName=$matrix_display_name', 'avatarUrl=$matrix_avatar_url', 'userId=$matrix_user_id', 'roomId=$matrix_room_id', 'theme=$theme', 'roomName=$roomName'];

    if (opts.auth) {
      queryStringParts.push(`auth=${opts.auth}`);
    }

    const queryString = queryStringParts.join('&');
    let baseUrl = window.location.href;

    if (window.location.protocol !== "https:" && !opts.forLocalRender) {
      // Use an external wrapper if we're not locally rendering the widget. This is usually
      // the URL that will end up in the widget event, so we want to make sure it's relatively
      // safe to send.
      // We'll end up using a local render URL when we see a Jitsi widget anyways, so this is
      // really just for backwards compatibility and to appease the spec.
      baseUrl = "https://app.element.io/";
    }

    const url = new URL("jitsi.html#" + queryString, baseUrl); // this strips hash fragment from baseUrl

    return url.href;
  }

  static getWidgetName(app
  /*: IApp*/
  )
  /*: string*/
  {
    return app?.name?.trim() || (0, _languageHandler._t)("Unknown App");
  }

  static getWidgetDataTitle(app
  /*: IApp*/
  )
  /*: string*/
  {
    return app?.data?.title?.trim() || "";
  }

  static editWidget(room
  /*: Room*/
  , app
  /*: IApp*/
  )
  /*: void*/
  {
    // TODO: Open the right manager for the widget
    if (_SettingsStore.default.getValue("feature_many_integration_managers")) {
      _IntegrationManagers.IntegrationManagers.sharedInstance().openAll(room, 'type_' + app.type, app.id);
    } else {
      _IntegrationManagers.IntegrationManagers.sharedInstance().getPrimaryManager().open(room, 'type_' + app.type, app.id);
    }
  }

  static isManagedByManager(app) {
    if (WidgetUtils.isScalarUrl(app.url)) {
      const managers = _IntegrationManagers.IntegrationManagers.sharedInstance();

      if (managers.hasManager()) {
        // TODO: Pick the right manager for the widget
        const defaultManager = managers.getPrimaryManager();
        return WidgetUtils.isScalarUrl(defaultManager.apiUrl);
      }
    }

    return false;
  }

}

exports.default = WidgetUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9XaWRnZXRVdGlscy50cyJdLCJuYW1lcyI6WyJXSURHRVRfV0FJVF9USU1FIiwiV2lkZ2V0VXRpbHMiLCJjYW5Vc2VyTW9kaWZ5V2lkZ2V0cyIsInJvb21JZCIsImNvbnNvbGUiLCJ3YXJuIiwiY2xpZW50IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwicm9vbSIsImdldFJvb20iLCJtZSIsImNyZWRlbnRpYWxzIiwidXNlcklkIiwiZ2V0TXlNZW1iZXJzaGlwIiwiY3VycmVudFN0YXRlIiwibWF5U2VuZFN0YXRlRXZlbnQiLCJpc1NjYWxhclVybCIsInRlc3RVcmxTdHJpbmciLCJlcnJvciIsInRlc3RVcmwiLCJ1cmwiLCJwYXJzZSIsInNjYWxhclVybHMiLCJTZGtDb25maWciLCJpbnRlZ3JhdGlvbnNfd2lkZ2V0c191cmxzIiwibGVuZ3RoIiwiZGVmYXVsdE1hbmFnZXIiLCJJbnRlZ3JhdGlvbk1hbmFnZXJzIiwic2hhcmVkSW5zdGFuY2UiLCJnZXRQcmltYXJ5TWFuYWdlciIsImFwaVVybCIsImkiLCJzY2FsYXJVcmwiLCJwcm90b2NvbCIsImhvc3QiLCJwYXRobmFtZSIsInN0YXJ0c1dpdGgiLCJ3YWl0Rm9yVXNlcldpZGdldCIsIndpZGdldElkIiwiYWRkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJldmVudEluSW50ZW5kZWRTdGF0ZSIsImV2IiwiZ2V0Q29udGVudCIsInVuZGVmaW5lZCIsInN0YXJ0aW5nQWNjb3VudERhdGFFdmVudCIsImdldEFjY291bnREYXRhIiwib25BY2NvdW50RGF0YSIsImN1cnJlbnRBY2NvdW50RGF0YUV2ZW50IiwicmVtb3ZlTGlzdGVuZXIiLCJjbGVhclRpbWVvdXQiLCJ0aW1lcklkIiwic2V0VGltZW91dCIsIkVycm9yIiwib24iLCJ3YWl0Rm9yUm9vbVdpZGdldCIsImV2ZW50c0luSW50ZW5kZWRTdGF0ZSIsImV2TGlzdCIsIndpZGdldFByZXNlbnQiLCJzb21lIiwic3RhcnRpbmdXaWRnZXRFdmVudHMiLCJnZXRTdGF0ZUV2ZW50cyIsIm9uUm9vbVN0YXRlRXZlbnRzIiwiZ2V0Um9vbUlkIiwiY3VycmVudFdpZGdldEV2ZW50cyIsInNldFVzZXJXaWRnZXQiLCJ3aWRnZXRUeXBlIiwid2lkZ2V0VXJsIiwid2lkZ2V0TmFtZSIsIndpZGdldERhdGEiLCJjb250ZW50IiwidHlwZSIsInByZWZlcnJlZCIsIm5hbWUiLCJkYXRhIiwidXNlcldpZGdldHMiLCJnZXRVc2VyV2lkZ2V0cyIsImUiLCJhZGRpbmdXaWRnZXQiLCJCb29sZWFuIiwic2VuZGVyIiwiZ2V0VXNlcklkIiwic3RhdGVfa2V5IiwiaWQiLCJzZXRBY2NvdW50RGF0YSIsInRoZW4iLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInNldFJvb21XaWRnZXQiLCJsZWdhY3kiLCJzZXRSb29tV2lkZ2V0Q29udGVudCIsIldpZGdldEVjaG9TdG9yZSIsInNldFJvb21XaWRnZXRFY2hvIiwic2VuZFN0YXRlRXZlbnQiLCJmaW5hbGx5IiwicmVtb3ZlUm9vbVdpZGdldEVjaG8iLCJnZXRSb29tV2lkZ2V0cyIsImFwcHNTdGF0ZUV2ZW50cyIsImZpbHRlciIsImdldFVzZXJXaWRnZXRzQXJyYXkiLCJPYmplY3QiLCJ2YWx1ZXMiLCJnZXRTdGlja2VycGlja2VyV2lkZ2V0cyIsIndpZGdldHMiLCJ3aWRnZXQiLCJnZXRJbnRlZ3JhdGlvbk1hbmFnZXJXaWRnZXRzIiwidyIsImdldFJvb21XaWRnZXRzT2ZUeXBlIiwibWF0Y2hlcyIsInJlbW92ZUludGVncmF0aW9uTWFuYWdlcldpZGdldHMiLCJlbnRyaWVzIiwiZm9yRWFjaCIsImtleSIsImFkZEludGVncmF0aW9uTWFuYWdlcldpZGdldCIsInVpVXJsIiwiRGF0ZSIsImdldFRpbWUiLCJXaWRnZXRUeXBlIiwiSU5URUdSQVRJT05fTUFOQUdFUiIsInJlbW92ZVN0aWNrZXJwaWNrZXJXaWRnZXRzIiwibWFrZUFwcENvbmZpZyIsImFwcElkIiwiYXBwIiwic2VuZGVyVXNlcklkIiwiZXZlbnRJZCIsImNyZWF0b3JVc2VySWQiLCJnZXRDYXBXaGl0ZWxpc3RGb3JBcHBUeXBlSW5Sb29tSWQiLCJhcHBUeXBlIiwiZW5hYmxlU2NyZWVuc2hvdHMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJjYXBXaGl0ZWxpc3QiLCJNYXRyaXhDYXBhYmlsaXRpZXMiLCJTY3JlZW5zaG90cyIsIkpJVFNJIiwicHVzaCIsIkFsd2F5c09uU2NyZWVuIiwiZ2V0TG9jYWxKaXRzaVdyYXBwZXJVcmwiLCJvcHRzIiwicXVlcnlTdHJpbmdQYXJ0cyIsImF1dGgiLCJxdWVyeVN0cmluZyIsImpvaW4iLCJiYXNlVXJsIiwid2luZG93IiwibG9jYXRpb24iLCJocmVmIiwiZm9yTG9jYWxSZW5kZXIiLCJVUkwiLCJnZXRXaWRnZXROYW1lIiwidHJpbSIsImdldFdpZGdldERhdGFUaXRsZSIsInRpdGxlIiwiZWRpdFdpZGdldCIsIm9wZW5BbGwiLCJvcGVuIiwiaXNNYW5hZ2VkQnlNYW5hZ2VyIiwibWFuYWdlcnMiLCJoYXNNYW5hZ2VyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUE3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFpQkE7QUFDQTtBQUNBLE1BQU1BLGdCQUFnQixHQUFHLEtBQXpCOztBQWxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF1Q2UsTUFBTUMsV0FBTixDQUFrQjtBQUM3QjtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSSxTQUFPQyxvQkFBUCxDQUE0QkM7QUFBNUI7QUFBQTtBQUFBO0FBQXFEO0FBQ2pELFFBQUksQ0FBQ0EsTUFBTCxFQUFhO0FBQ1RDLE1BQUFBLE9BQU8sQ0FBQ0MsSUFBUixDQUFhLHNCQUFiO0FBQ0EsYUFBTyxL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dGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVHJhdmlzIFJhbHN0b25cbkNvcHlyaWdodCAyMDE3IC0gMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCAqIGFzIHVybCBmcm9tIFwidXJsXCI7XG5cbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgZGlzIGZyb20gJy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgV2lkZ2V0RWNob1N0b3JlIGZyb20gJy4uL3N0b3Jlcy9XaWRnZXRFY2hvU3RvcmUnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7SW50ZWdyYXRpb25NYW5hZ2Vyc30gZnJvbSBcIi4uL2ludGVncmF0aW9ucy9JbnRlZ3JhdGlvbk1hbmFnZXJzXCI7XG5pbXBvcnQge1Jvb219IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHtXaWRnZXRUeXBlfSBmcm9tIFwiLi4vd2lkZ2V0cy9XaWRnZXRUeXBlXCI7XG5pbXBvcnQge29iamVjdENsb25lfSBmcm9tIFwiLi9vYmplY3RzXCI7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQge0NhcGFiaWxpdHksIElXaWRnZXQsIElXaWRnZXREYXRhLCBNYXRyaXhDYXBhYmlsaXRpZXN9IGZyb20gXCJtYXRyaXgtd2lkZ2V0LWFwaVwiO1xuaW1wb3J0IHtJQXBwfSBmcm9tIFwiLi4vc3RvcmVzL1dpZGdldFN0b3JlXCI7XG5cbi8vIEhvdyBsb25nIHdlIHdhaXQgZm9yIHRoZSBzdGF0ZSBldmVudCBlY2hvIHRvIGNvbWUgYmFjayBmcm9tIHRoZSBzZXJ2ZXJcbi8vIGJlZm9yZSB3YWl0Rm9yW1Jvb20vVXNlcl1XaWRnZXQgcmVqZWN0cyBpdHMgcHJvbWlzZVxuY29uc3QgV0lER0VUX1dBSVRfVElNRSA9IDIwMDAwO1xuXG5leHBvcnQgaW50ZXJmYWNlIElXaWRnZXRFdmVudCB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB0eXBlOiBzdHJpbmc7XG4gICAgc2VuZGVyOiBzdHJpbmc7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgIHN0YXRlX2tleTogc3RyaW5nO1xuICAgIGNvbnRlbnQ6IFBhcnRpYWw8SUFwcD47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdpZGdldFV0aWxzIHtcbiAgICAvKiBSZXR1cm5zIHRydWUgaWYgdXNlciBpcyBhYmxlIHRvIHNlbmQgc3RhdGUgZXZlbnRzIHRvIG1vZGlmeSB3aWRnZXRzIGluIHRoaXMgcm9vbVxuICAgICAqIChEb2VzIG5vdCBhcHBseSB0byBub24tcm9vbS1iYXNlZCAvIHVzZXIgd2lkZ2V0cylcbiAgICAgKiBAcGFyYW0gcm9vbUlkIC0tIFRoZSBJRCBvZiB0aGUgcm9vbSB0byBjaGVja1xuICAgICAqIEByZXR1cm4gQm9vbGVhbiAtLSB0cnVlIGlmIHRoZSB1c2VyIGNhbiBtb2RpZnkgd2lkZ2V0cyBpbiB0aGlzIHJvb21cbiAgICAgKiBAdGhyb3dzIEVycm9yIC0tIHNwZWNpZmllcyB0aGUgZXJyb3IgcmVhc29uXG4gICAgICovXG4gICAgc3RhdGljIGNhblVzZXJNb2RpZnlXaWRnZXRzKHJvb21JZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghcm9vbUlkKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHJvb20gSUQgc3BlY2lmaWVkJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmICghY2xpZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1VzZXIgbXVzdCBiZSBiZSBsb2dnZWQgaW4nKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgUm9vbSBJRCAke3Jvb21JZH0gaXMgbm90IHJlY29nbmlzZWRgKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1lID0gY2xpZW50LmNyZWRlbnRpYWxzLnVzZXJJZDtcbiAgICAgICAgaWYgKCFtZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdGYWlsZWQgdG8gZ2V0IHVzZXIgSUQnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyb29tLmdldE15TWVtYmVyc2hpcCgpICE9PSBcImpvaW5cIikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBVc2VyICR7bWV9IGlzIG5vdCBpbiByb29tICR7cm9vbUlkfWApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETzogRW5hYmxlIHN1cHBvcnQgZm9yIG0ud2lkZ2V0IGV2ZW50IHR5cGUgKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEzMTExKVxuICAgICAgICByZXR1cm4gcm9vbS5jdXJyZW50U3RhdGUubWF5U2VuZFN0YXRlRXZlbnQoJ2ltLnZlY3Rvci5tb2R1bGFyLndpZGdldHMnLCBtZSk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogR2VuZXJpZnkgdGhlIG5hbWUgb2YgdGhpcyBmdW5jdGlvbi4gSXQncyBub3QganVzdCBzY2FsYXIuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHNwZWNpZmllZCB1cmwgaXMgYSBzY2FsYXIgVVJMLCB0eXBpY2FsbHkgaHR0cHM6Ly9zY2FsYXIudmVjdG9yLmltL2FwaVxuICAgICAqIEBwYXJhbSAge1t0eXBlXX0gIHRlc3RVcmxTdHJpbmcgVVJMIHRvIGNoZWNrXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gVHJ1ZSBpZiBzcGVjaWZpZWQgVVJMIGlzIGEgc2NhbGFyIFVSTFxuICAgICAqL1xuICAgIHN0YXRpYyBpc1NjYWxhclVybCh0ZXN0VXJsU3RyaW5nOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0ZXN0VXJsU3RyaW5nKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdTY2FsYXIgVVJMIGNoZWNrIGZhaWxlZC4gTm8gVVJMIHNwZWNpZmllZCcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGVzdFVybCA9IHVybC5wYXJzZSh0ZXN0VXJsU3RyaW5nKTtcbiAgICAgICAgbGV0IHNjYWxhclVybHMgPSBTZGtDb25maWcuZ2V0KCkuaW50ZWdyYXRpb25zX3dpZGdldHNfdXJscztcbiAgICAgICAgaWYgKCFzY2FsYXJVcmxzIHx8IHNjYWxhclVybHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0TWFuYWdlciA9IEludGVncmF0aW9uTWFuYWdlcnMuc2hhcmVkSW5zdGFuY2UoKS5nZXRQcmltYXJ5TWFuYWdlcigpO1xuICAgICAgICAgICAgaWYgKGRlZmF1bHRNYW5hZ2VyKSB7XG4gICAgICAgICAgICAgICAgc2NhbGFyVXJscyA9IFtkZWZhdWx0TWFuYWdlci5hcGlVcmxdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzY2FsYXJVcmxzID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjYWxhclVybHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHNjYWxhclVybCA9IHVybC5wYXJzZShzY2FsYXJVcmxzW2ldKTtcbiAgICAgICAgICAgIGlmICh0ZXN0VXJsICYmIHNjYWxhclVybCkge1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgdGVzdFVybC5wcm90b2NvbCA9PT0gc2NhbGFyVXJsLnByb3RvY29sICYmXG4gICAgICAgICAgICAgICAgICAgIHRlc3RVcmwuaG9zdCA9PT0gc2NhbGFyVXJsLmhvc3QgJiZcbiAgICAgICAgICAgICAgICAgICAgdGVzdFVybC5wYXRobmFtZS5zdGFydHNXaXRoKHNjYWxhclVybC5wYXRobmFtZSlcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gYSB3aWRnZXQgd2l0aCB0aGUgZ2l2ZW5cbiAgICAgKiBJRCBoYXMgYmVlbiBhZGRlZCBhcyBhIHVzZXIgd2lkZ2V0IChpZS4gdGhlIGFjY291bnREYXRhIGV2ZW50XG4gICAgICogYXJyaXZlcykgb3IgcmVqZWN0cyBhZnRlciBhIHRpbWVvdXRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3aWRnZXRJZCBUaGUgSUQgb2YgdGhlIHdpZGdldCB0byB3YWl0IGZvclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gYWRkIFRydWUgdG8gd2FpdCBmb3IgdGhlIHdpZGdldCB0byBiZSBhZGRlZCxcbiAgICAgKiAgICAgZmFsc2UgdG8gd2FpdCBmb3IgaXQgdG8gYmUgZGVsZXRlZC5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gdGhhdCByZXNvbHZlcyB3aGVuIHRoZSB3aWRnZXQgaXMgaW4gdGhlXG4gICAgICogICAgIHJlcXVlc3RlZCBzdGF0ZSBhY2NvcmRpbmcgdG8gdGhlIGBhZGRgIHBhcmFtXG4gICAgICovXG4gICAgc3RhdGljIHdhaXRGb3JVc2VyV2lkZ2V0KHdpZGdldElkOiBzdHJpbmcsIGFkZDogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgLy8gVGVzdHMgYW4gYWNjb3VudCBkYXRhIGV2ZW50LCByZXR1cm5pbmcgdHJ1ZSBpZiBpdCdzIGluIHRoZSBzdGF0ZVxuICAgICAgICAgICAgLy8gd2UncmUgd2FpdGluZyBmb3IgaXQgdG8gYmUgaW5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGV2ZW50SW5JbnRlbmRlZFN0YXRlKGV2KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFldiB8fCAhZXYuZ2V0Q29udGVudCgpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGFkZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXYuZ2V0Q29udGVudCgpW3dpZGdldElkXSAhPT0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBldi5nZXRDb250ZW50KClbd2lkZ2V0SWRdID09PSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBzdGFydGluZ0FjY291bnREYXRhRXZlbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0QWNjb3VudERhdGEoJ20ud2lkZ2V0cycpO1xuICAgICAgICAgICAgaWYgKGV2ZW50SW5JbnRlbmRlZFN0YXRlKHN0YXJ0aW5nQWNjb3VudERhdGFFdmVudCkpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBvbkFjY291bnREYXRhKGV2KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudEFjY291bnREYXRhRXZlbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0QWNjb3VudERhdGEoJ20ud2lkZ2V0cycpO1xuICAgICAgICAgICAgICAgIGlmIChldmVudEluSW50ZW5kZWRTdGF0ZShjdXJyZW50QWNjb3VudERhdGFFdmVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKCdhY2NvdW50RGF0YScsIG9uQWNjb3VudERhdGEpO1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKCdhY2NvdW50RGF0YScsIG9uQWNjb3VudERhdGEpO1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJUaW1lZCBvdXQgd2FpdGluZyBmb3Igd2lkZ2V0IElEIFwiICsgd2lkZ2V0SWQgKyBcIiB0byBhcHBlYXJcIikpO1xuICAgICAgICAgICAgfSwgV0lER0VUX1dBSVRfVElNRSk7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oJ2FjY291bnREYXRhJywgb25BY2NvdW50RGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBhIHdpZGdldCB3aXRoIHRoZSBnaXZlblxuICAgICAqIElEIGhhcyBiZWVuIGFkZGVkIGFzIGEgcm9vbSB3aWRnZXQgaW4gdGhlIGdpdmVuIHJvb20gKGllLiB0aGVcbiAgICAgKiByb29tIHN0YXRlIGV2ZW50IGFycml2ZXMpIG9yIHJlamVjdHMgYWZ0ZXIgYSB0aW1lb3V0XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gd2lkZ2V0SWQgVGhlIElEIG9mIHRoZSB3aWRnZXQgdG8gd2FpdCBmb3JcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcm9vbUlkIFRoZSBJRCBvZiB0aGUgcm9vbSB0byB3YWl0IGZvciB0aGUgd2lkZ2V0IGluXG4gICAgICogQHBhcmFtIHtib29sZWFufSBhZGQgVHJ1ZSB0byB3YWl0IGZvciB0aGUgd2lkZ2V0IHRvIGJlIGFkZGVkLFxuICAgICAqICAgICBmYWxzZSB0byB3YWl0IGZvciBpdCB0byBiZSBkZWxldGVkLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHdpZGdldCBpcyBpbiB0aGVcbiAgICAgKiAgICAgcmVxdWVzdGVkIHN0YXRlIGFjY29yZGluZyB0byB0aGUgYGFkZGAgcGFyYW1cbiAgICAgKi9cbiAgICBzdGF0aWMgd2FpdEZvclJvb21XaWRnZXQod2lkZ2V0SWQ6IHN0cmluZywgcm9vbUlkOiBzdHJpbmcsIGFkZDogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgLy8gVGVzdHMgYSBsaXN0IG9mIHN0YXRlIGV2ZW50cywgcmV0dXJuaW5nIHRydWUgaWYgaXQncyBpbiB0aGUgc3RhdGVcbiAgICAgICAgICAgIC8vIHdlJ3JlIHdhaXRpbmcgZm9yIGl0IHRvIGJlIGluXG4gICAgICAgICAgICBmdW5jdGlvbiBldmVudHNJbkludGVuZGVkU3RhdGUoZXZMaXN0KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgd2lkZ2V0UHJlc2VudCA9IGV2TGlzdC5zb21lKChldikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXYuZ2V0Q29udGVudCgpICYmIGV2LmdldENvbnRlbnQoKVsnaWQnXSA9PT0gd2lkZ2V0SWQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGFkZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2lkZ2V0UHJlc2VudDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIXdpZGdldFByZXNlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgIC8vIFRPRE86IEVuYWJsZSBzdXBwb3J0IGZvciBtLndpZGdldCBldmVudCB0eXBlIChodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xMzExMSlcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0aW5nV2lkZ2V0RXZlbnRzID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoJ2ltLnZlY3Rvci5tb2R1bGFyLndpZGdldHMnKTtcbiAgICAgICAgICAgIGlmIChldmVudHNJbkludGVuZGVkU3RhdGUoc3RhcnRpbmdXaWRnZXRFdmVudHMpKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gb25Sb29tU3RhdGVFdmVudHMoZXYpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXYuZ2V0Um9vbUlkKCkgIT09IHJvb21JZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogRW5hYmxlIHN1cHBvcnQgZm9yIG0ud2lkZ2V0IGV2ZW50IHR5cGUgKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEzMTExKVxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRXaWRnZXRFdmVudHMgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnaW0udmVjdG9yLm1vZHVsYXIud2lkZ2V0cycpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50c0luSW50ZW5kZWRTdGF0ZShjdXJyZW50V2lkZ2V0RXZlbnRzKSkge1xuICAgICAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoJ1Jvb21TdGF0ZS5ldmVudHMnLCBvblJvb21TdGF0ZUV2ZW50cyk7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoJ1Jvb21TdGF0ZS5ldmVudHMnLCBvblJvb21TdGF0ZUV2ZW50cyk7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlRpbWVkIG91dCB3YWl0aW5nIGZvciB3aWRnZXQgSUQgXCIgKyB3aWRnZXRJZCArIFwiIHRvIGFwcGVhclwiKSk7XG4gICAgICAgICAgICB9LCBXSURHRVRfV0FJVF9USU1FKTtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbignUm9vbVN0YXRlLmV2ZW50cycsIG9uUm9vbVN0YXRlRXZlbnRzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIHNldFVzZXJXaWRnZXQoXG4gICAgICAgIHdpZGdldElkOiBzdHJpbmcsXG4gICAgICAgIHdpZGdldFR5cGU6IFdpZGdldFR5cGUsXG4gICAgICAgIHdpZGdldFVybDogc3RyaW5nLFxuICAgICAgICB3aWRnZXROYW1lOiBzdHJpbmcsXG4gICAgICAgIHdpZGdldERhdGE6IElXaWRnZXREYXRhLFxuICAgICkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0ge1xuICAgICAgICAgICAgdHlwZTogd2lkZ2V0VHlwZS5wcmVmZXJyZWQsXG4gICAgICAgICAgICB1cmw6IHdpZGdldFVybCxcbiAgICAgICAgICAgIG5hbWU6IHdpZGdldE5hbWUsXG4gICAgICAgICAgICBkYXRhOiB3aWRnZXREYXRhLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IHdpZGdldHMgYW5kIGNsb25lIHRoZW0gYmVmb3JlIHdlIG1vZGlmeSB0aGVtLCBvdGhlcndpc2VcbiAgICAgICAgLy8gd2UnbGwgbW9kaWZ5IHRoZSBjb250ZW50IG9mIHRoZSBvbGQgZXZlbnQuXG4gICAgICAgIGNvbnN0IHVzZXJXaWRnZXRzID0gb2JqZWN0Q2xvbmUoV2lkZ2V0VXRpbHMuZ2V0VXNlcldpZGdldHMoKSk7XG5cbiAgICAgICAgLy8gRGVsZXRlIGV4aXN0aW5nIHdpZGdldCB3aXRoIElEXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBkZWxldGUgdXNlcldpZGdldHNbd2lkZ2V0SWRdO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGAkd2lkZ2V0SWQgaXMgbm9uLWNvbmZpZ3VyYWJsZWApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWRkaW5nV2lkZ2V0ID0gQm9vbGVhbih3aWRnZXRVcmwpO1xuXG4gICAgICAgIC8vIEFkZCBuZXcgd2lkZ2V0IC8gdXBkYXRlXG4gICAgICAgIGlmIChhZGRpbmdXaWRnZXQpIHtcbiAgICAgICAgICAgIHVzZXJXaWRnZXRzW3dpZGdldElkXSA9IHtcbiAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50LFxuICAgICAgICAgICAgICAgIHNlbmRlcjogY2xpZW50LmdldFVzZXJJZCgpLFxuICAgICAgICAgICAgICAgIHN0YXRlX2tleTogd2lkZ2V0SWQsXG4gICAgICAgICAgICAgICAgdHlwZTogJ20ud2lkZ2V0JyxcbiAgICAgICAgICAgICAgICBpZDogd2lkZ2V0SWQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhpcyBzdGFydHMgbGlzdGVuaW5nIGZvciB3aGVuIHRoZSBlY2hvIGNvbWVzIGJhY2sgZnJvbSB0aGUgc2VydmVyXG4gICAgICAgIC8vIHNpbmNlIHRoZSB3aWRnZXQgd29uJ3QgYXBwZWFyIGFkZGVkIHVudGlsIHRoaXMgaGFwcGVucy4gSWYgd2UgZG9uJ3RcbiAgICAgICAgLy8gd2FpdCBmb3IgdGhpcywgdGhlIGFjdGlvbiB3aWxsIGNvbXBsZXRlIGJ1dCBpZiB0aGUgdXNlciBpcyBmYXN0IGVub3VnaCxcbiAgICAgICAgLy8gdGhlIHdpZGdldCBzdGlsbCB3b24ndCBhY3R1YWxseSBiZSB0aGVyZS5cbiAgICAgICAgcmV0dXJuIGNsaWVudC5zZXRBY2NvdW50RGF0YSgnbS53aWRnZXRzJywgdXNlcldpZGdldHMpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFdpZGdldFV0aWxzLndhaXRGb3JVc2VyV2lkZ2V0KHdpZGdldElkLCBhZGRpbmdXaWRnZXQpO1xuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogXCJ1c2VyX3dpZGdldF91cGRhdGVkXCIgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBzZXRSb29tV2lkZ2V0KFxuICAgICAgICByb29tSWQ6IHN0cmluZyxcbiAgICAgICAgd2lkZ2V0SWQ6IHN0cmluZyxcbiAgICAgICAgd2lkZ2V0VHlwZT86IFdpZGdldFR5cGUsXG4gICAgICAgIHdpZGdldFVybD86IHN0cmluZyxcbiAgICAgICAgd2lkZ2V0TmFtZT86IHN0cmluZyxcbiAgICAgICAgd2lkZ2V0RGF0YT86IG9iamVjdCxcbiAgICApIHtcbiAgICAgICAgbGV0IGNvbnRlbnQ7XG5cbiAgICAgICAgY29uc3QgYWRkaW5nV2lkZ2V0ID0gQm9vbGVhbih3aWRnZXRVcmwpO1xuXG4gICAgICAgIGlmIChhZGRpbmdXaWRnZXQpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogRW5hYmxlIHN1cHBvcnQgZm9yIG0ud2lkZ2V0IGV2ZW50IHR5cGUgKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEzMTExKVxuICAgICAgICAgICAgICAgIC8vIEZvciBub3cgd2UnbGwgc2VuZCB0aGUgbGVnYWN5IGV2ZW50IHR5cGUgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBvbGRlciBhcHBzL2VsZW1lbnRzXG4gICAgICAgICAgICAgICAgdHlwZTogd2lkZ2V0VHlwZS5sZWdhY3ksXG4gICAgICAgICAgICAgICAgdXJsOiB3aWRnZXRVcmwsXG4gICAgICAgICAgICAgICAgbmFtZTogd2lkZ2V0TmFtZSxcbiAgICAgICAgICAgICAgICBkYXRhOiB3aWRnZXREYXRhLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBXaWRnZXRVdGlscy5zZXRSb29tV2lkZ2V0Q29udGVudChyb29tSWQsIHdpZGdldElkLCBjb250ZW50KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgc2V0Um9vbVdpZGdldENvbnRlbnQoXG4gICAgICAgIHJvb21JZDogc3RyaW5nLFxuICAgICAgICB3aWRnZXRJZDogc3RyaW5nLFxuICAgICAgICBjb250ZW50OiBJV2lkZ2V0LFxuICAgICkge1xuICAgICAgICBjb25zdCBhZGRpbmdXaWRnZXQgPSAhIWNvbnRlbnQudXJsO1xuXG4gICAgICAgIFdpZGdldEVjaG9TdG9yZS5zZXRSb29tV2lkZ2V0RWNobyhyb29tSWQsIHdpZGdldElkLCBjb250ZW50KTtcblxuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIC8vIFRPRE86IEVuYWJsZSBzdXBwb3J0IGZvciBtLndpZGdldCBldmVudCB0eXBlIChodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xMzExMSlcbiAgICAgICAgcmV0dXJuIGNsaWVudC5zZW5kU3RhdGVFdmVudChyb29tSWQsIFwiaW0udmVjdG9yLm1vZHVsYXIud2lkZ2V0c1wiLCBjb250ZW50LCB3aWRnZXRJZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gV2lkZ2V0VXRpbHMud2FpdEZvclJvb21XaWRnZXQod2lkZ2V0SWQsIHJvb21JZCwgYWRkaW5nV2lkZ2V0KTtcbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICBXaWRnZXRFY2hvU3RvcmUucmVtb3ZlUm9vbVdpZGdldEVjaG8ocm9vbUlkLCB3aWRnZXRJZCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCByb29tIHNwZWNpZmljIHdpZGdldHNcbiAgICAgKiBAcGFyYW0gIHtSb29tfSByb29tIFRoZSByb29tIHRvIGdldCB3aWRnZXRzIGZvcmNlXG4gICAgICogQHJldHVybiB7W29iamVjdF19IEFycmF5IGNvbnRhaW5pbmcgY3VycmVudCAvIGFjdGl2ZSByb29tIHdpZGdldHNcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0Um9vbVdpZGdldHMocm9vbTogUm9vbSkge1xuICAgICAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS53aWRnZXQgZXZlbnQgdHlwZSAoaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTMxMTEpXG4gICAgICAgIGNvbnN0IGFwcHNTdGF0ZUV2ZW50cyA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKCdpbS52ZWN0b3IubW9kdWxhci53aWRnZXRzJyk7XG4gICAgICAgIGlmICghYXBwc1N0YXRlRXZlbnRzKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXBwc1N0YXRlRXZlbnRzLmZpbHRlcigoZXYpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBldi5nZXRDb250ZW50KCkudHlwZSAmJiBldi5nZXRDb250ZW50KCkudXJsO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdXNlciBzcGVjaWZpYyB3aWRnZXRzIChub3QgbGlua2VkIHRvIGEgc3BlY2lmaWMgcm9vbSlcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IEV2ZW50IGNvbnRlbnQgb2JqZWN0IGNvbnRhaW5pbmcgY3VycmVudCAvIGFjdGl2ZSB1c2VyIHdpZGdldHNcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0VXNlcldpZGdldHMoKTogUmVjb3JkPHN0cmluZywgSVdpZGdldEV2ZW50PiB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKCFjbGllbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVXNlciBub3QgbG9nZ2VkIGluJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXNlcldpZGdldHMgPSBjbGllbnQuZ2V0QWNjb3VudERhdGEoJ20ud2lkZ2V0cycpO1xuICAgICAgICBpZiAodXNlcldpZGdldHMgJiYgdXNlcldpZGdldHMuZ2V0Q29udGVudCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdXNlcldpZGdldHMuZ2V0Q29udGVudCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdXNlciBzcGVjaWZpYyB3aWRnZXRzIChub3QgbGlua2VkIHRvIGEgc3BlY2lmaWMgcm9vbSkgYXMgYW4gYXJyYXlcbiAgICAgKiBAcmV0dXJuIHtbb2JqZWN0XX0gQXJyYXkgY29udGFpbmluZyBjdXJyZW50IC8gYWN0aXZlIHVzZXIgd2lkZ2V0c1xuICAgICAqL1xuICAgIHN0YXRpYyBnZXRVc2VyV2lkZ2V0c0FycmF5KCk6IElXaWRnZXRFdmVudFtdIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXMoV2lkZ2V0VXRpbHMuZ2V0VXNlcldpZGdldHMoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFjdGl2ZSBzdGlja2VycGlja2VyIHdpZGdldHMgKHN0aWNrZXJwaWNrZXJzIGFyZSB1c2VyIHdpZGdldHMgYnkgbmF0dXJlKVxuICAgICAqIEByZXR1cm4ge1tvYmplY3RdfSBBcnJheSBjb250YWluaW5nIGN1cnJlbnQgLyBhY3RpdmUgc3RpY2tlcnBpY2tlciB3aWRnZXRzXG4gICAgICovXG4gICAgc3RhdGljIGdldFN0aWNrZXJwaWNrZXJXaWRnZXRzKCk6IElXaWRnZXRFdmVudFtdIHtcbiAgICAgICAgY29uc3Qgd2lkZ2V0cyA9IFdpZGdldFV0aWxzLmdldFVzZXJXaWRnZXRzQXJyYXkoKTtcbiAgICAgICAgcmV0dXJuIHdpZGdldHMuZmlsdGVyKCh3aWRnZXQpID0+IHdpZGdldC5jb250ZW50ICYmIHdpZGdldC5jb250ZW50LnR5cGUgPT09IFwibS5zdGlja2VycGlja2VyXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgaW50ZWdyYXRpb24gbWFuYWdlciB3aWRnZXRzIGZvciB0aGlzIHVzZXIuXG4gICAgICogQHJldHVybnMge09iamVjdFtdfSBBbiBhcnJheSBvZiBpbnRlZ3JhdGlvbiBtYW5hZ2VyIHVzZXIgd2lkZ2V0cy5cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0SW50ZWdyYXRpb25NYW5hZ2VyV2lkZ2V0cygpOiBJV2lkZ2V0RXZlbnRbXSB7XG4gICAgICAgIGNvbnN0IHdpZGdldHMgPSBXaWRnZXRVdGlscy5nZXRVc2VyV2lkZ2V0c0FycmF5KCk7XG4gICAgICAgIHJldHVybiB3aWRnZXRzLmZpbHRlcih3ID0+IHcuY29udGVudCAmJiB3LmNvbnRlbnQudHlwZSA9PT0gXCJtLmludGVncmF0aW9uX21hbmFnZXJcIik7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldFJvb21XaWRnZXRzT2ZUeXBlKHJvb206IFJvb20sIHR5cGU6IFdpZGdldFR5cGUpOiBJV2lkZ2V0RXZlbnRbXSB7XG4gICAgICAgIGNvbnN0IHdpZGdldHMgPSBXaWRnZXRVdGlscy5nZXRSb29tV2lkZ2V0cyhyb29tKTtcbiAgICAgICAgcmV0dXJuICh3aWRnZXRzIHx8IFtdKS5maWx0ZXIodyA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gdy5nZXRDb250ZW50KCk7XG4gICAgICAgICAgICByZXR1cm4gY29udGVudC51cmwgJiYgdHlwZS5tYXRjaGVzKGNvbnRlbnQudHlwZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyByZW1vdmVJbnRlZ3JhdGlvbk1hbmFnZXJXaWRnZXRzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmICghY2xpZW50KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VzZXIgbm90IGxvZ2dlZCBpbicpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHdpZGdldHMgPSBjbGllbnQuZ2V0QWNjb3VudERhdGEoJ20ud2lkZ2V0cycpO1xuICAgICAgICBpZiAoIXdpZGdldHMpIHJldHVybjtcbiAgICAgICAgY29uc3QgdXNlcldpZGdldHM6IElXaWRnZXRFdmVudFtdID0gd2lkZ2V0cy5nZXRDb250ZW50KCkgfHwge307XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHVzZXJXaWRnZXRzKS5mb3JFYWNoKChba2V5LCB3aWRnZXRdKSA9PiB7XG4gICAgICAgICAgICBpZiAod2lkZ2V0LmNvbnRlbnQgJiYgd2lkZ2V0LmNvbnRlbnQudHlwZSA9PT0gXCJtLmludGVncmF0aW9uX21hbmFnZXJcIikge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB1c2VyV2lkZ2V0c1trZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNsaWVudC5zZXRBY2NvdW50RGF0YSgnbS53aWRnZXRzJywgdXNlcldpZGdldHMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhZGRJbnRlZ3JhdGlvbk1hbmFnZXJXaWRnZXQobmFtZTogc3RyaW5nLCB1aVVybDogc3RyaW5nLCBhcGlVcmw6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gV2lkZ2V0VXRpbHMuc2V0VXNlcldpZGdldChcbiAgICAgICAgICAgIFwiaW50ZWdyYXRpb25fbWFuYWdlcl9cIiArIChuZXcgRGF0ZSgpLmdldFRpbWUoKSksXG4gICAgICAgICAgICBXaWRnZXRUeXBlLklOVEVHUkFUSU9OX01BTkFHRVIsXG4gICAgICAgICAgICB1aVVybCxcbiAgICAgICAgICAgIFwiSW50ZWdyYXRpb24gTWFuYWdlcjogXCIgKyBuYW1lLFxuICAgICAgICAgICAge1wiYXBpX3VybFwiOiBhcGlVcmx9LFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhbGwgc3RpY2tlcnBpY2tlciB3aWRnZXRzIChzdGlja2VycGlja2VycyBhcmUgdXNlciB3aWRnZXRzIGJ5IG5hdHVyZSlcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBSZXNvbHZlcyBvbiBhY2NvdW50IGRhdGEgdXBkYXRlZFxuICAgICAqL1xuICAgIHN0YXRpYyByZW1vdmVTdGlja2VycGlja2VyV2lkZ2V0cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc2VyIG5vdCBsb2dnZWQgaW4nKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB3aWRnZXRzID0gY2xpZW50LmdldEFjY291bnREYXRhKCdtLndpZGdldHMnKTtcbiAgICAgICAgaWYgKCF3aWRnZXRzKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHVzZXJXaWRnZXRzOiBSZWNvcmQ8c3RyaW5nLCBJV2lkZ2V0RXZlbnQ+ID0gd2lkZ2V0cy5nZXRDb250ZW50KCkgfHwge307XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHVzZXJXaWRnZXRzKS5mb3JFYWNoKChba2V5LCB3aWRnZXRdKSA9PiB7XG4gICAgICAgICAgICBpZiAod2lkZ2V0LmNvbnRlbnQgJiYgd2lkZ2V0LmNvbnRlbnQudHlwZSA9PT0gJ20uc3RpY2tlcnBpY2tlcicpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdXNlcldpZGdldHNba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjbGllbnQuc2V0QWNjb3VudERhdGEoJ20ud2lkZ2V0cycsIHVzZXJXaWRnZXRzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbWFrZUFwcENvbmZpZyhcbiAgICAgICAgYXBwSWQ6IHN0cmluZyxcbiAgICAgICAgYXBwOiBQYXJ0aWFsPElBcHA+LFxuICAgICAgICBzZW5kZXJVc2VySWQ6IHN0cmluZyxcbiAgICAgICAgcm9vbUlkOiBzdHJpbmcgfCBudWxsLFxuICAgICAgICBldmVudElkOiBzdHJpbmcsXG4gICAgKTogSUFwcCB7XG4gICAgICAgIGlmICghc2VuZGVyVXNlcklkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXaWRnZXRzIG11c3QgYmUgY3JlYXRlZCBieSBzb21lb25lIC0gcHJvdmlkZSBhIHNlbmRlclVzZXJJZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBhcHAuY3JlYXRvclVzZXJJZCA9IHNlbmRlclVzZXJJZDtcblxuICAgICAgICBhcHAuaWQgPSBhcHBJZDtcbiAgICAgICAgYXBwLnJvb21JZCA9IHJvb21JZDtcbiAgICAgICAgYXBwLmV2ZW50SWQgPSBldmVudElkO1xuICAgICAgICBhcHAubmFtZSA9IGFwcC5uYW1lIHx8IGFwcC50eXBlO1xuXG4gICAgICAgIHJldHVybiBhcHAgYXMgSUFwcDtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0Q2FwV2hpdGVsaXN0Rm9yQXBwVHlwZUluUm9vbUlkKGFwcFR5cGU6IHN0cmluZywgcm9vbUlkOiBzdHJpbmcpOiBDYXBhYmlsaXR5W10ge1xuICAgICAgICBjb25zdCBlbmFibGVTY3JlZW5zaG90cyA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJlbmFibGVXaWRnZXRTY3JlZW5zaG90c1wiLCByb29tSWQpO1xuXG4gICAgICAgIGNvbnN0IGNhcFdoaXRlbGlzdCA9IGVuYWJsZVNjcmVlbnNob3RzID8gW01hdHJpeENhcGFiaWxpdGllcy5TY3JlZW5zaG90c10gOiBbXTtcblxuICAgICAgICAvLyBPYnZpb3VzbHkgYW55b25lIHRoYXQgY2FuIGFkZCBhIHdpZGdldCBjYW4gY2xhaW0gaXQncyBhIGppdHNpIHdpZGdldCxcbiAgICAgICAgLy8gc28gdGhpcyBkb2Vzbid0IHJlYWxseSBvZmZlciBtdWNoIG92ZXIgdGhlIHNldCBvZiBkb21haW5zIHdlIGxvYWRcbiAgICAgICAgLy8gd2lkZ2V0cyBmcm9tIGF0IGFsbCwgYnV0IGl0IHByb2JhYmx5IG1ha2VzIHNlbnNlIGZvciBzYW5pdHkuXG4gICAgICAgIGlmIChXaWRnZXRUeXBlLkpJVFNJLm1hdGNoZXMoYXBwVHlwZSkpIHtcbiAgICAgICAgICAgIGNhcFdoaXRlbGlzdC5wdXNoKE1hdHJpeENhcGFiaWxpdGllcy5BbHdheXNPblNjcmVlbik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2FwV2hpdGVsaXN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRMb2NhbEppdHNpV3JhcHBlclVybChvcHRzOiB7Zm9yTG9jYWxSZW5kZXI/OiBib29sZWFuLCBhdXRoPzogc3RyaW5nfSA9IHt9KSB7XG4gICAgICAgIC8vIE5CLiB3ZSBjYW4ndCBqdXN0IGVuY29kZVVSSUNvbXBvbmVudCBhbGwgb2YgdGhlc2UgYmVjYXVzZSB0aGUgJCBzaWducyBuZWVkIHRvIGJlIHRoZXJlXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nUGFydHMgPSBbXG4gICAgICAgICAgICAnY29uZmVyZW5jZURvbWFpbj0kZG9tYWluJyxcbiAgICAgICAgICAgICdjb25mZXJlbmNlSWQ9JGNvbmZlcmVuY2VJZCcsXG4gICAgICAgICAgICAnaXNBdWRpb09ubHk9JGlzQXVkaW9Pbmx5JyxcbiAgICAgICAgICAgICdkaXNwbGF5TmFtZT0kbWF0cml4X2Rpc3BsYXlfbmFtZScsXG4gICAgICAgICAgICAnYXZhdGFyVXJsPSRtYXRyaXhfYXZhdGFyX3VybCcsXG4gICAgICAgICAgICAndXNlcklkPSRtYXRyaXhfdXNlcl9pZCcsXG4gICAgICAgICAgICAncm9vbUlkPSRtYXRyaXhfcm9vbV9pZCcsXG4gICAgICAgICAgICAndGhlbWU9JHRoZW1lJyxcbiAgICAgICAgICAgICdyb29tTmFtZT0kcm9vbU5hbWUnLFxuICAgICAgICBdO1xuICAgICAgICBpZiAob3B0cy5hdXRoKSB7XG4gICAgICAgICAgICBxdWVyeVN0cmluZ1BhcnRzLnB1c2goYGF1dGg9JHtvcHRzLmF1dGh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeVN0cmluZ1BhcnRzLmpvaW4oJyYnKTtcblxuICAgICAgICBsZXQgYmFzZVVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLnByb3RvY29sICE9PSBcImh0dHBzOlwiICYmICFvcHRzLmZvckxvY2FsUmVuZGVyKSB7XG4gICAgICAgICAgICAvLyBVc2UgYW4gZXh0ZXJuYWwgd3JhcHBlciBpZiB3ZSdyZSBub3QgbG9jYWxseSByZW5kZXJpbmcgdGhlIHdpZGdldC4gVGhpcyBpcyB1c3VhbGx5XG4gICAgICAgICAgICAvLyB0aGUgVVJMIHRoYXQgd2lsbCBlbmQgdXAgaW4gdGhlIHdpZGdldCBldmVudCwgc28gd2Ugd2FudCB0byBtYWtlIHN1cmUgaXQncyByZWxhdGl2ZWx5XG4gICAgICAgICAgICAvLyBzYWZlIHRvIHNlbmQuXG4gICAgICAgICAgICAvLyBXZSdsbCBlbmQgdXAgdXNpbmcgYSBsb2NhbCByZW5kZXIgVVJMIHdoZW4gd2Ugc2VlIGEgSml0c2kgd2lkZ2V0IGFueXdheXMsIHNvIHRoaXMgaXNcbiAgICAgICAgICAgIC8vIHJlYWxseSBqdXN0IGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSBhbmQgdG8gYXBwZWFzZSB0aGUgc3BlYy5cbiAgICAgICAgICAgIGJhc2VVcmwgPSBcImh0dHBzOi8vYXBwLmVsZW1lbnQuaW8vXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChcImppdHNpLmh0bWwjXCIgKyBxdWVyeVN0cmluZywgYmFzZVVybCk7IC8vIHRoaXMgc3RyaXBzIGhhc2ggZnJhZ21lbnQgZnJvbSBiYXNlVXJsXG4gICAgICAgIHJldHVybiB1cmwuaHJlZjtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0V2lkZ2V0TmFtZShhcHA/OiBJQXBwKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGFwcD8ubmFtZT8udHJpbSgpIHx8IF90KFwiVW5rbm93biBBcHBcIik7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldFdpZGdldERhdGFUaXRsZShhcHA/OiBJQXBwKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGFwcD8uZGF0YT8udGl0bGU/LnRyaW0oKSB8fCBcIlwiO1xuICAgIH1cblxuICAgIHN0YXRpYyBlZGl0V2lkZ2V0KHJvb206IFJvb20sIGFwcDogSUFwcCk6IHZvaWQge1xuICAgICAgICAvLyBUT0RPOiBPcGVuIHRoZSByaWdodCBtYW5hZ2VyIGZvciB0aGUgd2lkZ2V0XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9tYW55X2ludGVncmF0aW9uX21hbmFnZXJzXCIpKSB7XG4gICAgICAgICAgICBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCkub3BlbkFsbChyb29tLCAndHlwZV8nICsgYXBwLnR5cGUsIGFwcC5pZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCkuZ2V0UHJpbWFyeU1hbmFnZXIoKS5vcGVuKHJvb20sICd0eXBlXycgKyBhcHAudHlwZSwgYXBwLmlkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBpc01hbmFnZWRCeU1hbmFnZXIoYXBwKSB7XG4gICAgICAgIGlmIChXaWRnZXRVdGlscy5pc1NjYWxhclVybChhcHAudXJsKSkge1xuICAgICAgICAgICAgY29uc3QgbWFuYWdlcnMgPSBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCk7XG4gICAgICAgICAgICBpZiAobWFuYWdlcnMuaGFzTWFuYWdlcigpKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogUGljayB0aGUgcmlnaHQgbWFuYWdlciBmb3IgdGhlIHdpZGdldFxuICAgICAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRNYW5hZ2VyID0gbWFuYWdlcnMuZ2V0UHJpbWFyeU1hbmFnZXIoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gV2lkZ2V0VXRpbHMuaXNTY2FsYXJVcmwoZGVmYXVsdE1hbmFnZXIuYXBpVXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIl19