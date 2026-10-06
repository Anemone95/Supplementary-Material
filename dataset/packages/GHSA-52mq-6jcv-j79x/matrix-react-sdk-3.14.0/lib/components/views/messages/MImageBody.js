"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HiddenImagePlaceholder = exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _MFileBody = _interopRequireDefault(require("./MFileBody"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _DecryptFile = require("../../../utils/DecryptFile");

var _languageHandler = require("../../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _InlineSpinner = _interopRequireDefault(require("../elements/InlineSpinner"));

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2018 New Vector Ltd
Copyright 2018, 2019 Michael Telatynski <7t3chguy@gmail.com>

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
class MImageBody extends _react.default.Component {
  constructor(props) {
    super(props);
    this.onImageError = this.onImageError.bind(this);
    this.onImageLoad = this.onImageLoad.bind(this);
    this.onImageEnter = this.onImageEnter.bind(this);
    this.onImageLeave = this.onImageLeave.bind(this);
    this.onClientSync = this.onClientSync.bind(this);
    this.onClick = this.onClick.bind(this);
    this._isGif = this._isGif.bind(this);
    this.state = {
      decryptedUrl: null,
      decryptedThumbnailUrl: null,
      decryptedBlob: null,
      error: null,
      imgError: false,
      imgLoaded: false,
      loadedImageDimensions: null,
      hover: false,
      showImage: _SettingsStore.default.getValue("showImages")
    };
    this._image = /*#__PURE__*/(0, _react.createRef)();
  } // FIXME: factor this out and aplpy it to MVideoBody and MAudioBody too!


  onClientSync(syncState, prevState) {
    if (this.unmounted) return; // Consider the client reconnected if there is no error with syncing.
    // This means the state could be RECONNECTING, SYNCING, PREPARED or CATCHUP.

    const reconnected = syncState !== "ERROR" && prevState !== syncState;

    if (reconnected && this.state.imgError) {
      // Load the image again
      this.setState({
        imgError: false
      });
    }
  }

  showImage() {
    localStorage.setItem("mx_ShowImage_" + this.props.mxEvent.getId(), "true");
    this.setState({
      showImage: true
    });

    this._downloadImage();
  }

  onClick(ev) {
    if (ev.button === 0 && !ev.metaKey) {
      ev.preventDefault();

      if (!this.state.showImage) {
        this.showImage();
        return;
      }

      const content = this.props.mxEvent.getContent();

      const httpUrl = this._getContentUrl();

      const ImageView = sdk.getComponent("elements.ImageView");
      const params = {
        src: httpUrl,
        name: content.body && content.body.length > 0 ? content.body : (0, _languageHandler._t)('Attachment'),
        mxEvent: this.props.mxEvent
      };

      if (content.info) {
        params.width = content.info.w;
        params.height = content.info.h;
        params.fileSize = content.info.size;
      }

      _Modal.default.createDialog(ImageView, params, "mx_Dialog_lightbox");
    }
  }

  _isGif() {
    const content = this.props.mxEvent.getContent();
    return content && content.info && content.info.mimetype === "image/gif";
  }

  onImageEnter(e) {
    this.setState({
      hover: true
    });

    if (!this.state.showImage || !this._isGif() || _SettingsStore.default.getValue("autoplayGifsAndVideos")) {
      return;
    }

    const imgElement = e.target;
    imgElement.src = this._getContentUrl();
  }

  onImageLeave(e) {
    this.setState({
      hover: false
    });

    if (!this.state.showImage || !this._isGif() || _SettingsStore.default.getValue("autoplayGifsAndVideos")) {
      return;
    }

    const imgElement = e.target;
    imgElement.src = this._getThumbUrl();
  }

  onImageError() {
    this.setState({
      imgError: true
    });
  }

  onImageLoad() {
    this.props.onHeightChanged();
    let loadedImageDimensions;

    if (this._image.current) {
      const {
        naturalWidth,
        naturalHeight
      } = this._image.current; // this is only used as a fallback in case content.info.w/h is missing

      loadedImageDimensions = {
        naturalWidth,
        naturalHeight
      };
    }

    this.setState({
      imgLoaded: true,
      loadedImageDimensions
    });
  }

  _getContentUrl() {
    const content = this.props.mxEvent.getContent();

    if (content.file !== undefined) {
      return this.state.decryptedUrl;
    } else {
      return this.context.mxcUrlToHttp(content.url);
    }
  }

  _getThumbUrl() {
    // FIXME: the dharma skin lets images grow as wide as you like, rather than capped to 800x600.
    // So either we need to support custom timeline widths here, or reimpose the cap, otherwise the
    // thumbnail resolution will be unnecessarily reduced.
    // custom timeline widths seems preferable.
    const pixelRatio = window.devicePixelRatio;
    const thumbWidth = Math.round(800 * pixelRatio);
    const thumbHeight = Math.round(600 * pixelRatio);
    const content = this.props.mxEvent.getContent();

    if (content.file !== undefined) {
      // Don't use the thumbnail for clients wishing to autoplay gifs.
      if (this.state.decryptedThumbnailUrl) {
        return this.state.decryptedThumbnailUrl;
      }

      return this.state.decryptedUrl;
    } else if (content.info && content.info.mimetype === "image/svg+xml" && content.info.thumbnail_url) {
      // special case to return clientside sender-generated thumbnails for SVGs, if any,
      // given we deliberately don't thumbnail them serverside to prevent
      // billion lol attacks and similar
      return this.context.mxcUrlToHttp(content.info.thumbnail_url, thumbWidth, thumbHeight);
    } else {
      // we try to download the correct resolution
      // for hi-res images (like retina screenshots).
      // synapse only supports 800x600 thumbnails for now though,
      // so we'll need to download the original image for this to work
      // well for now. First, let's try a few cases that let us avoid
      // downloading the original, including:
      //   - When displaying a GIF, we always want to thumbnail so that we can
      //     properly respect the user's GIF autoplay setting (which relies on
      //     thumbnailing to produce the static preview image)
      //   - On a low DPI device, always thumbnail to save bandwidth
      //   - If there's no sizing info in the event, default to thumbnail
      const info = content.info;

      if (this._isGif() || pixelRatio === 1.0 || !info || !info.w || !info.h || !info.size) {
        return this.context.mxcUrlToHttp(content.url, thumbWidth, thumbHeight);
      } else {
        // we should only request thumbnails if the image is bigger than 800x600
        // (or 1600x1200 on retina) otherwise the image in the timeline will just
        // end up resampled and de-retina'd for no good reason.
        // Ideally the server would pregen 1600x1200 thumbnails in order to provide retina
        // thumbnails, but we don't do this currently in synapse for fear of disk space.
        // As a compromise, let's switch to non-retina thumbnails only if the original
        // image is both physically too large and going to be massive to load in the
        // timeline (e.g. >1MB).
        const isLargerThanThumbnail = info.w > thumbWidth || info.h > thumbHeight;
        const isLargeFileSize = info.size > 1 * 1024 * 1024;

        if (isLargeFileSize && isLargerThanThumbnail) {
          // image is too large physically and bytewise to clutter our timeline so
          // we ask for a thumbnail, despite knowing that it will be max 800x600
          // despite us being retina (as synapse doesn't do 1600x1200 thumbs yet).
          return this.context.mxcUrlToHttp(content.url, thumbWidth, thumbHeight);
        } else {
          // download the original image otherwise, so we can scale it client side
          // to take pixelRatio into account.
          // ( no width/height means we want the original image)
          return this.context.mxcUrlToHttp(content.url);
        }
      }
    }
  }

  _downloadImage() {
    const content = this.props.mxEvent.getContent();

    if (content.file !== undefined && this.state.decryptedUrl === null) {
      let thumbnailPromise = Promise.resolve(null);

      if (content.info && content.info.thumbnail_file) {
        thumbnailPromise = (0, _DecryptFile.decryptFile)(content.info.thumbnail_file).then(function (blob) {
          return URL.createObjectURL(blob);
        });
      }

      let decryptedBlob;
      thumbnailPromise.then(thumbnailUrl => {
        return (0, _DecryptFile.decryptFile)(content.file).then(function (blob) {
          decryptedBlob = blob;
          return URL.createObjectURL(blob);
        }).then(contentUrl => {
          if (this.unmounted) return;
          this.setState({
            decryptedUrl: contentUrl,
            decryptedThumbnailUrl: thumbnailUrl,
            decryptedBlob: decryptedBlob
          });
        });
      }).catch(err => {
        if (this.unmounted) return;
        console.warn("Unable to decrypt attachment: ", err); // Set a placeholder image when we can't decrypt the image.

        this.setState({
          error: err
        });
      });
    }
  }

  componentDidMount() {
    this.unmounted = false;
    this.context.on('sync', this.onClientSync);
    const showImage = this.state.showImage || localStorage.getItem("mx_ShowImage_" + this.props.mxEvent.getId()) === "true";

    if (showImage) {
      // Don't download anything becaue we don't want to display anything.
      this._downloadImage();

      this.setState({
        showImage: true
      });
    }

    this._afterComponentDidMount();
  } // To be overridden by subclasses (e.g. MStickerBody) for further
  // initialisation after componentDidMount


  _afterComponentDidMount() {}

  componentWillUnmount() {
    this.unmounted = true;
    this.context.removeListener('sync', this.onClientSync);

    this._afterComponentWillUnmount();

    if (this.state.decryptedUrl) {
      URL.revokeObjectURL(this.state.decryptedUrl);
    }

    if (this.state.decryptedThumbnailUrl) {
      URL.revokeObjectURL(this.state.decryptedThumbnailUrl);
    }
  } // To be overridden by subclasses (e.g. MStickerBody) for further
  // cleanup after componentWillUnmount


  _afterComponentWillUnmount() {}

  _messageContent(contentUrl, thumbUrl, content) {
    let infoWidth;
    let infoHeight;

    if (content && content.info && content.info.w && content.info.h) {
      infoWidth = content.info.w;
      infoHeight = content.info.h;
    } else {
      // Whilst the image loads, display nothing.
      //
      // Once loaded, use the loaded image dimensions stored in `loadedImageDimensions`.
      //
      // By doing this, the image "pops" into the timeline, but is still restricted
      // by the same width and height logic below.
      if (!this.state.loadedImageDimensions) {
        let imageElement;

        if (!this.state.showImage) {
          imageElement = /*#__PURE__*/_react.default.createElement(HiddenImagePlaceholder, null);
        } else {
          imageElement = /*#__PURE__*/_react.default.createElement("img", {
            style: {
              display: 'none'
            },
            src: thumbUrl,
            ref: this._image,
            alt: content.body,
            onError: this.onImageError,
            onLoad: this.onImageLoad
          });
        }

        return this.wrapImage(contentUrl, imageElement);
      }

      infoWidth = this.state.loadedImageDimensions.naturalWidth;
      infoHeight = this.state.loadedImageDimensions.naturalHeight;
    } // The maximum height of the thumbnail as it is rendered as an <img>


    const maxHeight = Math.min(this.props.maxImageHeight || 600, infoHeight); // The maximum width of the thumbnail, as dictated by its natural
    // maximum height.

    const maxWidth = infoWidth * maxHeight / infoHeight;
    let img = null;
    let placeholder = null;
    let gifLabel = null; // e2e image hasn't been decrypted yet

    if (content.file !== undefined && this.state.decryptedUrl === null) {
      placeholder = /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, {
        w: 32,
        h: 32
      });
    } else if (!this.state.imgLoaded) {
      // Deliberately, getSpinner is left unimplemented here, MStickerBody overides
      placeholder = this.getPlaceholder();
    }

    let showPlaceholder = Boolean(placeholder);

    if (thumbUrl && !this.state.imgError) {
      // Restrict the width of the thumbnail here, otherwise it will fill the container
      // which has the same width as the timeline
      // mx_MImageBody_thumbnail resizes img to exactly container size
      img = /*#__PURE__*/_react.default.createElement("img", {
        className: "mx_MImageBody_thumbnail",
        src: thumbUrl,
        ref: this._image,
        style: {
          maxWidth: maxWidth + "px"
        },
        alt: content.body,
        onError: this.onImageError,
        onLoad: this.onImageLoad,
        onMouseEnter: this.onImageEnter,
        onMouseLeave: this.onImageLeave
      });
    }

    if (!this.state.showImage) {
      img = /*#__PURE__*/_react.default.createElement(HiddenImagePlaceholder, {
        style: {
          maxWidth: maxWidth + "px"
        }
      });
      showPlaceholder = false; // because we're hiding the image, so don't show the sticker icon.
    }

    if (this._isGif() && !_SettingsStore.default.getValue("autoplayGifsAndVideos") && !this.state.hover) {
      gifLabel = /*#__PURE__*/_react.default.createElement("p", {
        className: "mx_MImageBody_gifLabel"
      }, "GIF");
    }

    const thumbnail = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MImageBody_thumbnail_container",
      style: {
        maxHeight: maxHeight + "px"
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: {
        paddingBottom: 100 * infoHeight / infoWidth + '%'
      }
    }), showPlaceholder && /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MImageBody_thumbnail",
      style: {
        // Constrain width here so that spinner appears central to the loaded thumbnail
        maxWidth: infoWidth + "px"
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MImageBody_thumbnail_spinner"
    }, placeholder)), /*#__PURE__*/_react.default.createElement("div", {
      style: {
        display: !showPlaceholder ? undefined : 'none'
      }
    }, img, gifLabel), this.state.hover && this.getTooltip());

    return this.wrapImage(contentUrl, thumbnail);
  } // Overidden by MStickerBody


  wrapImage(contentUrl, children) {
    return /*#__PURE__*/_react.default.createElement("a", {
      href: contentUrl,
      onClick: this.onClick
    }, children);
  } // Overidden by MStickerBody


  getPlaceholder() {
    // MImageBody doesn't show a placeholder whilst the image loads, (but it could do)
    return null;
  } // Overidden by MStickerBody


  getTooltip() {
    return null;
  } // Overidden by MStickerBody


  getFileBody() {
    return /*#__PURE__*/_react.default.createElement(_MFileBody.default, (0, _extends2.default)({}, this.props, {
      decryptedBlob: this.state.decryptedBlob
    }));
  }

  render() {
    const content = this.props.mxEvent.getContent();

    if (this.state.error !== null) {
      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MImageBody"
      }, /*#__PURE__*/_react.default.createElement("img", {
        src: require("../../../../res/img/warning.svg"),
        width: "16",
        height: "16"
      }), (0, _languageHandler._t)("Error decrypting image"));
    }

    const contentUrl = this._getContentUrl();

    let thumbUrl;

    if (this._isGif() && _SettingsStore.default.getValue("autoplayGifsAndVideos")) {
      thumbUrl = contentUrl;
    } else {
      thumbUrl = this._getThumbUrl();
    }

    const thumbnail = this._messageContent(contentUrl, thumbUrl, content);

    const fileBody = this.getFileBody();
    return /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_MImageBody"
    }, thumbnail, fileBody);
  }

}

