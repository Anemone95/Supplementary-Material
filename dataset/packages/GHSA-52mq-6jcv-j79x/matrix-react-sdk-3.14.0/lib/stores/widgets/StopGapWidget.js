"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StopGapWidget = exports.ElementWidget = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _matrixWidgetApi = require("matrix-widget-api");

var _StopGapWidgetDriver = require("./StopGapWidgetDriver");

var _events = require("events");

var _WidgetMessagingStore = require("./WidgetMessagingStore");

var _RoomViewStore = _interopRequireDefault(require("../RoomViewStore"));

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _OwnProfileStore = require("../OwnProfileStore");

var _WidgetUtils = _interopRequireDefault(require("../../utils/WidgetUtils"));

var _IntegrationManagers = require("../../integrations/IntegrationManagers");

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _WidgetType = require("../../widgets/WidgetType");

var _ActiveWidgetStore = _interopRequireDefault(require("../ActiveWidgetStore"));

var _objects = require("../../utils/objects");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _ElementWidgetActions = require("./ElementWidgetActions");

var _ModalWidgetStore = require("../ModalWidgetStore");

var _ThemeWatcher = _interopRequireDefault(require("../../settings/watchers/ThemeWatcher"));

var _theme = require("../../theme");

var _CountlyAnalytics = _interopRequireDefault(require("../../CountlyAnalytics"));

var _ElementWidgetCapabilities = require("./ElementWidgetCapabilities");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// TODO: Don't use this because it's wrong
class ElementWidget extends _matrixWidgetApi.Widget {
  constructor(rawDefinition
  /*: IWidget*/
  ) {
    super(rawDefinition);
    this.rawDefinition
    /*:: */
    = rawDefinition
    /*:: */
    ;
  }

  get templateUrl()
  /*: string*/
  {
    if (_WidgetType.WidgetType.JITSI.matches(this.type)) {
      return _WidgetUtils.default.getLocalJitsiWrapperUrl({
        forLocalRender: true,
        auth: super.rawData?.auth // this.rawData can call templateUrl, do this to prevent looping

      });
    }

    return super.templateUrl;
  }

  get popoutTemplateUrl()
  /*: string*/
  {
    if (_WidgetType.WidgetType.JITSI.matches(this.type)) {
      return _WidgetUtils.default.getLocalJitsiWrapperUrl({
        forLocalRender: false,
        // The only important difference between this and templateUrl()
        auth: super.rawData?.auth
      });
    }

    return this.templateUrl; // use this instead of super to ensure we get appropriate templating
  }

  get rawData()
  /*: IWidgetData*/
  {
    let conferenceId = super.rawData['conferenceId'];

    if (conferenceId === undefined) {
      // we'll need to parse the conference ID out of the URL for v1 Jitsi widgets
      const parsedUrl = new URL(super.templateUrl); // use super to get the raw widget URL

      conferenceId = parsedUrl.searchParams.get("confId");
    }

    let domain = super.rawData['domain'];

    if (domain === undefined) {
      // v1 widgets default to jitsi.riot.im regardless of user settings
      domain = "jitsi.riot.im";
    }

    let theme = new _ThemeWatcher.default().getEffectiveTheme();

    if (theme.startsWith("custom-")) {
      const customTheme = (0, _theme.getCustomTheme)(theme.substr(7)); // Jitsi only understands light/dark

      theme = customTheme.is_dark ? "dark" : "light";
    } // only allow light/dark through, defaulting to dark as that was previously the only state
    // accounts for legacy-light/legacy-dark themes too


    if (theme.includes("light")) {
      theme = "light";
    } else {
      theme = "dark";
    }

    return _objectSpread(_objectSpread({}, super.rawData), {}, {
      theme,
      conferenceId,
      domain
    });
  }

  getCompleteUrl(params
  /*: ITemplateParams*/
  , asPopout = false)
  /*: string*/
  {
    return (0, _matrixWidgetApi.runTemplate)(asPopout ? this.popoutTemplateUrl : this.templateUrl, _objectSpread(_objectSpread({}, this.rawDefinition), {}, {
      data: this.rawData
    }), params);
  }

}

exports.ElementWidget = ElementWidget;

class StopGapWidget extends _events.EventEmitter {
  constructor(appTileProps
  /*: IAppTileProps*/
  ) {
    super();
    this.appTileProps
    /*:: */
    = appTileProps
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "messaging", void 0);
    (0, _defineProperty2.default)(this, "mockWidget", void 0);
    (0, _defineProperty2.default)(this, "scalarToken", void 0);
    (0, _defineProperty2.default)(this, "roomId", void 0);
    (0, _defineProperty2.default)(this, "kind", void 0);
    (0, _defineProperty2.default)(this, "onOpenModal", async (ev
    /*: CustomEvent<IModalWidgetOpenRequest>*/
    ) => {
      ev.preventDefault();

      if (_ModalWidgetStore.ModalWidgetStore.instance.canOpenModalWidget()) {
        _ModalWidgetStore.ModalWidgetStore.instance.openModalWidget(ev.detail.data, this.mockWidget);

        this.messaging.transport.reply(ev.detail, {}); // ack
      } else {
        this.messaging.transport.reply(ev.detail, {
          error: {
            message: "Unable to open modal at this time"
          }
        });
      }
    });
    (0, _defineProperty2.default)(this, "onEvent", (ev
    /*: MatrixEvent*/
    ) => {
      if (ev.isBeingDecrypted() || ev.isDecryptionFailure()) return;
      if (ev.getRoomId() !== this.eventListenerRoomId) return;
      this.feedEvent(ev);
    });
    (0, _defineProperty2.default)(this, "onEventDecrypted", (ev
    /*: MatrixEvent*/
    ) => {
      if (ev.isDecryptionFailure()) return;
      if (ev.getRoomId() !== this.eventListenerRoomId) return;
      this.feedEvent(ev);
    });
    let app = appTileProps.app; // Backwards compatibility: not all old widgets have a creatorUserId

    if (!app.creatorUserId) {
      app = (0, _objects.objectShallowClone)(app); // clone to prevent accidental mutation

      app.creatorUserId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();
    }

