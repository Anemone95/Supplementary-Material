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

var _propTypes = _interopRequireDefault(require("prop-types"));

var _filesize = _interopRequireDefault(require("filesize"));

var _languageHandler = require("../../../languageHandler");

var _DecryptFile = require("../../../utils/DecryptFile");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _Media = require("../../../customisations/Media");

var _ErrorDialog = _interopRequireDefault(require("../dialogs/ErrorDialog"));

var _dec, _class, _class2, _temp;

let downloadIconUrl; // cached copy of the download.svg asset for the sandboxed iframe later on

async function cacheDownloadIcon() {
  if (downloadIconUrl) return; // cached already

  const svg = await fetch(require("../../../../res/img/download.svg")).then(r => r.text());
  downloadIconUrl = "data:image/svg+xml;base64," + window.btoa(svg);
} // Cache the asset immediately


cacheDownloadIcon(); // User supplied content can contain scripts, we have to be careful that
// we don't accidentally run those script within the same origin as the
// client. Otherwise those scripts written by remote users can read
// the access token and end-to-end keys that are in local storage.
//
// For attachments downloaded directly from the homeserver we can use
// Content-Security-Policy headers to disable script execution.
//
// But attachments with end-to-end encryption are more difficult to handle.
// We need to decrypt the attachment on the client and then display it.
// To display the attachment we need to turn the decrypted bytes into a URL.
//
// There are two ways to turn bytes into URLs, data URL and blob URLs.
// Data URLs aren't suitable for downloading a file because Chrome has a
// 2MB limit on the size of URLs that can be viewed in the browser or
// downloaded. This limit does not seem to apply when the url is used as
// the source attribute of an image tag.
//
// Blob URLs are generated using window.URL.createObjectURL and unfortunately
// for our purposes they inherit the origin of the page that created them.
// This means that any scripts that run when the URL is viewed will be able
// to access local storage.
//
// The easiest solution is to host the code that generates the blob URL on
// a different domain to the client.
// Another possibility is to generate the blob URL within a sandboxed iframe.
// The downside of using a second domain is that it complicates hosting,
// the downside of using a sandboxed iframe is that the browers are overly
// restrictive in what you are allowed to do with the generated URL.

/**
 * Get the current CSS style for a DOMElement.
 * @param {HTMLElement} element The element to get the current style of.
 * @return {string} The CSS style encoded as a string.
 */

function computedStyle(element) {
  if (!element) {
    return "";
  }

  const style = window.getComputedStyle(element, null);
  let cssText = style.cssText; // noinspection EqualityComparisonWithCoercionJS

  if (cssText == "") {
    // Firefox doesn't implement ".cssText" for computed styles.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=137687
    for (let i = 0; i < style.length; i++) {
      cssText += style[i] + ":";
      cssText += style.getPropertyValue(style[i]) + ";";
    }
  }

  return cssText;
}

