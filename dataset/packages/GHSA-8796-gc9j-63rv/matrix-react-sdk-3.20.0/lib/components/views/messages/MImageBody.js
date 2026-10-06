"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _Media = require("../../../customisations/Media");

var _dec, _class, _class2, _temp;

let MImageBody = (_dec = (0, _replaceableComponent.replaceableComponent)("views.messages.MImageBody"), _dec(_class = (_temp = _class2 = class MImageBody extends _react.default.Component {
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
  } // FIXME: factor this out and apply it to MVideoBody and MAudioBody too!


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
        mxEvent: this.props.mxEvent,
        permalinkCreator: this.props.permalinkCreator
      };

      if (content.info) {
        params.width = content.info.w;
        params.height = content.info.h;
        params.fileSize = content.info.size;
      }

      _Modal.default.createDialog(ImageView, params, "mx_Dialog_lightbox", null, true);
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
    const media = (0, _Media.mediaFromContent)(this.props.mxEvent.getContent());

    if (media.isEncrypted) {
      return this.state.decryptedUrl;
    } else {
      return media.srcHttp;
    }
  }

  _getThumbUrl() {
    // FIXME: we let images grow as wide as you like, rather than capped to 800x600.
    // So either we need to support custom timeline widths here, or reimpose the cap, otherwise the
    // thumbnail resolution will be unnecessarily reduced.
    // custom timeline widths seems preferable.
    const thumbWidth = 800;
    const thumbHeight = 600;
    const content = this.props.mxEvent.getContent();
    const media = (0, _Media.mediaFromContent)(content);

    if (media.isEncrypted) {
      // Don't use the thumbnail for clients wishing to autoplay gifs.
      if (this.state.decryptedThumbnailUrl) {
        return this.state.decryptedThumbnailUrl;
      }

      return this.state.decryptedUrl;
    } else if (content.info && content.info.mimetype === "image/svg+xml" && media.hasThumbnail) {
      // special case to return clientside sender-generated thumbnails for SVGs, if any,
      // given we deliberately don't thumbnail them serverside to prevent
      // billion lol attacks and similar
      return media.getThumbnailHttp(thumbWidth, thumbHeight, 'scale');
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

      if (this._isGif() || window.devicePixelRatio === 1.0 || !info || !info.w || !info.h || !info.size) {
        return media.getThumbnailOfSourceHttp(thumbWidth, thumbHeight);
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
        const isLargeFileSize = info.size > 1 * 1024 * 1024; // 1mb

        if (isLargeFileSize && isLargerThanThumbnail) {
          // image is too large physically and bytewise to clutter our timeline so
          // we ask for a thumbnail, despite knowing that it will be max 800x600
          // despite us being retina (as synapse doesn't do 1600x1200 thumbs yet).
          return media.getThumbnailOfSourceHttp(thumbWidth, thumbHeight);
        } else {
          // download the original image otherwise, so we can scale it client side
          // to take pixelRatio into account.
          return media.srcHttp;
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
      decryptedBlob: this.state.decryptedBlob,
      showGenericPlaceholder: false
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  /* the MatrixEvent to show */
  mxEvent: _propTypes.default.object.isRequired,

  /* called when the image has loaded */
  onHeightChanged: _propTypes.default.func.isRequired,

  /* the maximum image height to use */
  maxImageHeight: _propTypes.default.number,

  /* the permalinkCreator */
  permalinkCreator: _propTypes.default.object
}), (0, _defineProperty2.default)(_class2, "contextType", _MatrixClientContext.default), _temp)) || _class);
exports.default = MImageBody;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL01JbWFnZUJvZHkuanMiXSwibmFtZXMiOlsiTUltYWdlQm9keSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIm9uSW1hZ2VFcnJvciIsImJpbmQiLCJvbkltYWdlTG9hZCIsIm9uSW1hZ2VFbnRlciIsIm9uSW1hZ2VMZWF2ZSIsIm9uQ2xpZW50U3luYyIsIm9uQ2xpY2siLCJfaXNHaWYiLCJzdGF0ZSIsImRlY3J5cHRlZFVybCIsImRlY3J5cHRlZFRodW1ibmFpbFVybCIsImRlY3J5cHRlZEJsb2IiLCJlcnJvciIsImltZ0Vycm9yIiwiaW1nTG9hZGVkIiwibG9hZGVkSW1hZ2VEaW1lbnNpb25zIiwiaG92ZXIiLCJzaG93SW1hZ2UiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJfaW1hZ2UiLCJzeW5jU3RhdGUiLCJwcmV2U3RhdGUiLCJ1bm1vdW50ZWQiLCJyZWNvbm5lY3RlZCIsInNldFN0YXRlIiwibG9jYWxTdG9yYWdlIiwic2V0SXRlbSIsIm14RXZlbnQiLCJnZXRJZCIsIl9kb3dubG9hZEltYWdlIiwiZXYiLCJidXR0b24iLCJtZXRhS2V5IiwicHJldmVudERlZmF1bHQiLCJjb250ZW50IiwiZ2V0Q29udGVudCIsImh0dHBVcmwiLCJfZ2V0Q29udGVudFVybCIsIkltYWdlVmlldyIsInNkayIsImdldENvbXBvbmVudCIsInBhcmFtcyIsInNyYyIsIm5hbWUiLCJib2R5IiwibGVuZ3RoIiwicGVybWFsaW5rQ3JlYXRvciIsImluZm8iLCJ3aWR0aCIsInciLCJoZWlnaHQiLCJoIiwiZmlsZVNpemUiLCJzaXplIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJtaW1ldHlwZSIsImUiLCJpbWdFbGVtZW50IiwidGFyZ2V0IiwiX2dldFRodW1iVXJsIiwib25IZWlnaHRDaGFuZ2VkIiwiY3VycmVudCIsIm5hdHVyYWxXaWR0aCIsIm5hdHVyYWxIZWlnaHQiLCJtZWRpYSIsImlzRW5jcnlwdGVkIiwic3JjSHR0cCIsInRodW1iV2lkdGgiLCJ0aHVtYkhlaWdodCIsImhhc1RodW1ibmFpbCIsImdldFRodW1ibmFpbEh0dHAiLCJ3aW5kb3ciLCJkZXZpY2VQaXhlbFJhdGlvIiwiZ2V0VGh1bWJuYWlsT2ZTb3VyY2VIdHRwIiwiaXNMYXJnZXJUaGFuVGh1bWJuYWlsIiwiaXNMYXJnZUZpbGVTaXplIiwiZmlsZSIsInVuZGVmaW5lZCIsInRodW1ibmFpbFByb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInRodW1ibmFpbF9maWxlIiwidGhlbiIsImJsb2IiLCJVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJ0aHVtYm5haWxVcmwiLCJjb250ZW50VXJsIiwiY2F0Y2giLCJlcnIiLCJjb25zb2xlIiwid2FybiIsImNvbXBvbmVudERpZE1vdW50IiwiY29udGV4dCIsIm9uIiwiZ2V0SXRlbSIsIl9hZnRlckNvbXBvbmVudERpZE1vdW50IiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVMaXN0ZW5lciIsIl9hZnRlckNvbXBvbmVudFdpbGxVbm1vdW50IiwicmV2b2tlT2JqZWN0VVJMIiwiX21lc3NhZ2VDb250ZW50IiwidGh1bWJVcmwiLCJpbmZvV2lkdGgiLCJpbmZvSGVpZ2h0IiwiaW1hZ2VFbGVtZW50IiwiZGlzcGxheSIsIndyYXBJbWFnZSIsIm1heEhlaWdodCIsIk1hdGgiLCJtaW4iLCJtYXhJbWFnZUhlaWdodCIsIm1heFdpZHRoIiwiaW1nIiwicGxhY2Vob2xkZXIiLCJnaWZMYWJlbCIsImdldFBsYWNlaG9sZGVyIiwic2hvd1BsYWNlaG9sZGVyIiwiQm9vbGVhbiIsInRodW1ibmFpbCIsInBhZGRpbmdCb3R0b20iLCJnZXRUb29sdGlwIiwiY2hpbGRyZW4iLCJnZXRGaWxlQm9keSIsInJlbmRlciIsInJlcXVpcmUiLCJmaWxlQm9keSIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJmdW5jIiwibnVtYmVyIiwiTWF0cml4Q2xpZW50Q29udGV4dCIsIkhpZGRlbkltYWdlUGxhY2Vob2xkZXIiLCJQdXJlQ29tcG9uZW50IiwiY2xhc3NOYW1lIiwiYm9vbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0lBR3FCQSxVLFdBRHBCLGdEQUFxQiwyQkFBckIsQyxtQ0FBRCxNQUNxQkEsVUFEckIsU0FDd0NDLGVBQU1DLFNBRDlDLENBQ3dEO0FBaUJwREMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRUEsU0FBS0MsWUFBTCxHQUFvQixLQUFLQSxZQUFMLENBQWtCQyxJQUFsQixDQUF1QixJQUF2QixDQUFwQjtBQUNBLFNBQUtDLFdBQUwsR0FBbUIsS0FBS0EsV0FBTCxDQUFpQkQsSUFBakIsQ0FBc0IsSUFBdEIsQ0FBbkI7QUFDQSxTQUFLRSxZQUFMLEdBQW9CLEtBQUtBLFlBQUwsQ0FBa0JGLElBQWxCLENBQXVCLElBQXZCLENBQXBCO0FBQ0EsU0FBS0csWUFBTCxHQUFvQixLQUFLQSxZQUFMLENBQWtCSCxJQUFsQixDQUF1QixJQUF2QixDQUFwQjtBQUNBLFNBQUtJLFlBQUwsR0FBb0IsS0FBS0EsWUFBTCxDQUFrQkosSUFBbEIsQ0FBdUIsSUFBdkIsQ0FBcEI7QUFDQSxTQUFLSyxPQUFMLEdBQWUsS0FBS0EsT0FBTCxDQUFhTCxJQUFiLENBQWtCLElBQWxCLENBQWY7QUFDQSxTQUFLTSxNQUFMLEdBQWMsS0FBS0EsTUFBTCxDQUFZTixJQUFaLENBQWlCLElBQWpCLENBQWQ7QUFFQSxTQUFLTyxLQUFMLEdBQWE7QUFDVEMsTUFBQUEsWUFBWSxFQUFFLElBREw7QUFFVEMsTUFBQUEscUJBQXFCLEVBQUUsSUFGZDtBQUdUQyxNQUFBQSxhQUFhLEVBQUUsSUFITjtBQUlUQyxNQUFBQSxLQUFLLEVBQUUsSUFKRTtBQUtUQyxNQUFBQSxRQUFRLEVBQUUsS0FM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QSxRQUFJLEtBQUsxSSxLQUFMLENBQVdpQixLQUFmLEVBQXNCeUgsU0FBUyxJQUFJLGtDQUFiO0FBQ3RCLHdCQUNJO0FBQUssTUFBQSxTQUFTLEVBQUVBO0FBQWhCLG9CQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFNLE1BQUEsU0FBUyxFQUFDO0FBQWhCLE1BREosZUFFSSwyQ0FBTyx5QkFBRyxZQUFILENBQVAsQ0FGSixDQURKLENBREo7QUFRSDs7QUFoQjJEOzs7OEJBQW5ERixzQixlQUNVO0FBQ2Z2SCxFQUFBQSxLQUFLLEVBQUVpSCxtQkFBVVM7QUFERixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTgsIDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlUmVmfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuXG5pbXBvcnQgTUZpbGVCb2R5IGZyb20gJy4vTUZpbGVCb2R5JztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgZGVjcnlwdEZpbGUgfSBmcm9tICcuLi8uLi8uLi91dGlscy9EZWNyeXB0RmlsZSc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCBJbmxpbmVTcGlubmVyIGZyb20gJy4uL2VsZW1lbnRzL0lubGluZVNwaW5uZXInO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5pbXBvcnQge21lZGlhRnJvbUNvbnRlbnR9IGZyb20gXCIuLi8uLi8uLi9jdXN0b21pc2F0aW9ucy9NZWRpYVwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5tZXNzYWdlcy5NSW1hZ2VCb2R5XCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNSW1hZ2VCb2R5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvKiB0aGUgTWF0cml4RXZlbnQgdG8gc2hvdyAqL1xuICAgICAgICBteEV2ZW50OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG5cbiAgICAgICAgLyogY2FsbGVkIHdoZW4gdGhlIGltYWdlIGhhcyBsb2FkZWQgKi9cbiAgICAgICAgb25IZWlnaHRDaGFuZ2VkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuXG4gICAgICAgIC8qIHRoZSBtYXhpbXVtIGltYWdlIGhlaWdodCB0byB1c2UgKi9cbiAgICAgICAgbWF4SW1hZ2VIZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIsXG5cbiAgICAgICAgLyogdGhlIHBlcm1hbGlua0NyZWF0b3IgKi9cbiAgICAgICAgcGVybWFsaW5rQ3JlYXRvcjogUHJvcFR5cGVzLm9iamVjdCxcbiAgICB9O1xuXG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLm9uSW1hZ2VFcnJvciA9IHRoaXMub25JbWFnZUVycm9yLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub25JbWFnZUxvYWQgPSB0aGlzLm9uSW1hZ2VMb2FkLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub25JbWFnZUVudGVyID0gdGhpcy5vbkltYWdlRW50ZXIuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5vbkltYWdlTGVhdmUgPSB0aGlzLm9uSW1hZ2VMZWF2ZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9uQ2xpZW50U3luYyA9IHRoaXMub25DbGllbnRTeW5jLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub25DbGljayA9IHRoaXMub25DbGljay5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9pc0dpZiA9IHRoaXMuX2lzR2lmLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGRlY3J5cHRlZFVybDogbnVsbCxcbiAgICAgICAgICAgIGRlY3J5cHRlZFRodW1ibmFpbFVybDogbnVsbCxcbiAgICAgICAgICAgIGRlY3J5cHRlZEJsb2I6IG51bGwsXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIGltZ0Vycm9yOiBmYWxzZSxcbiAgICAgICAgICAgIGltZ0xvYWRlZDogZmFsc2UsXG4gICAgICAgICAgICBsb2FkZWRJbWFnZURpbWVuc2lvbnM6IG51bGwsXG4gICAgICAgICAgICBob3ZlcjogZmFsc2UsXG4gICAgICAgICAgICBzaG93SW1hZ2U6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93SW1hZ2VzXCIpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX2ltYWdlID0gY3JlYXRlUmVmKCk7XG4gICAgfVxuXG4gICAgLy8gRklYTUU6IGZhY3RvciB0aGlzIG91dCBhbmQgYXBwbHkgaXQgdG8gTVZpZGVvQm9keSBhbmQgTUF1ZGlvQm9keSB0b28hXG4gICAgb25DbGllbnRTeW5jKHN5bmNTdGF0ZSwgcHJldlN0YXRlKSB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICAvLyBDb25zaWRlciB0aGUgY2xpZW50IHJlY29ubmVjdGVkIGlmIHRoZXJlIGlzIG5vIGVycm9yIHdpdGggc3luY2luZy5cbiAgICAgICAgLy8gVGhpcyBtZWFucyB0aGUgc3RhdGUgY291bGQgYmUgUkVDT05ORUNUSU5HLCBTWU5DSU5HLCBQUkVQQVJFRCBvciBDQVRDSFVQLlxuICAgICAgICBjb25zdCByZWNvbm5lY3RlZCA9IHN5bmNTdGF0ZSAhPT0gXCJFUlJPUlwiICYmIHByZXZTdGF0ZSAhPT0gc3luY1N0YXRlO1xuICAgICAgICBpZiAocmVjb25uZWN0ZWQgJiYgdGhpcy5zdGF0ZS5pbWdFcnJvcikge1xuICAgICAgICAgICAgLy8gTG9hZCB0aGUgaW1hZ2UgYWdhaW5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGltZ0Vycm9yOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2hvd0ltYWdlKCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm14X1Nob3dJbWFnZV9cIiArIHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpLCBcInRydWVcIik7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dJbWFnZTogdHJ1ZX0pO1xuICAgICAgICB0aGlzLl9kb3dubG9hZEltYWdlKCk7XG4gICAgfVxuXG4gICAgb25DbGljayhldikge1xuICAgICAgICBpZiAoZXYuYnV0dG9uID09PSAwICYmICFldi5tZXRhS2V5KSB7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnNob3dJbWFnZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0ltYWdlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgICAgIGNvbnN0IGh0dHBVcmwgPSB0aGlzLl9nZXRDb250ZW50VXJsKCk7XG4gICAgICAgICAgICBjb25zdCBJbWFnZVZpZXcgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuSW1hZ2VWaWV3XCIpO1xuICAgICAgICAgICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIHNyYzogaHR0cFVybCxcbiAgICAgICAgICAgICAgICBuYW1lOiBjb250ZW50LmJvZHkgJiYgY29udGVudC5ib2R5Lmxlbmd0aCA+IDAgPyBjb250ZW50LmJvZHkgOiBfdCgnQXR0YWNobWVudCcpLFxuICAgICAgICAgICAgICAgIG14RXZlbnQ6IHRoaXMucHJvcHMubXhFdmVudCxcbiAgICAgICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yOiB0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3IsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoY29udGVudC5pbmZvKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zLndpZHRoID0gY29udGVudC5pbmZvLnc7XG4gICAgICAgICAgICAgICAgcGFyYW1zLmhlaWdodCA9IGNvbnRlbnQuaW5mby5oO1xuICAgICAgICAgICAgICAgIHBhcmFtcy5maWxlU2l6ZSA9IGNvbnRlbnQuaW5mby5zaXplO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coSW1hZ2VWaWV3LCBwYXJhbXMsIFwibXhfRGlhbG9nX2xpZ2h0Ym94XCIsIG51bGwsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2lzR2lmKCkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGNvbnRlbnQgJiZcbiAgICAgICAgICAgIGNvbnRlbnQuaW5mbyAmJlxuICAgICAgICAgICAgY29udGVudC5pbmZvLm1pbWV0eXBlID09PSBcImltYWdlL2dpZlwiXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgb25JbWFnZUVudGVyKGUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGhvdmVyOiB0cnVlIH0pO1xuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5zaG93SW1hZ2UgfHwgIXRoaXMuX2lzR2lmKCkgfHwgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImF1dG9wbGF5R2lmc0FuZFZpZGVvc1wiKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGltZ0VsZW1lbnQgPSBlLnRhcmdldDtcbiAgICAgICAgaW1nRWxlbWVudC5zcmMgPSB0aGlzLl9nZXRDb250ZW50VXJsKCk7XG4gICAgfVxuXG4gICAgb25JbWFnZUxlYXZlKGUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGhvdmVyOiBmYWxzZSB9KTtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2hvd0ltYWdlIHx8ICF0aGlzLl9pc0dpZigpIHx8IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhdXRvcGxheUdpZnNBbmRWaWRlb3NcIikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbWdFbGVtZW50ID0gZS50YXJnZXQ7XG4gICAgICAgIGltZ0VsZW1lbnQuc3JjID0gdGhpcy5fZ2V0VGh1bWJVcmwoKTtcbiAgICB9XG5cbiAgICBvbkltYWdlRXJyb3IoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaW1nRXJyb3I6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uSW1hZ2VMb2FkKCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCgpO1xuXG4gICAgICAgIGxldCBsb2FkZWRJbWFnZURpbWVuc2lvbnM7XG5cbiAgICAgICAgaWYgKHRoaXMuX2ltYWdlLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgbmF0dXJhbFdpZHRoLCBuYXR1cmFsSGVpZ2h0IH0gPSB0aGlzLl9pbWFnZS5jdXJyZW50O1xuICAgICAgICAgICAgLy8gdGhpcyBpcyBvbmx5IHVzZWQgYXMgYSBmYWxsYmFjayBpbiBjYXNlIGNvbnRlbnQuaW5mby53L2ggaXMgbWlzc2luZ1xuICAgICAgICAgICAgbG9hZGVkSW1hZ2VEaW1lbnNpb25zID0geyBuYXR1cmFsV2lkdGgsIG5hdHVyYWxIZWlnaHQgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBpbWdMb2FkZWQ6IHRydWUsIGxvYWRlZEltYWdlRGltZW5zaW9ucyB9KTtcbiAgICB9XG5cbiAgICBfZ2V0Q29udGVudFVybCgpIHtcbiAgICAgICAgY29uc3QgbWVkaWEgPSBtZWRpYUZyb21Db250ZW50KHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50KCkpO1xuICAgICAgICBpZiAobWVkaWEuaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmRlY3J5cHRlZFVybDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBtZWRpYS5zcmNIdHRwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2dldFRodW1iVXJsKCkge1xuICAgICAgICAvLyBGSVhNRTogd2UgbGV0IGltYWdlcyBncm93IGFzIHdpZGUgYXMgeW91IGxpa2UsIHJhdGhlciB0aGFuIGNhcHBlZCB0byA4MDB4NjAwLlxuICAgICAgICAvLyBTbyBlaXRoZXIgd2UgbmVlZCB0byBzdXBwb3J0IGN1c3RvbSB0aW1lbGluZSB3aWR0aHMgaGVyZSwgb3IgcmVpbXBvc2UgdGhlIGNhcCwgb3RoZXJ3aXNlIHRoZVxuICAgICAgICAvLyB0aHVtYm5haWwgcmVzb2x1dGlvbiB3aWxsIGJlIHVubmVjZXNzYXJpbHkgcmVkdWNlZC5cbiAgICAgICAgLy8gY3VzdG9tIHRpbWVsaW5lIHdpZHRocyBzZWVtcyBwcmVmZXJhYmxlLlxuICAgICAgICBjb25zdCB0aHVtYldpZHRoID0gODAwO1xuICAgICAgICBjb25zdCB0aHVtYkhlaWdodCA9IDYwMDtcblxuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgY29uc3QgbWVkaWEgPSBtZWRpYUZyb21Db250ZW50KGNvbnRlbnQpO1xuXG4gICAgICAgIGlmIChtZWRpYS5pc0VuY3J5cHRlZCkge1xuICAgICAgICAgICAgLy8gRG9uJ3QgdXNlIHRoZSB0aHVtYm5haWwgZm9yIGNsaWVudHMgd2lzaGluZyB0byBhdXRvcGxheSBnaWZzLlxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGVjcnlwdGVkVGh1bWJuYWlsVXJsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZGVjcnlwdGVkVGh1bWJuYWlsVXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZGVjcnlwdGVkVXJsO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbnRlbnQuaW5mbyAmJiBjb250ZW50LmluZm8ubWltZXR5cGUgPT09IFwiaW1hZ2Uvc3ZnK3htbFwiICYmIG1lZGlhLmhhc1RodW1ibmFpbCkge1xuICAgICAgICAgICAgLy8gc3BlY2lhbCBjYXNlIHRvIHJldHVybiBjbGllbnRzaWRlIHNlbmRlci1nZW5lcmF0ZWQgdGh1bWJuYWlscyBmb3IgU1ZHcywgaWYgYW55LFxuICAgICAgICAgICAgLy8gZ2l2ZW4gd2UgZGVsaWJlcmF0ZWx5IGRvbid0IHRodW1ibmFpbCB0aGVtIHNlcnZlcnNpZGUgdG8gcHJldmVudFxuICAgICAgICAgICAgLy8gYmlsbGlvbiBsb2wgYXR0YWNrcyBhbmQgc2ltaWxhclxuICAgICAgICAgICAgcmV0dXJuIG1lZGlhLmdldFRodW1ibmFpbEh0dHAodGh1bWJXaWR0aCwgdGh1bWJIZWlnaHQsICdzY2FsZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gd2UgdHJ5IHRvIGRvd25sb2FkIHRoZSBjb3JyZWN0IHJlc29sdXRpb25cbiAgICAgICAgICAgIC8vIGZvciBoaS1yZXMgaW1hZ2VzIChsaWtlIHJldGluYSBzY3JlZW5zaG90cykuXG4gICAgICAgICAgICAvLyBzeW5hcHNlIG9ubHkgc3VwcG9ydHMgODAweDYwMCB0aHVtYm5haWxzIGZvciBub3cgdGhvdWdoLFxuICAgICAgICAgICAgLy8gc28gd2UnbGwgbmVlZCB0byBkb3dubG9hZCB0aGUgb3JpZ2luYWwgaW1hZ2UgZm9yIHRoaXMgdG8gd29ya1xuICAgICAgICAgICAgLy8gd2VsbCBmb3Igbm93LiBGaXJzdCwgbGV0J3MgdHJ5IGEgZmV3IGNhc2VzIHRoYXQgbGV0IHVzIGF2b2lkXG4gICAgICAgICAgICAvLyBkb3dubG9hZGluZyB0aGUgb3JpZ2luYWwsIGluY2x1ZGluZzpcbiAgICAgICAgICAgIC8vICAgLSBXaGVuIGRpc3BsYXlpbmcgYSBHSUYsIHdlIGFsd2F5cyB3YW50IHRvIHRodW1ibmFpbCBzbyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgLy8gICAgIHByb3Blcmx5IHJlc3BlY3QgdGhlIHVzZXIncyBHSUYgYXV0b3BsYXkgc2V0dGluZyAod2hpY2ggcmVsaWVzIG9uXG4gICAgICAgICAgICAvLyAgICAgdGh1bWJuYWlsaW5nIHRvIHByb2R1Y2UgdGhlIHN0YXRpYyBwcmV2aWV3IGltYWdlKVxuICAgICAgICAgICAgLy8gICAtIE9uIGEgbG93IERQSSBkZXZpY2UsIGFsd2F5cyB0aHVtYm5haWwgdG8gc2F2ZSBiYW5kd2lkdGhcbiAgICAgICAgICAgIC8vICAgLSBJZiB0aGVyZSdzIG5vIHNpemluZyBpbmZvIGluIHRoZSBldmVudCwgZGVmYXVsdCB0byB0aHVtYm5haWxcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSBjb250ZW50LmluZm87XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgdGhpcy5faXNHaWYoKSB8fFxuICAgICAgICAgICAgICAgIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID09PSAxLjAgfHxcbiAgICAgICAgICAgICAgICAoIWluZm8gfHwgIWluZm8udyB8fCAhaW5mby5oIHx8ICFpbmZvLnNpemUpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVkaWEuZ2V0VGh1bWJuYWlsT2ZTb3VyY2VIdHRwKHRodW1iV2lkdGgsIHRodW1iSGVpZ2h0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gd2Ugc2hvdWxkIG9ubHkgcmVxdWVzdCB0aHVtYm5haWxzIGlmIHRoZSBpbWFnZSBpcyBiaWdnZXIgdGhhbiA4MDB4NjAwXG4gICAgICAgICAgICAgICAgLy8gKG9yIDE2MDB4MTIwMCBvbiByZXRpbmEpIG90aGVyd2lzZSB0aGUgaW1hZ2UgaW4gdGhlIHRpbWVsaW5lIHdpbGwganVzdFxuICAgICAgICAgICAgICAgIC8vIGVuZCB1cCByZXNhbXBsZWQgYW5kIGRlLXJldGluYSdkIGZvciBubyBnb29kIHJlYXNvbi5cbiAgICAgICAgICAgICAgICAvLyBJZGVhbGx5IHRoZSBzZXJ2ZXIgd291bGQgcHJlZ2VuIDE2MDB4MTIwMCB0aHVtYm5haWxzIGluIG9yZGVyIHRvIHByb3ZpZGUgcmV0aW5hXG4gICAgICAgICAgICAgICAgLy8gdGh1bWJuYWlscywgYnV0IHdlIGRvbid0IGRvIHRoaXMgY3VycmVudGx5IGluIHN5bmFwc2UgZm9yIGZlYXIgb2YgZGlzayBzcGFjZS5cbiAgICAgICAgICAgICAgICAvLyBBcyBhIGNvbXByb21pc2UsIGxldCdzIHN3aXRjaCB0byBub24tcmV0aW5hIHRodW1ibmFpbHMgb25seSBpZiB0aGUgb3JpZ2luYWxcbiAgICAgICAgICAgICAgICAvLyBpbWFnZSBpcyBib3RoIHBoeXNpY2FsbHkgdG9vIGxhcmdlIGFuZCBnb2luZyB0byBiZSBtYXNzaXZlIHRvIGxvYWQgaW4gdGhlXG4gICAgICAgICAgICAgICAgLy8gdGltZWxpbmUgKGUuZy4gPjFNQikuXG5cbiAgICAgICAgICAgICAgICBjb25zdCBpc0xhcmdlclRoYW5UaHVtYm5haWwgPSAoXG4gICAgICAgICAgICAgICAgICAgIGluZm8udyA+IHRodW1iV2lkdGggfHxcbiAgICAgICAgICAgICAgICAgICAgaW5mby5oID4gdGh1bWJIZWlnaHRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzTGFyZ2VGaWxlU2l6ZSA9IGluZm8uc2l6ZSA+IDEqMTAyNCoxMDI0OyAvLyAxbWJcblxuICAgICAgICAgICAgICAgIGlmIChpc0xhcmdlRmlsZVNpemUgJiYgaXNMYXJnZXJUaGFuVGh1bWJuYWlsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGltYWdlIGlzIHRvbyBsYXJnZSBwaHlzaWNhbGx5IGFuZCBieXRld2lzZSB0byBjbHV0dGVyIG91ciB0aW1lbGluZSBzb1xuICAgICAgICAgICAgICAgICAgICAvLyB3ZSBhc2sgZm9yIGEgdGh1bWJuYWlsLCBkZXNwaXRlIGtub3dpbmcgdGhhdCBpdCB3aWxsIGJlIG1heCA4MDB4NjAwXG4gICAgICAgICAgICAgICAgICAgIC8vIGRlc3BpdGUgdXMgYmVpbmcgcmV0aW5hIChhcyBzeW5hcHNlIGRvZXNuJ3QgZG8gMTYwMHgxMjAwIHRodW1icyB5ZXQpLlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVkaWEuZ2V0VGh1bWJuYWlsT2ZTb3VyY2VIdHRwKHRodW1iV2lkdGgsIHRodW1iSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBkb3dubG9hZCB0aGUgb3JpZ2luYWwgaW1hZ2Ugb3RoZXJ3aXNlLCBzbyB3ZSBjYW4gc2NhbGUgaXQgY2xpZW50IHNpZGVcbiAgICAgICAgICAgICAgICAgICAgLy8gdG8gdGFrZSBwaXhlbFJhdGlvIGludG8gYWNjb3VudC5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lZGlhLnNyY0h0dHA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2Rvd25sb2FkSW1hZ2UoKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICBpZiAoY29udGVudC5maWxlICE9PSB1bmRlZmluZWQgJiYgdGhpcy5zdGF0ZS5kZWNyeXB0ZWRVcmwgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGxldCB0aHVtYm5haWxQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgaWYgKGNvbnRlbnQuaW5mbyAmJiBjb250ZW50LmluZm8udGh1bWJuYWlsX2ZpbGUpIHtcbiAgICAgICAgICAgICAgICB0aHVtYm5haWxQcm9taXNlID0gZGVjcnlwdEZpbGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuaW5mby50aHVtYm5haWxfZmlsZSxcbiAgICAgICAgICAgICAgICApLnRoZW4oZnVuY3Rpb24oYmxvYikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBkZWNyeXB0ZWRCbG9iO1xuICAgICAgICAgICAgdGh1bWJuYWlsUHJvbWlzZS50aGVuKCh0aHVtYm5haWxVcmwpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVjcnlwdEZpbGUoY29udGVudC5maWxlKS50aGVuKGZ1bmN0aW9uKGJsb2IpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVjcnlwdGVkQmxvYiA9IGJsb2I7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICAgICAgICAgIH0pLnRoZW4oKGNvbnRlbnRVcmwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVjcnlwdGVkVXJsOiBjb250ZW50VXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjcnlwdGVkVGh1bWJuYWlsVXJsOiB0aHVtYm5haWxVcmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNyeXB0ZWRCbG9iOiBkZWNyeXB0ZWRCbG9iLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJVbmFibGUgdG8gZGVjcnlwdCBhdHRhY2htZW50OiBcIiwgZXJyKTtcbiAgICAgICAgICAgICAgICAvLyBTZXQgYSBwbGFjZWhvbGRlciBpbWFnZSB3aGVuIHdlIGNhbid0IGRlY3J5cHQgdGhlIGltYWdlLlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb250ZXh0Lm9uKCdzeW5jJywgdGhpcy5vbkNsaWVudFN5bmMpO1xuXG4gICAgICAgIGNvbnN0IHNob3dJbWFnZSA9IHRoaXMuc3RhdGUuc2hvd0ltYWdlIHx8XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm14X1Nob3dJbWFnZV9cIiArIHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpKSA9PT0gXCJ0cnVlXCI7XG5cbiAgICAgICAgaWYgKHNob3dJbWFnZSkge1xuICAgICAgICAgICAgLy8gRG9uJ3QgZG93bmxvYWQgYW55dGhpbmcgYmVjYXVlIHdlIGRvbid0IHdhbnQgdG8gZGlzcGxheSBhbnl0aGluZy5cbiAgICAgICAgICAgIHRoaXMuX2Rvd25sb2FkSW1hZ2UoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dJbWFnZTogdHJ1ZX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fYWZ0ZXJDb21wb25lbnREaWRNb3VudCgpO1xuICAgIH1cblxuICAgIC8vIFRvIGJlIG92ZXJyaWRkZW4gYnkgc3ViY2xhc3NlcyAoZS5nLiBNU3RpY2tlckJvZHkpIGZvciBmdXJ0aGVyXG4gICAgLy8gaW5pdGlhbGlzYXRpb24gYWZ0ZXIgY29tcG9uZW50RGlkTW91bnRcbiAgICBfYWZ0ZXJDb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoJ3N5bmMnLCB0aGlzLm9uQ2xpZW50U3luYyk7XG4gICAgICAgIHRoaXMuX2FmdGVyQ29tcG9uZW50V2lsbFVubW91bnQoKTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5kZWNyeXB0ZWRVcmwpIHtcbiAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodGhpcy5zdGF0ZS5kZWNyeXB0ZWRVcmwpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmRlY3J5cHRlZFRodW1ibmFpbFVybCkge1xuICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh0aGlzLnN0YXRlLmRlY3J5cHRlZFRodW1ibmFpbFVybCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUbyBiZSBvdmVycmlkZGVuIGJ5IHN1YmNsYXNzZXMgKGUuZy4gTVN0aWNrZXJCb2R5KSBmb3IgZnVydGhlclxuICAgIC8vIGNsZWFudXAgYWZ0ZXIgY29tcG9uZW50V2lsbFVubW91bnRcbiAgICBfYWZ0ZXJDb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB9XG5cbiAgICBfbWVzc2FnZUNvbnRlbnQoY29udGVudFVybCwgdGh1bWJVcmwsIGNvbnRlbnQpIHtcbiAgICAgICAgbGV0IGluZm9XaWR0aDtcbiAgICAgICAgbGV0IGluZm9IZWlnaHQ7XG5cbiAgICAgICAgaWYgKGNvbnRlbnQgJiYgY29udGVudC5pbmZvICYmIGNvbnRlbnQuaW5mby53ICYmIGNvbnRlbnQuaW5mby5oKSB7XG4gICAgICAgICAgICBpbmZvV2lkdGggPSBjb250ZW50LmluZm8udztcbiAgICAgICAgICAgIGluZm9IZWlnaHQgPSBjb250ZW50LmluZm8uaDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFdoaWxzdCB0aGUgaW1hZ2UgbG9hZHMsIGRpc3BsYXkgbm90aGluZy5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBPbmNlIGxvYWRlZCwgdXNlIHRoZSBsb2FkZWQgaW1hZ2UgZGltZW5zaW9ucyBzdG9yZWQgaW4gYGxvYWRlZEltYWdlRGltZW5zaW9uc2AuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gQnkgZG9pbmcgdGhpcywgdGhlIGltYWdlIFwicG9wc1wiIGludG8gdGhlIHRpbWVsaW5lLCBidXQgaXMgc3RpbGwgcmVzdHJpY3RlZFxuICAgICAgICAgICAgLy8gYnkgdGhlIHNhbWUgd2lkdGggYW5kIGhlaWdodCBsb2dpYyBiZWxvdy5cbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5sb2FkZWRJbWFnZURpbWVuc2lvbnMpIHtcbiAgICAgICAgICAgICAgICBsZXQgaW1hZ2VFbGVtZW50O1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5zaG93SW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VFbGVtZW50ID0gPEhpZGRlbkltYWdlUGxhY2Vob2xkZXIgLz47XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VFbGVtZW50ID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBzdHlsZT17e2Rpc3BsYXk6ICdub25lJ319IHNyYz17dGh1bWJVcmx9IHJlZj17dGhpcy5faW1hZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0PXtjb250ZW50LmJvZHl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcj17dGhpcy5vbkltYWdlRXJyb3J9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Mb2FkPXt0aGlzLm9uSW1hZ2VMb2FkfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud3JhcEltYWdlKGNvbnRlbnRVcmwsIGltYWdlRWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmZvV2lkdGggPSB0aGlzLnN0YXRlLmxvYWRlZEltYWdlRGltZW5zaW9ucy5uYXR1cmFsV2lkdGg7XG4gICAgICAgICAgICBpbmZvSGVpZ2h0ID0gdGhpcy5zdGF0ZS5sb2FkZWRJbWFnZURpbWVuc2lvbnMubmF0dXJhbEhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBtYXhpbXVtIGhlaWdodCBvZiB0aGUgdGh1bWJuYWlsIGFzIGl0IGlzIHJlbmRlcmVkIGFzIGFuIDxpbWc+XG4gICAgICAgIGNvbnN0IG1heEhlaWdodCA9IE1hdGgubWluKHRoaXMucHJvcHMubWF4SW1hZ2VIZWlnaHQgfHwgNjAwLCBpbmZvSGVpZ2h0KTtcbiAgICAgICAgLy8gVGhlIG1heGltdW0gd2lkdGggb2YgdGhlIHRodW1ibmFpbCwgYXMgZGljdGF0ZWQgYnkgaXRzIG5hdHVyYWxcbiAgICAgICAgLy8gbWF4aW11bSBoZWlnaHQuXG4gICAgICAgIGNvbnN0IG1heFdpZHRoID0gaW5mb1dpZHRoICogbWF4SGVpZ2h0IC8gaW5mb0hlaWdodDtcblxuICAgICAgICBsZXQgaW1nID0gbnVsbDtcbiAgICAgICAgbGV0IHBsYWNlaG9sZGVyID0gbnVsbDtcbiAgICAgICAgbGV0IGdpZkxhYmVsID0gbnVsbDtcblxuICAgICAgICAvLyBlMmUgaW1hZ2UgaGFzbid0IGJlZW4gZGVjcnlwdGVkIHlldFxuICAgICAgICBpZiAoY29udGVudC5maWxlICE9PSB1bmRlZmluZWQgJiYgdGhpcy5zdGF0ZS5kZWNyeXB0ZWRVcmwgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gPElubGluZVNwaW5uZXIgdz17MzJ9IGg9ezMyfSAvPjtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5zdGF0ZS5pbWdMb2FkZWQpIHtcbiAgICAgICAgICAgIC8vIERlbGliZXJhdGVseSwgZ2V0U3Bpbm5lciBpcyBsZWZ0IHVuaW1wbGVtZW50ZWQgaGVyZSwgTVN0aWNrZXJCb2R5IG92ZXJpZGVzXG4gICAgICAgICAgICBwbGFjZWhvbGRlciA9IHRoaXMuZ2V0UGxhY2Vob2xkZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzaG93UGxhY2Vob2xkZXIgPSBCb29sZWFuKHBsYWNlaG9sZGVyKTtcblxuICAgICAgICBpZiAodGh1bWJVcmwgJiYgIXRoaXMuc3RhdGUuaW1nRXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJlc3RyaWN0IHRoZSB3aWR0aCBvZiB0aGUgdGh1bWJuYWlsIGhlcmUsIG90aGVyd2lzZSBpdCB3aWxsIGZpbGwgdGhlIGNvbnRhaW5lclxuICAgICAgICAgICAgLy8gd2hpY2ggaGFzIHRoZSBzYW1lIHdpZHRoIGFzIHRoZSB0aW1lbGluZVxuICAgICAgICAgICAgLy8gbXhfTUltYWdlQm9keV90aHVtYm5haWwgcmVzaXplcyBpbWcgdG8gZXhhY3RseSBjb250YWluZXIgc2l6ZVxuICAgICAgICAgICAgaW1nID0gKFxuICAgICAgICAgICAgICAgIDxpbWcgY2xhc3NOYW1lPVwibXhfTUltYWdlQm9keV90aHVtYm5haWxcIiBzcmM9e3RodW1iVXJsfSByZWY9e3RoaXMuX2ltYWdlfVxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBtYXhXaWR0aDogbWF4V2lkdGggKyBcInB4XCIgfX1cbiAgICAgICAgICAgICAgICAgICAgYWx0PXtjb250ZW50LmJvZHl9XG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3I9e3RoaXMub25JbWFnZUVycm9yfVxuICAgICAgICAgICAgICAgICAgICBvbkxvYWQ9e3RoaXMub25JbWFnZUxvYWR9XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17dGhpcy5vbkltYWdlRW50ZXJ9XG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17dGhpcy5vbkltYWdlTGVhdmV9IC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnNob3dJbWFnZSkge1xuICAgICAgICAgICAgaW1nID0gPEhpZGRlbkltYWdlUGxhY2Vob2xkZXIgc3R5bGU9e3sgbWF4V2lkdGg6IG1heFdpZHRoICsgXCJweFwiIH19IC8+O1xuICAgICAgICAgICAgc2hvd1BsYWNlaG9sZGVyID0gZmFsc2U7IC8vIGJlY2F1c2Ugd2UncmUgaGlkaW5nIHRoZSBpbWFnZSwgc28gZG9uJ3Qgc2hvdyB0aGUgc3RpY2tlciBpY29uLlxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzR2lmKCkgJiYgIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhdXRvcGxheUdpZnNBbmRWaWRlb3NcIikgJiYgIXRoaXMuc3RhdGUuaG92ZXIpIHtcbiAgICAgICAgICAgIGdpZkxhYmVsID0gPHAgY2xhc3NOYW1lPVwibXhfTUltYWdlQm9keV9naWZMYWJlbFwiPkdJRjwvcD47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aHVtYm5haWwgPSAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01JbWFnZUJvZHlfdGh1bWJuYWlsX2NvbnRhaW5lclwiIHN0eWxlPXt7IG1heEhlaWdodDogbWF4SGVpZ2h0ICsgXCJweFwiIH19ID5cbiAgICAgICAgICAgICAgICB7IC8qIENhbGN1bGF0ZSBhc3BlY3QgcmF0aW8sIHVzaW5nICVwYWRkaW5nIHdpbGwgc2l6ZSBfY29udGFpbmVyIGNvcnJlY3RseSAqLyB9XG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nQm90dG9tOiAoMTAwICogaW5mb0hlaWdodCAvIGluZm9XaWR0aCkgKyAnJScgfX0gLz5cbiAgICAgICAgICAgICAgICB7IHNob3dQbGFjZWhvbGRlciAmJlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01JbWFnZUJvZHlfdGh1bWJuYWlsXCIgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbnN0cmFpbiB3aWR0aCBoZXJlIHNvIHRoYXQgc3Bpbm5lciBhcHBlYXJzIGNlbnRyYWwgdG8gdGhlIGxvYWRlZCB0aHVtYm5haWxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFdpZHRoOiBpbmZvV2lkdGggKyBcInB4XCIsXG4gICAgICAgICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NSW1hZ2VCb2R5X3RodW1ibmFpbF9zcGlubmVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBwbGFjZWhvbGRlciB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e2Rpc3BsYXk6ICFzaG93UGxhY2Vob2xkZXIgPyB1bmRlZmluZWQgOiAnbm9uZSd9fT5cbiAgICAgICAgICAgICAgICAgICAgeyBpbWcgfVxuICAgICAgICAgICAgICAgICAgICB7IGdpZkxhYmVsIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5ob3ZlciAmJiB0aGlzLmdldFRvb2x0aXAoKSB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gdGhpcy53cmFwSW1hZ2UoY29udGVudFVybCwgdGh1bWJuYWlsKTtcbiAgICB9XG5cbiAgICAvLyBPdmVyaWRkZW4gYnkgTVN0aWNrZXJCb2R5XG4gICAgd3JhcEltYWdlKGNvbnRlbnRVcmwsIGNoaWxkcmVuKSB7XG4gICAgICAgIHJldHVybiA8YSBocmVmPXtjb250ZW50VXJsfSBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9PlxuICAgICAgICAgICAge2NoaWxkcmVufVxuICAgICAgICA8L2E+O1xuICAgIH1cblxuICAgIC8vIE92ZXJpZGRlbiBieSBNU3RpY2tlckJvZHlcbiAgICBnZXRQbGFjZWhvbGRlcigpIHtcbiAgICAgICAgLy8gTUltYWdlQm9keSBkb2Vzbid0IHNob3cgYSBwbGFjZWhvbGRlciB3aGlsc3QgdGhlIGltYWdlIGxvYWRzLCAoYnV0IGl0IGNvdWxkIGRvKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBPdmVyaWRkZW4gYnkgTVN0aWNrZXJCb2R5XG4gICAgZ2V0VG9vbHRpcCgpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gT3ZlcmlkZGVuIGJ5IE1TdGlja2VyQm9keVxuICAgIGdldEZpbGVCb2R5KCkge1xuICAgICAgICByZXR1cm4gPE1GaWxlQm9keSB7Li4udGhpcy5wcm9wc30gZGVjcnlwdGVkQmxvYj17dGhpcy5zdGF0ZS5kZWNyeXB0ZWRCbG9ifSBzaG93R2VuZXJpY1BsYWNlaG9sZGVyPXtmYWxzZX0gLz47XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9NSW1hZ2VCb2R5XCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy93YXJuaW5nLnN2Z1wiKX0gd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkVycm9yIGRlY3J5cHRpbmcgaW1hZ2VcIikgfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb250ZW50VXJsID0gdGhpcy5fZ2V0Q29udGVudFVybCgpO1xuICAgICAgICBsZXQgdGh1bWJVcmw7XG4gICAgICAgIGlmICh0aGlzLl9pc0dpZigpICYmIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhdXRvcGxheUdpZnNBbmRWaWRlb3NcIikpIHtcbiAgICAgICAgICAgIHRodW1iVXJsID0gY29udGVudFVybDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRodW1iVXJsID0gdGhpcy5fZ2V0VGh1bWJVcmwoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRodW1ibmFpbCA9IHRoaXMuX21lc3NhZ2VDb250ZW50KGNvbnRlbnRVcmwsIHRodW1iVXJsLCBjb250ZW50KTtcbiAgICAgICAgY29uc3QgZmlsZUJvZHkgPSB0aGlzLmdldEZpbGVCb2R5KCk7XG5cbiAgICAgICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cIm14X01JbWFnZUJvZHlcIj5cbiAgICAgICAgICAgIHsgdGh1bWJuYWlsIH1cbiAgICAgICAgICAgIHsgZmlsZUJvZHkgfVxuICAgICAgICA8L3NwYW4+O1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEhpZGRlbkltYWdlUGxhY2Vob2xkZXIgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBob3ZlcjogUHJvcFR5cGVzLmJvb2wsXG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGNsYXNzTmFtZSA9ICdteF9IaWRkZW5JbWFnZVBsYWNlaG9sZGVyJztcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaG92ZXIpIGNsYXNzTmFtZSArPSAnIG14X0hpZGRlbkltYWdlUGxhY2Vob2xkZXJfaG92ZXInO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZX0+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0hpZGRlbkltYWdlUGxhY2Vob2xkZXJfYnV0dG9uJz5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9IaWRkZW5JbWFnZVBsYWNlaG9sZGVyX2V5ZScgLz5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+e190KFwiU2hvdyBpbWFnZVwiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=