    this.mockWidget = new ElementWidget(app);
    this.roomId = appTileProps.room?.roomId;
    this.kind = appTileProps.userWidget ? _matrixWidgetApi.WidgetKind.Account : _matrixWidgetApi.WidgetKind.Room; // probably
  }

  get eventListenerRoomId()
  /*: string*/
  {
    // When widgets are listening to events, we need to make sure they're only
    // receiving events for the right room. In particular, room widgets get locked
    // to the room they were added in while account widgets listen to the currently
    // active room.
    if (this.roomId) return this.roomId;
    return _RoomViewStore.default.getRoomId();
  }

  get widgetApi()
  /*: ClientWidgetApi*/
  {
    return this.messaging;
  }
  /**
   * The URL to use in the iframe
   */


  get embedUrl()
  /*: string*/
  {
    return this.runUrlTemplate({
      asPopout: false
    });
  }
  /**
   * The URL to use in the popout
   */


  get popoutUrl()
  /*: string*/
  {
    return this.runUrlTemplate({
      asPopout: true
    });
  }

  runUrlTemplate(opts = {
    asPopout: false
  })
  /*: string*/
  {
    const templated = this.mockWidget.getCompleteUrl({
      widgetRoomId: this.roomId,
      currentUserId: _MatrixClientPeg.MatrixClientPeg.get().getUserId(),
      userDisplayName: _OwnProfileStore.OwnProfileStore.instance.displayName,
      userHttpAvatarUrl: _OwnProfileStore.OwnProfileStore.instance.getHttpAvatarUrl()
    }, opts?.asPopout);
    const parsed = new URL(templated); // Add in some legacy support sprinkles (for non-popout widgets)
    // TODO: Replace these with proper widget params
    // See https://github.com/matrix-org/matrix-doc/pull/1958/files#r405714833

    if (!opts?.asPopout) {
      parsed.searchParams.set('widgetId', this.mockWidget.id);
      parsed.searchParams.set('parentUrl', window.location.href.split('#', 2)[0]); // Give the widget a scalar token if we're supposed to (more legacy)
      // TODO: Stop doing this

      if (this.scalarToken) {
        parsed.searchParams.set('scalar_token', this.scalarToken);
      }
    } // Replace the encoded dollar signs back to dollar signs. They have no special meaning
    // in HTTP, but URL parsers encode them anyways.


    return parsed.toString().replace(/%24/g, '$');
  }

  get isManagedByManager()
  /*: boolean*/
  {
    return !!this.scalarToken;
  }

  get started()
  /*: boolean*/
  {
    return !!this.messaging;
  }

  get widgetId() {
    return this.messaging.widget.id;
  }

  start(iframe
  /*: HTMLIFrameElement*/
  ) {
    if (this.started) return;
    const allowedCapabilities = this.appTileProps.whitelistCapabilities || [];
    const driver = new _StopGapWidgetDriver.StopGapWidgetDriver(allowedCapabilities, this.mockWidget, this.kind, this.roomId);
    this.messaging = new _matrixWidgetApi.ClientWidgetApi(this.mockWidget, iframe, driver);
    this.messaging.on("preparing", () => this.emit("preparing"));
    this.messaging.on("ready", () => this.emit("ready"));
    this.messaging.on(`action:${_matrixWidgetApi.WidgetApiFromWidgetAction.OpenModalWidget}`, this.onOpenModal);

    _WidgetMessagingStore.WidgetMessagingStore.instance.storeMessaging(this.mockWidget, this.messaging);

    if (!this.appTileProps.userWidget && this.appTileProps.room) {
      _ActiveWidgetStore.default.setRoomId(this.mockWidget.id, this.appTileProps.room.roomId);
    } // Always attach a handler for ViewRoom, but permission check it internally


    this.messaging.on(`action:${_ElementWidgetActions.ElementWidgetActions.ViewRoom}`, (ev
    /*: CustomEvent<IViewRoomApiRequest>*/
    ) => {
      ev.preventDefault(); // stop the widget API from auto-rejecting this
      // Check up front if this is even a valid request

      const targetRoomId = (ev.detail.data || {}).room_id;

      if (!targetRoomId) {
        return this.messaging.transport.reply(ev.detail, {
          error: {
            message: "Room ID not supplied."
          }
        });
      } // Check the widget's permission


      if (!this.messaging.hasCapability(_ElementWidgetCapabilities.ElementWidgetCapabilities.CanChangeViewedRoom)) {
        return this.messaging.transport.reply(ev.detail, {
          error: {
            message: "This widget does not have permission for this action (denied)."
          }
        });
      } // at this point we can change rooms, so do that


      _dispatcher.default.dispatch({
        action: 'view_room',
        room_id: targetRoomId
      }); // acknowledge so the widget doesn't freak out


      this.messaging.transport.reply(ev.detail, {});
    }); // Attach listeners for feeding events - the underlying widget classes handle permissions for us

    _MatrixClientPeg.MatrixClientPeg.get().on('event', this.onEvent);

    _MatrixClientPeg.MatrixClientPeg.get().on('Event.decrypted', this.onEventDecrypted);

    this.messaging.on(`action:${_matrixWidgetApi.WidgetApiFromWidgetAction.UpdateAlwaysOnScreen}`, (ev
    /*: CustomEvent<IStickyActionRequest>*/
    ) => {
      if (this.messaging.hasCapability(_matrixWidgetApi.MatrixCapabilities.AlwaysOnScreen)) {
        if (_WidgetType.WidgetType.JITSI.matches(this.mockWidget.type)) {
          _CountlyAnalytics.default.instance.trackJoinCall(this.appTileProps.room.roomId, true, true);
        }

        _ActiveWidgetStore.default.setWidgetPersistence(this.mockWidget.id, ev.detail.data.value);

        ev.preventDefault();
        this.messaging.transport.reply(ev.detail, {}); // ack
      }
    }); // TODO: Replace this event listener with appropriate driver functionality once the API
    // establishes a sane way to send events back and forth.

    this.messaging.on(`action:${_matrixWidgetApi.WidgetApiFromWidgetAction.SendSticker}`, (ev
    /*: CustomEvent<IStickerActionRequest>*/
    ) => {
      if (this.messaging.hasCapability(_matrixWidgetApi.MatrixCapabilities.StickerSending)) {
        // Acknowledge first
        ev.preventDefault();
        this.messaging.transport.reply(ev.detail, {}); // Send the sticker

        _dispatcher.default.dispatch({
          action: 'm.sticker',
          data: ev.detail.data,
          widgetId: this.mockWidget.id
        });
      }
    });

    if (_WidgetType.WidgetType.STICKERPICKER.matches(this.mockWidget.type)) {
      this.messaging.on(`action:${_ElementWidgetActions.ElementWidgetActions.OpenIntegrationManager}`, (ev
      /*: CustomEvent<IWidgetApiRequest>*/
      ) => {
        // Acknowledge first
        ev.preventDefault();
        this.messaging.transport.reply(ev.detail, {}); // First close the stickerpicker

        _dispatcher.default.dispatch({
          action: "stickerpicker_close"
        }); // Now open the integration manager
        // TODO: Spec this interaction.


        const data = ev.detail.data;
        const integType = data?.integType;
        const integId = data?.integId; // TODO: Open the right integration manager for the widget

        if (_SettingsStore.default.getValue("feature_many_integration_managers")) {
          _IntegrationManagers.IntegrationManagers.sharedInstance().openAll(_MatrixClientPeg.MatrixClientPeg.get().getRoom(_RoomViewStore.default.getRoomId()), `type_${integType}`, integId);
        } else {
          _IntegrationManagers.IntegrationManagers.sharedInstance().getPrimaryManager().open(_MatrixClientPeg.MatrixClientPeg.get().getRoom(_RoomViewStore.default.getRoomId()), `type_${integType}`, integId);
        }
      });
    }
  }

  async prepare()
  /*: Promise<void>*/
  {
    if (this.scalarToken) return;

    const existingMessaging = _WidgetMessagingStore.WidgetMessagingStore.instance.getMessaging(this.mockWidget);

    if (existingMessaging) this.messaging = existingMessaging;

    try {
      if (_WidgetUtils.default.isScalarUrl(this.mockWidget.templateUrl)) {
        const managers = _IntegrationManagers.IntegrationManagers.sharedInstance();

        if (managers.hasManager()) {
          // TODO: Pick the right manager for the widget
          const defaultManager = managers.getPrimaryManager();

          if (_WidgetUtils.default.isScalarUrl(defaultManager.apiUrl)) {
            const scalar = defaultManager.getScalarClient();
            this.scalarToken = await scalar.getScalarToken();
          }
        }
      }
    } catch (e) {
      // All errors are non-fatal
      console.error("Error preparing widget communications: ", e);
    }
  }

  stop(opts = {
    forceDestroy: false
  }) {
    if (!opts?.forceDestroy && _ActiveWidgetStore.default.getPersistentWidgetId() === this.mockWidget.id) {
      console.log("Skipping destroy - persistent widget");
      return;
    }

    if (!this.started) return;

    _WidgetMessagingStore.WidgetMessagingStore.instance.stopMessaging(this.mockWidget);

    _ActiveWidgetStore.default.delRoomId(this.mockWidget.id);

    if (_MatrixClientPeg.MatrixClientPeg.get()) {
      _MatrixClientPeg.MatrixClientPeg.get().off('event', this.onEvent);

      _MatrixClientPeg.MatrixClientPeg.get().off('Event.decrypted', this.onEventDecrypted);
    }
  }

  feedEvent(ev
  /*: MatrixEvent*/
  ) {
    if (!this.messaging) return;
    const raw = ev.event;
    this.messaging.feedEvent(raw).catch(e => {
      console.error("Error sending event to widget: ", e);
    });
  }

}