let MFileBody = (_dec = (0, _replaceableComponent.replaceableComponent)("views.messages.MFileBody"), _dec(_class = (_temp = _class2 = class MFileBody extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      decryptedBlob: this.props.decryptedBlob ? this.props.decryptedBlob : null
    };
    this._iframe = /*#__PURE__*/(0, _react.createRef)();
    this._dummyLink = /*#__PURE__*/(0, _react.createRef)();
  }
  /**
   * Extracts a human readable label for the file attachment to use as
   * link text.
   *
   * @param {Object} content The "content" key of the matrix event.
   * @param {boolean} withSize Whether to include size information. Default true.
   * @return {string} the human readable link text for the attachment.
   */


  presentableTextForFile(content, withSize = true) {
    let linkText = (0, _languageHandler._t)("Attachment");

    if (content.body && content.body.length > 0) {
      // The content body should be the name of the file including a
      // file extension.
      linkText = content.body;
    }

    if (content.info && content.info.size && withSize) {
      // If we know the size of the file then add it as human readable
      // string to the end of the link text so that the user knows how
      // big a file they are downloading.
      // The content.info also contains a MIME-type but we don't display
      // it since it is "ugly", users generally aren't aware what it
      // means and the type of the attachment can usually be inferrered
      // from the file extension.
      linkText += ' (' + (0, _filesize.default)(content.info.size) + ')';
    }

    return linkText;
  }

  _getContentUrl() {
    const media = (0, _Media.mediaFromContent)(this.props.mxEvent.getContent());
    return media.srcHttp;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.onHeightChanged && !prevState.decryptedBlob && this.state.decryptedBlob) {
      this.props.onHeightChanged();
    }
  }

  render() {
    const content = this.props.mxEvent.getContent();
    const text = this.presentableTextForFile(content);
    const isEncrypted = content.file !== undefined;
    const fileName = content.body && content.body.length > 0 ? content.body : (0, _languageHandler._t)("Attachment");

    const contentUrl = this._getContentUrl();

    const fileSize = content.info ? content.info.size : null;
    const fileType = content.info ? content.info.mimetype : "application/octet-stream";
    let placeholder = null;

    if (this.props.showGenericPlaceholder) {
      placeholder = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MFileBody_info"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MFileBody_info_icon"
      }), /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MFileBody_info_filename"
      }, this.presentableTextForFile(content, false)));
    }

    if (isEncrypted) {
      if (this.state.decryptedBlob === null) {
        // Need to decrypt the attachment
        // Wait for the user to click on the link before downloading
        // and decrypting the attachment.
        let decrypting = false;

        const decrypt = e => {
          if (decrypting) {
            return false;
          }

          decrypting = true;
          (0, _DecryptFile.decryptFile)(content.file).then(blob => {
            this.setState({
              decryptedBlob: blob
            });
          }).catch(err => {
            console.warn("Unable to decrypt attachment: ", err);

            _Modal.default.createTrackedDialog('Error decrypting attachment', '', _ErrorDialog.default, {
              title: (0, _languageHandler._t)("Error"),
              description: (0, _languageHandler._t)("Error decrypting attachment")
            });
          }).finally(() => {
            decrypting = false;
          });
        }; // This button should actually Download because usercontent/ will try to click itself
        // but it is not guaranteed between various browsers' settings.


        return /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_MFileBody"
        }, placeholder, /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_MFileBody_download"
        }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          onClick: decrypt
        }, (0, _languageHandler._t)("Decrypt %(text)s", {
          text: text
        }))));
      } // When the iframe loads we tell it to render a download link


      const onIframeLoad = ev => {
        ev.target.contentWindow.postMessage({
          imgSrc: downloadIconUrl,
          imgStyle: null,
          // it handles this internally for us. Useful if a downstream changes the icon.
          style: computedStyle(this._dummyLink.current),
          blob: this.state.decryptedBlob,
          // Set a download attribute for encrypted files so that the file
          // will have the correct name when the user tries to download it.
          // We can't provide a Content-Disposition header like we would for HTTP.
          download: fileName,
          textContent: (0, _languageHandler._t)("Download %(text)s", {
            text: text
          }),
          // only auto-download if a user triggered this iframe explicitly
          auto: !this.props.decryptedBlob
        }, "*");
      };

      const url = "usercontent/"; // XXX: this path should probably be passed from the skin
      // If the attachment is encrypted then put the link inside an iframe.

      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MFileBody"
      }, placeholder, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MFileBody_download"
      }, /*#__PURE__*/_react.default.createElement("div", {
        style: {
          display: "none"
        }
      }, /*#__PURE__*/_react.default.createElement("a", {
        ref: this._dummyLink
      })), /*#__PURE__*/_react.default.createElement("iframe", {
        src: url,
        onLoad: onIframeLoad,
        ref: this._iframe,
        sandbox: "allow-scripts allow-downloads allow-downloads-without-user-activation"
      })));
    } else if (contentUrl) {
      const downloadProps = {
        target: "_blank",
        rel: "noreferrer noopener",
        // We set the href regardless of whether or not we intercept the download
        // because we don't really want to convert the file to a blob eagerly, and
        // still want "open in new tab" and "save link as" to work.
        href: contentUrl
      }; // Blobs can only have up to 500mb, so if the file reports as being too large then
      // we won't try and convert it. Likewise, if the file size is unknown then we'll assume
      // it is too big. There is the risk of the reported file size and the actual file size
      // being different, however the user shouldn't normally run into this problem.

      const fileTooBig = typeof fileSize === 'number' ? fileSize > 524288000 : true;

      if (["application/pdf"].includes(fileType) && !fileTooBig) {
        // We want to force a download on this type, so use an onClick handler.
        downloadProps["onClick"] = e => {
          console.log(`Downloading ${fileType} as blob (unencrypted)`); // Avoid letting the <a> do its thing

          e.preventDefault();
          e.stopPropagation(); // Start a fetch for the download
          // Based upon https://stackoverflow.com/a/49500465

          fetch(contentUrl).then(response => response.blob()).then(blob => {
            const blobUrl = URL.createObjectURL(blob); // We have to create an anchor to download the file

            const tempAnchor = document.createElement('a');
            tempAnchor.download = fileName;
            tempAnchor.href = blobUrl;
            document.body.appendChild(tempAnchor); // for firefox: https://stackoverflow.com/a/32226068

            tempAnchor.click();
            tempAnchor.remove();
          });
        };
      } else {
        // Else we are hoping the browser will do the right thing
        downloadProps["download"] = fileName;
      } // If the attachment is not encrypted then we check whether we
      // are being displayed in the room timeline or in a list of
      // files in the right hand side of the screen.


      if (this.props.tileShape === "file_grid") {
        return /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_MFileBody"
        }, placeholder, /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_MFileBody_download"
        }, /*#__PURE__*/_react.default.createElement("a", (0, _extends2.default)({
          className: "mx_MFileBody_downloadLink"
        }, downloadProps), fileName), /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_MImageBody_size"
        }, content.info && content.info.size ? (0, _filesize.default)(content.info.size) : "")));
      } else {
        return /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_MFileBody"
        }, placeholder, /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_MFileBody_download"
        }, /*#__PURE__*/_react.default.createElement("a", downloadProps, /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_MFileBody_download_icon"
        }), (0, _languageHandler._t)("Download %(text)s", {
          text: text
        }))));
      }
    } else {
      const extra = text ? ': ' + text : '';
      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MFileBody"
      }, placeholder, (0, _languageHandler._t)("Invalid file%(extra)s", {
        extra: extra
      }));
    }
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  /* the MatrixEvent to show */
  mxEvent: _propTypes.default.object.isRequired,

  /* already decrypted blob */
  decryptedBlob: _propTypes.default.object,

  /* called when the download link iframe is shown */
  onHeightChanged: _propTypes.default.func,

  /* the shape of the tile, used */
  tileShape: _propTypes.default.string,

  /* whether or not to show the default placeholder for the file. Defaults to true. */
  showGenericPlaceholder: _propTypes.default.bool
}), (0, _defineProperty2.default)(_class2, "defaultProps", {
  showGenericPlaceholder: true
}), _temp)) || _class);
exports.default = MFileBody;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL01GaWxlQm9keS5qcyJdLCJuYW1lcyI6WyJkb3dubG9hZEljb25VcmwiLCJjYWNoZURvd25sb2FkSWNvbiIsInN2ZyIsImZldGNoIiwicmVxdWlyZSIsInRoZW4iLCJyIiwidGV4dCIsIndpbmRvdyIsImJ0b2EiLCJjb21wdXRlZFN0eWxlIiwiZWxlbWVudCIsInN0eWxlIiwiZ2V0Q29tcHV0ZWRTdHlsZSIsImNzc1RleHQiLCJpIiwibGVuZ3RoIiwiZ2V0UHJvcGVydHlWYWx1ZSIsIk1GaWxlQm9keSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInN0YXRlIiwiZGVjcnlwdGVkQmxvYiIsIl9pZnJhbWUiLCJfZHVtbXlMaW5rIiwicHJlc2VudGFibGVUZXh0Rm9yRmlsZSIsImNvbnRlbnQiLCJ3aXRoU2l6ZSIsImxpbmtUZXh0IiwiYm9keSIsImluZm8iLCJzaXplIiwiX2dldENvbnRlbnRVcmwiLCJtZWRpYSIsIm14RXZlbnQiLCJnZXRDb250ZW50Iiwic3JjSHR0cCIsImNvbXBvbmVudERpZFVwZGF0ZSIsInByZXZQcm9wcyIsInByZXZTdGF0ZSIsIm9uSGVpZ2h0Q2hhbmdlZCIsInJlbmRlciIsImlzRW5jcnlwdGVkIiwiZmlsZSIsInVuZGVmaW5lZCIsImZpbGVOYW1lIiwiY29udGVudFVybCIsImZpbGVTaXplIiwiZmlsZVR5cGUiLCJtaW1ldHlwZSIsInBsYWNlaG9sZGVyIiwic2hvd0dlbmVyaWNQbGFjZWhvbGRlciIsImRlY3J5cHRpbmciLCJkZWNyeXB0IiwiZSIsImJsb2IiLCJzZXRTdGF0ZSIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsIndhcm4iLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJFcnJvckRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJmaW5hbGx5Iiwib25JZnJhbWVMb2FkIiwiZXYiLCJ0YXJnZXQiLCJjb250ZW50V2luZG93IiwicG9zdE1lc3NhZ2UiLCJpbWdTcmMiLCJpbWdTdHlsZSIsImN1cnJlbnQiLCJkb3dubG9hZCIsInRleHRDb250ZW50IiwiYXV0byIsInVybCIsImRpc3BsYXkiLCJkb3dubG9hZFByb3BzIiwicmVsIiwiaHJlZiIsImZpbGVUb29CaWciLCJpbmNsdWRlcyIsImxvZyIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwicmVzcG9uc2UiLCJibG9iVXJsIiwiVVJMIiwiY3JlYXRlT2JqZWN0VVJMIiwidGVtcEFuY2hvciIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImFwcGVuZENoaWxkIiwiY2xpY2siLCJyZW1vdmUiLCJ0aWxlU2hhcGUiLCJleHRyYSIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJmdW5jIiwic3RyaW5nIiwiYm9vbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUEsSUFBSUEsZUFBSixDLENBQXFCOztBQUVyQixlQUFlQyxpQkFBZixHQUFtQztBQUMvQixNQUFJRCxlQUFKLEVBQXFCLE9BRFUsQ0FDRjs7QUFDN0IsUUFBTUUsR0FBRyxHQUFHLE1BQU1DLEtBQUssQ0FBQ0MsT0FBTyxDQUFDLGtDQUFELENBQVIsQ0FBTCxDQUFtREMsSUFBbkQsQ0FBd0RDLENBQUMsSUFBSUEsQ0FBQyxDQUFDQyxJQUFGLEVBQTdELENBQWxCO0FBQ0FQLEVBQUFBLGVBQWUsR0FBRywrQkFBK0JRLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZUCxHQUFaLENBQWpEO0FBQ0gsQyxDQUVEOzs7QUFDQUQsaUJBQWlCLEcsQ0FFakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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LElBTlo7O0FBT2Y7QUFDQUwsRUFBQUEsU0FBUyxFQUFFRSxtQkFBVUksTUFSTjs7QUFTZjtBQUNBckQsRUFBQUEsc0JBQXNCLEVBQUVpRCxtQkFBVUs7QUFWbkIsQywwREFhRztBQUNsQnRELEVBQUFBLHNCQUFzQixFQUFFO0FBRE4sQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiwgMjAxOCwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwge2NyZWF0ZVJlZn0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBmaWxlc2l6ZSBmcm9tICdmaWxlc2l6ZSc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQge2RlY3J5cHRGaWxlfSBmcm9tICcuLi8uLi8uLi91dGlscy9EZWNyeXB0RmlsZSc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuaW1wb3J0IHttZWRpYUZyb21Db250ZW50fSBmcm9tIFwiLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvTWVkaWFcIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9FcnJvckRpYWxvZ1wiO1xuXG5sZXQgZG93bmxvYWRJY29uVXJsOyAvLyBjYWNoZWQgY29weSBvZiB0aGUgZG93bmxvYWQuc3ZnIGFzc2V0IGZvciB0aGUgc2FuZGJveGVkIGlmcmFtZSBsYXRlciBvblxuXG5hc3luYyBmdW5jdGlvbiBjYWNoZURvd25sb2FkSWNvbigpIHtcbiAgICBpZiAoZG93bmxvYWRJY29uVXJsKSByZXR1cm47IC8vIGNhY2hlZCBhbHJlYWR5XG4gICAgY29uc3Qgc3ZnID0gYXdhaXQgZmV0Y2gocmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvZG93bmxvYWQuc3ZnXCIpKS50aGVuKHIgPT4gci50ZXh0KCkpO1xuICAgIGRvd25sb2FkSWNvblVybCA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxcIiArIHdpbmRvdy5idG9hKHN2Zyk7XG59XG5cbi8vIENhY2hlIHRoZSBhc3NldCBpbW1lZGlhdGVseVxuY2FjaGVEb3dubG9hZEljb24oKTtcblxuLy8gVXNlciBzdXBwbGllZCBjb250ZW50IGNhbiBjb250YWluIHNjcmlwdHMsIHdlIGhhdmUgdG8gYmUgY2FyZWZ1bCB0aGF0XG4vLyB3ZSBkb24ndCBhY2NpZGVudGFsbHkgcnVuIHRob3NlIHNjcmlwdCB3aXRoaW4gdGhlIHNhbWUgb3JpZ2luIGFzIHRoZVxuLy8gY2xpZW50LiBPdGhlcndpc2UgdGhvc2Ugc2NyaXB0cyB3cml0dGVuIGJ5IHJlbW90ZSB1c2VycyBjYW4gcmVhZFxuLy8gdGhlIGFjY2VzcyB0b2tlbiBhbmQgZW5kLXRvLWVuZCBrZXlzIHRoYXQgYXJlIGluIGxvY2FsIHN0b3JhZ2UuXG4vL1xuLy8gRm9yIGF0dGFjaG1lbnRzIGRvd25sb2FkZWQgZGlyZWN0bHkgZnJvbSB0aGUgaG9tZXNlcnZlciB3ZSBjYW4gdXNlXG4vLyBDb250ZW50LVNlY3VyaXR5LVBvbGljeSBoZWFkZXJzIHRvIGRpc2FibGUgc2NyaXB0IGV4ZWN1dGlvbi5cbi8vXG4vLyBCdXQgYXR0YWNobWVudHMgd2l0aCBlbmQtdG8tZW5kIGVuY3J5cHRpb24gYXJlIG1vcmUgZGlmZmljdWx0IHRvIGhhbmRsZS5cbi8vIFdlIG5lZWQgdG8gZGVjcnlwdCB0aGUgYXR0YWNobWVudCBvbiB0aGUgY2xpZW50IGFuZCB0aGVuIGRpc3BsYXkgaXQuXG4vLyBUbyBkaXNwbGF5IHRoZSBhdHRhY2htZW50IHdlIG5lZWQgdG8gdHVybiB0aGUgZGVjcnlwdGVkIGJ5dGVzIGludG8gYSBVUkwuXG4vL1xuLy8gVGhlcmUgYXJlIHR3byB3YXlzIHRvIHR1cm4gYnl0ZXMgaW50byBVUkxzLCBkYXRhIFVSTCBhbmQgYmxvYiBVUkxzLlxuLy8gRGF0YSBVUkxzIGFyZW4ndCBzdWl0YWJsZSBmb3IgZG93bmxvYWRpbmcgYSBmaWxlIGJlY2F1c2UgQ2hyb21lIGhhcyBhXG4vLyAyTUIgbGltaXQgb24gdGhlIHNpemUgb2YgVVJMcyB0aGF0IGNhbiBiZSB2aWV3ZWQgaW4gdGhlIGJyb3dzZXIgb3Jcbi8vIGRvd25sb2FkZWQuIFRoaXMgbGltaXQgZG9lcyBub3Qgc2VlbSB0byBhcHBseSB3aGVuIHRoZSB1cmwgaXMgdXNlZCBhc1xuLy8gdGhlIHNvdXJjZSBhdHRyaWJ1dGUgb2YgYW4gaW1hZ2UgdGFnLlxuLy9cbi8vIEJsb2IgVVJMcyBhcmUgZ2VuZXJhdGVkIHVzaW5nIHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMIGFuZCB1bmZvcnR1bmF0ZWx5XG4vLyBmb3Igb3VyIHB1cnBvc2VzIHRoZXkgaW5oZXJpdCB0aGUgb3JpZ2luIG9mIHRoZSBwYWdlIHRoYXQgY3JlYXRlZCB0aGVtLlxuLy8gVGhpcyBtZWFucyB0aGF0IGFueSBzY3JpcHRzIHRoYXQgcnVuIHdoZW4gdGhlIFVSTCBpcyB2aWV3ZWQgd2lsbCBiZSBhYmxlXG4vLyB0byBhY2Nlc3MgbG9jYWwgc3RvcmFnZS5cbi8vXG4vLyBUaGUgZWFzaWVzdCBzb2x1dGlvbiBpcyB0byBob3N0IHRoZSBjb2RlIHRoYXQgZ2VuZXJhdGVzIHRoZSBibG9iIFVSTCBvblxuLy8gYSBkaWZmZXJlbnQgZG9tYWluIHRvIHRoZSBjbGllbnQuXG4vLyBBbm90aGVyIHBvc3NpYmlsaXR5IGlzIHRvIGdlbmVyYXRlIHRoZSBibG9iIFVSTCB3aXRoaW4gYSBzYW5kYm94ZWQgaWZyYW1lLlxuLy8gVGhlIGRvd25zaWRlIG9mIHVzaW5nIGEgc2Vjb25kIGRvbWFpbiBpcyB0aGF0IGl0IGNvbXBsaWNhdGVzIGhvc3RpbmcsXG4vLyB0aGUgZG93bnNpZGUgb2YgdXNpbmcgYSBzYW5kYm94ZWQgaWZyYW1lIGlzIHRoYXQgdGhlIGJyb3dlcnMgYXJlIG92ZXJseVxuLy8gcmVzdHJpY3RpdmUgaW4gd2hhdCB5b3UgYXJlIGFsbG93ZWQgdG8gZG8gd2l0aCB0aGUgZ2VuZXJhdGVkIFVSTC5cblxuLyoqXG4gKiBHZXQgdGhlIGN1cnJlbnQgQ1NTIHN0eWxlIGZvciBhIERPTUVsZW1lbnQuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIGdldCB0aGUgY3VycmVudCBzdHlsZSBvZi5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIENTUyBzdHlsZSBlbmNvZGVkIGFzIGEgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBjb21wdXRlZFN0eWxlKGVsZW1lbnQpIHtcbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCwgbnVsbCk7XG4gICAgbGV0IGNzc1RleHQgPSBzdHlsZS5jc3NUZXh0O1xuICAgIC8vIG5vaW5zcGVjdGlvbiBFcXVhbGl0eUNvbXBhcmlzb25XaXRoQ29lcmNpb25KU1xuICAgIGlmIChjc3NUZXh0ID09IFwiXCIpIHtcbiAgICAgICAgLy8gRmlyZWZveCBkb2Vzbid0IGltcGxlbWVudCBcIi5jc3NUZXh0XCIgZm9yIGNvbXB1dGVkIHN0eWxlcy5cbiAgICAgICAgLy8gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTM3Njg3XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3R5bGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNzc1RleHQgKz0gc3R5bGVbaV0gKyBcIjpcIjtcbiAgICAgICAgICAgIGNzc1RleHQgKz0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShzdHlsZVtpXSkgKyBcIjtcIjtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3NzVGV4dDtcbn1cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MubWVzc2FnZXMuTUZpbGVCb2R5XCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNRmlsZUJvZHkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIC8qIHRoZSBNYXRyaXhFdmVudCB0byBzaG93ICovXG4gICAgICAgIG14RXZlbnQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgLyogYWxyZWFkeSBkZWNyeXB0ZWQgYmxvYiAqL1xuICAgICAgICBkZWNyeXB0ZWRCbG9iOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICAvKiBjYWxsZWQgd2hlbiB0aGUgZG93bmxvYWQgbGluayBpZnJhbWUgaXMgc2hvd24gKi9cbiAgICAgICAgb25IZWlnaHRDaGFuZ2VkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgLyogdGhlIHNoYXBlIG9mIHRoZSB0aWxlLCB1c2VkICovXG4gICAgICAgIHRpbGVTaGFwZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgLyogd2hldGhlciBvciBub3QgdG8gc2hvdyB0aGUgZGVmYXVsdCBwbGFjZWhvbGRlciBmb3IgdGhlIGZpbGUuIERlZmF1bHRzIHRvIHRydWUuICovXG4gICAgICAgIHNob3dHZW5lcmljUGxhY2Vob2xkZXI6IFByb3BUeXBlcy5ib29sLFxuICAgIH07XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBzaG93R2VuZXJpY1BsYWNlaG9sZGVyOiB0cnVlLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGRlY3J5cHRlZEJsb2I6ICh0aGlzLnByb3BzLmRlY3J5cHRlZEJsb2IgPyB0aGlzLnByb3BzLmRlY3J5cHRlZEJsb2IgOiBudWxsKSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9pZnJhbWUgPSBjcmVhdGVSZWYoKTtcbiAgICAgICAgdGhpcy5fZHVtbXlMaW5rID0gY3JlYXRlUmVmKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXh0cmFjdHMgYSBodW1hbiByZWFkYWJsZSBsYWJlbCBmb3IgdGhlIGZpbGUgYXR0YWNobWVudCB0byB1c2UgYXNcbiAgICAgKiBsaW5rIHRleHQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29udGVudCBUaGUgXCJjb250ZW50XCIga2V5IG9mIHRoZSBtYXRyaXggZXZlbnQuXG4gICAgICogQHBhcmFtIHtib29sZWFufSB3aXRoU2l6ZSBXaGV0aGVyIHRvIGluY2x1ZGUgc2l6ZSBpbmZvcm1hdGlvbi4gRGVmYXVsdCB0cnVlLlxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gdGhlIGh1bWFuIHJlYWRhYmxlIGxpbmsgdGV4dCBmb3IgdGhlIGF0dGFjaG1lbnQuXG4gICAgICovXG4gICAgcHJlc2VudGFibGVUZXh0Rm9yRmlsZShjb250ZW50LCB3aXRoU2l6ZSA9IHRydWUpIHtcbiAgICAgICAgbGV0IGxpbmtUZXh0ID0gX3QoXCJBdHRhY2htZW50XCIpO1xuICAgICAgICBpZiAoY29udGVudC5ib2R5ICYmIGNvbnRlbnQuYm9keS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBUaGUgY29udGVudCBib2R5IHNob3VsZCBiZSB0aGUgbmFtZSBvZiB0aGUgZmlsZSBpbmNsdWRpbmcgYVxuICAgICAgICAgICAgLy8gZmlsZSBleHRlbnNpb24uXG4gICAgICAgICAgICBsaW5rVGV4dCA9IGNvbnRlbnQuYm9keTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb250ZW50LmluZm8gJiYgY29udGVudC5pbmZvLnNpemUgJiYgd2l0aFNpemUpIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGtub3cgdGhlIHNpemUgb2YgdGhlIGZpbGUgdGhlbiBhZGQgaXQgYXMgaHVtYW4gcmVhZGFibGVcbiAgICAgICAgICAgIC8vIHN0cmluZyB0byB0aGUgZW5kIG9mIHRoZSBsaW5rIHRleHQgc28gdGhhdCB0aGUgdXNlciBrbm93cyBob3dcbiAgICAgICAgICAgIC8vIGJpZyBhIGZpbGUgdGhleSBhcmUgZG93bmxvYWRpbmcuXG4gICAgICAgICAgICAvLyBUaGUgY29udGVudC5pbmZvIGFsc28gY29udGFpbnMgYSBNSU1FLXR5cGUgYnV0IHdlIGRvbid0IGRpc3BsYXlcbiAgICAgICAgICAgIC8vIGl0IHNpbmNlIGl0IGlzIFwidWdseVwiLCB1c2VycyBnZW5lcmFsbHkgYXJlbid0IGF3YXJlIHdoYXQgaXRcbiAgICAgICAgICAgIC8vIG1lYW5zIGFuZCB0aGUgdHlwZSBvZiB0aGUgYXR0YWNobWVudCBjYW4gdXN1YWxseSBiZSBpbmZlcnJlcmVkXG4gICAgICAgICAgICAvLyBmcm9tIHRoZSBmaWxlIGV4dGVuc2lvbi5cbiAgICAgICAgICAgIGxpbmtUZXh0ICs9ICcgKCcgKyBmaWxlc2l6ZShjb250ZW50LmluZm8uc2l6ZSkgKyAnKSc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpbmtUZXh0O1xuICAgIH1cblxuICAgIF9nZXRDb250ZW50VXJsKCkge1xuICAgICAgICBjb25zdCBtZWRpYSA9IG1lZGlhRnJvbUNvbnRlbnQodGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKSk7XG4gICAgICAgIHJldHVybiBtZWRpYS5zcmNIdHRwO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWQgJiYgIXByZXZTdGF0ZS5kZWNyeXB0ZWRCbG9iICYmIHRoaXMuc3RhdGUuZGVjcnlwdGVkQmxvYikge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50KCk7XG4gICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnByZXNlbnRhYmxlVGV4dEZvckZpbGUoY29udGVudCk7XG4gICAgICAgIGNvbnN0IGlzRW5jcnlwdGVkID0gY29udGVudC5maWxlICE9PSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lID0gY29udGVudC5ib2R5ICYmIGNvbnRlbnQuYm9keS5sZW5ndGggPiAwID8gY29udGVudC5ib2R5IDogX3QoXCJBdHRhY2htZW50XCIpO1xuICAgICAgICBjb25zdCBjb250ZW50VXJsID0gdGhpcy5fZ2V0Q29udGVudFVybCgpO1xuICAgICAgICBjb25zdCBmaWxlU2l6ZSA9IGNvbnRlbnQuaW5mbyA/IGNvbnRlbnQuaW5mby5zaXplIDogbnVsbDtcbiAgICAgICAgY29uc3QgZmlsZVR5cGUgPSBjb250ZW50LmluZm8gPyBjb250ZW50LmluZm8ubWltZXR5cGUgOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiO1xuXG4gICAgICAgIGxldCBwbGFjZWhvbGRlciA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnNob3dHZW5lcmljUGxhY2Vob2xkZXIpIHtcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTUZpbGVCb2R5X2luZm9cIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfTUZpbGVCb2R5X2luZm9faWNvblwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01GaWxlQm9keV9pbmZvX2ZpbGVuYW1lXCI+e3RoaXMucHJlc2VudGFibGVUZXh0Rm9yRmlsZShjb250ZW50LCBmYWxzZSl9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0VuY3J5cHRlZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGVjcnlwdGVkQmxvYiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIE5lZWQgdG8gZGVjcnlwdCB0aGUgYXR0YWNobWVudFxuICAgICAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSB1c2VyIHRvIGNsaWNrIG9uIHRoZSBsaW5rIGJlZm9yZSBkb3dubG9hZGluZ1xuICAgICAgICAgICAgICAgIC8vIGFuZCBkZWNyeXB0aW5nIHRoZSBhdHRhY2htZW50LlxuICAgICAgICAgICAgICAgIGxldCBkZWNyeXB0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVjcnlwdCA9IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWNyeXB0aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGVjcnlwdGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGRlY3J5cHRGaWxlKGNvbnRlbnQuZmlsZSkudGhlbigoYmxvYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjcnlwdGVkQmxvYjogYmxvYixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJVbmFibGUgdG8gZGVjcnlwdCBhdHRhY2htZW50OiBcIiwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0Vycm9yIGRlY3J5cHRpbmcgYXR0YWNobWVudCcsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkVycm9yXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIkVycm9yIGRlY3J5cHRpbmcgYXR0YWNobWVudFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY3J5cHRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIFRoaXMgYnV0dG9uIHNob3VsZCBhY3R1YWxseSBEb3dubG9hZCBiZWNhdXNlIHVzZXJjb250ZW50LyB3aWxsIHRyeSB0byBjbGljayBpdHNlbGZcbiAgICAgICAgICAgICAgICAvLyBidXQgaXQgaXMgbm90IGd1YXJhbnRlZWQgYmV0d2VlbiB2YXJpb3VzIGJyb3dzZXJzJyBzZXR0aW5ncy5cbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9NRmlsZUJvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwbGFjZWhvbGRlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTUZpbGVCb2R5X2Rvd25sb2FkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17ZGVjcnlwdH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJEZWNyeXB0ICUodGV4dClzXCIsIHsgdGV4dDogdGV4dCB9KSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSBpZnJhbWUgbG9hZHMgd2UgdGVsbCBpdCB0byByZW5kZXIgYSBkb3dubG9hZCBsaW5rXG4gICAgICAgICAgICBjb25zdCBvbklmcmFtZUxvYWQgPSAoZXYpID0+IHtcbiAgICAgICAgICAgICAgICBldi50YXJnZXQuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgICAgIGltZ1NyYzogZG93bmxvYWRJY29uVXJsLFxuICAgICAgICAgICAgICAgICAgICBpbWdTdHlsZTogbnVsbCwgLy8gaXQgaGFuZGxlcyB0aGlzIGludGVybmFsbHkgZm9yIHVzLiBVc2VmdWwgaWYgYSBkb3duc3RyZWFtIGNoYW5nZXMgdGhlIGljb24uXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiBjb21wdXRlZFN0eWxlKHRoaXMuX2R1bW15TGluay5jdXJyZW50KSxcbiAgICAgICAgICAgICAgICAgICAgYmxvYjogdGhpcy5zdGF0ZS5kZWNyeXB0ZWRCbG9iLFxuICAgICAgICAgICAgICAgICAgICAvLyBTZXQgYSBkb3dubG9hZCBhdHRyaWJ1dGUgZm9yIGVuY3J5cHRlZCBmaWxlcyBzbyB0aGF0IHRoZSBmaWxlXG4gICAgICAgICAgICAgICAgICAgIC8vIHdpbGwgaGF2ZSB0aGUgY29ycmVjdCBuYW1lIHdoZW4gdGhlIHVzZXIgdHJpZXMgdG8gZG93bmxvYWQgaXQuXG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGNhbid0IHByb3ZpZGUgYSBDb250ZW50LURpc3Bvc2l0aW9uIGhlYWRlciBsaWtlIHdlIHdvdWxkIGZvciBIVFRQLlxuICAgICAgICAgICAgICAgICAgICBkb3dubG9hZDogZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHRleHRDb250ZW50OiBfdChcIkRvd25sb2FkICUodGV4dClzXCIsIHsgdGV4dDogdGV4dCB9KSxcbiAgICAgICAgICAgICAgICAgICAgLy8gb25seSBhdXRvLWRvd25sb2FkIGlmIGEgdXNlciB0cmlnZ2VyZWQgdGhpcyBpZnJhbWUgZXhwbGljaXRseVxuICAgICAgICAgICAgICAgICAgICBhdXRvOiAhdGhpcy5wcm9wcy5kZWNyeXB0ZWRCbG9iLFxuICAgICAgICAgICAgICAgIH0sIFwiKlwiKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHVybCA9IFwidXNlcmNvbnRlbnQvXCI7IC8vIFhYWDogdGhpcyBwYXRoIHNob3VsZCBwcm9iYWJseSBiZSBwYXNzZWQgZnJvbSB0aGUgc2tpblxuXG4gICAgICAgICAgICAvLyBJZiB0aGUgYXR0YWNobWVudCBpcyBlbmNyeXB0ZWQgdGhlbiBwdXQgdGhlIGxpbmsgaW5zaWRlIGFuIGlmcmFtZS5cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfTUZpbGVCb2R5XCI+XG4gICAgICAgICAgICAgICAgICAgIHtwbGFjZWhvbGRlcn1cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NRmlsZUJvZHlfZG93bmxvYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tkaXNwbGF5OiBcIm5vbmVcIn19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogQWRkIGR1bW15IGNvcHkgb2YgdGhlIFwiYVwiIHRhZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBXZSdsbCB1c2UgaXQgdG8gbGVhcm4gaG93IHRoZSBkb3dubG9hZCBsaW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHdvdWxkIGhhdmUgYmVlbiBzdHlsZWQgaWYgaXQgd2FzIHJlbmRlcmVkIGlubGluZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSByZWY9e3RoaXMuX2R1bW15TGlua30gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGlmcmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYz17dXJsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uTG9hZD17b25JZnJhbWVMb2FkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5faWZyYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNhbmRib3g9XCJhbGxvdy1zY3JpcHRzIGFsbG93LWRvd25sb2FkcyBhbGxvdy1kb3dubG9hZHMtd2l0aG91dC11c2VyLWFjdGl2YXRpb25cIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbnRlbnRVcmwpIHtcbiAgICAgICAgICAgIGNvbnN0IGRvd25sb2FkUHJvcHMgPSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBcIl9ibGFua1wiLFxuICAgICAgICAgICAgICAgIHJlbDogXCJub3JlZmVycmVyIG5vb3BlbmVyXCIsXG5cbiAgICAgICAgICAgICAgICAvLyBXZSBzZXQgdGhlIGhyZWYgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIG9yIG5vdCB3ZSBpbnRlcmNlcHQgdGhlIGRvd25sb2FkXG4gICAgICAgICAgICAgICAgLy8gYmVjYXVzZSB3ZSBkb24ndCByZWFsbHkgd2FudCB0byBjb252ZXJ0IHRoZSBmaWxlIHRvIGEgYmxvYiBlYWdlcmx5LCBhbmRcbiAgICAgICAgICAgICAgICAvLyBzdGlsbCB3YW50IFwib3BlbiBpbiBuZXcgdGFiXCIgYW5kIFwic2F2ZSBsaW5rIGFzXCIgdG8gd29yay5cbiAgICAgICAgICAgICAgICBocmVmOiBjb250ZW50VXJsLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gQmxvYnMgY2FuIG9ubHkgaGF2ZSB1cCB0byA1MDBtYiwgc28gaWYgdGhlIGZpbGUgcmVwb3J0cyBhcyBiZWluZyB0b28gbGFyZ2UgdGhlblxuICAgICAgICAgICAgLy8gd2Ugd29uJ3QgdHJ5IGFuZCBjb252ZXJ0IGl0LiBMaWtld2lzZSwgaWYgdGhlIGZpbGUgc2l6ZSBpcyB1bmtub3duIHRoZW4gd2UnbGwgYXNzdW1lXG4gICAgICAgICAgICAvLyBpdCBpcyB0b28gYmlnLiBUaGVyZSBpcyB0aGUgcmlzayBvZiB0aGUgcmVwb3J0ZWQgZmlsZSBzaXplIGFuZCB0aGUgYWN0dWFsIGZpbGUgc2l6ZVxuICAgICAgICAgICAgLy8gYmVpbmcgZGlmZmVyZW50LCBob3dldmVyIHRoZSB1c2VyIHNob3VsZG4ndCBub3JtYWxseSBydW4gaW50byB0aGlzIHByb2JsZW0uXG4gICAgICAgICAgICBjb25zdCBmaWxlVG9vQmlnID0gdHlwZW9mKGZpbGVTaXplKSA9PT0gJ251bWJlcicgPyBmaWxlU2l6ZSA+IDUyNDI4ODAwMCA6IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChbXCJhcHBsaWNhdGlvbi9wZGZcIl0uaW5jbHVkZXMoZmlsZVR5cGUpICYmICFmaWxlVG9vQmlnKSB7XG4gICAgICAgICAgICAgICAgLy8gV2Ugd2FudCB0byBmb3JjZSBhIGRvd25sb2FkIG9uIHRoaXMgdHlwZSwgc28gdXNlIGFuIG9uQ2xpY2sgaGFuZGxlci5cbiAgICAgICAgICAgICAgICBkb3dubG9hZFByb3BzW1wib25DbGlja1wiXSA9IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBEb3dubG9hZGluZyAke2ZpbGVUeXBlfSBhcyBibG9iICh1bmVuY3J5cHRlZClgKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBBdm9pZCBsZXR0aW5nIHRoZSA8YT4gZG8gaXRzIHRoaW5nXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBTdGFydCBhIGZldGNoIGZvciB0aGUgZG93bmxvYWRcbiAgICAgICAgICAgICAgICAgICAgLy8gQmFzZWQgdXBvbiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNDk1MDA0NjVcbiAgICAgICAgICAgICAgICAgICAgZmV0Y2goY29udGVudFVybCkudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmJsb2IoKSkudGhlbigoYmxvYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYmxvYlVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgdG8gY3JlYXRlIGFuIGFuY2hvciB0byBkb3dubG9hZCB0aGUgZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGVtcEFuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBBbmNob3IuZG93bmxvYWQgPSBmaWxlTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBBbmNob3IuaHJlZiA9IGJsb2JVcmw7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRlbXBBbmNob3IpOyAvLyBmb3IgZmlyZWZveDogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzMyMjI2MDY4XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wQW5jaG9yLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wQW5jaG9yLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBFbHNlIHdlIGFyZSBob3BpbmcgdGhlIGJyb3dzZXIgd2lsbCBkbyB0aGUgcmlnaHQgdGhpbmdcbiAgICAgICAgICAgICAgICBkb3dubG9hZFByb3BzW1wiZG93bmxvYWRcIl0gPSBmaWxlTmFtZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgdGhlIGF0dGFjaG1lbnQgaXMgbm90IGVuY3J5cHRlZCB0aGVuIHdlIGNoZWNrIHdoZXRoZXIgd2VcbiAgICAgICAgICAgIC8vIGFyZSBiZWluZyBkaXNwbGF5ZWQgaW4gdGhlIHJvb20gdGltZWxpbmUgb3IgaW4gYSBsaXN0IG9mXG4gICAgICAgICAgICAvLyBmaWxlcyBpbiB0aGUgcmlnaHQgaGFuZCBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy50aWxlU2hhcGUgPT09IFwiZmlsZV9ncmlkXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9NRmlsZUJvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwbGFjZWhvbGRlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTUZpbGVCb2R5X2Rvd25sb2FkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3NOYW1lPVwibXhfTUZpbGVCb2R5X2Rvd25sb2FkTGlua1wiIHsuLi5kb3dubG9hZFByb3BzfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBmaWxlTmFtZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTUltYWdlQm9keV9zaXplXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY29udGVudC5pbmZvICYmIGNvbnRlbnQuaW5mby5zaXplID8gZmlsZXNpemUoY29udGVudC5pbmZvLnNpemUpIDogXCJcIiB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01GaWxlQm9keVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3BsYWNlaG9sZGVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NRmlsZUJvZHlfZG93bmxvYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSB7Li4uZG93bmxvYWRQcm9wc30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01GaWxlQm9keV9kb3dubG9hZF9pY29uXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkRvd25sb2FkICUodGV4dClzXCIsIHsgdGV4dDogdGV4dCB9KSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXh0cmEgPSB0ZXh0ID8gKCc6ICcgKyB0ZXh0KSA6ICcnO1xuICAgICAgICAgICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT1cIm14X01GaWxlQm9keVwiPlxuICAgICAgICAgICAgICAgIHtwbGFjZWhvbGRlcn1cbiAgICAgICAgICAgICAgICB7IF90KFwiSW52YWxpZCBmaWxlJShleHRyYSlzXCIsIHsgZXh0cmE6IGV4dHJhIH0pIH1cbiAgICAgICAgICAgIDwvc3Bhbj47XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=