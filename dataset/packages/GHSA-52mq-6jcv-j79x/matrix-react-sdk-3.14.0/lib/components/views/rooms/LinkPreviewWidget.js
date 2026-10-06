"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

/*
Copyright 2016 OpenMarket Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

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
class LinkPreviewWidget extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onImageClick", ev => {
      const p = this.state.preview;
      if (ev.button != 0 || ev.metaKey) return;
      ev.preventDefault();
      const ImageView = sdk.getComponent("elements.ImageView");
      let src = p["og:image"];

      if (src && src.startsWith("mxc://")) {
        src = _MatrixClientPeg.MatrixClientPeg.get().mxcUrlToHttp(src);
      }

      const params = {
        src: src,
        width: p["og:image:width"],
        height: p["og:image:height"],
        name: p["og:title"] || p["og:description"] || this.props.link,
        fileSize: p["matrix:image:size"],
        link: this.props.link
      };

      _Modal.default.createDialog(ImageView, params, "mx_Dialog_lightbox");
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
      image = _MatrixClientPeg.MatrixClientPeg.get().mxcUrlToHttp(image, imageMaxWidth, imageMaxHeight);
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

}

exports.default = LinkPreviewWidget;
(0, _defineProperty2.default)(LinkPreviewWidget, "propTypes", {
  link: _propTypes.default.string.isRequired,
  // the URL being previewed
  mxEvent: _propTypes.default.object.isRequired,
  // the Event associated with the preview
  onCancelClick: _propTypes.default.func,
  // called when the preview's cancel ('hide') button is clicked
  onHeightChanged: _propTypes.default.func // called when the preview's contents has loaded

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL0xpbmtQcmV2aWV3V2lkZ2V0LmpzIl0sIm5hbWVzIjpbIkxpbmtQcmV2aWV3V2lkZ2V0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXYiLCJwIiwic3RhdGUiLCJwcmV2aWV3IiwiYnV0dG9uIiwibWV0YUtleSIsInByZXZlbnREZWZhdWx0IiwiSW1hZ2VWaWV3Iiwic2RrIiwiZ2V0Q29tcG9uZW50Iiwic3JjIiwic3RhcnRzV2l0aCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsIm14Y1VybFRvSHR0cCIsInBhcmFtcyIsIndpZHRoIiwiaGVpZ2h0IiwibmFtZSIsImxpbmsiLCJmaWxlU2l6ZSIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwidW5tb3VudGVkIiwiZ2V0VXJsUHJldmlldyIsIm14RXZlbnQiLCJnZXRUcyIsInRoZW4iLCJyZXMiLCJzZXRTdGF0ZSIsIm9uSGVpZ2h0Q2hhbmdlZCIsImVycm9yIiwiY29uc29sZSIsIl9kZXNjcmlwdGlvbiIsImNvbXBvbmVudERpZE1vdW50IiwiY3VycmVudCIsImNvbXBvbmVudERpZFVwZGF0ZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVuZGVyIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsImltYWdlIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiaW1hZ2VNYXhXaWR0aCIsImltYWdlTWF4SGVpZ2h0IiwidGh1bWJIZWlnaHQiLCJJbWFnZVV0aWxzIiwiaW1nIiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCJvbkltYWdlQ2xpY2siLCJkZXNjcmlwdGlvbiIsIkFsbEh0bWxFbnRpdGllcyIsImRlY29kZSIsIkFjY2Vzc2libGVCdXR0b24iLCJvbkNhbmNlbENsaWNrIiwicmVxdWlyZSIsIlByb3BUeXBlcyIsInN0cmluZyIsImlzUmVxdWlyZWQiLCJvYmplY3QiLCJmdW5jIl0sIm1hcHBpbmdz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RCxhQUE5RTtBQUE2RixvQkFBWSx5QkFBRyxlQUFIO0FBQXpHLG9CQUNJO0FBQUssTUFBQSxTQUFTLEVBQUMsb0JBQWY7QUFBb0MsTUFBQSxHQUFHLEVBQUMsRUFBeEM7QUFBMkMsTUFBQSxJQUFJLEVBQUMsY0FBaEQ7QUFDSSxNQUFBLEdBQUcsRUFBRUMsT0FBTyxDQUFDLGdDQUFELENBRGhCO0FBQ29ELE1BQUEsS0FBSyxFQUFDLElBRDFEO0FBQytELE1BQUEsTUFBTSxFQUFDO0FBRHRFLE1BREosQ0FUSixDQURKO0FBZ0JIOztBQTFIMEQ7Ozs4QkFBMUMvRCxpQixlQUNFO0FBQ2Z3QixFQUFBQSxJQUFJLEVBQUV3QyxtQkFBVUMsTUFBVixDQUFpQkMsVUFEUjtBQUNvQjtBQUNuQ3BDLEVBQUFBLE9BQU8sRUFBRWtDLG1CQUFVRyxNQUFWLENBQWlCRCxVQUZYO0FBRXVCO0FBQ3RDSixFQUFBQSxhQUFhLEVBQUVFLG1CQUFVSSxJQUhWO0FBR2dCO0FBQy9CakMsRUFBQUEsZUFBZSxFQUFFNkIsbUJBQVVJLElBSlosQ0FJa0I7O0FBSmxCLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlUmVmfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgQWxsSHRtbEVudGl0aWVzIH0gZnJvbSAnaHRtbC1lbnRpdGllcyc7XG5pbXBvcnQge2xpbmtpZnlFbGVtZW50fSBmcm9tICcuLi8uLi8uLi9IdG1sVXRpbHMnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uL2luZGV4XCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgKiBhcyBJbWFnZVV0aWxzIGZyb20gXCIuLi8uLi8uLi9JbWFnZVV0aWxzXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGlua1ByZXZpZXdXaWRnZXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGxpbms6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCwgLy8gdGhlIFVSTCBiZWluZyBwcmV2aWV3ZWRcbiAgICAgICAgbXhFdmVudDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLCAvLyB0aGUgRXZlbnQgYXNzb2NpYXRlZCB3aXRoIHRoZSBwcmV2aWV3XG4gICAgICAgIG9uQ2FuY2VsQ2xpY2s6IFByb3BUeXBlcy5mdW5jLCAvLyBjYWxsZWQgd2hlbiB0aGUgcHJldmlldydzIGNhbmNlbCAoJ2hpZGUnKSBidXR0b24gaXMgY2xpY2tlZFxuICAgICAgICBvbkhlaWdodENoYW5nZWQ6IFByb3BUeXBlcy5mdW5jLCAvLyBjYWxsZWQgd2hlbiB0aGUgcHJldmlldydzIGNvbnRlbnRzIGhhcyBsb2FkZWRcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBwcmV2aWV3OiBudWxsLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudW5tb3VudGVkID0gZmFsc2U7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVcmxQcmV2aWV3KHRoaXMucHJvcHMubGluaywgdGhpcy5wcm9wcy5teEV2ZW50LmdldFRzKCkpLnRoZW4oKHJlcyk9PntcbiAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICAgICAgICAgICAgeyBwcmV2aWV3OiByZXMgfSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sIChlcnJvcik9PntcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZ2V0IFVSTCBwcmV2aWV3OiBcIiArIGVycm9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fZGVzY3JpcHRpb24gPSBjcmVhdGVSZWYoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2Rlc2NyaXB0aW9uLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGxpbmtpZnlFbGVtZW50KHRoaXMuX2Rlc2NyaXB0aW9uLmN1cnJlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5fZGVzY3JpcHRpb24uY3VycmVudCkge1xuICAgICAgICAgICAgbGlua2lmeUVsZW1lbnQodGhpcy5fZGVzY3JpcHRpb24uY3VycmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIG9uSW1hZ2VDbGljayA9IGV2ID0+IHtcbiAgICAgICAgY29uc3QgcCA9IHRoaXMuc3RhdGUucHJldmlldztcbiAgICAgICAgaWYgKGV2LmJ1dHRvbiAhPSAwIHx8IGV2Lm1ldGFLZXkpIHJldHVybjtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgSW1hZ2VWaWV3ID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLkltYWdlVmlld1wiKTtcblxuICAgICAgICBsZXQgc3JjID0gcFtcIm9nOmltYWdlXCJdO1xuICAgICAgICBpZiAoc3JjICYmIHNyYy5zdGFydHNXaXRoKFwibXhjOi8vXCIpKSB7XG4gICAgICAgICAgICBzcmMgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkubXhjVXJsVG9IdHRwKHNyYyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgICAgICBzcmM6IHNyYyxcbiAgICAgICAgICAgIHdpZHRoOiBwW1wib2c6aW1hZ2U6d2lkdGhcIl0sXG4gICAgICAgICAgICBoZWlnaHQ6IHBbXCJvZzppbWFnZTpoZWlnaHRcIl0sXG4gICAgICAgICAgICBuYW1lOiBwW1wib2c6dGl0bGVcIl0gfHwgcFtcIm9nOmRlc2NyaXB0aW9uXCJdIHx8IHRoaXMucHJvcHMubGluayxcbiAgICAgICAgICAgIGZpbGVTaXplOiBwW1wibWF0cml4OmltYWdlOnNpemVcIl0sXG4gICAgICAgICAgICBsaW5rOiB0aGlzLnByb3BzLmxpbmssXG4gICAgICAgIH07XG5cbiAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEltYWdlVmlldywgcGFyYW1zLCBcIm14X0RpYWxvZ19saWdodGJveFwiKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBwID0gdGhpcy5zdGF0ZS5wcmV2aWV3O1xuICAgICAgICBpZiAoIXAgfHwgT2JqZWN0LmtleXMocCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gPGRpdiAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZJWE1FOiBkbyB3ZSB3YW50IHRvIGZhY3RvciBvdXQgYWxsIGltYWdlIGRpc3BsYXlpbmcgYmV0d2VlbiB0aGlzIGFuZCBNSW1hZ2VCb2R5IC0gZXNwZWNpYWxseSBmb3IgbGlnaHRib3hpbmc/XG4gICAgICAgIGxldCBpbWFnZSA9IHBbXCJvZzppbWFnZVwiXTtcbiAgICAgICAgaWYgKCFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd0ltYWdlc1wiKSkge1xuICAgICAgICAgICAgaW1hZ2UgPSBudWxsOyAvLyBEb24ndCByZW5kZXIgYSBidXR0b24gdG8gc2hvdyB0aGUgaW1hZ2UsIGp1c3QgaGlkZSBpdCBvdXRyaWdodFxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGltYWdlTWF4V2lkdGggPSAxMDA7IGNvbnN0IGltYWdlTWF4SGVpZ2h0ID0gMTAwO1xuICAgICAgICBpZiAoaW1hZ2UgJiYgaW1hZ2Uuc3RhcnRzV2l0aChcIm14YzovL1wiKSkge1xuICAgICAgICAgICAgaW1hZ2UgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkubXhjVXJsVG9IdHRwKGltYWdlLCBpbWFnZU1heFdpZHRoLCBpbWFnZU1heEhlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGh1bWJIZWlnaHQgPSBpbWFnZU1heEhlaWdodDtcbiAgICAgICAgaWYgKHBbXCJvZzppbWFnZTp3aWR0aFwiXSAmJiBwW1wib2c6aW1hZ2U6aGVpZ2h0XCJdKSB7XG4gICAgICAgICAgICB0aHVtYkhlaWdodCA9IEltYWdlVXRpbHMudGh1bWJIZWlnaHQoXG4gICAgICAgICAgICAgICAgcFtcIm9nOmltYWdlOndpZHRoXCJdLCBwW1wib2c6aW1hZ2U6aGVpZ2h0XCJdLFxuICAgICAgICAgICAgICAgIGltYWdlTWF4V2lkdGgsIGltYWdlTWF4SGVpZ2h0LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpbWc7XG4gICAgICAgIGlmIChpbWFnZSkge1xuICAgICAgICAgICAgaW1nID0gPGRpdiBjbGFzc05hbWU9XCJteF9MaW5rUHJldmlld1dpZGdldF9pbWFnZVwiIHN0eWxlPXt7IGhlaWdodDogdGh1bWJIZWlnaHQgfX0+XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgc3R5bGU9e3sgbWF4V2lkdGg6IGltYWdlTWF4V2lkdGgsIG1heEhlaWdodDogaW1hZ2VNYXhIZWlnaHQgfX0gc3JjPXtpbWFnZX0gb25DbGljaz17dGhpcy5vbkltYWdlQ2xpY2t9IC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgZGVzY3JpcHRpb24gaW5jbHVkZXMgJi1lbmNvZGVkIEhUTUwgZW50aXRpZXMsIHdlIGRlY29kZSB0aG9zZSBhcyBSZWFjdCB0cmVhdHMgdGhlIHRoaW5nIGFzIGFuXG4gICAgICAgIC8vIG9wYXF1ZSBzdHJpbmcuIFRoaXMgZG9lcyBub3QgYWxsb3cgYW55IEhUTUwgdG8gYmUgaW5qZWN0ZWQgaW50byB0aGUgRE9NLlxuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IEFsbEh0bWxFbnRpdGllcy5kZWNvZGUocFtcIm9nOmRlc2NyaXB0aW9uXCJdIHx8IFwiXCIpO1xuXG4gICAgICAgIGNvbnN0IEFjY2Vzc2libGVCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uJyk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xpbmtQcmV2aWV3V2lkZ2V0XCI+XG4gICAgICAgICAgICAgICAgeyBpbWcgfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTGlua1ByZXZpZXdXaWRnZXRfY2FwdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xpbmtQcmV2aWV3V2lkZ2V0X3RpdGxlXCI+PGEgaHJlZj17dGhpcy5wcm9wcy5saW5rfSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCI+eyBwW1wib2c6dGl0bGVcIl0gfTwvYT48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MaW5rUHJldmlld1dpZGdldF9zaXRlTmFtZVwiPnsgcFtcIm9nOnNpdGVfbmFtZVwiXSA/IChcIiAtIFwiICsgcFtcIm9nOnNpdGVfbmFtZVwiXSkgOiBudWxsIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MaW5rUHJldmlld1dpZGdldF9kZXNjcmlwdGlvblwiIHJlZj17dGhpcy5fZGVzY3JpcHRpb259PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBkZXNjcmlwdGlvbiB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X0xpbmtQcmV2aWV3V2lkZ2V0X2NhbmNlbFwiIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DYW5jZWxDbGlja30gYXJpYS1sYWJlbD17X3QoXCJDbG9zZSBwcmV2aWV3XCIpfT5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzc05hbWU9XCJteF9maWx0ZXJGbGlwQ29sb3JcIiBhbHQ9XCJcIiByb2xlPVwicHJlc2VudGF0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvY2FuY2VsLnN2Z1wiKX0gd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgLz5cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=