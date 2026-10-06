"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _url = _interopRequireDefault(require("url"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _languageHandler = require("../../../languageHandler");

var _AppPermission = _interopRequireDefault(require("./AppPermission"));

var _AppWarning = _interopRequireDefault(require("./AppWarning"));

var _Spinner = _interopRequireDefault(require("./Spinner"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _ActiveWidgetStore = _interopRequireDefault(require("../../../stores/ActiveWidgetStore"));

var _classnames = _interopRequireDefault(require("classnames"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _ContextMenu = require("../../structures/ContextMenu");

var _PersistedElement = _interopRequireWildcard(require("./PersistedElement"));

var _WidgetType = require("../../../widgets/WidgetType");

var _StopGapWidget = require("../../../stores/widgets/StopGapWidget");

var _ElementWidgetActions = require("../../../stores/widgets/ElementWidgetActions");

var _matrixWidgetApi = require("matrix-widget-api");

var _WidgetContextMenu = _interopRequireDefault(require("../context_menus/WidgetContextMenu"));

var _WidgetAvatar = _interopRequireDefault(require("../avatars/WidgetAvatar"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let AppTile = (_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.AppTile"), _dec(_class = (_temp = class AppTile extends _react.default.Component {
  constructor(_props) {
    super(_props); // The key used for PersistedElement

    (0, _defineProperty2.default)(this, "hasPermissionToLoad", props => {
      if (this._usingLocalWidget()) return true;
      if (!props.room) return true; // user widgets always have permissions

      const currentlyAllowedWidgets = _SettingsStore.default.getValue("allowedWidgets", props.room.roomId);

      if (currentlyAllowedWidgets[props.app.eventId] === undefined) {
        return props.userId === props.creatorUserId;
      }

      return !!currentlyAllowedWidgets[props.app.eventId];
    });
    (0, _defineProperty2.default)(this, "onAllowedWidgetsChange", () => {
      const hasPermissionToLoad = this.hasPermissionToLoad(this.props);

      if (this.state.hasPermissionToLoad && !hasPermissionToLoad) {
        // Force the widget to be non-persistent (able to be deleted/forgotten)
        _ActiveWidgetStore.default.destroyPersistentWidget(this.props.app.id);

        _PersistedElement.default.destroyElement(this._persistKey);

        this._sgWidget.stop();
      }

      this.setState({
        hasPermissionToLoad
      });
    });
    (0, _defineProperty2.default)(this, "_iframeRefChange", ref => {
      this.iframe = ref;

      if (ref) {
        this._sgWidget.start(ref);
      } else {
        this._resetWidget(this.props);
      }
    });
    (0, _defineProperty2.default)(this, "_onWidgetPrepared", () => {
      this.setState({
        loading: false
      });
    });
    (0, _defineProperty2.default)(this, "_onWidgetReady", () => {
      if (_WidgetType.WidgetType.JITSI.matches(this.props.app.type)) {
        this._sgWidget.widgetApi.transport.send(_ElementWidgetActions.ElementWidgetActions.ClientReady, {});
      }
    });
    (0, _defineProperty2.default)(this, "_onAction", payload => {
      if (payload.widgetId === this.props.app.id) {
        switch (payload.action) {
          case 'm.sticker':
            if (this._sgWidget.widgetApi.hasCapability(_matrixWidgetApi.MatrixCapabilities.StickerSending)) {
              _dispatcher.default.dispatch({
                action: 'post_sticker_message',
                data: payload.data
              });
            } else {
              console.warn('Ignoring sticker message. Invalid capability');
            }

            break;
        }
      }
    });
    (0, _defineProperty2.default)(this, "_grantWidgetPermission", () => {
      const roomId = this.props.room.roomId;
      console.info("Granting permission for widget to load: " + this.props.app.eventId);

      const current = _SettingsStore.default.getValue("allowedWidgets", roomId);

      current[this.props.app.eventId] = true;

      const level = _SettingsStore.default.firstSupportedLevel("allowedWidgets");

      _SettingsStore.default.setValue("allowedWidgets", roomId, level, current).then(() => {
        this.setState({
          hasPermissionToLoad: true
        }); // Fetch a token for the integration manager, now that we're allowed to

        this._startWidget();
      }).catch(err => {
        console.error(err); // We don't really need to do anything about this - the user will just hit the button again.
      });
    });
    (0, _defineProperty2.default)(this, "_onPopoutWidgetClick", () => {
      // Ensure Jitsi conferences are closed on pop-out, to not confuse the user to join them
      // twice from the same computer, which Jitsi can have problems with (audio echo/gain-loop).
      if (_WidgetType.WidgetType.JITSI.matches(this.props.app.type)) {
        this._endWidgetActions().then(() => {
          if (this.iframe) {
            // Reload iframe
            this.iframe.src = this._sgWidget.embedUrl;
            this.setState({});
          }
        });
      } // Using Object.assign workaround as the following opens in a new window instead of a new tab.
      // window.open(this._getPopoutUrl(), '_blank', 'noopener=yes');


      Object.assign(document.createElement('a'), {
        target: '_blank',
        href: this._sgWidget.popoutUrl,
        rel: 'noreferrer noopener'
      }).click();
    });
    (0, _defineProperty2.default)(this, "_onContextMenuClick", () => {
      this.setState({
        menuDisplayed: true
      });
    });
    (0, _defineProperty2.default)(this, "_closeContextMenu", () => {
      this.setState({
        menuDisplayed: false
      });
    });
    this._persistKey = (0, _PersistedElement.getPersistKey)(this.props.app.id);
    this._sgWidget = new _StopGapWidget.StopGapWidget(this.props);

    this._sgWidget.on("preparing", this._onWidgetPrepared);

    this._sgWidget.on("ready", this._onWidgetReady);

    this.iframe = null; // ref to the iframe (callback style)

    this.state = this._getNewState(_props);
    this._contextMenuButton = /*#__PURE__*/(0, _react.createRef)();
    this._allowedWidgetsWatchRef = _SettingsStore.default.watchSetting("allowedWidgets", null, this.onAllowedWidgetsChange);
  } // This is a function to make the impact of calling SettingsStore slightly less


  /**
   * Set initial component state when the App wUrl (widget URL) is being updated.
   * Component props *must* be passed (rather than relying on this.props).
   * @param  {Object} newProps The new properties of the component
   * @return {Object} Updated component state to be set with setState
   */
  _getNewState(newProps) {
    return {
      initialising: true,
      // True while we are mangling the widget URL
      // True while the iframe content is loading
      loading: this.props.waitForIframeLoad && !_PersistedElement.default.isMounted(this._persistKey),
      // Assume that widget has permission to load if we are the user who
      // added it to the room, or if explicitly granted by the user
      hasPermissionToLoad: this.hasPermissionToLoad(newProps),
      error: null,
      widgetPageTitle: newProps.widgetPageTitle,
      menuDisplayed: false
    };
  }

  isMixedContent() {
    const parentContentProtocol = window.location.protocol;

    const u = _url.default.parse(this.props.app.url);

    const childContentProtocol = u.protocol;

    if (parentContentProtocol === 'https:' && childContentProtocol !== 'https:') {
      console.warn("Refusing to load mixed-content app:", parentContentProtocol, childContentProtocol, window.location, this.props.app.url);
      return true;
    }

    return false;
  }

  componentDidMount() {
    // Only fetch IM token on mount if we're showing and have permission to load
    if (this.state.hasPermissionToLoad) {
      this._startWidget();
    } // Widget action listeners


    this.dispatcherRef = _dispatcher.default.register(this._onAction);
  }

  componentWillUnmount() {
    // Widget action listeners
    if (this.dispatcherRef) _dispatcher.default.unregister(this.dispatcherRef); // if it's not remaining on screen, get rid of the PersistedElement container

    if (!_ActiveWidgetStore.default.getWidgetPersistence(this.props.app.id)) {
      _ActiveWidgetStore.default.destroyPersistentWidget(this.props.app.id);

      _PersistedElement.default.destroyElement(this._persistKey);
    }

    if (this._sgWidget) {
      this._sgWidget.stop();
    }

    _SettingsStore.default.unwatchSetting(this._allowedWidgetsWatchRef);
  }

  _resetWidget(newProps) {
    if (this._sgWidget) {
      this._sgWidget.stop();
    }

    this._sgWidget = new _StopGapWidget.StopGapWidget(newProps);

    this._sgWidget.on("preparing", this._onWidgetPrepared);

    this._sgWidget.on("ready", this._onWidgetReady);

    this._startWidget();
  }

  _startWidget() {
    this._sgWidget.prepare().then(() => {
      this.setState({
        initialising: false
      });
    });
  }

  // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  UNSAFE_componentWillReceiveProps(nextProps) {
    // eslint-disable-line camelcase
    if (nextProps.app.url !== this.props.app.url) {
      this._getNewState(nextProps);

      if (this.state.hasPermissionToLoad) {
        this._resetWidget(nextProps);
      }
    }

    if (nextProps.widgetPageTitle !== this.props.widgetPageTitle) {
      this.setState({
        widgetPageTitle: nextProps.widgetPageTitle
      });
    }
  }
  /**
   * Ends all widget interaction, such as cancelling calls and disabling webcams.
   * @private
   * @returns {Promise<*>} Resolves when the widget is terminated, or timeout passed.
   */


  async _endWidgetActions() {
    // widget migration dev note: async to maintain signature
    // HACK: This is a really dirty way to ensure that Jitsi cleans up
    // its hold on the webcam. Without this, the widget holds a media
    // stream open, even after death. See https://github.com/vector-im/element-web/issues/7351
    if (this.iframe) {
      // In practice we could just do `+= ''` to trick the browser
      // into thinking the URL changed, however I can foresee this
      // being optimized out by a browser. Instead, we'll just point
      // the iframe at a page that is reasonably safe to use in the
      // event the iframe doesn't wink away.
      // This is relative to where the Element instance is located.
      this.iframe.src = 'about:blank';
    }

    if (_WidgetType.WidgetType.JITSI.matches(this.props.app.type)) {
      _dispatcher.default.dispatch({
        action: 'hangup_conference'
      });
    } // Delete the widget from the persisted store for good measure.


    _PersistedElement.default.destroyElement(this._persistKey);

    this._sgWidget.stop({
      forceDestroy: true
    });
  }

  formatAppTileName() {
    let appTileName = "No name";

    if (this.props.app.name && this.props.app.name.trim()) {
      appTileName = this.props.app.name.trim();
    }

    return appTileName;
  }
  /**
   * Whether we're using a local version of the widget rather than loading the
   * actual widget URL
   * @returns {bool} true If using a local version of the widget
   */


  _usingLocalWidget() {
    return _WidgetType.WidgetType.JITSI.matches(this.props.app.type);
  }

  _getTileTitle() {
    const name = this.formatAppTileName();

    const titleSpacer = /*#__PURE__*/_react.default.createElement("span", null, "\xA0-\xA0");

    let title = '';

    if (this.state.widgetPageTitle && this.state.widgetPageTitle !== this.formatAppTileName()) {
      title = this.state.widgetPageTitle;
    }

    return /*#__PURE__*/_react.default.createElement("span", null, /*#__PURE__*/_react.default.createElement(_WidgetAvatar.default, {
      app: this.props.app
    }), /*#__PURE__*/_react.default.createElement("b", null, name), /*#__PURE__*/_react.default.createElement("span", null, title ? titleSpacer : '', title));
  } // TODO replace with full screen interactions


  render() {
    let appTileBody; // Note that there is advice saying allow-scripts shouldn't be used with allow-same-origin
    // because that would allow the iframe to programmatically remove the sandbox attribute, but
    // this would only be for content hosted on the same origin as the element client: anything
    // hosted on the same origin as the client will get the same access as if you clicked
    // a link to it.

    const sandboxFlags = "allow-forms allow-popups allow-popups-to-escape-sandbox " + "allow-same-origin allow-scripts allow-presentation"; // Additional iframe feature pemissions
    // (see - https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-permissions-in-cross-origin-iframes and https://wicg.github.io/feature-policy/)

    const iframeFeatures = "microphone; camera; encrypted-media; autoplay; display-capture; clipboard-write;";
    const appTileBodyClass = 'mx_AppTileBody' + (this.props.miniMode ? '_mini  ' : ' ');
    const appTileBodyStyles = {};

    if (this.props.pointerEvents) {
      appTileBodyStyles['pointer-events'] = this.props.pointerEvents;
    }

    const loadingElement = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppLoading_spinner_fadeIn"
    }, /*#__PURE__*/_react.default.createElement(_Spinner.default, {
      message: (0, _languageHandler._t)("Loading...")
    }));

    if (!this.state.hasPermissionToLoad) {
      // only possible for room widgets, can assert this.props.room here
      const isEncrypted = _MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(this.props.room.roomId);

      appTileBody = /*#__PURE__*/_react.default.createElement("div", {
        className: appTileBodyClass,
        style: appTileBodyStyles
      }, /*#__PURE__*/_react.default.createElement(_AppPermission.default, {
        roomId: this.props.room.roomId,
        creatorUserId: this.props.creatorUserId,
        url: this._sgWidget.embedUrl,
        isRoomEncrypted: isEncrypted,
        onPermissionGranted: this._grantWidgetPermission
      }));
    } else if (this.state.initialising) {
      appTileBody = /*#__PURE__*/_react.default.createElement("div", {
        className: appTileBodyClass + (this.state.loading ? 'mx_AppLoading' : ''),
        style: appTileBodyStyles
      }, loadingElement);
    } else {
      if (this.isMixedContent()) {
        appTileBody = /*#__PURE__*/_react.default.createElement("div", {
          className: appTileBodyClass,
          style: appTileBodyStyles
        }, /*#__PURE__*/_react.default.createElement(_AppWarning.default, {
          errorMsg: "Error - Mixed content"
        }));
      } else {
        appTileBody = /*#__PURE__*/_react.default.createElement("div", {
          className: appTileBodyClass + (this.state.loading ? 'mx_AppLoading' : ''),
          style: appTileBodyStyles
        }, this.state.loading && loadingElement, /*#__PURE__*/_react.default.createElement("iframe", {
          allow: iframeFeatures,
          ref: this._iframeRefChange,
          src: this._sgWidget.embedUrl,
          allowFullScreen: true,
          sandbox: sandboxFlags
        }));

        if (!this.props.userWidget) {
          // All room widgets can theoretically be allowed to remain on screen, so we
          // wrap them all in a PersistedElement from the get-go. If we wait, the iframe
          // will be re-mounted later, which means the widget has to start over, which is
          // bad.
          // Also wrap the PersistedElement in a div to fix the height, otherwise
          // AppTile's border is in the wrong place
          appTileBody = /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_AppTile_persistedWrapper"
          }, /*#__PURE__*/_react.default.createElement(_PersistedElement.default, {
            persistKey: this._persistKey
          }, appTileBody));
        }
      }
    }

    let appTileClasses;

    if (this.props.miniMode) {
      appTileClasses = {
        mx_AppTile_mini: true
      };
    } else if (this.props.fullWidth) {
      appTileClasses = {
        mx_AppTileFullWidth: true
      };
    } else {
      appTileClasses = {
        mx_AppTile: true
      };
    }

    appTileClasses = (0, _classnames.default)(appTileClasses);
    let contextMenu;

    if (this.state.menuDisplayed) {
      contextMenu = /*#__PURE__*/_react.default.createElement(_WidgetContextMenu.default, (0, _extends2.default)({}, (0, _ContextMenu.aboveLeftOf)(this._contextMenuButton.current.getBoundingClientRect(), null), {
        app: this.props.app,
        onFinished: this._closeContextMenu,
        showUnpin: !this.props.userWidget,
        userWidget: this.props.userWidget
      }));
    }

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
      className: appTileClasses,
      id: this.props.app.id
    }, this.props.showMenubar && /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppTileMenuBar"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_AppTileMenuBarTitle",
      style: {
        pointerEvents: this.props.handleMinimisePointerEvents ? 'all' : false
      }
    }, this.props.showTitle && this._getTileTitle()), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_AppTileMenuBarWidgets"
    }, this.props.showPopout && /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_AppTileMenuBar_iconButton mx_AppTileMenuBar_iconButton_popout",
      title: (0, _languageHandler._t)('Popout widget'),
      onClick: this._onPopoutWidgetClick
    }), /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuButton, {
      className: "mx_AppTileMenuBar_iconButton mx_AppTileMenuBar_iconButton_menu",
      label: (0, _languageHandler._t)("Options"),
      isExpanded: this.state.menuDisplayed,
      inputRef: this._contextMenuButton,
      onClick: this._onContextMenuClick
    }))), appTileBody), contextMenu);
  }

}, _temp)) || _class);
exports.default = AppTile;
AppTile.displayName = 'AppTile';
AppTile.propTypes = {
  app: _propTypes.default.object.isRequired,
  // If room is not specified then it is an account level widget
  // which bypasses permission prompts as it was added explicitly by that user
  room: _propTypes.default.object,
  // Specifying 'fullWidth' as true will render the app tile to fill the width of the app drawer continer.
  // This should be set to true when there is only one widget in the app drawer, otherwise it should be false.
  fullWidth: _propTypes.default.bool,
  // Optional. If set, renders a smaller view of the widget
  miniMode: _propTypes.default.bool,
  // UserId of the current user
  userId: _propTypes.default.string.isRequired,
  // UserId of the entity that added / modified the widget
  creatorUserId: _propTypes.default.string,
  waitForIframeLoad: _propTypes.default.bool,
  showMenubar: _propTypes.default.bool,
  // Optional onEditClickHandler (overrides default behaviour)
  onEditClick: _propTypes.default.func,
  // Optional onDeleteClickHandler (overrides default behaviour)
  onDeleteClick: _propTypes.default.func,
  // Optional onMinimiseClickHandler
  onMinimiseClick: _propTypes.default.func,
  // Optionally hide the tile title
  showTitle: _propTypes.default.bool,
  // Optionally handle minimise button pointer events (default false)
  handleMinimisePointerEvents: _propTypes.default.bool,
  // Optionally hide the popout widget icon
  showPopout: _propTypes.default.bool,
  // Is this an instance of a user widget
  userWidget: _propTypes.default.bool,
  // sets the pointer-events property on the iframe
  pointerEvents: _propTypes.default.string
};
AppTile.defaultProps = {
  waitForIframeLoad: true,
  showMenubar: true,
  showTitle: true,
  showPopout: true,
  handleMinimisePointerEvents: false,
  userWidget: false,
  miniMode: false
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0FwcFRpbGUuanMiXSwibmFtZXMiOlsiQXBwVGlsZSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIl91c2luZ0xvY2FsV2lkZ2V0Iiwicm9vbSIsImN1cnJlbnRseUFsbG93ZWRXaWRnZXRzIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwicm9vbUlkIiwiYXBwIiwiZXZlbnRJZCIsInVuZGVmaW5lZCIsInVzZXJJZCIsImNyZWF0b3JVc2VySWQiLCJoYXNQZXJtaXNzaW9uVG9Mb2FkIiwic3RhdGUiLCJBY3RpdmVXaWRnZXRTdG9yZSIsImRlc3Ryb3lQZXJzaXN0ZW50V2lkZ2V0IiwiaWQiLCJQZXJzaXN0ZWRFbGVtZW50IiwiZGVzdHJveUVsZW1lbnQiLCJfcGVyc2lzdEtleSIsIl9zZ1dpZGdldCIsInN0b3AiLCJzZXRTdGF0ZSIsInJlZiIsImlmcmFtZSIsInN0YXJ0IiwiX3Jlc2V0V2lkZ2V0IiwibG9hZGluZyIsIldpZGdldFR5cGUiLCJKSVRTSSIsIm1hdGNoZXMiLCJ0eXBlIiwid2lkZ2V0QXBpIiwidHJhbnNwb3J0Iiwic2VuZCIsIkVsZW1lbnRXaWRnZXRBY3Rpb25zIiwiQ2xpZW50UmVhZHkiLCJwYXlsb2FkIiwid2lkZ2V0SWQiLCJhY3Rpb24iLCJoYXNDYXBhYmlsaXR5IiwiTWF0cml4Q2FwYWJpbGl0aWVzIiwiU3RpY2tlclNlbmRpbmciLCJkaXMiLCJkaXNwYXRjaCIsImRhdGEiLCJjb25zb2xlIiwid2FybiIsImluZm8iLCJjdXJyZW50IiwibGV2ZWwiLCJmaXJzdFN1cHBvcnRlZExldmVsIiwic2V0VmFsdWUiLCJ0aGVuIiwiX3N0YXJ0V2lkZ2V0IiwiY2F0Y2giLCJlcnIiLCJlcnJvciIsIl9lbmRXaWRnZXRBY3Rpb25zIiwic3JjIiwiZW1iZWRVcmwiLCJPYmplY3QiLCJhc3NpZ24iLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ0YXJnZXQiLCJocmVmIiwicG9wb3V0VXJsIiwicmVsIiwiY2xpY2siLCJtZW51RGlzcGxheWVkIiwiU3RvcEdhcFdpZGdldCIsIm9uIiwiX29uV2lkZ2V0UHJlcGFyZWQiLCJfb25XaWRnZXRSZWFkeSIsIl9nZXROZXdTdGF0ZSIsIl9jb250ZXh0TWVudUJ1dHRvbiIsIl9hbGxvd2VkV2lkZ2V0c1dhdGNoUmVmIiwid2F0Y2hTZXR0aW5nIiwib25BbGxvd2VkV2lkZ2V0c0NoYW5nZSIsIm5ld1Byb3BzIiwiaW5pdGlhbGlzaW5nIiwid2FpdEZvcklmcmFtZUxvYWQiLCJpc01vdW50ZWQiLCJ3aWRnZXRQYWdlVGl0bGUiLCJpc01peGVkQ29udGVudCIsInBhcmVudENvbnRlbnRQcm90b2NvbCIsIndpbmRvdyIsImxvY2F0aW9uIiwicHJvdG9jb2wiLCJ1IiwidXJsIiwicGFyc2UiLCJjaGlsZENvbnRlbnRQcm90b2NvbCIsImNvbXBvbmVudERpZE1vdW50IiwiZGlzcGF0Y2hlclJlZiIsInJlZ2lzdGVyIiwiX29uQWN0aW9uIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bnJlZ2lzdGVyIiwiZ2V0V2lkZ2V0UGVyc2lzdGVuY2UiLCJ1bndhdGNoU2V0dGluZyIsInByZXBhcmUiLCJVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5leHRQcm9wcyIsImZvcmNlRGVzdHJveSIsImZvcm1hdEFwcFRpbGVOYW1lIiwiYXBwVGlsZU5hbWUiLCJuYW1lIiwidHJpbSIsIl9nZXRUaWxlVGl0bGUiLCJ0aXRsZVNwYWNlciIsInRpdGxlIiwicmVuZGVyIiwiYXBwVGlsZUJvZHkiLCJzYW5kYm94RmxhZ3MiLCJpZnJhbWVGZWF0dXJlcyIsImFwcFRpbGVCb2R5Q2xhc3MiLCJtaW5pTW9kZSIsImFwcFRpbGVCb2R5U3R5bGVzIiwicG9pbnRlckV2ZW50cyIsImxvYWRpbmdFbGVtZW50IiwiaXNFbmNyeXB0ZWQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJpc1Jvb21FbmNyeXB0ZWQiLCJfZ3JhbnRXaWRnZXRQZXJtaXNzaW9uIiwiX2lmcmFtZVJlZkNoYW5nZSIsInVzZXJXaWRnZXQiLCJhcHBUaWxlQ2xhc3NlcyIsIm14X0FwcFRpbGVfbWluaSIsImZ1bGxXaWR0aCIsIm14X0FwcFRpbGVGdWxsV2lkdGgiLCJteF9BcHBUaWxlIiwiY29udGV4dE1lbnUiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJfY2xvc2VDb250ZXh0TWVudSIsInNob3dNZW51YmFyIiwiaGFuZGxlTWluaW1pc2VQb2ludGVyRXZlbnRzIiwic2hvd1RpdGxlIiwic2hvd1BvcG91dCIsIl9vblBvcG91dFdpZGdldENsaWNrIiwiX29uQ29udGV4dE1lbnVDbGljayIsImRpc3BsYXlOYW1lIiwicHJvcFR5cGVzIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIsImJvb2wiLCJzdHJpbmciLCJvbkVkaXRDbGljayIsImZ1bmMiLCJvbkRlbGV0ZUNsaWNrIiwib25NaW5pbWlzZUNsaWNrIiwiZGVmYXVsdFByb3BzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFtQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7SUFHcUJBLE8sV0FEcEIsZ0RBQXFCLHdCQUFyQixDLHlCQUFELE1BQ3FCQSxPQURyQixTQUNxQ0MsZUFBTUMsU0FEM0MsQ0FDcUQ7QUFDakRDLEVBQUFBLFdBQVcsQ0FBQ0MsTUFBRCxFQUFRO0FBQ2YsVUFBTUEsTUFBTixFQURlLENBR2Y7O0FBSGUsK0RBaUJJQSxLQUFELElBQVc7QUFDN0IsVUFBSSxLQUFLQyxpQkFBTCxFQUFKLEVBQThCLE9BQU8sSUFBUDtBQUM5QixVQUFJLENBQUNELEtBQUssQ0FBQ0UsSUFBWCxFQUFpQixPQUFPLElBQVAsQ0FGWSxDQUVDOztBQUU5QixZQUFNQyx1QkFBdUIsR0FBR0MsdUJBQWNDLFFBQWQsQ0FBdUIsZ0JBQXZCLEVBQXlDTCxLQUFLLENBQUNFLElBQU4sQ0FBV0ksTUFBcEQsQ0FBaEM7O0FBQ0EsVUFBSUgsdUJBQXVCLENBQUNILEtBQUssQ0FBQ08sR0FBTixDQUFVQyxPQUFYLENBQXZCLEtBQStDQyxTQUFuRCxFQUE4RDtBQUMxRCxlQUFPVCxLQUFLLENBQUNVLE1BQU4sS0FBaUJWLEtBQUssQ0FBQ1csYUFBOUI7QUFDSDs7QUFDRCxhQUFPLENBQUMsQ0FBQ1IsdUJBQXVCLENBQUNILEtBQUssQ0FBQ08sR0FBTixDQUFVQyxPQUFYLENBQWhDO0FBQ0gsS0ExQmtCO0FBQUEsa0VBZ0RNLE1BQU07QUFDM0IsWUFBTUksbUJBQW1CLEdBQUcsS0FBS0EsbUJBQUwsQ0FBeUIsS0FBS1osS0FBOUIsQ0FBNUI7O0FBRUEsVUFBSSxLQUFLYSxLQUFMLENBQVdELG1CQUFYLElBQWtDLENBQUNBLG1CQUF2QyxFQUE0RDtBQUN4RDtBQUNBRSxtQ0FBa0JDLHVCQUFsQixDQUEwQyxLQUFLZixLQUFMLENBQVdPLEdBQVgsQ0FBZVMsRUFBekQ7O0FBQ0FDLGtDQUFpQkMsY0FBakIsQ0FBZ0MsS0FBS0MsV0FBckM7O0FBQ0EsYUFBS0MsU0FBTCxDQUFlQyxJQUFmO0FBQ0g7O0FBRUQsV0FBS0MsUUFBTCxDQUFjO0FBQUVWLFFBQUFBO0FBQUYsT0FBZDtBQUNILEtBM0RrQjtBQUFBLDREQW9IQ1csR0FBRCxJQUFTO0FBQ3hCLFdBQUtDLE1BQUwsR0FBY0QsR0FBZDs7QUFDQSxVQUFJQSxHQUFKLEVBQVM7QUFDTCxhQUFLSCxTQUFMLENBQWVLLEtBQWYsQ0FBcUJGLEdBQXJCO0FBQ0gsT0FGRCxNQUVPO0FBQ0gsYUFBS0csWUFBTCxDQUFrQixLQUFLMUIsS0FBdkI7QUFDSDtBQUNKLEtBM0hrQjtBQUFBLDZEQTBLQyxNQUFNO0FBQ3RCLFdBQUtzQixRQUFMLENBQWM7QUFBQ0ssUUFBQUEsT0FBTyxFQUFFO0FBQVYsT0FBZDtBQUNILEtBNUtrQjtBQUFBLDBEQThLRixNQUFNO0FBQ25CLFVBQUlDLHVCQUFXQyxLQUFYLENBQWlCQyxPQUFqQixDQUF5QixLQUFLOUIsS0FBTCxDQUFXTyxHQUFYLENBQWV3QixJQUF4QyxDQUFKLEVBQW1EO0FBQy9DLGFBQUtYLFNBQUwsQ0FBZVksU0FBZixDQUF5QkMsU0FBekIsQ0FBbUNDLElBQW5DLENBQXdDQywyQ0FBcUJDLFdBQTdELEVBQTBFLEVBQTFFO0FBQ0g7QUFDSixLQWxMa0I7QUFBQSxxREFvTFBDLE9BQU8sSUFBSTtBQUNuQixVQUFJQSxPQUFPLENBQUNDLFFBQVIsS0FBcUIsS0FBS3RDLEtBQUwsQ0FBV08sR0FBWCxDQUFlUyxFQUF4QyxFQUE0QztBQUN4QyxnQkFBUXFCLE9BQU8sQ0FBQ0UsTUFBaEI7QUFDSSxlQUFLLFdBQUw7QUFDSSxnQkFBSSxLQUFLbkIsU0FBTCxDQUFlWSxTQUFmLENBQXlCUSxhQUF6QixDQUF1Q0Msb0NBQW1CQyxjQUExRCxDQUFKLEVBQStFO0FBQzNFQyxrQ0FBSUMsUUFBSixDQUFhO0FBQUNMLGdCQUFBQSxNQUFNLEVBQUUsc0JBQVQ7QUFBaUNNLGdCQUFBQSxJQUFJLEVBQUVSLE9BQU8sQ0FBQ1E7QUFBL0MsZUFBYjtBQUNILGFBRkQsTUFFTztBQUNIQyxjQUFBQSxPQUFPLENBQUNDLElBQVIsQ0FBYSw4Q0FBYjtBQUNIOztBQUNEO0FBUFI7QUFTSDtBQUNKLEtBaE1rQjtBQUFBLGtFQWtNTSxNQUFNO0FBQzNCLFlBQU16QyxNQUFNLEdBQUcsS0FBS04sS0FBTCxDQUFXRSxJQUFYLENBQWdCSSxNQUEvQjtBQUNBd0MsTUFBQUEsT0FBTyxDQUFDRSxJQUFSLENBQWEsNkNBQTZDLEtBQUtoRCxLQUFMLENBQVdPLEdBQVgsQ0FBZUMsT0FBekU7O0FBQ0EsWUFBTXlDLE9BQU8sR0FBRzdDLHVCQUFjQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5Q0MsTUFBekMsQ0FBaEI7O0FBQ0EyQyxNQUFBQSxPQUFPLENBQUMsS0FBS2pELEtBQUwsQ0FBV08sR0FBWCxDQUFlQyxPQUFoQixDQUFQLEdBQWtDLElBQWxDOztBQUNBLFlBQU0wQyxLQUFLLEdBQUc5Qyx1QkFBYytDLG1CQUFkLENBQWtDLGdCQUFsQyxDQUFkOztBQUNBL0MsNkJBQWNnRCxRQUFkLENBQXVCLGdCQUF2QixFQUF5QzlDLE1BQXpDLEVBQWlENEMsS0FBakQsRUFBd0RELE9BQXhELEVBQWlFSSxJQUFqRSxDQUFzRSxNQUFNO0FBQ3hFLGFBQUsvQixRQUFMLENBQWM7QUFBQ1YsVUFBQUEsbUJBQW1CLEVBQUU7QUFBdEIsU0FBZCxFQUR3RSxDQUd4RTs7QUFDQSxhQUFLMEMsWUFBTDtBQUNILE9BTEQsRUFLR0MsS0FMSCxDQUtTQyxHQUFHLElBQUk7QUFDWlYsUUFBQUEsT0FBTyxDQUFDVyxLQUFSLENBQWNELEdBQWQsRUFEWSxDQUVaO0FBQ0gsT0FSRDtBQVNILEtBak5rQjtBQUFBLGdFQXNQSSxNQUFNO0FBQ3pCO0FBQ0E7QUFDQSxVQUFJNUIsdUJBQVdDLEtBQVgsQ0FBaUJDLE9BQWpCLENBQXlCLEtBQUs5QixLQUFMLENBQVdPLEdBQVgsQ0FBZXdCLElBQXhDLENBQUosRUFBbUQ7QUFDL0MsYUFBSzJCLGlCQUFMLEdBQXlCTCxJQUF6QixDQUE4QixNQUFNO0FBQ2hDLGNBQUksS0FBSzdCLE1BQVQsRUFBaUI7QUFDYjtBQUNBLGlCQUFLQSxNQUFMLENBQVltQyxHQUFaLEdBQWtCLEtBQUt2QyxTQUFMLENBQWV3QyxRQUFqQztBQUNBLGlCQUFLdEMsUUFBTCxDQUFjLEVBQWQ7QUFDSDtBQUNKLFNBTkQ7QUFPSCxPQVh3QixDQVl6QjtBQUNBOzs7QUFDQXVDLE1BQUFBLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjQyxRQUFRLENBQUNDLGFBQVQsQ0FBdUIsR0FBdkIsQ0FBZCxFQUNJO0FBQUVDLFFBQUFBLE1BQU0sRUFBRSxRQUFWO0FBQW9CQyxRQUFBQSxJQUFJLEVBQUUsS0FBSzlDLFNBQUwsQ0FBZStDLFNBQXpDO0FBQW9EQyxRQUFBQSxHQUFHLEVBQUU7QUFBekQsT0FESixFQUNxRkMsS0FEckY7QUFFSCxLQXRRa0I7QUFBQSwrREF3UUcsTUFBTTtBQUN4QixXQUFLL0MsUUFBTCxDQUFjO0FBQUVnRCxRQUFBQSxhQUFhLEVBQUU7QUFBakIsT0FBZDtBQUNILEtBMVFrQjtBQUFBLDZEQTRRQyxNQUFNO0FBQ3RCLFdBQUtoRCxRQUFMLENBQWM7QUFBRWdELFFBQUFBLGFBQWEsRUFBRTtBQUFqQixPQUFkO0FBQ0gsS0E5UWtCO0FBSWYsU0FBS25ELFdBQUwsR0FBbUIscUNBQWMsS0FBS25CLEtBQUwsQ0FBV08sR0FBWCxDQUFlUyxFQUE3QixDQUFuQjtBQUNBLFNBQUtJLFNBQUwsR0FBaUIsSUFBSW1ELDRCQUFKLENBQWtCLEtBQUt2RSxLQUF2QixDQUFqQjs7QUFDQSxTQUFLb0IsU0FBTCxDQUFlb0QsRUFBZixDQUFrQixXQUFsQixFQUErQixLQUFLQyxpQkFBcEM7O0FBQ0EsU0FBS3JELFNBQUwsQ0FBZW9ELEVBQWYsQ0FBa0IsT0FBbEIsRUFBMkIsS0FBS0UsY0FBaEM7O0FBQ0EsU0FBS2xELE1BQUwsR0FBYyxJQUFkLENBUmUsQ0FRSzs7QUFFcEIsU0FBS1gsS0FBTCxHQUFhLEtBQUs4RCxZQUFMLENBQWtCM0UsTUFBbEIsQ0FBYjtBQUNBLFNBQUs0RSxrQkFBTCxnQkFBMEIsdUJBQTFCO0FBRUEsU0FBS0MsdUJBQUwsR0FBK0J6RSx1QkFBYzBFLFlBQWQsQ0FBMkIsZ0JBQTNCLEVBQTZDLElBQTdDLEVBQW1ELEtBQUtDLHNCQUF4RCxDQUEvQjtBQUNILEdBZmdELENBaUJqRDs7O0FBWUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0lKLEVBQUFBLFlBQVksQ0FBQ0ssUUFBRCxFQUFXO0FBQ25CLFdBQU87QUFDSEMsTUFBQUEsWUFBWSxFQUFFLElBRFg7QUFDaUI7QUFDcEI7QUFDQXRELE1BQUFBLE9BQU8sRUFBRSxLQUFLM0IsS0FBTCxDQUFXa0YsaUJBQVgsSUFBZ0MsQ0FBQ2pFLDBCQUFpQmtFLFNBQWpCLENBQTJCLEtBQUtoRSxXQUFoQyxDQUh2QztBQUlIO0FBQ0E7QUFDQVAsTUFBQUEsbUJBQW1CLEVBQUUsS0FBS0EsbUJBQUwsQ0FBeUJvRSxRQUF6QixDQU5sQjtBQU9IdkIsTUFBQUEsS0FBSyxFQUFFLElBUEo7QUFRSDJCLE1BQUFBLGVBQWUsRUFBRUosUUFBUSxDQUFDSSxlQVJ2QjtBQVNIZCxNQUFBQSxhQUFhLEVBQUU7QUFUWixLQUFQO0FBV0g7O0FBZURlLEVBQUFBLGNBQWMsR0FBRztBQUNiLFVBQU1DLHFCQUFxQixHQUFHQyxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JDLFFBQTlDOztBQUNBLFVBQU1DLENBQUMsR0FBR0MsYUFBSUMsS0FBSixDQUFVLEtBQUs1RixLQUFMLENBQVdPLEdBQVgsQ0FBZW9GLEdBQXpCLENBQVY7O0FBQ0EsVUFBTUUsb0JBQW9CLEdBQUdILENBQUMsQ0FBQ0QsUUFBL0I7O0FBQ0EsUUFBSUgscUJBQXFCLEtBQUssUUFBMUIsSUFBc0NPLG9CQUFvQixLQUFLLFFBQW5FLEVBQTZFO0FBQ3pFL0MsTUFBQUEsT0FBTyxDQUFDQyxJQUFSLENBQWEscUNBQWIsRUFDSXVDLHFCQURKLEVBQzJCTyxvQkFEM0IsRUFDaUROLE1BQU0sQ0FBQ0MsUUFEeEQsRUFDa0UsS0FBS3hGLEtBQUwsQ0FBV08sR0FBWCxDQUFlb0YsR0FEakY7QUFFQSxhQUFPLElBQVA7QUFDSDs7QUFDRCxXQUFPLEtBQVA7QUFDSDs7QUFFREcsRUFBQUEsaUJBQWlCLEdBQUc7QUFDaEI7QUFDQSxRQUFJLEtBQUtqRixLQUFMLENBQVdELG1CQUFmLEVBQW9DO0FBQ2hDLFdBQUswQyxZQUFMO0FBQ0gsS0FKZSxDQU1oQjs7O0FBQ0EsU0FBS3lDLGFBQUwsR0FBcUJwRCxvQkFBSXFELFFBQUosQ0FBYSxLQUFLQyxTQUFsQixDQUFyQjtBQUNIOztBQUVEQyxFQUFBQSxvQkFBb0IsR0FBRztBQUNuQjtBQUNBLFFBQUksS0FBS0gsYUFBVCxFQUF3QnBELG9CQUFJd0QsVUFBSixDQUFlLEtBQUtKLGFBQXBCLEVBRkwsQ0FJbkI7O0FBQ0EsUUFBSSxDQUFDakYsMkJBQWtCc0Ysb0JBQWxCLENBQXVDLEtBQUtwRyxLQUFMLENBQVdPLEdBQVgsQ0FBZVMsRUFBdEQsQ0FBTCxFQUFnRTtBQUM1REYsaUNBQWtCQyx1QkFBbEIsQ0FBMEMsS0FBS2YsS0FBTCxDQUFXTyxHQUFYLENBQWVTLEVBQXpEOztBQUNBQyxnQ0FBaUJDLGNBQWpCLENBQWdDLEtBQUtDLFdBQXJDO0FBQ0g7O0FBRUQsUUFBSSxLQUFLQyxTQUFULEVBQW9CO0FBQ2hCLFdBQUtBLFNBQUwsQ0FBZUMsSUFBZjtBQUNIOztBQUVEakIsMkJBQWNpRyxjQUFkLENBQTZCLEtBQUt4Qix1QkFBbEM7QUFDSDs7QUFFRG5ELEVBQUFBLFlBQVksQ0FBQ3NELFFBQUQsRUFBVztBQUNuQixRQUFJLEtBQUs1RCxTQUFULEVBQW9CO0FBQ2hCLFdBQUtBLFNBQUwsQ0FBZUMsSUFBZjtBQUNIOztBQUNELFNBQUtELFNBQUwsR0FBaUIsSUFBSW1ELDRCQUFKLENBQWtCUyxRQUFsQixDQUFqQjs7QUFDQSxTQUFLNUQsU0FBTCxDQUFlb0QsRUFBZixDQUFrQixXQUFsQixFQUErQixLQUFLQyxpQkFBcEM7O0FBQ0EsU0FBS3JELFNBQUwsQ0FBZW9ELEVBQWYsQ0FBa0IsT0FBbEIsRUFBMkIsS0FBS0UsY0FBaEM7O0FBQ0EsU0FBS3BCLFlBQUw7QUFDSDs7QUFFREEsRUFBQUEsWUFBWSxHQUFHO0FBQ1gsU0FBS2xDLFNBQUwsQ0FBZWtGLE9BQWYsR0FBeUJqRCxJQUF6QixDQUE4QixNQUFNO0FBQ2hDLFdBQUsvQixRQUFMLENBQWM7QUFBQzJELFFBQUFBLFlBQVksRUFBRTtBQUFmLE9BQWQ7QUFDSCxLQUZEO0FBR0g7O0FBV0Q7QUFDQXNCLEVBQUFBLGdDQUFnQyxDQUFDQyxTQUFELEVBQVk7QUFBRTtBQUMxQyxRQUFJQSxTQUFTLENBQUNqRyxHQUFWLENBQWNvRixHQUFkLEtBQXNCLEtBQUszRixLQUFMLENBQVdPLEdBQVgsQ0FBZW9GLEdBQXpDLEVBQThDO0FBQzFDLFdBQUtoQixZQUFMLENBQWtCNkIsU0FBbEI7O0FBQ0EsVUFBSSxLQUFLM0YsS0FBTCxDQUFXRCxtQkFBZixFQUFvQztBQUNoQyxhQUFLYyxZQUFMLENBQWtCOEUsU0FBbEI7QUFDSDtBQUNKOztBQUVELFFBQUlBLFNBQVMsQ0FBQ3BCLGVBQVYsS0FBOEIsS0FBS3BGLEtBQUwsQ0FBV29GLGVBQTdDLEVBQThEO0FBQzFELFdBQUs5RCxRQUFMLENBQWM7QUFDVjhELFFBQUFBLGVBQWUsRUFBRW9CLFNBQVMsQ0FBQ3BCO0FBRGpCLE9BQWQ7QUFHSDtBQUNKO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0ksUUFBTTFCLGlCQUFOLEdBQTBCO0FBQUU7QUFDeEI7QUFDQTtBQUNBO0FBQ0EsUUFBSSxLQUFLbEMsTUFBVCxFQUFpQjtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQUtBLE1BQUwsQ0FBWW1DLEdBQVosR0FBa0IsYUFBbEI7QUFDSDs7QUFFRCxRQUFJL0IsdUJBQVdDLEtBQVgsQ0FBaUJDLE9BQWpCLENBQXlCLEtBQUs5QixLQUFMLENBQVdPLEdBQVgsQ0FBZXdCLElBQXhDLENBQUosRUFBbUQ7QUFDL0NZLDBCQUFJQyxRQUFKLENBQWE7QUFBQ0wsUUFBQUEsTUFBTSxFQUFFO0FBQVQsT0FBYjtBQUNILEtBaEJxQixDQWtCdEI7OztBQUNBdEIsOEJBQWlCQyxjQUFqQixDQUFnQyxLQUFLQyxXQUFyQzs7QUFFQSxTQUFLQyxTQUFMLENBQWVDLElBQWYsQ0FBb0I7QUFBQ29GLE1BQUFBLFlBQVksRUFBRTtBQUFmLEtBQXBCO0FBQ0g7O0FBMkNEQyxFQUFBQSxpQkFBaUIsR0FBRztBQUNoQixRQUFJQyxXQUFXLEdBQUcsU0FBbEI7O0FBQ0EsUUFBSSxLQUFLM0csS0FBTCxDQUFXTyxHQUFYLENBQWVxRyxJQUFmLElBQXVCLEtBQUs1RyxLQUFMLENBQVdPLEdBQVgsQ0FBZXFHLElBQWYsQ0FBb0JDLElBQXBCLEVBQTNCLEVBQXVEO0FBQ25ERixNQUFBQSxXQUFXLEdBQUcsS0FBSzNHLEtBQUwsQ0FBV08sR0FBWCxDQUFlcUcsSUFBZixDQUFvQkMsSUFBcEIsRUFBZDtBQUNIOztBQUNELFdBQU9GLFdBQVA7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7OztBQUNJMUcsRUFBQUEsaUJBQWlCLEdBQUc7QUFDaEIsV0FBTzJCLHVCQUFXQyxLQUFYLENBQWlCQyxPQUFqQixDQUF5QixLQUFLOUIsS0FBTCxDQUFXTyxHQUFYLENBQWV3QixJQUF4QyxDQUFQO0FBQ0g7O0FBRUQrRSxFQUFBQSxhQUFhLEdBQUc7QUFDWixVQUFNRixJQUFJLEdBQUcsS0FBS0YsaUJBQUwsRUFBYjs7QUFDQSxVQUFNSyxXQUFXLGdCQUFHLHVEQUFwQjs7QUFDQSxRQUFJQyxLQUFLLEdBQUcsRUFBWjs7QUFDQSxRQUFJLEtBQUtuRyxLQUFMLENBQVd1RSxlQUFYLElBQThCLEtBQUt2RSxLQUFMLENBQVd1RSxlQUFYLEtBQStCLEtBQUtzQixpQkFBTCxFQUFqRSxFQUEyRjtBQUN2Rk0sTUFBQUEsS0FBSyxHQUFHLEtBQUtuRyxLQUFMLENBQVd1RSxlQUFuQjtBQUNIOztBQUVELHdCQUNJLHdEQUNJLDZCQUFDLHFCQUFEO0FBQWMsTUFBQSxHQUFHLEVBQUUsS0FBS3BGLEtBQUwsQ0FBV087QUFBOUIsTUFESixlQUVJLHdDQUFLcUcsSUFBTCxDQUZKLGVBR0ksMkNBQVFJLEtBQUssR0FBR0QsV0FBSCxHQUFpQixFQUE5QixFQUFvQ0MsS0FBcEMsQ0FISixDQURKO0FBT0gsR0FwUGdELENBc1BqRDs7O0FBMkJBQyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxRQUFJQyxXQUFKLENBREssQ0FHTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLFVBQU1DLFlBQVksR0FBRyw2REFDakIsb0RBREosQ0FSSyxDQVdMO0FBQ0E7O0FBQ0EsVUFBTUMsY0FBYyxHQUFHLGtGQUF2QjtBQUVBLFVBQU1DLGdCQUFnQixHQUFHLG9CQUFvQixLQUFLckgsS0FBTCxDQUFXc0gsUUFBWCxHQUFzQixTQUF0QixHQUFrQyxHQUF0RCxDQUF6QjtBQUNBLFVBQU1DLGlCQUFpQixHQUFHLEVBQTFCOztBQUNBLFFBQUksS0FBS3ZILEtBQUwsQ0FBV3dILGFBQWYsRUFBOEI7QUFDMUJELE1BQUFBLGlCQUFpQixDQUFDLGdCQUFELENBQWpCLEdBQXNDLEtBQUt2SCxLQUFMLENBQVd3SCxhQUFqRDtBQUNIOztBQUVELFVBQU1DLGNBQWMsZ0JBQ2hCO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSSw2QkFBQyxnQkFBRDtBQUFTLE1BQUEsT0FBTyxFQUFFLHlCQUFHLFlBQUg7QUFBbEIsTUFESixDQURKOztBQUtBLFFBQUksQ0FBQyxLQUFLNUcsS0FBTCxDQUFXRCxtQkFBaEIsRUFBcUM7QUFDakM7QUFDQSxZQUFNOEcsV0FBVyxHQUFHQyxpQ0FBZ0JDLEdBQWhCLEdBQXNCQyxlQUF0QixDQUFzQyxLQUFLN0gsS0FBTCxDQUFXRSxJQUFYLENBQWdCSSxNQUF0RCxDQUFwQjs7QUFDQTRHLE1BQUFBLFdBQVcsZ0JBQ1A7QUFBSyxRQUFBLFNBQVMsRUFBRUcsZ0JBQWhCO0FBQWtDLFFBQUEsS0FBSyxFQUFFRTtBQUF6QyxzQkFDSSw2QkFBQyxzQkFBRDtBQUNJLFFBQUEsTUFBTSxFQUFFLEtBQUt2SCxLQUFMLENBQVdFLElBQVgsQ0FBZ0JJLE1BRDVCO0FBRUksUUFBQSxhQUFhLEVBQUUsS0FBS04sS0FBTCxDQUFXVyxhQUY5QjtBQUdJLFFBQUEsR0FBRyxFQUFFLEtBQUtTLFNBQUwsQ0FBZXdDLFFBSHhCO0FBSUksUUFBQSxlQUFlLEVBQUU4RCxXQUpyQjtBQUtJLFFBQUEsbUJBQW1CLEVBQUUsS0FBS0k7QUFMOUIsUUFESixDQURKO0FBV0gsS0FkRCxNQWNPLElBQUksS0FBS2pILEtBQUwsQ0FBV29FLFlBQWYsRUFBNkI7QUFDaENpQyxNQUFBQSxXQUFXLGdCQUNQO0FBQUssUUFBQSxTQUFTLEVBQUVHLGdCQUFnQixJQUFJLEtBQUt4RyxLQUFMLENBQVdjLE9BQVgsR0FBcUIsZUFBckIsR0FBdUMsRUFBM0MsQ0FBaEM7QUFBZ0YsUUFBQSxLQUFLLEVBQUU0RjtBQUF2RixTQUNNRSxjQUROLENBREo7QUFLSCxLQU5NLE1BTUE7QUFDSCxVQUFJLEtBQUtwQyxjQUFMLEVBQUosRUFBMkI7QUFDdkI2QixRQUFBQSxXQUFXLGdCQUNQO0FBQUssVUFBQSxTQUFTLEVBQUVHLGdCQUFoQjtBQUFrQyxVQUFBLEtBQUssRUFBRUU7QUFBekMsd0JBQ0ksNkJBQUMsbUJBQUQ7QUFBWSxVQUFBLFFBQVEsRUFBQztBQUFyQixVQURKLENBREo7QUFLSCxPQU5ELE1BTU87QUFDSEwsUUFBQUEsV0FBVyxnQkFDUDtBQUFLLFVBQUEsU0FBUyxFQUFFRyxnQkFBZ0IsSUFBSSxLQUFLeEcsS0FBTCxDQUFXYyxPQUFYLEdBQXFCLGVBQXJCLEdBQXVDLEVBQTNDLENBQWhDO0FBQWdGLFVBQUEsS0FBSyxFQUFFNEY7QUFBdkYsV0FDTSxLQUFLMUcsS0FBTCxDQUFXYyxPQUFYLElBQXNCOEYsY0FENUIsZUFFSTtBQUNJLFVBQUEsS0FBSyxFQUFFTCxjQURYO0FBRUksVUFBQSxHQUFHLEVBQUUsS0FBS1csZ0JBRmQ7QUFHSSxVQUFBLEdBQUcsRUFBRSxLQUFLM0csU0FBTCxDQUFld0MsUUFIeEI7QUFJSSxVQUFBLGVBQWUsRUFBRSxJQUpyQjtBQUtJLFVBQUEsT0FBTyxFQUFFdUQ7QUFMYixVQUZKLENBREo7O0FBYUEsWUFBSSxDQUFDLEtBQUtuSCxLQUFMLENBQVdnSSxVQUFoQixFQUE0QjtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQWQsVUFBQUEsV0FBVyxnQkFBRztBQUFLLFlBQUEsU0FBUyxFQUFDO0FBQWYsMEJBQ1YsNkJBQUMseUJBQUQ7QUFBa0IsWUFBQSxVQUFVLEVBQUUsS0FBSy9GO0FBQW5DLGFBQ0srRixXQURMLENBRFUsQ0FBZDtBQUtIO0FBQ0o7QUFDSjs7QUFFRCxRQUFJZSxjQUFKOztBQUNBLFFBQUksS0FBS2pJLEtBQUwsQ0FBV3NILFFBQWYsRUFBeUI7QUFDckJXLE1BQUFBLGNBQWMsR0FBRztBQUFDQyxRQUFBQSxlQUFlLEVBQUU7QUFBbEIsT0FBakI7QUFDSCxLQUZELE1BRU8sSUFBSSxLQUFLbEksS0FBTCxDQUFXbUksU0FBZixFQUEwQjtBQUM3QkYsTUFBQUEsY0FBYyxHQUFHO0FBQUNHLFFBQUFBLG1CQUFtQixFQUFFO0FBQXRCLE9BQWpCO0FBQ0gsS0FGTSxNQUVBO0FBQ0hILE1BQUFBLGNBQWMsR0FBRztBQUFDSSxRQUFBQSxVQUFVLEVBQUU7QUFBYixPQUFqQjtBQUNIOztBQUNESixJQUFBQSxjQUFjLEdBQUcseUJBQVdBLGNBQVgsQ0FBakI7QUFFQSxRQUFJSyxXQUFKOztBQUNBLFFBQUksS0FBS3pILEtBQUwsQ0FBV3lELGFBQWYsRUFBOEI7QUFDMUJnRSxNQUFBQSxXQUFXLGdCQUNQLDZCQUFDLDBCQUFELDZCQUNRLDhCQUFZLEtBQUsxRCxrQkFBTCxDQUF3QjNCLE9BQXhCLENBQWdDc0YscUJBQWhDLEVBQVosRUFBcUUsSUFBckUsQ0FEUjtBQUVJLFFBQUEsR0FBRyxFQUFFLEtBQUt2SSxLQUFMLENBQVdPLEdBRnBCO0FBR0ksUUFBQSxVQUFVLEVBQUUsS0FBS2lJLGlCQUhyQjtBQUlJLFFBQUEsU0FBUyxFQUFFLENBQUMsS0FBS3hJLEtBQUwsQ0FBV2dJLFVBSjNCO0FBS0ksUUFBQSxVQUFVLEVBQUUsS0FBS2hJLEtBQUwsQ0FBV2dJO0FBTDNCLFNBREo7QUFTSDs7QUFFRCx3QkFBTyw2QkFBQyxjQUFELENBQU8sUUFBUCxxQkFDSDtBQUFLLE1BQUEsU0FBUyxFQUFFQyxjQUFoQjtBQUFnQyxNQUFBLEVBQUUsRUFBRSxLQUFLakksS0FBTCxDQUFXTyxHQUFYLENBQWVTO0FBQW5ELE9BQ00sS0FBS2hCLEtBQUwsQ0FBV3lJLFdBQVgsaUJBQ0Y7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQU0sTUFBQSxTQUFTLEVBQUMsd0JBQWhCO0FBQXlDLE1BQUEsS0FBSyxFQUFFO0FBQUNqQixRQUFBQSxhQUFhLEVBQUcsS0FBS3hILEtBQUwsQ0FBVzBJLDJCQUFYLEdBQXlDLEtBQXpDLEdBQWlEO0FBQWxFO0FBQWhELE9BQ00sS0FBSzFJLEtBQUwsQ0FBVzJJLFNBQVgsSUFBd0IsS0FBSzdCLGFBQUwsRUFEOUIsQ0FESixlQUlJO0FBQU0sTUFBQSxTQUFTLEVBQUM7QUFBaEIsT0FDTSxLQUFLOUcsS0FBTCxDQUFXNEksVUFBWCxpQkFBeUIsNkJBQUMseUJBQUQ7QUFDdkIsTUFBQSxTQUFTLEVBQUMsa0VBRGE7QUFFdkIsTUFBQSxLQUFLLEVBQUUseUJBQUcsZUFBSCxDQUZnQjtBQUd2QixNQUFBLE9BQU8sRUFBRSxLQUFLQztBQUhTLE1BRC9CLGVBTU0sNkJBQUMsOEJBQUQ7QUFDRSxNQUFBLFNBQVMsRUFBQyxnRUFEWjtBQUVFLE1BQUEsS0FBSyxFQUFFLHlCQUFHLFNBQUgsQ0FGVDtBQUdFLE1BQUEsVUFBVSxFQUFFLEtBQUtoSSxLQUFMLENBQVd5RCxhQUh6QjtBQUlFLE1BQUEsUUFBUSxFQUFFLEtBQUtNLGtCQUpqQjtBQUtFLE1BQUEsT0FBTyxFQUFFLEtBQUtrRTtBQUxoQixNQU5OLENBSkosQ0FGSixFQXFCTTVCLFdBckJOLENBREcsRUF5QkRvQixXQXpCQyxDQUFQO0FBMkJIOztBQXZaZ0QsQzs7QUEwWnJEMUksT0FBTyxDQUFDbUosV0FBUixHQUFzQixTQUF0QjtBQUVBbkosT0FBTyxDQUFDb0osU0FBUixHQUFvQjtBQUNoQnpJLEVBQUFBLEdBQUcsRUFBRTBJLG1CQUFVQyxNQUFWLENBQWlCQyxVQUROO0FBRWhCO0FBQ0E7QUFDQWpKLEVBQUFBLElBQUksRUFBRStJLG1CQUFVQyxNQUpBO0FBS2hCO0FBQ0E7QUFDQWYsRUFBQUEsU0FBUyxFQUFFYyxtQkFBVUcsSUFQTDtBQVFoQjtBQUNBOUIsRUFBQUEsUUFBUSxFQUFFMkIsbUJBQVVHLElBVEo7QUFVaEI7QUFDQTFJLEVBQUFBLE1BQU0sRUFBRXVJLG1CQUFVSSxNQUFWLENBQWlCRixVQVhUO0FBWWhCO0FBQ0F4SSxFQUFBQSxhQUFhLEVBQUVzSSxtQkFBVUksTUFiVDtBQWNoQm5FLEVBQUFBLGlCQUFpQixFQUFFK0QsbUJBQVVHLElBZGI7QUFlaEJYLEVBQUFBLFdBQVcsRUFBRVEsbUJBQVVHLElBZlA7QUFnQmhCO0FBQ0FFLEVBQUFBLFdBQVcsRUFBRUwsbUJBQVVNLElBakJQO0FBa0JoQjtBQUNBQyxFQUFBQSxhQUFhLEVBQUVQLG1CQUFVTSxJQW5CVDtBQW9CaEI7QUFDQUUsRUFBQUEsZUFBZSxFQUFFUixtQkFBVU0sSUFyQlg7QUFzQmhCO0FBQ0FaLEVBQUFBLFNBQVMsRUFBRU0sbUJBQVVHLElBdkJMO0FBd0JoQjtBQUNBVixFQUFBQSwyQkFBMkIsRUFBRU8sbUJBQVVHLElBekJ2QjtBQTBCaEI7QUFDQVIsRUFBQUEsVUFBVSxFQUFFSyxtQkFBVUcsSUEzQk47QUE0QmhCO0FBQ0FwQixFQUFBQSxVQUFVLEVBQUVpQixtQkFBVUcsSUE3Qk47QUE4QmhCO0FBQ0E1QixFQUFBQSxhQUFhLEVBQUV5QixtQkFBVUk7QUEvQlQsQ0FBcEI7QUFrQ0F6SixPQUFPLENBQUM4SixZQUFSLEdBQXVCO0FBQ25CeEUsRUFBQUEsaUJBQWlCLEVBQUUsSUFEQTtBQUVuQnVELEVBQUFBLFdBQVcsRUFBRSxJQUZNO0FBR25CRSxFQUFBQSxTQUFTLEVBQUUsSUFIUTtBQUluQkMsRUFBQUEsVUFBVSxFQUFFLElBSk87QUFLbkJGLEVBQUFBLDJCQUEyQixFQUFFLEtBTFY7QUFNbkJWLEVBQUFBLFVBQVUsRUFBRSxLQU5PO0FBT25CVixFQUFBQSxRQUFRLEVBQUU7QUFQUyxDQUF2QiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgdXJsIGZyb20gJ3VybCc7XG5pbXBvcnQgUmVhY3QsIHtjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4vQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgQXBwUGVybWlzc2lvbiBmcm9tICcuL0FwcFBlcm1pc3Npb24nO1xuaW1wb3J0IEFwcFdhcm5pbmcgZnJvbSAnLi9BcHBXYXJuaW5nJztcbmltcG9ydCBTcGlubmVyIGZyb20gJy4vU3Bpbm5lcic7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgQWN0aXZlV2lkZ2V0U3RvcmUgZnJvbSAnLi4vLi4vLi4vc3RvcmVzL0FjdGl2ZVdpZGdldFN0b3JlJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7YWJvdmVMZWZ0T2YsIENvbnRleHRNZW51QnV0dG9ufSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudVwiO1xuaW1wb3J0IFBlcnNpc3RlZEVsZW1lbnQsIHtnZXRQZXJzaXN0S2V5fSBmcm9tIFwiLi9QZXJzaXN0ZWRFbGVtZW50XCI7XG5pbXBvcnQge1dpZGdldFR5cGV9IGZyb20gXCIuLi8uLi8uLi93aWRnZXRzL1dpZGdldFR5cGVcIjtcbmltcG9ydCB7U3RvcEdhcFdpZGdldH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy93aWRnZXRzL1N0b3BHYXBXaWRnZXRcIjtcbmltcG9ydCB7RWxlbWVudFdpZGdldEFjdGlvbnN9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvd2lkZ2V0cy9FbGVtZW50V2lkZ2V0QWN0aW9uc1wiO1xuaW1wb3J0IHtNYXRyaXhDYXBhYmlsaXRpZXN9IGZyb20gXCJtYXRyaXgtd2lkZ2V0LWFwaVwiO1xuaW1wb3J0IFJvb21XaWRnZXRDb250ZXh0TWVudSBmcm9tIFwiLi4vY29udGV4dF9tZW51cy9XaWRnZXRDb250ZXh0TWVudVwiO1xuaW1wb3J0IFdpZGdldEF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9XaWRnZXRBdmF0YXJcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5lbGVtZW50cy5BcHBUaWxlXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcHBUaWxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgLy8gVGhlIGtleSB1c2VkIGZvciBQZXJzaXN0ZWRFbGVtZW50XG4gICAgICAgIHRoaXMuX3BlcnNpc3RLZXkgPSBnZXRQZXJzaXN0S2V5KHRoaXMucHJvcHMuYXBwLmlkKTtcbiAgICAgICAgdGhpcy5fc2dXaWRnZXQgPSBuZXcgU3RvcEdhcFdpZGdldCh0aGlzLnByb3BzKTtcbiAgICAgICAgdGhpcy5fc2dXaWRnZXQub24oXCJwcmVwYXJpbmdcIiwgdGhpcy5fb25XaWRnZXRQcmVwYXJlZCk7XG4gICAgICAgIHRoaXMuX3NnV2lkZ2V0Lm9uKFwicmVhZHlcIiwgdGhpcy5fb25XaWRnZXRSZWFkeSk7XG4gICAgICAgIHRoaXMuaWZyYW1lID0gbnVsbDsgLy8gcmVmIHRvIHRoZSBpZnJhbWUgKGNhbGxiYWNrIHN0eWxlKVxuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLl9nZXROZXdTdGF0ZShwcm9wcyk7XG4gICAgICAgIHRoaXMuX2NvbnRleHRNZW51QnV0dG9uID0gY3JlYXRlUmVmKCk7XG5cbiAgICAgICAgdGhpcy5fYWxsb3dlZFdpZGdldHNXYXRjaFJlZiA9IFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFwiYWxsb3dlZFdpZGdldHNcIiwgbnVsbCwgdGhpcy5vbkFsbG93ZWRXaWRnZXRzQ2hhbmdlKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gbWFrZSB0aGUgaW1wYWN0IG9mIGNhbGxpbmcgU2V0dGluZ3NTdG9yZSBzbGlnaHRseSBsZXNzXG4gICAgaGFzUGVybWlzc2lvblRvTG9hZCA9IChwcm9wcykgPT4ge1xuICAgICAgICBpZiAodGhpcy5fdXNpbmdMb2NhbFdpZGdldCgpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgaWYgKCFwcm9wcy5yb29tKSByZXR1cm4gdHJ1ZTsgLy8gdXNlciB3aWRnZXRzIGFsd2F5cyBoYXZlIHBlcm1pc3Npb25zXG5cbiAgICAgICAgY29uc3QgY3VycmVudGx5QWxsb3dlZFdpZGdldHMgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWxsb3dlZFdpZGdldHNcIiwgcHJvcHMucm9vbS5yb29tSWQpO1xuICAgICAgICBpZiAoY3VycmVudGx5QWxsb3dlZFdpZGdldHNbcHJvcHMuYXBwLmV2ZW50SWRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wcy51c2VySWQgPT09IHByb3BzLmNyZWF0b3JVc2VySWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICEhY3VycmVudGx5QWxsb3dlZFdpZGdldHNbcHJvcHMuYXBwLmV2ZW50SWRdO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZXQgaW5pdGlhbCBjb21wb25lbnQgc3RhdGUgd2hlbiB0aGUgQXBwIHdVcmwgKHdpZGdldCBVUkwpIGlzIGJlaW5nIHVwZGF0ZWQuXG4gICAgICogQ29tcG9uZW50IHByb3BzICptdXN0KiBiZSBwYXNzZWQgKHJhdGhlciB0aGFuIHJlbHlpbmcgb24gdGhpcy5wcm9wcykuXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBuZXdQcm9wcyBUaGUgbmV3IHByb3BlcnRpZXMgb2YgdGhlIGNvbXBvbmVudFxuICAgICAqIEByZXR1cm4ge09iamVjdH0gVXBkYXRlZCBjb21wb25lbnQgc3RhdGUgdG8gYmUgc2V0IHdpdGggc2V0U3RhdGVcbiAgICAgKi9cbiAgICBfZ2V0TmV3U3RhdGUobmV3UHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGluaXRpYWxpc2luZzogdHJ1ZSwgLy8gVHJ1ZSB3aGlsZSB3ZSBhcmUgbWFuZ2xpbmcgdGhlIHdpZGdldCBVUkxcbiAgICAgICAgICAgIC8vIFRydWUgd2hpbGUgdGhlIGlmcmFtZSBjb250ZW50IGlzIGxvYWRpbmdcbiAgICAgICAgICAgIGxvYWRpbmc6IHRoaXMucHJvcHMud2FpdEZvcklmcmFtZUxvYWQgJiYgIVBlcnNpc3RlZEVsZW1lbnQuaXNNb3VudGVkKHRoaXMuX3BlcnNpc3RLZXkpLFxuICAgICAgICAgICAgLy8gQXNzdW1lIHRoYXQgd2lkZ2V0IGhhcyBwZXJtaXNzaW9uIHRvIGxvYWQgaWYgd2UgYXJlIHRoZSB1c2VyIHdob1xuICAgICAgICAgICAgLy8gYWRkZWQgaXQgdG8gdGhlIHJvb20sIG9yIGlmIGV4cGxpY2l0bHkgZ3JhbnRlZCBieSB0aGUgdXNlclxuICAgICAgICAgICAgaGFzUGVybWlzc2lvblRvTG9hZDogdGhpcy5oYXNQZXJtaXNzaW9uVG9Mb2FkKG5ld1Byb3BzKSxcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgd2lkZ2V0UGFnZVRpdGxlOiBuZXdQcm9wcy53aWRnZXRQYWdlVGl0bGUsXG4gICAgICAgICAgICBtZW51RGlzcGxheWVkOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvbkFsbG93ZWRXaWRnZXRzQ2hhbmdlID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBoYXNQZXJtaXNzaW9uVG9Mb2FkID0gdGhpcy5oYXNQZXJtaXNzaW9uVG9Mb2FkKHRoaXMucHJvcHMpO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmhhc1Blcm1pc3Npb25Ub0xvYWQgJiYgIWhhc1Blcm1pc3Npb25Ub0xvYWQpIHtcbiAgICAgICAgICAgIC8vIEZvcmNlIHRoZSB3aWRnZXQgdG8gYmUgbm9uLXBlcnNpc3RlbnQgKGFibGUgdG8gYmUgZGVsZXRlZC9mb3Jnb3R0ZW4pXG4gICAgICAgICAgICBBY3RpdmVXaWRnZXRTdG9yZS5kZXN0cm95UGVyc2lzdGVudFdpZGdldCh0aGlzLnByb3BzLmFwcC5pZCk7XG4gICAgICAgICAgICBQZXJzaXN0ZWRFbGVtZW50LmRlc3Ryb3lFbGVtZW50KHRoaXMuX3BlcnNpc3RLZXkpO1xuICAgICAgICAgICAgdGhpcy5fc2dXaWRnZXQuc3RvcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGhhc1Blcm1pc3Npb25Ub0xvYWQgfSk7XG4gICAgfTtcblxuICAgIGlzTWl4ZWRDb250ZW50KCkge1xuICAgICAgICBjb25zdCBwYXJlbnRDb250ZW50UHJvdG9jb2wgPSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2w7XG4gICAgICAgIGNvbnN0IHUgPSB1cmwucGFyc2UodGhpcy5wcm9wcy5hcHAudXJsKTtcbiAgICAgICAgY29uc3QgY2hpbGRDb250ZW50UHJvdG9jb2wgPSB1LnByb3RvY29sO1xuICAgICAgICBpZiAocGFyZW50Q29udGVudFByb3RvY29sID09PSAnaHR0cHM6JyAmJiBjaGlsZENvbnRlbnRQcm90b2NvbCAhPT0gJ2h0dHBzOicpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlJlZnVzaW5nIHRvIGxvYWQgbWl4ZWQtY29udGVudCBhcHA6XCIsXG4gICAgICAgICAgICAgICAgcGFyZW50Q29udGVudFByb3RvY29sLCBjaGlsZENvbnRlbnRQcm90b2NvbCwgd2luZG93LmxvY2F0aW9uLCB0aGlzLnByb3BzLmFwcC51cmwpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAvLyBPbmx5IGZldGNoIElNIHRva2VuIG9uIG1vdW50IGlmIHdlJ3JlIHNob3dpbmcgYW5kIGhhdmUgcGVybWlzc2lvbiB0byBsb2FkXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmhhc1Blcm1pc3Npb25Ub0xvYWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0V2lkZ2V0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXaWRnZXQgYWN0aW9uIGxpc3RlbmVyc1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5fb25BY3Rpb24pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAvLyBXaWRnZXQgYWN0aW9uIGxpc3RlbmVyc1xuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVyUmVmKSBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuXG4gICAgICAgIC8vIGlmIGl0J3Mgbm90IHJlbWFpbmluZyBvbiBzY3JlZW4sIGdldCByaWQgb2YgdGhlIFBlcnNpc3RlZEVsZW1lbnQgY29udGFpbmVyXG4gICAgICAgIGlmICghQWN0aXZlV2lkZ2V0U3RvcmUuZ2V0V2lkZ2V0UGVyc2lzdGVuY2UodGhpcy5wcm9wcy5hcHAuaWQpKSB7XG4gICAgICAgICAgICBBY3RpdmVXaWRnZXRTdG9yZS5kZXN0cm95UGVyc2lzdGVudFdpZGdldCh0aGlzLnByb3BzLmFwcC5pZCk7XG4gICAgICAgICAgICBQZXJzaXN0ZWRFbGVtZW50LmRlc3Ryb3lFbGVtZW50KHRoaXMuX3BlcnNpc3RLZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX3NnV2lkZ2V0KSB7XG4gICAgICAgICAgICB0aGlzLl9zZ1dpZGdldC5zdG9wKCk7XG4gICAgICAgIH1cblxuICAgICAgICBTZXR0aW5nc1N0b3JlLnVud2F0Y2hTZXR0aW5nKHRoaXMuX2FsbG93ZWRXaWRnZXRzV2F0Y2hSZWYpO1xuICAgIH1cblxuICAgIF9yZXNldFdpZGdldChuZXdQcm9wcykge1xuICAgICAgICBpZiAodGhpcy5fc2dXaWRnZXQpIHtcbiAgICAgICAgICAgIHRoaXMuX3NnV2lkZ2V0LnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zZ1dpZGdldCA9IG5ldyBTdG9wR2FwV2lkZ2V0KG5ld1Byb3BzKTtcbiAgICAgICAgdGhpcy5fc2dXaWRnZXQub24oXCJwcmVwYXJpbmdcIiwgdGhpcy5fb25XaWRnZXRQcmVwYXJlZCk7XG4gICAgICAgIHRoaXMuX3NnV2lkZ2V0Lm9uKFwicmVhZHlcIiwgdGhpcy5fb25XaWRnZXRSZWFkeSk7XG4gICAgICAgIHRoaXMuX3N0YXJ0V2lkZ2V0KCk7XG4gICAgfVxuXG4gICAgX3N0YXJ0V2lkZ2V0KCkge1xuICAgICAgICB0aGlzLl9zZ1dpZGdldC5wcmVwYXJlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtpbml0aWFsaXNpbmc6IGZhbHNlfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9pZnJhbWVSZWZDaGFuZ2UgPSAocmVmKSA9PiB7XG4gICAgICAgIHRoaXMuaWZyYW1lID0gcmVmO1xuICAgICAgICBpZiAocmVmKSB7XG4gICAgICAgICAgICB0aGlzLl9zZ1dpZGdldC5zdGFydChyZWYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcmVzZXRXaWRnZXQodGhpcy5wcm9wcyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gVE9ETzogW1JFQUNULVdBUk5JTkddIFJlcGxhY2Ugd2l0aCBhcHByb3ByaWF0ZSBsaWZlY3ljbGUgZXZlbnRcbiAgICBVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2VcbiAgICAgICAgaWYgKG5leHRQcm9wcy5hcHAudXJsICE9PSB0aGlzLnByb3BzLmFwcC51cmwpIHtcbiAgICAgICAgICAgIHRoaXMuX2dldE5ld1N0YXRlKG5leHRQcm9wcyk7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5oYXNQZXJtaXNzaW9uVG9Mb2FkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzZXRXaWRnZXQobmV4dFByb3BzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXh0UHJvcHMud2lkZ2V0UGFnZVRpdGxlICE9PSB0aGlzLnByb3BzLndpZGdldFBhZ2VUaXRsZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgd2lkZ2V0UGFnZVRpdGxlOiBuZXh0UHJvcHMud2lkZ2V0UGFnZVRpdGxlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmRzIGFsbCB3aWRnZXQgaW50ZXJhY3Rpb24sIHN1Y2ggYXMgY2FuY2VsbGluZyBjYWxscyBhbmQgZGlzYWJsaW5nIHdlYmNhbXMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTwqPn0gUmVzb2x2ZXMgd2hlbiB0aGUgd2lkZ2V0IGlzIHRlcm1pbmF0ZWQsIG9yIHRpbWVvdXQgcGFzc2VkLlxuICAgICAqL1xuICAgIGFzeW5jIF9lbmRXaWRnZXRBY3Rpb25zKCkgeyAvLyB3aWRnZXQgbWlncmF0aW9uIGRldiBub3RlOiBhc3luYyB0byBtYWludGFpbiBzaWduYXR1cmVcbiAgICAgICAgLy8gSEFDSzogVGhpcyBpcyBhIHJlYWxseSBkaXJ0eSB3YXkgdG8gZW5zdXJlIHRoYXQgSml0c2kgY2xlYW5zIHVwXG4gICAgICAgIC8vIGl0cyBob2xkIG9uIHRoZSB3ZWJjYW0uIFdpdGhvdXQgdGhpcywgdGhlIHdpZGdldCBob2xkcyBhIG1lZGlhXG4gICAgICAgIC8vIHN0cmVhbSBvcGVuLCBldmVuIGFmdGVyIGRlYXRoLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvNzM1MVxuICAgICAgICBpZiAodGhpcy5pZnJhbWUpIHtcbiAgICAgICAgICAgIC8vIEluIHByYWN0aWNlIHdlIGNvdWxkIGp1c3QgZG8gYCs9ICcnYCB0byB0cmljayB0aGUgYnJvd3NlclxuICAgICAgICAgICAgLy8gaW50byB0aGlua2luZyB0aGUgVVJMIGNoYW5nZWQsIGhvd2V2ZXIgSSBjYW4gZm9yZXNlZSB0aGlzXG4gICAgICAgICAgICAvLyBiZWluZyBvcHRpbWl6ZWQgb3V0IGJ5IGEgYnJvd3Nlci4gSW5zdGVhZCwgd2UnbGwganVzdCBwb2ludFxuICAgICAgICAgICAgLy8gdGhlIGlmcmFtZSBhdCBhIHBhZ2UgdGhhdCBpcyByZWFzb25hYmx5IHNhZmUgdG8gdXNlIGluIHRoZVxuICAgICAgICAgICAgLy8gZXZlbnQgdGhlIGlmcmFtZSBkb2Vzbid0IHdpbmsgYXdheS5cbiAgICAgICAgICAgIC8vIFRoaXMgaXMgcmVsYXRpdmUgdG8gd2hlcmUgdGhlIEVsZW1lbnQgaW5zdGFuY2UgaXMgbG9jYXRlZC5cbiAgICAgICAgICAgIHRoaXMuaWZyYW1lLnNyYyA9ICdhYm91dDpibGFuayc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoV2lkZ2V0VHlwZS5KSVRTSS5tYXRjaGVzKHRoaXMucHJvcHMuYXBwLnR5cGUpKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ2hhbmd1cF9jb25mZXJlbmNlJ30pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVsZXRlIHRoZSB3aWRnZXQgZnJvbSB0aGUgcGVyc2lzdGVkIHN0b3JlIGZvciBnb29kIG1lYXN1cmUuXG4gICAgICAgIFBlcnNpc3RlZEVsZW1lbnQuZGVzdHJveUVsZW1lbnQodGhpcy5fcGVyc2lzdEtleSk7XG5cbiAgICAgICAgdGhpcy5fc2dXaWRnZXQuc3RvcCh7Zm9yY2VEZXN0cm95OiB0cnVlfSk7XG4gICAgfVxuXG4gICAgX29uV2lkZ2V0UHJlcGFyZWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2xvYWRpbmc6IGZhbHNlfSk7XG4gICAgfTtcblxuICAgIF9vbldpZGdldFJlYWR5ID0gKCkgPT4ge1xuICAgICAgICBpZiAoV2lkZ2V0VHlwZS5KSVRTSS5tYXRjaGVzKHRoaXMucHJvcHMuYXBwLnR5cGUpKSB7XG4gICAgICAgICAgICB0aGlzLl9zZ1dpZGdldC53aWRnZXRBcGkudHJhbnNwb3J0LnNlbmQoRWxlbWVudFdpZGdldEFjdGlvbnMuQ2xpZW50UmVhZHksIHt9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfb25BY3Rpb24gPSBwYXlsb2FkID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQud2lkZ2V0SWQgPT09IHRoaXMucHJvcHMuYXBwLmlkKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnbS5zdGlja2VyJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3NnV2lkZ2V0LndpZGdldEFwaS5oYXNDYXBhYmlsaXR5KE1hdHJpeENhcGFiaWxpdGllcy5TdGlja2VyU2VuZGluZykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAncG9zdF9zdGlja2VyX21lc3NhZ2UnLCBkYXRhOiBwYXlsb2FkLmRhdGF9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSWdub3Jpbmcgc3RpY2tlciBtZXNzYWdlLiBJbnZhbGlkIGNhcGFiaWxpdHknKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfZ3JhbnRXaWRnZXRQZXJtaXNzaW9uID0gKCkgPT4ge1xuICAgICAgICBjb25zdCByb29tSWQgPSB0aGlzLnByb3BzLnJvb20ucm9vbUlkO1xuICAgICAgICBjb25zb2xlLmluZm8oXCJHcmFudGluZyBwZXJtaXNzaW9uIGZvciB3aWRnZXQgdG8gbG9hZDogXCIgKyB0aGlzLnByb3BzLmFwcC5ldmVudElkKTtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhbGxvd2VkV2lkZ2V0c1wiLCByb29tSWQpO1xuICAgICAgICBjdXJyZW50W3RoaXMucHJvcHMuYXBwLmV2ZW50SWRdID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgbGV2ZWwgPSBTZXR0aW5nc1N0b3JlLmZpcnN0U3VwcG9ydGVkTGV2ZWwoXCJhbGxvd2VkV2lkZ2V0c1wiKTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcImFsbG93ZWRXaWRnZXRzXCIsIHJvb21JZCwgbGV2ZWwsIGN1cnJlbnQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aGFzUGVybWlzc2lvblRvTG9hZDogdHJ1ZX0pO1xuXG4gICAgICAgICAgICAvLyBGZXRjaCBhIHRva2VuIGZvciB0aGUgaW50ZWdyYXRpb24gbWFuYWdlciwgbm93IHRoYXQgd2UncmUgYWxsb3dlZCB0b1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRXaWRnZXQoKTtcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHJlYWxseSBuZWVkIHRvIGRvIGFueXRoaW5nIGFib3V0IHRoaXMgLSB0aGUgdXNlciB3aWxsIGp1c3QgaGl0IHRoZSBidXR0b24gYWdhaW4uXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmb3JtYXRBcHBUaWxlTmFtZSgpIHtcbiAgICAgICAgbGV0IGFwcFRpbGVOYW1lID0gXCJObyBuYW1lXCI7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmFwcC5uYW1lICYmIHRoaXMucHJvcHMuYXBwLm5hbWUudHJpbSgpKSB7XG4gICAgICAgICAgICBhcHBUaWxlTmFtZSA9IHRoaXMucHJvcHMuYXBwLm5hbWUudHJpbSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcHBUaWxlTmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHdlJ3JlIHVzaW5nIGEgbG9jYWwgdmVyc2lvbiBvZiB0aGUgd2lkZ2V0IHJhdGhlciB0aGFuIGxvYWRpbmcgdGhlXG4gICAgICogYWN0dWFsIHdpZGdldCBVUkxcbiAgICAgKiBAcmV0dXJucyB7Ym9vbH0gdHJ1ZSBJZiB1c2luZyBhIGxvY2FsIHZlcnNpb24gb2YgdGhlIHdpZGdldFxuICAgICAqL1xuICAgIF91c2luZ0xvY2FsV2lkZ2V0KCkge1xuICAgICAgICByZXR1cm4gV2lkZ2V0VHlwZS5KSVRTSS5tYXRjaGVzKHRoaXMucHJvcHMuYXBwLnR5cGUpO1xuICAgIH1cblxuICAgIF9nZXRUaWxlVGl0bGUoKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLmZvcm1hdEFwcFRpbGVOYW1lKCk7XG4gICAgICAgIGNvbnN0IHRpdGxlU3BhY2VyID0gPHNwYW4+Jm5ic3A7LSZuYnNwOzwvc3Bhbj47XG4gICAgICAgIGxldCB0aXRsZSA9ICcnO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS53aWRnZXRQYWdlVGl0bGUgJiYgdGhpcy5zdGF0ZS53aWRnZXRQYWdlVGl0bGUgIT09IHRoaXMuZm9ybWF0QXBwVGlsZU5hbWUoKSkge1xuICAgICAgICAgICAgdGl0bGUgPSB0aGlzLnN0YXRlLndpZGdldFBhZ2VUaXRsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICA8V2lkZ2V0QXZhdGFyIGFwcD17dGhpcy5wcm9wcy5hcHB9IC8+XG4gICAgICAgICAgICAgICAgPGI+eyBuYW1lIH08L2I+XG4gICAgICAgICAgICAgICAgPHNwYW4+eyB0aXRsZSA/IHRpdGxlU3BhY2VyIDogJycgfXsgdGl0bGUgfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPIHJlcGxhY2Ugd2l0aCBmdWxsIHNjcmVlbiBpbnRlcmFjdGlvbnNcbiAgICBfb25Qb3BvdXRXaWRnZXRDbGljayA9ICgpID0+IHtcbiAgICAgICAgLy8gRW5zdXJlIEppdHNpIGNvbmZlcmVuY2VzIGFyZSBjbG9zZWQgb24gcG9wLW91dCwgdG8gbm90IGNvbmZ1c2UgdGhlIHVzZXIgdG8gam9pbiB0aGVtXG4gICAgICAgIC8vIHR3aWNlIGZyb20gdGhlIHNhbWUgY29tcHV0ZXIsIHdoaWNoIEppdHNpIGNhbiBoYXZlIHByb2JsZW1zIHdpdGggKGF1ZGlvIGVjaG8vZ2Fpbi1sb29wKS5cbiAgICAgICAgaWYgKFdpZGdldFR5cGUuSklUU0kubWF0Y2hlcyh0aGlzLnByb3BzLmFwcC50eXBlKSkge1xuICAgICAgICAgICAgdGhpcy5fZW5kV2lkZ2V0QWN0aW9ucygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlmcmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZWxvYWQgaWZyYW1lXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaWZyYW1lLnNyYyA9IHRoaXMuX3NnV2lkZ2V0LmVtYmVkVXJsO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHt9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBVc2luZyBPYmplY3QuYXNzaWduIHdvcmthcm91bmQgYXMgdGhlIGZvbGxvd2luZyBvcGVucyBpbiBhIG5ldyB3aW5kb3cgaW5zdGVhZCBvZiBhIG5ldyB0YWIuXG4gICAgICAgIC8vIHdpbmRvdy5vcGVuKHRoaXMuX2dldFBvcG91dFVybCgpLCAnX2JsYW5rJywgJ25vb3BlbmVyPXllcycpO1xuICAgICAgICBPYmplY3QuYXNzaWduKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKSxcbiAgICAgICAgICAgIHsgdGFyZ2V0OiAnX2JsYW5rJywgaHJlZjogdGhpcy5fc2dXaWRnZXQucG9wb3V0VXJsLCByZWw6ICdub3JlZmVycmVyIG5vb3BlbmVyJ30pLmNsaWNrKCk7XG4gICAgfTtcblxuICAgIF9vbkNvbnRleHRNZW51Q2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtZW51RGlzcGxheWVkOiB0cnVlIH0pO1xuICAgIH07XG5cbiAgICBfY2xvc2VDb250ZXh0TWVudSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1lbnVEaXNwbGF5ZWQ6IGZhbHNlIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBhcHBUaWxlQm9keTtcblxuICAgICAgICAvLyBOb3RlIHRoYXQgdGhlcmUgaXMgYWR2aWNlIHNheWluZyBhbGxvdy1zY3JpcHRzIHNob3VsZG4ndCBiZSB1c2VkIHdpdGggYWxsb3ctc2FtZS1vcmlnaW5cbiAgICAgICAgLy8gYmVjYXVzZSB0aGF0IHdvdWxkIGFsbG93IHRoZSBpZnJhbWUgdG8gcHJvZ3JhbW1hdGljYWxseSByZW1vdmUgdGhlIHNhbmRib3ggYXR0cmlidXRlLCBidXRcbiAgICAgICAgLy8gdGhpcyB3b3VsZCBvbmx5IGJlIGZvciBjb250ZW50IGhvc3RlZCBvbiB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGVsZW1lbnQgY2xpZW50OiBhbnl0aGluZ1xuICAgICAgICAvLyBob3N0ZWQgb24gdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjbGllbnQgd2lsbCBnZXQgdGhlIHNhbWUgYWNjZXNzIGFzIGlmIHlvdSBjbGlja2VkXG4gICAgICAgIC8vIGEgbGluayB0byBpdC5cbiAgICAgICAgY29uc3Qgc2FuZGJveEZsYWdzID0gXCJhbGxvdy1mb3JtcyBhbGxvdy1wb3B1cHMgYWxsb3ctcG9wdXBzLXRvLWVzY2FwZS1zYW5kYm94IFwiK1xuICAgICAgICAgICAgXCJhbGxvdy1zYW1lLW9yaWdpbiBhbGxvdy1zY3JpcHRzIGFsbG93LXByZXNlbnRhdGlvblwiO1xuXG4gICAgICAgIC8vIEFkZGl0aW9uYWwgaWZyYW1lIGZlYXR1cmUgcGVtaXNzaW9uc1xuICAgICAgICAvLyAoc2VlIC0gaHR0cHM6Ly9zaXRlcy5nb29nbGUuY29tL2EvY2hyb21pdW0ub3JnL2Rldi9Ib21lL2Nocm9taXVtLXNlY3VyaXR5L2RlcHJlY2F0aW5nLXBlcm1pc3Npb25zLWluLWNyb3NzLW9yaWdpbi1pZnJhbWVzIGFuZCBodHRwczovL3dpY2cuZ2l0aHViLmlvL2ZlYXR1cmUtcG9saWN5LylcbiAgICAgICAgY29uc3QgaWZyYW1lRmVhdHVyZXMgPSBcIm1pY3JvcGhvbmU7IGNhbWVyYTsgZW5jcnlwdGVkLW1lZGlhOyBhdXRvcGxheTsgZGlzcGxheS1jYXB0dXJlOyBjbGlwYm9hcmQtd3JpdGU7XCI7XG5cbiAgICAgICAgY29uc3QgYXBwVGlsZUJvZHlDbGFzcyA9ICdteF9BcHBUaWxlQm9keScgKyAodGhpcy5wcm9wcy5taW5pTW9kZSA/ICdfbWluaSAgJyA6ICcgJyk7XG4gICAgICAgIGNvbnN0IGFwcFRpbGVCb2R5U3R5bGVzID0ge307XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnBvaW50ZXJFdmVudHMpIHtcbiAgICAgICAgICAgIGFwcFRpbGVCb2R5U3R5bGVzWydwb2ludGVyLWV2ZW50cyddID0gdGhpcy5wcm9wcy5wb2ludGVyRXZlbnRzO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbG9hZGluZ0VsZW1lbnQgPSAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FwcExvYWRpbmdfc3Bpbm5lcl9mYWRlSW5cIj5cbiAgICAgICAgICAgICAgICA8U3Bpbm5lciBtZXNzYWdlPXtfdChcIkxvYWRpbmcuLi5cIil9IC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmhhc1Blcm1pc3Npb25Ub0xvYWQpIHtcbiAgICAgICAgICAgIC8vIG9ubHkgcG9zc2libGUgZm9yIHJvb20gd2lkZ2V0cywgY2FuIGFzc2VydCB0aGlzLnByb3BzLnJvb20gaGVyZVxuICAgICAgICAgICAgY29uc3QgaXNFbmNyeXB0ZWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNSb29tRW5jcnlwdGVkKHRoaXMucHJvcHMucm9vbS5yb29tSWQpO1xuICAgICAgICAgICAgYXBwVGlsZUJvZHkgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2FwcFRpbGVCb2R5Q2xhc3N9IHN0eWxlPXthcHBUaWxlQm9keVN0eWxlc30+XG4gICAgICAgICAgICAgICAgICAgIDxBcHBQZXJtaXNzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tSWQ9e3RoaXMucHJvcHMucm9vbS5yb29tSWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdG9yVXNlcklkPXt0aGlzLnByb3BzLmNyZWF0b3JVc2VySWR9XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw9e3RoaXMuX3NnV2lkZ2V0LmVtYmVkVXJsfVxuICAgICAgICAgICAgICAgICAgICAgICAgaXNSb29tRW5jcnlwdGVkPXtpc0VuY3J5cHRlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUGVybWlzc2lvbkdyYW50ZWQ9e3RoaXMuX2dyYW50V2lkZ2V0UGVybWlzc2lvbn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5pbml0aWFsaXNpbmcpIHtcbiAgICAgICAgICAgIGFwcFRpbGVCb2R5ID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXthcHBUaWxlQm9keUNsYXNzICsgKHRoaXMuc3RhdGUubG9hZGluZyA/ICdteF9BcHBMb2FkaW5nJyA6ICcnKX0gc3R5bGU9e2FwcFRpbGVCb2R5U3R5bGVzfT5cbiAgICAgICAgICAgICAgICAgICAgeyBsb2FkaW5nRWxlbWVudCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNNaXhlZENvbnRlbnQoKSkge1xuICAgICAgICAgICAgICAgIGFwcFRpbGVCb2R5ID0gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YXBwVGlsZUJvZHlDbGFzc30gc3R5bGU9e2FwcFRpbGVCb2R5U3R5bGVzfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBcHBXYXJuaW5nIGVycm9yTXNnPVwiRXJyb3IgLSBNaXhlZCBjb250ZW50XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXBwVGlsZUJvZHkgPSAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXthcHBUaWxlQm9keUNsYXNzICsgKHRoaXMuc3RhdGUubG9hZGluZyA/ICdteF9BcHBMb2FkaW5nJyA6ICcnKX0gc3R5bGU9e2FwcFRpbGVCb2R5U3R5bGVzfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5sb2FkaW5nICYmIGxvYWRpbmdFbGVtZW50IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxpZnJhbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxvdz17aWZyYW1lRmVhdHVyZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLl9pZnJhbWVSZWZDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjPXt0aGlzLl9zZ1dpZGdldC5lbWJlZFVybH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxvd0Z1bGxTY3JlZW49e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2FuZGJveD17c2FuZGJveEZsYWdzfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy51c2VyV2lkZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFsbCByb29tIHdpZGdldHMgY2FuIHRoZW9yZXRpY2FsbHkgYmUgYWxsb3dlZCB0byByZW1haW4gb24gc2NyZWVuLCBzbyB3ZVxuICAgICAgICAgICAgICAgICAgICAvLyB3cmFwIHRoZW0gYWxsIGluIGEgUGVyc2lzdGVkRWxlbWVudCBmcm9tIHRoZSBnZXQtZ28uIElmIHdlIHdhaXQsIHRoZSBpZnJhbWVcbiAgICAgICAgICAgICAgICAgICAgLy8gd2lsbCBiZSByZS1tb3VudGVkIGxhdGVyLCB3aGljaCBtZWFucyB0aGUgd2lkZ2V0IGhhcyB0byBzdGFydCBvdmVyLCB3aGljaCBpc1xuICAgICAgICAgICAgICAgICAgICAvLyBiYWQuXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQWxzbyB3cmFwIHRoZSBQZXJzaXN0ZWRFbGVtZW50IGluIGEgZGl2IHRvIGZpeCB0aGUgaGVpZ2h0LCBvdGhlcndpc2VcbiAgICAgICAgICAgICAgICAgICAgLy8gQXBwVGlsZSdzIGJvcmRlciBpcyBpbiB0aGUgd3JvbmcgcGxhY2VcbiAgICAgICAgICAgICAgICAgICAgYXBwVGlsZUJvZHkgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0FwcFRpbGVfcGVyc2lzdGVkV3JhcHBlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFBlcnNpc3RlZEVsZW1lbnQgcGVyc2lzdEtleT17dGhpcy5fcGVyc2lzdEtleX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2FwcFRpbGVCb2R5fVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9QZXJzaXN0ZWRFbGVtZW50PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGFwcFRpbGVDbGFzc2VzO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5taW5pTW9kZSkge1xuICAgICAgICAgICAgYXBwVGlsZUNsYXNzZXMgPSB7bXhfQXBwVGlsZV9taW5pOiB0cnVlfTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmZ1bGxXaWR0aCkge1xuICAgICAgICAgICAgYXBwVGlsZUNsYXNzZXMgPSB7bXhfQXBwVGlsZUZ1bGxXaWR0aDogdHJ1ZX07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcHBUaWxlQ2xhc3NlcyA9IHtteF9BcHBUaWxlOiB0cnVlfTtcbiAgICAgICAgfVxuICAgICAgICBhcHBUaWxlQ2xhc3NlcyA9IGNsYXNzTmFtZXMoYXBwVGlsZUNsYXNzZXMpO1xuXG4gICAgICAgIGxldCBjb250ZXh0TWVudTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubWVudURpc3BsYXllZCkge1xuICAgICAgICAgICAgY29udGV4dE1lbnUgPSAoXG4gICAgICAgICAgICAgICAgPFJvb21XaWRnZXRDb250ZXh0TWVudVxuICAgICAgICAgICAgICAgICAgICB7Li4uYWJvdmVMZWZ0T2YodGhpcy5fY29udGV4dE1lbnVCdXR0b24uY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgbnVsbCl9XG4gICAgICAgICAgICAgICAgICAgIGFwcD17dGhpcy5wcm9wcy5hcHB9XG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMuX2Nsb3NlQ29udGV4dE1lbnV9XG4gICAgICAgICAgICAgICAgICAgIHNob3dVbnBpbj17IXRoaXMucHJvcHMudXNlcldpZGdldH1cbiAgICAgICAgICAgICAgICAgICAgdXNlcldpZGdldD17dGhpcy5wcm9wcy51c2VyV2lkZ2V0fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXthcHBUaWxlQ2xhc3Nlc30gaWQ9e3RoaXMucHJvcHMuYXBwLmlkfT5cbiAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuc2hvd01lbnViYXIgJiZcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FwcFRpbGVNZW51QmFyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0FwcFRpbGVNZW51QmFyVGl0bGVcIiBzdHlsZT17e3BvaW50ZXJFdmVudHM6ICh0aGlzLnByb3BzLmhhbmRsZU1pbmltaXNlUG9pbnRlckV2ZW50cyA/ICdhbGwnIDogZmFsc2UpfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuc2hvd1RpdGxlICYmIHRoaXMuX2dldFRpbGVUaXRsZSgpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9BcHBUaWxlTWVudUJhcldpZGdldHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5zaG93UG9wb3V0ICYmIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQXBwVGlsZU1lbnVCYXJfaWNvbkJ1dHRvbiBteF9BcHBUaWxlTWVudUJhcl9pY29uQnV0dG9uX3BvcG91dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KCdQb3BvdXQgd2lkZ2V0Jyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25Qb3BvdXRXaWRnZXRDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgPENvbnRleHRNZW51QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQXBwVGlsZU1lbnVCYXJfaWNvbkJ1dHRvbiBteF9BcHBUaWxlTWVudUJhcl9pY29uQnV0dG9uX21lbnVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIk9wdGlvbnNcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNFeHBhbmRlZD17dGhpcy5zdGF0ZS5tZW51RGlzcGxheWVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0UmVmPXt0aGlzLl9jb250ZXh0TWVudUJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkNvbnRleHRNZW51Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPiB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj4gfVxuICAgICAgICAgICAgICAgIHsgYXBwVGlsZUJvZHkgfVxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIHsgY29udGV4dE1lbnUgfVxuICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICB9XG59XG5cbkFwcFRpbGUuZGlzcGxheU5hbWUgPSAnQXBwVGlsZSc7XG5cbkFwcFRpbGUucHJvcFR5cGVzID0ge1xuICAgIGFwcDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIC8vIElmIHJvb20gaXMgbm90IHNwZWNpZmllZCB0aGVuIGl0IGlzIGFuIGFjY291bnQgbGV2ZWwgd2lkZ2V0XG4gICAgLy8gd2hpY2ggYnlwYXNzZXMgcGVybWlzc2lvbiBwcm9tcHRzIGFzIGl0IHdhcyBhZGRlZCBleHBsaWNpdGx5IGJ5IHRoYXQgdXNlclxuICAgIHJvb206IFByb3BUeXBlcy5vYmplY3QsXG4gICAgLy8gU3BlY2lmeWluZyAnZnVsbFdpZHRoJyBhcyB0cnVlIHdpbGwgcmVuZGVyIHRoZSBhcHAgdGlsZSB0byBmaWxsIHRoZSB3aWR0aCBvZiB0aGUgYXBwIGRyYXdlciBjb250aW5lci5cbiAgICAvLyBUaGlzIHNob3VsZCBiZSBzZXQgdG8gdHJ1ZSB3aGVuIHRoZXJlIGlzIG9ubHkgb25lIHdpZGdldCBpbiB0aGUgYXBwIGRyYXdlciwgb3RoZXJ3aXNlIGl0IHNob3VsZCBiZSBmYWxzZS5cbiAgICBmdWxsV2lkdGg6IFByb3BUeXBlcy5ib29sLFxuICAgIC8vIE9wdGlvbmFsLiBJZiBzZXQsIHJlbmRlcnMgYSBzbWFsbGVyIHZpZXcgb2YgdGhlIHdpZGdldFxuICAgIG1pbmlNb2RlOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvLyBVc2VySWQgb2YgdGhlIGN1cnJlbnQgdXNlclxuICAgIHVzZXJJZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIC8vIFVzZXJJZCBvZiB0aGUgZW50aXR5IHRoYXQgYWRkZWQgLyBtb2RpZmllZCB0aGUgd2lkZ2V0XG4gICAgY3JlYXRvclVzZXJJZDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICB3YWl0Rm9ySWZyYW1lTG9hZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgc2hvd01lbnViYXI6IFByb3BUeXBlcy5ib29sLFxuICAgIC8vIE9wdGlvbmFsIG9uRWRpdENsaWNrSGFuZGxlciAob3ZlcnJpZGVzIGRlZmF1bHQgYmVoYXZpb3VyKVxuICAgIG9uRWRpdENsaWNrOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAvLyBPcHRpb25hbCBvbkRlbGV0ZUNsaWNrSGFuZGxlciAob3ZlcnJpZGVzIGRlZmF1bHQgYmVoYXZpb3VyKVxuICAgIG9uRGVsZXRlQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIC8vIE9wdGlvbmFsIG9uTWluaW1pc2VDbGlja0hhbmRsZXJcbiAgICBvbk1pbmltaXNlQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIC8vIE9wdGlvbmFsbHkgaGlkZSB0aGUgdGlsZSB0aXRsZVxuICAgIHNob3dUaXRsZTogUHJvcFR5cGVzLmJvb2wsXG4gICAgLy8gT3B0aW9uYWxseSBoYW5kbGUgbWluaW1pc2UgYnV0dG9uIHBvaW50ZXIgZXZlbnRzIChkZWZhdWx0IGZhbHNlKVxuICAgIGhhbmRsZU1pbmltaXNlUG9pbnRlckV2ZW50czogUHJvcFR5cGVzLmJvb2wsXG4gICAgLy8gT3B0aW9uYWxseSBoaWRlIHRoZSBwb3BvdXQgd2lkZ2V0IGljb25cbiAgICBzaG93UG9wb3V0OiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvLyBJcyB0aGlzIGFuIGluc3RhbmNlIG9mIGEgdXNlciB3aWRnZXRcbiAgICB1c2VyV2lkZ2V0OiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvLyBzZXRzIHRoZSBwb2ludGVyLWV2ZW50cyBwcm9wZXJ0eSBvbiB0aGUgaWZyYW1lXG4gICAgcG9pbnRlckV2ZW50czogUHJvcFR5cGVzLnN0cmluZyxcbn07XG5cbkFwcFRpbGUuZGVmYXVsdFByb3BzID0ge1xuICAgIHdhaXRGb3JJZnJhbWVMb2FkOiB0cnVlLFxuICAgIHNob3dNZW51YmFyOiB0cnVlLFxuICAgIHNob3dUaXRsZTogdHJ1ZSxcbiAgICBzaG93UG9wb3V0OiB0cnVlLFxuICAgIGhhbmRsZU1pbmltaXNlUG9pbnRlckV2ZW50czogZmFsc2UsXG4gICAgdXNlcldpZGdldDogZmFsc2UsXG4gICAgbWluaU1vZGU6IGZhbHNlLFxufTtcbiJdfQ==