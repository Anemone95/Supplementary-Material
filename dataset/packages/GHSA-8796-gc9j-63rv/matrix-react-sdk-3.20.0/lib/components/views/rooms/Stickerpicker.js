"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _AppTile = _interopRequireDefault(require("../elements/AppTile"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../index"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _WidgetUtils = _interopRequireDefault(require("../../../utils/WidgetUtils"));

var _PersistedElement = _interopRequireDefault(require("../elements/PersistedElement"));

var _IntegrationManagers = require("../../../integrations/IntegrationManagers");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _ContextMenu = require("../../structures/ContextMenu");

var _WidgetType = require("../../../widgets/WidgetType");

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _actions = require("../../../dispatcher/actions");

var _WidgetMessagingStore = require("../../../stores/widgets/WidgetMessagingStore");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

// This should be below the dialog level (4000), but above the rest of the UI (1000-2000).
// We sit in a context menu, so this should be given to the context menu.
const STICKERPICKER_Z_INDEX = 3500; // Key to store the widget's AppTile under in PersistedElement

const PERSISTED_ELEMENT_KEY = "stickerPicker";
let Stickerpicker = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.Stickerpicker"), _dec(_class = (_temp = _class2 = class Stickerpicker extends _react.default.Component {
  constructor(props) {
    super(props);
    this._onShowStickersClick = this._onShowStickersClick.bind(this);
    this._onHideStickersClick = this._onHideStickersClick.bind(this);
    this._launchManageIntegrations = this._launchManageIntegrations.bind(this);
    this._removeStickerpickerWidgets = this._removeStickerpickerWidgets.bind(this);
    this._updateWidget = this._updateWidget.bind(this);
    this._onWidgetAction = this._onWidgetAction.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onFinished = this._onFinished.bind(this);
    this.popoverWidth = 300;
    this.popoverHeight = 300; // This is loaded by _acquireScalarClient on an as-needed basis.

    this.scalarClient = null;
    this.state = {
      showStickers: false,
      imError: null,
      stickerpickerX: null,
      stickerpickerY: null,
      stickerpickerWidget: null,
      widgetId: null
    };
  }

  _acquireScalarClient() {
    if (this.scalarClient) return Promise.resolve(this.scalarClient); // TODO: Pick the right manager for the widget

    if (_IntegrationManagers.IntegrationManagers.sharedInstance().hasManager()) {
      this.scalarClient = _IntegrationManagers.IntegrationManagers.sharedInstance().getPrimaryManager().getScalarClient();
      return this.scalarClient.connect().then(() => {
        this.forceUpdate();
        return this.scalarClient;
      }).catch(e => {
        this._imError((0, _languageHandler._td)("Failed to connect to integration manager"), e);
      });
    } else {
      _IntegrationManagers.IntegrationManagers.sharedInstance().openNoManagerDialog();
    }
  }

  async _removeStickerpickerWidgets() {
    const scalarClient = await this._acquireScalarClient();
    console.log('Removing Stickerpicker widgets');

    if (this.state.widgetId) {
      if (scalarClient) {
        scalarClient.disableWidgetAssets(_WidgetType.WidgetType.STICKERPICKER, this.state.widgetId).then(() => {
          console.log('Assets disabled');
        }).catch(err => {
          console.error('Failed to disable assets');
        });
      } else {
        console.error("Cannot disable assets: no scalar client");
      }
    } else {
      console.warn('No widget ID specified, not disabling assets');
    }

    this.setState({
      showStickers: false
    });

    _WidgetUtils.default.removeStickerpickerWidgets().then(() => {
      this.forceUpdate();
    }).catch(e => {
      console.error('Failed to remove sticker picker widget', e);
    });
  }

  componentDidMount() {
    // Close the sticker picker when the window resizes
    window.addEventListener('resize', this._onResize);
    this.dispatcherRef = _dispatcher.default.register(this._onWidgetAction); // Track updates to widget state in account data

    _MatrixClientPeg.MatrixClientPeg.get().on('accountData', this._updateWidget); // Initialise widget state from current account data


    this._updateWidget();
  }

  componentWillUnmount() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (client) client.removeListener('accountData', this._updateWidget);
    window.removeEventListener('resize', this._onResize);

    if (this.dispatcherRef) {
      _dispatcher.default.unregister(this.dispatcherRef);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this._sendVisibilityToWidget(this.state.showStickers);
  }

  _imError(errorMsg, e) {
    console.error(errorMsg, e);
    this.setState({
      showStickers: false,
      imError: (0, _languageHandler._t)(errorMsg)
    });
  }

  _updateWidget() {
    const stickerpickerWidget = _WidgetUtils.default.getStickerpickerWidgets()[0];

    if (!stickerpickerWidget) {
      Stickerpicker.currentWidget = null;
      this.setState({
        stickerpickerWidget: null,
        widgetId: null
      });
      return;
    }

    const currentWidget = Stickerpicker.currentWidget;
    let currentUrl = null;

    if (currentWidget && currentWidget.content && currentWidget.content.url) {
      currentUrl = currentWidget.content.url;
    }

    let newUrl = null;

    if (stickerpickerWidget && stickerpickerWidget.content && stickerpickerWidget.content.url) {
      newUrl = stickerpickerWidget.content.url;
    }

    if (newUrl !== currentUrl) {
      // Destroy the existing frame so a new one can be created
      _PersistedElement.default.destroyElement(PERSISTED_ELEMENT_KEY);
    }

    Stickerpicker.currentWidget = stickerpickerWidget;
    this.setState({
      stickerpickerWidget,
      widgetId: stickerpickerWidget ? stickerpickerWidget.id : null
    });
  }

  _onWidgetAction(payload) {
    switch (payload.action) {
      case "user_widget_updated":
        this.forceUpdate();
        break;

      case "stickerpicker_close":
        this.setState({
          showStickers: false
        });
        break;

      case _actions.Action.AfterRightPanelPhaseChange:
      case "show_left_panel":
      case "hide_left_panel":
        this.setState({
          showStickers: false
        });
        break;
    }
  }

  _defaultStickerpickerContent() {
    return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this._launchManageIntegrations,
      className: "mx_Stickers_contentPlaceholder"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You don't currently have any stickerpacks enabled")), /*#__PURE__*/_react.default.createElement("p", {
      className: "mx_Stickers_addLink"
    }, (0, _languageHandler._t)("Add some now")), /*#__PURE__*/_react.default.createElement("img", {
      src: require("../../../../res/img/stickerpack-placeholder.png"),
      alt: ""
    }));
  }

  _errorStickerpickerContent() {
    return /*#__PURE__*/_react.default.createElement("div", {
      style: {
        "text-align": "center"
      },
      className: "error"
    }, /*#__PURE__*/_react.default.createElement("p", null, " ", this.state.imError, " "));
  }

  _sendVisibilityToWidget(visible) {
    if (!this.state.stickerpickerWidget) return;

    const messaging = _WidgetMessagingStore.WidgetMessagingStore.instance.getMessagingForId(this.state.stickerpickerWidget.id);

    if (messaging && visible !== this._prevSentVisibility) {
      messaging.updateVisibility(visible).catch(err => {
        console.error("Error updating widget visibility: ", err);
      });
      this._prevSentVisibility = visible;
    }
  }

  _getStickerpickerContent() {
    // Handle Integration Manager errors
    if (this.state._imError) {
      return this._errorStickerpickerContent();
    } // Stickers
    // TODO - Add support for Stickerpickers from multiple app stores.
    // Render content from multiple stickerpack sources, each within their
    // own iframe, within the stickerpicker UI element.


    const stickerpickerWidget = this.state.stickerpickerWidget;
    let stickersContent; // Use a separate ReactDOM tree to render the AppTile separately so that it persists and does
    // not unmount when we (a) close the sticker picker (b) switch rooms. It's properties are still
    // updated.

    const PersistedElement = sdk.getComponent("elements.PersistedElement"); // Load stickerpack content

    if (stickerpickerWidget && stickerpickerWidget.content && stickerpickerWidget.content.url) {
      // Set default name
      stickerpickerWidget.content.name = stickerpickerWidget.name || (0, _languageHandler._t)("Stickerpack"); // FIXME: could this use the same code as other apps?

      const stickerApp = {
        id: stickerpickerWidget.id,
        url: stickerpickerWidget.content.url,
        name: stickerpickerWidget.content.name,
        type: stickerpickerWidget.content.type,
        data: stickerpickerWidget.content.data
      };
      stickersContent = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Stickers_content_container"
      }, /*#__PURE__*/_react.default.createElement("div", {
        id: "stickersContent",
        className: "mx_Stickers_content",
        style: {
          border: 'none',
          height: this.popoverHeight,
          width: this.popoverWidth
        }
      }, /*#__PURE__*/_react.default.createElement(PersistedElement, {
        persistKey: PERSISTED_ELEMENT_KEY,
        zIndex: STICKERPICKER_Z_INDEX
      }, /*#__PURE__*/_react.default.createElement(_AppTile.default, {
        app: stickerApp,
        room: this.props.room,
        fullWidth: true,
        userId: _MatrixClientPeg.MatrixClientPeg.get().credentials.userId,
        creatorUserId: stickerpickerWidget.sender || _MatrixClientPeg.MatrixClientPeg.get().credentials.userId,
        waitForIframeLoad: true,
        showMenubar: true,
        onEditClick: this._launchManageIntegrations,
        onDeleteClick: this._removeStickerpickerWidgets,
        showTitle: false,
        showCancel: false,
        showPopout: false,
        onMinimiseClick: this._onHideStickersClick,
        handleMinimisePointerEvents: true,
        userWidget: true
      }))));
    } else {
      // Default content to show if stickerpicker widget not added
      stickersContent = this._defaultStickerpickerContent();
    }

    return stickersContent;
  } // Dev note: this isn't jsdoc because it's angry.

  /*
   * Show the sticker picker overlay
   * If no stickerpacks have been added, show a link to the integration manager add sticker packs page.
   */


  _onShowStickersClick(e) {
    if (!_SettingsStore.default.getValue("integrationProvisioning")) {
      // Intercept this case and spawn a warning.
      return _IntegrationManagers.IntegrationManagers.sharedInstance().showDisabledDialog();
    } // XXX: Simplify by using a context menu that is positioned relative to the sticker picker button


    const buttonRect = e.target.getBoundingClientRect(); // The window X and Y offsets are to adjust position when zoomed in to page

    let x = buttonRect.right + window.pageXOffset - 41; // Amount of horizontal space between the right of menu and the right of the viewport
    //  (10 = amount needed to make chevron centrally aligned)

    const rightPad = 10; // When the sticker picker would be displayed off of the viewport, adjust x
    //  (302 = width of context menu, including borders)

    x = Math.min(x, document.body.clientWidth - (302 + rightPad)); // Offset the chevron location, which is relative to the left of the context menu
    //  (10 = offset when context menu would not be displayed off viewport)
    //  (2 = context menu borders)

    const stickerPickerChevronOffset = Math.max(10, 2 + window.pageXOffset + buttonRect.left - x);
    const y = buttonRect.top + buttonRect.height / 2 + window.pageYOffset - 19;
    this.setState({
      showStickers: true,
      stickerPickerX: x,
      stickerPickerY: y,
      stickerPickerChevronOffset
    });
  }
  /**
   * Trigger hiding of the sticker picker overlay
   * @param  {Event} ev Event that triggered the function call
   */


  _onHideStickersClick(ev) {
    this.setState({
      showStickers: false
    });
  }
  /**
   * Called when the window is resized
   */


  _onResize() {
    this.setState({
      showStickers: false
    });
  }
  /**
   * The stickers picker was hidden
   */


  _onFinished() {
    this.setState({
      showStickers: false
    });
  }
  /**
   * Launch the integration manager on the stickers integration page
   */


  _launchManageIntegrations() {
    // TODO: Open the right integration manager for the widget
    if (_SettingsStore.default.getValue("feature_many_integration_managers")) {
      _IntegrationManagers.IntegrationManagers.sharedInstance().openAll(this.props.room, `type_${_WidgetType.WidgetType.STICKERPICKER.preferred}`, this.state.widgetId);
    } else {
      _IntegrationManagers.IntegrationManagers.sharedInstance().getPrimaryManager().open(this.props.room, `type_${_WidgetType.WidgetType.STICKERPICKER.preferred}`, this.state.widgetId);
    }
  }

  render() {
    let stickerPicker;
    let stickersButton;
    const className = (0, _classnames.default)("mx_MessageComposer_button", "mx_MessageComposer_stickers", "mx_Stickers_hideStickers", "mx_MessageComposer_button_highlight");

    if (this.state.showStickers) {
      // Show hide-stickers button
      stickersButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        id: "stickersButton",
        key: "controls_hide_stickers",
        className: className,
        onClick: this._onHideStickersClick,
        active: this.state.showStickers,
        title: (0, _languageHandler._t)("Hide Stickers")
      });
      const GenericElementContextMenu = sdk.getComponent('context_menus.GenericElementContextMenu');
      stickerPicker = /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenu, {
        chevronOffset: this.state.stickerPickerChevronOffset,
        chevronFace: "bottom",
        left: this.state.stickerPickerX,
        top: this.state.stickerPickerY,
        menuWidth: this.popoverWidth,
        menuHeight: this.popoverHeight,
        onFinished: this._onFinished,
        menuPaddingTop: 0,
        menuPaddingLeft: 0,
        menuPaddingRight: 0,
        zIndex: STICKERPICKER_Z_INDEX
      }, /*#__PURE__*/_react.default.createElement(GenericElementContextMenu, {
        element: this._getStickerpickerContent(),
        onResize: this._onFinished
      }));
    } else {
      // Show show-stickers button
      stickersButton = /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
        id: "stickersButton",
        key: "controls_show_stickers",
        className: "mx_MessageComposer_button mx_MessageComposer_stickers",
        onClick: this._onShowStickersClick,
        title: (0, _languageHandler._t)("Show Stickers")
      });
    }

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, stickersButton, stickerPicker);
  }

}, (0, _defineProperty2.default)(_class2, "currentWidget", void 0), _temp)) || _class);
exports.default = Stickerpicker;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1N0aWNrZXJwaWNrZXIuanMiXSwibmFtZXMiOlsiU1RJQ0tFUlBJQ0tFUl9aX0lOREVYIiwiUEVSU0lTVEVEX0VMRU1FTlRfS0VZIiwiU3RpY2tlcnBpY2tlciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIl9vblNob3dTdGlja2Vyc0NsaWNrIiwiYmluZCIsIl9vbkhpZGVTdGlja2Vyc0NsaWNrIiwiX2xhdW5jaE1hbmFnZUludGVncmF0aW9ucyIsIl9yZW1vdmVTdGlja2VycGlja2VyV2lkZ2V0cyIsIl91cGRhdGVXaWRnZXQiLCJfb25XaWRnZXRBY3Rpb24iLCJfb25SZXNpemUiLCJfb25GaW5pc2hlZCIsInBvcG92ZXJXaWR0aCIsInBvcG92ZXJIZWlnaHQiLCJzY2FsYXJDbGllbnQiLCJzdGF0ZSIsInNob3dTdGlja2VycyIsImltRXJyb3IiLCJzdGlja2VycGlja2VyWCIsInN0aWNrZXJwaWNrZXJZIiwic3RpY2tlcnBpY2tlcldpZGdldCIsIndpZGdldElkIiwiX2FjcXVpcmVTY2FsYXJDbGllbnQiLCJQcm9taXNlIiwicmVzb2x2ZSIsIkludGVncmF0aW9uTWFuYWdlcnMiLCJzaGFyZWRJbnN0YW5jZSIsImhhc01hbmFnZXIiLCJnZXRQcmltYXJ5TWFuYWdlciIsImdldFNjYWxhckNsaWVudCIsImNvbm5lY3QiLCJ0aGVuIiwiZm9yY2VVcGRhdGUiLCJjYXRjaCIsImUiLCJfaW1FcnJvciIsIm9wZW5Ob01hbmFnZXJEaWFsb2ciLCJjb25zb2xlIiwibG9nIiwiZGlzYWJsZVdpZGdldEFzc2V0cyIsIldpZGdldFR5cGUiLCJTVElDS0VSUElDS0VSIiwiZXJyIiwiZXJyb3IiLCJ3YXJuIiwic2V0U3RhdGUiLCJXaWRnZXRVdGlscyIsInJlbW92ZVN0aWNrZXJwaWNrZXJXaWRnZXRzIiwiY29tcG9uZW50RGlkTW91bnQiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiZGlzcGF0Y2hlclJlZiIsImRpcyIsInJlZ2lzdGVyIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwib24iLCJjb21wb25lbnRXaWxsVW5tb3VudCIsImNsaWVudCIsInJlbW92ZUxpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInVucmVnaXN0ZXIiLCJjb21wb25lbnREaWRVcGRhdGUiLCJwcmV2UHJvcHMiLCJwcmV2U3RhdGUiLCJfc2VuZFZpc2liaWxpdHlUb1dpZGdldCIsImVycm9yTXNnIiwiZ2V0U3RpY2tlcnBpY2tlcldpZGdldHMiLCJjdXJyZW50V2lkZ2V0IiwiY3VycmVudFVybCIsImNvbnRlbnQiLCJ1cmwiLCJuZXdVcmwiLCJQZXJzaXN0ZWRFbGVtZW50IiwiZGVzdHJveUVsZW1lbnQiLCJpZCIsInBheWxvYWQiLCJhY3Rpb24iLCJBY3Rpb24iLCJBZnRlclJpZ2h0UGFuZWxQaGFzZUNoYW5nZSIsIl9kZWZhdWx0U3RpY2tlcnBpY2tlckNvbnRlbnQiLCJyZXF1aXJlIiwiX2Vycm9yU3RpY2tlcnBpY2tlckNvbnRlbnQiLCJ2aXNpYmxlIiwibWVzc2FnaW5nIiwiV2lkZ2V0TWVzc2FnaW5nU3RvcmUiLCJpbnN0YW5jZSIsImdldE1lc3NhZ2luZ0ZvcklkIiwiX3ByZXZTZW50VmlzaWJpbGl0eSIsInVwZGF0ZVZpc2liaWxpdHkiLCJfZ2V0U3RpY2tlcnBpY2tlckNvbnRlbnQiLCJzdGlja2Vyc0NvbnRlbnQiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJuYW1lIiwic3RpY2tlckFwcCIsInR5cGUiLCJkYXRhIiwiYm9yZGVyIiwiaGVpZ2h0Iiwid2lkdGgiLCJyb29tIiwiY3JlZGVudGlhbHMiLCJ1c2VySWQiLCJzZW5kZXIiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJzaG93RGlzYWJsZWREaWFsb2ciLCJidXR0b25SZWN0IiwidGFyZ2V0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwieCIsInJpZ2h0IiwicGFnZVhPZmZzZXQiLCJyaWdodFBhZCIsIk1hdGgiLCJtaW4iLCJkb2N1bWVudCIsImJvZHkiLCJjbGllbnRXaWR0aCIsInN0aWNrZXJQaWNrZXJDaGV2cm9uT2Zmc2V0IiwibWF4IiwibGVmdCIsInkiLCJ0b3AiLCJwYWdlWU9mZnNldCIsInN0aWNrZXJQaWNrZXJYIiwic3RpY2tlclBpY2tlclkiLCJldiIsIm9wZW5BbGwiLCJwcmVmZXJyZWQiLCJvcGVuIiwicmVuZGVyIiwic3RpY2tlclBpY2tlciIsInN0aWNrZXJzQnV0dG9uIiwiY2xhc3NOYW1lIiwiR2VuZXJpY0VsZW1lbnRDb250ZXh0TWVudSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUE7QUFDQTtBQUNBLE1BQU1BLHFCQUFxQixHQUFHLElBQTlCLEMsQ0FFQTs7QUFDQSxNQUFNQyxxQkFBcUIsR0FBRyxlQUE5QjtJQUdxQkMsYSxXQURwQixnREFBcUIsMkJBQXJCLEMsbUNBQUQsTUFDcUJBLGFBRHJCLFNBQzJDQyxlQUFNQyxTQURqRCxDQUMyRDtBQUd2REMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBQ0EsU0FBS0Msb0JBQUwsR0FBNEIsS0FBS0Esb0JBQUwsQ0FBMEJDLElBQTFCLENBQStCLElBQS9CLENBQTVCO0FBQ0EsU0FBS0Msb0JBQUwsR0FBNEIsS0FBS0Esb0JBQUwsQ0FBMEJELElBQTFCLENBQStCLElBQS9CLENBQTVCO0FBQ0EsU0FBS0UseUJBQUwsR0FBaUMsS0FBS0EseUJBQUwsQ0FBK0JGLElBQS9CLENBQW9DLElBQXBDLENBQWpDO0FBQ0EsU0FBS0csMkJBQUwsR0FBbUMsS0FBS0EsMkJBQUwsQ0FBaUNILElBQWpDLENBQXNDLElBQXRDLENBQW5DO0FBQ0EsU0FBS0ksYUFBTCxHQUFxQixLQUFLQSxhQUFMLENBQW1CSixJQUFuQixDQUF3QixJQUF4QixDQUFyQjtBQUNBLFNBQUtLLGVBQUwsR0FBdUIsS0FBS0EsZUFBTCxDQUFxQkwsSUFBckIsQ0FBMEIsSUFBMUIsQ0FBdkI7QUFDQSxTQUFLTSxTQUFMLEdBQWlCLEtBQUtBLFNBQUwsQ0FBZU4sSUFBZixDQUFvQixJQUFwQixDQUFqQjtBQUNBLFNBQUtPLFdBQUwsR0FBbUIsS0FBS0EsV0FBTCxDQUFpQlAsSUFBakIsQ0FBc0IsSUFBdEIsQ0FBbkI7QUFFQSxTQUFLUSxZQUFMLEdBQW9CLEdBQXBCO0FBQ0EsU0FBS0MsYUFBTCxHQUFxQixHQUFyQixDQVplLENBY2Y7O0FBQ0EsU0FBS0MsWUFBTCxHQUFvQixJQUFwQjtBQUVBLFNBQUtDLEtBQUwsR0FBYTtBQUNUQyxNQUFBQSxZQUFZLEVBQUUsS0FETDtBQUVUQyxNQUFBQSxPQUFPLEVBQUUsSUFGQTtBQUdUQyxNQUFBQSxjQUFjLEVBQUUsSUFIUDtBQUlUQyxNQUFBQSxjQUFjLEVBQUUsSUFKUDtBQUtUQyxNQUFBQSxtQkFBbUIsRUFBRSxJQUxaO0FBTVRDLE1BQUFBLFFBQVEsRUFBRTtBQU5ELEtBQWI7QUFRSDs7QUFFREMsRUFBQUEsb0JBQW9CLEdBQUc7QUFDbkIsUUFBSSxLQUFLUixZQUFULEVBQXVCLE9BQU9TLE9BQU8sQ0FBQ0MsT0FBUixDQUFnQixLQUFLVixZQUFyQixDQUFQLENBREosQ0FFbkI7O0FBQ0EsUUFBSVcseUNBQW9CQyxjQUFwQixHQUFxQ0MsVUFBckMsRUFBSixFQUF1RDtBQUNuRCxXQUFLYixZQUFMLEdBQW9CVyx5Q0FBb0JDLGNBQXBCLEdBQXFDRSxpQkFBckMsR0FBeURDLGVBQXpELEVBQXBCO0FBQ0EsYUFBTyxLQUFLZixZQUFMLENBQWtCZ0IsT0FBbEIsR0FBNEJDLElBQTVCLENBQWlDLE1BQU07QUFDMUMsYUFBS0MsV0FBTDtBQUNBLGVBQU8sS0FBS2xCLFlBQVo7QUFDSCxPQUhNLEVBR0ptQixLQUhJLENBR0dDLENBQUQsSUFBTztBQUNaLGFBQUtDLFFBQUwsQ0FBYywwQkFBSSwwQ0FBSixDQUFkLEVBQStERCxDQUEvRDtBQUNILE9BTE0sQ0FBUDtBQU1ILEtBUkQsTUFRTztBQUNIVCwrQ0FBb0JDLGNBQXBCLEdBQXFDVSxtQkFBckM7QUFDSDtBQUNKOztBQUVELFFBQU03QiwyQkFBTixHQUFvQztBQUNoQyxVQUFNTyxZQUFZLEdBQUcsTUFBTSxLQUFLUSxvQkFBTCxFQUEzQjtBQUNBZSxJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxnQ0FBWjs7QUFDQSxRQUFJLEtBQUt2QixLQUFMLENBQVdNLFFBQWYsRUFBeUI7QUFDckIsVUFBSVAsWUFBSixFQUFrQjtBQUNkQSxRQUFBQSxZQUFZLENBQUN5QixtQkFBYixDQUFpQ0MsdUJBQVdDLGFBQTVDLEVBQTJELEtBQUsxQixLQUFMLENBQVdNLFFBQXRFLEVBQWdGVSxJQUFoRixDQUFxRixNQUFNO0FBQ3ZGTSxVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxpQkFBWjtBQUNILFNBRkQsRUFFR0wsS0FGSCxDQUVVUyxHQUFELElBQVM7QUFDZEwsVUFBQUEsT0FBTyxDQUFDTSxLQUFSLENBQWMsMEJBQWQ7QUFDSCxTQUpEO0FBS0gsT0FORCxNQU1PO0FBQ0hOLFFBQUFBLE9BQU8sQ0FBQ00sS0FBUixDQUFjLHlDQUFkO0FBQ0g7QUFDSixLQVZELE1BVU87QUFDSE4sTUFBQUEsT0FBTyxDQUFDTyxJQUFSLENBQWEsOENBQWI7QUFDSDs7QUFFRCxTQUFLQyxRQUFMLENBQWM7QUFBQzdCLE1BQUFBLFlBQVksRUFBRTtBQUFmLEtBQWQ7O0FBQ0E4Qix5QkFBWUMsMEJBQVosR0FBeUNoQixJQUF6QyxDQUE4QyxNQUFNO0FBQ2hELFdBQUtDLFdBQUw7QUFDSCxLQUZELEVBRUdDLEtBRkgsQ0FFVUMsQ0FBRCxJQUFPO0FBQ1pHLE1BQUFBLE9BQU8sQ0FBQ00sS0FBUixDQUFjLHdDQUFkLEVBQXdEVCxDQUF4RDtBQUNILEtBSkQ7QUFLSDs7QUFFRGMsRUFBQUEsaUJBQWlCLEdBQUc7QUFDaEI7QUFDQUMsSUFBQUEsTUFBTSxDQUFDQyxnQkFBUCxDQUF3QixRQUF4QixFQUFrQyxLQUFLeEMsU0FBdkM7QUFFQSxTQUFLeUMsYUFBTCxHQUFxQkMsb0JBQUlDLFFBQUosQ0FBYSxLQUFLNUMsZUFBbEIsQ0FBckIsQ0FKZ0IsQ0FNaEI7O0FBQ0E2QyxxQ0FBZ0JDLEdBQWhCLEdBQXNCQyxFQUF0QixDQUF5QixhQUF6QixFQUF3QyxLQUFLaEQsYUFBN0MsRUFQZ0IsQ0FTaEI7OztBQUNBLFNBQUtBLGFBQUw7QUFDSDs7QUFFRGlELEVBQUFBLG9CQUFvQixHQUFHO0FBQ25CLFVBQU1DLE1BQU0sR0FBR0osaUNBQWdCQyxHQUFoQixFQUFmOztBQUNBLFFBQUlHLE1BQUosRUFBWUEsTUFBTSxDQUFDQyxjQUFQLENBQXNCLGFBQXRCLEVBQXFDLEtBQUtuRCxhQUExQztBQUVaeUMsSUFBQUEsTUFBTSxDQUFDVyxtQkFBUCxDQUEyQixRQUEzQixFQUFxQyxLQUFLbEQsU0FBMUM7O0FBQ0EsUUFBSSxLQUFLeUMsYUFBVCxFQUF3QjtBQUNwQkMsMEJBQUlTLFVBQUosQ0FBZSxLQUFLVixhQUFwQjtBQUNIO0FBQ0o7O0FBRURXLEVBQUFBLGtCQUFrQixDQUFDQyxTQUFELEVBQVlDLFNBQVosRUFBdUI7QUFDckMsU0FBS0MsdUJBQUwsQ0FBNkIsS0FBS2xELEtBQUwsQ0FBV0MsWUFBeEM7QUFDSDs7QUFFRG1CLEVBQUFBLFFBQVEsQ0FBQytCLFFBQUQsRUFBV2hDLENBQVgsRUFBYztBQUNsQkcsSUFBQUEsT0FBTyxDQUFDTSxLQUFSLENBQWN1QixRQUFkLEVBQXdCaEMsQ0FBeEI7QUFDQSxTQUFLVyxRQUFMLENBQWM7QUFDVjdCLE1BQUFBLFlBQVksRUFBRSxLQURKO0FBRVZDLE1BQUFBLE9BQU8sRUFBRSx5QkFBR2lELFFBQUg7QUFGQyxLQUFkO0FBSUg7O0FBRUQxRCxFQUFBQSxhQUFhLEdBQUc7QUFDWixVQUFNWSxtQkFBbUIsR0FBRzBCLHFCQUFZcUIsdUJBQVosR0FBc0MsQ0FBdEMsQ0FBNUI7O0FBQ0EsUUFBSSxDQUFDL0MsbUJBQUwsRUFBMEI7QUFDdEJ0QixNQUFBQSxhQUFhLENBQUNzRSxhQUFkLEdBQThCLElBQTlCO0FBQ0EsV0FBS3ZCLFFBQUwsQ0FBYztBQUFDekIsUUFBQUEsbUJBQW1CLEVBQUUsSUFBdEI7QUFBNEJDLFFBQUFBLFFBQVEsRUFBRTtBQUF0QyxPQUFkO0FBQ0E7QUFDSDs7QUFFRCxVQUFNK0MsYUFBYSxHQUFHdEUsYUFBYSxDQUFDc0UsYUFBcEM7QUFDQSxRQUFJQyxVQUFVLEdBQUcsSUFBakI7O0FBQ0EsUUFBSUQsYUFBYSxJQUFJQSxhQUFhLENBQUNFLE9BQS9CLElBQTBDRixhQUFhLENBQUNFLE9BQWQsQ0FBc0JDLEdBQXBFLEVBQXlFO0FBQ3JFRixNQUFBQSxVQUFVLEdBQUdELGFBQWEsQ0FBQ0UsT0FBZCxDQUFzQkMsR0FBbkM7QUFDSDs7QUFFRCxRQUFJQyxNQUFNLEdBQUcsSUFBYjs7QUFDQSxRQUFJcEQsbUJBQW1CLElBQUlBLG1CQUFtQixDQUFDa0QsT0FBM0MsSUFBc0RsRCxtQkFBbUIsQ0FBQ2tELE9BQXBCLENBQTRCQyxHQUF0RixFQUEyRjtBQUN2RkMsTUFBQUEsTUFBTSxHQUFHcEQsbUJBQW1CLENBQUNrRCxPQUFwQixDQUE0QkMsR0FBckM7QUFDSDs7QUFFRCxRQUFJQyxNQUFNLEtBQUtILFVBQWYsRUFBMkI7QUFDdkI7QUFDQUksZ0NBQWlCQyxjQUFqQixDQUFnQzdFLHFCQUFoQztBQUNIOztBQUVEQyxJQUFBQSxhQUFhLENBQUNzRSxhQUFkLEdBQThCaEQsbUJBQTlCO0FBQ0EsU0FBS3lCLFFBQUwsQ0FBYztBQUNWekIsTUFBQUEsbUJBRFU7QUFFVkMsTUFBQUEsUUFBUSxFQUFFRCxtQkFBbUIsR0FBR0EsbUJBQW1CLENBQUN1RCxFQUF2QixHQUE0QjtBQUYvQyxLQUFkO0FBSUg7O0FBRURsRSxFQUFBQSxlQUFlLENBQUNtRSxPQUFELEVBQVU7QUFDckIsWUFBUUEsT0FBTyxDQUFDQyxNQUFoQjtBQUNJLFdBQUsscUJBQUw7QUFDSSxhQUFLN0MsV0FBTDtBQUNBOztBQUNKLFdBQUsscUJBQUw7QUFDSSxhQUFLYSxRQUFMLENBQWM7QUFBQzdCLFVBQUFBLFlBQVksRUFBRTtBQUFmLFNBQWQ7QUFDQTs7QUFDSixXQUFLOEQsZ0JBQU9DLDBCQUFaO0FBQ0EsV0FBSyxpQkFBTDtBQUNBLFdBQUssaUJBQUw7QUFDSSxhQUFLbEMsUUFBTCxDQUFjO0FBQUM3QixVQUFBQSxZQUFZLEVBQUU7QUFBZixTQUFkO0FBQ0E7QUFYUjtBQWFIOztBQUVEZ0UsRUFBQUEsNEJBQTRCLEdBQUc7QUFDM0Isd0JBQ0ksNkJBQUMseUJBQUQ7QUFBa0IsTUFBQSxPQUFPLEVBQUUsS0FBSzFFLHlCQUFoQztBQUNJLE1BQUEsU0FBUyxFQUFDO0FBRGQsb0JBRUksd0NBQUsseUJBQUcsbURBQUgsQ0FBTCxDQUZKLGVBR0k7QUFBRyxNQUFBLFNBQVMsRUFBQztBQUFiLE9BQXFDLHlCQUFHLGNBQUgsQ0FBckMsQ0FISixlQUlJO0FBQUssTUFBQSxHQUFHLEVBQUUyRSxPQUFPLENBQUMsaURBQUQsQ0FBakI7QUFBc0UsTUFBQSxHQUFHLEVBQUM7QUFBMUUsTUFKSixDQURKO0FBUUg7O0FBRURDLEVBQUFBLDBCQUEwQixHQUFHO0FBQ3pCLHdCQUNJO0FBQUssTUFBQSxLQUFLLEVBQUU7QUFBQyxzQkFBYztBQUFmLE9BQVo7QUFBc0MsTUFBQSxTQUFTLEVBQUM7QUFBaEQsb0JBQ0ksNkNBQU0sS0FBS25FLEtBQUwsQ0FBV0UsT0FBakIsTUFESixDQURKO0FBS0g7O0FBRURnRCxFQUFBQSx1QkFBdUIsQ0FBQ2tCLE9BQUQsRUFBVTtBQUM3QixRQUFJLENBQUMsS0FBS3BFLEtBQUwsQ0FBV0ssbUJBQWhCLEVBQXFDOztBQUNyQyxVQUFNZ0UsU0FBUyxHQUFHQywyQ0FBcUJDLFFBQXJCLENBQThCQyxpQkFBOUIsQ0FBZ0QsS0FBS3hFLEtBQUwsQ0FBV0ssbUJBQVgsQ0FBK0J1RCxFQUEvRSxDQUFsQjs7QUFDQSxRQUFJUyxTQUFTLElBQUlELE9BQU8sS0FBSyxLQUFLSyxtQkFBbEMsRUFBdUQ7QUFDbkRKLE1BQUFBLFNBQVMsQ0FBQ0ssZ0JBQVYsQ0FBMkJOLE9BQTNCLEVBQW9DbEQsS0FBcEMsQ0FBMENTLEdBQUcsSUFBSTtBQUM3Q0wsUUFBQUEsT0FBTyxDQUFDTSxLQUFSLENBQWMsb0NBQWQsRUFBb0RELEdBQXBEO0FBQ0gsT0FGRDtBQUdBLFdBQUs4QyxtQkFBTCxHQUEyQkwsT0FBM0I7QUFDSDtBQUNKOztBQUVETyxFQUFBQSx3QkFBd0IsR0FBRztBQUN2QjtBQUNBLFFBQUksS0FBSzNFLEtBQUwsQ0FBV29CLFFBQWYsRUFBeUI7QUFDckIsYUFBTyxLQUFLK0MsMEJBQUwsRUFBUDtBQUNILEtBSnNCLENBTXZCO0FBQ0E7QUFDQTtBQUNBOzs7QUFDQSxVQUFNOUQsbUJBQW1CLEdBQUcsS0FBS0wsS0FBTCxDQUFXSyxtQkFBdkM7QUFDQSxRQUFJdUUsZUFBSixDQVh1QixDQWF2QjtBQUNBO0FBQ0E7O0FBQ0EsVUFBTWxCLGdCQUFnQixHQUFHbUIsR0FBRyxDQUFDQyxZQUFKLENBQWlCLDJCQUFqQixDQUF6QixDQWhCdUIsQ0FrQnZCOztBQUNBLFFBQUl6RSxtQkFBbUIsSUFBSUEsbUJBQW1CLENBQUNrRCxPQUEzQyxJQUFzRGxELG1CQUFtQixDQUFDa0QsT0FBcEIsQ0FBNEJDLEdBQXRGLEVBQTJGO0FBQ3ZGO0FBQ0FuRCxNQUFBQSxtQkFBbUIsQ0FBQ2tELE9BQXBCLENBQTRCd0IsSUFBNUIsR0FBbUMxRSxtQkFBbUIsQ0FBQzBFLElBQXBCLElBQTRCLHlCQUFHLGFBQUgsQ0FBL0QsQ0FGdUYsQ0FJdkY7O0FBQ0EsWUFBTUMsVUFBVSxHQUFHO0FBQ2ZwQixRQUFBQSxFQUFFLEVBQUV2RCxtQkFBbUIsQ0FBQ3VELEVBRFQ7QUFFZkosUUFBQUEsR0FBRyxFQUFFbkQsbUJBQW1CLENBQUNrRCxPQUFwQixDQUE0QkMsR0FGbEI7QUFHZnVCLFFBQUFBLElBQUksRUFBRTFFLG1CQUFtQixDQUFDa0QsT0FBcEIsQ0FBNEJ3QixJQUhuQjtBQUlmRSxRQUFBQSxJQUFJLEVBQUU1RSxtQkFBbUIsQ0FBQ2tELE9BQXBCLENBQTRCMEIsSUFKbkI7QUFLZkMsUUFBQUEsSUFBSSxFQUFFN0UsbUJBQW1CLENBQUNrRCxPQUFwQixDQUE0QjJCO0FBTG5CLE9BQW5CO0FBUUFOLE1BQUFBLGVBQWUsZ0JBQ1g7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLHNCQUNJO0FBQ0ksUUFBQSxFQUFFLEVBQUMsaUJBRFA7QUFFSSxRQUFBLFNBQVMsRUFBQyxxQkFGZDtBQUdJLFFBQUEsS0FBSyxFQUFFO0FBQ0hPLFVBQUFBLE1BQU0sRUFBRSxNQURMO0FBRUhDLFVBQUFBLE1BQU0sRUFBRSxLQUFLdEYsYUFGVjtBQUdIdUYsVUFBQUEsS0FBSyxFQUFFLEtBQUt4RjtBQUhUO0FBSFgsc0JBU0ksNkJBQUMsZ0JBQUQ7QUFBa0IsUUFBQSxVQUFVLEVBQUVmLHFCQUE5QjtBQUFxRCxRQUFBLE1BQU0sRUFBRUQ7QUFBN0Qsc0JBQ0ksNkJBQUMsZ0JBQUQ7QUFDSSxRQUFBLEdBQUcsRUFBRW1HLFVBRFQ7QUFFSSxRQUFBLElBQUksRUFBRSxLQUFLN0YsS0FBTCxDQUFXbUcsSUFGckI7QUFHSSxRQUFBLFNBQVMsRUFBRSxJQUhmO0FBSUksUUFBQSxNQUFNLEVBQUUvQyxpQ0FBZ0JDLEdBQWhCLEdBQXNCK0MsV0FBdEIsQ0FBa0NDLE1BSjlDO0FBS0ksUUFBQSxhQUFhLEVBQUVuRixtQkFBbUIsQ0FBQ29GLE1BQXBCLElBQThCbEQsaUNBQWdCQyxHQUFoQixHQUFzQitDLFdBQXRCLENBQWtDQyxNQUxuRjtBQU1JLFFBQUEsaUJBQWlCLEVBQUUsSUFOdkI7QUFPSSxRQUFBLFdBQVcsRUFBRSxJQVBqQjtBQVFJLFFBQUEsV0FBVyxFQUFFLEtBQUtqRyx5QkFSdEI7QUFTSSxRQUFBLGFBQWEsRUFBRSxLQUFLQywyQkFUeEI7QUFVSSxRQUFBLFNBQVMsRUFBRSxLQVZmO0FBV0ksUUFBQSxVQUFVLEVBQUUsS0FYaEI7QUFZSSxRQUFBLFVBQVUsRUFBRSxLQVpoQjtBQWFJLFFBQUEsZUFBZSxFQUFFLEtBQUtGLG9CQWIxQjtBQWNJLFFBQUEsMkJBQTJCLEVBQUUsSUFkakM7QUFlSSxRQUFBLFVBQVUsRUFBRTtBQWZoQixRQURKLENBVEosQ0FESixDQURKO0FBaUNILEtBOUNELE1BOENPO0FBQ0g7QUFDQXNGLE1BQUFBLGVBQWUsR0FBRyxLQUFLWCw0QkFBTCxFQUFsQjtBQUNIOztBQUNELFdBQU9XLGVBQVA7QUFDSCxHQTdQc0QsQ0ErUHZEOztBQUNBO0FBQ0o7QUFDQTtBQUNBOzs7QUFDSXhGLEVBQUFBLG9CQUFvQixDQUFDK0IsQ0FBRCxFQUFJO0FBQ3BCLFFBQUksQ0FBQ3VFLHVCQUFjQyxRQUFkLENBQXVCLHlCQUF2QixDQUFMLEVBQXdEO0FBQ3BEO0FBQ0EsYUFBT2pGLHlDQUFvQkMsY0FBcEIsR0FBcUNpRixrQkFBckMsRUFBUDtBQUNILEtBSm1CLENBTXBCOzs7QUFFQSxVQUFNQyxVQUFVLEdBQUcxRSxDQUFDLENBQUMyRSxNQUFGLENBQVNDLHFCQUFULEVBQW5CLENBUm9CLENBVXBCOztBQUNBLFFBQUlDLENBQUMsR0FBR0gsVUFBVSxDQUFDSSxLQUFYLEdBQW1CL0QsTUFBTSxDQUFDZ0UsV0FBMUIsR0FBd0MsRUFBaEQsQ0FYb0IsQ0FhcEI7QUFDQTs7QUFDQSxVQUFNQyxRQUFRLEdBQUcsRUFBakIsQ0Fmb0IsQ0FpQnBCO0FBQ0E7O0FBQ0FILElBQUFBLENBQUMsR0FBR0ksSUFBSSxDQUFDQyxHQUFMLENBQVNMLENBQVQsRUFBWU0sUUFBUSxDQUFDQyxJQUFULENBQWNDLFdBQWQsSUFBNkIsTUFBTUwsUUFBbkMsQ0FBWixDQUFKLENBbkJvQixDQXFCcEI7QUFDQTtBQUNBOztBQUNBLFVBQU1NLDBCQUEwQixHQUFHTCxJQUFJLENBQUNNLEdBQUwsQ0FBUyxFQUFULEVBQWEsSUFBSXhFLE1BQU0sQ0FBQ2dFLFdBQVgsR0FBeUJMLFVBQVUsQ0FBQ2MsSUFBcEMsR0FBMkNYLENBQXhELENBQW5DO0FBRUEsVUFBTVksQ0FBQyxHQUFJZixVQUFVLENBQUNnQixHQUFYLEdBQWtCaEIsVUFBVSxDQUFDVCxNQUFYLEdBQW9CLENBQXRDLEdBQTJDbEQsTUFBTSxDQUFDNEUsV0FBbkQsR0FBa0UsRUFBNUU7QUFFQSxTQUFLaEYsUUFBTCxDQUFjO0FBQ1Y3QixNQUFBQSxZQUFZLEVBQUUsSUFESjtBQUVWOEcsTUFBQUEsY0FBYyxFQUFFZixDQUZOO0FBR1ZnQixNQUFBQSxjQUFjLEVBQUVKLENBSE47QUFJVkgsTUFBQUE7QUFKVSxLQUFkO0FBTUg7QUFFRDtBQUNKO0FBQ0E7QUFDQTs7O0FBQ0luSCxFQUFBQSxvQkFBb0IsQ0FBQzJILEVBQUQsRUFBSztBQUNyQixTQUFLbkYsUUFBTCxDQUFjO0FBQUM3QixNQUFBQSxZQUFZLEVBQUU7QUFBZixLQUFkO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7OztBQUNJTixFQUFBQSxTQUFTLEdBQUc7QUFDUixTQUFLbUMsUUFBTCxDQUFjO0FBQUM3QixNQUFBQSxZQUFZLEVBQUU7QUFBZixLQUFkO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7OztBQUNJTCxFQUFBQSxXQUFXLEdBQUc7QUFDVixTQUFLa0MsUUFBTCxDQUFjO0FBQUM3QixNQUFBQSxZQUFZLEVBQUU7QUFBZixLQUFkO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7OztBQUNJVixFQUFBQSx5QkFBeUIsR0FBRztBQUN4QjtBQUNBLFFBQUltRyx1QkFBY0MsUUFBZCxDQUF1QixtQ0FBdkIsQ0FBSixFQUFpRTtBQUM3RGpGLCtDQUFvQkMsY0FBcEIsR0FBcUN1RyxPQUFyQyxDQUNJLEtBQUsvSCxLQUFMLENBQVdtRyxJQURmLEVBRUssUUFBTzdELHVCQUFXQyxhQUFYLENBQXlCeUYsU0FBVSxFQUYvQyxFQUdJLEtBQUtuSCxLQUFMLENBQVdNLFFBSGY7QUFLSCxLQU5ELE1BTU87QUFDSEksK0NBQW9CQyxjQUFwQixHQUFxQ0UsaUJBQXJDLEdBQXlEdUcsSUFBekQsQ0FDSSxLQUFLakksS0FBTCxDQUFXbUcsSUFEZixFQUVLLFFBQU83RCx1QkFBV0MsYUFBWCxDQUF5QnlGLFNBQVUsRUFGL0MsRUFHSSxLQUFLbkgsS0FBTCxDQUFXTSxRQUhmO0FBS0g7QUFDSjs7QUFFRCtHLEVBQUFBLE1BQU0sR0FBRztBQUNMLFFBQUlDLGFBQUo7QUFDQSxRQUFJQyxjQUFKO0FBQ0EsVUFBTUMsU0FBUyxHQUFHLHlCQUNkLDJCQURjLEVBRWQsNkJBRmMsRUFHZCwwQkFIYyxFQUlkLHFDQUpjLENBQWxCOztBQU1BLFFBQUksS0FBS3hILEtBQUwsQ0FBV0MsWUFBZixFQUE2QjtBQUN6QjtBQUNBc0gsTUFBQUEsY0FBYyxnQkFDViw2QkFBQyx5QkFBRDtBQUNJLFFBQUEsRUFBRSxFQUFDLGdCQURQO0FBRUksUUFBQSxHQUFHLEVBQUMsd0JBRlI7QUFHSSxRQUFBLFNBQVMsRUFBRUMsU0FIZjtBQUlJLFFBQUEsT0FBTyxFQUFFLEtBQUtsSSxvQkFKbEI7QUFLSSxRQUFBLE1BQU0sRUFBRSxLQUFLVSxLQUFMLENBQVdDLFlBTHZCO0FBTUksUUFBQSxLQUFLLEVBQUUseUJBQUcsZUFBSDtBQU5YLFFBREo7QUFXQSxZQUFNd0gseUJBQXlCLEdBQUc1QyxHQUFHLENBQUNDLFlBQUosQ0FBaUIseUNBQWpCLENBQWxDO0FBQ0F3QyxNQUFBQSxhQUFhLGdCQUFHLDZCQUFDLHdCQUFEO0FBQ1osUUFBQSxhQUFhLEVBQUUsS0FBS3RILEtBQUwsQ0FBV3lHLDBCQURkO0FBRVosUUFBQSxXQUFXLEVBQUMsUUFGQTtBQUdaLFFBQUEsSUFBSSxFQUFFLEtBQUt6RyxLQUFMLENBQVcrRyxjQUhMO0FBSVosUUFBQSxHQUFHLEVBQUUsS0FBSy9HLEtBQUwsQ0FBV2dILGNBSko7QUFLWixRQUFBLFNBQVMsRUFBRSxLQUFLbkgsWUFMSjtBQU1aLFFBQUEsVUFBVSxFQUFFLEtBQUtDLGFBTkw7QUFPWixRQUFBLFVBQVUsRUFBRSxLQUFLRixXQVBMO0FBUVosUUFBQSxjQUFjLEVBQUUsQ0FSSjtBQVNaLFFBQUEsZUFBZSxFQUFFLENBVEw7QUFVWixRQUFBLGdCQUFnQixFQUFFLENBVk47QUFXWixRQUFBLE1BQU0sRUFBRWY7QUFYSSxzQkFhWiw2QkFBQyx5QkFBRDtBQUEyQixRQUFBLE9BQU8sRUFBRSxLQUFLOEYsd0JBQUwsRUFBcEM7QUFBcUUsUUFBQSxRQUFRLEVBQUUsS0FBSy9FO0FBQXBGLFFBYlksQ0FBaEI7QUFlSCxLQTdCRCxNQTZCTztBQUNIO0FBQ0EySCxNQUFBQSxjQUFjLGdCQUNWLDZCQUFDLGdDQUFEO0FBQ0ksUUFBQSxFQUFFLEVBQUMsZ0JBRFA7QUFFSSxRQUFBLEdBQUcsRUFBQyx3QkFGUjtBQUdJLFFBQUEsU0FBUyxFQUFDLHVEQUhkO0FBSUksUUFBQSxPQUFPLEVBQUUsS0FBS25JLG9CQUpsQjtBQUtJLFFBQUEsS0FBSyxFQUFFLHlCQUFHLGVBQUg7QUFMWCxRQURKO0FBU0g7O0FBQ0Qsd0JBQU8sNkJBQUMsY0FBRCxDQUFPLFFBQVAsUUFDRG1JLGNBREMsRUFFREQsYUFGQyxDQUFQO0FBSUg7O0FBeFlzRCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7X3QsIF90ZH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBBcHBUaWxlIGZyb20gJy4uL2VsZW1lbnRzL0FwcFRpbGUnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgV2lkZ2V0VXRpbHMgZnJvbSAnLi4vLi4vLi4vdXRpbHMvV2lkZ2V0VXRpbHMnO1xuaW1wb3J0IFBlcnNpc3RlZEVsZW1lbnQgZnJvbSBcIi4uL2VsZW1lbnRzL1BlcnNpc3RlZEVsZW1lbnRcIjtcbmltcG9ydCB7SW50ZWdyYXRpb25NYW5hZ2Vyc30gZnJvbSBcIi4uLy4uLy4uL2ludGVncmF0aW9ucy9JbnRlZ3JhdGlvbk1hbmFnZXJzXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHtDb250ZXh0TWVudX0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCB7V2lkZ2V0VHlwZX0gZnJvbSBcIi4uLy4uLy4uL3dpZGdldHMvV2lkZ2V0VHlwZVwiO1xuaW1wb3J0IEFjY2Vzc2libGVUb29sdGlwQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblwiO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7V2lkZ2V0TWVzc2FnaW5nU3RvcmV9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvd2lkZ2V0cy9XaWRnZXRNZXNzYWdpbmdTdG9yZVwiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbi8vIFRoaXMgc2hvdWxkIGJlIGJlbG93IHRoZSBkaWFsb2cgbGV2ZWwgKDQwMDApLCBidXQgYWJvdmUgdGhlIHJlc3Qgb2YgdGhlIFVJICgxMDAwLTIwMDApLlxuLy8gV2Ugc2l0IGluIGEgY29udGV4dCBtZW51LCBzbyB0aGlzIHNob3VsZCBiZSBnaXZlbiB0byB0aGUgY29udGV4dCBtZW51LlxuY29uc3QgU1RJQ0tFUlBJQ0tFUl9aX0lOREVYID0gMzUwMDtcblxuLy8gS2V5IHRvIHN0b3JlIHRoZSB3aWRnZXQncyBBcHBUaWxlIHVuZGVyIGluIFBlcnNpc3RlZEVsZW1lbnRcbmNvbnN0IFBFUlNJU1RFRF9FTEVNRU5UX0tFWSA9IFwic3RpY2tlclBpY2tlclwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5yb29tcy5TdGlja2VycGlja2VyXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGlja2VycGlja2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgY3VycmVudFdpZGdldDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5fb25TaG93U3RpY2tlcnNDbGljayA9IHRoaXMuX29uU2hvd1N0aWNrZXJzQ2xpY2suYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fb25IaWRlU3RpY2tlcnNDbGljayA9IHRoaXMuX29uSGlkZVN0aWNrZXJzQ2xpY2suYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fbGF1bmNoTWFuYWdlSW50ZWdyYXRpb25zID0gdGhpcy5fbGF1bmNoTWFuYWdlSW50ZWdyYXRpb25zLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX3JlbW92ZVN0aWNrZXJwaWNrZXJXaWRnZXRzID0gdGhpcy5fcmVtb3ZlU3RpY2tlcnBpY2tlcldpZGdldHMuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlV2lkZ2V0ID0gdGhpcy5fdXBkYXRlV2lkZ2V0LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX29uV2lkZ2V0QWN0aW9uID0gdGhpcy5fb25XaWRnZXRBY3Rpb24uYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fb25SZXNpemUgPSB0aGlzLl9vblJlc2l6ZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9vbkZpbmlzaGVkID0gdGhpcy5fb25GaW5pc2hlZC5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHRoaXMucG9wb3ZlcldpZHRoID0gMzAwO1xuICAgICAgICB0aGlzLnBvcG92ZXJIZWlnaHQgPSAzMDA7XG5cbiAgICAgICAgLy8gVGhpcyBpcyBsb2FkZWQgYnkgX2FjcXVpcmVTY2FsYXJDbGllbnQgb24gYW4gYXMtbmVlZGVkIGJhc2lzLlxuICAgICAgICB0aGlzLnNjYWxhckNsaWVudCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHNob3dTdGlja2VyczogZmFsc2UsXG4gICAgICAgICAgICBpbUVycm9yOiBudWxsLFxuICAgICAgICAgICAgc3RpY2tlcnBpY2tlclg6IG51bGwsXG4gICAgICAgICAgICBzdGlja2VycGlja2VyWTogbnVsbCxcbiAgICAgICAgICAgIHN0aWNrZXJwaWNrZXJXaWRnZXQ6IG51bGwsXG4gICAgICAgICAgICB3aWRnZXRJZDogbnVsbCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfYWNxdWlyZVNjYWxhckNsaWVudCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2NhbGFyQ2xpZW50KSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuc2NhbGFyQ2xpZW50KTtcbiAgICAgICAgLy8gVE9ETzogUGljayB0aGUgcmlnaHQgbWFuYWdlciBmb3IgdGhlIHdpZGdldFxuICAgICAgICBpZiAoSW50ZWdyYXRpb25NYW5hZ2Vycy5zaGFyZWRJbnN0YW5jZSgpLmhhc01hbmFnZXIoKSkge1xuICAgICAgICAgICAgdGhpcy5zY2FsYXJDbGllbnQgPSBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCkuZ2V0UHJpbWFyeU1hbmFnZXIoKS5nZXRTY2FsYXJDbGllbnQoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNjYWxhckNsaWVudC5jb25uZWN0KCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNjYWxhckNsaWVudDtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW1FcnJvcihfdGQoXCJGYWlsZWQgdG8gY29ubmVjdCB0byBpbnRlZ3JhdGlvbiBtYW5hZ2VyXCIpLCBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgSW50ZWdyYXRpb25NYW5hZ2Vycy5zaGFyZWRJbnN0YW5jZSgpLm9wZW5Ob01hbmFnZXJEaWFsb2coKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIF9yZW1vdmVTdGlja2VycGlja2VyV2lkZ2V0cygpIHtcbiAgICAgICAgY29uc3Qgc2NhbGFyQ2xpZW50ID0gYXdhaXQgdGhpcy5fYWNxdWlyZVNjYWxhckNsaWVudCgpO1xuICAgICAgICBjb25zb2xlLmxvZygnUmVtb3ZpbmcgU3RpY2tlcnBpY2tlciB3aWRnZXRzJyk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLndpZGdldElkKSB7XG4gICAgICAgICAgICBpZiAoc2NhbGFyQ2xpZW50KSB7XG4gICAgICAgICAgICAgICAgc2NhbGFyQ2xpZW50LmRpc2FibGVXaWRnZXRBc3NldHMoV2lkZ2V0VHlwZS5TVElDS0VSUElDS0VSLCB0aGlzLnN0YXRlLndpZGdldElkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Fzc2V0cyBkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGRpc2FibGUgYXNzZXRzJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDYW5ub3QgZGlzYWJsZSBhc3NldHM6IG5vIHNjYWxhciBjbGllbnRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ05vIHdpZGdldCBJRCBzcGVjaWZpZWQsIG5vdCBkaXNhYmxpbmcgYXNzZXRzJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtzaG93U3RpY2tlcnM6IGZhbHNlfSk7XG4gICAgICAgIFdpZGdldFV0aWxzLnJlbW92ZVN0aWNrZXJwaWNrZXJXaWRnZXRzKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcmVtb3ZlIHN0aWNrZXIgcGlja2VyIHdpZGdldCcsIGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgLy8gQ2xvc2UgdGhlIHN0aWNrZXIgcGlja2VyIHdoZW4gdGhlIHdpbmRvdyByZXNpemVzXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9vblJlc2l6ZSk7XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMuX29uV2lkZ2V0QWN0aW9uKTtcblxuICAgICAgICAvLyBUcmFjayB1cGRhdGVzIHRvIHdpZGdldCBzdGF0ZSBpbiBhY2NvdW50IGRhdGFcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKCdhY2NvdW50RGF0YScsIHRoaXMuX3VwZGF0ZVdpZGdldCk7XG5cbiAgICAgICAgLy8gSW5pdGlhbGlzZSB3aWRnZXQgc3RhdGUgZnJvbSBjdXJyZW50IGFjY291bnQgZGF0YVxuICAgICAgICB0aGlzLl91cGRhdGVXaWRnZXQoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoY2xpZW50KSBjbGllbnQucmVtb3ZlTGlzdGVuZXIoJ2FjY291bnREYXRhJywgdGhpcy5fdXBkYXRlV2lkZ2V0KTtcblxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fb25SZXNpemUpO1xuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVyUmVmKSB7XG4gICAgICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gICAgICAgIHRoaXMuX3NlbmRWaXNpYmlsaXR5VG9XaWRnZXQodGhpcy5zdGF0ZS5zaG93U3RpY2tlcnMpO1xuICAgIH1cblxuICAgIF9pbUVycm9yKGVycm9yTXNnLCBlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3JNc2csIGUpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNob3dTdGlja2VyczogZmFsc2UsXG4gICAgICAgICAgICBpbUVycm9yOiBfdChlcnJvck1zZyksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF91cGRhdGVXaWRnZXQoKSB7XG4gICAgICAgIGNvbnN0IHN0aWNrZXJwaWNrZXJXaWRnZXQgPSBXaWRnZXRVdGlscy5nZXRTdGlja2VycGlja2VyV2lkZ2V0cygpWzBdO1xuICAgICAgICBpZiAoIXN0aWNrZXJwaWNrZXJXaWRnZXQpIHtcbiAgICAgICAgICAgIFN0aWNrZXJwaWNrZXIuY3VycmVudFdpZGdldCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtzdGlja2VycGlja2VyV2lkZ2V0OiBudWxsLCB3aWRnZXRJZDogbnVsbH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY3VycmVudFdpZGdldCA9IFN0aWNrZXJwaWNrZXIuY3VycmVudFdpZGdldDtcbiAgICAgICAgbGV0IGN1cnJlbnRVcmwgPSBudWxsO1xuICAgICAgICBpZiAoY3VycmVudFdpZGdldCAmJiBjdXJyZW50V2lkZ2V0LmNvbnRlbnQgJiYgY3VycmVudFdpZGdldC5jb250ZW50LnVybCkge1xuICAgICAgICAgICAgY3VycmVudFVybCA9IGN1cnJlbnRXaWRnZXQuY29udGVudC51cmw7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbmV3VXJsID0gbnVsbDtcbiAgICAgICAgaWYgKHN0aWNrZXJwaWNrZXJXaWRnZXQgJiYgc3RpY2tlcnBpY2tlcldpZGdldC5jb250ZW50ICYmIHN0aWNrZXJwaWNrZXJXaWRnZXQuY29udGVudC51cmwpIHtcbiAgICAgICAgICAgIG5ld1VybCA9IHN0aWNrZXJwaWNrZXJXaWRnZXQuY29udGVudC51cmw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV3VXJsICE9PSBjdXJyZW50VXJsKSB7XG4gICAgICAgICAgICAvLyBEZXN0cm95IHRoZSBleGlzdGluZyBmcmFtZSBzbyBhIG5ldyBvbmUgY2FuIGJlIGNyZWF0ZWRcbiAgICAgICAgICAgIFBlcnNpc3RlZEVsZW1lbnQuZGVzdHJveUVsZW1lbnQoUEVSU0lTVEVEX0VMRU1FTlRfS0VZKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFN0aWNrZXJwaWNrZXIuY3VycmVudFdpZGdldCA9IHN0aWNrZXJwaWNrZXJXaWRnZXQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc3RpY2tlcnBpY2tlcldpZGdldCxcbiAgICAgICAgICAgIHdpZGdldElkOiBzdGlja2VycGlja2VyV2lkZ2V0ID8gc3RpY2tlcnBpY2tlcldpZGdldC5pZCA6IG51bGwsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9vbldpZGdldEFjdGlvbihwYXlsb2FkKSB7XG4gICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgXCJ1c2VyX3dpZGdldF91cGRhdGVkXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInN0aWNrZXJwaWNrZXJfY2xvc2VcIjpcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtzaG93U3RpY2tlcnM6IGZhbHNlfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5BZnRlclJpZ2h0UGFuZWxQaGFzZUNoYW5nZTpcbiAgICAgICAgICAgIGNhc2UgXCJzaG93X2xlZnRfcGFuZWxcIjpcbiAgICAgICAgICAgIGNhc2UgXCJoaWRlX2xlZnRfcGFuZWxcIjpcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtzaG93U3RpY2tlcnM6IGZhbHNlfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfZGVmYXVsdFN0aWNrZXJwaWNrZXJDb250ZW50KCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5fbGF1bmNoTWFuYWdlSW50ZWdyYXRpb25zfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfU3RpY2tlcnNfY29udGVudFBsYWNlaG9sZGVyJz5cbiAgICAgICAgICAgICAgICA8cD57IF90KFwiWW91IGRvbid0IGN1cnJlbnRseSBoYXZlIGFueSBzdGlja2VycGFja3MgZW5hYmxlZFwiKSB9PC9wPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT0nbXhfU3RpY2tlcnNfYWRkTGluayc+eyBfdChcIkFkZCBzb21lIG5vd1wiKSB9PC9wPlxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9zdGlja2VycGFjay1wbGFjZWhvbGRlci5wbmdcIil9IGFsdD1cIlwiIC8+XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgX2Vycm9yU3RpY2tlcnBpY2tlckNvbnRlbnQoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XCJ0ZXh0LWFsaWduXCI6IFwiY2VudGVyXCJ9fSBjbGFzc05hbWU9XCJlcnJvclwiPlxuICAgICAgICAgICAgICAgIDxwPiB7IHRoaXMuc3RhdGUuaW1FcnJvciB9IDwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9zZW5kVmlzaWJpbGl0eVRvV2lkZ2V0KHZpc2libGUpIHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnN0aWNrZXJwaWNrZXJXaWRnZXQpIHJldHVybjtcbiAgICAgICAgY29uc3QgbWVzc2FnaW5nID0gV2lkZ2V0TWVzc2FnaW5nU3RvcmUuaW5zdGFuY2UuZ2V0TWVzc2FnaW5nRm9ySWQodGhpcy5zdGF0ZS5zdGlja2VycGlja2VyV2lkZ2V0LmlkKTtcbiAgICAgICAgaWYgKG1lc3NhZ2luZyAmJiB2aXNpYmxlICE9PSB0aGlzLl9wcmV2U2VudFZpc2liaWxpdHkpIHtcbiAgICAgICAgICAgIG1lc3NhZ2luZy51cGRhdGVWaXNpYmlsaXR5KHZpc2libGUpLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHVwZGF0aW5nIHdpZGdldCB2aXNpYmlsaXR5OiBcIiwgZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5fcHJldlNlbnRWaXNpYmlsaXR5ID0gdmlzaWJsZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRTdGlja2VycGlja2VyQ29udGVudCgpIHtcbiAgICAgICAgLy8gSGFuZGxlIEludGVncmF0aW9uIE1hbmFnZXIgZXJyb3JzXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLl9pbUVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZXJyb3JTdGlja2VycGlja2VyQ29udGVudCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RpY2tlcnNcbiAgICAgICAgLy8gVE9ETyAtIEFkZCBzdXBwb3J0IGZvciBTdGlja2VycGlja2VycyBmcm9tIG11bHRpcGxlIGFwcCBzdG9yZXMuXG4gICAgICAgIC8vIFJlbmRlciBjb250ZW50IGZyb20gbXVsdGlwbGUgc3RpY2tlcnBhY2sgc291cmNlcywgZWFjaCB3aXRoaW4gdGhlaXJcbiAgICAgICAgLy8gb3duIGlmcmFtZSwgd2l0aGluIHRoZSBzdGlja2VycGlja2VyIFVJIGVsZW1lbnQuXG4gICAgICAgIGNvbnN0IHN0aWNrZXJwaWNrZXJXaWRnZXQgPSB0aGlzLnN0YXRlLnN0aWNrZXJwaWNrZXJXaWRnZXQ7XG4gICAgICAgIGxldCBzdGlja2Vyc0NvbnRlbnQ7XG5cbiAgICAgICAgLy8gVXNlIGEgc2VwYXJhdGUgUmVhY3RET00gdHJlZSB0byByZW5kZXIgdGhlIEFwcFRpbGUgc2VwYXJhdGVseSBzbyB0aGF0IGl0IHBlcnNpc3RzIGFuZCBkb2VzXG4gICAgICAgIC8vIG5vdCB1bm1vdW50IHdoZW4gd2UgKGEpIGNsb3NlIHRoZSBzdGlja2VyIHBpY2tlciAoYikgc3dpdGNoIHJvb21zLiBJdCdzIHByb3BlcnRpZXMgYXJlIHN0aWxsXG4gICAgICAgIC8vIHVwZGF0ZWQuXG4gICAgICAgIGNvbnN0IFBlcnNpc3RlZEVsZW1lbnQgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuUGVyc2lzdGVkRWxlbWVudFwiKTtcblxuICAgICAgICAvLyBMb2FkIHN0aWNrZXJwYWNrIGNvbnRlbnRcbiAgICAgICAgaWYgKHN0aWNrZXJwaWNrZXJXaWRnZXQgJiYgc3RpY2tlcnBpY2tlcldpZGdldC5jb250ZW50ICYmIHN0aWNrZXJwaWNrZXJXaWRnZXQuY29udGVudC51cmwpIHtcbiAgICAgICAgICAgIC8vIFNldCBkZWZhdWx0IG5hbWVcbiAgICAgICAgICAgIHN0aWNrZXJwaWNrZXJXaWRnZXQuY29udGVudC5uYW1lID0gc3RpY2tlcnBpY2tlcldpZGdldC5uYW1lIHx8IF90KFwiU3RpY2tlcnBhY2tcIik7XG5cbiAgICAgICAgICAgIC8vIEZJWE1FOiBjb3VsZCB0aGlzIHVzZSB0aGUgc2FtZSBjb2RlIGFzIG90aGVyIGFwcHM/XG4gICAgICAgICAgICBjb25zdCBzdGlja2VyQXBwID0ge1xuICAgICAgICAgICAgICAgIGlkOiBzdGlja2VycGlja2VyV2lkZ2V0LmlkLFxuICAgICAgICAgICAgICAgIHVybDogc3RpY2tlcnBpY2tlcldpZGdldC5jb250ZW50LnVybCxcbiAgICAgICAgICAgICAgICBuYW1lOiBzdGlja2VycGlja2VyV2lkZ2V0LmNvbnRlbnQubmFtZSxcbiAgICAgICAgICAgICAgICB0eXBlOiBzdGlja2VycGlja2VyV2lkZ2V0LmNvbnRlbnQudHlwZSxcbiAgICAgICAgICAgICAgICBkYXRhOiBzdGlja2VycGlja2VyV2lkZ2V0LmNvbnRlbnQuZGF0YSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHN0aWNrZXJzQ29udGVudCA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfU3RpY2tlcnNfY29udGVudF9jb250YWluZXInPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICBpZD0nc3RpY2tlcnNDb250ZW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdteF9TdGlja2Vyc19jb250ZW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoaXMucG9wb3ZlckhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy5wb3BvdmVyV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8UGVyc2lzdGVkRWxlbWVudCBwZXJzaXN0S2V5PXtQRVJTSVNURURfRUxFTUVOVF9LRVl9IHpJbmRleD17U1RJQ0tFUlBJQ0tFUl9aX0lOREVYfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QXBwVGlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHA9e3N0aWNrZXJBcHB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQ9e01hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVkZW50aWFscy51c2VySWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0b3JVc2VySWQ9e3N0aWNrZXJwaWNrZXJXaWRnZXQuc2VuZGVyIHx8IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVkZW50aWFscy51c2VySWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhaXRGb3JJZnJhbWVMb2FkPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93TWVudWJhcj17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25FZGl0Q2xpY2s9e3RoaXMuX2xhdW5jaE1hbmFnZUludGVncmF0aW9uc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25EZWxldGVDbGljaz17dGhpcy5fcmVtb3ZlU3RpY2tlcnBpY2tlcldpZGdldHN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dUaXRsZT17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93UG9wb3V0PXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25NaW5pbWlzZUNsaWNrPXt0aGlzLl9vbkhpZGVTdGlja2Vyc0NsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVNaW5pbWlzZVBvaW50ZXJFdmVudHM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJXaWRnZXQ9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvUGVyc2lzdGVkRWxlbWVudD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gRGVmYXVsdCBjb250ZW50IHRvIHNob3cgaWYgc3RpY2tlcnBpY2tlciB3aWRnZXQgbm90IGFkZGVkXG4gICAgICAgICAgICBzdGlja2Vyc0NvbnRlbnQgPSB0aGlzLl9kZWZhdWx0U3RpY2tlcnBpY2tlckNvbnRlbnQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RpY2tlcnNDb250ZW50O1xuICAgIH1cblxuICAgIC8vIERldiBub3RlOiB0aGlzIGlzbid0IGpzZG9jIGJlY2F1c2UgaXQncyBhbmdyeS5cbiAgICAvKlxuICAgICAqIFNob3cgdGhlIHN0aWNrZXIgcGlja2VyIG92ZXJsYXlcbiAgICAgKiBJZiBubyBzdGlja2VycGFja3MgaGF2ZSBiZWVuIGFkZGVkLCBzaG93IGEgbGluayB0byB0aGUgaW50ZWdyYXRpb24gbWFuYWdlciBhZGQgc3RpY2tlciBwYWNrcyBwYWdlLlxuICAgICAqL1xuICAgIF9vblNob3dTdGlja2Vyc0NsaWNrKGUpIHtcbiAgICAgICAgaWYgKCFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiaW50ZWdyYXRpb25Qcm92aXNpb25pbmdcIikpIHtcbiAgICAgICAgICAgIC8vIEludGVyY2VwdCB0aGlzIGNhc2UgYW5kIHNwYXduIGEgd2FybmluZy5cbiAgICAgICAgICAgIHJldHVybiBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCkuc2hvd0Rpc2FibGVkRGlhbG9nKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBYWFg6IFNpbXBsaWZ5IGJ5IHVzaW5nIGEgY29udGV4dCBtZW51IHRoYXQgaXMgcG9zaXRpb25lZCByZWxhdGl2ZSB0byB0aGUgc3RpY2tlciBwaWNrZXIgYnV0dG9uXG5cbiAgICAgICAgY29uc3QgYnV0dG9uUmVjdCA9IGUudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgIC8vIFRoZSB3aW5kb3cgWCBhbmQgWSBvZmZzZXRzIGFyZSB0byBhZGp1c3QgcG9zaXRpb24gd2hlbiB6b29tZWQgaW4gdG8gcGFnZVxuICAgICAgICBsZXQgeCA9IGJ1dHRvblJlY3QucmlnaHQgKyB3aW5kb3cucGFnZVhPZmZzZXQgLSA0MTtcblxuICAgICAgICAvLyBBbW91bnQgb2YgaG9yaXpvbnRhbCBzcGFjZSBiZXR3ZWVuIHRoZSByaWdodCBvZiBtZW51IGFuZCB0aGUgcmlnaHQgb2YgdGhlIHZpZXdwb3J0XG4gICAgICAgIC8vICAoMTAgPSBhbW91bnQgbmVlZGVkIHRvIG1ha2UgY2hldnJvbiBjZW50cmFsbHkgYWxpZ25lZClcbiAgICAgICAgY29uc3QgcmlnaHRQYWQgPSAxMDtcblxuICAgICAgICAvLyBXaGVuIHRoZSBzdGlja2VyIHBpY2tlciB3b3VsZCBiZSBkaXNwbGF5ZWQgb2ZmIG9mIHRoZSB2aWV3cG9ydCwgYWRqdXN0IHhcbiAgICAgICAgLy8gICgzMDIgPSB3aWR0aCBvZiBjb250ZXh0IG1lbnUsIGluY2x1ZGluZyBib3JkZXJzKVxuICAgICAgICB4ID0gTWF0aC5taW4oeCwgZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCAtICgzMDIgKyByaWdodFBhZCkpO1xuXG4gICAgICAgIC8vIE9mZnNldCB0aGUgY2hldnJvbiBsb2NhdGlvbiwgd2hpY2ggaXMgcmVsYXRpdmUgdG8gdGhlIGxlZnQgb2YgdGhlIGNvbnRleHQgbWVudVxuICAgICAgICAvLyAgKDEwID0gb2Zmc2V0IHdoZW4gY29udGV4dCBtZW51IHdvdWxkIG5vdCBiZSBkaXNwbGF5ZWQgb2ZmIHZpZXdwb3J0KVxuICAgICAgICAvLyAgKDIgPSBjb250ZXh0IG1lbnUgYm9yZGVycylcbiAgICAgICAgY29uc3Qgc3RpY2tlclBpY2tlckNoZXZyb25PZmZzZXQgPSBNYXRoLm1heCgxMCwgMiArIHdpbmRvdy5wYWdlWE9mZnNldCArIGJ1dHRvblJlY3QubGVmdCAtIHgpO1xuXG4gICAgICAgIGNvbnN0IHkgPSAoYnV0dG9uUmVjdC50b3AgKyAoYnV0dG9uUmVjdC5oZWlnaHQgLyAyKSArIHdpbmRvdy5wYWdlWU9mZnNldCkgLSAxOTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNob3dTdGlja2VyczogdHJ1ZSxcbiAgICAgICAgICAgIHN0aWNrZXJQaWNrZXJYOiB4LFxuICAgICAgICAgICAgc3RpY2tlclBpY2tlclk6IHksXG4gICAgICAgICAgICBzdGlja2VyUGlja2VyQ2hldnJvbk9mZnNldCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJpZ2dlciBoaWRpbmcgb2YgdGhlIHN0aWNrZXIgcGlja2VyIG92ZXJsYXlcbiAgICAgKiBAcGFyYW0gIHtFdmVudH0gZXYgRXZlbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIGZ1bmN0aW9uIGNhbGxcbiAgICAgKi9cbiAgICBfb25IaWRlU3RpY2tlcnNDbGljayhldikge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtzaG93U3RpY2tlcnM6IGZhbHNlfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gdGhlIHdpbmRvdyBpcyByZXNpemVkXG4gICAgICovXG4gICAgX29uUmVzaXplKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtzaG93U3RpY2tlcnM6IGZhbHNlfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIHN0aWNrZXJzIHBpY2tlciB3YXMgaGlkZGVuXG4gICAgICovXG4gICAgX29uRmluaXNoZWQoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dTdGlja2VyczogZmFsc2V9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMYXVuY2ggdGhlIGludGVncmF0aW9uIG1hbmFnZXIgb24gdGhlIHN0aWNrZXJzIGludGVncmF0aW9uIHBhZ2VcbiAgICAgKi9cbiAgICBfbGF1bmNoTWFuYWdlSW50ZWdyYXRpb25zKCkge1xuICAgICAgICAvLyBUT0RPOiBPcGVuIHRoZSByaWdodCBpbnRlZ3JhdGlvbiBtYW5hZ2VyIGZvciB0aGUgd2lkZ2V0XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9tYW55X2ludGVncmF0aW9uX21hbmFnZXJzXCIpKSB7XG4gICAgICAgICAgICBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCkub3BlbkFsbChcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnJvb20sXG4gICAgICAgICAgICAgICAgYHR5cGVfJHtXaWRnZXRUeXBlLlNUSUNLRVJQSUNLRVIucHJlZmVycmVkfWAsXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS53aWRnZXRJZCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCkuZ2V0UHJpbWFyeU1hbmFnZXIoKS5vcGVuKFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucm9vbSxcbiAgICAgICAgICAgICAgICBgdHlwZV8ke1dpZGdldFR5cGUuU1RJQ0tFUlBJQ0tFUi5wcmVmZXJyZWR9YCxcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLndpZGdldElkLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IHN0aWNrZXJQaWNrZXI7XG4gICAgICAgIGxldCBzdGlja2Vyc0J1dHRvbjtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gY2xhc3NOYW1lcyhcbiAgICAgICAgICAgIFwibXhfTWVzc2FnZUNvbXBvc2VyX2J1dHRvblwiLFxuICAgICAgICAgICAgXCJteF9NZXNzYWdlQ29tcG9zZXJfc3RpY2tlcnNcIixcbiAgICAgICAgICAgIFwibXhfU3RpY2tlcnNfaGlkZVN0aWNrZXJzXCIsXG4gICAgICAgICAgICBcIm14X01lc3NhZ2VDb21wb3Nlcl9idXR0b25faGlnaGxpZ2h0XCIsXG4gICAgICAgICk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNob3dTdGlja2Vycykge1xuICAgICAgICAgICAgLy8gU2hvdyBoaWRlLXN0aWNrZXJzIGJ1dHRvblxuICAgICAgICAgICAgc3RpY2tlcnNCdXR0b24gPVxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGlkPSdzdGlja2Vyc0J1dHRvbidcbiAgICAgICAgICAgICAgICAgICAga2V5PVwiY29udHJvbHNfaGlkZV9zdGlja2Vyc1wiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkhpZGVTdGlja2Vyc0NsaWNrfVxuICAgICAgICAgICAgICAgICAgICBhY3RpdmU9e3RoaXMuc3RhdGUuc2hvd1N0aWNrZXJzfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJIaWRlIFN0aWNrZXJzXCIpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuXG4gICAgICAgICAgICBjb25zdCBHZW5lcmljRWxlbWVudENvbnRleHRNZW51ID0gc2RrLmdldENvbXBvbmVudCgnY29udGV4dF9tZW51cy5HZW5lcmljRWxlbWVudENvbnRleHRNZW51Jyk7XG4gICAgICAgICAgICBzdGlja2VyUGlja2VyID0gPENvbnRleHRNZW51XG4gICAgICAgICAgICAgICAgY2hldnJvbk9mZnNldD17dGhpcy5zdGF0ZS5zdGlja2VyUGlja2VyQ2hldnJvbk9mZnNldH1cbiAgICAgICAgICAgICAgICBjaGV2cm9uRmFjZT1cImJvdHRvbVwiXG4gICAgICAgICAgICAgICAgbGVmdD17dGhpcy5zdGF0ZS5zdGlja2VyUGlja2VyWH1cbiAgICAgICAgICAgICAgICB0b3A9e3RoaXMuc3RhdGUuc3RpY2tlclBpY2tlcll9XG4gICAgICAgICAgICAgICAgbWVudVdpZHRoPXt0aGlzLnBvcG92ZXJXaWR0aH1cbiAgICAgICAgICAgICAgICBtZW51SGVpZ2h0PXt0aGlzLnBvcG92ZXJIZWlnaHR9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5fb25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICBtZW51UGFkZGluZ1RvcD17MH1cbiAgICAgICAgICAgICAgICBtZW51UGFkZGluZ0xlZnQ9ezB9XG4gICAgICAgICAgICAgICAgbWVudVBhZGRpbmdSaWdodD17MH1cbiAgICAgICAgICAgICAgICB6SW5kZXg9e1NUSUNLRVJQSUNLRVJfWl9JTkRFWH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8R2VuZXJpY0VsZW1lbnRDb250ZXh0TWVudSBlbGVtZW50PXt0aGlzLl9nZXRTdGlja2VycGlja2VyQ29udGVudCgpfSBvblJlc2l6ZT17dGhpcy5fb25GaW5pc2hlZH0gLz5cbiAgICAgICAgICAgIDwvQ29udGV4dE1lbnU+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gU2hvdyBzaG93LXN0aWNrZXJzIGJ1dHRvblxuICAgICAgICAgICAgc3RpY2tlcnNCdXR0b24gPVxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBpZD0nc3RpY2tlcnNCdXR0b24nXG4gICAgICAgICAgICAgICAgICAgIGtleT1cImNvbnRyb2xzX3Nob3dfc3RpY2tlcnNcIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29tcG9zZXJfYnV0dG9uIG14X01lc3NhZ2VDb21wb3Nlcl9zdGlja2Vyc1wiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uU2hvd1N0aWNrZXJzQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlNob3cgU3RpY2tlcnNcIil9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24+O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICB7IHN0aWNrZXJzQnV0dG9uIH1cbiAgICAgICAgICAgIHsgc3RpY2tlclBpY2tlciB9XG4gICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgIH1cbn1cbiJdfQ==