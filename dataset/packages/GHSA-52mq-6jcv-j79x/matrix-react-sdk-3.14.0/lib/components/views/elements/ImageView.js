"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _DateUtils = require("../../../DateUtils");

var _languageHandler = require("../../../languageHandler");

var _filesize = _interopRequireDefault(require("filesize"));

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _Keyboard = require("../../../Keyboard");

var _reactFocusLock = _interopRequireDefault(require("react-focus-lock"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

class ImageView extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onKeyDown", ev => {
      if (ev.key === _Keyboard.Key.ESCAPE) {
        ev.stopPropagation();
        ev.preventDefault();
        this.props.onFinished();
      }
    });
    (0, _defineProperty2.default)(this, "onRedactClick", () => {
      const ConfirmRedactDialog = sdk.getComponent("dialogs.ConfirmRedactDialog");

      _Modal.default.createTrackedDialog('Confirm Redact Dialog', 'Image View', ConfirmRedactDialog, {
        onFinished: proceed => {
          if (!proceed) return;
          this.props.onFinished();

          _MatrixClientPeg.MatrixClientPeg.get().redactEvent(this.props.mxEvent.getRoomId(), this.props.mxEvent.getId()).catch(function (e) {
            const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog"); // display error message stating you couldn't delete this.

            const code = e.errcode || e.statusCode;

            _Modal.default.createTrackedDialog('You cannot delete this image.', '', ErrorDialog, {
              title: (0, _languageHandler._t)('Error'),
              description: (0, _languageHandler._t)('You cannot delete this image. (%(code)s)', {
                code: code
              })
            });
          });
        }
      });
    });
    (0, _defineProperty2.default)(this, "rotateCounterClockwise", () => {
      const cur = this.state.rotationDegrees;
      const rotationDegrees = (cur - 90) % 360;
      this.setState({
        rotationDegrees
      });
    });
    (0, _defineProperty2.default)(this, "rotateClockwise", () => {
      const cur = this.state.rotationDegrees;
      const rotationDegrees = (cur + 90) % 360;
      this.setState({
        rotationDegrees
      });
    });
    this.state = {
      rotationDegrees: 0
    };
  }

  getName() {
    let name = this.props.name;

    if (name && this.props.link) {
      name = /*#__PURE__*/_react.default.createElement("a", {
        href: this.props.link,
        target: "_blank",
        rel: "noreferrer noopener"
      }, name);
    }

    return name;
  }

  render() {
    /*
            // In theory max-width: 80%, max-height: 80% on the CSS should work
            // but in practice, it doesn't, so do it manually:
    
            var width = this.props.width || 500;
            var height = this.props.height || 500;
    
            var maxWidth = document.documentElement.clientWidth * 0.8;
            var maxHeight = document.documentElement.clientHeight * 0.8;
    
            var widthFrac = width / maxWidth;
            var heightFrac = height / maxHeight;
    
            var displayWidth;
            var displayHeight;
            if (widthFrac > heightFrac) {
                displayWidth = Math.min(width, maxWidth);
                displayHeight = (displayWidth / width) * height;
            } else {
                displayHeight = Math.min(height, maxHeight);
                displayWidth = (displayHeight / height) * width;
            }
    
            var style = {
                width: displayWidth,
                height: displayHeight
            };
    */
    let style = {};
    let res;

    if (this.props.width && this.props.height) {
      style = {
        width: this.props.width,
        height: this.props.height
      };
      res = style.width + "x" + style.height + "px";
    }

    let size;

    if (this.props.fileSize) {
      size = (0, _filesize.default)(this.props.fileSize);
    }

    let sizeRes;

    if (size && res) {
      sizeRes = size + ", " + res;
    } else {
      sizeRes = size || res;
    }

    let mayRedact = false;
    const showEventMeta = !!this.props.mxEvent;
    let eventMeta;

    if (showEventMeta) {
      // Figure out the sender, defaulting to mxid
      let sender = this.props.mxEvent.getSender();

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const room = cli.getRoom(this.props.mxEvent.getRoomId());

      if (room) {
        mayRedact = room.currentState.maySendRedactionForEvent(this.props.mxEvent, cli.credentials.userId);
        const member = room.getMember(sender);
        if (member) sender = member.name;
      }

      eventMeta = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ImageView_metadata"
      }, (0, _languageHandler._t)('Uploaded on %(date)s by %(user)s', {
        date: (0, _DateUtils.formatDate)(new Date(this.props.mxEvent.getTs())),
        user: sender
      }));
    }

    let eventRedact;

    if (mayRedact) {
      eventRedact = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ImageView_button",
        onClick: this.onRedactClick
      }, (0, _languageHandler._t)('Remove'));
    }

    const rotationDegrees = this.state.rotationDegrees;

    const effectiveStyle = _objectSpread({
      transform: `rotate(${rotationDegrees}deg)`
    }, style);

    return /*#__PURE__*/_react.default.createElement(_reactFocusLock.default, {
      returnFocus: true,
      lockProps: {
        onKeyDown: this.onKeyDown,
        role: "dialog"
      },
      className: "mx_ImageView"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ImageView_lhs"
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ImageView_content"
    }, /*#__PURE__*/_react.default.createElement("img", {
      src: this.props.src,
      title: this.props.name,
      style: effectiveStyle,
      className: "mainImage"
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ImageView_labelWrapper"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ImageView_label"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_ImageView_rotateCounterClockwise",
      title: (0, _languageHandler._t)("Rotate Left"),
      onClick: this.rotateCounterClockwise
    }, /*#__PURE__*/_react.default.createElement("img", {
      src: require("../../../../res/img/rotate-ccw.svg"),
      alt: (0, _languageHandler._t)('Rotate counter-clockwise'),
      width: "18",
      height: "18"
    })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_ImageView_rotateClockwise",
      title: (0, _languageHandler._t)("Rotate Right"),
      onClick: this.rotateClockwise
    }, /*#__PURE__*/_react.default.createElement("img", {
      src: require("../../../../res/img/rotate-cw.svg"),
      alt: (0, _languageHandler._t)('Rotate clockwise'),
      width: "18",
      height: "18"
    })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_ImageView_cancel",
      title: (0, _languageHandler._t)("Close"),
      onClick: this.props.onFinished
    }, /*#__PURE__*/_react.default.createElement("img", {
      src: require("../../../../res/img/cancel-white.svg"),
      width: "18",
      height: "18",
      alt: (0, _languageHandler._t)('Close')
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ImageView_shim"
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ImageView_name"
    }, this.getName()), eventMeta, /*#__PURE__*/_react.default.createElement("a", {
      className: "mx_ImageView_link",
      href: this.props.src,
      download: this.props.name,
      target: "_blank",
      rel: "noopener"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ImageView_download"
    }, (0, _languageHandler._t)('Download this file'), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ImageView_size"
    }, sizeRes))), eventRedact, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ImageView_shim"
    })))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ImageView_rhs"
    }));
  }

}

exports.default = ImageView;
(0, _defineProperty2.default)(ImageView, "propTypes", {
  src: _propTypes.default.string.isRequired,
  // the source of the image being displayed
  name: _propTypes.default.string,
  // the main title ('name') for the image
  link: _propTypes.default.string,
  // the link (if any) applied to the name of the image
  width: _propTypes.default.number,
  // width of the image src in pixels
  height: _propTypes.default.number,
  // height of the image src in pixels
  fileSize: _propTypes.default.number,
  // size of the image src in bytes
  onFinished: _propTypes.default.func.isRequired,
  // callback when the lightbox is dismissed
  // the event (if any) that the Image is displaying. Used for event-specific stuff like
  // redactions, senders, timestamps etc.  Other descriptors are taken from the explicit
  // properties above, which let us use lightboxes to display images which aren't associated
  // with events.
  mxEvent: _propTypes.default.object
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0ltYWdlVmlldy5qcyJdLCJuYW1lcyI6WyJJbWFnZVZpZXciLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJldiIsImtleSIsIktleSIsIkVTQ0FQRSIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0Iiwib25GaW5pc2hlZCIsIkNvbmZpcm1SZWRhY3REaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJwcm9jZWVkIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwicmVkYWN0RXZlbnQiLCJteEV2ZW50IiwiZ2V0Um9vbUlkIiwiZ2V0SWQiLCJjYXRjaCIsImUiLCJFcnJvckRpYWxvZyIsImNvZGUiLCJlcnJjb2RlIiwic3RhdHVzQ29kZSIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJjdXIiLCJzdGF0ZSIsInJvdGF0aW9uRGVncmVlcyIsInNldFN0YXRlIiwiZ2V0TmFtZSIsIm5hbWUiLCJsaW5rIiwicmVuZGVyIiwic3R5bGUiLCJyZXMiLCJ3aWR0aCIsImhlaWdodCIsInNpemUiLCJmaWxlU2l6ZSIsInNpemVSZXMiLCJtYXlSZWRhY3QiLCJzaG93RXZlbnRNZXRhIiwiZXZlbnRNZXRhIiwic2VuZGVyIiwiZ2V0U2VuZGVyIiwiY2xpIiwicm9vbSIsImdldFJvb20iLCJjdXJyZW50U3RhdGUiLCJtYXlTZW5kUmVkYWN0aW9uRm9yRXZlbnQiLCJjcmVkZW50aWFscyIsInVzZXJJZCIsIm1lbWJlciIsImdldE1lbWJlciIsImRhdGUiLCJEYXRlIiwiZ2V0VHMiLCJ1c2VyIiwiZXZlbnRSZWRhY3QiLCJvblJlZGFjdENsaWNrIiwiZWZmZWN0aXZlU3R5bGUiLCJ0cmFuc2Zvcm0iLCJvbktleURvd24iLCJyb2xlIiwic3JjIiwicm90YXRlQ291bnRlckNsb2Nrd2lzZSIsInJlcXVpcmUiLCJyb3RhdGVDbG9ja3dpc2UiLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJpc1JlcXVpcmVkIiwibnVtYmVyIiwiZnVuYyIsIm9iamVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBRWUsTUFBTUEsU0FBTixTQUF3QkMsZUFBTUMsU0FBOUIsQ0FBd0M7QUFpQm5EQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFEZSxxREFLTkMsRUFBRCxJQUFRO0FBQ2hCLFVBQUlBLEVBQUUsQ0FBQ0MsR0FBSCxLQUFXQyxjQUFJQyxNQUFuQixFQUEyQjtBQUN2QkgsUUFBQUEsRUFBRSxDQUFDSSxlQUFIO0FBQ0FKLFFBQUFBLEVBQUUsQ0FBQ0ssY0FBSDtBQUNBLGFBQUtOLEtBQUwsQ0FBV08sVUFBWDtBQUNIO0FBQ0osS0FYa0I7QUFBQSx5REFhSCxNQUFNO0FBQ2xCLFlBQU1DLG1CQUFtQixHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsNkJBQWpCLENBQTVCOztBQUNBQyxxQkFBTUMsbUJBQU4sQ0FBMEIsdUJBQTFCLEVBQW1ELFlBQW5ELEVBQWlFSixtQkFBakUsRUFBc0Y7QUFDbEZELFFBQUFBLFVBQVUsRUFBR00sT0FBRCxJQUFhO0FBQ3JCLGNBQUksQ0FBQ0EsT0FBTCxFQUFjO0FBQ2QsZUFBS2IsS0FBTCxDQUFXTyxVQUFYOztBQUNBTywyQ0FBZ0JDLEdBQWhCLEdBQXNCQyxXQUF0QixDQUNJLEtBQUtoQixLQUFMLENBQVdpQixPQUFYLENBQW1CQyxTQUFuQixFQURKLEVBQ29DLEtBQUtsQixLQUFMLENBQVdpQixPQUFYLENBQW1CRSxLQUFuQixFQURwQyxFQUVFQyxLQUZGLENBRVEsVUFBU0MsQ0FBVCxFQUFZO0FBQ2hCLGtCQUFNQyxXQUFXLEdBQUdiLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixxQkFBakIsQ0FBcEIsQ0FEZ0IsQ0FF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QUZULENBREosQ0FoQkosRUFzQk1tQixXQXRCTixlQXVCSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsTUF2QkosQ0FESixDQUZKLENBVkosZUF5Q0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE1BekNKLENBREo7QUE4Q0g7O0FBMU1rRDs7OzhCQUFsQ2pFLFMsZUFDRTtBQUNmdUUsRUFBQUEsR0FBRyxFQUFFSSxtQkFBVUMsTUFBVixDQUFpQkMsVUFEUDtBQUNtQjtBQUNsQ3hDLEVBQUFBLElBQUksRUFBRXNDLG1CQUFVQyxNQUZEO0FBRVM7QUFDeEJ0QyxFQUFBQSxJQUFJLEVBQUVxQyxtQkFBVUMsTUFIRDtBQUdTO0FBQ3hCbEMsRUFBQUEsS0FBSyxFQUFFaUMsbUJBQVVHLE1BSkY7QUFJVTtBQUN6Qm5DLEVBQUFBLE1BQU0sRUFBRWdDLG1CQUFVRyxNQUxIO0FBS1c7QUFDMUJqQyxFQUFBQSxRQUFRLEVBQUU4QixtQkFBVUcsTUFOTDtBQU1hO0FBQzVCbkUsRUFBQUEsVUFBVSxFQUFFZ0UsbUJBQVVJLElBQVYsQ0FBZUYsVUFQWjtBQU93QjtBQUV2QztBQUNBO0FBQ0E7QUFDQTtBQUNBeEQsRUFBQUEsT0FBTyxFQUFFc0QsbUJBQVVLO0FBYkosQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHtmb3JtYXREYXRlfSBmcm9tICcuLi8uLi8uLi9EYXRlVXRpbHMnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IGZpbGVzaXplIGZyb20gXCJmaWxlc2l6ZVwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4vQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi8uLi9pbmRleFwiO1xuaW1wb3J0IHtLZXl9IGZyb20gXCIuLi8uLi8uLi9LZXlib2FyZFwiO1xuaW1wb3J0IEZvY3VzTG9jayBmcm9tIFwicmVhY3QtZm9jdXMtbG9ja1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbWFnZVZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHNyYzogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLCAvLyB0aGUgc291cmNlIG9mIHRoZSBpbWFnZSBiZWluZyBkaXNwbGF5ZWRcbiAgICAgICAgbmFtZTogUHJvcFR5cGVzLnN0cmluZywgLy8gdGhlIG1haW4gdGl0bGUgKCduYW1lJykgZm9yIHRoZSBpbWFnZVxuICAgICAgICBsaW5rOiBQcm9wVHlwZXMuc3RyaW5nLCAvLyB0aGUgbGluayAoaWYgYW55KSBhcHBsaWVkIHRvIHRoZSBuYW1lIG9mIHRoZSBpbWFnZVxuICAgICAgICB3aWR0aDogUHJvcFR5cGVzLm51bWJlciwgLy8gd2lkdGggb2YgdGhlIGltYWdlIHNyYyBpbiBwaXhlbHNcbiAgICAgICAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLCAvLyBoZWlnaHQgb2YgdGhlIGltYWdlIHNyYyBpbiBwaXhlbHNcbiAgICAgICAgZmlsZVNpemU6IFByb3BUeXBlcy5udW1iZXIsIC8vIHNpemUgb2YgdGhlIGltYWdlIHNyYyBpbiBieXRlc1xuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLCAvLyBjYWxsYmFjayB3aGVuIHRoZSBsaWdodGJveCBpcyBkaXNtaXNzZWRcblxuICAgICAgICAvLyB0aGUgZXZlbnQgKGlmIGFueSkgdGhhdCB0aGUgSW1hZ2UgaXMgZGlzcGxheWluZy4gVXNlZCBmb3IgZXZlbnQtc3BlY2lmaWMgc3R1ZmYgbGlrZVxuICAgICAgICAvLyByZWRhY3Rpb25zLCBzZW5kZXJzLCB0aW1lc3RhbXBzIGV0Yy4gIE90aGVyIGRlc2NyaXB0b3JzIGFyZSB0YWtlbiBmcm9tIHRoZSBleHBsaWNpdFxuICAgICAgICAvLyBwcm9wZXJ0aWVzIGFib3ZlLCB3aGljaCBsZXQgdXMgdXNlIGxpZ2h0Ym94ZXMgdG8gZGlzcGxheSBpbWFnZXMgd2hpY2ggYXJlbid0IGFzc29jaWF0ZWRcbiAgICAgICAgLy8gd2l0aCBldmVudHMuXG4gICAgICAgIG14RXZlbnQ6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHsgcm90YXRpb25EZWdyZWVzOiAwIH07XG4gICAgfVxuXG4gICAgb25LZXlEb3duID0gKGV2KSA9PiB7XG4gICAgICAgIGlmIChldi5rZXkgPT09IEtleS5FU0NBUEUpIHtcbiAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uUmVkYWN0Q2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IENvbmZpcm1SZWRhY3REaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5Db25maXJtUmVkYWN0RGlhbG9nXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdDb25maXJtIFJlZGFjdCBEaWFsb2cnLCAnSW1hZ2UgVmlldycsIENvbmZpcm1SZWRhY3REaWFsb2csIHtcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IChwcm9jZWVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwcm9jZWVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlZGFjdEV2ZW50KFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCksIHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpLFxuICAgICAgICAgICAgICAgICkuY2F0Y2goZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgICAgICAgICAvLyBkaXNwbGF5IGVycm9yIG1lc3NhZ2Ugc3RhdGluZyB5b3UgY291bGRuJ3QgZGVsZXRlIHRoaXMuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBlLmVycmNvZGUgfHwgZS5zdGF0dXNDb2RlO1xuICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdZb3UgY2Fubm90IGRlbGV0ZSB0aGlzIGltYWdlLicsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdFcnJvcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdZb3UgY2Fubm90IGRlbGV0ZSB0aGlzIGltYWdlLiAoJShjb2RlKXMpJywge2NvZGU6IGNvZGV9KSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZ2V0TmFtZSgpIHtcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnByb3BzLm5hbWU7XG4gICAgICAgIGlmIChuYW1lICYmIHRoaXMucHJvcHMubGluaykge1xuICAgICAgICAgICAgbmFtZSA9IDxhIGhyZWY9eyB0aGlzLnByb3BzLmxpbmsgfSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCI+eyBuYW1lIH08L2E+O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYW1lO1xuICAgIH1cblxuICAgIHJvdGF0ZUNvdW50ZXJDbG9ja3dpc2UgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGN1ciA9IHRoaXMuc3RhdGUucm90YXRpb25EZWdyZWVzO1xuICAgICAgICBjb25zdCByb3RhdGlvbkRlZ3JlZXMgPSAoY3VyIC0gOTApICUgMzYwO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcm90YXRpb25EZWdyZWVzIH0pO1xuICAgIH07XG5cbiAgICByb3RhdGVDbG9ja3dpc2UgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGN1ciA9IHRoaXMuc3RhdGUucm90YXRpb25EZWdyZWVzO1xuICAgICAgICBjb25zdCByb3RhdGlvbkRlZ3JlZXMgPSAoY3VyICsgOTApICUgMzYwO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcm90YXRpb25EZWdyZWVzIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4vKlxuICAgICAgICAvLyBJbiB0aGVvcnkgbWF4LXdpZHRoOiA4MCUsIG1heC1oZWlnaHQ6IDgwJSBvbiB0aGUgQ1NTIHNob3VsZCB3b3JrXG4gICAgICAgIC8vIGJ1dCBpbiBwcmFjdGljZSwgaXQgZG9lc24ndCwgc28gZG8gaXQgbWFudWFsbHk6XG5cbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy5wcm9wcy53aWR0aCB8fCA1MDA7XG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLnByb3BzLmhlaWdodCB8fCA1MDA7XG5cbiAgICAgICAgdmFyIG1heFdpZHRoID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoICogMC44O1xuICAgICAgICB2YXIgbWF4SGVpZ2h0ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCAqIDAuODtcblxuICAgICAgICB2YXIgd2lkdGhGcmFjID0gd2lkdGggLyBtYXhXaWR0aDtcbiAgICAgICAgdmFyIGhlaWdodEZyYWMgPSBoZWlnaHQgLyBtYXhIZWlnaHQ7XG5cbiAgICAgICAgdmFyIGRpc3BsYXlXaWR0aDtcbiAgICAgICAgdmFyIGRpc3BsYXlIZWlnaHQ7XG4gICAgICAgIGlmICh3aWR0aEZyYWMgPiBoZWlnaHRGcmFjKSB7XG4gICAgICAgICAgICBkaXNwbGF5V2lkdGggPSBNYXRoLm1pbih3aWR0aCwgbWF4V2lkdGgpO1xuICAgICAgICAgICAgZGlzcGxheUhlaWdodCA9IChkaXNwbGF5V2lkdGggLyB3aWR0aCkgKiBoZWlnaHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaXNwbGF5SGVpZ2h0ID0gTWF0aC5taW4oaGVpZ2h0LCBtYXhIZWlnaHQpO1xuICAgICAgICAgICAgZGlzcGxheVdpZHRoID0gKGRpc3BsYXlIZWlnaHQgLyBoZWlnaHQpICogd2lkdGg7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3R5bGUgPSB7XG4gICAgICAgICAgICB3aWR0aDogZGlzcGxheVdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBkaXNwbGF5SGVpZ2h0XG4gICAgICAgIH07XG4qL1xuICAgICAgICBsZXQgc3R5bGUgPSB7fTtcbiAgICAgICAgbGV0IHJlcztcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy53aWR0aCAmJiB0aGlzLnByb3BzLmhlaWdodCkge1xuICAgICAgICAgICAgc3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMucHJvcHMud2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXMgPSBzdHlsZS53aWR0aCArIFwieFwiICsgc3R5bGUuaGVpZ2h0ICsgXCJweFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNpemU7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmZpbGVTaXplKSB7XG4gICAgICAgICAgICBzaXplID0gZmlsZXNpemUodGhpcy5wcm9wcy5maWxlU2l6ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2l6ZVJlcztcbiAgICAgICAgaWYgKHNpemUgJiYgcmVzKSB7XG4gICAgICAgICAgICBzaXplUmVzID0gc2l6ZSArIFwiLCBcIiArIHJlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNpemVSZXMgPSBzaXplIHx8IHJlcztcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBtYXlSZWRhY3QgPSBmYWxzZTtcbiAgICAgICAgY29uc3Qgc2hvd0V2ZW50TWV0YSA9ICEhdGhpcy5wcm9wcy5teEV2ZW50O1xuXG4gICAgICAgIGxldCBldmVudE1ldGE7XG4gICAgICAgIGlmIChzaG93RXZlbnRNZXRhKSB7XG4gICAgICAgICAgICAvLyBGaWd1cmUgb3V0IHRoZSBzZW5kZXIsIGRlZmF1bHRpbmcgdG8gbXhpZFxuICAgICAgICAgICAgbGV0IHNlbmRlciA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRTZW5kZXIoKTtcbiAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBjbGkuZ2V0Um9vbSh0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCkpO1xuICAgICAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgICAgICBtYXlSZWRhY3QgPSByb29tLmN1cnJlbnRTdGF0ZS5tYXlTZW5kUmVkYWN0aW9uRm9yRXZlbnQodGhpcy5wcm9wcy5teEV2ZW50LCBjbGkuY3JlZGVudGlhbHMudXNlcklkKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtZW1iZXIgPSByb29tLmdldE1lbWJlcihzZW5kZXIpO1xuICAgICAgICAgICAgICAgIGlmIChtZW1iZXIpIHNlbmRlciA9IG1lbWJlci5uYW1lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBldmVudE1ldGEgPSAoPGRpdiBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfbWV0YWRhdGFcIj5cbiAgICAgICAgICAgICAgICB7IF90KCdVcGxvYWRlZCBvbiAlKGRhdGUpcyBieSAlKHVzZXIpcycsIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogZm9ybWF0RGF0ZShuZXcgRGF0ZSh0aGlzLnByb3BzLm14RXZlbnQuZ2V0VHMoKSkpLFxuICAgICAgICAgICAgICAgICAgICB1c2VyOiBzZW5kZXIsXG4gICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgPC9kaXY+KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBldmVudFJlZGFjdDtcbiAgICAgICAgaWYgKG1heVJlZGFjdCkge1xuICAgICAgICAgICAgZXZlbnRSZWRhY3QgPSAoPGRpdiBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfYnV0dG9uXCIgb25DbGljaz17dGhpcy5vblJlZGFjdENsaWNrfT5cbiAgICAgICAgICAgICAgICB7IF90KCdSZW1vdmUnKSB9XG4gICAgICAgICAgICA8L2Rpdj4pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgcm90YXRpb25EZWdyZWVzID0gdGhpcy5zdGF0ZS5yb3RhdGlvbkRlZ3JlZXM7XG4gICAgICAgIGNvbnN0IGVmZmVjdGl2ZVN0eWxlID0ge3RyYW5zZm9ybTogYHJvdGF0ZSgke3JvdGF0aW9uRGVncmVlc31kZWcpYCwgLi4uc3R5bGV9O1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Rm9jdXNMb2NrXG4gICAgICAgICAgICAgICAgcmV0dXJuRm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgbG9ja1Byb3BzPXt7XG4gICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bjogdGhpcy5vbktleURvd24sXG4gICAgICAgICAgICAgICAgICAgIHJvbGU6IFwiZGlhbG9nXCIsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X2xoc1wiPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9e3RoaXMucHJvcHMuc3JjfSB0aXRsZT17dGhpcy5wcm9wcy5uYW1lfSBzdHlsZT17ZWZmZWN0aXZlU3R5bGV9IGNsYXNzTmFtZT1cIm1haW5JbWFnZVwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X2xhYmVsV3JhcHBlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfcm90YXRlQ291bnRlckNsb2Nrd2lzZVwiIHRpdGxlPXtfdChcIlJvdGF0ZSBMZWZ0XCIpfSBvbkNsaWNrPXsgdGhpcy5yb3RhdGVDb3VudGVyQ2xvY2t3aXNlIH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9yb3RhdGUtY2N3LnN2Z1wiKX0gYWx0PXsgX3QoJ1JvdGF0ZSBjb3VudGVyLWNsb2Nrd2lzZScpIH0gd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X3JvdGF0ZUNsb2Nrd2lzZVwiIHRpdGxlPXtfdChcIlJvdGF0ZSBSaWdodFwiKX0gb25DbGljaz17IHRoaXMucm90YXRlQ2xvY2t3aXNlIH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9yb3RhdGUtY3cuc3ZnXCIpfSBhbHQ9eyBfdCgnUm90YXRlIGNsb2Nrd2lzZScpIH0gd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X2NhbmNlbFwiIHRpdGxlPXtfdChcIkNsb3NlXCIpfSBvbkNsaWNrPXsgdGhpcy5wcm9wcy5vbkZpbmlzaGVkIH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvY2FuY2VsLXdoaXRlLnN2Z1wiKX0gd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgYWx0PXsgX3QoJ0Nsb3NlJykgfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0ltYWdlVmlld19zaGltXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfbmFtZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMuZ2V0TmFtZSgpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGV2ZW50TWV0YSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X2xpbmtcIiBocmVmPXsgdGhpcy5wcm9wcy5zcmMgfSBkb3dubG9hZD17IHRoaXMucHJvcHMubmFtZSB9IHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X2Rvd25sb2FkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnRG93bmxvYWQgdGhpcyBmaWxlJykgfTxiciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfc2l6ZVwiPnsgc2l6ZVJlcyB9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBldmVudFJlZGFjdCB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9JbWFnZVZpZXdfc2hpbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfSW1hZ2VWaWV3X3Joc1wiPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9Gb2N1c0xvY2s+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19