exports.default = MImageBody;
(0, _defineProperty2.default)(MImageBody, "propTypes", {
  /* the MatrixEvent to show */
  mxEvent: _propTypes.default.object.isRequired,

  /* called when the image has loaded */
  onHeightChanged: _propTypes.default.func.isRequired,

  /* the maximum image height to use */
  maxImageHeight: _propTypes.default.number
});
(0, _defineProperty2.default)(MImageBody, "contextType", _MatrixClientContext.default);

class HiddenImagePlaceholder extends _react.default.PureComponent {
  render() {
    let className = 'mx_HiddenImagePlaceholder';
    if (this.props.hover) className += ' mx_HiddenImagePlaceholder_hover';
    return /*#__PURE__*/_react.default.createElement("div", {
      className: className
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_HiddenImagePlaceholder_button"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_HiddenImagePlaceholder_eye"
    }), /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Show image"))));
  }

}

exports.HiddenImagePlaceholder = HiddenImagePlaceholder;
(0, _defineProperty2.default)(HiddenImagePlaceholder, "propTypes", {
  hover: _propTypes.default.bool
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL01JbWFnZUJvZHkuanMiXSwibmFtZXMiOlsiTUltYWdlQm9keSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIm9uSW1hZ2VFcnJvciIsImJpbmQiLCJvbkltYWdlTG9hZCIsIm9uSW1hZ2VFbnRlciIsIm9uSW1hZ2VMZWF2ZSIsIm9uQ2xpZW50U3luYyIsIm9uQ2xpY2siLCJfaXNHaWYiLCJzdGF0ZSIsImRlY3J5cHRlZFVybCIsImRlY3J5cHRlZFRodW1ibmFpbFVybCIsImRlY3J5cHRlZEJsb2IiLCJlcnJvciIsImltZ0Vycm9yIiwiaW1nTG9hZGVkIiwibG9hZGVkSW1hZ2VEaW1lbnNpb25zIiwiaG92ZXIiLCJzaG93SW1hZ2UiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJfaW1hZ2UiLCJzeW5jU3RhdGUiLCJwcmV2U3RhdGUiLCJ1bm1vdW50ZWQiLCJyZWNvbm5lY3RlZCIsInNldFN0YXRlIiwibG9jYWxTdG9yYWdlIiwic2V0SXRlbSIsIm14RXZlbnQiLCJnZXRJZCIsIl9kb3dubG9hZEltYWdlIiwiZXYiLCJidXR0b24iLCJtZXRhS2V5IiwicHJldmVudERlZmF1bHQiLCJjb250ZW50IiwiZ2V0Q29udGVudCIsImh0dHBVcmwiLCJfZ2V0Q29udGVudFVybCIsIkltYWdlVmlldyIsInNkayIsImdldENvbXBvbmVudCIsInBhcmFtcyIsInNyYyIsIm5hbWUiLCJib2R5IiwibGVuZ3RoIiwiaW5mbyIsIndpZHRoIiwidyIsImhlaWdodCIsImgiLCJmaWxlU2l6ZSIsInNpemUiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIm1pbWV0eXBlIiwiZSIsImltZ0VsZW1lbnQiLCJ0YXJnZXQiLCJfZ2V0VGh1bWJVcmwiLCJvbkhlaWdodENoYW5nZWQiLCJjdXJyZW50IiwibmF0dXJhbFdpZHRoIiwibmF0dXJhbEhlaWdodCIsImZpbGUiLCJ1bmRlZmluZWQiLCJjb250ZXh0IiwibXhjVXJsVG9IdHRwIiwidXJsIiwicGl4ZWxSYXRpbyIsIndpbmRvdyIsImRldmljZVBpeGVsUmF0aW8iLCJ0aHVtYldpZHRoIiwiTWF0aCIsInJvdW5kIiwidGh1bWJIZWlnaHQiLCJ0aHVtYm5haWxfdXJsIiwiaXNMYXJnZXJUaGFuVGh1bWJuYWlsIiwiaXNMYXJnZUZpbGVTaXplIiwidGh1bWJuYWlsUHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwidGh1bWJuYWlsX2ZpbGUiLCJ0aGVuIiwiYmxvYiIsIlVSTCIsImNyZWF0ZU9iamVjdFVSTCIsInRodW1ibmFpbFVybCIsImNvbnRlbnRVcmwiLCJjYXRjaCIsImVyciIsImNvbnNvbGUiLCJ3YXJuIiwiY29tcG9uZW50RGlkTW91bnQiLCJvbiIsImdldEl0ZW0iLCJfYWZ0ZXJDb21wb25lbnREaWRNb3VudCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJfYWZ0ZXJDb21wb25lbnRXaWxsVW5tb3VudCIsInJldm9rZU9iamVjdFVSTCIsIl9tZXNzYWdlQ29udGVudCIsInRodW1iVXJsIiwiaW5mb1dpZHRoIiwiaW5mb0hlaWdodCIsImltYWdlRWxlbWVudCIsImRpc3BsYXkiLCJ3cmFwSW1hZ2UiLCJtYXhIZWlnaHQiLCJtaW4iLCJtYXhJbWFnZUhlaWdodCIsIm1heFdpZHRoIiwiaW1nIiwicGxhY2Vob2xkZXIiLCJnaWZMYWJlbCIsImdldFBsYWNlaG9sZGVyIiwic2hvd1BsYWNlaG9sZGVyIiwiQm9vbGVhbiIsInRodW1ibmFpbCIsInBhZGRpbmdCb3R0b20iLCJnZXRUb29sdGlwIiwiY2hpbGRyZW4iLCJnZXRGaWxlQm9keSIsInJlbmRlciIsInJlcXVpcmUiLCJmaWxlQm9keSIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJmdW5jIiwibnVtYmVyIiwiTWF0cml4Q2xpZW50Q29udGV4dCIsIkhpZGRlbkltYWdlUGxhY2Vob2xkZXIiLCJQdXJlQ29tcG9uZW50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QU0wSSxhQUEzQyxDQUF5RDtBQUs1RFYsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsUUFBSVcsU0FBUyxHQUFHLDJCQUFoQjtBQUNBLFFBQUksS0FBS3hJLEtBQUwsQ0FBV2lCLEtBQWYsRUFBc0J1SCxTQUFTLElBQUksa0NBQWI7QUFDdEIsd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBRUE7QUFBaEIsb0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQU0sTUFBQSxTQUFTLEVBQUM7QUFBaEIsTUFESixlQUVJLDJDQUFPLHlCQUFHLFlBQUgsQ0FBUCxDQUZKLENBREosQ0FESjtBQVFIOztBQWhCMkQ7Ozs4QkFBbkRGLHNCLGVBQ1U7QUFDZnJILEVBQUFBLEtBQUssRUFBRStHLG1CQUFVUztBQURGLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOCwgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHtjcmVhdGVSZWZ9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cbmltcG9ydCBNRmlsZUJvZHkgZnJvbSAnLi9NRmlsZUJvZHknO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgeyBkZWNyeXB0RmlsZSB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0RlY3J5cHRGaWxlJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IElubGluZVNwaW5uZXIgZnJvbSAnLi4vZWxlbWVudHMvSW5saW5lU3Bpbm5lcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1JbWFnZUJvZHkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIC8qIHRoZSBNYXRyaXhFdmVudCB0byBzaG93ICovXG4gICAgICAgIG14RXZlbnQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblxuICAgICAgICAvKiBjYWxsZWQgd2hlbiB0aGUgaW1hZ2UgaGFzIGxvYWRlZCAqL1xuICAgICAgICBvbkhlaWdodENoYW5nZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cbiAgICAgICAgLyogdGhlIG1heGltdW0gaW1hZ2UgaGVpZ2h0IHRvIHVzZSAqL1xuICAgICAgICBtYXhJbWFnZUhlaWdodDogUHJvcFR5cGVzLm51bWJlcixcbiAgICB9O1xuXG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLm9uSW1hZ2VFcnJvciA9IHRoaXMub25JbWFnZUVycm9yLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub25JbWFnZUxvYWQgPSB0aGlzLm9uSW1hZ2VMb2FkLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub25JbWFnZUVudGVyID0gdGhpcy5vbkltYWdlRW50ZXIuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5vbkltYWdlTGVhdmUgPSB0aGlzLm9uSW1hZ2VMZWF2ZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9uQ2xpZW50U3luYyA9IHRoaXMub25DbGllbnRTeW5jLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9pc0dpZiA9IHRoaXMuX2lzR2lmLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGRlY3J5cHRlZFVybDogbnVsbCxcbiAgICAgICAgICAgIGRlY3J5cHRlZFRodW1ibmFpbFVybDogbnVsbCxcbiAgICAgICAgICAgIGRlY3J5cHRlZEJsb2I6IG51bGwsXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIGltZ0Vycm9yOiBmYWxzZSxcbiAgICAgICAgICAgIGltZ0xvYWRlZDogZmFsc2UsXG4gICAgICAgICAgICBsb2FkZWRJbWFnZURpbWVuc2lvbnM6IG51bGwsXG4gICAgICAgICAgICBob3ZlcjogZmFsc2UsXG4gICAgICAgICAgICBzaG93SW1hZ2U6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93SW1hZ2VzXCIpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX2ltYWdlID0gY3JlYXRlUmVmKCk7XG4gICAgfVxuXG4gICAgLy8gRklYTUU6IGZhY3RvciB0aGlzIG91dCBhbmQgYXBscHkgaXQgdG8gTVZpZGVvQm9keSBhbmQgTUF1ZGlvQm9keSB0b28hXG4gICAgb25DbGllbnRTeW5jKHN5bmNTdGF0ZSwgcHJldlN0YXRlKSB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICAvLyBDb25zaWRlciB0aGUgY2xpZW50IHJlY29ubmVjdGVkIGlmIHRoZXJlIGlzIG5vIGVycm9yIHdpdGggc3luY2luZy5cbiAgICAgICAgLy8gVGhpcyBtZWFucyB0aGUgc3RhdGUgY291bGQgYmUgUkVDT05ORUNUSU5HLCBTWU5DSU5HLCBQUkVQQVJFRCBvciBDQVRDSFVQLlxuICAgICAgICBjb25zdCByZWNvbm5lY3RlZCA9IHN5bmNTdGF0ZSAhPT0gXCJFUlJPUlwiICYmIHByZXZTdGF0ZSAhPT0gc3luY1N0YXRlO1xuICAgICAgICBpZiAocmVjb25uZWN0ZWQgJiYgdGhpcy5zdGF0ZS5pbWdFcnJvcikge1xuICAgICAgICAgICAgLy8gTG9hZCB0aGUgaW1hZ2UgYWdhaW5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGltZ0Vycm9yOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2hvd0ltYWdlKCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm14X1Nob3dJbWFnZV9cIiArIHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpLCBcInRydWVcIik7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dJbWFnZTogdHJ1ZX0pO1xuICAgICAgICB0aGlzLl9kb3dubG9hZEltYWdlKCk7XG4gICAgfVxuXG4gICAgb25DbGljayhldikge1xuICAgICAgICBpZiAoZXYuYnV0dG9uID09PSAwICYmICFldi5tZXRhS2V5KSB7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnNob3dJbWFnZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0ltYWdlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgICAgIGNvbnN0IGh0dHBVcmwgPSB0aGlzLl9nZXRDb250ZW50VXJsKCk7XG4gICAgICAgICAgICBjb25zdCBJbWFnZVZpZXcgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuSW1hZ2VWaWV3XCIpO1xuICAgICAgICAgICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIHNyYzogaHR0cFVybCxcbiAgICAgICAgICAgICAgICBuYW1lOiBjb250ZW50LmJvZHkgJiYgY29udGVudC5ib2R5Lmxlbmd0aCA+IDAgPyBjb250ZW50LmJvZHkgOiBfdCgnQXR0YWNobWVudCcpLFxuICAgICAgICAgICAgICAgIG14RXZlbnQ6IHRoaXMucHJvcHMubXhFdmVudCxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChjb250ZW50LmluZm8pIHtcbiAgICAgICAgICAgICAgICBwYXJhbXMud2lkdGggPSBjb250ZW50LmluZm8udztcbiAgICAgICAgICAgICAgICBwYXJhbXMuaGVpZ2h0ID0gY29udGVudC5pbmZvLmg7XG4gICAgICAgICAgICAgICAgcGFyYW1zLmZpbGVTaXplID0gY29udGVudC5pbmZvLnNpemU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhJbWFnZVZpZXcsIHBhcmFtcywgXCJteF9EaWFsb2dfbGlnaHRib3hcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfaXNHaWYoKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIGNvbnRlbnQgJiZcbiAgICAgICAgICBjb250ZW50LmluZm8gJiZcbiAgICAgICAgICBjb250ZW50LmluZm8ubWltZXR5cGUgPT09IFwiaW1hZ2UvZ2lmXCJcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBvbkltYWdlRW50ZXIoZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgaG92ZXI6IHRydWUgfSk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnNob3dJbWFnZSB8fCAhdGhpcy5faXNHaWYoKSB8fCBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYXV0b3BsYXlHaWZzQW5kVmlkZW9zXCIpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW1nRWxlbWVudCA9IGUudGFyZ2V0O1xuICAgICAgICBpbWdFbGVtZW50LnNyYyA9IHRoaXMuX2dldENvbnRlbnRVcmwoKTtcbiAgICB9XG5cbiAgICBvbkltYWdlTGVhdmUoZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgaG92ZXI6IGZhbHNlIH0pO1xuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5zaG93SW1hZ2UgfHwgIXRoaXMuX2lzR2lmKCkgfHwgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImF1dG9wbGF5R2lmc0FuZFZpZGVvc1wiKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGltZ0VsZW1lbnQgPSBlLnRhcmdldDtcbiAgICAgICAgaW1nRWxlbWVudC5zcmMgPSB0aGlzLl9nZXRUaHVtYlVybCgpO1xuICAgIH1cblxuICAgIG9uSW1hZ2VFcnJvcigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBpbWdFcnJvcjogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25JbWFnZUxvYWQoKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkKCk7XG5cbiAgICAgICAgbGV0IGxvYWRlZEltYWdlRGltZW5zaW9ucztcblxuICAgICAgICBpZiAodGhpcy5faW1hZ2UuY3VycmVudCkge1xuICAgICAgICAgICAgY29uc3QgeyBuYXR1cmFsV2lkdGgsIG5hdHVyYWxIZWlnaHQgfSA9IHRoaXMuX2ltYWdlLmN1cnJlbnQ7XG4gICAgICAgICAgICAvLyB0aGlzIGlzIG9ubHkgdXNlZCBhcyBhIGZhbGxiYWNrIGluIGNhc2UgY29udGVudC5pbmZvLncvaCBpcyBtaXNzaW5nXG4gICAgICAgICAgICBsb2FkZWRJbWFnZURpbWVuc2lvbnMgPSB7IG5hdHVyYWxXaWR0aCwgbmF0dXJhbEhlaWdodCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGltZ0xvYWRlZDogdHJ1ZSwgbG9hZGVkSW1hZ2VEaW1lbnNpb25zIH0pO1xuICAgIH1cblxuICAgIF9nZXRDb250ZW50VXJsKCkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgaWYgKGNvbnRlbnQuZmlsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5kZWNyeXB0ZWRVcmw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb250ZXh0Lm14Y1VybFRvSHR0cChjb250ZW50LnVybCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0VGh1bWJVcmwoKSB7XG4gICAgICAgIC8vIEZJWE1FOiB0aGUgZGhhcm1hIHNraW4gbGV0cyBpbWFnZXMgZ3JvdyBhcyB3aWRlIGFzIHlvdSBsaWtlLCByYXRoZXIgdGhhbiBjYXBwZWQgdG8gODAweDYwMC5cbiAgICAgICAgLy8gU28gZWl0aGVyIHdlIG5lZWQgdG8gc3VwcG9ydCBjdXN0b20gdGltZWxpbmUgd2lkdGhzIGhlcmUsIG9yIHJlaW1wb3NlIHRoZSBjYXAsIG90aGVyd2lzZSB0aGVcbiAgICAgICAgLy8gdGh1bWJuYWlsIHJlc29sdXRpb24gd2lsbCBiZSB1bm5lY2Vzc2FyaWx5IHJlZHVjZWQuXG4gICAgICAgIC8vIGN1c3RvbSB0aW1lbGluZSB3aWR0aHMgc2VlbXMgcHJlZmVyYWJsZS5cbiAgICAgICAgY29uc3QgcGl4ZWxSYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgICBjb25zdCB0aHVtYldpZHRoID0gTWF0aC5yb3VuZCg4MDAgKiBwaXhlbFJhdGlvKTtcbiAgICAgICAgY29uc3QgdGh1bWJIZWlnaHQgPSBNYXRoLnJvdW5kKDYwMCAqIHBpeGVsUmF0aW8pO1xuXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICBpZiAoY29udGVudC5maWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIERvbid0IHVzZSB0aGUgdGh1bWJuYWlsIGZvciBjbGllbnRzIHdpc2hpbmcgdG8gYXV0b3BsYXkgZ2lmcy5cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmRlY3J5cHRlZFRodW1ibmFpbFVybCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmRlY3J5cHRlZFRodW1ibmFpbFVybDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmRlY3J5cHRlZFVybDtcbiAgICAgICAgfSBlbHNlIGlmIChjb250ZW50LmluZm8gJiYgY29udGVudC5pbmZvLm1pbWV0eXBlID09PSBcImltYWdlL3N2Zyt4bWxcIiAmJiBjb250ZW50LmluZm8udGh1bWJuYWlsX3VybCkge1xuICAgICAgICAgICAgLy8gc3BlY2lhbCBjYXNlIHRvIHJldHVybiBjbGllbnRzaWRlIHNlbmRlci1nZW5lcmF0ZWQgdGh1bWJuYWlscyBmb3IgU1ZHcywgaWYgYW55LFxuICAgICAgICAgICAgLy8gZ2l2ZW4gd2UgZGVsaWJlcmF0ZWx5IGRvbid0IHRodW1ibmFpbCB0aGVtIHNlcnZlcnNpZGUgdG8gcHJldmVudFxuICAgICAgICAgICAgLy8gYmlsbGlvbiBsb2wgYXR0YWNrcyBhbmQgc2ltaWxhclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5teGNVcmxUb0h0dHAoXG4gICAgICAgICAgICAgICAgY29udGVudC5pbmZvLnRodW1ibmFpbF91cmwsXG4gICAgICAgICAgICAgICAgdGh1bWJXaWR0aCxcbiAgICAgICAgICAgICAgICB0aHVtYkhlaWdodCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB3ZSB0cnkgdG8gZG93bmxvYWQgdGhlIGNvcnJlY3QgcmVzb2x1dGlvblxuICAgICAgICAgICAgLy8gZm9yIGhpLXJlcyBpbWFnZXMgKGxpa2UgcmV0aW5hIHNjcmVlbnNob3RzKS5cbiAgICAgICAgICAgIC8vIHN5bmFwc2Ugb25seSBzdXBwb3J0cyA4MDB4NjAwIHRodW1ibmFpbHMgZm9yIG5vdyB0aG91Z2gsXG4gICAgICAgICAgICAvLyBzbyB3ZSdsbCBuZWVkIHRvIGRvd25sb2FkIHRoZSBvcmlnaW5hbCBpbWFnZSBmb3IgdGhpcyB0byB3b3JrXG4gICAgICAgICAgICAvLyB3ZWxsIGZvciBub3cuIEZpcnN0LCBsZXQncyB0cnkgYSBmZXcgY2FzZXMgdGhhdCBsZXQgdXMgYXZvaWRcbiAgICAgICAgICAgIC8vIGRvd25sb2FkaW5nIHRoZSBvcmlnaW5hbCwgaW5jbHVkaW5nOlxuICAgICAgICAgICAgLy8gICAtIFdoZW4gZGlzcGxheWluZyBhIEdJRiwgd2UgYWx3YXlzIHdhbnQgdG8gdGh1bWJuYWlsIHNvIHRoYXQgd2UgY2FuXG4gICAgICAgICAgICAvLyAgICAgcHJvcGVybHkgcmVzcGVjdCB0aGUgdXNlcidzIEdJRiBhdXRvcGxheSBzZXR0aW5nICh3aGljaCByZWxpZXMgb25cbiAgICAgICAgICAgIC8vICAgICB0aHVtYm5haWxpbmcgdG8gcHJvZHVjZSB0aGUgc3RhdGljIHByZXZpZXcgaW1hZ2UpXG4gICAgICAgICAgICAvLyAgIC0gT24gYSBsb3cgRFBJIGRldmljZSwgYWx3YXlzIHRodW1ibmFpbCB0byBzYXZlIGJhbmR3aWR0aFxuICAgICAgICAgICAgLy8gICAtIElmIHRoZXJlJ3Mgbm8gc2l6aW5nIGluZm8gaW4gdGhlIGV2ZW50LCBkZWZhdWx0IHRvIHRodW1ibmFpbFxuICAgICAgICAgICAgY29uc3QgaW5mbyA9IGNvbnRlbnQuaW5mbztcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0dpZigpIHx8XG4gICAgICAgICAgICAgICAgcGl4ZWxSYXRpbyA9PT0gMS4wIHx8XG4gICAgICAgICAgICAgICAgKCFpbmZvIHx8ICFpbmZvLncgfHwgIWluZm8uaCB8fCAhaW5mby5zaXplKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5teGNVcmxUb0h0dHAoY29udGVudC51cmwsIHRodW1iV2lkdGgsIHRodW1iSGVpZ2h0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gd2Ugc2hvdWxkIG9ubHkgcmVxdWVzdCB0aHVtYm5haWxzIGlmIHRoZSBpbWFnZSBpcyBiaWdnZXIgdGhhbiA4MDB4NjAwXG4gICAgICAgICAgICAgICAgLy8gKG9yIDE2MDB4MTIwMCBvbiByZXRpbmEpIG90aGVyd2lzZSB0aGUgaW1hZ2UgaW4gdGhlIHRpbWVsaW5lIHdpbGwganVzdFxuICAgICAgICAgICAgICAgIC8vIGVuZCB1cCByZXNhbXBsZWQgYW5kIGRlLXJldGluYSdkIGZvciBubyBnb29kIHJlYXNvbi5cbiAgICAgICAgICAgICAgICAvLyBJZGVhbGx5IHRoZSBzZXJ2ZXIgd291bGQgcHJlZ2VuIDE2MDB4MTIwMCB0aHVtYm5haWxzIGluIG9yZGVyIHRvIHByb3ZpZGUgcmV0aW5hXG4gICAgICAgICAgICAgICAgLy8gdGh1bWJuYWlscywgYnV0IHdlIGRvbid0IGRvIHRoaXMgY3VycmVudGx5IGluIHN5bmFwc2UgZm9yIGZlYXIgb2YgZGlzayBzcGFjZS5cbiAgICAgICAgICAgICAgICAvLyBBcyBhIGNvbXByb21pc2UsIGxldCdzIHN3aXRjaCB0byBub24tcmV0aW5hIHRodW1ibmFpbHMgb25seSBpZiB0aGUgb3JpZ2luYWxcbiAgICAgICAgICAgICAgICAvLyBpbWFnZSBpcyBib3RoIHBoeXNpY2FsbHkgdG9vIGxhcmdlIGFuZCBnb2luZyB0byBiZSBtYXNzaXZlIHRvIGxvYWQgaW4gdGhlXG4gICAgICAgICAgICAgICAgLy8gdGltZWxpbmUgKGUuZy4gPjFNQikuXG5cbiAgICAgICAgICAgICAgICBjb25zdCBpc0xhcmdlclRoYW5UaHVtYm5haWwgPSAoXG4gICAgICAgICAgICAgICAgICAgIGluZm8udyA+IHRodW1iV2lkdGggfHxcbiAgICAgICAgICAgICAgICAgICAgaW5mby5oID4gdGh1bWJIZWlnaHRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzTGFyZ2VGaWxlU2l6ZSA9IGluZm8uc2l6ZSA+IDEqMTAyNCoxMDI0O1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzTGFyZ2VGaWxlU2l6ZSAmJiBpc0xhcmdlclRoYW5UaHVtYm5haWwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW1hZ2UgaXMgdG9vIGxhcmdlIHBoeXNpY2FsbHkgYW5kIGJ5dGV3aXNlIHRvIGNsdXR0ZXIgb3VyIHRpbWVsaW5lIHNvXG4gICAgICAgICAgICAgICAgICAgIC8vIHdlIGFzayBmb3IgYSB0aHVtYm5haWwsIGRlc3BpdGUga25vd2luZyB0aGF0IGl0IHdpbGwgYmUgbWF4IDgwMHg2MDBcbiAgICAgICAgICAgICAgICAgICAgLy8gZGVzcGl0ZSB1cyBiZWluZyByZXRpbmEgKGFzIHN5bmFwc2UgZG9lc24ndCBkbyAxNjAweDEyMDAgdGh1bWJzIHlldCkuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnRleHQubXhjVXJsVG9IdHRwKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudC51cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHVtYldpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGh1bWJIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZG93bmxvYWQgdGhlIG9yaWdpbmFsIGltYWdlIG90aGVyd2lzZSwgc28gd2UgY2FuIHNjYWxlIGl0IGNsaWVudCBzaWRlXG4gICAgICAgICAgICAgICAgICAgIC8vIHRvIHRha2UgcGl4ZWxSYXRpbyBpbnRvIGFjY291bnQuXG4gICAgICAgICAgICAgICAgICAgIC8vICggbm8gd2lkdGgvaGVpZ2h0IG1lYW5zIHdlIHdhbnQgdGhlIG9yaWdpbmFsIGltYWdlKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb250ZXh0Lm14Y1VybFRvSHR0cChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQudXJsLFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9kb3dubG9hZEltYWdlKCkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgaWYgKGNvbnRlbnQuZmlsZSAhPT0gdW5kZWZpbmVkICYmIHRoaXMuc3RhdGUuZGVjcnlwdGVkVXJsID09PSBudWxsKSB7XG4gICAgICAgICAgICBsZXQgdGh1bWJuYWlsUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgIGlmIChjb250ZW50LmluZm8gJiYgY29udGVudC5pbmZvLnRodW1ibmFpbF9maWxlKSB7XG4gICAgICAgICAgICAgICAgdGh1bWJuYWlsUHJvbWlzZSA9IGRlY3J5cHRGaWxlKFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50LmluZm8udGh1bWJuYWlsX2ZpbGUsXG4gICAgICAgICAgICAgICAgKS50aGVuKGZ1bmN0aW9uKGJsb2IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZGVjcnlwdGVkQmxvYjtcbiAgICAgICAgICAgIHRodW1ibmFpbFByb21pc2UudGhlbigodGh1bWJuYWlsVXJsKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlY3J5cHRGaWxlKGNvbnRlbnQuZmlsZSkudGhlbihmdW5jdGlvbihibG9iKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlY3J5cHRlZEJsb2IgPSBibG9iO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgICAgICAgICB9KS50aGVuKChjb250ZW50VXJsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY3J5cHRlZFVybDogY29udGVudFVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY3J5cHRlZFRodW1ibmFpbFVybDogdGh1bWJuYWlsVXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjcnlwdGVkQmxvYjogZGVjcnlwdGVkQmxvYixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiVW5hYmxlIHRvIGRlY3J5cHQgYXR0YWNobWVudDogXCIsIGVycik7XG4gICAgICAgICAgICAgICAgLy8gU2V0IGEgcGxhY2Vob2xkZXIgaW1hZ2Ugd2hlbiB3ZSBjYW4ndCBkZWNyeXB0IHRoZSBpbWFnZS5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMudW5tb3VudGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29udGV4dC5vbignc3luYycsIHRoaXMub25DbGllbnRTeW5jKTtcblxuICAgICAgICBjb25zdCBzaG93SW1hZ2UgPSB0aGlzLnN0YXRlLnNob3dJbWFnZSB8fFxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJteF9TaG93SW1hZ2VfXCIgKyB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSkgPT09IFwidHJ1ZVwiO1xuXG4gICAgICAgIGlmIChzaG93SW1hZ2UpIHtcbiAgICAgICAgICAgIC8vIERvbid0IGRvd25sb2FkIGFueXRoaW5nIGJlY2F1ZSB3ZSBkb24ndCB3YW50IHRvIGRpc3BsYXkgYW55dGhpbmcuXG4gICAgICAgICAgICB0aGlzLl9kb3dubG9hZEltYWdlKCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtzaG93SW1hZ2U6IHRydWV9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2FmdGVyQ29tcG9uZW50RGlkTW91bnQoKTtcbiAgICB9XG5cbiAgICAvLyBUbyBiZSBvdmVycmlkZGVuIGJ5IHN1YmNsYXNzZXMgKGUuZy4gTVN0aWNrZXJCb2R5KSBmb3IgZnVydGhlclxuICAgIC8vIGluaXRpYWxpc2F0aW9uIGFmdGVyIGNvbXBvbmVudERpZE1vdW50XG4gICAgX2FmdGVyQ29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMudW5tb3VudGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb250ZXh0LnJlbW92ZUxpc3RlbmVyKCdzeW5jJywgdGhpcy5vbkNsaWVudFN5bmMpO1xuICAgICAgICB0aGlzLl9hZnRlckNvbXBvbmVudFdpbGxVbm1vdW50KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGVjcnlwdGVkVXJsKSB7XG4gICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHRoaXMuc3RhdGUuZGVjcnlwdGVkVXJsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5kZWNyeXB0ZWRUaHVtYm5haWxVcmwpIHtcbiAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodGhpcy5zdGF0ZS5kZWNyeXB0ZWRUaHVtYm5haWxVcmwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVG8gYmUgb3ZlcnJpZGRlbiBieSBzdWJjbGFzc2VzIChlLmcuIE1TdGlja2VyQm9keSkgZm9yIGZ1cnRoZXJcbiAgICAvLyBjbGVhbnVwIGFmdGVyIGNvbXBvbmVudFdpbGxVbm1vdW50XG4gICAgX2FmdGVyQ29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgfVxuXG4gICAgX21lc3NhZ2VDb250ZW50KGNvbnRlbnRVcmwsIHRodW1iVXJsLCBjb250ZW50KSB7XG4gICAgICAgIGxldCBpbmZvV2lkdGg7XG4gICAgICAgIGxldCBpbmZvSGVpZ2h0O1xuXG4gICAgICAgIGlmIChjb250ZW50ICYmIGNvbnRlbnQuaW5mbyAmJiBjb250ZW50LmluZm8udyAmJiBjb250ZW50LmluZm8uaCkge1xuICAgICAgICAgICAgaW5mb1dpZHRoID0gY29udGVudC5pbmZvLnc7XG4gICAgICAgICAgICBpbmZvSGVpZ2h0ID0gY29udGVudC5pbmZvLmg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBXaGlsc3QgdGhlIGltYWdlIGxvYWRzLCBkaXNwbGF5IG5vdGhpbmcuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gT25jZSBsb2FkZWQsIHVzZSB0aGUgbG9hZGVkIGltYWdlIGRpbWVuc2lvbnMgc3RvcmVkIGluIGBsb2FkZWRJbWFnZURpbWVuc2lvbnNgLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIEJ5IGRvaW5nIHRoaXMsIHRoZSBpbWFnZSBcInBvcHNcIiBpbnRvIHRoZSB0aW1lbGluZSwgYnV0IGlzIHN0aWxsIHJlc3RyaWN0ZWRcbiAgICAgICAgICAgIC8vIGJ5IHRoZSBzYW1lIHdpZHRoIGFuZCBoZWlnaHQgbG9naWMgYmVsb3cuXG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUubG9hZGVkSW1hZ2VEaW1lbnNpb25zKSB7XG4gICAgICAgICAgICAgICAgbGV0IGltYWdlRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2hvd0ltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlRWxlbWVudCA9IDxIaWRkZW5JbWFnZVBsYWNlaG9sZGVyIC8+O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlRWxlbWVudCA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3R5bGU9e3tkaXNwbGF5OiAnbm9uZSd9fSBzcmM9e3RodW1iVXJsfSByZWY9e3RoaXMuX2ltYWdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHQ9e2NvbnRlbnQuYm9keX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcj17dGhpcy5vbkltYWdlRXJyb3J9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uTG9hZD17dGhpcy5vbkltYWdlTG9hZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLndyYXBJbWFnZShjb250ZW50VXJsLCBpbWFnZUVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5mb1dpZHRoID0gdGhpcy5zdGF0ZS5sb2FkZWRJbWFnZURpbWVuc2lvbnMubmF0dXJhbFdpZHRoO1xuICAgICAgICAgICAgaW5mb0hlaWdodCA9IHRoaXMuc3RhdGUubG9hZGVkSW1hZ2VEaW1lbnNpb25zLm5hdHVyYWxIZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgbWF4aW11bSBoZWlnaHQgb2YgdGhlIHRodW1ibmFpbCBhcyBpdCBpcyByZW5kZXJlZCBhcyBhbiA8aW1nPlxuICAgICAgICBjb25zdCBtYXhIZWlnaHQgPSBNYXRoLm1pbih0aGlzLnByb3BzLm1heEltYWdlSGVpZ2h0IHx8IDYwMCwgaW5mb0hlaWdodCk7XG4gICAgICAgIC8vIFRoZSBtYXhpbXVtIHdpZHRoIG9mIHRoZSB0aHVtYm5haWwsIGFzIGRpY3RhdGVkIGJ5IGl0cyBuYXR1cmFsXG4gICAgICAgIC8vIG1heGltdW0gaGVpZ2h0LlxuICAgICAgICBjb25zdCBtYXhXaWR0aCA9IGluZm9XaWR0aCAqIG1heEhlaWdodCAvIGluZm9IZWlnaHQ7XG5cbiAgICAgICAgbGV0IGltZyA9IG51bGw7XG4gICAgICAgIGxldCBwbGFjZWhvbGRlciA9IG51bGw7XG4gICAgICAgIGxldCBnaWZMYWJlbCA9IG51bGw7XG5cbiAgICAgICAgLy8gZTJlIGltYWdlIGhhc24ndCBiZWVuIGRlY3J5cHRlZCB5ZXRcbiAgICAgICAgaWYgKGNvbnRlbnQuZmlsZSAhPT0gdW5kZWZpbmVkICYmIHRoaXMuc3RhdGUuZGVjcnlwdGVkVXJsID09PSBudWxsKSB7XG4gICAgICAgICAgICBwbGFjZWhvbGRlciA9IDxJbmxpbmVTcGlubmVyIHc9ezMyfSBoPXszMn0gLz47XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc3RhdGUuaW1nTG9hZGVkKSB7XG4gICAgICAgICAgICAvLyBEZWxpYmVyYXRlbHksIGdldFNwaW5uZXIgaXMgbGVmdCB1bmltcGxlbWVudGVkIGhlcmUsIE1TdGlja2VyQm9keSBvdmVyaWRlc1xuICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSB0aGlzLmdldFBsYWNlaG9sZGVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2hvd1BsYWNlaG9sZGVyID0gQm9vbGVhbihwbGFjZWhvbGRlcik7XG5cbiAgICAgICAgaWYgKHRodW1iVXJsICYmICF0aGlzLnN0YXRlLmltZ0Vycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXN0cmljdCB0aGUgd2lkdGggb2YgdGhlIHRodW1ibmFpbCBoZXJlLCBvdGhlcndpc2UgaXQgd2lsbCBmaWxsIHRoZSBjb250YWluZXJcbiAgICAgICAgICAgIC8vIHdoaWNoIGhhcyB0aGUgc2FtZSB3aWR0aCBhcyB0aGUgdGltZWxpbmVcbiAgICAgICAgICAgIC8vIG14X01JbWFnZUJvZHlfdGh1bWJuYWlsIHJlc2l6ZXMgaW1nIHRvIGV4YWN0bHkgY29udGFpbmVyIHNpemVcbiAgICAgICAgICAgIGltZyA9IChcbiAgICAgICAgICAgICAgICA8aW1nIGNsYXNzTmFtZT1cIm14X01JbWFnZUJvZHlfdGh1bWJuYWlsXCIgc3JjPXt0aHVtYlVybH0gcmVmPXt0aGlzLl9pbWFnZX1cbiAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IG1heFdpZHRoOiBtYXhXaWR0aCArIFwicHhcIiB9fVxuICAgICAgICAgICAgICAgICAgICAgYWx0PXtjb250ZW50LmJvZHl9XG4gICAgICAgICAgICAgICAgICAgICBvbkVycm9yPXt0aGlzLm9uSW1hZ2VFcnJvcn1cbiAgICAgICAgICAgICAgICAgICAgIG9uTG9hZD17dGhpcy5vbkltYWdlTG9hZH1cbiAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17dGhpcy5vbkltYWdlRW50ZXJ9XG4gICAgICAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU9e3RoaXMub25JbWFnZUxlYXZlfSAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5zaG93SW1hZ2UpIHtcbiAgICAgICAgICAgIGltZyA9IDxIaWRkZW5JbWFnZVBsYWNlaG9sZGVyIHN0eWxlPXt7IG1heFdpZHRoOiBtYXhXaWR0aCArIFwicHhcIiB9fSAvPjtcbiAgICAgICAgICAgIHNob3dQbGFjZWhvbGRlciA9IGZhbHNlOyAvLyBiZWNhdXNlIHdlJ3JlIGhpZGluZyB0aGUgaW1hZ2UsIHNvIGRvbid0IHNob3cgdGhlIHN0aWNrZXIgaWNvbi5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9pc0dpZigpICYmICFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYXV0b3BsYXlHaWZzQW5kVmlkZW9zXCIpICYmICF0aGlzLnN0YXRlLmhvdmVyKSB7XG4gICAgICAgICAgICBnaWZMYWJlbCA9IDxwIGNsYXNzTmFtZT1cIm14X01JbWFnZUJvZHlfZ2lmTGFiZWxcIj5HSUY8L3A+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGh1bWJuYWlsID0gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NSW1hZ2VCb2R5X3RodW1ibmFpbF9jb250YWluZXJcIiBzdHlsZT17eyBtYXhIZWlnaHQ6IG1heEhlaWdodCArIFwicHhcIiB9fSA+XG4gICAgICAgICAgICAgICAgeyAvKiBDYWxjdWxhdGUgYXNwZWN0IHJhdGlvLCB1c2luZyAlcGFkZGluZyB3aWxsIHNpemUgX2NvbnRhaW5lciBjb3JyZWN0bHkgKi8gfVxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZ0JvdHRvbTogKDEwMCAqIGluZm9IZWlnaHQgLyBpbmZvV2lkdGgpICsgJyUnIH19IC8+XG4gICAgICAgICAgICAgICAgeyBzaG93UGxhY2Vob2xkZXIgJiZcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NSW1hZ2VCb2R5X3RodW1ibmFpbFwiIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb25zdHJhaW4gd2lkdGggaGVyZSBzbyB0aGF0IHNwaW5uZXIgYXBwZWFycyBjZW50cmFsIHRvIHRoZSBsb2FkZWQgdGh1bWJuYWlsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhXaWR0aDogaW5mb1dpZHRoICsgXCJweFwiLFxuICAgICAgICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTUltYWdlQm9keV90aHVtYm5haWxfc3Bpbm5lclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcGxhY2Vob2xkZXIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tkaXNwbGF5OiAhc2hvd1BsYWNlaG9sZGVyID8gdW5kZWZpbmVkIDogJ25vbmUnfX0+XG4gICAgICAgICAgICAgICAgICAgIHsgaW1nIH1cbiAgICAgICAgICAgICAgICAgICAgeyBnaWZMYWJlbCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUuaG92ZXIgJiYgdGhpcy5nZXRUb29sdGlwKCkgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMud3JhcEltYWdlKGNvbnRlbnRVcmwsIHRodW1ibmFpbCk7XG4gICAgfVxuXG4gICAgLy8gT3ZlcmlkZGVuIGJ5IE1TdGlja2VyQm9keVxuICAgIHdyYXBJbWFnZShjb250ZW50VXJsLCBjaGlsZHJlbikge1xuICAgICAgICByZXR1cm4gPGEgaHJlZj17Y29udGVudFVybH0gb25DbGljaz17dGhpcy5vbkNsaWNrfT5cbiAgICAgICAgICAgIHtjaGlsZHJlbn1cbiAgICAgICAgPC9hPjtcbiAgICB9XG5cbiAgICAvLyBPdmVyaWRkZW4gYnkgTVN0aWNrZXJCb2R5XG4gICAgZ2V0UGxhY2Vob2xkZXIoKSB7XG4gICAgICAgIC8vIE1JbWFnZUJvZHkgZG9lc24ndCBzaG93IGEgcGxhY2Vob2xkZXIgd2hpbHN0IHRoZSBpbWFnZSBsb2FkcywgKGJ1dCBpdCBjb3VsZCBkbylcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gT3ZlcmlkZGVuIGJ5IE1TdGlja2VyQm9keVxuICAgIGdldFRvb2x0aXAoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIE92ZXJpZGRlbiBieSBNU3RpY2tlckJvZHlcbiAgICBnZXRGaWxlQm9keSgpIHtcbiAgICAgICAgcmV0dXJuIDxNRmlsZUJvZHkgey4uLnRoaXMucHJvcHN9IGRlY3J5cHRlZEJsb2I9e3RoaXMuc3RhdGUuZGVjcnlwdGVkQmxvYn0gLz47XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9NSW1hZ2VCb2R5XCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy93YXJuaW5nLnN2Z1wiKX0gd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkVycm9yIGRlY3J5cHRpbmcgaW1hZ2VcIikgfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb250ZW50VXJsID0gdGhpcy5fZ2V0Q29udGVudFVybCgpO1xuICAgICAgICBsZXQgdGh1bWJVcmw7XG4gICAgICAgIGlmICh0aGlzLl9pc0dpZigpICYmIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhdXRvcGxheUdpZnNBbmRWaWRlb3NcIikpIHtcbiAgICAgICAgICB0aHVtYlVybCA9IGNvbnRlbnRVcmw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGh1bWJVcmwgPSB0aGlzLl9nZXRUaHVtYlVybCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGh1bWJuYWlsID0gdGhpcy5fbWVzc2FnZUNvbnRlbnQoY29udGVudFVybCwgdGh1bWJVcmwsIGNvbnRlbnQpO1xuICAgICAgICBjb25zdCBmaWxlQm9keSA9IHRoaXMuZ2V0RmlsZUJvZHkoKTtcblxuICAgICAgICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPVwibXhfTUltYWdlQm9keVwiPlxuICAgICAgICAgICAgeyB0aHVtYm5haWwgfVxuICAgICAgICAgICAgeyBmaWxlQm9keSB9XG4gICAgICAgIDwvc3Bhbj47XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSGlkZGVuSW1hZ2VQbGFjZWhvbGRlciBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGhvdmVyOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgY2xhc3NOYW1lID0gJ214X0hpZGRlbkltYWdlUGxhY2Vob2xkZXInO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5ob3ZlcikgY2xhc3NOYW1lICs9ICcgbXhfSGlkZGVuSW1hZ2VQbGFjZWhvbGRlcl9ob3Zlcic7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfSGlkZGVuSW1hZ2VQbGFjZWhvbGRlcl9idXR0b24nPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X0hpZGRlbkltYWdlUGxhY2Vob2xkZXJfZXllJyAvPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj57X3QoXCJTaG93IGltYWdlXCIpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==