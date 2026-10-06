"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

/*
Copyright 2017 Vector Creations Ltd
Copyright 2018 New Vector Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
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
class AppTile extends _react.default.Component {
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

    const iframeFeatures = "microphone; camera; encrypted-media; autoplay; display-capture;";
    const appTileBodyClass = 'mx_AppTileBody' + (this.props.miniMode ? '_mini  ' : ' ');

    const loadingElement = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppLoading_spinner_fadeIn"
    }, /*#__PURE__*/_react.default.createElement(_Spinner.default, {
      message: (0, _languageHandler._t)("Loading...")
    }));

    if (!this.state.hasPermissionToLoad) {
      // only possible for room widgets, can assert this.props.room here
      const isEncrypted = _MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(this.props.room.roomId);

      appTileBody = /*#__PURE__*/_react.default.createElement("div", {
        className: appTileBodyClass
      }, /*#__PURE__*/_react.default.createElement(_AppPermission.default, {
        roomId: this.props.room.roomId,
        creatorUserId: this.props.creatorUserId,
        url: this._sgWidget.embedUrl,
        isRoomEncrypted: isEncrypted,
        onPermissionGranted: this._grantWidgetPermission
      }));
    } else if (this.state.initialising) {
      appTileBody = /*#__PURE__*/_react.default.createElement("div", {
        className: appTileBodyClass + (this.state.loading ? 'mx_AppLoading' : '')
      }, loadingElement);
    } else {
      if (this.isMixedContent()) {
        appTileBody = /*#__PURE__*/_react.default.createElement("div", {
          className: appTileBodyClass
        }, /*#__PURE__*/_react.default.createElement(_AppWarning.default, {
          errorMsg: "Error - Mixed content"
        }));
      } else {
        appTileBody = /*#__PURE__*/_react.default.createElement("div", {
          className: appTileBodyClass + (this.state.loading ? 'mx_AppLoading' : '')
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

}

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
  userWidget: _propTypes.default.bool
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0FwcFRpbGUuanMiXSwibmFtZXMiOlsiQXBwVGlsZSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIl91c2luZ0xvY2FsV2lkZ2V0Iiwicm9vbSIsImN1cnJlbnRseUFsbG93ZWRXaWRnZXRzIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwicm9vbUlkIiwiYXBwIiwiZXZlbnRJZCIsInVuZGVmaW5lZCIsInVzZXJJZCIsImNyZWF0b3JVc2VySWQiLCJoYXNQZXJtaXNzaW9uVG9Mb2FkIiwic3RhdGUiLCJBY3RpdmVXaWRnZXRTdG9yZSIsImRlc3Ryb3lQZXJzaXN0ZW50V2lkZ2V0IiwiaWQiLCJQZXJzaXN0ZWRFbGVtZW50IiwiZGVzdHJveUVsZW1lbnQiLCJfcGVyc2lzdEtleSIsIl9zZ1dpZGdldCIsInN0b3AiLCJzZXRTdGF0ZSIsInJlZiIsImlmcmFtZSIsInN0YXJ0IiwiX3Jlc2V0V2lkZ2V0IiwibG9hZGluZyIsIldpZGdldFR5cGUiLCJKSVRTSSIsIm1hdGNoZXMiLCJ0eXBlIiwid2lkZ2V0QXBpIiwidHJhbnNwb3J0Iiwic2VuZCIsIkVsZW1lbnRXaWRnZXRBY3Rpb25zIiwiQ2xpZW50UmVhZHkiLCJwYXlsb2FkIiwid2lkZ2V0SWQiLCJhY3Rpb24iLCJoYXNDYXBhYmlsaXR5IiwiTWF0cml4Q2FwYWJpbGl0aWVzIiwiU3RpY2tlclNlbmRpbmciLCJkaXMiLCJkaXNwYXRjaCIsImRhdGEiLCJjb25zb2xlIiwid2FybiIsImluZm8iLCJjdXJyZW50IiwibGV2ZWwiLCJmaXJzdFN1cHBvcnRlZExldmVsIiwic2V0VmFsdWUiLCJ0aGVuIiwiX3N0YXJ0V2lkZ2V0IiwiY2F0Y2giLCJlcnIiLCJlcnJvciIsIl9lbmRXaWRnZXRBY3Rpb25zIiwic3JjIiwiZW1iZWRVcmwiLCJPYmplY3QiLCJhc3NpZ24iLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ0YXJnZXQiLCJocmVmIiwicG9wb3V0VXJsIiwicmVsIiwiY2xpY2siLCJtZW51RGlzcGxheWVkIiwiU3RvcEdhcFdpZGdldCIsIm9uIiwiX29uV2lkZ2V0UHJlcGFyZWQiLCJfb25XaWRnZXRSZWFkeSIsIl9nZXROZXdTdGF0ZSIsIl9jb250ZXh0TWVudUJ1dHRvbiIsIl9hbGxvd2VkV2lkZ2V0c1dhdGNoUmVmIiwid2F0Y2hTZXR0aW5nIiwib25BbGxvd2VkV2lkZ2V0c0NoYW5nZSIsIm5ld1Byb3BzIiwiaW5pdGlhbGlzaW5nIiwid2FpdEZvcklmcmFtZUxvYWQiLCJpc01vdW50ZWQiLCJ3aWRnZXRQYWdlVGl0bGUiLCJpc01peGVkQ29udGVudCIsInBhcmVudENvbnRlbnRQcm90b2NvbCIsIndpbmRvdyIsImxvY2F0aW9uIiwicHJvdG9jb2wiLCJ1IiwidXJsIiwicGFyc2UiLCJjaGlsZENvbnRlbnRQcm90b2NvbCIsImNvbXBvbmVudERpZE1vdW50IiwiZGlzcGF0Y2hlclJlZiIsInJlZ2lzdGVyIiwiX29uQWN0aW9uIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bnJlZ2lzdGVyIiwiZ2V0V2lkZ2V0UGVyc2lzdGVuY2UiLCJ1bndhdGNoU2V0dGluZyIsInByZXBhcmUiLCJVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5leHRQcm9wcyIsImZvcmNlRGVzdHJveSIsImZvcm1hdEFwcFRpbGVOYW1lIiwiYXBwVGlsZU5hbWUiLCJuYW1lIiwidHJpbSIsIl9nZXRUaWxlVGl0bGUiLCJ0aXRsZVNwYWNlciIsInRpdGxlIiwicmVuZGVyIiwiYXBwVGlsZUJvZHkiLCJzYW5kYm94RmxhZ3MiLCJpZnJhbWVGZWF0dXJlcyIsImFwcFRpbGVCb2R5Q2xhc3MiLCJtaW5pTW9kZSIsImxvYWRpbmdFbGVtZW50IiwiaXNFbmNyeXB0ZWQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJpc1Jvb21FbmNyeXB0ZWQiLCJfZ3JhbnRXaWRnZXRQZXJtaXNzaW9uIiwiX2lmcmFtZVJlZkNoYW5nZSIsInVzZXJXaWRnZXQiLCJhcHBUaWxlQ2xhc3NlcyIsIm14X0FwcFRpbGVfbWluaSIsImZ1bGxXaWR0aCIsIm14X0FwcFRpbGVGdWxsV2lkdGgiLCJteF9BcHBUaWxlIiwiY29udGV4dE1lbnUiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJfY2xvc2VDb250ZXh0TWVudSIsInNob3dNZW51YmFyIiwicG9pbnRlckV2ZW50cyIsImhhbmRsZU1pbmltaXNlUG9pbnRlckV2ZW50cyIsInNob3dUaXRsZSIsInNob3dQb3BvdXQiLCJfb25Qb3BvdXRXaWRnZXRDbGljayIsIl9vbkNvbnRleHRNZW51Q2xpY2siLCJkaXNwbGF5TmFtZSIsInByb3BUeXBlcyIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJib29sIiwic3RyaW5nIiwib25FZGl0Q2xpY2siLCJmdW5jIiwib25EZWxldGVDbGljayIsIm9uTWluaW1pc2VDbGljayIsImRlZmF1bHRQcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUF3QmUsTUFBTUEsT0FBTixTQUFzQkMsZUFBTUMsU0FBNUIsQ0FBc0M7QUFDakRDLEVBQUFBLFdBQVcsQ0FBQ0MsTUFBRCxFQUFRO0FBQ2YsVUFBTUEsTUFBTixFQURlLENBR2Y7O0FBSGUsK0RBaUJJQSxLQUFELElBQVc7QUFDN0IsVUFBSSxLQUFLQyxpQkFBTCxFQUFKLEVBQThCLE9BQU8sSUFBUDtBQUM5QixVQUFJLENBQUNELEtBQUssQ0FBQ0UsSUFBWCxFQUFpQixPQUFPLElB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QUEsVUFBVSxFQUFFa0IsbUJBQVVHO0FBN0JOLENBQXBCO0FBZ0NBdkosT0FBTyxDQUFDNkosWUFBUixHQUF1QjtBQUNuQnZFLEVBQUFBLGlCQUFpQixFQUFFLElBREE7QUFFbkJxRCxFQUFBQSxXQUFXLEVBQUUsSUFGTTtBQUduQkcsRUFBQUEsU0FBUyxFQUFFLElBSFE7QUFJbkJDLEVBQUFBLFVBQVUsRUFBRSxJQUpPO0FBS25CRixFQUFBQSwyQkFBMkIsRUFBRSxLQUxWO0FBTW5CWCxFQUFBQSxVQUFVLEVBQUUsS0FOTztBQU9uQlIsRUFBQUEsUUFBUSxFQUFFO0FBUFMsQ0FBdkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlUmVmfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEFwcFBlcm1pc3Npb24gZnJvbSAnLi9BcHBQZXJtaXNzaW9uJztcbmltcG9ydCBBcHBXYXJuaW5nIGZyb20gJy4vQXBwV2FybmluZyc7XG5pbXBvcnQgU3Bpbm5lciBmcm9tICcuL1NwaW5uZXInO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IEFjdGl2ZVdpZGdldFN0b3JlIGZyb20gJy4uLy4uLy4uL3N0b3Jlcy9BY3RpdmVXaWRnZXRTdG9yZSc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQge2Fib3ZlTGVmdE9mLCBDb250ZXh0TWVudUJ1dHRvbn0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCBQZXJzaXN0ZWRFbGVtZW50LCB7Z2V0UGVyc2lzdEtleX0gZnJvbSBcIi4vUGVyc2lzdGVkRWxlbWVudFwiO1xuaW1wb3J0IHtXaWRnZXRUeXBlfSBmcm9tIFwiLi4vLi4vLi4vd2lkZ2V0cy9XaWRnZXRUeXBlXCI7XG5pbXBvcnQge1N0b3BHYXBXaWRnZXR9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvd2lkZ2V0cy9TdG9wR2FwV2lkZ2V0XCI7XG5pbXBvcnQge0VsZW1lbnRXaWRnZXRBY3Rpb25zfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3dpZGdldHMvRWxlbWVudFdpZGdldEFjdGlvbnNcIjtcbmltcG9ydCB7TWF0cml4Q2FwYWJpbGl0aWVzfSBmcm9tIFwibWF0cml4LXdpZGdldC1hcGlcIjtcbmltcG9ydCBSb29tV2lkZ2V0Q29udGV4dE1lbnUgZnJvbSBcIi4uL2NvbnRleHRfbWVudXMvV2lkZ2V0Q29udGV4dE1lbnVcIjtcbmltcG9ydCBXaWRnZXRBdmF0YXIgZnJvbSBcIi4uL2F2YXRhcnMvV2lkZ2V0QXZhdGFyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcFRpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICAvLyBUaGUga2V5IHVzZWQgZm9yIFBlcnNpc3RlZEVsZW1lbnRcbiAgICAgICAgdGhpcy5fcGVyc2lzdEtleSA9IGdldFBlcnNpc3RLZXkodGhpcy5wcm9wcy5hcHAuaWQpO1xuICAgICAgICB0aGlzLl9zZ1dpZGdldCA9IG5ldyBTdG9wR2FwV2lkZ2V0KHRoaXMucHJvcHMpO1xuICAgICAgICB0aGlzLl9zZ1dpZGdldC5vbihcInByZXBhcmluZ1wiLCB0aGlzLl9vbldpZGdldFByZXBhcmVkKTtcbiAgICAgICAgdGhpcy5fc2dXaWRnZXQub24oXCJyZWFkeVwiLCB0aGlzLl9vbldpZGdldFJlYWR5KTtcbiAgICAgICAgdGhpcy5pZnJhbWUgPSBudWxsOyAvLyByZWYgdG8gdGhlIGlmcmFtZSAoY2FsbGJhY2sgc3R5bGUpXG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuX2dldE5ld1N0YXRlKHByb3BzKTtcbiAgICAgICAgdGhpcy5fY29udGV4dE1lbnVCdXR0b24gPSBjcmVhdGVSZWYoKTtcblxuICAgICAgICB0aGlzLl9hbGxvd2VkV2lkZ2V0c1dhdGNoUmVmID0gU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJhbGxvd2VkV2lkZ2V0c1wiLCBudWxsLCB0aGlzLm9uQWxsb3dlZFdpZGdldHNDaGFuZ2UpO1xuICAgIH1cblxuICAgIC8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBtYWtlIHRoZSBpbXBhY3Qgb2YgY2FsbGluZyBTZXR0aW5nc1N0b3JlIHNsaWdodGx5IGxlc3NcbiAgICBoYXNQZXJtaXNzaW9uVG9Mb2FkID0gKHByb3BzKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl91c2luZ0xvY2FsV2lkZ2V0KCkpIHJldHVybiB0cnVlO1xuICAgICAgICBpZiAoIXByb3BzLnJvb20pIHJldHVybiB0cnVlOyAvLyB1c2VyIHdpZGdldHMgYWx3YXlzIGhhdmUgcGVybWlzc2lvbnNcblxuICAgICAgICBjb25zdCBjdXJyZW50bHlBbGxvd2VkV2lkZ2V0cyA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhbGxvd2VkV2lkZ2V0c1wiLCBwcm9wcy5yb29tLnJvb21JZCk7XG4gICAgICAgIGlmIChjdXJyZW50bHlBbGxvd2VkV2lkZ2V0c1twcm9wcy5hcHAuZXZlbnRJZF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHByb3BzLnVzZXJJZCA9PT0gcHJvcHMuY3JlYXRvclVzZXJJZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gISFjdXJyZW50bHlBbGxvd2VkV2lkZ2V0c1twcm9wcy5hcHAuZXZlbnRJZF07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldCBpbml0aWFsIGNvbXBvbmVudCBzdGF0ZSB3aGVuIHRoZSBBcHAgd1VybCAod2lkZ2V0IFVSTCkgaXMgYmVpbmcgdXBkYXRlZC5cbiAgICAgKiBDb21wb25lbnQgcHJvcHMgKm11c3QqIGJlIHBhc3NlZCAocmF0aGVyIHRoYW4gcmVseWluZyBvbiB0aGlzLnByb3BzKS5cbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IG5ld1Byb3BzIFRoZSBuZXcgcHJvcGVydGllcyBvZiB0aGUgY29tcG9uZW50XG4gICAgICogQHJldHVybiB7T2JqZWN0fSBVcGRhdGVkIGNvbXBvbmVudCBzdGF0ZSB0byBiZSBzZXQgd2l0aCBzZXRTdGF0ZVxuICAgICAqL1xuICAgIF9nZXROZXdTdGF0ZShuZXdQcm9wcykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaW5pdGlhbGlzaW5nOiB0cnVlLCAvLyBUcnVlIHdoaWxlIHdlIGFyZSBtYW5nbGluZyB0aGUgd2lkZ2V0IFVSTFxuICAgICAgICAgICAgLy8gVHJ1ZSB3aGlsZSB0aGUgaWZyYW1lIGNvbnRlbnQgaXMgbG9hZGluZ1xuICAgICAgICAgICAgbG9hZGluZzogdGhpcy5wcm9wcy53YWl0Rm9ySWZyYW1lTG9hZCAmJiAhUGVyc2lzdGVkRWxlbWVudC5pc01vdW50ZWQodGhpcy5fcGVyc2lzdEtleSksXG4gICAgICAgICAgICAvLyBBc3N1bWUgdGhhdCB3aWRnZXQgaGFzIHBlcm1pc3Npb24gdG8gbG9hZCBpZiB3ZSBhcmUgdGhlIHVzZXIgd2hvXG4gICAgICAgICAgICAvLyBhZGRlZCBpdCB0byB0aGUgcm9vbSwgb3IgaWYgZXhwbGljaXRseSBncmFudGVkIGJ5IHRoZSB1c2VyXG4gICAgICAgICAgICBoYXNQZXJtaXNzaW9uVG9Mb2FkOiB0aGlzLmhhc1Blcm1pc3Npb25Ub0xvYWQobmV3UHJvcHMpLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICB3aWRnZXRQYWdlVGl0bGU6IG5ld1Byb3BzLndpZGdldFBhZ2VUaXRsZSxcbiAgICAgICAgICAgIG1lbnVEaXNwbGF5ZWQ6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIG9uQWxsb3dlZFdpZGdldHNDaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGhhc1Blcm1pc3Npb25Ub0xvYWQgPSB0aGlzLmhhc1Blcm1pc3Npb25Ub0xvYWQodGhpcy5wcm9wcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaGFzUGVybWlzc2lvblRvTG9hZCAmJiAhaGFzUGVybWlzc2lvblRvTG9hZCkge1xuICAgICAgICAgICAgLy8gRm9yY2UgdGhlIHdpZGdldCB0byBiZSBub24tcGVyc2lzdGVudCAoYWJsZSB0byBiZSBkZWxldGVkL2ZvcmdvdHRlbilcbiAgICAgICAgICAgIEFjdGl2ZVdpZGdldFN0b3JlLmRlc3Ryb3lQZXJzaXN0ZW50V2lkZ2V0KHRoaXMucHJvcHMuYXBwLmlkKTtcbiAgICAgICAgICAgIFBlcnNpc3RlZEVsZW1lbnQuZGVzdHJveUVsZW1lbnQodGhpcy5fcGVyc2lzdEtleSk7XG4gICAgICAgICAgICB0aGlzLl9zZ1dpZGdldC5zdG9wKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgaGFzUGVybWlzc2lvblRvTG9hZCB9KTtcbiAgICB9O1xuXG4gICAgaXNNaXhlZENvbnRlbnQoKSB7XG4gICAgICAgIGNvbnN0IHBhcmVudENvbnRlbnRQcm90b2NvbCA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbDtcbiAgICAgICAgY29uc3QgdSA9IHVybC5wYXJzZSh0aGlzLnByb3BzLmFwcC51cmwpO1xuICAgICAgICBjb25zdCBjaGlsZENvbnRlbnRQcm90b2NvbCA9IHUucHJvdG9jb2w7XG4gICAgICAgIGlmIChwYXJlbnRDb250ZW50UHJvdG9jb2wgPT09ICdodHRwczonICYmIGNoaWxkQ29udGVudFByb3RvY29sICE9PSAnaHR0cHM6Jykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiUmVmdXNpbmcgdG8gbG9hZCBtaXhlZC1jb250ZW50IGFwcDpcIixcbiAgICAgICAgICAgIHBhcmVudENvbnRlbnRQcm90b2NvbCwgY2hpbGRDb250ZW50UHJvdG9jb2wsIHdpbmRvdy5sb2NhdGlvbiwgdGhpcy5wcm9wcy5hcHAudXJsKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgLy8gT25seSBmZXRjaCBJTSB0b2tlbiBvbiBtb3VudCBpZiB3ZSdyZSBzaG93aW5nIGFuZCBoYXZlIHBlcm1pc3Npb24gdG8gbG9hZFxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5oYXNQZXJtaXNzaW9uVG9Mb2FkKSB7XG4gICAgICAgICAgICB0aGlzLl9zdGFydFdpZGdldCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2lkZ2V0IGFjdGlvbiBsaXN0ZW5lcnNcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMuX29uQWN0aW9uKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgLy8gV2lkZ2V0IGFjdGlvbiBsaXN0ZW5lcnNcbiAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlclJlZikgZGlzLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcblxuICAgICAgICAvLyBpZiBpdCdzIG5vdCByZW1haW5pbmcgb24gc2NyZWVuLCBnZXQgcmlkIG9mIHRoZSBQZXJzaXN0ZWRFbGVtZW50IGNvbnRhaW5lclxuICAgICAgICBpZiAoIUFjdGl2ZVdpZGdldFN0b3JlLmdldFdpZGdldFBlcnNpc3RlbmNlKHRoaXMucHJvcHMuYXBwLmlkKSkge1xuICAgICAgICAgICAgQWN0aXZlV2lkZ2V0U3RvcmUuZGVzdHJveVBlcnNpc3RlbnRXaWRnZXQodGhpcy5wcm9wcy5hcHAuaWQpO1xuICAgICAgICAgICAgUGVyc2lzdGVkRWxlbWVudC5kZXN0cm95RWxlbWVudCh0aGlzLl9wZXJzaXN0S2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9zZ1dpZGdldCkge1xuICAgICAgICAgICAgdGhpcy5fc2dXaWRnZXQuc3RvcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh0aGlzLl9hbGxvd2VkV2lkZ2V0c1dhdGNoUmVmKTtcbiAgICB9XG5cbiAgICBfcmVzZXRXaWRnZXQobmV3UHJvcHMpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NnV2lkZ2V0KSB7XG4gICAgICAgICAgICB0aGlzLl9zZ1dpZGdldC5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2dXaWRnZXQgPSBuZXcgU3RvcEdhcFdpZGdldChuZXdQcm9wcyk7XG4gICAgICAgIHRoaXMuX3NnV2lkZ2V0Lm9uKFwicHJlcGFyaW5nXCIsIHRoaXMuX29uV2lkZ2V0UHJlcGFyZWQpO1xuICAgICAgICB0aGlzLl9zZ1dpZGdldC5vbihcInJlYWR5XCIsIHRoaXMuX29uV2lkZ2V0UmVhZHkpO1xuICAgICAgICB0aGlzLl9zdGFydFdpZGdldCgpO1xuICAgIH1cblxuICAgIF9zdGFydFdpZGdldCgpIHtcbiAgICAgICAgdGhpcy5fc2dXaWRnZXQucHJlcGFyZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aW5pdGlhbGlzaW5nOiBmYWxzZX0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfaWZyYW1lUmVmQ2hhbmdlID0gKHJlZikgPT4ge1xuICAgICAgICB0aGlzLmlmcmFtZSA9IHJlZjtcbiAgICAgICAgaWYgKHJlZikge1xuICAgICAgICAgICAgdGhpcy5fc2dXaWRnZXQuc3RhcnQocmVmKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2V0V2lkZ2V0KHRoaXMucHJvcHMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBSZXBsYWNlIHdpdGggYXBwcm9wcmlhdGUgbGlmZWN5Y2xlIGV2ZW50XG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGlmIChuZXh0UHJvcHMuYXBwLnVybCAhPT0gdGhpcy5wcm9wcy5hcHAudXJsKSB7XG4gICAgICAgICAgICB0aGlzLl9nZXROZXdTdGF0ZShuZXh0UHJvcHMpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuaGFzUGVybWlzc2lvblRvTG9hZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc2V0V2lkZ2V0KG5leHRQcm9wcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV4dFByb3BzLndpZGdldFBhZ2VUaXRsZSAhPT0gdGhpcy5wcm9wcy53aWRnZXRQYWdlVGl0bGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHdpZGdldFBhZ2VUaXRsZTogbmV4dFByb3BzLndpZGdldFBhZ2VUaXRsZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5kcyBhbGwgd2lkZ2V0IGludGVyYWN0aW9uLCBzdWNoIGFzIGNhbmNlbGxpbmcgY2FsbHMgYW5kIGRpc2FibGluZyB3ZWJjYW1zLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybnMge1Byb21pc2U8Kj59IFJlc29sdmVzIHdoZW4gdGhlIHdpZGdldCBpcyB0ZXJtaW5hdGVkLCBvciB0aW1lb3V0IHBhc3NlZC5cbiAgICAgKi9cbiAgICBhc3luYyBfZW5kV2lkZ2V0QWN0aW9ucygpIHsgLy8gd2lkZ2V0IG1pZ3JhdGlvbiBkZXYgbm90ZTogYXN5bmMgdG8gbWFpbnRhaW4gc2lnbmF0dXJlXG4gICAgICAgIC8vIEhBQ0s6IFRoaXMgaXMgYSByZWFsbHkgZGlydHkgd2F5IHRvIGVuc3VyZSB0aGF0IEppdHNpIGNsZWFucyB1cFxuICAgICAgICAvLyBpdHMgaG9sZCBvbiB0aGUgd2ViY2FtLiBXaXRob3V0IHRoaXMsIHRoZSB3aWRnZXQgaG9sZHMgYSBtZWRpYVxuICAgICAgICAvLyBzdHJlYW0gb3BlbiwgZXZlbiBhZnRlciBkZWF0aC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzczNTFcbiAgICAgICAgaWYgKHRoaXMuaWZyYW1lKSB7XG4gICAgICAgICAgICAvLyBJbiBwcmFjdGljZSB3ZSBjb3VsZCBqdXN0IGRvIGArPSAnJ2AgdG8gdHJpY2sgdGhlIGJyb3dzZXJcbiAgICAgICAgICAgIC8vIGludG8gdGhpbmtpbmcgdGhlIFVSTCBjaGFuZ2VkLCBob3dldmVyIEkgY2FuIGZvcmVzZWUgdGhpc1xuICAgICAgICAgICAgLy8gYmVpbmcgb3B0aW1pemVkIG91dCBieSBhIGJyb3dzZXIuIEluc3RlYWQsIHdlJ2xsIGp1c3QgcG9pbnRcbiAgICAgICAgICAgIC8vIHRoZSBpZnJhbWUgYXQgYSBwYWdlIHRoYXQgaXMgcmVhc29uYWJseSBzYWZlIHRvIHVzZSBpbiB0aGVcbiAgICAgICAgICAgIC8vIGV2ZW50IHRoZSBpZnJhbWUgZG9lc24ndCB3aW5rIGF3YXkuXG4gICAgICAgICAgICAvLyBUaGlzIGlzIHJlbGF0aXZlIHRvIHdoZXJlIHRoZSBFbGVtZW50IGluc3RhbmNlIGlzIGxvY2F0ZWQuXG4gICAgICAgICAgICB0aGlzLmlmcmFtZS5zcmMgPSAnYWJvdXQ6YmxhbmsnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFdpZGdldFR5cGUuSklUU0kubWF0Y2hlcyh0aGlzLnByb3BzLmFwcC50eXBlKSkge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdoYW5ndXBfY29uZmVyZW5jZSd9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERlbGV0ZSB0aGUgd2lkZ2V0IGZyb20gdGhlIHBlcnNpc3RlZCBzdG9yZSBmb3IgZ29vZCBtZWFzdXJlLlxuICAgICAgICBQZXJzaXN0ZWRFbGVtZW50LmRlc3Ryb3lFbGVtZW50KHRoaXMuX3BlcnNpc3RLZXkpO1xuXG4gICAgICAgIHRoaXMuX3NnV2lkZ2V0LnN0b3Aoe2ZvcmNlRGVzdHJveTogdHJ1ZX0pO1xuICAgIH1cblxuICAgIF9vbldpZGdldFByZXBhcmVkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtsb2FkaW5nOiBmYWxzZX0pO1xuICAgIH07XG5cbiAgICBfb25XaWRnZXRSZWFkeSA9ICgpID0+IHtcbiAgICAgICAgaWYgKFdpZGdldFR5cGUuSklUU0kubWF0Y2hlcyh0aGlzLnByb3BzLmFwcC50eXBlKSkge1xuICAgICAgICAgICAgdGhpcy5fc2dXaWRnZXQud2lkZ2V0QXBpLnRyYW5zcG9ydC5zZW5kKEVsZW1lbnRXaWRnZXRBY3Rpb25zLkNsaWVudFJlYWR5LCB7fSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX29uQWN0aW9uID0gcGF5bG9hZCA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLndpZGdldElkID09PSB0aGlzLnByb3BzLmFwcC5pZCkge1xuICAgICAgICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ20uc3RpY2tlcic6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9zZ1dpZGdldC53aWRnZXRBcGkuaGFzQ2FwYWJpbGl0eShNYXRyaXhDYXBhYmlsaXRpZXMuU3RpY2tlclNlbmRpbmcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3Bvc3Rfc3RpY2tlcl9tZXNzYWdlJywgZGF0YTogcGF5bG9hZC5kYXRhfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0lnbm9yaW5nIHN0aWNrZXIgbWVzc2FnZS4gSW52YWxpZCBjYXBhYmlsaXR5Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX2dyYW50V2lkZ2V0UGVybWlzc2lvbiA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gdGhpcy5wcm9wcy5yb29tLnJvb21JZDtcbiAgICAgICAgY29uc29sZS5pbmZvKFwiR3JhbnRpbmcgcGVybWlzc2lvbiBmb3Igd2lkZ2V0IHRvIGxvYWQ6IFwiICsgdGhpcy5wcm9wcy5hcHAuZXZlbnRJZCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYWxsb3dlZFdpZGdldHNcIiwgcm9vbUlkKTtcbiAgICAgICAgY3VycmVudFt0aGlzLnByb3BzLmFwcC5ldmVudElkXSA9IHRydWU7XG4gICAgICAgIGNvbnN0IGxldmVsID0gU2V0dGluZ3NTdG9yZS5maXJzdFN1cHBvcnRlZExldmVsKFwiYWxsb3dlZFdpZGdldHNcIik7XG4gICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJhbGxvd2VkV2lkZ2V0c1wiLCByb29tSWQsIGxldmVsLCBjdXJyZW50KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2hhc1Blcm1pc3Npb25Ub0xvYWQ6IHRydWV9KTtcblxuICAgICAgICAgICAgLy8gRmV0Y2ggYSB0b2tlbiBmb3IgdGhlIGludGVncmF0aW9uIG1hbmFnZXIsIG5vdyB0aGF0IHdlJ3JlIGFsbG93ZWQgdG9cbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0V2lkZ2V0KCk7XG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCByZWFsbHkgbmVlZCB0byBkbyBhbnl0aGluZyBhYm91dCB0aGlzIC0gdGhlIHVzZXIgd2lsbCBqdXN0IGhpdCB0aGUgYnV0dG9uIGFnYWluLlxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZm9ybWF0QXBwVGlsZU5hbWUoKSB7XG4gICAgICAgIGxldCBhcHBUaWxlTmFtZSA9IFwiTm8gbmFtZVwiO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5hcHAubmFtZSAmJiB0aGlzLnByb3BzLmFwcC5uYW1lLnRyaW0oKSkge1xuICAgICAgICAgICAgYXBwVGlsZU5hbWUgPSB0aGlzLnByb3BzLmFwcC5uYW1lLnRyaW0oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXBwVGlsZU5hbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB3ZSdyZSB1c2luZyBhIGxvY2FsIHZlcnNpb24gb2YgdGhlIHdpZGdldCByYXRoZXIgdGhhbiBsb2FkaW5nIHRoZVxuICAgICAqIGFjdHVhbCB3aWRnZXQgVVJMXG4gICAgICogQHJldHVybnMge2Jvb2x9IHRydWUgSWYgdXNpbmcgYSBsb2NhbCB2ZXJzaW9uIG9mIHRoZSB3aWRnZXRcbiAgICAgKi9cbiAgICBfdXNpbmdMb2NhbFdpZGdldCgpIHtcbiAgICAgICAgcmV0dXJuIFdpZGdldFR5cGUuSklUU0kubWF0Y2hlcyh0aGlzLnByb3BzLmFwcC50eXBlKTtcbiAgICB9XG5cbiAgICBfZ2V0VGlsZVRpdGxlKCkge1xuICAgICAgICBjb25zdCBuYW1lID0gdGhpcy5mb3JtYXRBcHBUaWxlTmFtZSgpO1xuICAgICAgICBjb25zdCB0aXRsZVNwYWNlciA9IDxzcGFuPiZuYnNwOy0mbmJzcDs8L3NwYW4+O1xuICAgICAgICBsZXQgdGl0bGUgPSAnJztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUud2lkZ2V0UGFnZVRpdGxlICYmIHRoaXMuc3RhdGUud2lkZ2V0UGFnZVRpdGxlICE9PSB0aGlzLmZvcm1hdEFwcFRpbGVOYW1lKCkpIHtcbiAgICAgICAgICAgIHRpdGxlID0gdGhpcy5zdGF0ZS53aWRnZXRQYWdlVGl0bGU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgPFdpZGdldEF2YXRhciBhcHA9e3RoaXMucHJvcHMuYXBwfSAvPlxuICAgICAgICAgICAgICAgIDxiPnsgbmFtZSB9PC9iPlxuICAgICAgICAgICAgICAgIDxzcGFuPnsgdGl0bGUgPyB0aXRsZVNwYWNlciA6ICcnIH17IHRpdGxlIH08L3NwYW4+XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gVE9ETyByZXBsYWNlIHdpdGggZnVsbCBzY3JlZW4gaW50ZXJhY3Rpb25zXG4gICAgX29uUG9wb3V0V2lkZ2V0Q2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIC8vIEVuc3VyZSBKaXRzaSBjb25mZXJlbmNlcyBhcmUgY2xvc2VkIG9uIHBvcC1vdXQsIHRvIG5vdCBjb25mdXNlIHRoZSB1c2VyIHRvIGpvaW4gdGhlbVxuICAgICAgICAvLyB0d2ljZSBmcm9tIHRoZSBzYW1lIGNvbXB1dGVyLCB3aGljaCBKaXRzaSBjYW4gaGF2ZSBwcm9ibGVtcyB3aXRoIChhdWRpbyBlY2hvL2dhaW4tbG9vcCkuXG4gICAgICAgIGlmIChXaWRnZXRUeXBlLkpJVFNJLm1hdGNoZXModGhpcy5wcm9wcy5hcHAudHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX2VuZFdpZGdldEFjdGlvbnMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pZnJhbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVsb2FkIGlmcmFtZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlmcmFtZS5zcmMgPSB0aGlzLl9zZ1dpZGdldC5lbWJlZFVybDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7fSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVXNpbmcgT2JqZWN0LmFzc2lnbiB3b3JrYXJvdW5kIGFzIHRoZSBmb2xsb3dpbmcgb3BlbnMgaW4gYSBuZXcgd2luZG93IGluc3RlYWQgb2YgYSBuZXcgdGFiLlxuICAgICAgICAvLyB3aW5kb3cub3Blbih0aGlzLl9nZXRQb3BvdXRVcmwoKSwgJ19ibGFuaycsICdub29wZW5lcj15ZXMnKTtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyksXG4gICAgICAgICAgICB7IHRhcmdldDogJ19ibGFuaycsIGhyZWY6IHRoaXMuX3NnV2lkZ2V0LnBvcG91dFVybCwgcmVsOiAnbm9yZWZlcnJlciBub29wZW5lcid9KS5jbGljaygpO1xuICAgIH07XG5cbiAgICBfb25Db250ZXh0TWVudUNsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbWVudURpc3BsYXllZDogdHJ1ZSB9KTtcbiAgICB9O1xuXG4gICAgX2Nsb3NlQ29udGV4dE1lbnUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtZW51RGlzcGxheWVkOiBmYWxzZSB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgYXBwVGlsZUJvZHk7XG5cbiAgICAgICAgLy8gTm90ZSB0aGF0IHRoZXJlIGlzIGFkdmljZSBzYXlpbmcgYWxsb3ctc2NyaXB0cyBzaG91bGRuJ3QgYmUgdXNlZCB3aXRoIGFsbG93LXNhbWUtb3JpZ2luXG4gICAgICAgIC8vIGJlY2F1c2UgdGhhdCB3b3VsZCBhbGxvdyB0aGUgaWZyYW1lIHRvIHByb2dyYW1tYXRpY2FsbHkgcmVtb3ZlIHRoZSBzYW5kYm94IGF0dHJpYnV0ZSwgYnV0XG4gICAgICAgIC8vIHRoaXMgd291bGQgb25seSBiZSBmb3IgY29udGVudCBob3N0ZWQgb24gdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBlbGVtZW50IGNsaWVudDogYW55dGhpbmdcbiAgICAgICAgLy8gaG9zdGVkIG9uIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY2xpZW50IHdpbGwgZ2V0IHRoZSBzYW1lIGFjY2VzcyBhcyBpZiB5b3UgY2xpY2tlZFxuICAgICAgICAvLyBhIGxpbmsgdG8gaXQuXG4gICAgICAgIGNvbnN0IHNhbmRib3hGbGFncyA9IFwiYWxsb3ctZm9ybXMgYWxsb3ctcG9wdXBzIGFsbG93LXBvcHVwcy10by1lc2NhcGUtc2FuZGJveCBcIitcbiAgICAgICAgICAgIFwiYWxsb3ctc2FtZS1vcmlnaW4gYWxsb3ctc2NyaXB0cyBhbGxvdy1wcmVzZW50YXRpb25cIjtcblxuICAgICAgICAvLyBBZGRpdGlvbmFsIGlmcmFtZSBmZWF0dXJlIHBlbWlzc2lvbnNcbiAgICAgICAgLy8gKHNlZSAtIGh0dHBzOi8vc2l0ZXMuZ29vZ2xlLmNvbS9hL2Nocm9taXVtLm9yZy9kZXYvSG9tZS9jaHJvbWl1bS1zZWN1cml0eS9kZXByZWNhdGluZy1wZXJtaXNzaW9ucy1pbi1jcm9zcy1vcmlnaW4taWZyYW1lcyBhbmQgaHR0cHM6Ly93aWNnLmdpdGh1Yi5pby9mZWF0dXJlLXBvbGljeS8pXG4gICAgICAgIGNvbnN0IGlmcmFtZUZlYXR1cmVzID0gXCJtaWNyb3Bob25lOyBjYW1lcmE7IGVuY3J5cHRlZC1tZWRpYTsgYXV0b3BsYXk7IGRpc3BsYXktY2FwdHVyZTtcIjtcblxuICAgICAgICBjb25zdCBhcHBUaWxlQm9keUNsYXNzID0gJ214X0FwcFRpbGVCb2R5JyArICh0aGlzLnByb3BzLm1pbmlNb2RlID8gJ19taW5pICAnIDogJyAnKTtcblxuICAgICAgICBjb25zdCBsb2FkaW5nRWxlbWVudCA9IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQXBwTG9hZGluZ19zcGlubmVyX2ZhZGVJblwiPlxuICAgICAgICAgICAgICAgIDxTcGlubmVyIG1lc3NhZ2U9e190KFwiTG9hZGluZy4uLlwiKX0gLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuaGFzUGVybWlzc2lvblRvTG9hZCkge1xuICAgICAgICAgICAgLy8gb25seSBwb3NzaWJsZSBmb3Igcm9vbSB3aWRnZXRzLCBjYW4gYXNzZXJ0IHRoaXMucHJvcHMucm9vbSBoZXJlXG4gICAgICAgICAgICBjb25zdCBpc0VuY3J5cHRlZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc1Jvb21FbmNyeXB0ZWQodGhpcy5wcm9wcy5yb29tLnJvb21JZCk7XG4gICAgICAgICAgICBhcHBUaWxlQm9keSA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YXBwVGlsZUJvZHlDbGFzc30+XG4gICAgICAgICAgICAgICAgICAgIDxBcHBQZXJtaXNzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tSWQ9e3RoaXMucHJvcHMucm9vbS5yb29tSWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdG9yVXNlcklkPXt0aGlzLnByb3BzLmNyZWF0b3JVc2VySWR9XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw9e3RoaXMuX3NnV2lkZ2V0LmVtYmVkVXJsfVxuICAgICAgICAgICAgICAgICAgICAgICAgaXNSb29tRW5jcnlwdGVkPXtpc0VuY3J5cHRlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUGVybWlzc2lvbkdyYW50ZWQ9e3RoaXMuX2dyYW50V2lkZ2V0UGVybWlzc2lvbn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5pbml0aWFsaXNpbmcpIHtcbiAgICAgICAgICAgIGFwcFRpbGVCb2R5ID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXthcHBUaWxlQm9keUNsYXNzICsgKHRoaXMuc3RhdGUubG9hZGluZyA/ICdteF9BcHBMb2FkaW5nJyA6ICcnKX0+XG4gICAgICAgICAgICAgICAgICAgIHsgbG9hZGluZ0VsZW1lbnQgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzTWl4ZWRDb250ZW50KCkpIHtcbiAgICAgICAgICAgICAgICBhcHBUaWxlQm9keSA9IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2FwcFRpbGVCb2R5Q2xhc3N9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFwcFdhcm5pbmcgZXJyb3JNc2c9XCJFcnJvciAtIE1peGVkIGNvbnRlbnRcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcHBUaWxlQm9keSA9IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2FwcFRpbGVCb2R5Q2xhc3MgKyAodGhpcy5zdGF0ZS5sb2FkaW5nID8gJ214X0FwcExvYWRpbmcnIDogJycpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5sb2FkaW5nICYmIGxvYWRpbmdFbGVtZW50IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxpZnJhbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxvdz17aWZyYW1lRmVhdHVyZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLl9pZnJhbWVSZWZDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjPXt0aGlzLl9zZ1dpZGdldC5lbWJlZFVybH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxvd0Z1bGxTY3JlZW49e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2FuZGJveD17c2FuZGJveEZsYWdzfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy51c2VyV2lkZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFsbCByb29tIHdpZGdldHMgY2FuIHRoZW9yZXRpY2FsbHkgYmUgYWxsb3dlZCB0byByZW1haW4gb24gc2NyZWVuLCBzbyB3ZVxuICAgICAgICAgICAgICAgICAgICAvLyB3cmFwIHRoZW0gYWxsIGluIGEgUGVyc2lzdGVkRWxlbWVudCBmcm9tIHRoZSBnZXQtZ28uIElmIHdlIHdhaXQsIHRoZSBpZnJhbWVcbiAgICAgICAgICAgICAgICAgICAgLy8gd2lsbCBiZSByZS1tb3VudGVkIGxhdGVyLCB3aGljaCBtZWFucyB0aGUgd2lkZ2V0IGhhcyB0byBzdGFydCBvdmVyLCB3aGljaCBpc1xuICAgICAgICAgICAgICAgICAgICAvLyBiYWQuXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQWxzbyB3cmFwIHRoZSBQZXJzaXN0ZWRFbGVtZW50IGluIGEgZGl2IHRvIGZpeCB0aGUgaGVpZ2h0LCBvdGhlcndpc2VcbiAgICAgICAgICAgICAgICAgICAgLy8gQXBwVGlsZSdzIGJvcmRlciBpcyBpbiB0aGUgd3JvbmcgcGxhY2VcbiAgICAgICAgICAgICAgICAgICAgYXBwVGlsZUJvZHkgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0FwcFRpbGVfcGVyc2lzdGVkV3JhcHBlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFBlcnNpc3RlZEVsZW1lbnQgcGVyc2lzdEtleT17dGhpcy5fcGVyc2lzdEtleX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2FwcFRpbGVCb2R5fVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9QZXJzaXN0ZWRFbGVtZW50PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGFwcFRpbGVDbGFzc2VzO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5taW5pTW9kZSkge1xuICAgICAgICAgICAgYXBwVGlsZUNsYXNzZXMgPSB7bXhfQXBwVGlsZV9taW5pOiB0cnVlfTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmZ1bGxXaWR0aCkge1xuICAgICAgICAgICAgYXBwVGlsZUNsYXNzZXMgPSB7bXhfQXBwVGlsZUZ1bGxXaWR0aDogdHJ1ZX07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcHBUaWxlQ2xhc3NlcyA9IHtteF9BcHBUaWxlOiB0cnVlfTtcbiAgICAgICAgfVxuICAgICAgICBhcHBUaWxlQ2xhc3NlcyA9IGNsYXNzTmFtZXMoYXBwVGlsZUNsYXNzZXMpO1xuXG4gICAgICAgIGxldCBjb250ZXh0TWVudTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubWVudURpc3BsYXllZCkge1xuICAgICAgICAgICAgY29udGV4dE1lbnUgPSAoXG4gICAgICAgICAgICAgICAgPFJvb21XaWRnZXRDb250ZXh0TWVudVxuICAgICAgICAgICAgICAgICAgICB7Li4uYWJvdmVMZWZ0T2YodGhpcy5fY29udGV4dE1lbnVCdXR0b24uY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgbnVsbCl9XG4gICAgICAgICAgICAgICAgICAgIGFwcD17dGhpcy5wcm9wcy5hcHB9XG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMuX2Nsb3NlQ29udGV4dE1lbnV9XG4gICAgICAgICAgICAgICAgICAgIHNob3dVbnBpbj17IXRoaXMucHJvcHMudXNlcldpZGdldH1cbiAgICAgICAgICAgICAgICAgICAgdXNlcldpZGdldD17dGhpcy5wcm9wcy51c2VyV2lkZ2V0fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXthcHBUaWxlQ2xhc3Nlc30gaWQ9e3RoaXMucHJvcHMuYXBwLmlkfT5cbiAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuc2hvd01lbnViYXIgJiZcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FwcFRpbGVNZW51QmFyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0FwcFRpbGVNZW51QmFyVGl0bGVcIiBzdHlsZT17e3BvaW50ZXJFdmVudHM6ICh0aGlzLnByb3BzLmhhbmRsZU1pbmltaXNlUG9pbnRlckV2ZW50cyA/ICdhbGwnIDogZmFsc2UpfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuc2hvd1RpdGxlICYmIHRoaXMuX2dldFRpbGVUaXRsZSgpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9BcHBUaWxlTWVudUJhcldpZGdldHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5zaG93UG9wb3V0ICYmIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQXBwVGlsZU1lbnVCYXJfaWNvbkJ1dHRvbiBteF9BcHBUaWxlTWVudUJhcl9pY29uQnV0dG9uX3BvcG91dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KCdQb3BvdXQgd2lkZ2V0Jyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25Qb3BvdXRXaWRnZXRDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgPENvbnRleHRNZW51QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQXBwVGlsZU1lbnVCYXJfaWNvbkJ1dHRvbiBteF9BcHBUaWxlTWVudUJhcl9pY29uQnV0dG9uX21lbnVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIk9wdGlvbnNcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNFeHBhbmRlZD17dGhpcy5zdGF0ZS5tZW51RGlzcGxheWVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0UmVmPXt0aGlzLl9jb250ZXh0TWVudUJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkNvbnRleHRNZW51Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPiB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj4gfVxuICAgICAgICAgICAgICAgIHsgYXBwVGlsZUJvZHkgfVxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIHsgY29udGV4dE1lbnUgfVxuICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICB9XG59XG5cbkFwcFRpbGUuZGlzcGxheU5hbWUgPSAnQXBwVGlsZSc7XG5cbkFwcFRpbGUucHJvcFR5cGVzID0ge1xuICAgIGFwcDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIC8vIElmIHJvb20gaXMgbm90IHNwZWNpZmllZCB0aGVuIGl0IGlzIGFuIGFjY291bnQgbGV2ZWwgd2lkZ2V0XG4gICAgLy8gd2hpY2ggYnlwYXNzZXMgcGVybWlzc2lvbiBwcm9tcHRzIGFzIGl0IHdhcyBhZGRlZCBleHBsaWNpdGx5IGJ5IHRoYXQgdXNlclxuICAgIHJvb206IFByb3BUeXBlcy5vYmplY3QsXG4gICAgLy8gU3BlY2lmeWluZyAnZnVsbFdpZHRoJyBhcyB0cnVlIHdpbGwgcmVuZGVyIHRoZSBhcHAgdGlsZSB0byBmaWxsIHRoZSB3aWR0aCBvZiB0aGUgYXBwIGRyYXdlciBjb250aW5lci5cbiAgICAvLyBUaGlzIHNob3VsZCBiZSBzZXQgdG8gdHJ1ZSB3aGVuIHRoZXJlIGlzIG9ubHkgb25lIHdpZGdldCBpbiB0aGUgYXBwIGRyYXdlciwgb3RoZXJ3aXNlIGl0IHNob3VsZCBiZSBmYWxzZS5cbiAgICBmdWxsV2lkdGg6IFByb3BUeXBlcy5ib29sLFxuICAgIC8vIE9wdGlvbmFsLiBJZiBzZXQsIHJlbmRlcnMgYSBzbWFsbGVyIHZpZXcgb2YgdGhlIHdpZGdldFxuICAgIG1pbmlNb2RlOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvLyBVc2VySWQgb2YgdGhlIGN1cnJlbnQgdXNlclxuICAgIHVzZXJJZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIC8vIFVzZXJJZCBvZiB0aGUgZW50aXR5IHRoYXQgYWRkZWQgLyBtb2RpZmllZCB0aGUgd2lkZ2V0XG4gICAgY3JlYXRvclVzZXJJZDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICB3YWl0Rm9ySWZyYW1lTG9hZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgc2hvd01lbnViYXI6IFByb3BUeXBlcy5ib29sLFxuICAgIC8vIE9wdGlvbmFsIG9uRWRpdENsaWNrSGFuZGxlciAob3ZlcnJpZGVzIGRlZmF1bHQgYmVoYXZpb3VyKVxuICAgIG9uRWRpdENsaWNrOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAvLyBPcHRpb25hbCBvbkRlbGV0ZUNsaWNrSGFuZGxlciAob3ZlcnJpZGVzIGRlZmF1bHQgYmVoYXZpb3VyKVxuICAgIG9uRGVsZXRlQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIC8vIE9wdGlvbmFsIG9uTWluaW1pc2VDbGlja0hhbmRsZXJcbiAgICBvbk1pbmltaXNlQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIC8vIE9wdGlvbmFsbHkgaGlkZSB0aGUgdGlsZSB0aXRsZVxuICAgIHNob3dUaXRsZTogUHJvcFR5cGVzLmJvb2wsXG4gICAgLy8gT3B0aW9uYWxseSBoYW5kbGUgbWluaW1pc2UgYnV0dG9uIHBvaW50ZXIgZXZlbnRzIChkZWZhdWx0IGZhbHNlKVxuICAgIGhhbmRsZU1pbmltaXNlUG9pbnRlckV2ZW50czogUHJvcFR5cGVzLmJvb2wsXG4gICAgLy8gT3B0aW9uYWxseSBoaWRlIHRoZSBwb3BvdXQgd2lkZ2V0IGljb25cbiAgICBzaG93UG9wb3V0OiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvLyBJcyB0aGlzIGFuIGluc3RhbmNlIG9mIGEgdXNlciB3aWRnZXRcbiAgICB1c2VyV2lkZ2V0OiBQcm9wVHlwZXMuYm9vbCxcbn07XG5cbkFwcFRpbGUuZGVmYXVsdFByb3BzID0ge1xuICAgIHdhaXRGb3JJZnJhbWVMb2FkOiB0cnVlLFxuICAgIHNob3dNZW51YmFyOiB0cnVlLFxuICAgIHNob3dUaXRsZTogdHJ1ZSxcbiAgICBzaG93UG9wb3V0OiB0cnVlLFxuICAgIGhhbmRsZU1pbmltaXNlUG9pbnRlckV2ZW50czogZmFsc2UsXG4gICAgdXNlcldpZGdldDogZmFsc2UsXG4gICAgbWluaU1vZGU6IGZhbHNlLFxufTtcbiJdfQ==