exports.StopGapWidget = StopGapWidget;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdG9yZXMvd2lkZ2V0cy9TdG9wR2FwV2lkZ2V0LnRzIl0sIm5hbWVzIjpbIkVsZW1lbnRXaWRnZXQiLCJXaWRnZXQiLCJjb25zdHJ1Y3RvciIsInJhd0RlZmluaXRpb24iLCJ0ZW1wbGF0ZVVybCIsIldpZGdldFR5cGUiLCJKSVRTSSIsIm1hdGNoZXMiLCJ0eXBlIiwiV2lkZ2V0VXRpbHMiLCJnZXRMb2NhbEppdHNpV3JhcHBlclVybCIsImZvckxvY2FsUmVuZGVyIiwiYXV0aCIsInJhd0RhdGEiLCJwb3BvdXRUZW1wbGF0ZVVybCIsImNvbmZlcmVuY2VJZCIsInVuZGVmaW5lZCIsInBhcnNlZFVybCIsIlVSTCIsInNlYXJjaFBhcmFtcyIsImdldCIsImRvbWFpbiIsInRoZW1lIiwiVGhlbWVXYXRjaGVyIiwiZ2V0RWZmZWN0aXZlVGhlbWUiLCJzdGFydHNXaXRoIiwiY3VzdG9tVGhlbWUiLCJzdWJzdHIiLCJpc19kYXJrIiwiaW5jbHVkZXMiLCJnZXRDb21wbGV0ZVVybCIsInBhcmFtcyIsImFzUG9wb3V0IiwiZGF0YSIsIlN0b3BHYXBXaWRnZXQiLCJFdmVudEVtaXR0ZXIiLCJhcHBUaWxlUHJvcHMiLCJldiIsInByZXZlbnREZWZhdWx0IiwiTW9kYWxXaWRnZXRTdG9yZSIsImluc3RhbmNlIiwiY2FuT3Blbk1vZGFsV2lkZ2V0Iiwib3Blbk1vZGFsV2lkZ2V0IiwiZGV0YWlsIiwibW9ja1dpZGdldCIsIm1lc3NhZ2luZyIsInRyYW5zcG9ydCIsInJlcGx5IiwiZXJyb3IiLCJtZXNzYWdlIiwiaXNCZWluZ0RlY3J5cHRlZCIsImlzRGVjcnlwdGlvbkZhaWx1cmUiLCJnZXRSb29tSWQiLCJldmVudExpc3RlbmVyUm9vbUlkIiwiZmVlZEV2ZW50IiwiYXBwIiwiY3JlYXRvclVzZXJJZCIsIk1hdHJpeENsaWVudFBlZyIsImdldFVzZXJJZCIsInJvb21JZCIsInJvb20iLCJraW5kIiwidXNlcldpZGdldCIsIldpZGdldEtpbmQiLCJBY2NvdW50IiwiUm9vbSIsIlJvb21WaWV3U3RvcmUiLCJ3aWRnZXRBcGkiLCJlbWJlZFVybCIsInJ1blVybFRlbXBsYXRlIiwicG9wb3V0VXJsIiwib3B0cyIsInRlbXBsYXRlZCIsIndpZGdldFJvb21JZCIsImN1cnJlbnRVc2VySWQiLCJ1c2VyRGlzcGxheU5hbWUiLCJPd25Qcm9maWxlU3RvcmUiLCJkaXNwbGF5TmFtZSIsInVzZXJIdHRwQXZhdGFyVXJsIiwiZ2V0SHR0cEF2YXRhclVybCIsInBhcnNlZCIsInNldCIsImlkIiwid2luZG93IiwibG9jYXRpb24iLCJocmVmIiwic3BsaXQiLCJzY2FsYXJUb2tlbiIsInRvU3RyaW5nIiwicmVwbGFjZSIsImlzTWFuYWdlZEJ5TWFuYWdlciIsInN0YXJ0ZWQiLCJ3aWRnZXRJZCIsIndpZGdldCIsInN0YXJ0IiwiaWZyYW1lIiwiYWxsb3dlZENhcGFiaWxpdGllcyIsIndoaXRlbGlzdENhcGFiaWxpdGllcyIsImRyaXZlciIsIlN0b3BHYXBXaWRnZXREcml2ZXIiLCJDbGllbnRXaWRnZXRBcGkiLCJvbiIsImVtaXQiLCJXaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uIiwiT3Blbk1vZGFsV2lkZ2V0Iiwib25PcGVuTW9kYWwiLCJXaWRnZXRNZXNzYWdpbmdTdG9yZSIsInN0b3JlTWVzc2FnaW5nIiwiQWN0aXZlV2lkZ2V0U3RvcmUiLCJzZXRSb29tSWQiLCJFbGVtZW50V2lkZ2V0QWN0aW9ucyIsIlZpZXdSb29tIiwidGFyZ2V0Um9vbUlkIiwicm9vbV9pZCIsImhhc0NhcGFiaWxpdHkiLCJFbGVtZW50V2lkZ2V0Q2FwYWJpbGl0aWVzIiwiQ2FuQ2hhbmdlVmlld2VkUm9vbSIsImRlZmF1bHREaXNwYXRjaGVyIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJvbkV2ZW50Iiwib25FdmVudERlY3J5cHRlZCIsIlVwZGF0ZUFsd2F5c09uU2NyZWVuIiwiTWF0cml4Q2FwYWJpbGl0aWVzIiwiQWx3YXlzT25TY3JlZW4iLCJDb3VudGx5QW5hbHl0aWNzIiwidHJhY2tKb2luQ2FsbCIsInNldFdpZGdldFBlcnNpc3RlbmNlIiwidmFsdWUiLCJTZW5kU3RpY2tlciIsIlN0aWNrZXJTZW5kaW5nIiwiU1RJQ0tFUlBJQ0tFUiIsIk9wZW5JbnRlZ3JhdGlvbk1hbmFnZXIiLCJpbnRlZ1R5cGUiLCJpbnRlZ0lkIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiSW50ZWdyYXRpb25NYW5hZ2VycyIsInNoYXJlZEluc3RhbmNlIiwib3BlbkFsbCIsImdldFJvb20iLCJnZXRQcmltYXJ5TWFuYWdlciIsIm9wZW4iLCJwcmVwYXJlIiwiZXhpc3RpbmdNZXNzYWdpbmciLCJnZXRNZXNzYWdpbmciLCJpc1NjYWxhclVybCIsIm1hbmFnZXJzIiwiaGFzTWFuYWdlciIsImRlZmF1bHRNYW5hZ2VyIiwiYXBpVXJsIiwic2NhbGFyIiwiZ2V0U2NhbGFyQ2xpZW50IiwiZ2V0U2NhbGFyVG9rZW4iLCJlIiwiY29uc29sZSIsInN0b3AiLCJmb3JjZURlc3Ryb3kiLCJnZXRQZXJzaXN0ZW50V2lkZ2V0SWQiLCJsb2ciLCJzdG9wTWVzc2FnaW5nIiwiZGVsUm9vbUlkIiwib2ZmIiwicmF3IiwiZXZlbnQiLCJjYXRjaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFpQkE7QUFDTyxNQUFNQSxhQUFOLFNBQTRCQyx1QkFBNUIsQ0FBbUM7QUFDdENDLEVBQUFBLFdBQVcsQ0FBU0M7QUFBVDtBQUFBLElBQWlDO0FBQ3hDLFVBQU1BLGFBQU47QUFEd0MsU0FBeEJBO0FBQXdCO0FBQUEsTUFBeEJBO0FBQXdCO0FBQUE7QUFFM0M7O0FBRUQsTUFBV0MsV0FBWDtBQUFBO0FBQWlDO0FBQzdCLFFBQUlDLHVCQUFXQyxLQUFYLENBQWlCQyxPQUFqQixDQUF5QixLQUFLQyxJQUE5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RTtBQUFmLEdBQW5CLEVBQTBDO0FBQ3RDLFFBQUksQ0FBQ3RGLElBQUksRUFBRXNGLFlBQVAsSUFBdUJqRCwyQkFBa0JrRCxxQkFBbEIsT0FBOEMsS0FBS2xILFVBQUwsQ0FBZ0JzQyxFQUF6RixFQUE2RjtBQUN6RnlFLE1BQUFBLE9BQU8sQ0FBQ0ksR0FBUixDQUFZLHNDQUFaO0FBQ0E7QUFDSDs7QUFDRCxRQUFJLENBQUMsS0FBS3BFLE9BQVYsRUFBbUI7O0FBQ25CZSwrQ0FBcUJsRSxRQUFyQixDQUE4QndILGFBQTlCLENBQTRDLEtBQUtwSCxVQUFqRDs7QUFDQWdFLCtCQUFrQnFELFNBQWxCLENBQTRCLEtBQUtySCxVQUFMLENBQWdCc0MsRUFBNUM7O0FBRUEsUUFBSXpCLGlDQUFnQnJDLEdBQWhCLEVBQUosRUFBMkI7QUFDdkJxQyx1Q0FBZ0JyQyxHQUFoQixHQUFzQjhJLEdBQXRCLENBQTBCLE9BQTFCLEVBQW1DLEtBQUsxQyxPQUF4Qzs7QUFDQS9ELHVDQUFnQnJDLEdBQWhCLEdBQXNCOEksR0FBdEIsQ0FBMEIsaUJBQTFCLEVBQTZDLEtBQUt6QyxnQkFBbEQ7QUFDSDtBQUNKOztBQWNPbkUsRUFBQUEsU0FBUixDQUFrQmpCO0FBQWxCO0FBQUEsSUFBbUM7QUFDL0IsUUFBSSxDQUFDLEtBQUtRLFNBQVYsRUFBcUI7QUFFckIsVUFBTXNILEdBQUcsR0FBRzlILEVBQUUsQ0FBQytILEtBQWY7QUFDQSxTQUFLdkgsU0FBTCxDQUFlUyxTQUFmLENBQXlCNkcsR0FBekIsRUFBOEJFLEtBQTlCLENBQW9DWCxDQUFDLElBQUk7QUFDckNDLE1BQUFBLE9BQU8sQ0FBQzNHLEtBQVIsQ0FBYyxpQ0FBZCxFQUFpRDBHLENBQWpEO0FBQ0gsS0FGRDtBQUdIOztBQXBSMkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7XG4gICAgQ2xpZW50V2lkZ2V0QXBpLFxuICAgIElTdGlja2VyQWN0aW9uUmVxdWVzdCxcbiAgICBJU3RpY2t5QWN0aW9uUmVxdWVzdCxcbiAgICBJVGVtcGxhdGVQYXJhbXMsXG4gICAgSVdpZGdldCxcbiAgICBJV2lkZ2V0QXBpUmVxdWVzdCxcbiAgICBJV2lkZ2V0QXBpUmVxdWVzdEVtcHR5RGF0YSxcbiAgICBJV2lkZ2V0RGF0YSxcbiAgICBNYXRyaXhDYXBhYmlsaXRpZXMsXG4gICAgcnVuVGVtcGxhdGUsXG4gICAgV2lkZ2V0LFxuICAgIFdpZGdldEFwaUZyb21XaWRnZXRBY3Rpb24sXG4gICAgSU1vZGFsV2lkZ2V0T3BlblJlcXVlc3QsXG4gICAgSVdpZGdldEFwaUVycm9yUmVzcG9uc2VEYXRhLFxuICAgIFdpZGdldEtpbmQsXG59IGZyb20gXCJtYXRyaXgtd2lkZ2V0LWFwaVwiO1xuaW1wb3J0IHsgU3RvcEdhcFdpZGdldERyaXZlciB9IGZyb20gXCIuL1N0b3BHYXBXaWRnZXREcml2ZXJcIjtcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gXCJldmVudHNcIjtcbmltcG9ydCB7IFdpZGdldE1lc3NhZ2luZ1N0b3JlIH0gZnJvbSBcIi4vV2lkZ2V0TWVzc2FnaW5nU3RvcmVcIjtcbmltcG9ydCBSb29tVmlld1N0b3JlIGZyb20gXCIuLi9Sb29tVmlld1N0b3JlXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgeyBPd25Qcm9maWxlU3RvcmUgfSBmcm9tIFwiLi4vT3duUHJvZmlsZVN0b3JlXCI7XG5pbXBvcnQgV2lkZ2V0VXRpbHMgZnJvbSAnLi4vLi4vdXRpbHMvV2lkZ2V0VXRpbHMnO1xuaW1wb3J0IHsgSW50ZWdyYXRpb25NYW5hZ2VycyB9IGZyb20gXCIuLi8uLi9pbnRlZ3JhdGlvbnMvSW50ZWdyYXRpb25NYW5hZ2Vyc1wiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IFdpZGdldFR5cGUgfSBmcm9tIFwiLi4vLi4vd2lkZ2V0cy9XaWRnZXRUeXBlXCI7XG5pbXBvcnQgQWN0aXZlV2lkZ2V0U3RvcmUgZnJvbSBcIi4uL0FjdGl2ZVdpZGdldFN0b3JlXCI7XG5pbXBvcnQgeyBvYmplY3RTaGFsbG93Q2xvbmUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvb2JqZWN0c1wiO1xuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IEVsZW1lbnRXaWRnZXRBY3Rpb25zLCBJVmlld1Jvb21BcGlSZXF1ZXN0IH0gZnJvbSBcIi4vRWxlbWVudFdpZGdldEFjdGlvbnNcIjtcbmltcG9ydCB7TW9kYWxXaWRnZXRTdG9yZX0gZnJvbSBcIi4uL01vZGFsV2lkZ2V0U3RvcmVcIjtcbmltcG9ydCBUaGVtZVdhdGNoZXIgZnJvbSBcIi4uLy4uL3NldHRpbmdzL3dhdGNoZXJzL1RoZW1lV2F0Y2hlclwiO1xuaW1wb3J0IHtnZXRDdXN0b21UaGVtZX0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5pbXBvcnQgQ291bnRseUFuYWx5dGljcyBmcm9tIFwiLi4vLi4vQ291bnRseUFuYWx5dGljc1wiO1xuaW1wb3J0IHsgRWxlbWVudFdpZGdldENhcGFiaWxpdGllcyB9IGZyb20gXCIuL0VsZW1lbnRXaWRnZXRDYXBhYmlsaXRpZXNcIjtcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuXG4vLyBUT0RPOiBEZXN0cm95IGFsbCBvZiB0aGlzIGNvZGVcblxuaW50ZXJmYWNlIElBcHBUaWxlUHJvcHMge1xuICAgIC8vIE5vdGU6IHRoZXNlIGFyZSBvbmx5IHRoZSBwcm9wcyB3ZSBjYXJlIGFib3V0XG5cbiAgICBhcHA6IElXaWRnZXQ7XG4gICAgcm9vbTogUm9vbTtcbiAgICB1c2VySWQ6IHN0cmluZztcbiAgICBjcmVhdG9yVXNlcklkOiBzdHJpbmc7XG4gICAgd2FpdEZvcklmcmFtZUxvYWQ6IGJvb2xlYW47XG4gICAgd2hpdGVsaXN0Q2FwYWJpbGl0aWVzOiBzdHJpbmdbXTtcbiAgICB1c2VyV2lkZ2V0OiBib29sZWFuO1xufVxuXG4vLyBUT0RPOiBEb24ndCB1c2UgdGhpcyBiZWNhdXNlIGl0J3Mgd3JvbmdcbmV4cG9ydCBjbGFzcyBFbGVtZW50V2lkZ2V0IGV4dGVuZHMgV2lkZ2V0IHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJhd0RlZmluaXRpb246IElXaWRnZXQpIHtcbiAgICAgICAgc3VwZXIocmF3RGVmaW5pdGlvbik7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCB0ZW1wbGF0ZVVybCgpOiBzdHJpbmcge1xuICAgICAgICBpZiAoV2lkZ2V0VHlwZS5KSVRTSS5tYXRjaGVzKHRoaXMudHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBXaWRnZXRVdGlscy5nZXRMb2NhbEppdHNpV3JhcHBlclVybCh7XG4gICAgICAgICAgICAgICAgZm9yTG9jYWxSZW5kZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgYXV0aDogc3VwZXIucmF3RGF0YT8uYXV0aCBhcyBzdHJpbmcsIC8vIHRoaXMucmF3RGF0YSBjYW4gY2FsbCB0ZW1wbGF0ZVVybCwgZG8gdGhpcyB0byBwcmV2ZW50IGxvb3BpbmdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBlci50ZW1wbGF0ZVVybDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHBvcG91dFRlbXBsYXRlVXJsKCk6IHN0cmluZyB7XG4gICAgICAgIGlmIChXaWRnZXRUeXBlLkpJVFNJLm1hdGNoZXModGhpcy50eXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIFdpZGdldFV0aWxzLmdldExvY2FsSml0c2lXcmFwcGVyVXJsKHtcbiAgICAgICAgICAgICAgICBmb3JMb2NhbFJlbmRlcjogZmFsc2UsIC8vIFRoZSBvbmx5IGltcG9ydGFudCBkaWZmZXJlbmNlIGJldHdlZW4gdGhpcyBhbmQgdGVtcGxhdGVVcmwoKVxuICAgICAgICAgICAgICAgIGF1dGg6IHN1cGVyLnJhd0RhdGE/LmF1dGggYXMgc3RyaW5nLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudGVtcGxhdGVVcmw7IC8vIHVzZSB0aGlzIGluc3RlYWQgb2Ygc3VwZXIgdG8gZW5zdXJlIHdlIGdldCBhcHByb3ByaWF0ZSB0ZW1wbGF0aW5nXG4gICAgfVxuXG4gICAgcHVibGljIGdldCByYXdEYXRhKCk6IElXaWRnZXREYXRhIHtcbiAgICAgICAgbGV0IGNvbmZlcmVuY2VJZCA9IHN1cGVyLnJhd0RhdGFbJ2NvbmZlcmVuY2VJZCddO1xuICAgICAgICBpZiAoY29uZmVyZW5jZUlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIHdlJ2xsIG5lZWQgdG8gcGFyc2UgdGhlIGNvbmZlcmVuY2UgSUQgb3V0IG9mIHRoZSBVUkwgZm9yIHYxIEppdHNpIHdpZGdldHNcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZFVybCA9IG5ldyBVUkwoc3VwZXIudGVtcGxhdGVVcmwpOyAvLyB1c2Ugc3VwZXIgdG8gZ2V0IHRoZSByYXcgd2lkZ2V0IFVSTFxuICAgICAgICAgICAgY29uZmVyZW5jZUlkID0gcGFyc2VkVXJsLnNlYXJjaFBhcmFtcy5nZXQoXCJjb25mSWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGRvbWFpbiA9IHN1cGVyLnJhd0RhdGFbJ2RvbWFpbiddO1xuICAgICAgICBpZiAoZG9tYWluID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIHYxIHdpZGdldHMgZGVmYXVsdCB0byBqaXRzaS5yaW90LmltIHJlZ2FyZGxlc3Mgb2YgdXNlciBzZXR0aW5nc1xuICAgICAgICAgICAgZG9tYWluID0gXCJqaXRzaS5yaW90LmltXCI7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGhlbWUgPSBuZXcgVGhlbWVXYXRjaGVyKCkuZ2V0RWZmZWN0aXZlVGhlbWUoKTtcbiAgICAgICAgaWYgKHRoZW1lLnN0YXJ0c1dpdGgoXCJjdXN0b20tXCIpKSB7XG4gICAgICAgICAgICBjb25zdCBjdXN0b21UaGVtZSA9IGdldEN1c3RvbVRoZW1lKHRoZW1lLnN1YnN0cig3KSk7XG4gICAgICAgICAgICAvLyBKaXRzaSBvbmx5IHVuZGVyc3RhbmRzIGxpZ2h0L2RhcmtcbiAgICAgICAgICAgIHRoZW1lID0gY3VzdG9tVGhlbWUuaXNfZGFyayA/IFwiZGFya1wiIDogXCJsaWdodFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gb25seSBhbGxvdyBsaWdodC9kYXJrIHRocm91Z2gsIGRlZmF1bHRpbmcgdG8gZGFyayBhcyB0aGF0IHdhcyBwcmV2aW91c2x5IHRoZSBvbmx5IHN0YXRlXG4gICAgICAgIC8vIGFjY291bnRzIGZvciBsZWdhY3ktbGlnaHQvbGVnYWN5LWRhcmsgdGhlbWVzIHRvb1xuICAgICAgICBpZiAodGhlbWUuaW5jbHVkZXMoXCJsaWdodFwiKSkge1xuICAgICAgICAgICAgdGhlbWUgPSBcImxpZ2h0XCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGVtZSA9IFwiZGFya1wiO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLnN1cGVyLnJhd0RhdGEsXG4gICAgICAgICAgICB0aGVtZSxcbiAgICAgICAgICAgIGNvbmZlcmVuY2VJZCxcbiAgICAgICAgICAgIGRvbWFpbixcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q29tcGxldGVVcmwocGFyYW1zOiBJVGVtcGxhdGVQYXJhbXMsIGFzUG9wb3V0PWZhbHNlKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHJ1blRlbXBsYXRlKGFzUG9wb3V0ID8gdGhpcy5wb3BvdXRUZW1wbGF0ZVVybCA6IHRoaXMudGVtcGxhdGVVcmwsIHtcbiAgICAgICAgICAgIC4uLnRoaXMucmF3RGVmaW5pdGlvbixcbiAgICAgICAgICAgIGRhdGE6IHRoaXMucmF3RGF0YSxcbiAgICAgICAgfSwgcGFyYW1zKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTdG9wR2FwV2lkZ2V0IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgICBwcml2YXRlIG1lc3NhZ2luZzogQ2xpZW50V2lkZ2V0QXBpO1xuICAgIHByaXZhdGUgbW9ja1dpZGdldDogRWxlbWVudFdpZGdldDtcbiAgICBwcml2YXRlIHNjYWxhclRva2VuOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSByb29tSWQ/OiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBraW5kOiBXaWRnZXRLaW5kO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBhcHBUaWxlUHJvcHM6IElBcHBUaWxlUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgbGV0IGFwcCA9IGFwcFRpbGVQcm9wcy5hcHA7XG5cbiAgICAgICAgLy8gQmFja3dhcmRzIGNvbXBhdGliaWxpdHk6IG5vdCBhbGwgb2xkIHdpZGdldHMgaGF2ZSBhIGNyZWF0b3JVc2VySWRcbiAgICAgICAgaWYgKCFhcHAuY3JlYXRvclVzZXJJZCkge1xuICAgICAgICAgICAgYXBwID0gb2JqZWN0U2hhbGxvd0Nsb25lKGFwcCk7IC8vIGNsb25lIHRvIHByZXZlbnQgYWNjaWRlbnRhbCBtdXRhdGlvblxuICAgICAgICAgICAgYXBwLmNyZWF0b3JVc2VySWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1vY2tXaWRnZXQgPSBuZXcgRWxlbWVudFdpZGdldChhcHApO1xuICAgICAgICB0aGlzLnJvb21JZCA9IGFwcFRpbGVQcm9wcy5yb29tPy5yb29tSWQ7XG4gICAgICAgIHRoaXMua2luZCA9IGFwcFRpbGVQcm9wcy51c2VyV2lkZ2V0ID8gV2lkZ2V0S2luZC5BY2NvdW50IDogV2lkZ2V0S2luZC5Sb29tOyAvLyBwcm9iYWJseVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IGV2ZW50TGlzdGVuZXJSb29tSWQoKTogc3RyaW5nIHtcbiAgICAgICAgLy8gV2hlbiB3aWRnZXRzIGFyZSBsaXN0ZW5pbmcgdG8gZXZlbnRzLCB3ZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGV5J3JlIG9ubHlcbiAgICAgICAgLy8gcmVjZWl2aW5nIGV2ZW50cyBmb3IgdGhlIHJpZ2h0IHJvb20uIEluIHBhcnRpY3VsYXIsIHJvb20gd2lkZ2V0cyBnZXQgbG9ja2VkXG4gICAgICAgIC8vIHRvIHRoZSByb29tIHRoZXkgd2VyZSBhZGRlZCBpbiB3aGlsZSBhY2NvdW50IHdpZGdldHMgbGlzdGVuIHRvIHRoZSBjdXJyZW50bHlcbiAgICAgICAgLy8gYWN0aXZlIHJvb20uXG5cbiAgICAgICAgaWYgKHRoaXMucm9vbUlkKSByZXR1cm4gdGhpcy5yb29tSWQ7XG5cbiAgICAgICAgcmV0dXJuIFJvb21WaWV3U3RvcmUuZ2V0Um9vbUlkKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCB3aWRnZXRBcGkoKTogQ2xpZW50V2lkZ2V0QXBpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnaW5nO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBVUkwgdG8gdXNlIGluIHRoZSBpZnJhbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGVtYmVkVXJsKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnJ1blVybFRlbXBsYXRlKHthc1BvcG91dDogZmFsc2V9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgVVJMIHRvIHVzZSBpbiB0aGUgcG9wb3V0XG4gICAgICovXG4gICAgcHVibGljIGdldCBwb3BvdXRVcmwoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucnVuVXJsVGVtcGxhdGUoe2FzUG9wb3V0OiB0cnVlfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBydW5VcmxUZW1wbGF0ZShvcHRzID0ge2FzUG9wb3V0OiBmYWxzZX0pOiBzdHJpbmcge1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZWQgPSB0aGlzLm1vY2tXaWRnZXQuZ2V0Q29tcGxldGVVcmwoe1xuICAgICAgICAgICAgd2lkZ2V0Um9vbUlkOiB0aGlzLnJvb21JZCxcbiAgICAgICAgICAgIGN1cnJlbnRVc2VySWQ6IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKSxcbiAgICAgICAgICAgIHVzZXJEaXNwbGF5TmFtZTogT3duUHJvZmlsZVN0b3JlLmluc3RhbmNlLmRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgdXNlckh0dHBBdmF0YXJVcmw6IE93blByb2ZpbGVTdG9yZS5pbnN0YW5jZS5nZXRIdHRwQXZhdGFyVXJsKCksXG4gICAgICAgIH0sIG9wdHM/LmFzUG9wb3V0KTtcblxuICAgICAgICBjb25zdCBwYXJzZWQgPSBuZXcgVVJMKHRlbXBsYXRlZCk7XG5cbiAgICAgICAgLy8gQWRkIGluIHNvbWUgbGVnYWN5IHN1cHBvcnQgc3ByaW5rbGVzIChmb3Igbm9uLXBvcG91dCB3aWRnZXRzKVxuICAgICAgICAvLyBUT0RPOiBSZXBsYWNlIHRoZXNlIHdpdGggcHJvcGVyIHdpZGdldCBwYXJhbXNcbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL21hdHJpeC1kb2MvcHVsbC8xOTU4L2ZpbGVzI3I0MDU3MTQ4MzNcbiAgICAgICAgaWYgKCFvcHRzPy5hc1BvcG91dCkge1xuICAgICAgICAgICAgcGFyc2VkLnNlYXJjaFBhcmFtcy5zZXQoJ3dpZGdldElkJywgdGhpcy5tb2NrV2lkZ2V0LmlkKTtcbiAgICAgICAgICAgIHBhcnNlZC5zZWFyY2hQYXJhbXMuc2V0KCdwYXJlbnRVcmwnLCB3aW5kb3cubG9jYXRpb24uaHJlZi5zcGxpdCgnIycsIDIpWzBdKTtcblxuICAgICAgICAgICAgLy8gR2l2ZSB0aGUgd2lkZ2V0IGEgc2NhbGFyIHRva2VuIGlmIHdlJ3JlIHN1cHBvc2VkIHRvIChtb3JlIGxlZ2FjeSlcbiAgICAgICAgICAgIC8vIFRPRE86IFN0b3AgZG9pbmcgdGhpc1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NhbGFyVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBwYXJzZWQuc2VhcmNoUGFyYW1zLnNldCgnc2NhbGFyX3Rva2VuJywgdGhpcy5zY2FsYXJUb2tlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXBsYWNlIHRoZSBlbmNvZGVkIGRvbGxhciBzaWducyBiYWNrIHRvIGRvbGxhciBzaWducy4gVGhleSBoYXZlIG5vIHNwZWNpYWwgbWVhbmluZ1xuICAgICAgICAvLyBpbiBIVFRQLCBidXQgVVJMIHBhcnNlcnMgZW5jb2RlIHRoZW0gYW55d2F5cy5cbiAgICAgICAgcmV0dXJuIHBhcnNlZC50b1N0cmluZygpLnJlcGxhY2UoLyUyNC9nLCAnJCcpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaXNNYW5hZ2VkQnlNYW5hZ2VyKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLnNjYWxhclRva2VuO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgc3RhcnRlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5tZXNzYWdpbmc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXQgd2lkZ2V0SWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lc3NhZ2luZy53aWRnZXQuaWQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk9wZW5Nb2RhbCA9IGFzeW5jIChldjogQ3VzdG9tRXZlbnQ8SU1vZGFsV2lkZ2V0T3BlblJlcXVlc3Q+KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChNb2RhbFdpZGdldFN0b3JlLmluc3RhbmNlLmNhbk9wZW5Nb2RhbFdpZGdldCgpKSB7XG4gICAgICAgICAgICBNb2RhbFdpZGdldFN0b3JlLmluc3RhbmNlLm9wZW5Nb2RhbFdpZGdldChldi5kZXRhaWwuZGF0YSwgdGhpcy5tb2NrV2lkZ2V0KTtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnaW5nLnRyYW5zcG9ydC5yZXBseShldi5kZXRhaWwsIHt9KTsgLy8gYWNrXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2luZy50cmFuc3BvcnQucmVwbHkoZXYuZGV0YWlsLCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJVbmFibGUgdG8gb3BlbiBtb2RhbCBhdCB0aGlzIHRpbWVcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwdWJsaWMgc3RhcnQoaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgICBpZiAodGhpcy5zdGFydGVkKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGFsbG93ZWRDYXBhYmlsaXRpZXMgPSB0aGlzLmFwcFRpbGVQcm9wcy53aGl0ZWxpc3RDYXBhYmlsaXRpZXMgfHwgW107XG4gICAgICAgIGNvbnN0IGRyaXZlciA9IG5ldyBTdG9wR2FwV2lkZ2V0RHJpdmVyKGFsbG93ZWRDYXBhYmlsaXRpZXMsIHRoaXMubW9ja1dpZGdldCwgdGhpcy5raW5kLCB0aGlzLnJvb21JZCk7XG4gICAgICAgIHRoaXMubWVzc2FnaW5nID0gbmV3IENsaWVudFdpZGdldEFwaSh0aGlzLm1vY2tXaWRnZXQsIGlmcmFtZSwgZHJpdmVyKTtcbiAgICAgICAgdGhpcy5tZXNzYWdpbmcub24oXCJwcmVwYXJpbmdcIiwgKCkgPT4gdGhpcy5lbWl0KFwicHJlcGFyaW5nXCIpKTtcbiAgICAgICAgdGhpcy5tZXNzYWdpbmcub24oXCJyZWFkeVwiLCAoKSA9PiB0aGlzLmVtaXQoXCJyZWFkeVwiKSk7XG4gICAgICAgIHRoaXMubWVzc2FnaW5nLm9uKGBhY3Rpb246JHtXaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLk9wZW5Nb2RhbFdpZGdldH1gLCB0aGlzLm9uT3Blbk1vZGFsKTtcbiAgICAgICAgV2lkZ2V0TWVzc2FnaW5nU3RvcmUuaW5zdGFuY2Uuc3RvcmVNZXNzYWdpbmcodGhpcy5tb2NrV2lkZ2V0LCB0aGlzLm1lc3NhZ2luZyk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmFwcFRpbGVQcm9wcy51c2VyV2lkZ2V0ICYmIHRoaXMuYXBwVGlsZVByb3BzLnJvb20pIHtcbiAgICAgICAgICAgIEFjdGl2ZVdpZGdldFN0b3JlLnNldFJvb21JZCh0aGlzLm1vY2tXaWRnZXQuaWQsIHRoaXMuYXBwVGlsZVByb3BzLnJvb20ucm9vbUlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFsd2F5cyBhdHRhY2ggYSBoYW5kbGVyIGZvciBWaWV3Um9vbSwgYnV0IHBlcm1pc3Npb24gY2hlY2sgaXQgaW50ZXJuYWxseVxuICAgICAgICB0aGlzLm1lc3NhZ2luZy5vbihgYWN0aW9uOiR7RWxlbWVudFdpZGdldEFjdGlvbnMuVmlld1Jvb219YCwgKGV2OiBDdXN0b21FdmVudDxJVmlld1Jvb21BcGlSZXF1ZXN0PikgPT4ge1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTsgLy8gc3RvcCB0aGUgd2lkZ2V0IEFQSSBmcm9tIGF1dG8tcmVqZWN0aW5nIHRoaXNcblxuICAgICAgICAgICAgLy8gQ2hlY2sgdXAgZnJvbnQgaWYgdGhpcyBpcyBldmVuIGEgdmFsaWQgcmVxdWVzdFxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0Um9vbUlkID0gKGV2LmRldGFpbC5kYXRhIHx8IHt9KS5yb29tX2lkO1xuICAgICAgICAgICAgaWYgKCF0YXJnZXRSb29tSWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tZXNzYWdpbmcudHJhbnNwb3J0LnJlcGx5KGV2LmRldGFpbCwgPElXaWRnZXRBcGlFcnJvclJlc3BvbnNlRGF0YT57XG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiB7bWVzc2FnZTogXCJSb29tIElEIG5vdCBzdXBwbGllZC5cIn0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoZWNrIHRoZSB3aWRnZXQncyBwZXJtaXNzaW9uXG4gICAgICAgICAgICBpZiAoIXRoaXMubWVzc2FnaW5nLmhhc0NhcGFiaWxpdHkoRWxlbWVudFdpZGdldENhcGFiaWxpdGllcy5DYW5DaGFuZ2VWaWV3ZWRSb29tKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1lc3NhZ2luZy50cmFuc3BvcnQucmVwbHkoZXYuZGV0YWlsLCA8SVdpZGdldEFwaUVycm9yUmVzcG9uc2VEYXRhPntcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHttZXNzYWdlOiBcIlRoaXMgd2lkZ2V0IGRvZXMgbm90IGhhdmUgcGVybWlzc2lvbiBmb3IgdGhpcyBhY3Rpb24gKGRlbmllZCkuXCJ9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBhdCB0aGlzIHBvaW50IHdlIGNhbiBjaGFuZ2Ugcm9vbXMsIHNvIGRvIHRoYXRcbiAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IHRhcmdldFJvb21JZCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBhY2tub3dsZWRnZSBzbyB0aGUgd2lkZ2V0IGRvZXNuJ3QgZnJlYWsgb3V0XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2luZy50cmFuc3BvcnQucmVwbHkoZXYuZGV0YWlsLCA8SVdpZGdldEFwaVJlcXVlc3RFbXB0eURhdGE+e30pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBdHRhY2ggbGlzdGVuZXJzIGZvciBmZWVkaW5nIGV2ZW50cyAtIHRoZSB1bmRlcmx5aW5nIHdpZGdldCBjbGFzc2VzIGhhbmRsZSBwZXJtaXNzaW9ucyBmb3IgdXNcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKCdldmVudCcsIHRoaXMub25FdmVudCk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbignRXZlbnQuZGVjcnlwdGVkJywgdGhpcy5vbkV2ZW50RGVjcnlwdGVkKTtcblxuICAgICAgICB0aGlzLm1lc3NhZ2luZy5vbihgYWN0aW9uOiR7V2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbi5VcGRhdGVBbHdheXNPblNjcmVlbn1gLFxuICAgICAgICAgICAgKGV2OiBDdXN0b21FdmVudDxJU3RpY2t5QWN0aW9uUmVxdWVzdD4pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tZXNzYWdpbmcuaGFzQ2FwYWJpbGl0eShNYXRyaXhDYXBhYmlsaXRpZXMuQWx3YXlzT25TY3JlZW4pKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChXaWRnZXRUeXBlLkpJVFNJLm1hdGNoZXModGhpcy5tb2NrV2lkZ2V0LnR5cGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrSm9pbkNhbGwodGhpcy5hcHBUaWxlUHJvcHMucm9vbS5yb29tSWQsIHRydWUsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIEFjdGl2ZVdpZGdldFN0b3JlLnNldFdpZGdldFBlcnNpc3RlbmNlKHRoaXMubW9ja1dpZGdldC5pZCwgZXYuZGV0YWlsLmRhdGEudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2luZy50cmFuc3BvcnQucmVwbHkoZXYuZGV0YWlsLCA8SVdpZGdldEFwaVJlcXVlc3RFbXB0eURhdGE+e30pOyAvLyBhY2tcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFRPRE86IFJlcGxhY2UgdGhpcyBldmVudCBsaXN0ZW5lciB3aXRoIGFwcHJvcHJpYXRlIGRyaXZlciBmdW5jdGlvbmFsaXR5IG9uY2UgdGhlIEFQSVxuICAgICAgICAvLyBlc3RhYmxpc2hlcyBhIHNhbmUgd2F5IHRvIHNlbmQgZXZlbnRzIGJhY2sgYW5kIGZvcnRoLlxuICAgICAgICB0aGlzLm1lc3NhZ2luZy5vbihgYWN0aW9uOiR7V2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbi5TZW5kU3RpY2tlcn1gLFxuICAgICAgICAgICAgKGV2OiBDdXN0b21FdmVudDxJU3RpY2tlckFjdGlvblJlcXVlc3Q+KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWVzc2FnaW5nLmhhc0NhcGFiaWxpdHkoTWF0cml4Q2FwYWJpbGl0aWVzLlN0aWNrZXJTZW5kaW5nKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBY2tub3dsZWRnZSBmaXJzdFxuICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2luZy50cmFuc3BvcnQucmVwbHkoZXYuZGV0YWlsLCA8SVdpZGdldEFwaVJlcXVlc3RFbXB0eURhdGE+e30pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFNlbmQgdGhlIHN0aWNrZXJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnbS5zdGlja2VyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGV2LmRldGFpbC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0SWQ6IHRoaXMubW9ja1dpZGdldC5pZCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoV2lkZ2V0VHlwZS5TVElDS0VSUElDS0VSLm1hdGNoZXModGhpcy5tb2NrV2lkZ2V0LnR5cGUpKSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2luZy5vbihgYWN0aW9uOiR7RWxlbWVudFdpZGdldEFjdGlvbnMuT3BlbkludGVncmF0aW9uTWFuYWdlcn1gLFxuICAgICAgICAgICAgICAgIChldjogQ3VzdG9tRXZlbnQ8SVdpZGdldEFwaVJlcXVlc3Q+KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFja25vd2xlZGdlIGZpcnN0XG4gICAgICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnaW5nLnRyYW5zcG9ydC5yZXBseShldi5kZXRhaWwsIDxJV2lkZ2V0QXBpUmVxdWVzdEVtcHR5RGF0YT57fSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRmlyc3QgY2xvc2UgdGhlIHN0aWNrZXJwaWNrZXJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvbjogXCJzdGlja2VycGlja2VyX2Nsb3NlXCJ9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBOb3cgb3BlbiB0aGUgaW50ZWdyYXRpb24gbWFuYWdlclxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBTcGVjIHRoaXMgaW50ZXJhY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBldi5kZXRhaWwuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW50ZWdUeXBlID0gZGF0YT8uaW50ZWdUeXBlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGludGVnSWQgPSA8c3RyaW5nPmRhdGE/LmludGVnSWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogT3BlbiB0aGUgcmlnaHQgaW50ZWdyYXRpb24gbWFuYWdlciBmb3IgdGhlIHdpZGdldFxuICAgICAgICAgICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfbWFueV9pbnRlZ3JhdGlvbl9tYW5hZ2Vyc1wiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgSW50ZWdyYXRpb25NYW5hZ2Vycy5zaGFyZWRJbnN0YW5jZSgpLm9wZW5BbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20oUm9vbVZpZXdTdG9yZS5nZXRSb29tSWQoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYHR5cGVfJHtpbnRlZ1R5cGV9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRlZ0lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEludGVncmF0aW9uTWFuYWdlcnMuc2hhcmVkSW5zdGFuY2UoKS5nZXRQcmltYXJ5TWFuYWdlcigpLm9wZW4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20oUm9vbVZpZXdTdG9yZS5nZXRSb29tSWQoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYHR5cGVfJHtpbnRlZ1R5cGV9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRlZ0lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHByZXBhcmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICh0aGlzLnNjYWxhclRva2VuKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nTWVzc2FnaW5nID0gV2lkZ2V0TWVzc2FnaW5nU3RvcmUuaW5zdGFuY2UuZ2V0TWVzc2FnaW5nKHRoaXMubW9ja1dpZGdldCk7XG4gICAgICAgIGlmIChleGlzdGluZ01lc3NhZ2luZykgdGhpcy5tZXNzYWdpbmcgPSBleGlzdGluZ01lc3NhZ2luZztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChXaWRnZXRVdGlscy5pc1NjYWxhclVybCh0aGlzLm1vY2tXaWRnZXQudGVtcGxhdGVVcmwpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFuYWdlcnMgPSBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCk7XG4gICAgICAgICAgICAgICAgaWYgKG1hbmFnZXJzLmhhc01hbmFnZXIoKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBQaWNrIHRoZSByaWdodCBtYW5hZ2VyIGZvciB0aGUgd2lkZ2V0XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRNYW5hZ2VyID0gbWFuYWdlcnMuZ2V0UHJpbWFyeU1hbmFnZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFdpZGdldFV0aWxzLmlzU2NhbGFyVXJsKGRlZmF1bHRNYW5hZ2VyLmFwaVVybCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNjYWxhciA9IGRlZmF1bHRNYW5hZ2VyLmdldFNjYWxhckNsaWVudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY2FsYXJUb2tlbiA9IGF3YWl0IHNjYWxhci5nZXRTY2FsYXJUb2tlbigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBBbGwgZXJyb3JzIGFyZSBub24tZmF0YWxcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBwcmVwYXJpbmcgd2lkZ2V0IGNvbW11bmljYXRpb25zOiBcIiwgZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RvcChvcHRzID0ge2ZvcmNlRGVzdHJveTogZmFsc2V9KSB7XG4gICAgICAgIGlmICghb3B0cz8uZm9yY2VEZXN0cm95ICYmIEFjdGl2ZVdpZGdldFN0b3JlLmdldFBlcnNpc3RlbnRXaWRnZXRJZCgpID09PSB0aGlzLm1vY2tXaWRnZXQuaWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU2tpcHBpbmcgZGVzdHJveSAtIHBlcnNpc3RlbnQgd2lkZ2V0XCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5zdGFydGVkKSByZXR1cm47XG4gICAgICAgIFdpZGdldE1lc3NhZ2luZ1N0b3JlLmluc3RhbmNlLnN0b3BNZXNzYWdpbmcodGhpcy5tb2NrV2lkZ2V0KTtcbiAgICAgICAgQWN0aXZlV2lkZ2V0U3RvcmUuZGVsUm9vbUlkKHRoaXMubW9ja1dpZGdldC5pZCk7XG5cbiAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKSkge1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9mZignZXZlbnQnLCB0aGlzLm9uRXZlbnQpO1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9mZignRXZlbnQuZGVjcnlwdGVkJywgdGhpcy5vbkV2ZW50RGVjcnlwdGVkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25FdmVudCA9IChldjogTWF0cml4RXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2LmlzQmVpbmdEZWNyeXB0ZWQoKSB8fCBldi5pc0RlY3J5cHRpb25GYWlsdXJlKCkpIHJldHVybjtcbiAgICAgICAgaWYgKGV2LmdldFJvb21JZCgpICE9PSB0aGlzLmV2ZW50TGlzdGVuZXJSb29tSWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5mZWVkRXZlbnQoZXYpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRXZlbnREZWNyeXB0ZWQgPSAoZXY6IE1hdHJpeEV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldi5pc0RlY3J5cHRpb25GYWlsdXJlKCkpIHJldHVybjtcbiAgICAgICAgaWYgKGV2LmdldFJvb21JZCgpICE9PSB0aGlzLmV2ZW50TGlzdGVuZXJSb29tSWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5mZWVkRXZlbnQoZXYpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGZlZWRFdmVudChldjogTWF0cml4RXZlbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1lc3NhZ2luZykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHJhdyA9IGV2LmV2ZW50O1xuICAgICAgICB0aGlzLm1lc3NhZ2luZy5mZWVkRXZlbnQocmF3KS5jYXRjaChlID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBzZW5kaW5nIGV2ZW50IHRvIHdpZGdldDogXCIsIGUpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=