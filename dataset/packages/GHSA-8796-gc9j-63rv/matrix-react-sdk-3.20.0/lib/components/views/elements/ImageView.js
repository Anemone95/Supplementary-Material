"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleTooltipButton = _interopRequireDefault(require("./AccessibleTooltipButton"));

var _Keyboard = require("../../../Keyboard");

var _reactFocusLock = _interopRequireDefault(require("react-focus-lock"));

var _MemberAvatar = _interopRequireDefault(require("../avatars/MemberAvatar"));

var _ContextMenuTooltipButton = require("../../../accessibility/context_menu/ContextMenuTooltipButton");

var _MessageContextMenu = _interopRequireDefault(require("../context_menus/MessageContextMenu"));

var _ContextMenu = require("../../structures/ContextMenu");

var _MessageTimestamp = _interopRequireDefault(require("../messages/MessageTimestamp"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _DateUtils = require("../../../DateUtils");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _Mouse = require("../../../utils/Mouse");

var _dec, _class, _temp;

// Max scale to keep gaps around the image
const MAX_SCALE = 0.95; // This is used for the buttons

const ZOOM_STEP = 0.10; // This is used for mouse wheel events

const ZOOM_COEFFICIENT = 0.0025; // If we have moved only this much we can zoom

const ZOOM_DISTANCE = 10;
let ImageView = (_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.ImageView"), _dec(_class = (_temp = class ImageView extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "contextMenuButton", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "focusLock", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "imageWrapper", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "image", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "initX", 0);
    (0, _defineProperty2.default)(this, "initY", 0);
    (0, _defineProperty2.default)(this, "lastX", 0);
    (0, _defineProperty2.default)(this, "lastY", 0);
    (0, _defineProperty2.default)(this, "previousX", 0);
    (0, _defineProperty2.default)(this, "previousY", 0);
    (0, _defineProperty2.default)(this, "calculateZoom", () => {
      const image = this.image.current;
      const imageWrapper = this.imageWrapper.current;
      const zoomX = imageWrapper.clientWidth / image.naturalWidth;
      const zoomY = imageWrapper.clientHeight / image.naturalHeight; // If the image is smaller in both dimensions set its the zoom to 1 to
      // display it in its original size

      if (zoomX >= 1 && zoomY >= 1) {
        this.setState({
          zoom: 1,
          minZoom: 1,
          maxZoom: 1
        });
        return;
      } // We set minZoom to the min of the zoomX and zoomY to avoid overflow in
      // any direction. We also multiply by MAX_SCALE to get a gap around the
      // image by default


      const minZoom = Math.min(zoomX, zoomY) * MAX_SCALE;
      if (this.state.zoom <= this.state.minZoom) this.setState({
        zoom: minZoom
      });
      this.setState({
        minZoom: minZoom,
        maxZoom: 1
      });
    });
    (0, _defineProperty2.default)(this, "onWheel", (ev
    /*: WheelEvent*/
    ) => {
      ev.stopPropagation();
      ev.preventDefault();
      const {
        deltaY
      } = (0, _Mouse.normalizeWheelEvent)(ev);
      this.zoom(-(deltaY * ZOOM_COEFFICIENT));
    });
    (0, _defineProperty2.default)(this, "onZoomInClick", () => {
      this.zoom(ZOOM_STEP);
    });
    (0, _defineProperty2.default)(this, "onZoomOutClick", () => {
      this.zoom(-ZOOM_STEP);
    });
    (0, _defineProperty2.default)(this, "onKeyDown", (ev
    /*: KeyboardEvent*/
    ) => {
      if (ev.key === _Keyboard.Key.ESCAPE) {
        ev.stopPropagation();
        ev.preventDefault();
        this.props.onFinished();
      }
    });
    (0, _defineProperty2.default)(this, "onRotateCounterClockwiseClick", () => {
      const cur = this.state.rotation;
      const rotationDegrees = cur - 90;
      this.setState({
        rotation: rotationDegrees
      });
    });
    (0, _defineProperty2.default)(this, "onRotateClockwiseClick", () => {
      const cur = this.state.rotation;
      const rotationDegrees = cur + 90;
      this.setState({
        rotation: rotationDegrees
      });
    });
    (0, _defineProperty2.default)(this, "onDownloadClick", () => {
      const a = document.createElement("a");
      a.href = this.props.src;
      a.download = this.props.name;
      a.target = "_blank";
      a.click();
    });
    (0, _defineProperty2.default)(this, "onOpenContextMenu", () => {
      this.setState({
        contextMenuDisplayed: true
      });
    });
    (0, _defineProperty2.default)(this, "onCloseContextMenu", () => {
      this.setState({
        contextMenuDisplayed: false
      });
    });
    (0, _defineProperty2.default)(this, "onPermalinkClicked", (ev
    /*: React.MouseEvent*/
    ) => {
      // This allows the permalink to be opened in a new tab/window or copied as
      // matrix.to, but also for it to enable routing within Element when clicked.
      ev.preventDefault();

      _dispatcher.default.dispatch({
        action: 'view_room',
        event_id: this.props.mxEvent.getId(),
        highlighted: true,
        room_id: this.props.mxEvent.getRoomId()
      });

      this.props.onFinished();
    });
    (0, _defineProperty2.default)(this, "onStartMoving", (ev
    /*: React.MouseEvent*/
    ) => {
      ev.stopPropagation();
      ev.preventDefault(); // Don't do anything if we pressed any
      // other button than the left one

      if (ev.button !== 0) return; // Zoom in if we are completely zoomed out

      if (this.state.zoom === this.state.minZoom) {
        this.setState({
          zoom: this.state.maxZoom
        });
        return;
      }

      this.setState({
        moving: true
      });
      this.previousX = this.state.translationX;
      this.previousY = this.state.translationY;
      this.initX = ev.pageX - this.lastX;
      this.initY = ev.pageY - this.lastY;
    });
    (0, _defineProperty2.default)(this, "onMoving", (ev
    /*: React.MouseEvent*/
    ) => {
      ev.stopPropagation();
      ev.preventDefault();
      if (!this.state.moving) return;
      this.lastX = ev.pageX - this.initX;
      this.lastY = ev.pageY - this.initY;
      this.setState({
        translationX: this.lastX,
        translationY: this.lastY
      });
    });
    (0, _defineProperty2.default)(this, "onEndMoving", () => {
      // Zoom out if we haven't moved much
      if (this.state.moving === true && Math.abs(this.state.translationX - this.previousX) < ZOOM_DISTANCE && Math.abs(this.state.translationY - this.previousY) < ZOOM_DISTANCE) {
        this.setState({
          zoom: this.state.minZoom,
          translationX: 0,
          translationY: 0
        });
      }

      this.setState({
        moving: false
      });
    });
    this.state = {
      zoom: 0,
      minZoom: MAX_SCALE,
      maxZoom: MAX_SCALE,
      rotation: 0,
      translationX: 0,
      translationY: 0,
      moving: false,
      contextMenuDisplayed: false
    };
  } // XXX: Refs to functional components


  componentDidMount() {
    // We have to use addEventListener() because the listener
    // needs to be passive in order to work with Chromium
    this.focusLock.current.addEventListener('wheel', this.onWheel, {
      passive: false
    }); // We want to recalculate zoom whenever the window's size changes

    window.addEventListener("resize", this.calculateZoom); // After the image loads for the first time we want to calculate the zoom

    this.image.current.addEventListener("load", this.calculateZoom);
  }

  componentWillUnmount() {
    this.focusLock.current.removeEventListener('wheel', this.onWheel);
  }

  zoom(delta
  /*: number*/
  ) {
    const newZoom = this.state.zoom + delta;

    if (newZoom <= this.state.minZoom) {
      this.setState({
        zoom: this.state.minZoom,
        translationX: 0,
        translationY: 0
      });
      return;
    }

    if (newZoom >= this.state.maxZoom) {
      this.setState({
        zoom: this.state.maxZoom
      });
      return;
    }

    this.setState({
      zoom: newZoom
    });
  }

  renderContextMenu() {
    let contextMenu = null;

    if (this.state.contextMenuDisplayed) {
      contextMenu = /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenu, (0, _extends2.default)({}, (0, _ContextMenu.aboveLeftOf)(this.contextMenuButton.current.getBoundingClientRect()), {
        onFinished: this.onCloseContextMenu
      }), /*#__PURE__*/_react.default.createElement(_MessageContextMenu.default, {
        mxEvent: this.props.mxEvent,
        permalinkCreator: this.props.permalinkCreator,
        onFinished: this.onCloseContextMenu,
        onCloseDialog: this.props.onFinished
      }));
    }

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, contextMenu);
  }

  render() {
    const showEventMeta = !!this.props.mxEvent;
    const zoomingDisabled = this.state.maxZoom === this.state.minZoom;
    let cursor;

    if (this.state.moving) {
      cursor = "grabbing";
    } else if (zoomingDisabled) {
      cursor = "default";
    } else if (this.state.zoom === this.state.minZoom) {
      cursor = "zoom-in";
    } else {
      cursor = "zoom-out";
    }

    const rotationDegrees = this.state.rotation + "deg";
    const zoom = this.state.zoom;
    const translatePixelsX = this.state.translationX + "px";
    const translatePixelsY = this.state.translationY + "px"; // The order of the values is important!
    // First, we translate and only then we rotate, otherwise
    // we would apply the translation to an already rotated
    // image causing it translate in the wrong direction.

    const style = {
      cursor: cursor,
      transition: this.state.moving ? null : "transform 200ms ease 0s",
      transform: `translateX(${translatePixelsX})
                        translateY(${translatePixelsY})
                        scale(${zoom})
                        rotate(${rotationDegrees})`
    };
    let info;

    if (showEventMeta) {
      const mxEvent = this.props.mxEvent;

      const showTwelveHour = _SettingsStore.default.getValue("showTwelveHourTimestamps");

      let permalink = "#";

      if (this.props.permalinkCreator) {
        permalink = this.props.permalinkCreator.forEvent(this.props.mxEvent.getId());
      }

      const senderName = mxEvent.sender ? mxEvent.sender.name : mxEvent.getSender();

      const sender = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ImageView_info_sender"
      }, senderName);

      const messageTimestamp = /*#__PURE__*/_react.default.createElement("a", {
        href: permalink,
        onClick: this.onPermalinkClicked,
        "aria-label": (0, _DateUtils.formatFullDate)(new Date(this.props.mxEvent.getTs()), showTwelveHour, false)
      }, /*#__PURE__*/_react.default.createElement(_MessageTimestamp.default, {
        showFullDate: true,
        showTwelveHour: showTwelveHour,
        ts: mxEvent.getTs(),
        showSeconds: false
      }));

      const avatar = /*#__PURE__*/_react.default.createElement(_MemberAvatar.default, {
        member: mxEvent.sender,
        width: 32,
        height: 32,
        viewUserOnClick: true
      });

      info = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ImageView_info_wrapper"
      }, avatar, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ImageView_info"
      }, sender, messageTimestamp));
    } else {
      // If there is no event - we're viewing an avatar, we set
      // an empty div here, since the panel uses space-between
      // and we want the same placement of elements
      info = /*#__PURE__*/_react.default.createElement("div", null);
    }

    let contextMenuButton;

    if (this.props.mxEvent) {
      contextMenuButton = /*#__PURE__*/_react.default.createElement(_ContextMenuTooltipButton.ContextMenuTooltipButton, {
        className: "mx_ImageView_button mx_ImageView_button_more",
        title: (0, _languageHandler._t)("Options"),
        onClick: this.onOpenContextMenu,
        inputRef: this.contextMenuButton,
        isExpanded: this.state.contextMenuDisplayed
      });
    }

    let zoomOutButton;
    let zoomInButton;

    if (!zoomingDisabled) {
      zoomOutButton = /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
        className: "mx_ImageView_button mx_ImageView_button_zoomOut",
        title: (0, _languageHandler._t)("Zoom out"),
        onClick: this.onZoomOutClick
      });
      zoomInButton = /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
        className: "mx_ImageView_button mx_ImageView_button_zoomIn",
        title: (0, _languageHandler._t)("Zoom in"),
        onClick: this.onZoomInClick
      });
    }

    return /*#__PURE__*/_react.default.createElement(_reactFocusLock.default, {
      returnFocus: true,
      lockProps: {
        onKeyDown: this.onKeyDown,
        role: "dialog"
      },
      className: "mx_ImageView",
      ref: this.focusLock
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ImageView_panel"
    }, info, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ImageView_toolbar"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: "mx_ImageView_button mx_ImageView_button_rotateCW",
      title: (0, _languageHandler._t)("Rotate Right"),
      onClick: this.onRotateClockwiseClick
    }), /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: "mx_ImageView_button mx_ImageView_button_rotateCCW",
      title: (0, _languageHandler._t)("Rotate Left"),
      onClick: this.onRotateCounterClockwiseClick
    }), zoomOutButton, zoomInButton, /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: "mx_ImageView_button mx_ImageView_button_download",
      title: (0, _languageHandler._t)("Download"),
      onClick: this.onDownloadClick
    }), contextMenuButton, /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: "mx_ImageView_button mx_ImageView_button_close",
      title: (0, _languageHandler._t)("Close"),
      onClick: this.props.onFinished
    }), this.renderContextMenu())), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ImageView_image_wrapper",
      ref: this.imageWrapper
    }, /*#__PURE__*/_react.default.createElement("img", {
      src: this.props.src,
      title: this.props.name,
      style: style,
      ref: this.image,
      className: "mx_ImageView_image",
      draggable: true,
      onMouseDown: this.onStartMoving,
      onMouseMove: this.onMoving,
      onMouseUp: this.onEndMoving,
      onMouseLeave: this.onEndMoving
    })));
  }

}, _temp)) || _class);
exports.default = ImageView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0ltYWdlVmlldy50c3giXSwibmFtZXMiOlsiTUFYX1NDQUxFIiwiWk9PTV9TVEVQIiwiWk9PTV9DT0VGRklDSUVOVCIsIlpPT01fRElTVEFOQ0UiLCJJbWFnZVZpZXciLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJpbWFnZSIsImN1cnJlbnQiLCJpbWFnZVdyYXBwZXIiLCJ6b29tWCIsImNsaWVudFdpZHRoIiwibmF0dXJhbFdpZHRoIiwiem9vbVkiLCJjbGllbnRIZWlnaHQiLCJuYXR1cmFsSGVpZ2h0Iiwic2V0U3RhdGUiLCJ6b29tIiwibWluWm9vbSIsIm1heFpvb20iLCJNYXRoIiwibWluIiwic3RhdGUiLCJldiIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiZGVsdGFZIiwia2V5IiwiS2V5IiwiRVNDQVBFIiwib25GaW5pc2hlZCIsImN1ciIsInJvdGF0aW9uIiwicm90YXRpb25EZWdyZWVzIiwiYSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImhyZWYiLCJzcmMiLCJkb3dubG9hZCIsIm5hbWUiLCJ0YXJnZXQiLCJjbGljayIsImNvbnRleHRNZW51RGlzcGxheWVkIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJldmVudF9pZCIsIm14RXZlbnQiLCJnZXRJZCIsImhpZ2hsaWdodGVkIiwicm9vbV9pZCIsImdldFJvb21JZCIsImJ1dHRvbiIsIm1vdmluZyIsInByZXZpb3VzWCIsInRyYW5zbGF0aW9uWCIsInByZXZpb3VzWSIsInRyYW5zbGF0aW9uWSIsImluaXRYIiwicGFnZVgiLCJsYXN0WCIsImluaXRZIiwicGFnZVkiLCJsYXN0WSIsImFicyIsImNvbXBvbmVudERpZE1vdW50IiwiZm9jdXNMb2NrIiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9uV2hlZWwiLCJwYXNzaXZlIiwid2luZG93IiwiY2FsY3VsYXRlWm9vbSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImRlbHRhIiwibmV3Wm9vbSIsInJlbmRlckNvbnRleHRNZW51IiwiY29udGV4dE1lbnUiLCJjb250ZXh0TWVudUJ1dHRvbiIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsIm9uQ2xvc2VDb250ZXh0TWVudSIsInBlcm1hbGlua0NyZWF0b3IiLCJyZW5kZXIiLCJzaG93RXZlbnRNZXRhIiwiem9vbWluZ0Rpc2FibGVkIiwiY3Vyc29yIiwidHJhbnNsYXRlUGl4ZWxzWCIsInRyYW5zbGF0ZVBpeGVsc1kiLCJzdHlsZSIsInRyYW5zaXRpb24iLCJ0cmFuc2Zvcm0iLCJpbmZvIiwic2hvd1R3ZWx2ZUhvdXIiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJwZXJtYWxpbmsiLCJmb3JFdmVudCIsInNlbmRlck5hbWUiLCJzZW5kZXIiLCJnZXRTZW5kZXIiLCJtZXNzYWdlVGltZXN0YW1wIiwib25QZXJtYWxpbmtDbGlja2VkIiwiRGF0ZSIsImdldFRzIiwiYXZhdGFyIiwib25PcGVuQ29udGV4dE1lbnUiLCJ6b29tT3V0QnV0dG9uIiwiem9vbUluQnV0dG9uIiwib25ab29tT3V0Q2xpY2siLCJvblpvb21JbkNsaWNrIiwib25LZXlEb3duIiwicm9sZSIsIm9uUm90YXRlQ2xvY2t3aXNlQ2xpY2siLCJvblJvdGF0ZUNvdW50ZXJDbG9ja3dpc2VDbGljayIsIm9uRG93bmxvYWRDbGljayIsIm9uU3RhcnRNb3ZpbmciLCJvbk1vdmluZyIsIm9uRW5kTW92aW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBR0E7Ozs7QUFFQTtBQUNBLE1BQU1BLFNBQVMsR0FBRyxJQUFsQixDLENBQ0E7O0FBQ0EsTUFBTUMsU0FBUyxHQUFHLElBQWxCLEMsQ0FDQTs7QUFD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LE9BQU8sRUFBRyxLQUFLQztBQUhuQixNQU5KLEVBV0tQLGFBWEwsRUFZS0MsWUFaTCxlQWFJLDZCQUFDLGdDQUFEO0FBQ0ksTUFBQSxTQUFTLEVBQUMsa0RBRGQ7QUFFSSxNQUFBLEtBQUssRUFBRSx5QkFBRyxVQUFILENBRlg7QUFHSSxNQUFBLE9BQU8sRUFBRyxLQUFLTztBQUhuQixNQWJKLEVBa0JLcEMsaUJBbEJMLGVBbUJJLDZCQUFDLGdDQUFEO0FBQ0ksTUFBQSxTQUFTLEVBQUMsK0NBRGQ7QUFFSSxNQUFBLEtBQUssRUFBRSx5QkFBRyxPQUFILENBRlg7QUFHSSxNQUFBLE9BQU8sRUFBRyxLQUFLekUsS0FBTCxDQUFXd0I7QUFIekIsTUFuQkosRUF3QkssS0FBSytDLGlCQUFMLEVBeEJMLENBRkosQ0FUSixlQXNDSTtBQUNJLE1BQUEsU0FBUyxFQUFDLDRCQURkO0FBRUksTUFBQSxHQUFHLEVBQUUsS0FBS3BFO0FBRmQsb0JBR0k7QUFDSSxNQUFBLEdBQUcsRUFBRSxLQUFLSCxLQUFMLENBQVdnQyxHQURwQjtBQUVJLE1BQUEsS0FBSyxFQUFFLEtBQUtoQyxLQUFMLENBQVdrQyxJQUZ0QjtBQUdJLE1BQUEsS0FBSyxFQUFFaUQsS0FIWDtBQUlJLE1BQUEsR0FBRyxFQUFFLEtBQUtsRixLQUpkO0FBS0ksTUFBQSxTQUFTLEVBQUMsb0JBTGQ7QUFNSSxNQUFBLFNBQVMsRUFBRSxJQU5mO0FBT0ksTUFBQSxXQUFXLEVBQUUsS0FBSzZHLGFBUHRCO0FBUUksTUFBQSxXQUFXLEVBQUUsS0FBS0MsUUFSdEI7QUFTSSxNQUFBLFNBQVMsRUFBRSxLQUFLQyxXQVRwQjtBQVVJLE1BQUEsWUFBWSxFQUFFLEtBQUtBO0FBVnZCLE1BSEosQ0F0Q0osQ0FESjtBQXlESDs7QUE1WmtFLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMjAsIDIwMjEgxaBpbW9uIEJyYW5kbmVyIDxzaW1vbi5icmEuYWdAZ21haWwuY29tPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24gZnJvbSBcIi4vQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIjtcbmltcG9ydCB7S2V5fSBmcm9tIFwiLi4vLi4vLi4vS2V5Ym9hcmRcIjtcbmltcG9ydCBGb2N1c0xvY2sgZnJvbSBcInJlYWN0LWZvY3VzLWxvY2tcIjtcbmltcG9ydCBNZW1iZXJBdmF0YXIgZnJvbSBcIi4uL2F2YXRhcnMvTWVtYmVyQXZhdGFyXCI7XG5pbXBvcnQge0NvbnRleHRNZW51VG9vbHRpcEJ1dHRvbn0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvY29udGV4dF9tZW51L0NvbnRleHRNZW51VG9vbHRpcEJ1dHRvblwiO1xuaW1wb3J0IE1lc3NhZ2VDb250ZXh0TWVudSBmcm9tIFwiLi4vY29udGV4dF9tZW51cy9NZXNzYWdlQ29udGV4dE1lbnVcIjtcbmltcG9ydCB7YWJvdmVMZWZ0T2YsIENvbnRleHRNZW51fSBmcm9tICcuLi8uLi9zdHJ1Y3R1cmVzL0NvbnRleHRNZW51JztcbmltcG9ydCBNZXNzYWdlVGltZXN0YW1wIGZyb20gXCIuLi9tZXNzYWdlcy9NZXNzYWdlVGltZXN0YW1wXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHtmb3JtYXRGdWxsRGF0ZX0gZnJvbSBcIi4uLy4uLy4uL0RhdGVVdGlsc1wiO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5pbXBvcnQge1Jvb21QZXJtYWxpbmtDcmVhdG9yfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzXCJcbmltcG9ydCB7TWF0cml4RXZlbnR9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7bm9ybWFsaXplV2hlZWxFdmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL01vdXNlXCI7XG5cbi8vIE1heCBzY2FsZSB0byBrZWVwIGdhcHMgYXJvdW5kIHRoZSBpbWFnZVxuY29uc3QgTUFYX1NDQUxFID0gMC45NTtcbi8vIFRoaXMgaXMgdXNlZCBmb3IgdGhlIGJ1dHRvbnNcbmNvbnN0IFpPT01fU1RFUCA9IDAuMTA7XG4vLyBUaGlzIGlzIHVzZWQgZm9yIG1vdXNlIHdoZWVsIGV2ZW50c1xuY29uc3QgWk9PTV9DT0VGRklDSUVOVCA9IDAuMDAyNTtcbi8vIElmIHdlIGhhdmUgbW92ZWQgb25seSB0aGlzIG11Y2ggd2UgY2FuIHpvb21cbmNvbnN0IFpPT01fRElTVEFOQ0UgPSAxMDtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgc3JjOiBzdHJpbmcsIC8vIHRoZSBzb3VyY2Ugb2YgdGhlIGltYWdlIGJlaW5nIGRpc3BsYXllZFxuICAgIG5hbWU/OiBzdHJpbmcsIC8vIHRoZSBtYWluIHRpdGxlICgnbmFtZScpIGZvciB0aGUgaW1hZ2VcbiAgICBsaW5rPzogc3RyaW5nLCAvLyB0aGUgbGluayAoaWYgYW55KSBhcHBsaWVkIHRvIHRoZSBuYW1lIG9mIHRoZSBpbWFnZVxuICAgIHdpZHRoPzogbnVtYmVyLCAvLyB3aWR0aCBvZiB0aGUgaW1hZ2Ugc3JjIGluIHBpeGVsc1xuICAgIGhlaWdodD86IG51bWJlciwgLy8gaGVpZ2h0IG9mIHRoZSBpbWFnZSBzcmMgaW4gcGl4ZWxzXG4gICAgZmlsZVNpemU/OiBudW1iZXIsIC8vIHNpemUgb2YgdGhlIGltYWdlIHNyYyBpbiBieXRlc1xuICAgIG9uRmluaXNoZWQoKTogdm9pZCwgLy8gY2FsbGJhY2sgd2hlbiB0aGUgbGlnaHRib3ggaXMgZGlzbWlzc2VkXG5cbiAgICAvLyB0aGUgZXZlbnQgKGlmIGFueSkgdGhhdCB0aGUgSW1hZ2UgaXMgZGlzcGxheWluZy4gVXNlZCBmb3IgZXZlbnQtc3BlY2lmaWMgc3R1ZmYgbGlrZVxuICAgIC8vIHJlZGFjdGlvbnMsIHNlbmRlcnMsIHRpbWVzdGFtcHMgZXRjLiAgT3RoZXIgZGVzY3JpcHRvcnMgYXJlIHRha2VuIGZyb20gdGhlIGV4cGxpY2l0XG4gICAgLy8gcHJvcGVydGllcyBhYm92ZSwgd2hpY2ggbGV0IHVzIHVzZSBsaWdodGJveGVzIHRvIGRpc3BsYXkgaW1hZ2VzIHdoaWNoIGFyZW4ndCBhc3NvY2lhdGVkXG4gICAgLy8gd2l0aCBldmVudHMuXG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQsXG4gICAgcGVybWFsaW5rQ3JlYXRvcjogUm9vbVBlcm1hbGlua0NyZWF0b3IsXG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHpvb206IG51bWJlcixcbiAgICBtaW5ab29tOiBudW1iZXIsXG4gICAgbWF4Wm9vbTogbnVtYmVyLFxuICAgIHJvdGF0aW9uOiBudW1iZXIsXG4gICAgdHJhbnNsYXRpb25YOiBudW1iZXIsXG4gICAgdHJhbnNsYXRpb25ZOiBudW1iZXIsXG4gICAgbW92aW5nOiBib29sZWFuLFxuICAgIGNvbnRleHRNZW51RGlzcGxheWVkOiBib29sZWFuLFxufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5lbGVtZW50cy5JbWFnZVZpZXdcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEltYWdlVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHpvb206IDAsXG4gICAgICAgICAgICBtaW5ab29tOiBNQVhfU0NBTEUsXG4gICAgICAgICAgICBtYXhab29tOiBNQVhfU0NBTEUsXG4gICAgICAgICAgICByb3RhdGlvbjogMCxcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uWDogMCxcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uWTogMCxcbiAgICAgICAgICAgIG1vdmluZzogZmFsc2UsXG4gICAgICAgICAgICBjb250ZXh0TWVudURpc3BsYXllZDogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gWFhYOiBSZWZzIHRvIGZ1bmN0aW9uYWwgY29tcG9uZW50c1xuICAgIHByaXZhdGUgY29udGV4dE1lbnVCdXR0b24gPSBjcmVhdGVSZWY8YW55PigpO1xuICAgIHByaXZhdGUgZm9jdXNMb2NrID0gY3JlYXRlUmVmPGFueT4oKTtcbiAgICBwcml2YXRlIGltYWdlV3JhcHBlciA9IGNyZWF0ZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcbiAgICBwcml2YXRlIGltYWdlID0gY3JlYXRlUmVmPEhUTUxJbWFnZUVsZW1lbnQ+KCk7XG5cbiAgICBwcml2YXRlIGluaXRYID0gMDtcbiAgICBwcml2YXRlIGluaXRZID0gMDtcbiAgICBwcml2YXRlIGxhc3RYID0gMDtcbiAgICBwcml2YXRlIGxhc3RZID0gMDtcbiAgICBwcml2YXRlIHByZXZpb3VzWCA9IDA7XG4gICAgcHJpdmF0ZSBwcmV2aW91c1kgPSAwO1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIC8vIFdlIGhhdmUgdG8gdXNlIGFkZEV2ZW50TGlzdGVuZXIoKSBiZWNhdXNlIHRoZSBsaXN0ZW5lclxuICAgICAgICAvLyBuZWVkcyB0byBiZSBwYXNzaXZlIGluIG9yZGVyIHRvIHdvcmsgd2l0aCBDaHJvbWl1bVxuICAgICAgICB0aGlzLmZvY3VzTG9jay5jdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgdGhpcy5vbldoZWVsLCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuICAgICAgICAvLyBXZSB3YW50IHRvIHJlY2FsY3VsYXRlIHpvb20gd2hlbmV2ZXIgdGhlIHdpbmRvdydzIHNpemUgY2hhbmdlc1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLmNhbGN1bGF0ZVpvb20pO1xuICAgICAgICAvLyBBZnRlciB0aGUgaW1hZ2UgbG9hZHMgZm9yIHRoZSBmaXJzdCB0aW1lIHdlIHdhbnQgdG8gY2FsY3VsYXRlIHRoZSB6b29tXG4gICAgICAgIHRoaXMuaW1hZ2UuY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCB0aGlzLmNhbGN1bGF0ZVpvb20pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLmZvY3VzTG9jay5jdXJyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3doZWVsJywgdGhpcy5vbldoZWVsKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNhbGN1bGF0ZVpvb20gPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGltYWdlID0gdGhpcy5pbWFnZS5jdXJyZW50O1xuICAgICAgICBjb25zdCBpbWFnZVdyYXBwZXIgPSB0aGlzLmltYWdlV3JhcHBlci5jdXJyZW50O1xuXG4gICAgICAgIGNvbnN0IHpvb21YID0gaW1hZ2VXcmFwcGVyLmNsaWVudFdpZHRoIC8gaW1hZ2UubmF0dXJhbFdpZHRoO1xuICAgICAgICBjb25zdCB6b29tWSA9IGltYWdlV3JhcHBlci5jbGllbnRIZWlnaHQgLyBpbWFnZS5uYXR1cmFsSGVpZ2h0O1xuXG4gICAgICAgIC8vIElmIHRoZSBpbWFnZSBpcyBzbWFsbGVyIGluIGJvdGggZGltZW5zaW9ucyBzZXQgaXRzIHRoZSB6b29tIHRvIDEgdG9cbiAgICAgICAgLy8gZGlzcGxheSBpdCBpbiBpdHMgb3JpZ2luYWwgc2l6ZVxuICAgICAgICBpZiAoem9vbVggPj0gMSAmJiB6b29tWSA+PSAxKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB6b29tOiAxLFxuICAgICAgICAgICAgICAgIG1pblpvb206IDEsXG4gICAgICAgICAgICAgICAgbWF4Wm9vbTogMSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdlIHNldCBtaW5ab29tIHRvIHRoZSBtaW4gb2YgdGhlIHpvb21YIGFuZCB6b29tWSB0byBhdm9pZCBvdmVyZmxvdyBpblxuICAgICAgICAvLyBhbnkgZGlyZWN0aW9uLiBXZSBhbHNvIG11bHRpcGx5IGJ5IE1BWF9TQ0FMRSB0byBnZXQgYSBnYXAgYXJvdW5kIHRoZVxuICAgICAgICAvLyBpbWFnZSBieSBkZWZhdWx0XG4gICAgICAgIGNvbnN0IG1pblpvb20gPSBNYXRoLm1pbih6b29tWCwgem9vbVkpICogTUFYX1NDQUxFO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnpvb20gPD0gdGhpcy5zdGF0ZS5taW5ab29tKSB0aGlzLnNldFN0YXRlKHt6b29tOiBtaW5ab29tfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbWluWm9vbTogbWluWm9vbSxcbiAgICAgICAgICAgIG1heFpvb206IDEsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgem9vbShkZWx0YTogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IG5ld1pvb20gPSB0aGlzLnN0YXRlLnpvb20gKyBkZWx0YTtcblxuICAgICAgICBpZiAobmV3Wm9vbSA8PSB0aGlzLnN0YXRlLm1pblpvb20pIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHpvb206IHRoaXMuc3RhdGUubWluWm9vbSxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblg6IDAsXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRpb25ZOiAwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5ld1pvb20gPj0gdGhpcy5zdGF0ZS5tYXhab29tKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHt6b29tOiB0aGlzLnN0YXRlLm1heFpvb219KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgem9vbTogbmV3Wm9vbSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbldoZWVsID0gKGV2OiBXaGVlbEV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnN0IHtkZWx0YVl9ID0gbm9ybWFsaXplV2hlZWxFdmVudChldik7XG4gICAgICAgIHRoaXMuem9vbSgtKGRlbHRhWSAqIFpPT01fQ09FRkZJQ0lFTlQpKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblpvb21JbkNsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnpvb20oWk9PTV9TVEVQKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblpvb21PdXRDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy56b29tKC1aT09NX1NURVApO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uS2V5RG93biA9IChldjogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICBpZiAoZXYua2V5ID09PSBLZXkuRVNDQVBFKSB7XG4gICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUm90YXRlQ291bnRlckNsb2Nrd2lzZUNsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBjdXIgPSB0aGlzLnN0YXRlLnJvdGF0aW9uO1xuICAgICAgICBjb25zdCByb3RhdGlvbkRlZ3JlZXMgPSBjdXIgLSA5MDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJvdGF0aW9uOiByb3RhdGlvbkRlZ3JlZXMgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb3RhdGVDbG9ja3dpc2VDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgY3VyID0gdGhpcy5zdGF0ZS5yb3RhdGlvbjtcbiAgICAgICAgY29uc3Qgcm90YXRpb25EZWdyZWVzID0gY3VyICsgOTA7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyByb3RhdGlvbjogcm90YXRpb25EZWdyZWVzIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRG93bmxvYWRDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgICBhLmhyZWYgPSB0aGlzLnByb3BzLnNyYztcbiAgICAgICAgYS5kb3dubG9hZCA9IHRoaXMucHJvcHMubmFtZTtcbiAgICAgICAgYS50YXJnZXQgPSBcIl9ibGFua1wiO1xuICAgICAgICBhLmNsaWNrKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25PcGVuQ29udGV4dE1lbnUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY29udGV4dE1lbnVEaXNwbGF5ZWQ6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2xvc2VDb250ZXh0TWVudSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjb250ZXh0TWVudURpc3BsYXllZDogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGVybWFsaW5rQ2xpY2tlZCA9IChldjogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAvLyBUaGlzIGFsbG93cyB0aGUgcGVybWFsaW5rIHRvIGJlIG9wZW5lZCBpbiBhIG5ldyB0YWIvd2luZG93IG9yIGNvcGllZCBhc1xuICAgICAgICAvLyBtYXRyaXgudG8sIGJ1dCBhbHNvIGZvciBpdCB0byBlbmFibGUgcm91dGluZyB3aXRoaW4gRWxlbWVudCB3aGVuIGNsaWNrZWQuXG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgZXZlbnRfaWQ6IHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpLFxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQ6IHRydWUsXG4gICAgICAgICAgICByb29tX2lkOiB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCksXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblN0YXJ0TW92aW5nID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIHdlIHByZXNzZWQgYW55XG4gICAgICAgIC8vIG90aGVyIGJ1dHRvbiB0aGFuIHRoZSBsZWZ0IG9uZVxuICAgICAgICBpZiAoZXYuYnV0dG9uICE9PSAwKSByZXR1cm47XG5cbiAgICAgICAgLy8gWm9vbSBpbiBpZiB3ZSBhcmUgY29tcGxldGVseSB6b29tZWQgb3V0XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnpvb20gPT09IHRoaXMuc3RhdGUubWluWm9vbSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7em9vbTogdGhpcy5zdGF0ZS5tYXhab29tfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHttb3Zpbmc6IHRydWV9KTtcbiAgICAgICAgdGhpcy5wcmV2aW91c1ggPSB0aGlzLnN0YXRlLnRyYW5zbGF0aW9uWDtcbiAgICAgICAgdGhpcy5wcmV2aW91c1kgPSB0aGlzLnN0YXRlLnRyYW5zbGF0aW9uWTtcbiAgICAgICAgdGhpcy5pbml0WCA9IGV2LnBhZ2VYIC0gdGhpcy5sYXN0WDtcbiAgICAgICAgdGhpcy5pbml0WSA9IGV2LnBhZ2VZIC0gdGhpcy5sYXN0WTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk1vdmluZyA9IChldjogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUubW92aW5nKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5sYXN0WCA9IGV2LnBhZ2VYIC0gdGhpcy5pbml0WDtcbiAgICAgICAgdGhpcy5sYXN0WSA9IGV2LnBhZ2VZIC0gdGhpcy5pbml0WTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0cmFuc2xhdGlvblg6IHRoaXMubGFzdFgsXG4gICAgICAgICAgICB0cmFuc2xhdGlvblk6IHRoaXMubGFzdFksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRW5kTW92aW5nID0gKCkgPT4ge1xuICAgICAgICAvLyBab29tIG91dCBpZiB3ZSBoYXZlbid0IG1vdmVkIG11Y2hcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5tb3ZpbmcgPT09IHRydWUgJiZcbiAgICAgICAgICAgIE1hdGguYWJzKHRoaXMuc3RhdGUudHJhbnNsYXRpb25YIC0gdGhpcy5wcmV2aW91c1gpIDwgWk9PTV9ESVNUQU5DRSAmJlxuICAgICAgICAgICAgTWF0aC5hYnModGhpcy5zdGF0ZS50cmFuc2xhdGlvblkgLSB0aGlzLnByZXZpb3VzWSkgPCBaT09NX0RJU1RBTkNFXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgem9vbTogdGhpcy5zdGF0ZS5taW5ab29tLFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uWDogMCxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblk6IDAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHttb3Zpbmc6IGZhbHNlfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyQ29udGV4dE1lbnUoKSB7XG4gICAgICAgIGxldCBjb250ZXh0TWVudSA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmNvbnRleHRNZW51RGlzcGxheWVkKSB7XG4gICAgICAgICAgICBjb250ZXh0TWVudSA9IChcbiAgICAgICAgICAgICAgICA8Q29udGV4dE1lbnVcbiAgICAgICAgICAgICAgICAgICAgey4uLmFib3ZlTGVmdE9mKHRoaXMuY29udGV4dE1lbnVCdXR0b24uY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSl9XG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25DbG9zZUNvbnRleHRNZW51fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPE1lc3NhZ2VDb250ZXh0TWVudVxuICAgICAgICAgICAgICAgICAgICAgICAgbXhFdmVudD17dGhpcy5wcm9wcy5teEV2ZW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcj17dGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkNsb3NlQ29udGV4dE1lbnV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsb3NlRGlhbG9nPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9Db250ZXh0TWVudT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgIHsgY29udGV4dE1lbnUgfVxuICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHNob3dFdmVudE1ldGEgPSAhIXRoaXMucHJvcHMubXhFdmVudDtcbiAgICAgICAgY29uc3Qgem9vbWluZ0Rpc2FibGVkID0gdGhpcy5zdGF0ZS5tYXhab29tID09PSB0aGlzLnN0YXRlLm1pblpvb207XG5cbiAgICAgICAgbGV0IGN1cnNvcjtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubW92aW5nKSB7XG4gICAgICAgICAgICBjdXJzb3I9IFwiZ3JhYmJpbmdcIjtcbiAgICAgICAgfSBlbHNlIGlmICh6b29taW5nRGlzYWJsZWQpIHtcbiAgICAgICAgICAgIGN1cnNvciA9IFwiZGVmYXVsdFwiO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuem9vbSA9PT0gdGhpcy5zdGF0ZS5taW5ab29tKSB7XG4gICAgICAgICAgICBjdXJzb3IgPSBcInpvb20taW5cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGN1cnNvciA9IFwiem9vbS1vdXRcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByb3RhdGlvbkRlZ3JlZXMgPSB0aGlzLnN0YXRlLnJvdGF0aW9uICsgXCJkZWdcIjtcbiAgICAgICAgY29uc3Qgem9vbSA9IHRoaXMuc3RhdGUuem9vbTtcbiAgICAgICAgY29uc3QgdHJhbnNsYXRlUGl4ZWxzWCA9IHRoaXMuc3RhdGUudHJhbnNsYXRpb25YICsgXCJweFwiO1xuICAgICAgICBjb25zdCB0cmFuc2xhdGVQaXhlbHNZID0gdGhpcy5zdGF0ZS50cmFuc2xhdGlvblkgKyBcInB4XCI7XG4gICAgICAgIC8vIFRoZSBvcmRlciBvZiB0aGUgdmFsdWVzIGlzIGltcG9ydGFudCFcbiAgICAgICAgLy8gRmlyc3QsIHdlIHRyYW5zbGF0ZSBhbmQgb25seSB0aGVuIHdlIHJvdGF0ZSwgb3RoZXJ3aXNlXG4gICAgICAgIC8vIHdlIHdvdWxkIGFwcGx5IHRoZSB0cmFuc2xhdGlvbiB0byBhbiBhbHJlYWR5IHJvdGF0ZWRcbiAgICAgICAgLy8gaW1hZ2UgY2F1c2luZyBpdCB0cmFuc2xhdGUgaW4gdGhlIHdyb25nIGRpcmVjdGlvbi5cbiAgICAgICAgY29uc3Qgc3R5bGUgPSB7XG4gICAgICAgICAgICBjdXJzb3I6IGN1cnNvcixcbiAgICAgICAgICAgIHRyYW5zaXRpb246IHRoaXMuc3RhdGUubW92aW5nID8gbnVsbCA6IFwidHJhbnNmb3JtIDIwMG1zIGVhc2UgMHNcIixcbiAgICAgICAgICAgIHRyYW5zZm9ybTogYHRyYW5zbGF0ZVgoJHt0cmFuc2xhdGVQaXhlbHNYfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVkoJHt0cmFuc2xhdGVQaXhlbHNZfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlKCR7em9vbX0pXG4gICAgICAgICAgICAgICAgICAgICAgICByb3RhdGUoJHtyb3RhdGlvbkRlZ3JlZXN9KWAsXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGluZm87XG4gICAgICAgIGlmIChzaG93RXZlbnRNZXRhKSB7XG4gICAgICAgICAgICBjb25zdCBteEV2ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50O1xuICAgICAgICAgICAgY29uc3Qgc2hvd1R3ZWx2ZUhvdXIgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd1R3ZWx2ZUhvdXJUaW1lc3RhbXBzXCIpO1xuICAgICAgICAgICAgbGV0IHBlcm1hbGluayA9IFwiI1wiO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvcikge1xuICAgICAgICAgICAgICAgIHBlcm1hbGluayA9IHRoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvci5mb3JFdmVudCh0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNlbmRlck5hbWUgPSBteEV2ZW50LnNlbmRlciA/IG14RXZlbnQuc2VuZGVyLm5hbWUgOiBteEV2ZW50LmdldFNlbmRlcigpO1xuICAgICAgICAgICAgY29uc3Qgc2VuZGVyID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X2luZm9fc2VuZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIHtzZW5kZXJOYW1lfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2VUaW1lc3RhbXAgPSAoXG4gICAgICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICAgICAgaHJlZj17cGVybWFsaW5rfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUGVybWFsaW5rQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17Zm9ybWF0RnVsbERhdGUobmV3IERhdGUodGhpcy5wcm9wcy5teEV2ZW50LmdldFRzKCkpLCBzaG93VHdlbHZlSG91ciwgZmFsc2UpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPE1lc3NhZ2VUaW1lc3RhbXBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dGdWxsRGF0ZT17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dUd2VsdmVIb3VyPXtzaG93VHdlbHZlSG91cn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRzPXtteEV2ZW50LmdldFRzKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93U2Vjb25kcz17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IGF2YXRhciA9IChcbiAgICAgICAgICAgICAgICA8TWVtYmVyQXZhdGFyXG4gICAgICAgICAgICAgICAgICAgIG1lbWJlcj17bXhFdmVudC5zZW5kZXJ9XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoPXszMn0gaGVpZ2h0PXszMn1cbiAgICAgICAgICAgICAgICAgICAgdmlld1VzZXJPbkNsaWNrPXt0cnVlfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpbmZvID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X2luZm9fd3JhcHBlclwiPlxuICAgICAgICAgICAgICAgICAgICB7YXZhdGFyfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0ltYWdlVmlld19pbmZvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2VuZGVyfVxuICAgICAgICAgICAgICAgICAgICAgICAge21lc3NhZ2VUaW1lc3RhbXB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIGV2ZW50IC0gd2UncmUgdmlld2luZyBhbiBhdmF0YXIsIHdlIHNldFxuICAgICAgICAgICAgLy8gYW4gZW1wdHkgZGl2IGhlcmUsIHNpbmNlIHRoZSBwYW5lbCB1c2VzIHNwYWNlLWJldHdlZW5cbiAgICAgICAgICAgIC8vIGFuZCB3ZSB3YW50IHRoZSBzYW1lIHBsYWNlbWVudCBvZiBlbGVtZW50c1xuICAgICAgICAgICAgaW5mbyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2PjwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjb250ZXh0TWVudUJ1dHRvbjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubXhFdmVudCkge1xuICAgICAgICAgICAgY29udGV4dE1lbnVCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPENvbnRleHRNZW51VG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfYnV0dG9uIG14X0ltYWdlVmlld19idXR0b25fbW9yZVwiXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIk9wdGlvbnNcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25PcGVuQ29udGV4dE1lbnV9XG4gICAgICAgICAgICAgICAgICAgIGlucHV0UmVmPXt0aGlzLmNvbnRleHRNZW51QnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICBpc0V4cGFuZGVkPXt0aGlzLnN0YXRlLmNvbnRleHRNZW51RGlzcGxheWVkfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHpvb21PdXRCdXR0b247XG4gICAgICAgIGxldCB6b29tSW5CdXR0b247XG4gICAgICAgIGlmICghem9vbWluZ0Rpc2FibGVkKSB7XG4gICAgICAgICAgICB6b29tT3V0QnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfYnV0dG9uIG14X0ltYWdlVmlld19idXR0b25fem9vbU91dFwiXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlpvb20gb3V0XCIpfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uWm9vbU91dENsaWNrfT5cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVUb29sdGlwQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHpvb21JbkJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X2J1dHRvbiBteF9JbWFnZVZpZXdfYnV0dG9uX3pvb21JblwiXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlpvb20gaW5cIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyB0aGlzLm9uWm9vbUluQ2xpY2sgfT5cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVUb29sdGlwQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Rm9jdXNMb2NrXG4gICAgICAgICAgICAgICAgcmV0dXJuRm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgbG9ja1Byb3BzPXt7XG4gICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bjogdGhpcy5vbktleURvd24sXG4gICAgICAgICAgICAgICAgICAgIHJvbGU6IFwiZGlhbG9nXCIsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdcIlxuICAgICAgICAgICAgICAgIHJlZj17dGhpcy5mb2N1c0xvY2t9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfcGFuZWxcIj5cbiAgICAgICAgICAgICAgICAgICAge2luZm99XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X3Rvb2xiYXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0ltYWdlVmlld19idXR0b24gbXhfSW1hZ2VWaWV3X2J1dHRvbl9yb3RhdGVDV1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiUm90YXRlIFJpZ2h0XCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Sb3RhdGVDbG9ja3dpc2VDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVUb29sdGlwQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X2J1dHRvbiBteF9JbWFnZVZpZXdfYnV0dG9uX3JvdGF0ZUNDV1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiUm90YXRlIExlZnRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17IHRoaXMub25Sb3RhdGVDb3VudGVyQ2xvY2t3aXNlQ2xpY2sgfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICB7em9vbU91dEJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHt6b29tSW5CdXR0b259XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfYnV0dG9uIG14X0ltYWdlVmlld19idXR0b25fZG93bmxvYWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIkRvd25sb2FkXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyB0aGlzLm9uRG93bmxvYWRDbGljayB9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtjb250ZXh0TWVudUJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0ltYWdlVmlld19idXR0b24gbXhfSW1hZ2VWaWV3X2J1dHRvbl9jbG9zZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiQ2xvc2VcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17IHRoaXMucHJvcHMub25GaW5pc2hlZCB9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnJlbmRlckNvbnRleHRNZW51KCl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X2ltYWdlX3dyYXBwZXJcIlxuICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuaW1hZ2VXcmFwcGVyfT5cbiAgICAgICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICAgICAgc3JjPXt0aGlzLnByb3BzLnNyY31cbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXt0aGlzLnByb3BzLm5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17c3R5bGV9XG4gICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuaW1hZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfaW1hZ2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd249e3RoaXMub25TdGFydE1vdmluZ31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VNb3ZlPXt0aGlzLm9uTW92aW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZVVwPXt0aGlzLm9uRW5kTW92aW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXt0aGlzLm9uRW5kTW92aW5nfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9Gb2N1c0xvY2s+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19