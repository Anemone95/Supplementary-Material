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
    const queryStringParts = ['conferenceDomain=$domain', 'conferenceId=$conferenceId', 'isAudioOnly=$isAudioOnly', 'displayName=$matrix_display_name', 'avatarUrl=$matrix_avatar_url', 'userId=$matrix_user_id', 'roomId=$matrix_room_id', 'theme=$theme'];

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9XaWRnZXRVdGlscy50cyJdLCJuYW1lcyI6WyJXSURHRVRfV0FJVF9USU1FIiwiV2lkZ2V0VXRpbHMiLCJjYW5Vc2VyTW9kaWZ5V2lkZ2V0cyIsInJvb21JZCIsImNvbnNvbGUiLCJ3YXJuIiwiY2xpZW50IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwicm9vbSIsImdldFJvb20iLCJtZSIsImNyZWRlbnRpYWxzIiwidXNlcklkIiwiZ2V0TXlNZW1iZXJzaGlwIiwiY3VycmVudFN0YXRlIiwibWF5U2VuZFN0YXRlRXZlbnQiLCJpc1NjYWxhclVybCIsInRlc3RVcmxTdHJpbmciLCJlcnJvciIsInRlc3RVcmwiLCJ1cmwiLCJwYXJzZSIsInNjYWxhclVybHMiLCJTZGtDb25maWciLCJpbnRlZ3JhdGlvbnNfd2lkZ2V0c191cmxzIiwibGVuZ3RoIiwiZGVmYXVsdE1hbmFnZXIiLCJJbnRlZ3JhdGlvbk1hbmFnZXJzIiwic2hhcmVkSW5zdGFuY2UiLCJnZXRQcmltYXJ5TWFuYWdlciIsImFwaVVybCIsImkiLCJzY2FsYXJVcmwiLCJwcm90b2NvbCIsImhvc3QiLCJwYXRobmFtZSIsInN0YXJ0c1dpdGgiLCJ3YWl0Rm9yVXNlcldpZGdldCIsIndpZGdldElkIiwiYWRkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJldmVudEluSW50ZW5kZWRTdGF0ZSIsImV2IiwiZ2V0Q29udGVudCIsInVuZGVmaW5lZCIsInN0YXJ0aW5nQWNjb3VudERhdGFFdmVudCIsImdldEFjY291bnREYXRhIiwib25BY2NvdW50RGF0YSIsImN1cnJlbnRBY2NvdW50RGF0YUV2ZW50IiwicmVtb3ZlTGlzdGVuZXIiLCJjbGVhclRpbWVvdXQiLCJ0aW1lcklkIiwic2V0VGltZW91dCIsIkVycm9yIiwib24iLCJ3YWl0Rm9yUm9vbVdpZGdldCIsImV2ZW50c0luSW50ZW5kZWRTdGF0ZSIsImV2TGlzdCIsIndpZGdldFByZXNlbnQiLCJzb21lIiwic3RhcnRpbmdXaWRnZXRFdmVudHMiLCJnZXRTdGF0ZUV2ZW50cyIsIm9uUm9vbVN0YXRlRXZlbnRzIiwiZ2V0Um9vbUlkIiwiY3VycmVudFdpZGdldEV2ZW50cyIsInNldFVzZXJXaWRnZXQiLCJ3aWRnZXRUeXBlIiwid2lkZ2V0VXJsIiwid2lkZ2V0TmFtZSIsIndpZGdldERhdGEiLCJjb250ZW50IiwidHlwZSIsInByZWZlcnJlZCIsIm5hbWUiLCJkYXRhIiwidXNlcldpZGdldHMiLCJnZXRVc2VyV2lkZ2V0cyIsImUiLCJhZGRpbmdXaWRnZXQiLCJCb29sZWFuIiwic2VuZGVyIiwiZ2V0VXNlcklkIiwic3RhdGVfa2V5IiwiaWQiLCJzZXRBY2NvdW50RGF0YSIsInRoZW4iLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInNldFJvb21XaWRnZXQiLCJsZWdhY3kiLCJzZXRSb29tV2lkZ2V0Q29udGVudCIsIldpZGdldEVjaG9TdG9yZSIsInNldFJvb21XaWRnZXRFY2hvIiwic2VuZFN0YXRlRXZlbnQiLCJmaW5hbGx5IiwicmVtb3ZlUm9vbVdpZGdldEVjaG8iLCJnZXRSb29tV2lkZ2V0cyIsImFwcHNTdGF0ZUV2ZW50cyIsImZpbHRlciIsImdldFVzZXJXaWRnZXRzQXJyYXkiLCJPYmplY3QiLCJ2YWx1ZXMiLCJnZXRTdGlja2VycGlja2VyV2lkZ2V0cyIsIndpZGdldHMiLCJ3aWRnZXQiLCJnZXRJbnRlZ3JhdGlvbk1hbmFnZXJXaWRnZXRzIiwidyIsImdldFJvb21XaWRnZXRzT2ZUeXBlIiwibWF0Y2hlcyIsInJlbW92ZUludGVncmF0aW9uTWFuYWdlcldpZGdldHMiLCJlbnRyaWVzIiwiZm9yRWFjaCIsImtleSIsImFkZEludGVncmF0aW9uTWFuYWdlcldpZGdldCIsInVpVXJsIiwiRGF0ZSIsImdldFRpbWUiLCJXaWRnZXRUeXBlIiwiSU5URUdSQVRJT05fTUFOQUdFUiIsInJlbW92ZVN0aWNrZXJwaWNrZXJXaWRnZXRzIiwibWFrZUFwcENvbmZpZyIsImFwcElkIiwiYXBwIiwic2VuZGVyVXNlcklkIiwiZXZlbnRJZCIsImNyZWF0b3JVc2VySWQiLCJnZXRDYXBXaGl0ZWxpc3RGb3JBcHBUeXBlSW5Sb29tSWQiLCJhcHBUeXBlIiwiZW5hYmxlU2NyZWVuc2hvdHMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJjYXBXaGl0ZWxpc3QiLCJNYXRyaXhDYXBhYmlsaXRpZXMiLCJTY3JlZW5zaG90cyIsIkpJVFNJIiwicHVzaCIsIkFsd2F5c09uU2NyZWVuIiwiZ2V0TG9jYWxKaXRzaVdyYXBwZXJVcmwiLCJvcHRzIiwicXVlcnlTdHJpbmdQYXJ0cyIsImF1dGgiLCJxdWVyeVN0cmluZyIsImpvaW4iLCJiYXNlVXJsIiwid2luZG93IiwibG9jYXRpb24iLCJocmVmIiwiZm9yTG9jYWxSZW5kZXIiLCJVUkwiLCJnZXRXaWRnZXROYW1lIiwidHJpbSIsImdldFdpZGdldERhdGFUaXRsZSIsInRpdGxlIiwiZWRpdFdpZGdldCIsIm9wZW5BbGwiLCJvcGVuIiwiaXNNYW5hZ2VkQnlNYW5hZ2VyIiwibWFuYWdlcnMiLCJoYXNNYW5hZ2VyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUE3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFpQkE7QUFDQTtBQUNBLE1BQU1BLGdCQUFnQixHQUFHLEtBQXpCOztBQWxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF1Q2UsTUFBTUMsV0FBTixDQUFrQjtBQUM3QjtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSSxTQUFPQyxvQkFBUCxDQUE0QkM7QUFBNUI7QUFBQTtBQUFBO0FBQXFEO0FBQ2pELFFBQUksQ0FBQ0EsTUFBTCxFQUFhO0FBQ1RDLE1BQUFBLE9BQU8sQ0FBQ0MsSUFBUixDQUFhLHNCQUFiO0FBQ0EsYUFBTyxL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b3B5cmlnaHQgMjAxOSBUcmF2aXMgUmFsc3RvblxuQ29weXJpZ2h0IDIwMTcgLSAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0ICogYXMgdXJsIGZyb20gXCJ1cmxcIjtcblxuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi9TZGtDb25maWdcIjtcbmltcG9ydCBkaXMgZnJvbSAnLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCBXaWRnZXRFY2hvU3RvcmUgZnJvbSAnLi4vc3RvcmVzL1dpZGdldEVjaG9TdG9yZSc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHtJbnRlZ3JhdGlvbk1hbmFnZXJzfSBmcm9tIFwiLi4vaW50ZWdyYXRpb25zL0ludGVncmF0aW9uTWFuYWdlcnNcIjtcbmltcG9ydCB7Um9vbX0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQge1dpZGdldFR5cGV9IGZyb20gXCIuLi93aWRnZXRzL1dpZGdldFR5cGVcIjtcbmltcG9ydCB7b2JqZWN0Q2xvbmV9IGZyb20gXCIuL29iamVjdHNcIjtcbmltcG9ydCB7X3R9IGZyb20gXCIuLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7Q2FwYWJpbGl0eSwgSVdpZGdldCwgSVdpZGdldERhdGEsIE1hdHJpeENhcGFiaWxpdGllc30gZnJvbSBcIm1hdHJpeC13aWRnZXQtYXBpXCI7XG5pbXBvcnQge0lBcHB9IGZyb20gXCIuLi9zdG9yZXMvV2lkZ2V0U3RvcmVcIjtcblxuLy8gSG93IGxvbmcgd2Ugd2FpdCBmb3IgdGhlIHN0YXRlIGV2ZW50IGVjaG8gdG8gY29tZSBiYWNrIGZyb20gdGhlIHNlcnZlclxuLy8gYmVmb3JlIHdhaXRGb3JbUm9vbS9Vc2VyXVdpZGdldCByZWplY3RzIGl0cyBwcm9taXNlXG5jb25zdCBXSURHRVRfV0FJVF9USU1FID0gMjAwMDA7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVdpZGdldEV2ZW50IHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHR5cGU6IHN0cmluZztcbiAgICBzZW5kZXI6IHN0cmluZztcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgc3RhdGVfa2V5OiBzdHJpbmc7XG4gICAgY29udGVudDogUGFydGlhbDxJQXBwPjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2lkZ2V0VXRpbHMge1xuICAgIC8qIFJldHVybnMgdHJ1ZSBpZiB1c2VyIGlzIGFibGUgdG8gc2VuZCBzdGF0ZSBldmVudHMgdG8gbW9kaWZ5IHdpZGdldHMgaW4gdGhpcyByb29tXG4gICAgICogKERvZXMgbm90IGFwcGx5IHRvIG5vbi1yb29tLWJhc2VkIC8gdXNlciB3aWRnZXRzKVxuICAgICAqIEBwYXJhbSByb29tSWQgLS0gVGhlIElEIG9mIHRoZSByb29tIHRvIGNoZWNrXG4gICAgICogQHJldHVybiBCb29sZWFuIC0tIHRydWUgaWYgdGhlIHVzZXIgY2FuIG1vZGlmeSB3aWRnZXRzIGluIHRoaXMgcm9vbVxuICAgICAqIEB0aHJvd3MgRXJyb3IgLS0gc3BlY2lmaWVzIHRoZSBlcnJvciByZWFzb25cbiAgICAgKi9cbiAgICBzdGF0aWMgY2FuVXNlck1vZGlmeVdpZGdldHMocm9vbUlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFyb29tSWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gcm9vbSBJRCBzcGVjaWZpZWQnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKCFjbGllbnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignVXNlciBtdXN0IGJlIGJlIGxvZ2dlZCBpbicpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgIGlmICghcm9vbSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBSb29tIElEICR7cm9vbUlkfSBpcyBub3QgcmVjb2duaXNlZGApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWUgPSBjbGllbnQuY3JlZGVudGlhbHMudXNlcklkO1xuICAgICAgICBpZiAoIW1lKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ZhaWxlZCB0byBnZXQgdXNlciBJRCcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJvb20uZ2V0TXlNZW1iZXJzaGlwKCkgIT09IFwiam9pblwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFVzZXIgJHttZX0gaXMgbm90IGluIHJvb20gJHtyb29tSWR9YCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS53aWRnZXQgZXZlbnQgdHlwZSAoaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTMxMTEpXG4gICAgICAgIHJldHVybiByb29tLmN1cnJlbnRTdGF0ZS5tYXlTZW5kU3RhdGVFdmVudCgnaW0udmVjdG9yLm1vZHVsYXIud2lkZ2V0cycsIG1lKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBHZW5lcmlmeSB0aGUgbmFtZSBvZiB0aGlzIGZ1bmN0aW9uLiBJdCdzIG5vdCBqdXN0IHNjYWxhci5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgc3BlY2lmaWVkIHVybCBpcyBhIHNjYWxhciBVUkwsIHR5cGljYWxseSBodHRwczovL3NjYWxhci52ZWN0b3IuaW0vYXBpXG4gICAgICogQHBhcmFtICB7W3R5cGVdfSAgdGVzdFVybFN0cmluZyBVUkwgdG8gY2hlY2tcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBUcnVlIGlmIHNwZWNpZmllZCBVUkwgaXMgYSBzY2FsYXIgVVJMXG4gICAgICovXG4gICAgc3RhdGljIGlzU2NhbGFyVXJsKHRlc3RVcmxTdHJpbmc6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXRlc3RVcmxTdHJpbmcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1NjYWxhciBVUkwgY2hlY2sgZmFpbGVkLiBObyBVUkwgc3BlY2lmaWVkJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0ZXN0VXJsID0gdXJsLnBhcnNlKHRlc3RVcmxTdHJpbmcpO1xuICAgICAgICBsZXQgc2NhbGFyVXJscyA9IFNka0NvbmZpZy5nZXQoKS5pbnRlZ3JhdGlvbnNfd2lkZ2V0c191cmxzO1xuICAgICAgICBpZiAoIXNjYWxhclVybHMgfHwgc2NhbGFyVXJscy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRNYW5hZ2VyID0gSW50ZWdyYXRpb25NYW5hZ2Vycy5zaGFyZWRJbnN0YW5jZSgpLmdldFByaW1hcnlNYW5hZ2VyKCk7XG4gICAgICAgICAgICBpZiAoZGVmYXVsdE1hbmFnZXIpIHtcbiAgICAgICAgICAgICAgICBzY2FsYXJVcmxzID0gW2RlZmF1bHRNYW5hZ2VyLmFwaVVybF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNjYWxhclVybHMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2NhbGFyVXJscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgc2NhbGFyVXJsID0gdXJsLnBhcnNlKHNjYWxhclVybHNbaV0pO1xuICAgICAgICAgICAgaWYgKHRlc3RVcmwgJiYgc2NhbGFyVXJsKSB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICB0ZXN0VXJsLnByb3RvY29sID09PSBzY2FsYXJVcmwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgICAgICAgICAgdGVzdFVybC5ob3N0ID09PSBzY2FsYXJVcmwuaG9zdCAmJlxuICAgICAgICAgICAgICAgICAgICB0ZXN0VXJsLnBhdGhuYW1lLnN0YXJ0c1dpdGgoc2NhbGFyVXJsLnBhdGhuYW1lKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBhIHdpZGdldCB3aXRoIHRoZSBnaXZlblxuICAgICAqIElEIGhhcyBiZWVuIGFkZGVkIGFzIGEgdXNlciB3aWRnZXQgKGllLiB0aGUgYWNjb3VudERhdGEgZXZlbnRcbiAgICAgKiBhcnJpdmVzKSBvciByZWplY3RzIGFmdGVyIGEgdGltZW91dFxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHdpZGdldElkIFRoZSBJRCBvZiB0aGUgd2lkZ2V0IHRvIHdhaXQgZm9yXG4gICAgICogQHBhcmFtIHtib29sZWFufSBhZGQgVHJ1ZSB0byB3YWl0IGZvciB0aGUgd2lkZ2V0IHRvIGJlIGFkZGVkLFxuICAgICAqICAgICBmYWxzZSB0byB3YWl0IGZvciBpdCB0byBiZSBkZWxldGVkLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHdpZGdldCBpcyBpbiB0aGVcbiAgICAgKiAgICAgcmVxdWVzdGVkIHN0YXRlIGFjY29yZGluZyB0byB0aGUgYGFkZGAgcGFyYW1cbiAgICAgKi9cbiAgICBzdGF0aWMgd2FpdEZvclVzZXJXaWRnZXQod2lkZ2V0SWQ6IHN0cmluZywgYWRkOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAvLyBUZXN0cyBhbiBhY2NvdW50IGRhdGEgZXZlbnQsIHJldHVybmluZyB0cnVlIGlmIGl0J3MgaW4gdGhlIHN0YXRlXG4gICAgICAgICAgICAvLyB3ZSdyZSB3YWl0aW5nIGZvciBpdCB0byBiZSBpblxuICAgICAgICAgICAgZnVuY3Rpb24gZXZlbnRJbkludGVuZGVkU3RhdGUoZXYpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWV2IHx8ICFldi5nZXRDb250ZW50KCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoYWRkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBldi5nZXRDb250ZW50KClbd2lkZ2V0SWRdICE9PSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2LmdldENvbnRlbnQoKVt3aWRnZXRJZF0gPT09IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0aW5nQWNjb3VudERhdGFFdmVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRBY2NvdW50RGF0YSgnbS53aWRnZXRzJyk7XG4gICAgICAgICAgICBpZiAoZXZlbnRJbkludGVuZGVkU3RhdGUoc3RhcnRpbmdBY2NvdW50RGF0YUV2ZW50KSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uQWNjb3VudERhdGEoZXYpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50QWNjb3VudERhdGFFdmVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRBY2NvdW50RGF0YSgnbS53aWRnZXRzJyk7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50SW5JbnRlbmRlZFN0YXRlKGN1cnJlbnRBY2NvdW50RGF0YUV2ZW50KSkge1xuICAgICAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoJ2FjY291bnREYXRhJywgb25BY2NvdW50RGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoJ2FjY291bnREYXRhJywgb25BY2NvdW50RGF0YSk7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlRpbWVkIG91dCB3YWl0aW5nIGZvciB3aWRnZXQgSUQgXCIgKyB3aWRnZXRJZCArIFwiIHRvIGFwcGVhclwiKSk7XG4gICAgICAgICAgICB9LCBXSURHRVRfV0FJVF9USU1FKTtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbignYWNjb3VudERhdGEnLCBvbkFjY291bnREYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIGEgd2lkZ2V0IHdpdGggdGhlIGdpdmVuXG4gICAgICogSUQgaGFzIGJlZW4gYWRkZWQgYXMgYSByb29tIHdpZGdldCBpbiB0aGUgZ2l2ZW4gcm9vbSAoaWUuIHRoZVxuICAgICAqIHJvb20gc3RhdGUgZXZlbnQgYXJyaXZlcykgb3IgcmVqZWN0cyBhZnRlciBhIHRpbWVvdXRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3aWRnZXRJZCBUaGUgSUQgb2YgdGhlIHdpZGdldCB0byB3YWl0IGZvclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSByb29tSWQgVGhlIElEIG9mIHRoZSByb29tIHRvIHdhaXQgZm9yIHRoZSB3aWRnZXQgaW5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFkZCBUcnVlIHRvIHdhaXQgZm9yIHRoZSB3aWRnZXQgdG8gYmUgYWRkZWQsXG4gICAgICogICAgIGZhbHNlIHRvIHdhaXQgZm9yIGl0IHRvIGJlIGRlbGV0ZWQuXG4gICAgICogQHJldHVybnMge1Byb21pc2V9IHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgd2lkZ2V0IGlzIGluIHRoZVxuICAgICAqICAgICByZXF1ZXN0ZWQgc3RhdGUgYWNjb3JkaW5nIHRvIHRoZSBgYWRkYCBwYXJhbVxuICAgICAqL1xuICAgIHN0YXRpYyB3YWl0Rm9yUm9vbVdpZGdldCh3aWRnZXRJZDogc3RyaW5nLCByb29tSWQ6IHN0cmluZywgYWRkOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAvLyBUZXN0cyBhIGxpc3Qgb2Ygc3RhdGUgZXZlbnRzLCByZXR1cm5pbmcgdHJ1ZSBpZiBpdCdzIGluIHRoZSBzdGF0ZVxuICAgICAgICAgICAgLy8gd2UncmUgd2FpdGluZyBmb3IgaXQgdG8gYmUgaW5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGV2ZW50c0luSW50ZW5kZWRTdGF0ZShldkxpc3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB3aWRnZXRQcmVzZW50ID0gZXZMaXN0LnNvbWUoKGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBldi5nZXRDb250ZW50KCkgJiYgZXYuZ2V0Q29udGVudCgpWydpZCddID09PSB3aWRnZXRJZDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoYWRkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB3aWRnZXRQcmVzZW50O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAhd2lkZ2V0UHJlc2VudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgLy8gVE9ETzogRW5hYmxlIHN1cHBvcnQgZm9yIG0ud2lkZ2V0IGV2ZW50IHR5cGUgKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEzMTExKVxuICAgICAgICAgICAgY29uc3Qgc3RhcnRpbmdXaWRnZXRFdmVudHMgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnaW0udmVjdG9yLm1vZHVsYXIud2lkZ2V0cycpO1xuICAgICAgICAgICAgaWYgKGV2ZW50c0luSW50ZW5kZWRTdGF0ZShzdGFydGluZ1dpZGdldEV2ZW50cykpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJvb21TdGF0ZUV2ZW50cyhldikge1xuICAgICAgICAgICAgICAgIGlmIChldi5nZXRSb29tSWQoKSAhPT0gcm9vbUlkKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS53aWRnZXQgZXZlbnQgdHlwZSAoaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTMxMTEpXG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudFdpZGdldEV2ZW50cyA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKCdpbS52ZWN0b3IubW9kdWxhci53aWRnZXRzJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRzSW5JbnRlbmRlZFN0YXRlKGN1cnJlbnRXaWRnZXRFdmVudHMpKSB7XG4gICAgICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcignUm9vbVN0YXRlLmV2ZW50cycsIG9uUm9vbVN0YXRlRXZlbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcignUm9vbVN0YXRlLmV2ZW50cycsIG9uUm9vbVN0YXRlRXZlbnRzKTtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiVGltZWQgb3V0IHdhaXRpbmcgZm9yIHdpZGdldCBJRCBcIiArIHdpZGdldElkICsgXCIgdG8gYXBwZWFyXCIpKTtcbiAgICAgICAgICAgIH0sIFdJREdFVF9XQUlUX1RJTUUpO1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKCdSb29tU3RhdGUuZXZlbnRzJywgb25Sb29tU3RhdGVFdmVudHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgc2V0VXNlcldpZGdldChcbiAgICAgICAgd2lkZ2V0SWQ6IHN0cmluZyxcbiAgICAgICAgd2lkZ2V0VHlwZTogV2lkZ2V0VHlwZSxcbiAgICAgICAgd2lkZ2V0VXJsOiBzdHJpbmcsXG4gICAgICAgIHdpZGdldE5hbWU6IHN0cmluZyxcbiAgICAgICAgd2lkZ2V0RGF0YTogSVdpZGdldERhdGEsXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB7XG4gICAgICAgICAgICB0eXBlOiB3aWRnZXRUeXBlLnByZWZlcnJlZCxcbiAgICAgICAgICAgIHVybDogd2lkZ2V0VXJsLFxuICAgICAgICAgICAgbmFtZTogd2lkZ2V0TmFtZSxcbiAgICAgICAgICAgIGRhdGE6IHdpZGdldERhdGEsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgd2lkZ2V0cyBhbmQgY2xvbmUgdGhlbSBiZWZvcmUgd2UgbW9kaWZ5IHRoZW0sIG90aGVyd2lzZVxuICAgICAgICAvLyB3ZSdsbCBtb2RpZnkgdGhlIGNvbnRlbnQgb2YgdGhlIG9sZCBldmVudC5cbiAgICAgICAgY29uc3QgdXNlcldpZGdldHMgPSBvYmplY3RDbG9uZShXaWRnZXRVdGlscy5nZXRVc2VyV2lkZ2V0cygpKTtcblxuICAgICAgICAvLyBEZWxldGUgZXhpc3Rpbmcgd2lkZ2V0IHdpdGggSURcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRlbGV0ZSB1c2VyV2lkZ2V0c1t3aWRnZXRJZF07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR3aWRnZXRJZCBpcyBub24tY29uZmlndXJhYmxlYCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhZGRpbmdXaWRnZXQgPSBCb29sZWFuKHdpZGdldFVybCk7XG5cbiAgICAgICAgLy8gQWRkIG5ldyB3aWRnZXQgLyB1cGRhdGVcbiAgICAgICAgaWYgKGFkZGluZ1dpZGdldCkge1xuICAgICAgICAgICAgdXNlcldpZGdldHNbd2lkZ2V0SWRdID0ge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgc2VuZGVyOiBjbGllbnQuZ2V0VXNlcklkKCksXG4gICAgICAgICAgICAgICAgc3RhdGVfa2V5OiB3aWRnZXRJZCxcbiAgICAgICAgICAgICAgICB0eXBlOiAnbS53aWRnZXQnLFxuICAgICAgICAgICAgICAgIGlkOiB3aWRnZXRJZCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGlzIHN0YXJ0cyBsaXN0ZW5pbmcgZm9yIHdoZW4gdGhlIGVjaG8gY29tZXMgYmFjayBmcm9tIHRoZSBzZXJ2ZXJcbiAgICAgICAgLy8gc2luY2UgdGhlIHdpZGdldCB3b24ndCBhcHBlYXIgYWRkZWQgdW50aWwgdGhpcyBoYXBwZW5zLiBJZiB3ZSBkb24ndFxuICAgICAgICAvLyB3YWl0IGZvciB0aGlzLCB0aGUgYWN0aW9uIHdpbGwgY29tcGxldGUgYnV0IGlmIHRoZSB1c2VyIGlzIGZhc3QgZW5vdWdoLFxuICAgICAgICAvLyB0aGUgd2lkZ2V0IHN0aWxsIHdvbid0IGFjdHVhbGx5IGJlIHRoZXJlLlxuICAgICAgICByZXR1cm4gY2xpZW50LnNldEFjY291bnREYXRhKCdtLndpZGdldHMnLCB1c2VyV2lkZ2V0cykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gV2lkZ2V0VXRpbHMud2FpdEZvclVzZXJXaWRnZXQod2lkZ2V0SWQsIGFkZGluZ1dpZGdldCk7XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcInVzZXJfd2lkZ2V0X3VwZGF0ZWRcIiB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIHNldFJvb21XaWRnZXQoXG4gICAgICAgIHJvb21JZDogc3RyaW5nLFxuICAgICAgICB3aWRnZXRJZDogc3RyaW5nLFxuICAgICAgICB3aWRnZXRUeXBlPzogV2lkZ2V0VHlwZSxcbiAgICAgICAgd2lkZ2V0VXJsPzogc3RyaW5nLFxuICAgICAgICB3aWRnZXROYW1lPzogc3RyaW5nLFxuICAgICAgICB3aWRnZXREYXRhPzogb2JqZWN0LFxuICAgICkge1xuICAgICAgICBsZXQgY29udGVudDtcblxuICAgICAgICBjb25zdCBhZGRpbmdXaWRnZXQgPSBCb29sZWFuKHdpZGdldFVybCk7XG5cbiAgICAgICAgaWYgKGFkZGluZ1dpZGdldCkge1xuICAgICAgICAgICAgY29udGVudCA9IHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS53aWRnZXQgZXZlbnQgdHlwZSAoaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTMxMTEpXG4gICAgICAgICAgICAgICAgLy8gRm9yIG5vdyB3ZSdsbCBzZW5kIHRoZSBsZWdhY3kgZXZlbnQgdHlwZSBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG9sZGVyIGFwcHMvZWxlbWVudHNcbiAgICAgICAgICAgICAgICB0eXBlOiB3aWRnZXRUeXBlLmxlZ2FjeSxcbiAgICAgICAgICAgICAgICB1cmw6IHdpZGdldFVybCxcbiAgICAgICAgICAgICAgICBuYW1lOiB3aWRnZXROYW1lLFxuICAgICAgICAgICAgICAgIGRhdGE6IHdpZGdldERhdGEsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGVudCA9IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFdpZGdldFV0aWxzLnNldFJvb21XaWRnZXRDb250ZW50KHJvb21JZCwgd2lkZ2V0SWQsIGNvbnRlbnQpO1xuICAgIH1cblxuICAgIHN0YXRpYyBzZXRSb29tV2lkZ2V0Q29udGVudChcbiAgICAgICAgcm9vbUlkOiBzdHJpbmcsXG4gICAgICAgIHdpZGdldElkOiBzdHJpbmcsXG4gICAgICAgIGNvbnRlbnQ6IElXaWRnZXQsXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IGFkZGluZ1dpZGdldCA9ICEhY29udGVudC51cmw7XG5cbiAgICAgICAgV2lkZ2V0RWNob1N0b3JlLnNldFJvb21XaWRnZXRFY2hvKHJvb21JZCwgd2lkZ2V0SWQsIGNvbnRlbnQpO1xuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgLy8gVE9ETzogRW5hYmxlIHN1cHBvcnQgZm9yIG0ud2lkZ2V0IGV2ZW50IHR5cGUgKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEzMTExKVxuICAgICAgICByZXR1cm4gY2xpZW50LnNlbmRTdGF0ZUV2ZW50KHJvb21JZCwgXCJpbS52ZWN0b3IubW9kdWxhci53aWRnZXRzXCIsIGNvbnRlbnQsIHdpZGdldElkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBXaWRnZXRVdGlscy53YWl0Rm9yUm9vbVdpZGdldCh3aWRnZXRJZCwgcm9vbUlkLCBhZGRpbmdXaWRnZXQpO1xuICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIFdpZGdldEVjaG9TdG9yZS5yZW1vdmVSb29tV2lkZ2V0RWNobyhyb29tSWQsIHdpZGdldElkKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHJvb20gc3BlY2lmaWMgd2lkZ2V0c1xuICAgICAqIEBwYXJhbSAge1Jvb219IHJvb20gVGhlIHJvb20gdG8gZ2V0IHdpZGdldHMgZm9yY2VcbiAgICAgKiBAcmV0dXJuIHtbb2JqZWN0XX0gQXJyYXkgY29udGFpbmluZyBjdXJyZW50IC8gYWN0aXZlIHJvb20gd2lkZ2V0c1xuICAgICAqL1xuICAgIHN0YXRpYyBnZXRSb29tV2lkZ2V0cyhyb29tOiBSb29tKSB7XG4gICAgICAgIC8vIFRPRE86IEVuYWJsZSBzdXBwb3J0IGZvciBtLndpZGdldCBldmVudCB0eXBlIChodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xMzExMSlcbiAgICAgICAgY29uc3QgYXBwc1N0YXRlRXZlbnRzID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoJ2ltLnZlY3Rvci5tb2R1bGFyLndpZGdldHMnKTtcbiAgICAgICAgaWYgKCFhcHBzU3RhdGVFdmVudHMpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcHBzU3RhdGVFdmVudHMuZmlsdGVyKChldikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGV2LmdldENvbnRlbnQoKS50eXBlICYmIGV2LmdldENvbnRlbnQoKS51cmw7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB1c2VyIHNwZWNpZmljIHdpZGdldHMgKG5vdCBsaW5rZWQgdG8gYSBzcGVjaWZpYyByb29tKVxuICAgICAqIEByZXR1cm4ge29iamVjdH0gRXZlbnQgY29udGVudCBvYmplY3QgY29udGFpbmluZyBjdXJyZW50IC8gYWN0aXZlIHVzZXIgd2lkZ2V0c1xuICAgICAqL1xuICAgIHN0YXRpYyBnZXRVc2VyV2lkZ2V0cygpOiBSZWNvcmQ8c3RyaW5nLCBJV2lkZ2V0RXZlbnQ+IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc2VyIG5vdCBsb2dnZWQgaW4nKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1c2VyV2lkZ2V0cyA9IGNsaWVudC5nZXRBY2NvdW50RGF0YSgnbS53aWRnZXRzJyk7XG4gICAgICAgIGlmICh1c2VyV2lkZ2V0cyAmJiB1c2VyV2lkZ2V0cy5nZXRDb250ZW50KCkpIHtcbiAgICAgICAgICAgIHJldHVybiB1c2VyV2lkZ2V0cy5nZXRDb250ZW50KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB1c2VyIHNwZWNpZmljIHdpZGdldHMgKG5vdCBsaW5rZWQgdG8gYSBzcGVjaWZpYyByb29tKSBhcyBhbiBhcnJheVxuICAgICAqIEByZXR1cm4ge1tvYmplY3RdfSBBcnJheSBjb250YWluaW5nIGN1cnJlbnQgLyBhY3RpdmUgdXNlciB3aWRnZXRzXG4gICAgICovXG4gICAgc3RhdGljIGdldFVzZXJXaWRnZXRzQXJyYXkoKTogSVdpZGdldEV2ZW50W10ge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyhXaWRnZXRVdGlscy5nZXRVc2VyV2lkZ2V0cygpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWN0aXZlIHN0aWNrZXJwaWNrZXIgd2lkZ2V0cyAoc3RpY2tlcnBpY2tlcnMgYXJlIHVzZXIgd2lkZ2V0cyBieSBuYXR1cmUpXG4gICAgICogQHJldHVybiB7W29iamVjdF19IEFycmF5IGNvbnRhaW5pbmcgY3VycmVudCAvIGFjdGl2ZSBzdGlja2VycGlja2VyIHdpZGdldHNcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0U3RpY2tlcnBpY2tlcldpZGdldHMoKTogSVdpZGdldEV2ZW50W10ge1xuICAgICAgICBjb25zdCB3aWRnZXRzID0gV2lkZ2V0VXRpbHMuZ2V0VXNlcldpZGdldHNBcnJheSgpO1xuICAgICAgICByZXR1cm4gd2lkZ2V0cy5maWx0ZXIoKHdpZGdldCkgPT4gd2lkZ2V0LmNvbnRlbnQgJiYgd2lkZ2V0LmNvbnRlbnQudHlwZSA9PT0gXCJtLnN0aWNrZXJwaWNrZXJcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCBpbnRlZ3JhdGlvbiBtYW5hZ2VyIHdpZGdldHMgZm9yIHRoaXMgdXNlci5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0W119IEFuIGFycmF5IG9mIGludGVncmF0aW9uIG1hbmFnZXIgdXNlciB3aWRnZXRzLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRJbnRlZ3JhdGlvbk1hbmFnZXJXaWRnZXRzKCk6IElXaWRnZXRFdmVudFtdIHtcbiAgICAgICAgY29uc3Qgd2lkZ2V0cyA9IFdpZGdldFV0aWxzLmdldFVzZXJXaWRnZXRzQXJyYXkoKTtcbiAgICAgICAgcmV0dXJuIHdpZGdldHMuZmlsdGVyKHcgPT4gdy5jb250ZW50ICYmIHcuY29udGVudC50eXBlID09PSBcIm0uaW50ZWdyYXRpb25fbWFuYWdlclwiKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0Um9vbVdpZGdldHNPZlR5cGUocm9vbTogUm9vbSwgdHlwZTogV2lkZ2V0VHlwZSk6IElXaWRnZXRFdmVudFtdIHtcbiAgICAgICAgY29uc3Qgd2lkZ2V0cyA9IFdpZGdldFV0aWxzLmdldFJvb21XaWRnZXRzKHJvb20pO1xuICAgICAgICByZXR1cm4gKHdpZGdldHMgfHwgW10pLmZpbHRlcih3ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSB3LmdldENvbnRlbnQoKTtcbiAgICAgICAgICAgIHJldHVybiBjb250ZW50LnVybCAmJiB0eXBlLm1hdGNoZXMoY29udGVudC50eXBlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIHJlbW92ZUludGVncmF0aW9uTWFuYWdlcldpZGdldHMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKCFjbGllbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVXNlciBub3QgbG9nZ2VkIGluJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgd2lkZ2V0cyA9IGNsaWVudC5nZXRBY2NvdW50RGF0YSgnbS53aWRnZXRzJyk7XG4gICAgICAgIGlmICghd2lkZ2V0cykgcmV0dXJuO1xuICAgICAgICBjb25zdCB1c2VyV2lkZ2V0czogSVdpZGdldEV2ZW50W10gPSB3aWRnZXRzLmdldENvbnRlbnQoKSB8fCB7fTtcbiAgICAgICAgT2JqZWN0LmVudHJpZXModXNlcldpZGdldHMpLmZvckVhY2goKFtrZXksIHdpZGdldF0pID0+IHtcbiAgICAgICAgICAgIGlmICh3aWRnZXQuY29udGVudCAmJiB3aWRnZXQuY29udGVudC50eXBlID09PSBcIm0uaW50ZWdyYXRpb25fbWFuYWdlclwiKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHVzZXJXaWRnZXRzW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY2xpZW50LnNldEFjY291bnREYXRhKCdtLndpZGdldHMnLCB1c2VyV2lkZ2V0cyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFkZEludGVncmF0aW9uTWFuYWdlcldpZGdldChuYW1lOiBzdHJpbmcsIHVpVXJsOiBzdHJpbmcsIGFwaVVybDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBXaWRnZXRVdGlscy5zZXRVc2VyV2lkZ2V0KFxuICAgICAgICAgICAgXCJpbnRlZ3JhdGlvbl9tYW5hZ2VyX1wiICsgKG5ldyBEYXRlKCkuZ2V0VGltZSgpKSxcbiAgICAgICAgICAgIFdpZGdldFR5cGUuSU5URUdSQVRJT05fTUFOQUdFUixcbiAgICAgICAgICAgIHVpVXJsLFxuICAgICAgICAgICAgXCJJbnRlZ3JhdGlvbiBNYW5hZ2VyOiBcIiArIG5hbWUsXG4gICAgICAgICAgICB7XCJhcGlfdXJsXCI6IGFwaVVybH0sXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGFsbCBzdGlja2VycGlja2VyIHdpZGdldHMgKHN0aWNrZXJwaWNrZXJzIGFyZSB1c2VyIHdpZGdldHMgYnkgbmF0dXJlKVxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IFJlc29sdmVzIG9uIGFjY291bnQgZGF0YSB1cGRhdGVkXG4gICAgICovXG4gICAgc3RhdGljIHJlbW92ZVN0aWNrZXJwaWNrZXJXaWRnZXRzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmICghY2xpZW50KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VzZXIgbm90IGxvZ2dlZCBpbicpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHdpZGdldHMgPSBjbGllbnQuZ2V0QWNjb3VudERhdGEoJ20ud2lkZ2V0cycpO1xuICAgICAgICBpZiAoIXdpZGdldHMpIHJldHVybjtcbiAgICAgICAgY29uc3QgdXNlcldpZGdldHM6IFJlY29yZDxzdHJpbmcsIElXaWRnZXRFdmVudD4gPSB3aWRnZXRzLmdldENvbnRlbnQoKSB8fCB7fTtcbiAgICAgICAgT2JqZWN0LmVudHJpZXModXNlcldpZGdldHMpLmZvckVhY2goKFtrZXksIHdpZGdldF0pID0+IHtcbiAgICAgICAgICAgIGlmICh3aWRnZXQuY29udGVudCAmJiB3aWRnZXQuY29udGVudC50eXBlID09PSAnbS5zdGlja2VycGlja2VyJykge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB1c2VyV2lkZ2V0c1trZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNsaWVudC5zZXRBY2NvdW50RGF0YSgnbS53aWRnZXRzJywgdXNlcldpZGdldHMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBtYWtlQXBwQ29uZmlnKFxuICAgICAgICBhcHBJZDogc3RyaW5nLFxuICAgICAgICBhcHA6IFBhcnRpYWw8SUFwcD4sXG4gICAgICAgIHNlbmRlclVzZXJJZDogc3RyaW5nLFxuICAgICAgICByb29tSWQ6IHN0cmluZyB8IG51bGwsXG4gICAgICAgIGV2ZW50SWQ6IHN0cmluZyxcbiAgICApOiBJQXBwIHtcbiAgICAgICAgaWYgKCFzZW5kZXJVc2VySWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIldpZGdldHMgbXVzdCBiZSBjcmVhdGVkIGJ5IHNvbWVvbmUgLSBwcm92aWRlIGEgc2VuZGVyVXNlcklkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGFwcC5jcmVhdG9yVXNlcklkID0gc2VuZGVyVXNlcklkO1xuXG4gICAgICAgIGFwcC5pZCA9IGFwcElkO1xuICAgICAgICBhcHAucm9vbUlkID0gcm9vbUlkO1xuICAgICAgICBhcHAuZXZlbnRJZCA9IGV2ZW50SWQ7XG4gICAgICAgIGFwcC5uYW1lID0gYXBwLm5hbWUgfHwgYXBwLnR5cGU7XG5cbiAgICAgICAgcmV0dXJuIGFwcCBhcyBJQXBwO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRDYXBXaGl0ZWxpc3RGb3JBcHBUeXBlSW5Sb29tSWQoYXBwVHlwZTogc3RyaW5nLCByb29tSWQ6IHN0cmluZyk6IENhcGFiaWxpdHlbXSB7XG4gICAgICAgIGNvbnN0IGVuYWJsZVNjcmVlbnNob3RzID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImVuYWJsZVdpZGdldFNjcmVlbnNob3RzXCIsIHJvb21JZCk7XG5cbiAgICAgICAgY29uc3QgY2FwV2hpdGVsaXN0ID0gZW5hYmxlU2NyZWVuc2hvdHMgPyBbTWF0cml4Q2FwYWJpbGl0aWVzLlNjcmVlbnNob3RzXSA6IFtdO1xuXG4gICAgICAgIC8vIE9idmlvdXNseSBhbnlvbmUgdGhhdCBjYW4gYWRkIGEgd2lkZ2V0IGNhbiBjbGFpbSBpdCdzIGEgaml0c2kgd2lkZ2V0LFxuICAgICAgICAvLyBzbyB0aGlzIGRvZXNuJ3QgcmVhbGx5IG9mZmVyIG11Y2ggb3ZlciB0aGUgc2V0IG9mIGRvbWFpbnMgd2UgbG9hZFxuICAgICAgICAvLyB3aWRnZXRzIGZyb20gYXQgYWxsLCBidXQgaXQgcHJvYmFibHkgbWFrZXMgc2Vuc2UgZm9yIHNhbml0eS5cbiAgICAgICAgaWYgKFdpZGdldFR5cGUuSklUU0kubWF0Y2hlcyhhcHBUeXBlKSkge1xuICAgICAgICAgICAgY2FwV2hpdGVsaXN0LnB1c2goTWF0cml4Q2FwYWJpbGl0aWVzLkFsd2F5c09uU2NyZWVuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjYXBXaGl0ZWxpc3Q7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldExvY2FsSml0c2lXcmFwcGVyVXJsKG9wdHM6IHtmb3JMb2NhbFJlbmRlcj86IGJvb2xlYW4sIGF1dGg/OiBzdHJpbmd9ID0ge30pIHtcbiAgICAgICAgLy8gTkIuIHdlIGNhbid0IGp1c3QgZW5jb2RlVVJJQ29tcG9uZW50IGFsbCBvZiB0aGVzZSBiZWNhdXNlIHRoZSAkIHNpZ25zIG5lZWQgdG8gYmUgdGhlcmVcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmdQYXJ0cyA9IFtcbiAgICAgICAgICAgICdjb25mZXJlbmNlRG9tYWluPSRkb21haW4nLFxuICAgICAgICAgICAgJ2NvbmZlcmVuY2VJZD0kY29uZmVyZW5jZUlkJyxcbiAgICAgICAgICAgICdpc0F1ZGlvT25seT0kaXNBdWRpb09ubHknLFxuICAgICAgICAgICAgJ2Rpc3BsYXlOYW1lPSRtYXRyaXhfZGlzcGxheV9uYW1lJyxcbiAgICAgICAgICAgICdhdmF0YXJVcmw9JG1hdHJpeF9hdmF0YXJfdXJsJyxcbiAgICAgICAgICAgICd1c2VySWQ9JG1hdHJpeF91c2VyX2lkJyxcbiAgICAgICAgICAgICdyb29tSWQ9JG1hdHJpeF9yb29tX2lkJyxcbiAgICAgICAgICAgICd0aGVtZT0kdGhlbWUnLFxuICAgICAgICBdO1xuICAgICAgICBpZiAob3B0cy5hdXRoKSB7XG4gICAgICAgICAgICBxdWVyeVN0cmluZ1BhcnRzLnB1c2goYGF1dGg9JHtvcHRzLmF1dGh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeVN0cmluZ1BhcnRzLmpvaW4oJyYnKTtcblxuICAgICAgICBsZXQgYmFzZVVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLnByb3RvY29sICE9PSBcImh0dHBzOlwiICYmICFvcHRzLmZvckxvY2FsUmVuZGVyKSB7XG4gICAgICAgICAgICAvLyBVc2UgYW4gZXh0ZXJuYWwgd3JhcHBlciBpZiB3ZSdyZSBub3QgbG9jYWxseSByZW5kZXJpbmcgdGhlIHdpZGdldC4gVGhpcyBpcyB1c3VhbGx5XG4gICAgICAgICAgICAvLyB0aGUgVVJMIHRoYXQgd2lsbCBlbmQgdXAgaW4gdGhlIHdpZGdldCBldmVudCwgc28gd2Ugd2FudCB0byBtYWtlIHN1cmUgaXQncyByZWxhdGl2ZWx5XG4gICAgICAgICAgICAvLyBzYWZlIHRvIHNlbmQuXG4gICAgICAgICAgICAvLyBXZSdsbCBlbmQgdXAgdXNpbmcgYSBsb2NhbCByZW5kZXIgVVJMIHdoZW4gd2Ugc2VlIGEgSml0c2kgd2lkZ2V0IGFueXdheXMsIHNvIHRoaXMgaXNcbiAgICAgICAgICAgIC8vIHJlYWxseSBqdXN0IGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSBhbmQgdG8gYXBwZWFzZSB0aGUgc3BlYy5cbiAgICAgICAgICAgIGJhc2VVcmwgPSBcImh0dHBzOi8vYXBwLmVsZW1lbnQuaW8vXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChcImppdHNpLmh0bWwjXCIgKyBxdWVyeVN0cmluZywgYmFzZVVybCk7IC8vIHRoaXMgc3RyaXBzIGhhc2ggZnJhZ21lbnQgZnJvbSBiYXNlVXJsXG4gICAgICAgIHJldHVybiB1cmwuaHJlZjtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0V2lkZ2V0TmFtZShhcHA/OiBJQXBwKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGFwcD8ubmFtZT8udHJpbSgpIHx8IF90KFwiVW5rbm93biBBcHBcIik7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldFdpZGdldERhdGFUaXRsZShhcHA/OiBJQXBwKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGFwcD8uZGF0YT8udGl0bGU/LnRyaW0oKSB8fCBcIlwiO1xuICAgIH1cblxuICAgIHN0YXRpYyBlZGl0V2lkZ2V0KHJvb206IFJvb20sIGFwcDogSUFwcCk6IHZvaWQge1xuICAgICAgICAvLyBUT0RPOiBPcGVuIHRoZSByaWdodCBtYW5hZ2VyIGZvciB0aGUgd2lkZ2V0XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9tYW55X2ludGVncmF0aW9uX21hbmFnZXJzXCIpKSB7XG4gICAgICAgICAgICBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCkub3BlbkFsbChyb29tLCAndHlwZV8nICsgYXBwLnR5cGUsIGFwcC5pZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCkuZ2V0UHJpbWFyeU1hbmFnZXIoKS5vcGVuKHJvb20sICd0eXBlXycgKyBhcHAudHlwZSwgYXBwLmlkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBpc01hbmFnZWRCeU1hbmFnZXIoYXBwKSB7XG4gICAgICAgIGlmIChXaWRnZXRVdGlscy5pc1NjYWxhclVybChhcHAudXJsKSkge1xuICAgICAgICAgICAgY29uc3QgbWFuYWdlcnMgPSBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCk7XG4gICAgICAgICAgICBpZiAobWFuYWdlcnMuaGFzTWFuYWdlcigpKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogUGljayB0aGUgcmlnaHQgbWFuYWdlciBmb3IgdGhlIHdpZGdldFxuICAgICAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRNYW5hZ2VyID0gbWFuYWdlcnMuZ2V0UHJpbWFyeU1hbmFnZXIoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gV2lkZ2V0VXRpbHMuaXNTY2FsYXJVcmwoZGVmYXVsdE1hbmFnZXIuYXBpVXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIl19