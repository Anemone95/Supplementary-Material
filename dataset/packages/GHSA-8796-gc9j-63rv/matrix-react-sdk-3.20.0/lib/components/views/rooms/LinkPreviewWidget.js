"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _htmlEntities = require("html-entities");

var _HtmlUtils = require("../../../HtmlUtils");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../index"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var ImageUtils = _interopRequireWildcard(require("../../../ImageUtils"));

var _languageHandler = require("../../../languageHandler");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _Media = require("../../../customisations/Media");

var _dec, _class, _class2, _temp;

let LinkPreviewWidget = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.LinkPreviewWidget"), _dec(_class = (_temp = _class2 = class LinkPreviewWidget extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onImageClick", ev => {
      const p = this.state.preview;
      if (ev.button != 0 || ev.metaKey) return;
      ev.preventDefault();
      const ImageView = sdk.getComponent("elements.ImageView");
      let src = p["og:image"];

      if (src && src.startsWith("mxc://")) {
        src = (0, _Media.mediaFromMxc)(src).srcHttp;
      }

      const params = {
        src: src,
        width: p["og:image:width"],
        height: p["og:image:height"],
        name: p["og:title"] || p["og:description"] || this.props.link,
        fileSize: p["matrix:image:size"],
        link: this.props.link
      };

      _Modal.default.createDialog(ImageView, params, "mx_Dialog_lightbox", null, true);
    });
    this.state = {
      preview: null
    };
    this.unmounted = false;

    _MatrixClientPeg.MatrixClientPeg.get().getUrlPreview(this.props.link, this.props.mxEvent.getTs()).then(res => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        preview: res
      }, this.props.onHeightChanged);
    }, error => {
      console.error("Failed to get URL preview: " + error);
    });

    this._description = /*#__PURE__*/(0, _react.createRef)();
  }

  componentDidMount() {
    if (this._description.current) {
      (0, _HtmlUtils.linkifyElement)(this._description.current);
    }
  }

  componentDidUpdate() {
    if (this._description.current) {
      (0, _HtmlUtils.linkifyElement)(this._description.current);
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  render() {
    const p = this.state.preview;

    if (!p || Object.keys(p).length === 0) {
      return /*#__PURE__*/_react.default.createElement("div", null);
    } // FIXME: do we want to factor out all image displaying between this and MImageBody - especially for lightboxing?


    let image = p["og:image"];

    if (!_SettingsStore.default.getValue("showImages")) {
      image = null; // Don't render a button to show the image, just hide it outright
    }

    const imageMaxWidth = 100;
    const imageMaxHeight = 100;

    if (image && image.startsWith("mxc://")) {
      // We deliberately don't want a square here, so use the source HTTP thumbnail function
      image = (0, _Media.mediaFromMxc)(image).getThumbnailOfSourceHttp(imageMaxWidth, imageMaxHeight, 'scale');
    }

    let thumbHeight = imageMaxHeight;

    if (p["og:image:width"] && p["og:image:height"]) {
      thumbHeight = ImageUtils.thumbHeight(p["og:image:width"], p["og:image:height"], imageMaxWidth, imageMaxHeight);
    }

    let img;

    if (image) {
      img = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_LinkPreviewWidget_image",
        style: {
          height: thumbHeight
        }
      }, /*#__PURE__*/_react.default.createElement("img", {
        style: {
          maxWidth: imageMaxWidth,
          maxHeight: imageMaxHeight
        },
        src: image,
        onClick: this.onImageClick
      }));
    } // The description includes &-encoded HTML entities, we decode those as React treats the thing as an
    // opaque string. This does not allow any HTML to be injected into the DOM.


    const description = _htmlEntities.AllHtmlEntities.decode(p["og:description"] || "");

    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LinkPreviewWidget"
    }, img, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LinkPreviewWidget_caption"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LinkPreviewWidget_title"
    }, /*#__PURE__*/_react.default.createElement("a", {
      href: this.props.link,
      target: "_blank",
      rel: "noreferrer noopener"
    }, p["og:title"])), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LinkPreviewWidget_siteName"
    }, p["og:site_name"] ? " - " + p["og:site_name"] : null), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LinkPreviewWidget_description",
      ref: this._description
    }, description)), /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      className: "mx_LinkPreviewWidget_cancel",
      onClick: this.props.onCancelClick,
      "aria-label": (0, _languageHandler._t)("Close preview")
    }, /*#__PURE__*/_react.default.createElement("img", {
      className: "mx_filterFlipColor",
      alt: "",
      role: "presentation",
      src: require("../../../../res/img/cancel.svg"),
      width: "18",
      height: "18"
    })));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  link: _propTypes.default.string.isRequired,
  // the URL being previewed
  mxEvent: _propTypes.default.object.isRequired,
  // the Event associated with the preview
  onCancelClick: _propTypes.default.func,
  // called when the preview's cancel ('hide') button is clicked
  onHeightChanged: _propTypes.default.func // called when the preview's contents has loaded

}), _temp)) || _class);
exports.default = LinkPreviewWidget;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL0xpbmtQcmV2aWV3V2lkZ2V0LmpzIl0sIm5hbWVzIjpbIkxpbmtQcmV2aWV3V2lkZ2V0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXYiLCJwIiwic3RhdGUiLCJwcmV2aWV3IiwiYnV0dG9uIiwibWV0YUtleSIsInByZXZlbnREZWZhdWx0IiwiSW1hZ2VWaWV3Iiwic2RrIiwiZ2V0Q29tcG9uZW50Iiwic3JjIiwic3RhcnRzV2l0aCIsInNyY0h0dHAiLCJwYXJhbXMiLCJ3aWR0aCIsImhlaWdodCIsIm5hbWUiLCJsaW5rIiwiZmlsZVNpemUiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsInVubW91bnRlZCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldFVybFByZXZpZXciLCJteEV2ZW50IiwiZ2V0VHMiLCJ0aGVuIiwicmVzIiwic2V0U3RhdGUiLCJvbkhlaWdodENoYW5nZWQiLCJlcnJvciIsImNvbnNvbGUiLCJfZGVzY3JpcHRpb24iLCJjb21wb25lbnREaWRNb3VudCIsImN1cnJlbnQiLCJjb21wb25lbnREaWRVcGRhdGUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbmRlciIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJpbWFnZSIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImltYWdlTWF4V2lkdGgiLCJpbWFnZU1heEhlaWdodCIsImdldFRodW1ibmFpbE9mU291cmNlSHR0cCIsInRodW1iSGVpZ2h0IiwiSW1hZ2VVdGlscyIsImltZyIsIm1heFdpZHRoIiwibWF4SGVpZ2h0Iiwib25JbWFnZUNsaWNrIiwiZGVzY3JpcHRpb24iLCJBbGxIdG1sRW50aXRpZXMiLCJkZWNvZGUiLCJBY2Nlc3NpYmxlQnV0dG9uIiwib25DYW5jZWxDbGljayIsInJlcXVpcmUiLCJQcm9wVHlwZXMiLCJzdHJpbmciLCJpc1JlcXVpcmVkIiwib2Jq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NkYsb0JBQVkseUJBQUcsZUFBSDtBQUF6RyxvQkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDLG9CQUFmO0FBQW9DLE1BQUEsR0FBRyxFQUFDLEVBQXhDO0FBQTJDLE1BQUEsSUFBSSxFQUFDLGNBQWhEO0FBQ0ksTUFBQSxHQUFHLEVBQUVDLE9BQU8sQ0FBQyxnQ0FBRCxDQURoQjtBQUNvRCxNQUFBLEtBQUssRUFBQyxJQUQxRDtBQUMrRCxNQUFBLE1BQU0sRUFBQztBQUR0RSxNQURKLENBVEosQ0FESjtBQWdCSDs7QUE1SDBELEMsc0RBQ3hDO0FBQ2YxQyxFQUFBQSxJQUFJLEVBQUUyQyxtQkFBVUMsTUFBVixDQUFpQkMsVUFEUjtBQUNvQjtBQUNuQ3JDLEVBQUFBLE9BQU8sRUFBRW1DLG1CQUFVRyxNQUFWLENBQWlCRCxVQUZYO0FBRXVCO0FBQ3RDSixFQUFBQSxhQUFhLEVBQUVFLG1CQUFVSSxJQUhWO0FBR2dCO0FBQy9CbEMsRUFBQUEsZUFBZSxFQUFFOEIsbUJBQVVJLElBSlosQ0FJa0I7O0FBSmxCLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlUmVmfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgQWxsSHRtbEVudGl0aWVzIH0gZnJvbSAnaHRtbC1lbnRpdGllcyc7XG5pbXBvcnQge2xpbmtpZnlFbGVtZW50fSBmcm9tICcuLi8uLi8uLi9IdG1sVXRpbHMnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uL2luZGV4XCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgKiBhcyBJbWFnZVV0aWxzIGZyb20gXCIuLi8uLi8uLi9JbWFnZVV0aWxzXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuaW1wb3J0IHttZWRpYUZyb21NeGN9IGZyb20gXCIuLi8uLi8uLi9jdXN0b21pc2F0aW9ucy9NZWRpYVwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5yb29tcy5MaW5rUHJldmlld1dpZGdldFwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGlua1ByZXZpZXdXaWRnZXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGxpbms6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCwgLy8gdGhlIFVSTCBiZWluZyBwcmV2aWV3ZWRcbiAgICAgICAgbXhFdmVudDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLCAvLyB0aGUgRXZlbnQgYXNzb2NpYXRlZCB3aXRoIHRoZSBwcmV2aWV3XG4gICAgICAgIG9uQ2FuY2VsQ2xpY2s6IFByb3BUeXBlcy5mdW5jLCAvLyBjYWxsZWQgd2hlbiB0aGUgcHJldmlldydzIGNhbmNlbCAoJ2hpZGUnKSBidXR0b24gaXMgY2xpY2tlZFxuICAgICAgICBvbkhlaWdodENoYW5nZWQ6IFByb3BUeXBlcy5mdW5jLCAvLyBjYWxsZWQgd2hlbiB0aGUgcHJldmlldydzIGNvbnRlbnRzIGhhcyBsb2FkZWRcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBwcmV2aWV3OiBudWxsLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudW5tb3VudGVkID0gZmFsc2U7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVcmxQcmV2aWV3KHRoaXMucHJvcHMubGluaywgdGhpcy5wcm9wcy5teEV2ZW50LmdldFRzKCkpLnRoZW4oKHJlcyk9PntcbiAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICAgICAgICAgICAgeyBwcmV2aWV3OiByZXMgfSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sIChlcnJvcik9PntcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZ2V0IFVSTCBwcmV2aWV3OiBcIiArIGVycm9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fZGVzY3JpcHRpb24gPSBjcmVhdGVSZWYoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2Rlc2NyaXB0aW9uLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGxpbmtpZnlFbGVtZW50KHRoaXMuX2Rlc2NyaXB0aW9uLmN1cnJlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5fZGVzY3JpcHRpb24uY3VycmVudCkge1xuICAgICAgICAgICAgbGlua2lmeUVsZW1lbnQodGhpcy5fZGVzY3JpcHRpb24uY3VycmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIG9uSW1hZ2VDbGljayA9IGV2ID0+IHtcbiAgICAgICAgY29uc3QgcCA9IHRoaXMuc3RhdGUucHJldmlldztcbiAgICAgICAgaWYgKGV2LmJ1dHRvbiAhPSAwIHx8IGV2Lm1ldGFLZXkpIHJldHVybjtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgSW1hZ2VWaWV3ID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLkltYWdlVmlld1wiKTtcblxuICAgICAgICBsZXQgc3JjID0gcFtcIm9nOmltYWdlXCJdO1xuICAgICAgICBpZiAoc3JjICYmIHNyYy5zdGFydHNXaXRoKFwibXhjOi8vXCIpKSB7XG4gICAgICAgICAgICBzcmMgPSBtZWRpYUZyb21NeGMoc3JjKS5zcmNIdHRwO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICAgICAgc3JjOiBzcmMsXG4gICAgICAgICAgICB3aWR0aDogcFtcIm9nOmltYWdlOndpZHRoXCJdLFxuICAgICAgICAgICAgaGVpZ2h0OiBwW1wib2c6aW1hZ2U6aGVpZ2h0XCJdLFxuICAgICAgICAgICAgbmFtZTogcFtcIm9nOnRpdGxlXCJdIHx8IHBbXCJvZzpkZXNjcmlwdGlvblwiXSB8fCB0aGlzLnByb3BzLmxpbmssXG4gICAgICAgICAgICBmaWxlU2l6ZTogcFtcIm1hdHJpeDppbWFnZTpzaXplXCJdLFxuICAgICAgICAgICAgbGluazogdGhpcy5wcm9wcy5saW5rLFxuICAgICAgICB9O1xuXG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhJbWFnZVZpZXcsIHBhcmFtcywgXCJteF9EaWFsb2dfbGlnaHRib3hcIiwgbnVsbCwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgcCA9IHRoaXMuc3RhdGUucHJldmlldztcbiAgICAgICAgaWYgKCFwIHx8IE9iamVjdC5rZXlzKHApLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIDxkaXYgLz47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGSVhNRTogZG8gd2Ugd2FudCB0byBmYWN0b3Igb3V0IGFsbCBpbWFnZSBkaXNwbGF5aW5nIGJldHdlZW4gdGhpcyBhbmQgTUltYWdlQm9keSAtIGVzcGVjaWFsbHkgZm9yIGxpZ2h0Ym94aW5nP1xuICAgICAgICBsZXQgaW1hZ2UgPSBwW1wib2c6aW1hZ2VcIl07XG4gICAgICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInNob3dJbWFnZXNcIikpIHtcbiAgICAgICAgICAgIGltYWdlID0gbnVsbDsgLy8gRG9uJ3QgcmVuZGVyIGEgYnV0dG9uIHRvIHNob3cgdGhlIGltYWdlLCBqdXN0IGhpZGUgaXQgb3V0cmlnaHRcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbWFnZU1heFdpZHRoID0gMTAwO1xuICAgICAgICBjb25zdCBpbWFnZU1heEhlaWdodCA9IDEwMDtcbiAgICAgICAgaWYgKGltYWdlICYmIGltYWdlLnN0YXJ0c1dpdGgoXCJteGM6Ly9cIikpIHtcbiAgICAgICAgICAgIC8vIFdlIGRlbGliZXJhdGVseSBkb24ndCB3YW50IGEgc3F1YXJlIGhlcmUsIHNvIHVzZSB0aGUgc291cmNlIEhUVFAgdGh1bWJuYWlsIGZ1bmN0aW9uXG4gICAgICAgICAgICBpbWFnZSA9IG1lZGlhRnJvbU14YyhpbWFnZSkuZ2V0VGh1bWJuYWlsT2ZTb3VyY2VIdHRwKGltYWdlTWF4V2lkdGgsIGltYWdlTWF4SGVpZ2h0LCAnc2NhbGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0aHVtYkhlaWdodCA9IGltYWdlTWF4SGVpZ2h0O1xuICAgICAgICBpZiAocFtcIm9nOmltYWdlOndpZHRoXCJdICYmIHBbXCJvZzppbWFnZTpoZWlnaHRcIl0pIHtcbiAgICAgICAgICAgIHRodW1iSGVpZ2h0ID0gSW1hZ2VVdGlscy50aHVtYkhlaWdodChcbiAgICAgICAgICAgICAgICBwW1wib2c6aW1hZ2U6d2lkdGhcIl0sIHBbXCJvZzppbWFnZTpoZWlnaHRcIl0sXG4gICAgICAgICAgICAgICAgaW1hZ2VNYXhXaWR0aCwgaW1hZ2VNYXhIZWlnaHQsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGltZztcbiAgICAgICAgaWYgKGltYWdlKSB7XG4gICAgICAgICAgICBpbWcgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0xpbmtQcmV2aWV3V2lkZ2V0X2ltYWdlXCIgc3R5bGU9e3sgaGVpZ2h0OiB0aHVtYkhlaWdodCB9fT5cbiAgICAgICAgICAgICAgICA8aW1nIHN0eWxlPXt7IG1heFdpZHRoOiBpbWFnZU1heFdpZHRoLCBtYXhIZWlnaHQ6IGltYWdlTWF4SGVpZ2h0IH19IHNyYz17aW1hZ2V9IG9uQ2xpY2s9e3RoaXMub25JbWFnZUNsaWNrfSAvPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIGRlc2NyaXB0aW9uIGluY2x1ZGVzICYtZW5jb2RlZCBIVE1MIGVudGl0aWVzLCB3ZSBkZWNvZGUgdGhvc2UgYXMgUmVhY3QgdHJlYXRzIHRoZSB0aGluZyBhcyBhblxuICAgICAgICAvLyBvcGFxdWUgc3RyaW5nLiBUaGlzIGRvZXMgbm90IGFsbG93IGFueSBIVE1MIHRvIGJlIGluamVjdGVkIGludG8gdGhlIERPTS5cbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBBbGxIdG1sRW50aXRpZXMuZGVjb2RlKHBbXCJvZzpkZXNjcmlwdGlvblwiXSB8fCBcIlwiKTtcblxuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvbicpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MaW5rUHJldmlld1dpZGdldFwiPlxuICAgICAgICAgICAgICAgIHsgaW1nIH1cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xpbmtQcmV2aWV3V2lkZ2V0X2NhcHRpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MaW5rUHJldmlld1dpZGdldF90aXRsZVwiPjxhIGhyZWY9e3RoaXMucHJvcHMubGlua30gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiPnsgcFtcIm9nOnRpdGxlXCJdIH08L2E+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTGlua1ByZXZpZXdXaWRnZXRfc2l0ZU5hbWVcIj57IHBbXCJvZzpzaXRlX25hbWVcIl0gPyAoXCIgLSBcIiArIHBbXCJvZzpzaXRlX25hbWVcIl0pIDogbnVsbCB9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTGlua1ByZXZpZXdXaWRnZXRfZGVzY3JpcHRpb25cIiByZWY9e3RoaXMuX2Rlc2NyaXB0aW9ufT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZGVzY3JpcHRpb24gfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9MaW5rUHJldmlld1dpZGdldF9jYW5jZWxcIiBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2FuY2VsQ2xpY2t9IGFyaWEtbGFiZWw9e190KFwiQ2xvc2UgcHJldmlld1wiKX0+XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgY2xhc3NOYW1lPVwibXhfZmlsdGVyRmxpcENvbG9yXCIgYWx0PVwiXCIgcm9sZT1cInByZXNlbnRhdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2NhbmNlbC5zdmdcIil9IHdpZHRoPVwiMThcIiBoZWlnaHQ9XCIxOFwiIC8+XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19