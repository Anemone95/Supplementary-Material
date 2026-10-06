"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _MFileBody = _interopRequireDefault(require("./MFileBody"));

var _DecryptFile = require("../../../utils/DecryptFile");

var _languageHandler = require("../../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _InlineSpinner = _interopRequireDefault(require("../elements/InlineSpinner"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _Media = require("../../../customisations/Media");

var _dec, _class, _temp;

let MVideoBody = (_dec = (0, _replaceableComponent.replaceableComponent)("views.messages.MVideoBody"), _dec(_class = (_temp = class MVideoBody extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "videoRef", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "videoOnPlay", async () => {
      if (this.hasContentUrl() || this.state.fetchingData || this.state.error) {
        // We have the file, we are fetching the file, or there is an error.
        return;
      }

      this.setState({
        // To stop subsequent download attempts
        fetchingData: true
      });
      const content = this.props.mxEvent.getContent();

      if (!content.file) {
        this.setState({
          error: "No file given in content"
        });
        return;
      }

      const decryptedBlob = await (0, _DecryptFile.decryptFile)(content.file);
      const contentUrl = URL.createObjectURL(decryptedBlob);
      this.setState({
        decryptedUrl: contentUrl,
        decryptedBlob: decryptedBlob,
        fetchingData: false
      }, () => {
        if (!this.videoRef.current) return;
        this.videoRef.current.play();
      });
      this.props.onHeightChanged();
    });
    this.state = {
      fetchingData: false,
      decryptedUrl: null,
      decryptedThumbnailUrl: null,
      decryptedBlob: null,
      error: null
    };
  }

  thumbScale(fullWidth
  /*: number*/
  , fullHeight
  /*: number*/
  , thumbWidth
  /*: number*/
  , thumbHeight
  /*: number*/
  ) {
    if (!fullWidth || !fullHeight) {
      // Cannot calculate thumbnail height for image: missing w/h in metadata. We can't even
      // log this because it's spammy
      return undefined;
    }

    if (fullWidth < thumbWidth && fullHeight < thumbHeight) {
      // no scaling needs to be applied
      return 1;
    }

    const widthMulti = thumbWidth / fullWidth;
    const heightMulti = thumbHeight / fullHeight;

    if (widthMulti < heightMulti) {
      // width is the dominant dimension so scaling will be fixed on that
      return widthMulti;
    } else {
      // height is the dominant dimension so scaling will be fixed on that
      return heightMulti;
    }
  }

  getContentUrl()
  /*: string|null*/
  {
    const media = (0, _Media.mediaFromContent)(this.props.mxEvent.getContent());

    if (media.isEncrypted) {
      return this.state.decryptedUrl;
    } else {
      return media.srcHttp;
    }
  }

  hasContentUrl()
  /*: boolean*/
  {
    const url = this.getContentUrl();
    return url && !url.startsWith("data:");
  }

  getThumbUrl()
  /*: string|null*/
  {
    const content = this.props.mxEvent.getContent();
    const media = (0, _Media.mediaFromContent)(content);

    if (media.isEncrypted) {
      return this.state.decryptedThumbnailUrl;
    } else if (media.hasThumbnail) {
      return media.thumbnailHttp;
    } else {
      return null;
    }
  }

  async componentDidMount() {
    const autoplay = _SettingsStore.default.getValue("autoplayGifsAndVideos");

    const content = this.props.mxEvent.getContent();

    if (content.file !== undefined && this.state.decryptedUrl === null) {
      let thumbnailPromise = Promise.resolve(null);

      if (content.info && content.info.thumbnail_file) {
        thumbnailPromise = (0, _DecryptFile.decryptFile)(content.info.thumbnail_file).then(function (blob) {
          return URL.createObjectURL(blob);
        });
      }

      try {
        const thumbnailUrl = await thumbnailPromise;

        if (autoplay) {
          console.log("Preloading video");
          const decryptedBlob = await (0, _DecryptFile.decryptFile)(content.file);
          const contentUrl = URL.createObjectURL(decryptedBlob);
          this.setState({
            decryptedUrl: contentUrl,
            decryptedThumbnailUrl: thumbnailUrl,
            decryptedBlob: decryptedBlob
          });
          this.props.onHeightChanged();
        } else {
          console.log("NOT preloading video");
          this.setState({
            // For Chrome and Electron, we need to set some non-empty `src` to
            // enable the play button. Firefox does not seem to care either
            // way, so it's fine to do for all browsers.
            decryptedUrl: `data:${content?.info?.mimetype},`,
            decryptedThumbnailUrl: thumbnailUrl || `data:${content?.info?.mimetype},`,
            decryptedBlob: null
          });
        }
      } catch (err) {
        console.warn("Unable to decrypt attachment: ", err); // Set a placeholder image when we can't decrypt the image.

        this.setState({
          error: err
        });
      }
    }
  }

  componentWillUnmount() {
    if (this.state.decryptedUrl) {
      URL.revokeObjectURL(this.state.decryptedUrl);
    }

    if (this.state.decryptedThumbnailUrl) {
      URL.revokeObjectURL(this.state.decryptedThumbnailUrl);
    }
  }

  render() {
    const content = this.props.mxEvent.getContent();

    const autoplay = _SettingsStore.default.getValue("autoplayGifsAndVideos");

    if (this.state.error !== null) {
      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MVideoBody"
      }, /*#__PURE__*/_react.default.createElement("img", {
        src: require("../../../../res/img/warning.svg"),
        width: "16",
        height: "16"
      }), (0, _languageHandler._t)("Error decrypting video"));
    } // Important: If we aren't autoplaying and we haven't decrypred it yet, show a video with a poster.


    if (content.file !== undefined && this.state.decryptedUrl === null && autoplay) {
      // Need to decrypt the attachment
      // The attachment is decrypted in componentDidMount.
      // For now add an img tag with a spinner.
      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MVideoBody"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MImageBody_thumbnail mx_MImageBody_thumbnail_spinner"
      }, /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null)));
    }

    const contentUrl = this.getContentUrl();
    const thumbUrl = this.getThumbUrl();
    let height = null;
    let width = null;
    let poster = null;
    let preload = "metadata";

    if (content.info) {
      const scale = this.thumbScale(content.info.w, content.info.h, 480, 360);

      if (scale) {
        width = Math.floor(content.info.w * scale);
        height = Math.floor(content.info.h * scale);
      }

      if (thumbUrl) {
        poster = thumbUrl;
        preload = "none";
      }
    }

    return /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_MVideoBody"
    }, /*#__PURE__*/_react.default.createElement("video", {
      className: "mx_MVideoBody",
      ref: this.videoRef,
      src: contentUrl,
      title: content.body,
      controls: true,
      preload: preload,
      muted: autoplay,
      autoPlay: autoplay,
      height: height,
      width: width,
      poster: poster,
      onPlay: this.videoOnPlay
    }), /*#__PURE__*/_react.default.createElement(_MFileBody.default, (0, _extends2.default)({}, this.props, {
      decryptedBlob: this.state.decryptedBlob,
      showGenericPlaceholder: false
    })));
  }

}, _temp)) || _class);
exports.default = MVideoBody;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL01WaWRlb0JvZHkudHN4Il0sIm5hbWVzIjpbIk1WaWRlb0JvZHkiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwiaGFzQ29udGVudFVybCIsInN0YXRlIiwiZmV0Y2hpbmdEYXRhIiwiZXJyb3IiLCJzZXRTdGF0ZSIsImNvbnRlbnQiLCJteEV2ZW50IiwiZ2V0Q29udGVudCIsImZpbGUiLCJkZWNyeXB0ZWRCbG9iIiwiY29udGVudFVybCIsIlVSTCIsImNyZWF0ZU9iamVjdFVSTCIsImRlY3J5cHRlZFVybCIsInZpZGVvUmVmIiwiY3VycmVudCIsInBsYXkiLCJvbkhlaWdodENoYW5nZWQiLCJkZWNyeXB0ZWRUaHVtYm5haWxVcmwiLCJ0aHVtYlNjYWxlIiwiZnVsbFdpZHRoIiwiZnVsbEhlaWdodCIsInRodW1iV2lkdGgiLCJ0aHVtYkhlaWdodCIsInVuZGVmaW5lZCIsIndpZHRoTXVsdGkiLCJoZWlnaHRNdWx0aSIsImdldENvbnRlbnRVcmwiLCJtZWRpYSIsImlzRW5jcnlwdGVkIiwic3JjSHR0cCIsInVybCIsInN0YXJ0c1dpdGgiLCJnZXRUaHVtYlVybCIsImhhc1RodW1ibmFpbCIsInRodW1ibmFpbEh0dHAiLCJjb21wb25lbnREaWRNb3VudCIsImF1dG9wbGF5IiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwidGh1bWJuYWlsUHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiaW5mbyIsInRodW1ibmFpbF9maWxlIiwidGhlbiIsImJsb2IiLCJ0aHVtYm5haWxVcmwiLCJjb25zb2xlIiwibG9nIiwibWltZXR5cGUiLCJlcnIiLCJ3YXJuIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZXZva2VPYmplY3RVUkwiLCJyZW5kZXIiLCJyZXF1aXJlIiwidGh1bWJVcmwiLCJoZWlnaHQiLCJ3aWR0aCIsInBvc3Rl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ZDtBQVNJLE1BQUEsTUFBTSxFQUFFcUIsTUFUWjtBQVVJLE1BQUEsS0FBSyxFQUFFQyxLQVZYO0FBV0ksTUFBQSxNQUFNLEVBQUVDLE1BWFo7QUFZSSxNQUFBLE1BQU0sRUFBRSxLQUFLUTtBQVpqQixNQURKLGVBZ0JJLDZCQUFDLGtCQUFELDZCQUFlLEtBQUt0RSxLQUFwQjtBQUEyQixNQUFBLGFBQWEsRUFBRSxLQUFLRyxLQUFMLENBQVdRLGFBQXJEO0FBQW9FLE1BQUEsc0JBQXNCLEVBQUU7QUFBNUYsT0FoQkosQ0FESjtBQW9CSDs7QUFqTnVFLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBNRmlsZUJvZHkgZnJvbSAnLi9NRmlsZUJvZHknO1xuaW1wb3J0IHsgZGVjcnlwdEZpbGUgfSBmcm9tICcuLi8uLi8uLi91dGlscy9EZWNyeXB0RmlsZSc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IElubGluZVNwaW5uZXIgZnJvbSAnLi4vZWxlbWVudHMvSW5saW5lU3Bpbm5lcic7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcbmltcG9ydCB7bWVkaWFGcm9tQ29udGVudH0gZnJvbSBcIi4uLy4uLy4uL2N1c3RvbWlzYXRpb25zL01lZGlhXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIC8qIHRoZSBNYXRyaXhFdmVudCB0byBzaG93ICovXG4gICAgbXhFdmVudDogYW55O1xuICAgIC8qIGNhbGxlZCB3aGVuIHRoZSB2aWRlbyBoYXMgbG9hZGVkICovXG4gICAgb25IZWlnaHRDaGFuZ2VkOiAoKSA9PiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBkZWNyeXB0ZWRVcmw6IHN0cmluZ3xudWxsLFxuICAgIGRlY3J5cHRlZFRodW1ibmFpbFVybDogc3RyaW5nfG51bGwsXG4gICAgZGVjcnlwdGVkQmxvYjogQmxvYnxudWxsLFxuICAgIGVycm9yOiBhbnl8bnVsbCxcbiAgICBmZXRjaGluZ0RhdGE6IGJvb2xlYW4sXG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLm1lc3NhZ2VzLk1WaWRlb0JvZHlcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1WaWRlb0JvZHkgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSB2aWRlb1JlZiA9IFJlYWN0LmNyZWF0ZVJlZjxIVE1MVmlkZW9FbGVtZW50PigpO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZmV0Y2hpbmdEYXRhOiBmYWxzZSxcbiAgICAgICAgICAgIGRlY3J5cHRlZFVybDogbnVsbCxcbiAgICAgICAgICAgIGRlY3J5cHRlZFRodW1ibmFpbFVybDogbnVsbCxcbiAgICAgICAgICAgIGRlY3J5cHRlZEJsb2I6IG51bGwsXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRodW1iU2NhbGUoZnVsbFdpZHRoOiBudW1iZXIsIGZ1bGxIZWlnaHQ6IG51bWJlciwgdGh1bWJXaWR0aDogbnVtYmVyLCB0aHVtYkhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIGlmICghZnVsbFdpZHRoIHx8ICFmdWxsSGVpZ2h0KSB7XG4gICAgICAgICAgICAvLyBDYW5ub3QgY2FsY3VsYXRlIHRodW1ibmFpbCBoZWlnaHQgZm9yIGltYWdlOiBtaXNzaW5nIHcvaCBpbiBtZXRhZGF0YS4gV2UgY2FuJ3QgZXZlblxuICAgICAgICAgICAgLy8gbG9nIHRoaXMgYmVjYXVzZSBpdCdzIHNwYW1teVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZnVsbFdpZHRoIDwgdGh1bWJXaWR0aCAmJiBmdWxsSGVpZ2h0IDwgdGh1bWJIZWlnaHQpIHtcbiAgICAgICAgICAgIC8vIG5vIHNjYWxpbmcgbmVlZHMgdG8gYmUgYXBwbGllZFxuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgd2lkdGhNdWx0aSA9IHRodW1iV2lkdGggLyBmdWxsV2lkdGg7XG4gICAgICAgIGNvbnN0IGhlaWdodE11bHRpID0gdGh1bWJIZWlnaHQgLyBmdWxsSGVpZ2h0O1xuICAgICAgICBpZiAod2lkdGhNdWx0aSA8IGhlaWdodE11bHRpKSB7XG4gICAgICAgICAgICAvLyB3aWR0aCBpcyB0aGUgZG9taW5hbnQgZGltZW5zaW9uIHNvIHNjYWxpbmcgd2lsbCBiZSBmaXhlZCBvbiB0aGF0XG4gICAgICAgICAgICByZXR1cm4gd2lkdGhNdWx0aTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGhlaWdodCBpcyB0aGUgZG9taW5hbnQgZGltZW5zaW9uIHNvIHNjYWxpbmcgd2lsbCBiZSBmaXhlZCBvbiB0aGF0XG4gICAgICAgICAgICByZXR1cm4gaGVpZ2h0TXVsdGk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENvbnRlbnRVcmwoKTogc3RyaW5nfG51bGwge1xuICAgICAgICBjb25zdCBtZWRpYSA9IG1lZGlhRnJvbUNvbnRlbnQodGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKSk7XG4gICAgICAgIGlmIChtZWRpYS5pc0VuY3J5cHRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZGVjcnlwdGVkVXJsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG1lZGlhLnNyY0h0dHA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGhhc0NvbnRlbnRVcmwoKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHVybCA9IHRoaXMuZ2V0Q29udGVudFVybCgpO1xuICAgICAgICByZXR1cm4gdXJsICYmICF1cmwuc3RhcnRzV2l0aChcImRhdGE6XCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0VGh1bWJVcmwoKTogc3RyaW5nfG51bGwge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgY29uc3QgbWVkaWEgPSBtZWRpYUZyb21Db250ZW50KGNvbnRlbnQpO1xuICAgICAgICBpZiAobWVkaWEuaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmRlY3J5cHRlZFRodW1ibmFpbFVybDtcbiAgICAgICAgfSBlbHNlIGlmIChtZWRpYS5oYXNUaHVtYm5haWwpIHtcbiAgICAgICAgICAgIHJldHVybiBtZWRpYS50aHVtYm5haWxIdHRwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgY29uc3QgYXV0b3BsYXkgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYXV0b3BsYXlHaWZzQW5kVmlkZW9zXCIpIGFzIGJvb2xlYW47XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICBpZiAoY29udGVudC5maWxlICE9PSB1bmRlZmluZWQgJiYgdGhpcy5zdGF0ZS5kZWNyeXB0ZWRVcmwgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGxldCB0aHVtYm5haWxQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgaWYgKGNvbnRlbnQuaW5mbyAmJiBjb250ZW50LmluZm8udGh1bWJuYWlsX2ZpbGUpIHtcbiAgICAgICAgICAgICAgICB0aHVtYm5haWxQcm9taXNlID0gZGVjcnlwdEZpbGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQuaW5mby50aHVtYm5haWxfZmlsZSxcbiAgICAgICAgICAgICAgICApLnRoZW4oZnVuY3Rpb24oYmxvYikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGh1bWJuYWlsVXJsID0gYXdhaXQgdGh1bWJuYWlsUHJvbWlzZTtcbiAgICAgICAgICAgICAgICBpZiAoYXV0b3BsYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQcmVsb2FkaW5nIHZpZGVvXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZWNyeXB0ZWRCbG9iID0gYXdhaXQgZGVjcnlwdEZpbGUoY29udGVudC5maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVudFVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZGVjcnlwdGVkQmxvYik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVjcnlwdGVkVXJsOiBjb250ZW50VXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjcnlwdGVkVGh1bWJuYWlsVXJsOiB0aHVtYm5haWxVcmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNyeXB0ZWRCbG9iOiBkZWNyeXB0ZWRCbG9iLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIk5PVCBwcmVsb2FkaW5nIHZpZGVvXCIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvciBDaHJvbWUgYW5kIEVsZWN0cm9uLCB3ZSBuZWVkIHRvIHNldCBzb21lIG5vbi1lbXB0eSBgc3JjYCB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW5hYmxlIHRoZSBwbGF5IGJ1dHRvbi4gRmlyZWZveCBkb2VzIG5vdCBzZWVtIHRvIGNhcmUgZWl0aGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3YXksIHNvIGl0J3MgZmluZSB0byBkbyBmb3IgYWxsIGJyb3dzZXJzLlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjcnlwdGVkVXJsOiBgZGF0YToke2NvbnRlbnQ/LmluZm8/Lm1pbWV0eXBlfSxgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjcnlwdGVkVGh1bWJuYWlsVXJsOiB0aHVtYm5haWxVcmwgfHwgYGRhdGE6JHtjb250ZW50Py5pbmZvPy5taW1ldHlwZX0sYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY3J5cHRlZEJsb2I6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlVuYWJsZSB0byBkZWNyeXB0IGF0dGFjaG1lbnQ6IFwiLCBlcnIpO1xuICAgICAgICAgICAgICAgIC8vIFNldCBhIHBsYWNlaG9sZGVyIGltYWdlIHdoZW4gd2UgY2FuJ3QgZGVjcnlwdCB0aGUgaW1hZ2UuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGVjcnlwdGVkVXJsKSB7XG4gICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHRoaXMuc3RhdGUuZGVjcnlwdGVkVXJsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5kZWNyeXB0ZWRUaHVtYm5haWxVcmwpIHtcbiAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodGhpcy5zdGF0ZS5kZWNyeXB0ZWRUaHVtYm5haWxVcmwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2aWRlb09uUGxheSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaGFzQ29udGVudFVybCgpIHx8IHRoaXMuc3RhdGUuZmV0Y2hpbmdEYXRhIHx8IHRoaXMuc3RhdGUuZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFdlIGhhdmUgdGhlIGZpbGUsIHdlIGFyZSBmZXRjaGluZyB0aGUgZmlsZSwgb3IgdGhlcmUgaXMgYW4gZXJyb3IuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAvLyBUbyBzdG9wIHN1YnNlcXVlbnQgZG93bmxvYWQgYXR0ZW1wdHNcbiAgICAgICAgICAgIGZldGNoaW5nRGF0YTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICBpZiAoIWNvbnRlbnQuZmlsZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgZXJyb3I6IFwiTm8gZmlsZSBnaXZlbiBpbiBjb250ZW50XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZWNyeXB0ZWRCbG9iID0gYXdhaXQgZGVjcnlwdEZpbGUoY29udGVudC5maWxlKTtcbiAgICAgICAgY29uc3QgY29udGVudFVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZGVjcnlwdGVkQmxvYik7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZGVjcnlwdGVkVXJsOiBjb250ZW50VXJsLFxuICAgICAgICAgICAgZGVjcnlwdGVkQmxvYjogZGVjcnlwdGVkQmxvYixcbiAgICAgICAgICAgIGZldGNoaW5nRGF0YTogZmFsc2UsXG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy52aWRlb1JlZi5jdXJyZW50KSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLnZpZGVvUmVmLmN1cnJlbnQucGxheSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWQoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICBjb25zdCBhdXRvcGxheSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJhdXRvcGxheUdpZnNBbmRWaWRlb3NcIik7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfTVZpZGVvQm9keVwiPlxuICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvd2FybmluZy5zdmdcIil9IHdpZHRoPVwiMTZcIiBoZWlnaHQ9XCIxNlwiIC8+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJFcnJvciBkZWNyeXB0aW5nIHZpZGVvXCIpIH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSW1wb3J0YW50OiBJZiB3ZSBhcmVuJ3QgYXV0b3BsYXlpbmcgYW5kIHdlIGhhdmVuJ3QgZGVjcnlwcmVkIGl0IHlldCwgc2hvdyBhIHZpZGVvIHdpdGggYSBwb3N0ZXIuXG4gICAgICAgIGlmIChjb250ZW50LmZpbGUgIT09IHVuZGVmaW5lZCAmJiB0aGlzLnN0YXRlLmRlY3J5cHRlZFVybCA9PT0gbnVsbCAmJiBhdXRvcGxheSkge1xuICAgICAgICAgICAgLy8gTmVlZCB0byBkZWNyeXB0IHRoZSBhdHRhY2htZW50XG4gICAgICAgICAgICAvLyBUaGUgYXR0YWNobWVudCBpcyBkZWNyeXB0ZWQgaW4gY29tcG9uZW50RGlkTW91bnQuXG4gICAgICAgICAgICAvLyBGb3Igbm93IGFkZCBhbiBpbWcgdGFnIHdpdGggYSBzcGlubmVyLlxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9NVmlkZW9Cb2R5XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTUltYWdlQm9keV90aHVtYm5haWwgbXhfTUltYWdlQm9keV90aHVtYm5haWxfc3Bpbm5lclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPElubGluZVNwaW5uZXIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbnRlbnRVcmwgPSB0aGlzLmdldENvbnRlbnRVcmwoKTtcbiAgICAgICAgY29uc3QgdGh1bWJVcmwgPSB0aGlzLmdldFRodW1iVXJsKCk7XG4gICAgICAgIGxldCBoZWlnaHQgPSBudWxsO1xuICAgICAgICBsZXQgd2lkdGggPSBudWxsO1xuICAgICAgICBsZXQgcG9zdGVyID0gbnVsbDtcbiAgICAgICAgbGV0IHByZWxvYWQgPSBcIm1ldGFkYXRhXCI7XG4gICAgICAgIGlmIChjb250ZW50LmluZm8pIHtcbiAgICAgICAgICAgIGNvbnN0IHNjYWxlID0gdGhpcy50aHVtYlNjYWxlKGNvbnRlbnQuaW5mby53LCBjb250ZW50LmluZm8uaCwgNDgwLCAzNjApO1xuICAgICAgICAgICAgaWYgKHNjYWxlKSB7XG4gICAgICAgICAgICAgICAgd2lkdGggPSBNYXRoLmZsb29yKGNvbnRlbnQuaW5mby53ICogc2NhbGUpO1xuICAgICAgICAgICAgICAgIGhlaWdodCA9IE1hdGguZmxvb3IoY29udGVudC5pbmZvLmggKiBzY2FsZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aHVtYlVybCkge1xuICAgICAgICAgICAgICAgIHBvc3RlciA9IHRodW1iVXJsO1xuICAgICAgICAgICAgICAgIHByZWxvYWQgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfTVZpZGVvQm9keVwiPlxuICAgICAgICAgICAgICAgIDx2aWRlb1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NVmlkZW9Cb2R5XCJcbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLnZpZGVvUmVmfVxuICAgICAgICAgICAgICAgICAgICBzcmM9e2NvbnRlbnRVcmx9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtjb250ZW50LmJvZHl9XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xzXG4gICAgICAgICAgICAgICAgICAgIHByZWxvYWQ9e3ByZWxvYWR9XG4gICAgICAgICAgICAgICAgICAgIG11dGVkPXthdXRvcGxheX1cbiAgICAgICAgICAgICAgICAgICAgYXV0b1BsYXk9e2F1dG9wbGF5fVxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9e2hlaWdodH1cbiAgICAgICAgICAgICAgICAgICAgd2lkdGg9e3dpZHRofVxuICAgICAgICAgICAgICAgICAgICBwb3N0ZXI9e3Bvc3Rlcn1cbiAgICAgICAgICAgICAgICAgICAgb25QbGF5PXt0aGlzLnZpZGVvT25QbGF5fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8L3ZpZGVvPlxuICAgICAgICAgICAgICAgIDxNRmlsZUJvZHkgey4uLnRoaXMucHJvcHN9IGRlY3J5cHRlZEJsb2I9e3RoaXMuc3RhdGUuZGVjcnlwdGVkQmxvYn0gc2hvd0dlbmVyaWNQbGFjZWhvbGRlcj17ZmFsc2V9IC8+XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19