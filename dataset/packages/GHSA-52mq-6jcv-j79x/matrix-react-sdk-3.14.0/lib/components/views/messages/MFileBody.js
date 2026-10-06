"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _filesize = _interopRequireDefault(require("filesize"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _DecryptFile = require("../../../utils/DecryptFile");

var _Tinter = _interopRequireDefault(require("../../../Tinter"));

var _browserRequest = _interopRequireDefault(require("browser-request"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2018 New Vector Ltd

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
// A cached tinted copy of require("../../../../res/img/download.svg")
let tintedDownloadImageURL; // Track a list of mounted MFileBody instances so that we can update
// the require("../../../../res/img/download.svg") when the tint changes.

let nextMountId = 0;
const mounts = {};
/**
 * Updates the tinted copy of require("../../../../res/img/download.svg") when the tint changes.
 */

function updateTintedDownloadImage() {
  // Download the svg as an XML document.
  // We could cache the XML response here, but since the tint rarely changes
  // it's probably not worth it.
  // Also note that we can't use fetch here because fetch doesn't support
  // file URLs, which the download image will be if we're running from
  // the filesystem (like in an Electron wrapper).
  (0, _browserRequest.default)({
    uri: require("../../../../res/img/download.svg")
  }, (err, response, body) => {
    if (err) return;
    const svg = new DOMParser().parseFromString(body, "image/svg+xml"); // Apply the fixups to the XML.

    const fixups = _Tinter.default.calcSvgFixups([{
      contentDocument: svg
    }]);

    _Tinter.default.applySvgFixups(fixups); // Encoded the fixed up SVG as a data URL.


    const svgString = new XMLSerializer().serializeToString(svg);
    tintedDownloadImageURL = "data:image/svg+xml;base64," + window.btoa(svgString); // Notify each mounted MFileBody that the URL has changed.

    Object.keys(mounts).forEach(function (id) {
      mounts[id].tint();
    });
  });
}

_Tinter.default.registerTintable(updateTintedDownloadImage); // User supplied content can contain scripts, we have to be careful that
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
  let cssText = style.cssText;

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

class MFileBody extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "tint", () => {
      // Update our tinted copy of require("../../../../res/img/download.svg")
      if (this._downloadImage.current) {
        this._downloadImage.current.src = tintedDownloadImageURL;
      }

      if (this._iframe.current) {
        // If the attachment is encrypted then the download image
        // will be inside the iframe so we wont be able to update
        // it directly.
        this._iframe.current.contentWindow.postMessage({
          imgSrc: tintedDownloadImageURL,
          style: computedStyle(this._dummyLink.current)
        }, "*");
      }
    });
    this.state = {
      decryptedBlob: this.props.decryptedBlob ? this.props.decryptedBlob : null
    };
    this._iframe = /*#__PURE__*/(0, _react.createRef)();
    this._dummyLink = /*#__PURE__*/(0, _react.createRef)();
    this._downloadImage = /*#__PURE__*/(0, _react.createRef)();
  }
  /**
   * Extracts a human readable label for the file attachment to use as
   * link text.
   *
   * @param {Object} content The "content" key of the matrix event.
   * @return {string} the human readable link text for the attachment.
   */


  presentableTextForFile(content) {
    let linkText = (0, _languageHandler._t)("Attachment");

    if (content.body && content.body.length > 0) {
      // The content body should be the name of the file including a
      // file extension.
      linkText = content.body;
    }

    if (content.info && content.info.size) {
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
    const content = this.props.mxEvent.getContent();
    return _MatrixClientPeg.MatrixClientPeg.get().mxcUrlToHttp(content.url);
  }

  componentDidMount() {
    // Add this to the list of mounted components to receive notifications
    // when the tint changes.
    this.id = nextMountId++;
    mounts[this.id] = this;
    this.tint();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.onHeightChanged && !prevState.decryptedBlob && this.state.decryptedBlob) {
      this.props.onHeightChanged();
    }
  }

  componentWillUnmount() {
    // Remove this from the list of mounted components
    delete mounts[this.id];
  }

  render() {
    const content = this.props.mxEvent.getContent();
    const text = this.presentableTextForFile(content);
    const isEncrypted = content.file !== undefined;
    const fileName = content.body && content.body.length > 0 ? content.body : (0, _languageHandler._t)("Attachment");

    const contentUrl = this._getContentUrl();

    const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
    const fileSize = content.info ? content.info.size : null;
    const fileType = content.info ? content.info.mimetype : "application/octet-stream";

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

            _Modal.default.createTrackedDialog('Error decrypting attachment', '', ErrorDialog, {
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
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_MFileBody_download"
        }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          onClick: decrypt
        }, (0, _languageHandler._t)("Decrypt %(text)s", {
          text: text
        }))));
      } // When the iframe loads we tell it to render a download link


      const onIframeLoad = ev => {
        ev.target.contentWindow.postMessage({
          imgSrc: tintedDownloadImageURL,
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
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MFileBody_download"
      }, /*#__PURE__*/_react.default.createElement("div", {
        style: {
          display: "none"
        }
      }, /*#__PURE__*/_react.default.createElement("a", {
        ref: this._dummyLink
      })), /*#__PURE__*/_react.default.createElement("iframe", {
        src: `${url}?origin=${encodeURIComponent(window.location.origin)}`,
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
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_MFileBody_download"
        }, /*#__PURE__*/_react.default.createElement("a", (0, _extends2.default)({
          className: "mx_MFileBody_downloadLink"
        }, downloadProps), fileName), /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_MImageBody_size"
        }, content.info && content.info.size ? (0, _filesize.default)(content.info.size) : "")));
      } else {
        return /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_MFileBody"
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_MFileBody_download"
        }, /*#__PURE__*/_react.default.createElement("a", downloadProps, /*#__PURE__*/_react.default.createElement("img", {
          src: tintedDownloadImageURL,
          width: "12",
          height: "14",
          ref: this._downloadImage
        }), (0, _languageHandler._t)("Download %(text)s", {
          text: text
        }))));
      }
    } else {
      const extra = text ? ': ' + text : '';
      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MFileBody"
      }, (0, _languageHandler._t)("Invalid file%(extra)s", {
        extra: extra
      }));
    }
  }

}

exports.default = MFileBody;
(0, _defineProperty2.default)(MFileBody, "propTypes", {
  /* the MatrixEvent to show */
  mxEvent: _propTypes.default.object.isRequired,

  /* already decrypted blob */
  decryptedBlob: _propTypes.default.object,

  /* called when the download link iframe is shown */
  onHeightChanged: _propTypes.default.func,

  /* the shape of the tile, used */
  tileShape: _propTypes.default.string
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL01GaWxlQm9keS5qcyJdLCJuYW1lcyI6WyJ0aW50ZWREb3dubG9hZEltYWdlVVJMIiwibmV4dE1vdW50SWQiLCJtb3VudHMiLCJ1cGRhdGVUaW50ZWREb3dubG9hZEltYWdlIiwidXJpIiwicmVxdWlyZSIsImVyciIsInJlc3BvbnNlIiwiYm9keSIsInN2ZyIsIkRPTVBhcnNlciIsInBhcnNlRnJvbVN0cmluZyIsImZpeHVwcyIsIlRpbnRlciIsImNhbGNTdmdGaXh1cHMiLCJjb250ZW50RG9jdW1lbnQiLCJhcHBseVN2Z0ZpeHVwcyIsInN2Z1N0cmluZyIsIlhNTFNlcmlhbGl6ZXIiLCJzZXJpYWxpemVUb1N0cmluZyIsIndpbmRvdyIsImJ0b2EiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImlkIiwidGludCIsInJlZ2lzdGVyVGludGFibGUiLCJjb21wdXRlZFN0eWxlIiwiZWxlbWVudCIsInN0eWxlIiwiZ2V0Q29tcHV0ZWRTdHlsZSIsImNzc1RleHQiLCJpIiwibGVuZ3RoIiwiZ2V0UHJvcGVydHlWYWx1ZSIsIk1GaWxlQm9keSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIl9kb3dubG9hZEltYWdlIiwiY3VycmVudCIsInNyYyIsIl9pZnJhbWUiLCJjb250ZW50V2luZG93IiwicG9zdE1lc3NhZ2UiLCJpbWdTcmMiLCJfZHVtbXlMaW5rIiwic3RhdGUiLCJkZWNyeXB0ZWRCbG9iIiwicHJlc2VudGFibGVUZXh0Rm9yRmlsZSIsImNvbnRlbnQiLCJsaW5rVGV4dCIsImluZm8iLCJzaXplIiwiX2dldENvbnRlbnRVcmwiLCJteEV2ZW50IiwiZ2V0Q29udGVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsIm14Y1VybFRvSHR0cCIsInVybCIsImNvbXBvbmVudERpZE1vdW50IiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwicHJldlN0YXRlIiwib25IZWlnaHRDaGFuZ2VkIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW5kZXIiLCJ0ZXh0IiwiaXNFbmNyeXB0ZWQiLCJmaWxlIiwidW5kZWZpbmVkIiwiZmlsZU5hbWUiLCJjb250ZW50VXJsIiwiRXJyb3JEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJmaWxlU2l6ZSIsImZpbGVUeXBlIiwibWltZXR5cGUiLCJkZWNyeXB0aW5nIiwiZGVjcnlwdCIsImUiLCJ0aGVuIiwiYmxvYiIsInNldFN0YXRlIiwiY2F0Y2giLCJjb25zb2xlIiwid2FybiIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJmaW5hbGx5Iiwib25JZnJhbWVMb2FkIiwiZXYiLCJ0YXJnZXQiLCJkb3dubG9hZCIsInRleHRDb250ZW50IiwiYXV0byIsImRpc3BsYXkiLCJlbmNvZGVVUklDb21wb25lbnQiLCJsb2NhdGlvbiIsIm9yaWdpbiIsImRvd25sb2FkUHJvcHMiLCJyZWwiLCJocmVmIiwiZmlsZVRvb0JpZyIsImluY2x1ZGVzIiwibG9nIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJmZXRjaCIsImJsb2JVcmwiLCJVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJ0ZW1wQW5jaG9yIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiYXBwZW5kQ2hpbGQiLCJjbGljayIsInJlbW92ZSIsInRpbGVTaGFwZSIsImV4dHJhIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIsImZ1bmMiLCJzdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUEzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFl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RUFBQyxJQUF4QztBQUE2QyxVQUFBLE1BQU0sRUFBQyxJQUFwRDtBQUF5RCxVQUFBLEdBQUcsRUFBRSxLQUFLeUM7QUFBbkUsVUFESixFQUVNLHlCQUFHLG1CQUFILEVBQXdCO0FBQUU2QixVQUFBQSxJQUFJLEVBQUVBO0FBQVIsU0FBeEIsQ0FGTixDQURKLENBREosQ0FESjtBQVVIO0FBQ0osS0F6RU0sTUF5RUE7QUFDSCxZQUFNdUQsS0FBSyxHQUFHdkQsSUFBSSxHQUFJLE9BQU9BLElBQVgsR0FBbUIsRUFBckM7QUFDQSwwQkFBTztBQUFNLFFBQUEsU0FBUyxFQUFDO0FBQWhCLFNBQ0QseUJBQUcsdUJBQUgsRUFBNEI7QUFBRXVELFFBQUFBLEtBQUssRUFBRUE7QUFBVCxPQUE1QixDQURDLENBQVA7QUFHSDtBQUNKOztBQWxRa0Q7Ozs4QkFBbEN6RixTLGVBQ0U7QUFDZjtBQUNBcUIsRUFBQUEsT0FBTyxFQUFFcUUsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRlg7O0FBR2Y7QUFDQTlFLEVBQUFBLGFBQWEsRUFBRTRFLG1CQUFVQyxNQUpWOztBQUtmO0FBQ0E1RCxFQUFBQSxlQUFlLEVBQUUyRCxtQkFBVUcsSUFOWjs7QUFPZjtBQUNBTCxFQUFBQSxTQUFTLEVBQUVFLG1CQUFVSTtBQVJOLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlUmVmfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGZpbGVzaXplIGZyb20gJ2ZpbGVzaXplJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7ZGVjcnlwdEZpbGV9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0RlY3J5cHRGaWxlJztcbmltcG9ydCBUaW50ZXIgZnJvbSAnLi4vLi4vLi4vVGludGVyJztcbmltcG9ydCByZXF1ZXN0IGZyb20gJ2Jyb3dzZXItcmVxdWVzdCc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcblxuXG4vLyBBIGNhY2hlZCB0aW50ZWQgY29weSBvZiByZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9kb3dubG9hZC5zdmdcIilcbmxldCB0aW50ZWREb3dubG9hZEltYWdlVVJMO1xuLy8gVHJhY2sgYSBsaXN0IG9mIG1vdW50ZWQgTUZpbGVCb2R5IGluc3RhbmNlcyBzbyB0aGF0IHdlIGNhbiB1cGRhdGVcbi8vIHRoZSByZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9kb3dubG9hZC5zdmdcIikgd2hlbiB0aGUgdGludCBjaGFuZ2VzLlxubGV0IG5leHRNb3VudElkID0gMDtcbmNvbnN0IG1vdW50cyA9IHt9O1xuXG4vKipcbiAqIFVwZGF0ZXMgdGhlIHRpbnRlZCBjb3B5IG9mIHJlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2Rvd25sb2FkLnN2Z1wiKSB3aGVuIHRoZSB0aW50IGNoYW5nZXMuXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZVRpbnRlZERvd25sb2FkSW1hZ2UoKSB7XG4gICAgLy8gRG93bmxvYWQgdGhlIHN2ZyBhcyBhbiBYTUwgZG9jdW1lbnQuXG4gICAgLy8gV2UgY291bGQgY2FjaGUgdGhlIFhNTCByZXNwb25zZSBoZXJlLCBidXQgc2luY2UgdGhlIHRpbnQgcmFyZWx5IGNoYW5nZXNcbiAgICAvLyBpdCdzIHByb2JhYmx5IG5vdCB3b3J0aCBpdC5cbiAgICAvLyBBbHNvIG5vdGUgdGhhdCB3ZSBjYW4ndCB1c2UgZmV0Y2ggaGVyZSBiZWNhdXNlIGZldGNoIGRvZXNuJ3Qgc3VwcG9ydFxuICAgIC8vIGZpbGUgVVJMcywgd2hpY2ggdGhlIGRvd25sb2FkIGltYWdlIHdpbGwgYmUgaWYgd2UncmUgcnVubmluZyBmcm9tXG4gICAgLy8gdGhlIGZpbGVzeXN0ZW0gKGxpa2UgaW4gYW4gRWxlY3Ryb24gd3JhcHBlcikuXG4gICAgcmVxdWVzdCh7dXJpOiByZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9kb3dubG9hZC5zdmdcIil9LCAoZXJyLCByZXNwb25zZSwgYm9keSkgPT4ge1xuICAgICAgICBpZiAoZXJyKSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qgc3ZnID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyhib2R5LCBcImltYWdlL3N2Zyt4bWxcIik7XG4gICAgICAgIC8vIEFwcGx5IHRoZSBmaXh1cHMgdG8gdGhlIFhNTC5cbiAgICAgICAgY29uc3QgZml4dXBzID0gVGludGVyLmNhbGNTdmdGaXh1cHMoW3tjb250ZW50RG9jdW1lbnQ6IHN2Z31dKTtcbiAgICAgICAgVGludGVyLmFwcGx5U3ZnRml4dXBzKGZpeHVwcyk7XG4gICAgICAgIC8vIEVuY29kZWQgdGhlIGZpeGVkIHVwIFNWRyBhcyBhIGRhdGEgVVJMLlxuICAgICAgICBjb25zdCBzdmdTdHJpbmcgPSBuZXcgWE1MU2VyaWFsaXplcigpLnNlcmlhbGl6ZVRvU3RyaW5nKHN2Zyk7XG4gICAgICAgIHRpbnRlZERvd25sb2FkSW1hZ2VVUkwgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsXCIgKyB3aW5kb3cuYnRvYShzdmdTdHJpbmcpO1xuICAgICAgICAvLyBOb3RpZnkgZWFjaCBtb3VudGVkIE1GaWxlQm9keSB0aGF0IHRoZSBVUkwgaGFzIGNoYW5nZWQuXG4gICAgICAgIE9iamVjdC5rZXlzKG1vdW50cykuZm9yRWFjaChmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgbW91bnRzW2lkXS50aW50KCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5UaW50ZXIucmVnaXN0ZXJUaW50YWJsZSh1cGRhdGVUaW50ZWREb3dubG9hZEltYWdlKTtcblxuLy8gVXNlciBzdXBwbGllZCBjb250ZW50IGNhbiBjb250YWluIHNjcmlwdHMsIHdlIGhhdmUgdG8gYmUgY2FyZWZ1bCB0aGF0XG4vLyB3ZSBkb24ndCBhY2NpZGVudGFsbHkgcnVuIHRob3NlIHNjcmlwdCB3aXRoaW4gdGhlIHNhbWUgb3JpZ2luIGFzIHRoZVxuLy8gY2xpZW50LiBPdGhlcndpc2UgdGhvc2Ugc2NyaXB0cyB3cml0dGVuIGJ5IHJlbW90ZSB1c2VycyBjYW4gcmVhZFxuLy8gdGhlIGFjY2VzcyB0b2tlbiBhbmQgZW5kLXRvLWVuZCBrZXlzIHRoYXQgYXJlIGluIGxvY2FsIHN0b3JhZ2UuXG4vL1xuLy8gRm9yIGF0dGFjaG1lbnRzIGRvd25sb2FkZWQgZGlyZWN0bHkgZnJvbSB0aGUgaG9tZXNlcnZlciB3ZSBjYW4gdXNlXG4vLyBDb250ZW50LVNlY3VyaXR5LVBvbGljeSBoZWFkZXJzIHRvIGRpc2FibGUgc2NyaXB0IGV4ZWN1dGlvbi5cbi8vXG4vLyBCdXQgYXR0YWNobWVudHMgd2l0aCBlbmQtdG8tZW5kIGVuY3J5cHRpb24gYXJlIG1vcmUgZGlmZmljdWx0IHRvIGhhbmRsZS5cbi8vIFdlIG5lZWQgdG8gZGVjcnlwdCB0aGUgYXR0YWNobWVudCBvbiB0aGUgY2xpZW50IGFuZCB0aGVuIGRpc3BsYXkgaXQuXG4vLyBUbyBkaXNwbGF5IHRoZSBhdHRhY2htZW50IHdlIG5lZWQgdG8gdHVybiB0aGUgZGVjcnlwdGVkIGJ5dGVzIGludG8gYSBVUkwuXG4vL1xuLy8gVGhlcmUgYXJlIHR3byB3YXlzIHRvIHR1cm4gYnl0ZXMgaW50byBVUkxzLCBkYXRhIFVSTCBhbmQgYmxvYiBVUkxzLlxuLy8gRGF0YSBVUkxzIGFyZW4ndCBzdWl0YWJsZSBmb3IgZG93bmxvYWRpbmcgYSBmaWxlIGJlY2F1c2UgQ2hyb21lIGhhcyBhXG4vLyAyTUIgbGltaXQgb24gdGhlIHNpemUgb2YgVVJMcyB0aGF0IGNhbiBiZSB2aWV3ZWQgaW4gdGhlIGJyb3dzZXIgb3Jcbi8vIGRvd25sb2FkZWQuIFRoaXMgbGltaXQgZG9lcyBub3Qgc2VlbSB0byBhcHBseSB3aGVuIHRoZSB1cmwgaXMgdXNlZCBhc1xuLy8gdGhlIHNvdXJjZSBhdHRyaWJ1dGUgb2YgYW4gaW1hZ2UgdGFnLlxuLy9cbi8vIEJsb2IgVVJMcyBhcmUgZ2VuZXJhdGVkIHVzaW5nIHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMIGFuZCB1bmZvcnR1bmF0ZWx5XG4vLyBmb3Igb3VyIHB1cnBvc2VzIHRoZXkgaW5oZXJpdCB0aGUgb3JpZ2luIG9mIHRoZSBwYWdlIHRoYXQgY3JlYXRlZCB0aGVtLlxuLy8gVGhpcyBtZWFucyB0aGF0IGFueSBzY3JpcHRzIHRoYXQgcnVuIHdoZW4gdGhlIFVSTCBpcyB2aWV3ZWQgd2lsbCBiZSBhYmxlXG4vLyB0byBhY2Nlc3MgbG9jYWwgc3RvcmFnZS5cbi8vXG4vLyBUaGUgZWFzaWVzdCBzb2x1dGlvbiBpcyB0byBob3N0IHRoZSBjb2RlIHRoYXQgZ2VuZXJhdGVzIHRoZSBibG9iIFVSTCBvblxuLy8gYSBkaWZmZXJlbnQgZG9tYWluIHRvIHRoZSBjbGllbnQuXG4vLyBBbm90aGVyIHBvc3NpYmlsaXR5IGlzIHRvIGdlbmVyYXRlIHRoZSBibG9iIFVSTCB3aXRoaW4gYSBzYW5kYm94ZWQgaWZyYW1lLlxuLy8gVGhlIGRvd25zaWRlIG9mIHVzaW5nIGEgc2Vjb25kIGRvbWFpbiBpcyB0aGF0IGl0IGNvbXBsaWNhdGVzIGhvc3RpbmcsXG4vLyB0aGUgZG93bnNpZGUgb2YgdXNpbmcgYSBzYW5kYm94ZWQgaWZyYW1lIGlzIHRoYXQgdGhlIGJyb3dlcnMgYXJlIG92ZXJseVxuLy8gcmVzdHJpY3RpdmUgaW4gd2hhdCB5b3UgYXJlIGFsbG93ZWQgdG8gZG8gd2l0aCB0aGUgZ2VuZXJhdGVkIFVSTC5cblxuLyoqXG4gKiBHZXQgdGhlIGN1cnJlbnQgQ1NTIHN0eWxlIGZvciBhIERPTUVsZW1lbnQuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIGdldCB0aGUgY3VycmVudCBzdHlsZSBvZi5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIENTUyBzdHlsZSBlbmNvZGVkIGFzIGEgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBjb21wdXRlZFN0eWxlKGVsZW1lbnQpIHtcbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCwgbnVsbCk7XG4gICAgbGV0IGNzc1RleHQgPSBzdHlsZS5jc3NUZXh0O1xuICAgIGlmIChjc3NUZXh0ID09IFwiXCIpIHtcbiAgICAgICAgLy8gRmlyZWZveCBkb2Vzbid0IGltcGxlbWVudCBcIi5jc3NUZXh0XCIgZm9yIGNvbXB1dGVkIHN0eWxlcy5cbiAgICAgICAgLy8gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTM3Njg3XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3R5bGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNzc1RleHQgKz0gc3R5bGVbaV0gKyBcIjpcIjtcbiAgICAgICAgICAgIGNzc1RleHQgKz0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShzdHlsZVtpXSkgKyBcIjtcIjtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3NzVGV4dDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTUZpbGVCb2R5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvKiB0aGUgTWF0cml4RXZlbnQgdG8gc2hvdyAqL1xuICAgICAgICBteEV2ZW50OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgIC8qIGFscmVhZHkgZGVjcnlwdGVkIGJsb2IgKi9cbiAgICAgICAgZGVjcnlwdGVkQmxvYjogUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgLyogY2FsbGVkIHdoZW4gdGhlIGRvd25sb2FkIGxpbmsgaWZyYW1lIGlzIHNob3duICovXG4gICAgICAgIG9uSGVpZ2h0Q2hhbmdlZDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIC8qIHRoZSBzaGFwZSBvZiB0aGUgdGlsZSwgdXNlZCAqL1xuICAgICAgICB0aWxlU2hhcGU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZGVjcnlwdGVkQmxvYjogKHRoaXMucHJvcHMuZGVjcnlwdGVkQmxvYiA/IHRoaXMucHJvcHMuZGVjcnlwdGVkQmxvYiA6IG51bGwpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX2lmcmFtZSA9IGNyZWF0ZVJlZigpO1xuICAgICAgICB0aGlzLl9kdW1teUxpbmsgPSBjcmVhdGVSZWYoKTtcbiAgICAgICAgdGhpcy5fZG93bmxvYWRJbWFnZSA9IGNyZWF0ZVJlZigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4dHJhY3RzIGEgaHVtYW4gcmVhZGFibGUgbGFiZWwgZm9yIHRoZSBmaWxlIGF0dGFjaG1lbnQgdG8gdXNlIGFzXG4gICAgICogbGluayB0ZXh0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRlbnQgVGhlIFwiY29udGVudFwiIGtleSBvZiB0aGUgbWF0cml4IGV2ZW50LlxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gdGhlIGh1bWFuIHJlYWRhYmxlIGxpbmsgdGV4dCBmb3IgdGhlIGF0dGFjaG1lbnQuXG4gICAgICovXG4gICAgcHJlc2VudGFibGVUZXh0Rm9yRmlsZShjb250ZW50KSB7XG4gICAgICAgIGxldCBsaW5rVGV4dCA9IF90KFwiQXR0YWNobWVudFwiKTtcbiAgICAgICAgaWYgKGNvbnRlbnQuYm9keSAmJiBjb250ZW50LmJvZHkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gVGhlIGNvbnRlbnQgYm9keSBzaG91bGQgYmUgdGhlIG5hbWUgb2YgdGhlIGZpbGUgaW5jbHVkaW5nIGFcbiAgICAgICAgICAgIC8vIGZpbGUgZXh0ZW5zaW9uLlxuICAgICAgICAgICAgbGlua1RleHQgPSBjb250ZW50LmJvZHk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29udGVudC5pbmZvICYmIGNvbnRlbnQuaW5mby5zaXplKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBrbm93IHRoZSBzaXplIG9mIHRoZSBmaWxlIHRoZW4gYWRkIGl0IGFzIGh1bWFuIHJlYWRhYmxlXG4gICAgICAgICAgICAvLyBzdHJpbmcgdG8gdGhlIGVuZCBvZiB0aGUgbGluayB0ZXh0IHNvIHRoYXQgdGhlIHVzZXIga25vd3MgaG93XG4gICAgICAgICAgICAvLyBiaWcgYSBmaWxlIHRoZXkgYXJlIGRvd25sb2FkaW5nLlxuICAgICAgICAgICAgLy8gVGhlIGNvbnRlbnQuaW5mbyBhbHNvIGNvbnRhaW5zIGEgTUlNRS10eXBlIGJ1dCB3ZSBkb24ndCBkaXNwbGF5XG4gICAgICAgICAgICAvLyBpdCBzaW5jZSBpdCBpcyBcInVnbHlcIiwgdXNlcnMgZ2VuZXJhbGx5IGFyZW4ndCBhd2FyZSB3aGF0IGl0XG4gICAgICAgICAgICAvLyBtZWFucyBhbmQgdGhlIHR5cGUgb2YgdGhlIGF0dGFjaG1lbnQgY2FuIHVzdWFsbHkgYmUgaW5mZXJyZXJlZFxuICAgICAgICAgICAgLy8gZnJvbSB0aGUgZmlsZSBleHRlbnNpb24uXG4gICAgICAgICAgICBsaW5rVGV4dCArPSAnICgnICsgZmlsZXNpemUoY29udGVudC5pbmZvLnNpemUpICsgJyknO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaW5rVGV4dDtcbiAgICB9XG5cbiAgICBfZ2V0Q29udGVudFVybCgpIHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50KCk7XG4gICAgICAgIHJldHVybiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkubXhjVXJsVG9IdHRwKGNvbnRlbnQudXJsKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgLy8gQWRkIHRoaXMgdG8gdGhlIGxpc3Qgb2YgbW91bnRlZCBjb21wb25lbnRzIHRvIHJlY2VpdmUgbm90aWZpY2F0aW9uc1xuICAgICAgICAvLyB3aGVuIHRoZSB0aW50IGNoYW5nZXMuXG4gICAgICAgIHRoaXMuaWQgPSBuZXh0TW91bnRJZCsrO1xuICAgICAgICBtb3VudHNbdGhpcy5pZF0gPSB0aGlzO1xuICAgICAgICB0aGlzLnRpbnQoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkICYmICFwcmV2U3RhdGUuZGVjcnlwdGVkQmxvYiAmJiB0aGlzLnN0YXRlLmRlY3J5cHRlZEJsb2IpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgLy8gUmVtb3ZlIHRoaXMgZnJvbSB0aGUgbGlzdCBvZiBtb3VudGVkIGNvbXBvbmVudHNcbiAgICAgICAgZGVsZXRlIG1vdW50c1t0aGlzLmlkXTtcbiAgICB9XG5cbiAgICB0aW50ID0gKCkgPT4ge1xuICAgICAgICAvLyBVcGRhdGUgb3VyIHRpbnRlZCBjb3B5IG9mIHJlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2Rvd25sb2FkLnN2Z1wiKVxuICAgICAgICBpZiAodGhpcy5fZG93bmxvYWRJbWFnZS5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9kb3dubG9hZEltYWdlLmN1cnJlbnQuc3JjID0gdGludGVkRG93bmxvYWRJbWFnZVVSTDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faWZyYW1lLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBhdHRhY2htZW50IGlzIGVuY3J5cHRlZCB0aGVuIHRoZSBkb3dubG9hZCBpbWFnZVxuICAgICAgICAgICAgLy8gd2lsbCBiZSBpbnNpZGUgdGhlIGlmcmFtZSBzbyB3ZSB3b250IGJlIGFibGUgdG8gdXBkYXRlXG4gICAgICAgICAgICAvLyBpdCBkaXJlY3RseS5cbiAgICAgICAgICAgIHRoaXMuX2lmcmFtZS5jdXJyZW50LmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGltZ1NyYzogdGludGVkRG93bmxvYWRJbWFnZVVSTCxcbiAgICAgICAgICAgICAgICBzdHlsZTogY29tcHV0ZWRTdHlsZSh0aGlzLl9kdW1teUxpbmsuY3VycmVudCksXG4gICAgICAgICAgICB9LCBcIipcIik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMucHJlc2VudGFibGVUZXh0Rm9yRmlsZShjb250ZW50KTtcbiAgICAgICAgY29uc3QgaXNFbmNyeXB0ZWQgPSBjb250ZW50LmZpbGUgIT09IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBjb250ZW50LmJvZHkgJiYgY29udGVudC5ib2R5Lmxlbmd0aCA+IDAgPyBjb250ZW50LmJvZHkgOiBfdChcIkF0dGFjaG1lbnRcIik7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRVcmwgPSB0aGlzLl9nZXRDb250ZW50VXJsKCk7XG4gICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgIGNvbnN0IGZpbGVTaXplID0gY29udGVudC5pbmZvID8gY29udGVudC5pbmZvLnNpemUgOiBudWxsO1xuICAgICAgICBjb25zdCBmaWxlVHlwZSA9IGNvbnRlbnQuaW5mbyA/IGNvbnRlbnQuaW5mby5taW1ldHlwZSA6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCI7XG5cbiAgICAgICAgaWYgKGlzRW5jcnlwdGVkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5kZWNyeXB0ZWRCbG9iID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gTmVlZCB0byBkZWNyeXB0IHRoZSBhdHRhY2htZW50XG4gICAgICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHVzZXIgdG8gY2xpY2sgb24gdGhlIGxpbmsgYmVmb3JlIGRvd25sb2FkaW5nXG4gICAgICAgICAgICAgICAgLy8gYW5kIGRlY3J5cHRpbmcgdGhlIGF0dGFjaG1lbnQuXG4gICAgICAgICAgICAgICAgbGV0IGRlY3J5cHRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb25zdCBkZWNyeXB0ID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlY3J5cHRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZWNyeXB0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgZGVjcnlwdEZpbGUoY29udGVudC5maWxlKS50aGVuKChibG9iKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNyeXB0ZWRCbG9iOiBibG9iLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlVuYWJsZSB0byBkZWNyeXB0IGF0dGFjaG1lbnQ6IFwiLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnRXJyb3IgZGVjcnlwdGluZyBhdHRhY2htZW50JywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiRXJyb3JcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiRXJyb3IgZGVjcnlwdGluZyBhdHRhY2htZW50XCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVjcnlwdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBidXR0b24gc2hvdWxkIGFjdHVhbGx5IERvd25sb2FkIGJlY2F1c2UgdXNlcmNvbnRlbnQvIHdpbGwgdHJ5IHRvIGNsaWNrIGl0c2VsZlxuICAgICAgICAgICAgICAgIC8vIGJ1dCBpdCBpcyBub3QgZ3VhcmFudGVlZCBiZXR3ZWVuIHZhcmlvdXMgYnJvd3NlcnMnIHNldHRpbmdzLlxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01GaWxlQm9keVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NRmlsZUJvZHlfZG93bmxvYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXtkZWNyeXB0fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkRlY3J5cHQgJSh0ZXh0KXNcIiwgeyB0ZXh0OiB0ZXh0IH0pIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFdoZW4gdGhlIGlmcmFtZSBsb2FkcyB3ZSB0ZWxsIGl0IHRvIHJlbmRlciBhIGRvd25sb2FkIGxpbmtcbiAgICAgICAgICAgIGNvbnN0IG9uSWZyYW1lTG9hZCA9IChldikgPT4ge1xuICAgICAgICAgICAgICAgIGV2LnRhcmdldC5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgaW1nU3JjOiB0aW50ZWREb3dubG9hZEltYWdlVVJMLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogY29tcHV0ZWRTdHlsZSh0aGlzLl9kdW1teUxpbmsuY3VycmVudCksXG4gICAgICAgICAgICAgICAgICAgIGJsb2I6IHRoaXMuc3RhdGUuZGVjcnlwdGVkQmxvYixcbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IGEgZG93bmxvYWQgYXR0cmlidXRlIGZvciBlbmNyeXB0ZWQgZmlsZXMgc28gdGhhdCB0aGUgZmlsZVxuICAgICAgICAgICAgICAgICAgICAvLyB3aWxsIGhhdmUgdGhlIGNvcnJlY3QgbmFtZSB3aGVuIHRoZSB1c2VyIHRyaWVzIHRvIGRvd25sb2FkIGl0LlxuICAgICAgICAgICAgICAgICAgICAvLyBXZSBjYW4ndCBwcm92aWRlIGEgQ29udGVudC1EaXNwb3NpdGlvbiBoZWFkZXIgbGlrZSB3ZSB3b3VsZCBmb3IgSFRUUC5cbiAgICAgICAgICAgICAgICAgICAgZG93bmxvYWQ6IGZpbGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0Q29udGVudDogX3QoXCJEb3dubG9hZCAlKHRleHQpc1wiLCB7IHRleHQ6IHRleHQgfSksXG4gICAgICAgICAgICAgICAgICAgIC8vIG9ubHkgYXV0by1kb3dubG9hZCBpZiBhIHVzZXIgdHJpZ2dlcmVkIHRoaXMgaWZyYW1lIGV4cGxpY2l0bHlcbiAgICAgICAgICAgICAgICAgICAgYXV0bzogIXRoaXMucHJvcHMuZGVjcnlwdGVkQmxvYixcbiAgICAgICAgICAgICAgICB9LCBcIipcIik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCB1cmwgPSBcInVzZXJjb250ZW50L1wiOyAvLyBYWFg6IHRoaXMgcGF0aCBzaG91bGQgcHJvYmFibHkgYmUgcGFzc2VkIGZyb20gdGhlIHNraW5cblxuICAgICAgICAgICAgLy8gSWYgdGhlIGF0dGFjaG1lbnQgaXMgZW5jcnlwdGVkIHRoZW4gcHV0IHRoZSBsaW5rIGluc2lkZSBhbiBpZnJhbWUuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01GaWxlQm9keVwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01GaWxlQm9keV9kb3dubG9hZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e2Rpc3BsYXk6IFwibm9uZVwifX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBBZGQgZHVtbXkgY29weSBvZiB0aGUgXCJhXCIgdGFnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIFdlJ2xsIHVzZSBpdCB0byBsZWFybiBob3cgdGhlIGRvd25sb2FkIGxpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogd291bGQgaGF2ZSBiZWVuIHN0eWxlZCBpZiBpdCB3YXMgcmVuZGVyZWQgaW5saW5lLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi8gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIHJlZj17dGhpcy5fZHVtbXlMaW5rfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aWZyYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjPXtgJHt1cmx9P29yaWdpbj0ke2VuY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24ub3JpZ2luKX1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uTG9hZD17b25JZnJhbWVMb2FkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5faWZyYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNhbmRib3g9XCJhbGxvdy1zY3JpcHRzIGFsbG93LWRvd25sb2FkcyBhbGxvdy1kb3dubG9hZHMtd2l0aG91dC11c2VyLWFjdGl2YXRpb25cIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbnRlbnRVcmwpIHtcbiAgICAgICAgICAgIGNvbnN0IGRvd25sb2FkUHJvcHMgPSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBcIl9ibGFua1wiLFxuICAgICAgICAgICAgICAgIHJlbDogXCJub3JlZmVycmVyIG5vb3BlbmVyXCIsXG5cbiAgICAgICAgICAgICAgICAvLyBXZSBzZXQgdGhlIGhyZWYgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIG9yIG5vdCB3ZSBpbnRlcmNlcHQgdGhlIGRvd25sb2FkXG4gICAgICAgICAgICAgICAgLy8gYmVjYXVzZSB3ZSBkb24ndCByZWFsbHkgd2FudCB0byBjb252ZXJ0IHRoZSBmaWxlIHRvIGEgYmxvYiBlYWdlcmx5LCBhbmRcbiAgICAgICAgICAgICAgICAvLyBzdGlsbCB3YW50IFwib3BlbiBpbiBuZXcgdGFiXCIgYW5kIFwic2F2ZSBsaW5rIGFzXCIgdG8gd29yay5cbiAgICAgICAgICAgICAgICBocmVmOiBjb250ZW50VXJsLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gQmxvYnMgY2FuIG9ubHkgaGF2ZSB1cCB0byA1MDBtYiwgc28gaWYgdGhlIGZpbGUgcmVwb3J0cyBhcyBiZWluZyB0b28gbGFyZ2UgdGhlblxuICAgICAgICAgICAgLy8gd2Ugd29uJ3QgdHJ5IGFuZCBjb252ZXJ0IGl0LiBMaWtld2lzZSwgaWYgdGhlIGZpbGUgc2l6ZSBpcyB1bmtub3duIHRoZW4gd2UnbGwgYXNzdW1lXG4gICAgICAgICAgICAvLyBpdCBpcyB0b28gYmlnLiBUaGVyZSBpcyB0aGUgcmlzayBvZiB0aGUgcmVwb3J0ZWQgZmlsZSBzaXplIGFuZCB0aGUgYWN0dWFsIGZpbGUgc2l6ZVxuICAgICAgICAgICAgLy8gYmVpbmcgZGlmZmVyZW50LCBob3dldmVyIHRoZSB1c2VyIHNob3VsZG4ndCBub3JtYWxseSBydW4gaW50byB0aGlzIHByb2JsZW0uXG4gICAgICAgICAgICBjb25zdCBmaWxlVG9vQmlnID0gdHlwZW9mKGZpbGVTaXplKSA9PT0gJ251bWJlcicgPyBmaWxlU2l6ZSA+IDUyNDI4ODAwMCA6IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChbXCJhcHBsaWNhdGlvbi9wZGZcIl0uaW5jbHVkZXMoZmlsZVR5cGUpICYmICFmaWxlVG9vQmlnKSB7XG4gICAgICAgICAgICAgICAgLy8gV2Ugd2FudCB0byBmb3JjZSBhIGRvd25sb2FkIG9uIHRoaXMgdHlwZSwgc28gdXNlIGFuIG9uQ2xpY2sgaGFuZGxlci5cbiAgICAgICAgICAgICAgICBkb3dubG9hZFByb3BzW1wib25DbGlja1wiXSA9IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBEb3dubG9hZGluZyAke2ZpbGVUeXBlfSBhcyBibG9iICh1bmVuY3J5cHRlZClgKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBBdm9pZCBsZXR0aW5nIHRoZSA8YT4gZG8gaXRzIHRoaW5nXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBTdGFydCBhIGZldGNoIGZvciB0aGUgZG93bmxvYWRcbiAgICAgICAgICAgICAgICAgICAgLy8gQmFzZWQgdXBvbiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNDk1MDA0NjVcbiAgICAgICAgICAgICAgICAgICAgZmV0Y2goY29udGVudFVybCkudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmJsb2IoKSkudGhlbigoYmxvYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYmxvYlVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgdG8gY3JlYXRlIGFuIGFuY2hvciB0byBkb3dubG9hZCB0aGUgZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGVtcEFuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBBbmNob3IuZG93bmxvYWQgPSBmaWxlTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBBbmNob3IuaHJlZiA9IGJsb2JVcmw7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRlbXBBbmNob3IpOyAvLyBmb3IgZmlyZWZveDogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzMyMjI2MDY4XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wQW5jaG9yLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wQW5jaG9yLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBFbHNlIHdlIGFyZSBob3BpbmcgdGhlIGJyb3dzZXIgd2lsbCBkbyB0aGUgcmlnaHQgdGhpbmdcbiAgICAgICAgICAgICAgICBkb3dubG9hZFByb3BzW1wiZG93bmxvYWRcIl0gPSBmaWxlTmFtZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgdGhlIGF0dGFjaG1lbnQgaXMgbm90IGVuY3J5cHRlZCB0aGVuIHdlIGNoZWNrIHdoZXRoZXIgd2VcbiAgICAgICAgICAgIC8vIGFyZSBiZWluZyBkaXNwbGF5ZWQgaW4gdGhlIHJvb20gdGltZWxpbmUgb3IgaW4gYSBsaXN0IG9mXG4gICAgICAgICAgICAvLyBmaWxlcyBpbiB0aGUgcmlnaHQgaGFuZCBzaWRlIG9mIHRoZSBzY3JlZW4uXG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy50aWxlU2hhcGUgPT09IFwiZmlsZV9ncmlkXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9NRmlsZUJvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTUZpbGVCb2R5X2Rvd25sb2FkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3NOYW1lPVwibXhfTUZpbGVCb2R5X2Rvd25sb2FkTGlua1wiIHsuLi5kb3dubG9hZFByb3BzfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBmaWxlTmFtZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTUltYWdlQm9keV9zaXplXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY29udGVudC5pbmZvICYmIGNvbnRlbnQuaW5mby5zaXplID8gZmlsZXNpemUoY29udGVudC5pbmZvLnNpemUpIDogXCJcIiB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01GaWxlQm9keVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NRmlsZUJvZHlfZG93bmxvYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSB7Li4uZG93bmxvYWRQcm9wc30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPXt0aW50ZWREb3dubG9hZEltYWdlVVJMfSB3aWR0aD1cIjEyXCIgaGVpZ2h0PVwiMTRcIiByZWY9e3RoaXMuX2Rvd25sb2FkSW1hZ2V9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJEb3dubG9hZCAlKHRleHQpc1wiLCB7IHRleHQ6IHRleHQgfSkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGV4dHJhID0gdGV4dCA/ICgnOiAnICsgdGV4dCkgOiAnJztcbiAgICAgICAgICAgIHJldHVybiA8c3BhbiBjbGFzc05hbWU9XCJteF9NRmlsZUJvZHlcIj5cbiAgICAgICAgICAgICAgICB7IF90KFwiSW52YWxpZCBmaWxlJShleHRyYSlzXCIsIHsgZXh0cmE6IGV4dHJhIH0pIH1cbiAgICAgICAgICAgIDwvc3Bhbj47XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=