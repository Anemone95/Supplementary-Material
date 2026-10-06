"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.UploadCanceledError = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _MatrixClientPeg = require("./MatrixClientPeg");

var sdk = _interopRequireWildcard(require("./index"));

var _languageHandler = require("./languageHandler");

var _Modal = _interopRequireDefault(require("./Modal"));

var _RoomViewStore = _interopRequireDefault(require("./stores/RoomViewStore"));

var _browserEncryptAttachment = _interopRequireDefault(require("browser-encrypt-attachment"));

var _pngChunksExtract = _interopRequireDefault(require("png-chunks-extract"));

var _Spinner = _interopRequireDefault(require("./components/views/elements/Spinner"));

require("blueimp-canvas-to-blob");

var _actions = require("./dispatcher/actions");

var _CountlyAnalytics = _interopRequireDefault(require("./CountlyAnalytics"));

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2019 New Vector Ltd
Copyright 2020 The Matrix.org Foundation C.I.C.

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
// Polyfill for Canvas.toBlob API using Canvas.toDataURL
const MAX_WIDTH = 800;
const MAX_HEIGHT = 600; // scraped out of a macOS hidpi (5660ppm) screenshot png
//                  5669 px (x-axis)      , 5669 px (y-axis)      , per metre

const PHYS_HIDPI = [0x00, 0x00, 0x16, 0x25, 0x00, 0x00, 0x16, 0x25, 0x01];

class UploadCanceledError extends Error {}

exports.UploadCanceledError = UploadCanceledError;

/**
 * Create a thumbnail for a image DOM element.
 * The image will be smaller than MAX_WIDTH and MAX_HEIGHT.
 * The thumbnail will have the same aspect ratio as the original.
 * Draws the element into a canvas using CanvasRenderingContext2D.drawImage
 * Then calls Canvas.toBlob to get a blob object for the image data.
 *
 * Since it needs to calculate the dimensions of the source image and the
 * thumbnailed image it returns an info object filled out with information
 * about the original image and the thumbnail.
 *
 * @param {HTMLElement} element The element to thumbnail.
 * @param {number} inputWidth The width of the image in the input element.
 * @param {number} inputHeight the width of the image in the input element.
 * @param {String} mimeType The mimeType to save the blob as.
 * @return {Promise} A promise that resolves with an object with an info key
 *  and a thumbnail key.
 */
function createThumbnail(element
/*: ThumbnailableElement*/
, inputWidth
/*: number*/
, inputHeight
/*: number*/
, mimeType
/*: string*/
)
/*: Promise<IThumbnail>*/
{
  return new Promise(resolve => {
    let targetWidth = inputWidth;
    let targetHeight = inputHeight;

    if (targetHeight > MAX_HEIGHT) {
      targetWidth = Math.floor(targetWidth * (MAX_HEIGHT / targetHeight));
      targetHeight = MAX_HEIGHT;
    }

    if (targetWidth > MAX_WIDTH) {
      targetHeight = Math.floor(targetHeight * (MAX_WIDTH / targetWidth));
      targetWidth = MAX_WIDTH;
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    canvas.getContext("2d").drawImage(element, 0, 0, targetWidth, targetHeight);
    canvas.toBlob(function (thumbnail) {
      resolve({
        info: {
          thumbnail_info: {
            w: targetWidth,
            h: targetHeight,
            mimetype: thumbnail.type,
            size: thumbnail.size
          },
          w: inputWidth,
          h: inputHeight
        },
        thumbnail: thumbnail
      });
    }, mimeType);
  });
}
/**
 * Load a file into a newly created image element.
 *
 * @param {File} imageFile The file to load in an image element.
 * @return {Promise} A promise that resolves with the html image element.
 */


async function loadImageElement(imageFile
/*: File*/
) {
  // Load the file into an html element
  const img = document.createElement("img");
  const objectUrl = URL.createObjectURL(imageFile);
  const imgPromise = new Promise((resolve, reject) => {
    img.onload = function () {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = function (e) {
      reject(e);
    };
  });
  img.src = objectUrl; // check for hi-dpi PNGs and fudge display resolution as needed.
  // this is mainly needed for macOS screencaps

  let parsePromise;

  if (imageFile.type === "image/png") {
    // in practice macOS happens to order the chunks so they fall in
    // the first 0x1000 bytes (thanks to a massive ICC header).
    // Thus we could slice the file down to only sniff the first 0x1000
    // bytes (but this makes extractPngChunks choke on the corrupt file)
    const headers = imageFile; //.slice(0, 0x1000);

    parsePromise = readFileAsArrayBuffer(headers).then(arrayBuffer => {
      const buffer = new Uint8Array(arrayBuffer);
      const chunks = (0, _pngChunksExtract.default)(buffer);

      for (const chunk of chunks) {
        if (chunk.name === 'pHYs') {
          if (chunk.data.byteLength !== PHYS_HIDPI.length) return;
          return chunk.data.every((val, i) => val === PHYS_HIDPI[i]);
        }
      }

      return false;
    });
  }

  const [hidpi] = await Promise.all([parsePromise, imgPromise]);
  const width = hidpi ? img.width >> 1 : img.width;
  const height = hidpi ? img.height >> 1 : img.height;
  return {
    width,
    height,
    img
  };
}
/**
 * Read the metadata for an image file and create and upload a thumbnail of the image.
 *
 * @param {MatrixClient} matrixClient A matrixClient to upload the thumbnail with.
 * @param {String} roomId The ID of the room the image will be uploaded in.
 * @param {File} imageFile The image to read and thumbnail.
 * @return {Promise} A promise that resolves with the attachment info.
 */


function infoForImageFile(matrixClient, roomId, imageFile) {
  let thumbnailType = "image/png";

  if (imageFile.type === "image/jpeg") {
    thumbnailType = "image/jpeg";
  }

  let imageInfo;
  return loadImageElement(imageFile).then(function (r) {
    return createThumbnail(r.img, r.width, r.height, thumbnailType);
  }).then(function (result) {
    imageInfo = result.info;
    return uploadFile(matrixClient, roomId, result.thumbnail);
  }).then(function (result) {
    imageInfo.thumbnail_url = result.url;
    imageInfo.thumbnail_file = result.file;
    return imageInfo;
  });
}
/**
 * Load a file into a newly created video element.
 *
 * @param {File} videoFile The file to load in an video element.
 * @return {Promise} A promise that resolves with the video image element.
 */


function loadVideoElement(videoFile)
/*: Promise<HTMLVideoElement>*/
{
  return new Promise((resolve, reject) => {
    // Load the file into an html element
    const video = document.createElement("video");
    const reader = new FileReader();

    reader.onload = function (ev) {
      video.src = ev.target.result; // Once ready, returns its size
      // Wait until we have enough data to thumbnail the first frame.

      video.onloadeddata = function () {
        resolve(video);
      };

      video.onerror = function (e) {
        reject(e);
      };
    };

    reader.onerror = function (e) {
      reject(e);
    };

    reader.readAsDataURL(videoFile);
  });
}
/**
 * Read the metadata for a video file and create and upload a thumbnail of the video.
 *
 * @param {MatrixClient} matrixClient A matrixClient to upload the thumbnail with.
 * @param {String} roomId The ID of the room the video will be uploaded to.
 * @param {File} videoFile The video to read and thumbnail.
 * @return {Promise} A promise that resolves with the attachment info.
 */


function infoForVideoFile(matrixClient, roomId, videoFile) {
  const thumbnailType = "image/jpeg";
  let videoInfo;
  return loadVideoElement(videoFile).then(function (video) {
    return createThumbnail(video, video.videoWidth, video.videoHeight, thumbnailType);
  }).then(function (result) {
    videoInfo = result.info;
    return uploadFile(matrixClient, roomId, result.thumbnail);
  }).then(function (result) {
    videoInfo.thumbnail_url = result.url;
    videoInfo.thumbnail_file = result.file;
    return videoInfo;
  });
}
/**
 * Read the file as an ArrayBuffer.
 * @param {File} file The file to read
 * @return {Promise} A promise that resolves with an ArrayBuffer when the file
 *   is read.
 */


function readFileAsArrayBuffer(file
/*: File | Blob*/
)
/*: Promise<ArrayBuffer>*/
{
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      resolve(e.target.result);
    };

    reader.onerror = function (e) {
      reject(e);
    };

    reader.readAsArrayBuffer(file);
  });
}
/**
 * Upload the file to the content repository.
 * If the room is encrypted then encrypt the file before uploading.
 *
 * @param {MatrixClient} matrixClient The matrix client to upload the file with.
 * @param {String} roomId The ID of the room being uploaded to.
 * @param {File} file The file to upload.
 * @param {Function?} progressHandler optional callback to be called when a chunk of
 *    data is uploaded.
 * @return {Promise} A promise that resolves with an object.
 *  If the file is unencrypted then the object will have a "url" key.
 *  If the file is encrypted then the object will have a "file" key.
 */


function uploadFile(matrixClient
/*: MatrixClient*/
, roomId
/*: string*/
, file
/*: File | Blob*/
, progressHandler
/*: any*/
) {
  let canceled = false;

  if (matrixClient.isRoomEncrypted(roomId)) {
    // If the room is encrypted then encrypt the file before uploading it.
    // First read the file into memory.
    let uploadPromise;
    let encryptInfo;
    const prom = readFileAsArrayBuffer(file).then(function (data) {
      if (canceled) throw new UploadCanceledError(); // Then encrypt the file.

      return _browserEncryptAttachment.default.encryptAttachment(data);
    }).then(function (encryptResult) {
      if (canceled) throw new UploadCanceledError(); // Record the information needed to decrypt the attachment.

      encryptInfo = encryptResult.info; // Pass the encrypted data as a Blob to the uploader.

      const blob = new Blob([encryptResult.data]);
      uploadPromise = matrixClient.uploadContent(blob, {
        progressHandler: progressHandler,
        includeFilename: false
      });
      return uploadPromise;
    }).then(function (url) {
      if (canceled) throw new UploadCanceledError(); // If the attachment is encrypted then bundle the URL along
      // with the information needed to decrypt the attachment and
      // add it under a file key.

      encryptInfo.url = url;

      if (file.type) {
        encryptInfo.mimetype = file.type;
      }

      return {
        "file": encryptInfo
      };
    });

    prom.abort = () => {
      canceled = true;
      if (uploadPromise) _MatrixClientPeg.MatrixClientPeg.get().cancelUpload(uploadPromise);
    };

    return prom;
  } else {
    const basePromise = matrixClient.uploadContent(file, {
      progressHandler: progressHandler
    });
    const promise1 = basePromise.then(function (url) {
      if (canceled) throw new UploadCanceledError(); // If the attachment isn't encrypted then include the URL directly.

      return {
        "url": url
      };
    });

    promise1.abort = () => {
      canceled = true;

      _MatrixClientPeg.MatrixClientPeg.get().cancelUpload(basePromise);
    };

    return promise1;
  }
}

class ContentMessages {
  constructor() {
    (0, _defineProperty2.default)(this, "inprogress", []);
    (0, _defineProperty2.default)(this, "mediaConfig", null);
  }

  sendStickerContentToRoom(url
  /*: string*/
  , roomId
  /*: string*/
  , info
  /*: string*/
  , text
  /*: string*/
  , matrixClient
  /*: MatrixClient*/
  ) {
    const startTime = _CountlyAnalytics.default.getTimestamp();

    const prom = _MatrixClientPeg.MatrixClientPeg.get().sendStickerMessage(roomId, url, info, text).catch(e => {
      console.warn(`Failed to send content with URL ${url} to room ${roomId}`, e);
      throw e;
    });

    _CountlyAnalytics.default.instance.trackSendMessage(startTime, prom, roomId, false, false, {
      msgtype: "m.sticker"
    });

    return prom;
  }

  getUploadLimit() {
    if (this.mediaConfig !== null && this.mediaConfig["m.upload.size"] !== undefined) {
      return this.mediaConfig["m.upload.size"];
    } else {
      return null;
    }
  }

  async sendContentListToRoom(files
  /*: File[]*/
  , roomId
  /*: string*/
  , matrixClient
  /*: MatrixClient*/
  ) {
    if (matrixClient.isGuest()) {
      _dispatcher.default.dispatch({
        action: 'require_registration'
      });

      return;
    }

    const isQuoting = Boolean(_RoomViewStore.default.getQuotingEvent());

    if (isQuoting) {
      const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");

      const {
        finished
      } = _Modal.default.createTrackedDialog('Upload Reply Warning', '', QuestionDialog, {
        title: (0, _languageHandler._t)('Replying With Files'),
        description: /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('At this time it is not possible to reply with a file. ' + 'Would you like to upload this file without replying?')),
        hasCancelButton: true,
        button: (0, _languageHandler._t)("Continue")
      });

      const [shouldUpload] = await finished;
      if (!shouldUpload) return;
    }

    if (!this.mediaConfig) {
      // hot-path optimization to not flash a spinner if we don't need to
      const modal = _Modal.default.createDialog(_Spinner.default, null, 'mx_Dialog_spinner');

      await this.ensureMediaConfigFetched();
      modal.close();
    }

    const tooBigFiles = [];
    const okFiles = [];

    for (let i = 0; i < files.length; ++i) {
      if (this.isFileSizeAcceptable(files[i])) {
        okFiles.push(files[i]);
      } else {
        tooBigFiles.push(files[i]);
      }
    }

    if (tooBigFiles.length > 0) {
      const UploadFailureDialog = sdk.getComponent("dialogs.UploadFailureDialog");

      const {
        finished
      } = _Modal.default.createTrackedDialog('Upload Failure', '', UploadFailureDialog, {
        badFiles: tooBigFiles,
        totalFiles: files.length,
        contentMessages: this
      });

      const [shouldContinue] = await finished;
      if (!shouldContinue) return;
    }

    const UploadConfirmDialog = sdk.getComponent("dialogs.UploadConfirmDialog");
    let uploadAll = false; // Promise to complete before sending next file into room, used for synchronisation of file-sending
    // to match the order the files were specified in

    let promBefore = Promise.resolve();

    for (let i = 0; i < okFiles.length; ++i) {
      const file = okFiles[i];

      if (!uploadAll) {
        const {
          finished
        } = _Modal.default.createTrackedDialog('Upload Files confirmation', '', UploadConfirmDialog, {
          file,
          currentIndex: i,
          totalFiles: okFiles.length
        });

        const [shouldContinue, shouldUploadAll] = await finished;
        if (!shouldContinue) break;

        if (shouldUploadAll) {
          uploadAll = true;
        }
      }

      promBefore = this.sendContentToRoom(file, roomId, matrixClient, promBefore);
    }
  }

  getCurrentUploads() {
    return this.inprogress.filter(u => !u.canceled);
  }

  cancelUpload(promise
  /*: Promise<any>*/
  ) {
    let upload
    /*: IUpload*/
    ;

    for (let i = 0; i < this.inprogress.length; ++i) {
      if (this.inprogress[i].promise === promise) {
        upload = this.inprogress[i];
        break;
      }
    }

    if (upload) {
      upload.canceled = true;

      _MatrixClientPeg.MatrixClientPeg.get().cancelUpload(upload.promise);

      _dispatcher.default.dispatch({
        action: _actions.Action.UploadCanceled,
        upload
      });
    }
  }

  sendContentToRoom(file
  /*: File*/
  , roomId
  /*: string*/
  , matrixClient
  /*: MatrixClient*/
  , promBefore
  /*: Promise<any>*/
  ) {
    const startTime = _CountlyAnalytics.default.getTimestamp();

    const content
    /*: IContent*/
    = {
      body: file.name || 'Attachment',
      info: {
        size: file.size
      },
      msgtype: "" // set later

    }; // if we have a mime type for the file, add it to the message metadata

    if (file.type) {
      content.info.mimetype = file.type;
    }

    const prom = new Promise(resolve => {
      if (file.type.indexOf('image/') === 0) {
        content.msgtype = 'm.image';
        infoForImageFile(matrixClient, roomId, file).then(imageInfo => {
          Object.assign(content.info, imageInfo);
          resolve();
        }, e => {
          console.error(e);
          content.msgtype = 'm.file';
          resolve();
        });
      } else if (file.type.indexOf('audio/') === 0) {
        content.msgtype = 'm.audio';
        resolve();
      } else if (file.type.indexOf('video/') === 0) {
        content.msgtype = 'm.video';
        infoForVideoFile(matrixClient, roomId, file).then(videoInfo => {
          Object.assign(content.info, videoInfo);
          resolve();
        }, e => {
          content.msgtype = 'm.file';
          resolve();
        });
      } else {
        content.msgtype = 'm.file';
        resolve();
      }
    }); // create temporary abort handler for before the actual upload gets passed off to js-sdk

    prom.abort = () => {
      upload.canceled = true;
    };

    const upload
    /*: IUpload*/
    = {
      fileName: file.name || 'Attachment',
      roomId: roomId,
      total: file.size,
      loaded: 0,
      promise: prom
    };
    this.inprogress.push(upload);

    _dispatcher.default.dispatch({
      action: _actions.Action.UploadStarted,
      upload
    }); // Focus the composer view


    _dispatcher.default.fire(_actions.Action.FocusComposer);

    function onProgress(ev) {
      upload.total = ev.total;
      upload.loaded = ev.loaded;

      _dispatcher.default.dispatch({
        action: _actions.Action.UploadProgress,
        upload
      });
    }

    let error;
    return prom.then(function () {
      if (upload.canceled) throw new UploadCanceledError(); // XXX: upload.promise must be the promise that
      // is returned by uploadFile as it has an abort()
      // method hacked onto it.

      upload.promise = uploadFile(matrixClient, roomId, file, onProgress);
      return upload.promise.then(function (result) {
        content.file = result.file;
        content.url = result.url;
      });
    }).then(() => {
      // Await previous message being sent into the room
      return promBefore;
    }).then(function () {
      if (upload.canceled) throw new UploadCanceledError();
      const prom = matrixClient.sendMessage(roomId, content);

      _CountlyAnalytics.default.instance.trackSendMessage(startTime, prom, roomId, false, false, content);

      return prom;
    }, function (err) {
      error = err;

      if (!upload.canceled) {
        let desc = (0, _languageHandler._t)("The file '%(fileName)s' failed to upload.", {
          fileName: upload.fileName
        });

        if (err.http_status === 413) {
          desc = (0, _languageHandler._t)("The file '%(fileName)s' exceeds this homeserver's size limit for uploads", {
            fileName: upload.fileName
          });
        }

        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        _Modal.default.createTrackedDialog('Upload failed', '', ErrorDialog, {
          title: (0, _languageHandler._t)('Upload Failed'),
          description: desc
        });
      }
    }).finally(() => {
      for (let i = 0; i < this.inprogress.length; ++i) {
        if (this.inprogress[i].promise === upload.promise) {
          this.inprogress.splice(i, 1);
          break;
        }
      }

      if (error) {
        // 413: File was too big or upset the server in some way:
        // clear the media size limit so we fetch it again next time
        // we try to upload
        if (error && error.http_status === 413) {
          this.mediaConfig = null;
        }

        _dispatcher.default.dispatch({
          action: _actions.Action.UploadFailed,
          upload,
          error
        });
      } else {
        _dispatcher.default.dispatch({
          action: _actions.Action.UploadFinished,
          upload
        });

        _dispatcher.default.dispatch({
          action: 'message_sent'
        });
      }
    });
  }

  isFileSizeAcceptable(file
  /*: File*/
  ) {
    if (this.mediaConfig !== null && this.mediaConfig["m.upload.size"] !== undefined && file.size > this.mediaConfig["m.upload.size"]) {
      return false;
    }

    return true;
  }

  ensureMediaConfigFetched() {
    if (this.mediaConfig !== null) return;
    console.log("[Media Config] Fetching");
    return _MatrixClientPeg.MatrixClientPeg.get().getMediaConfig().then(config => {
      console.log("[Media Config] Fetched config:", config);
      return config;
    }).catch(() => {
      // Media repo can't or won't report limits, so provide an empty object (no limits).
      console.log("[Media Config] Could not fetch config, so not limiting uploads.");
      return {};
    }).then(config => {
      this.mediaConfig = config;
    });
  }

  static sharedInstance() {
    if (window.mxContentMessages === undefined) {
      window.mxContentMessages = new ContentMessages();
    }

    return window.mxContentMessages;
  }

}

exports.default = ContentMessages;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Db250ZW50TWVzc2FnZXMudHN4Il0sIm5hbWVzIjpbIk1BWF9XSURUSCIsIk1BWF9IRUlHSFQiLCJQSFlTX0hJRFBJIiwiVXBsb2FkQ2FuY2VsZWRFcnJvciIsIkVycm9yIiwiY3JlYXRlVGh1bWJuYWlsIiwiZWxlbWVudCIsImlucHV0V2lkdGgiLCJpbnB1dEhlaWdodCIsIm1pbWVUeXBlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJ0YXJnZXRXaWR0aCIsInRhcmdldEhlaWdodCIsIk1hdGgiLCJmbG9vciIsImNhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIndpZHRoIiwiaGVpZ2h0IiwiZ2V0Q29udGV4dCIsImRyYXdJbWFnZSIsInRvQmxvYiIsInRodW1ibmFpbCIsImluZm8iLCJ0aHVtYm5haWxfaW5mbyIsInciLCJoIiwibWltZXR5cGUiLCJ0eXBlIiwic2l6ZSIsImxvYWRJbWFnZUVsZW1lbnQiLCJpbWFnZUZpbGUiLCJpbWciLCJvYmplY3RVcmwiLCJVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJpbWdQcm9taXNlIiwicmVqZWN0Iiwib25sb2FkIiwicmV2b2tlT2JqZWN0VVJMIiwib25lcnJvciIsImUiLCJzcmMiLCJwYXJzZVByb21pc2UiLCJoZWFkZXJzIiwicmVhZEZpbGVBc0FycmF5QnVmZmVyIiwidGhlbiIsImFycmF5QnVmZmVyIiwiYnVmZmVyIiwiVWludDhBcnJheSIsImNodW5rcyIsImNodW5rIiwibmFtZSIsImRhdGEiLCJieXRlTGVuZ3RoIiwibGVuZ3RoIiwiZXZlcnkiLCJ2YWwiLCJpIiwiaGlkcGkiLCJhbGwiLCJpbmZvRm9ySW1hZ2VGaWxlIiwibWF0cml4Q2xpZW50Iiwicm9vbUlkIiwidGh1bWJuYWlsVHlwZSIsImltYWdlSW5mbyIsInIiLCJyZXN1bHQiLCJ1cGxvYWRGaWxlIiwidGh1bWJuYWlsX3VybCIsInVybCIsInRodW1ibmFpbF9maWxlIiwiZmlsZSIsImxvYWRWaWRlb0VsZW1lbnQiLCJ2aWRlb0ZpbGUiLCJ2aWRlbyIsInJlYWRlciIsIkZpbGVSZWFkZXIiLCJldiIsInRhcmdldCIsIm9ubG9hZGVkZGF0YSIsInJlYWRBc0RhdGFVUkwiLCJpbmZvRm9yVmlkZW9GaWxlIiwidmlkZW9JbmZvIiwidmlkZW9XaWR0aCIsInZpZGVvSGVpZ2h0IiwicmVhZEFzQXJyYXlCdWZmZXIiLCJwcm9ncmVzc0hhbmRsZXIiLCJjYW5jZWxlZCIsImlzUm9vbUVuY3J5cHRlZCIsInVwbG9hZFByb21pc2UiLCJlbmNyeXB0SW5mbyIsInByb20iLCJlbmNyeXB0IiwiZW5jcnlwdEF0dGFjaG1lbnQiLCJlbmNyeXB0UmVzdWx0IiwiYmxvYiIsIkJsb2IiLCJ1cGxvYWRDb250ZW50IiwiaW5jbHVkZUZpbGVuYW1lIiwiYWJvcnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJjYW5jZWxVcGxvYWQiLCJiYXNlUHJvbWlzZSIsInByb21pc2UxIiwiQ29udGVudE1lc3NhZ2VzIiwic2VuZFN0aWNrZXJDb250ZW50VG9Sb29tIiwidGV4dCIsInN0YXJ0VGltZSIsIkNvdW50bHlBbmFseXRpY3MiLCJnZXRUaW1lc3RhbXAiLCJzZW5kU3RpY2tlck1lc3NhZ2UiLCJjYXRjaCIsImNvbnNvbGUiLCJ3YXJuIiwiaW5zdGFuY2UiLCJ0cmFja1NlbmRNZXNzYWdlIiwibXNndHlwZSIsImdldFVwbG9hZExpbWl0IiwibWVkaWFDb25maWciLCJ1bmRlZmluZWQiLCJzZW5kQ29udGVudExpc3RUb1Jvb20iLCJmaWxlcyIsImlzR3Vlc3QiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsImlzUXVvdGluZyIsIkJvb2xlYW4iLCJSb29tVmlld1N0b3JlIiwiZ2V0UXVvdGluZ0V2ZW50IiwiUXVlc3Rpb25EaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJmaW5pc2hlZCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJoYXNDYW5jZWxCdXR0b24iLCJidXR0b24iLCJzaG91bGRVcGxvYWQiLCJtb2RhbCIsImNyZWF0ZURpYWxvZyIsIlNwaW5uZXIiLCJlbnN1cmVNZWRpYUNvbmZpZ0ZldGNoZWQiLCJjbG9zZSIsInRvb0JpZ0ZpbGVzIiwib2tGaWxlcyIsImlzRmlsZVNpemVBY2NlcHRhYmxlIiwicHVzaCIsIlVwbG9hZEZhaWx1cmVEaWFsb2ciLCJiYWRGaWxlcyIsInRvdGFsRmlsZXMiLCJjb250ZW50TWVzc2FnZXMiLCJzaG91bGRDb250aW51ZSIsIlVwbG9hZENvbmZpcm1EaWFsb2ciLCJ1cGxvYWRBbGwiLCJwcm9tQmVmb3JlIiwiY3VycmVudEluZGV4Iiwic2hvdWxkVXBsb2FkQWxsIiwic2VuZENvbnRlbnRUb1Jvb20iLCJnZXRDdXJyZW50VXBsb2FkcyIsImlucHJvZ3Jlc3MiLCJmaWx0ZXIiLCJ1IiwicHJvbWlzZSIsInVwbG9hZCIsIkFjdGlvbiIsIlVwbG9hZENhbmNlbGVkIiwiY29udGVudCIsImJvZHkiLCJpbmRleE9mIiwiT2JqZWN0IiwiYXNzaWduIiwiZXJyb3IiLCJmaWxlTmFtZSIsInRvdGFsIiwibG9hZGVkIiwiVXBsb2FkU3RhcnRlZCIsImZpcmUiLCJGb2N1c0NvbXBvc2VyIiwib25Qcm9ncmVzcyIsIlVwbG9hZFByb2dyZXNzIiwic2VuZE1lc3NhZ2UiLCJlcnIiLCJkZXNjIiwiaHR0cF9zdGF0dXMiLCJFcnJvckRpYWxvZyIsImZpbmFsbHkiLCJzcGxpY2UiLCJVcGxvYWRGYWlsZWQiLCJVcGxvYWRGaW5pc2hlZCIsImxvZyIsImdldE1lZGlhQ29uZmlnIiwiY29uZmlnIiwic2hhcmVkSW5zdGFuY2UiLCJ3aW5kb3ciLCJteENvbnRlbnRNZXNzYWdlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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O0FBRUQsU0FBT0MsY0FBUCxHQUF3QjtBQUNwQixRQUFJQyxNQUFNLENBQUNDLGlCQUFQLEtBQTZCOUUsU0FBakMsRUFBNEM7QUFDeEM2RSxNQUFBQSxNQUFNLENBQUNDLGlCQUFQLEdBQTJCLElBQUk3RixlQUFKLEVBQTNCO0FBQ0g7O0FBQ0QsV0FBTzRGLE1BQU0sQ0FBQ0MsaUJBQWQ7QUFDSDs7QUFuUmdDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgZGlzIGZyb20gJy4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQge01hdHJpeENsaWVudH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi9Nb2RhbCc7XG5pbXBvcnQgUm9vbVZpZXdTdG9yZSBmcm9tICcuL3N0b3Jlcy9Sb29tVmlld1N0b3JlJztcbmltcG9ydCBlbmNyeXB0IGZyb20gXCJicm93c2VyLWVuY3J5cHQtYXR0YWNobWVudFwiO1xuaW1wb3J0IGV4dHJhY3RQbmdDaHVua3MgZnJvbSBcInBuZy1jaHVua3MtZXh0cmFjdFwiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9TcGlubmVyXCI7XG5cbi8vIFBvbHlmaWxsIGZvciBDYW52YXMudG9CbG9iIEFQSSB1c2luZyBDYW52YXMudG9EYXRhVVJMXG5pbXBvcnQgXCJibHVlaW1wLWNhbnZhcy10by1ibG9iXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCBDb3VudGx5QW5hbHl0aWNzIGZyb20gXCIuL0NvdW50bHlBbmFseXRpY3NcIjtcbmltcG9ydCB7XG4gICAgVXBsb2FkQ2FuY2VsZWRQYXlsb2FkLFxuICAgIFVwbG9hZEVycm9yUGF5bG9hZCxcbiAgICBVcGxvYWRGaW5pc2hlZFBheWxvYWQsXG4gICAgVXBsb2FkUHJvZ3Jlc3NQYXlsb2FkLFxuICAgIFVwbG9hZFN0YXJ0ZWRQYXlsb2FkLFxufSBmcm9tIFwiLi9kaXNwYXRjaGVyL3BheWxvYWRzL1VwbG9hZFBheWxvYWRcIjtcbmltcG9ydCB7SVVwbG9hZH0gZnJvbSBcIi4vbW9kZWxzL0lVcGxvYWRcIjtcblxuY29uc3QgTUFYX1dJRFRIID0gODAwO1xuY29uc3QgTUFYX0hFSUdIVCA9IDYwMDtcblxuLy8gc2NyYXBlZCBvdXQgb2YgYSBtYWNPUyBoaWRwaSAoNTY2MHBwbSkgc2NyZWVuc2hvdCBwbmdcbi8vICAgICAgICAgICAgICAgICAgNTY2OSBweCAoeC1heGlzKSAgICAgICwgNTY2OSBweCAoeS1heGlzKSAgICAgICwgcGVyIG1ldHJlXG5jb25zdCBQSFlTX0hJRFBJID0gWzB4MDAsIDB4MDAsIDB4MTYsIDB4MjUsIDB4MDAsIDB4MDAsIDB4MTYsIDB4MjUsIDB4MDFdO1xuXG5leHBvcnQgY2xhc3MgVXBsb2FkQ2FuY2VsZWRFcnJvciBleHRlbmRzIEVycm9yIHt9XG5cbnR5cGUgVGh1bWJuYWlsYWJsZUVsZW1lbnQgPSBIVE1MSW1hZ2VFbGVtZW50IHwgSFRNTFZpZGVvRWxlbWVudDtcblxuaW50ZXJmYWNlIElNZWRpYUNvbmZpZyB7XG4gICAgXCJtLnVwbG9hZC5zaXplXCI/OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBJQ29udGVudCB7XG4gICAgYm9keTogc3RyaW5nO1xuICAgIG1zZ3R5cGU6IHN0cmluZztcbiAgICBpbmZvOiB7XG4gICAgICAgIHNpemU6IG51bWJlcjtcbiAgICAgICAgbWltZXR5cGU/OiBzdHJpbmc7XG4gICAgfTtcbiAgICBmaWxlPzogc3RyaW5nO1xuICAgIHVybD86IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElUaHVtYm5haWwge1xuICAgIGluZm86IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgICAgICB0aHVtYm5haWxfaW5mbzoge1xuICAgICAgICAgICAgdzogbnVtYmVyO1xuICAgICAgICAgICAgaDogbnVtYmVyO1xuICAgICAgICAgICAgbWltZXR5cGU6IHN0cmluZztcbiAgICAgICAgICAgIHNpemU6IG51bWJlcjtcbiAgICAgICAgfTtcbiAgICAgICAgdzogbnVtYmVyO1xuICAgICAgICBoOiBudW1iZXI7XG4gICAgfTtcbiAgICB0aHVtYm5haWw6IEJsb2I7XG59XG5cbmludGVyZmFjZSBJQWJvcnRhYmxlUHJvbWlzZTxUPiBleHRlbmRzIFByb21pc2U8VD4ge1xuICAgIGFib3J0KCk6IHZvaWQ7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgdGh1bWJuYWlsIGZvciBhIGltYWdlIERPTSBlbGVtZW50LlxuICogVGhlIGltYWdlIHdpbGwgYmUgc21hbGxlciB0aGFuIE1BWF9XSURUSCBhbmQgTUFYX0hFSUdIVC5cbiAqIFRoZSB0aHVtYm5haWwgd2lsbCBoYXZlIHRoZSBzYW1lIGFzcGVjdCByYXRpbyBhcyB0aGUgb3JpZ2luYWwuXG4gKiBEcmF3cyB0aGUgZWxlbWVudCBpbnRvIGEgY2FudmFzIHVzaW5nIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRC5kcmF3SW1hZ2VcbiAqIFRoZW4gY2FsbHMgQ2FudmFzLnRvQmxvYiB0byBnZXQgYSBibG9iIG9iamVjdCBmb3IgdGhlIGltYWdlIGRhdGEuXG4gKlxuICogU2luY2UgaXQgbmVlZHMgdG8gY2FsY3VsYXRlIHRoZSBkaW1lbnNpb25zIG9mIHRoZSBzb3VyY2UgaW1hZ2UgYW5kIHRoZVxuICogdGh1bWJuYWlsZWQgaW1hZ2UgaXQgcmV0dXJucyBhbiBpbmZvIG9iamVjdCBmaWxsZWQgb3V0IHdpdGggaW5mb3JtYXRpb25cbiAqIGFib3V0IHRoZSBvcmlnaW5hbCBpbWFnZSBhbmQgdGhlIHRodW1ibmFpbC5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIHRodW1ibmFpbC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBpbnB1dFdpZHRoIFRoZSB3aWR0aCBvZiB0aGUgaW1hZ2UgaW4gdGhlIGlucHV0IGVsZW1lbnQuXG4gKiBAcGFyYW0ge251bWJlcn0gaW5wdXRIZWlnaHQgdGhlIHdpZHRoIG9mIHRoZSBpbWFnZSBpbiB0aGUgaW5wdXQgZWxlbWVudC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBtaW1lVHlwZSBUaGUgbWltZVR5cGUgdG8gc2F2ZSB0aGUgYmxvYiBhcy5cbiAqIEByZXR1cm4ge1Byb21pc2V9IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggYW4gb2JqZWN0IHdpdGggYW4gaW5mbyBrZXlcbiAqICBhbmQgYSB0aHVtYm5haWwga2V5LlxuICovXG5mdW5jdGlvbiBjcmVhdGVUaHVtYm5haWwoXG4gICAgZWxlbWVudDogVGh1bWJuYWlsYWJsZUVsZW1lbnQsXG4gICAgaW5wdXRXaWR0aDogbnVtYmVyLFxuICAgIGlucHV0SGVpZ2h0OiBudW1iZXIsXG4gICAgbWltZVR5cGU6IHN0cmluZyxcbik6IFByb21pc2U8SVRodW1ibmFpbD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBsZXQgdGFyZ2V0V2lkdGggPSBpbnB1dFdpZHRoO1xuICAgICAgICBsZXQgdGFyZ2V0SGVpZ2h0ID0gaW5wdXRIZWlnaHQ7XG4gICAgICAgIGlmICh0YXJnZXRIZWlnaHQgPiBNQVhfSEVJR0hUKSB7XG4gICAgICAgICAgICB0YXJnZXRXaWR0aCA9IE1hdGguZmxvb3IodGFyZ2V0V2lkdGggKiAoTUFYX0hFSUdIVCAvIHRhcmdldEhlaWdodCkpO1xuICAgICAgICAgICAgdGFyZ2V0SGVpZ2h0ID0gTUFYX0hFSUdIVDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFyZ2V0V2lkdGggPiBNQVhfV0lEVEgpIHtcbiAgICAgICAgICAgIHRhcmdldEhlaWdodCA9IE1hdGguZmxvb3IodGFyZ2V0SGVpZ2h0ICogKE1BWF9XSURUSCAvIHRhcmdldFdpZHRoKSk7XG4gICAgICAgICAgICB0YXJnZXRXaWR0aCA9IE1BWF9XSURUSDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHRhcmdldFdpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gdGFyZ2V0SGVpZ2h0O1xuICAgICAgICBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpLmRyYXdJbWFnZShlbGVtZW50LCAwLCAwLCB0YXJnZXRXaWR0aCwgdGFyZ2V0SGVpZ2h0KTtcbiAgICAgICAgY2FudmFzLnRvQmxvYihmdW5jdGlvbih0aHVtYm5haWwpIHtcbiAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgIGluZm86IHtcbiAgICAgICAgICAgICAgICAgICAgdGh1bWJuYWlsX2luZm86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHc6IHRhcmdldFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaDogdGFyZ2V0SGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWltZXR5cGU6IHRodW1ibmFpbC50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogdGh1bWJuYWlsLnNpemUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHc6IGlucHV0V2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGg6IGlucHV0SGVpZ2h0LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGh1bWJuYWlsOiB0aHVtYm5haWwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgbWltZVR5cGUpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIExvYWQgYSBmaWxlIGludG8gYSBuZXdseSBjcmVhdGVkIGltYWdlIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtGaWxlfSBpbWFnZUZpbGUgVGhlIGZpbGUgdG8gbG9hZCBpbiBhbiBpbWFnZSBlbGVtZW50LlxuICogQHJldHVybiB7UHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgaHRtbCBpbWFnZSBlbGVtZW50LlxuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkSW1hZ2VFbGVtZW50KGltYWdlRmlsZTogRmlsZSkge1xuICAgIC8vIExvYWQgdGhlIGZpbGUgaW50byBhbiBodG1sIGVsZW1lbnRcbiAgICBjb25zdCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgIGNvbnN0IG9iamVjdFVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoaW1hZ2VGaWxlKTtcbiAgICBjb25zdCBpbWdQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBpbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKG9iamVjdFVybCk7XG4gICAgICAgICAgICByZXNvbHZlKGltZyk7XG4gICAgICAgIH07XG4gICAgICAgIGltZy5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICB9O1xuICAgIH0pO1xuICAgIGltZy5zcmMgPSBvYmplY3RVcmw7XG5cbiAgICAvLyBjaGVjayBmb3IgaGktZHBpIFBOR3MgYW5kIGZ1ZGdlIGRpc3BsYXkgcmVzb2x1dGlvbiBhcyBuZWVkZWQuXG4gICAgLy8gdGhpcyBpcyBtYWlubHkgbmVlZGVkIGZvciBtYWNPUyBzY3JlZW5jYXBzXG4gICAgbGV0IHBhcnNlUHJvbWlzZTtcbiAgICBpZiAoaW1hZ2VGaWxlLnR5cGUgPT09IFwiaW1hZ2UvcG5nXCIpIHtcbiAgICAgICAgLy8gaW4gcHJhY3RpY2UgbWFjT1MgaGFwcGVucyB0byBvcmRlciB0aGUgY2h1bmtzIHNvIHRoZXkgZmFsbCBpblxuICAgICAgICAvLyB0aGUgZmlyc3QgMHgxMDAwIGJ5dGVzICh0aGFua3MgdG8gYSBtYXNzaXZlIElDQyBoZWFkZXIpLlxuICAgICAgICAvLyBUaHVzIHdlIGNvdWxkIHNsaWNlIHRoZSBmaWxlIGRvd24gdG8gb25seSBzbmlmZiB0aGUgZmlyc3QgMHgxMDAwXG4gICAgICAgIC8vIGJ5dGVzIChidXQgdGhpcyBtYWtlcyBleHRyYWN0UG5nQ2h1bmtzIGNob2tlIG9uIHRoZSBjb3JydXB0IGZpbGUpXG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBpbWFnZUZpbGU7IC8vLnNsaWNlKDAsIDB4MTAwMCk7XG4gICAgICAgIHBhcnNlUHJvbWlzZSA9IHJlYWRGaWxlQXNBcnJheUJ1ZmZlcihoZWFkZXJzKS50aGVuKGFycmF5QnVmZmVyID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKTtcbiAgICAgICAgICAgIGNvbnN0IGNodW5rcyA9IGV4dHJhY3RQbmdDaHVua3MoYnVmZmVyKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2h1bmsgb2YgY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNodW5rLm5hbWUgPT09ICdwSFlzJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2h1bmsuZGF0YS5ieXRlTGVuZ3RoICE9PSBQSFlTX0hJRFBJLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2h1bmsuZGF0YS5ldmVyeSgodmFsLCBpKSA9PiB2YWwgPT09IFBIWVNfSElEUElbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgW2hpZHBpXSA9IGF3YWl0IFByb21pc2UuYWxsKFtwYXJzZVByb21pc2UsIGltZ1Byb21pc2VdKTtcbiAgICBjb25zdCB3aWR0aCA9IGhpZHBpID8gKGltZy53aWR0aCA+PiAxKSA6IGltZy53aWR0aDtcbiAgICBjb25zdCBoZWlnaHQgPSBoaWRwaSA/IChpbWcuaGVpZ2h0ID4+IDEpIDogaW1nLmhlaWdodDtcbiAgICByZXR1cm4ge3dpZHRoLCBoZWlnaHQsIGltZ307XG59XG5cbi8qKlxuICogUmVhZCB0aGUgbWV0YWRhdGEgZm9yIGFuIGltYWdlIGZpbGUgYW5kIGNyZWF0ZSBhbmQgdXBsb2FkIGEgdGh1bWJuYWlsIG9mIHRoZSBpbWFnZS5cbiAqXG4gKiBAcGFyYW0ge01hdHJpeENsaWVudH0gbWF0cml4Q2xpZW50IEEgbWF0cml4Q2xpZW50IHRvIHVwbG9hZCB0aGUgdGh1bWJuYWlsIHdpdGguXG4gKiBAcGFyYW0ge1N0cmluZ30gcm9vbUlkIFRoZSBJRCBvZiB0aGUgcm9vbSB0aGUgaW1hZ2Ugd2lsbCBiZSB1cGxvYWRlZCBpbi5cbiAqIEBwYXJhbSB7RmlsZX0gaW1hZ2VGaWxlIFRoZSBpbWFnZSB0byByZWFkIGFuZCB0aHVtYm5haWwuXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBhdHRhY2htZW50IGluZm8uXG4gKi9cbmZ1bmN0aW9uIGluZm9Gb3JJbWFnZUZpbGUobWF0cml4Q2xpZW50LCByb29tSWQsIGltYWdlRmlsZSkge1xuICAgIGxldCB0aHVtYm5haWxUeXBlID0gXCJpbWFnZS9wbmdcIjtcbiAgICBpZiAoaW1hZ2VGaWxlLnR5cGUgPT09IFwiaW1hZ2UvanBlZ1wiKSB7XG4gICAgICAgIHRodW1ibmFpbFR5cGUgPSBcImltYWdlL2pwZWdcIjtcbiAgICB9XG5cbiAgICBsZXQgaW1hZ2VJbmZvO1xuICAgIHJldHVybiBsb2FkSW1hZ2VFbGVtZW50KGltYWdlRmlsZSkudGhlbihmdW5jdGlvbihyKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVUaHVtYm5haWwoci5pbWcsIHIud2lkdGgsIHIuaGVpZ2h0LCB0aHVtYm5haWxUeXBlKTtcbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICBpbWFnZUluZm8gPSByZXN1bHQuaW5mbztcbiAgICAgICAgcmV0dXJuIHVwbG9hZEZpbGUobWF0cml4Q2xpZW50LCByb29tSWQsIHJlc3VsdC50aHVtYm5haWwpO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgIGltYWdlSW5mby50aHVtYm5haWxfdXJsID0gcmVzdWx0LnVybDtcbiAgICAgICAgaW1hZ2VJbmZvLnRodW1ibmFpbF9maWxlID0gcmVzdWx0LmZpbGU7XG4gICAgICAgIHJldHVybiBpbWFnZUluZm87XG4gICAgfSk7XG59XG5cbi8qKlxuICogTG9hZCBhIGZpbGUgaW50byBhIG5ld2x5IGNyZWF0ZWQgdmlkZW8gZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge0ZpbGV9IHZpZGVvRmlsZSBUaGUgZmlsZSB0byBsb2FkIGluIGFuIHZpZGVvIGVsZW1lbnQuXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSB2aWRlbyBpbWFnZSBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBsb2FkVmlkZW9FbGVtZW50KHZpZGVvRmlsZSk6IFByb21pc2U8SFRNTFZpZGVvRWxlbWVudD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIC8vIExvYWQgdGhlIGZpbGUgaW50byBhbiBodG1sIGVsZW1lbnRcbiAgICAgICAgY29uc3QgdmlkZW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidmlkZW9cIik7XG5cbiAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgICAgIHZpZGVvLnNyYyA9IGV2LnRhcmdldC5yZXN1bHQgYXMgc3RyaW5nO1xuXG4gICAgICAgICAgICAvLyBPbmNlIHJlYWR5LCByZXR1cm5zIGl0cyBzaXplXG4gICAgICAgICAgICAvLyBXYWl0IHVudGlsIHdlIGhhdmUgZW5vdWdoIGRhdGEgdG8gdGh1bWJuYWlsIHRoZSBmaXJzdCBmcmFtZS5cbiAgICAgICAgICAgIHZpZGVvLm9ubG9hZGVkZGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUodmlkZW8pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZpZGVvLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgIH07XG4gICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKHZpZGVvRmlsZSk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogUmVhZCB0aGUgbWV0YWRhdGEgZm9yIGEgdmlkZW8gZmlsZSBhbmQgY3JlYXRlIGFuZCB1cGxvYWQgYSB0aHVtYm5haWwgb2YgdGhlIHZpZGVvLlxuICpcbiAqIEBwYXJhbSB7TWF0cml4Q2xpZW50fSBtYXRyaXhDbGllbnQgQSBtYXRyaXhDbGllbnQgdG8gdXBsb2FkIHRoZSB0aHVtYm5haWwgd2l0aC5cbiAqIEBwYXJhbSB7U3RyaW5nfSByb29tSWQgVGhlIElEIG9mIHRoZSByb29tIHRoZSB2aWRlbyB3aWxsIGJlIHVwbG9hZGVkIHRvLlxuICogQHBhcmFtIHtGaWxlfSB2aWRlb0ZpbGUgVGhlIHZpZGVvIHRvIHJlYWQgYW5kIHRodW1ibmFpbC5cbiAqIEByZXR1cm4ge1Byb21pc2V9IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIGF0dGFjaG1lbnQgaW5mby5cbiAqL1xuZnVuY3Rpb24gaW5mb0ZvclZpZGVvRmlsZShtYXRyaXhDbGllbnQsIHJvb21JZCwgdmlkZW9GaWxlKSB7XG4gICAgY29uc3QgdGh1bWJuYWlsVHlwZSA9IFwiaW1hZ2UvanBlZ1wiO1xuXG4gICAgbGV0IHZpZGVvSW5mbztcbiAgICByZXR1cm4gbG9hZFZpZGVvRWxlbWVudCh2aWRlb0ZpbGUpLnRoZW4oZnVuY3Rpb24odmlkZW8pIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVRodW1ibmFpbCh2aWRlbywgdmlkZW8udmlkZW9XaWR0aCwgdmlkZW8udmlkZW9IZWlnaHQsIHRodW1ibmFpbFR5cGUpO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgIHZpZGVvSW5mbyA9IHJlc3VsdC5pbmZvO1xuICAgICAgICByZXR1cm4gdXBsb2FkRmlsZShtYXRyaXhDbGllbnQsIHJvb21JZCwgcmVzdWx0LnRodW1ibmFpbCk7XG4gICAgfSkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgdmlkZW9JbmZvLnRodW1ibmFpbF91cmwgPSByZXN1bHQudXJsO1xuICAgICAgICB2aWRlb0luZm8udGh1bWJuYWlsX2ZpbGUgPSByZXN1bHQuZmlsZTtcbiAgICAgICAgcmV0dXJuIHZpZGVvSW5mbztcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBSZWFkIHRoZSBmaWxlIGFzIGFuIEFycmF5QnVmZmVyLlxuICogQHBhcmFtIHtGaWxlfSBmaWxlIFRoZSBmaWxlIHRvIHJlYWRcbiAqIEByZXR1cm4ge1Byb21pc2V9IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggYW4gQXJyYXlCdWZmZXIgd2hlbiB0aGUgZmlsZVxuICogICBpcyByZWFkLlxuICovXG5mdW5jdGlvbiByZWFkRmlsZUFzQXJyYXlCdWZmZXIoZmlsZTogRmlsZSB8IEJsb2IpOiBQcm9taXNlPEFycmF5QnVmZmVyPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHJlc29sdmUoZS50YXJnZXQucmVzdWx0IGFzIEFycmF5QnVmZmVyKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgIH07XG4gICAgICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihmaWxlKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBVcGxvYWQgdGhlIGZpbGUgdG8gdGhlIGNvbnRlbnQgcmVwb3NpdG9yeS5cbiAqIElmIHRoZSByb29tIGlzIGVuY3J5cHRlZCB0aGVuIGVuY3J5cHQgdGhlIGZpbGUgYmVmb3JlIHVwbG9hZGluZy5cbiAqXG4gKiBAcGFyYW0ge01hdHJpeENsaWVudH0gbWF0cml4Q2xpZW50IFRoZSBtYXRyaXggY2xpZW50IHRvIHVwbG9hZCB0aGUgZmlsZSB3aXRoLlxuICogQHBhcmFtIHtTdHJpbmd9IHJvb21JZCBUaGUgSUQgb2YgdGhlIHJvb20gYmVpbmcgdXBsb2FkZWQgdG8uXG4gKiBAcGFyYW0ge0ZpbGV9IGZpbGUgVGhlIGZpbGUgdG8gdXBsb2FkLlxuICogQHBhcmFtIHtGdW5jdGlvbj99IHByb2dyZXNzSGFuZGxlciBvcHRpb25hbCBjYWxsYmFjayB0byBiZSBjYWxsZWQgd2hlbiBhIGNodW5rIG9mXG4gKiAgICBkYXRhIGlzIHVwbG9hZGVkLlxuICogQHJldHVybiB7UHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCBhbiBvYmplY3QuXG4gKiAgSWYgdGhlIGZpbGUgaXMgdW5lbmNyeXB0ZWQgdGhlbiB0aGUgb2JqZWN0IHdpbGwgaGF2ZSBhIFwidXJsXCIga2V5LlxuICogIElmIHRoZSBmaWxlIGlzIGVuY3J5cHRlZCB0aGVuIHRoZSBvYmplY3Qgd2lsbCBoYXZlIGEgXCJmaWxlXCIga2V5LlxuICovXG5mdW5jdGlvbiB1cGxvYWRGaWxlKG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50LCByb29tSWQ6IHN0cmluZywgZmlsZTogRmlsZSB8IEJsb2IsIHByb2dyZXNzSGFuZGxlcj86IGFueSkge1xuICAgIGxldCBjYW5jZWxlZCA9IGZhbHNlO1xuICAgIGlmIChtYXRyaXhDbGllbnQuaXNSb29tRW5jcnlwdGVkKHJvb21JZCkpIHtcbiAgICAgICAgLy8gSWYgdGhlIHJvb20gaXMgZW5jcnlwdGVkIHRoZW4gZW5jcnlwdCB0aGUgZmlsZSBiZWZvcmUgdXBsb2FkaW5nIGl0LlxuICAgICAgICAvLyBGaXJzdCByZWFkIHRoZSBmaWxlIGludG8gbWVtb3J5LlxuICAgICAgICBsZXQgdXBsb2FkUHJvbWlzZTtcbiAgICAgICAgbGV0IGVuY3J5cHRJbmZvO1xuICAgICAgICBjb25zdCBwcm9tID0gcmVhZEZpbGVBc0FycmF5QnVmZmVyKGZpbGUpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgaWYgKGNhbmNlbGVkKSB0aHJvdyBuZXcgVXBsb2FkQ2FuY2VsZWRFcnJvcigpO1xuICAgICAgICAgICAgLy8gVGhlbiBlbmNyeXB0IHRoZSBmaWxlLlxuICAgICAgICAgICAgcmV0dXJuIGVuY3J5cHQuZW5jcnlwdEF0dGFjaG1lbnQoZGF0YSk7XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oZW5jcnlwdFJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKGNhbmNlbGVkKSB0aHJvdyBuZXcgVXBsb2FkQ2FuY2VsZWRFcnJvcigpO1xuICAgICAgICAgICAgLy8gUmVjb3JkIHRoZSBpbmZvcm1hdGlvbiBuZWVkZWQgdG8gZGVjcnlwdCB0aGUgYXR0YWNobWVudC5cbiAgICAgICAgICAgIGVuY3J5cHRJbmZvID0gZW5jcnlwdFJlc3VsdC5pbmZvO1xuICAgICAgICAgICAgLy8gUGFzcyB0aGUgZW5jcnlwdGVkIGRhdGEgYXMgYSBCbG9iIHRvIHRoZSB1cGxvYWRlci5cbiAgICAgICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbZW5jcnlwdFJlc3VsdC5kYXRhXSk7XG4gICAgICAgICAgICB1cGxvYWRQcm9taXNlID0gbWF0cml4Q2xpZW50LnVwbG9hZENvbnRlbnQoYmxvYiwge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzSGFuZGxlcjogcHJvZ3Jlc3NIYW5kbGVyLFxuICAgICAgICAgICAgICAgIGluY2x1ZGVGaWxlbmFtZTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB1cGxvYWRQcm9taXNlO1xuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHVybCkge1xuICAgICAgICAgICAgaWYgKGNhbmNlbGVkKSB0aHJvdyBuZXcgVXBsb2FkQ2FuY2VsZWRFcnJvcigpO1xuICAgICAgICAgICAgLy8gSWYgdGhlIGF0dGFjaG1lbnQgaXMgZW5jcnlwdGVkIHRoZW4gYnVuZGxlIHRoZSBVUkwgYWxvbmdcbiAgICAgICAgICAgIC8vIHdpdGggdGhlIGluZm9ybWF0aW9uIG5lZWRlZCB0byBkZWNyeXB0IHRoZSBhdHRhY2htZW50IGFuZFxuICAgICAgICAgICAgLy8gYWRkIGl0IHVuZGVyIGEgZmlsZSBrZXkuXG4gICAgICAgICAgICBlbmNyeXB0SW5mby51cmwgPSB1cmw7XG4gICAgICAgICAgICBpZiAoZmlsZS50eXBlKSB7XG4gICAgICAgICAgICAgICAgZW5jcnlwdEluZm8ubWltZXR5cGUgPSBmaWxlLnR5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1wiZmlsZVwiOiBlbmNyeXB0SW5mb307XG4gICAgICAgIH0pO1xuICAgICAgICAocHJvbSBhcyBJQWJvcnRhYmxlUHJvbWlzZTxhbnk+KS5hYm9ydCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNhbmNlbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh1cGxvYWRQcm9taXNlKSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY2FuY2VsVXBsb2FkKHVwbG9hZFByb21pc2UpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcHJvbTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBiYXNlUHJvbWlzZSA9IG1hdHJpeENsaWVudC51cGxvYWRDb250ZW50KGZpbGUsIHtcbiAgICAgICAgICAgIHByb2dyZXNzSGFuZGxlcjogcHJvZ3Jlc3NIYW5kbGVyLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcHJvbWlzZTEgPSBiYXNlUHJvbWlzZS50aGVuKGZ1bmN0aW9uKHVybCkge1xuICAgICAgICAgICAgaWYgKGNhbmNlbGVkKSB0aHJvdyBuZXcgVXBsb2FkQ2FuY2VsZWRFcnJvcigpO1xuICAgICAgICAgICAgLy8gSWYgdGhlIGF0dGFjaG1lbnQgaXNuJ3QgZW5jcnlwdGVkIHRoZW4gaW5jbHVkZSB0aGUgVVJMIGRpcmVjdGx5LlxuICAgICAgICAgICAgcmV0dXJuIHtcInVybFwiOiB1cmx9O1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvbWlzZTEuYWJvcnQgPSAoKSA9PiB7XG4gICAgICAgICAgICBjYW5jZWxlZCA9IHRydWU7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY2FuY2VsVXBsb2FkKGJhc2VQcm9taXNlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHByb21pc2UxO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGVudE1lc3NhZ2VzIHtcbiAgICBwcml2YXRlIGlucHJvZ3Jlc3M6IElVcGxvYWRbXSA9IFtdO1xuICAgIHByaXZhdGUgbWVkaWFDb25maWc6IElNZWRpYUNvbmZpZyA9IG51bGw7XG5cbiAgICBzZW5kU3RpY2tlckNvbnRlbnRUb1Jvb20odXJsOiBzdHJpbmcsIHJvb21JZDogc3RyaW5nLCBpbmZvOiBzdHJpbmcsIHRleHQ6IHN0cmluZywgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQpIHtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gQ291bnRseUFuYWx5dGljcy5nZXRUaW1lc3RhbXAoKTtcbiAgICAgICAgY29uc3QgcHJvbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZW5kU3RpY2tlck1lc3NhZ2Uocm9vbUlkLCB1cmwsIGluZm8sIHRleHQpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEZhaWxlZCB0byBzZW5kIGNvbnRlbnQgd2l0aCBVUkwgJHt1cmx9IHRvIHJvb20gJHtyb29tSWR9YCwgZSk7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9KTtcbiAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFja1NlbmRNZXNzYWdlKHN0YXJ0VGltZSwgcHJvbSwgcm9vbUlkLCBmYWxzZSwgZmFsc2UsIHttc2d0eXBlOiBcIm0uc3RpY2tlclwifSk7XG4gICAgICAgIHJldHVybiBwcm9tO1xuICAgIH1cblxuICAgIGdldFVwbG9hZExpbWl0KCkge1xuICAgICAgICBpZiAodGhpcy5tZWRpYUNvbmZpZyAhPT0gbnVsbCAmJiB0aGlzLm1lZGlhQ29uZmlnW1wibS51cGxvYWQuc2l6ZVwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tZWRpYUNvbmZpZ1tcIm0udXBsb2FkLnNpemVcIl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHNlbmRDb250ZW50TGlzdFRvUm9vbShmaWxlczogRmlsZVtdLCByb29tSWQ6IHN0cmluZywgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQpIHtcbiAgICAgICAgaWYgKG1hdHJpeENsaWVudC5pc0d1ZXN0KCkpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAncmVxdWlyZV9yZWdpc3RyYXRpb24nfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc1F1b3RpbmcgPSBCb29sZWFuKFJvb21WaWV3U3RvcmUuZ2V0UXVvdGluZ0V2ZW50KCkpO1xuICAgICAgICBpZiAoaXNRdW90aW5nKSB7XG4gICAgICAgICAgICBjb25zdCBRdWVzdGlvbkRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlF1ZXN0aW9uRGlhbG9nXCIpO1xuICAgICAgICAgICAgY29uc3Qge2ZpbmlzaGVkfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2c8W2Jvb2xlYW5dPignVXBsb2FkIFJlcGx5IFdhcm5pbmcnLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ1JlcGx5aW5nIFdpdGggRmlsZXMnKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2PntfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICdBdCB0aGlzIHRpbWUgaXQgaXMgbm90IHBvc3NpYmxlIHRvIHJlcGx5IHdpdGggYSBmaWxlLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdXb3VsZCB5b3UgbGlrZSB0byB1cGxvYWQgdGhpcyBmaWxlIHdpdGhvdXQgcmVwbHlpbmc/JyxcbiAgICAgICAgICAgICAgICAgICAgKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbEJ1dHRvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBidXR0b246IF90KFwiQ29udGludWVcIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IFtzaG91bGRVcGxvYWRdID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgICAgICBpZiAoIXNob3VsZFVwbG9hZCkgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLm1lZGlhQ29uZmlnKSB7IC8vIGhvdC1wYXRoIG9wdGltaXphdGlvbiB0byBub3QgZmxhc2ggYSBzcGlubmVyIGlmIHdlIGRvbid0IG5lZWQgdG9cbiAgICAgICAgICAgIGNvbnN0IG1vZGFsID0gTW9kYWwuY3JlYXRlRGlhbG9nKFNwaW5uZXIsIG51bGwsICdteF9EaWFsb2dfc3Bpbm5lcicpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5lbnN1cmVNZWRpYUNvbmZpZ0ZldGNoZWQoKTtcbiAgICAgICAgICAgIG1vZGFsLmNsb3NlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0b29CaWdGaWxlcyA9IFtdO1xuICAgICAgICBjb25zdCBva0ZpbGVzID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNGaWxlU2l6ZUFjY2VwdGFibGUoZmlsZXNbaV0pKSB7XG4gICAgICAgICAgICAgICAgb2tGaWxlcy5wdXNoKGZpbGVzW2ldKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdG9vQmlnRmlsZXMucHVzaChmaWxlc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodG9vQmlnRmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgVXBsb2FkRmFpbHVyZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlVwbG9hZEZhaWx1cmVEaWFsb2dcIik7XG4gICAgICAgICAgICBjb25zdCB7ZmluaXNoZWR9ID0gTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZzxbYm9vbGVhbl0+KCdVcGxvYWQgRmFpbHVyZScsICcnLCBVcGxvYWRGYWlsdXJlRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgYmFkRmlsZXM6IHRvb0JpZ0ZpbGVzLFxuICAgICAgICAgICAgICAgIHRvdGFsRmlsZXM6IGZpbGVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBjb250ZW50TWVzc2FnZXM6IHRoaXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IFtzaG91bGRDb250aW51ZV0gPSBhd2FpdCBmaW5pc2hlZDtcbiAgICAgICAgICAgIGlmICghc2hvdWxkQ29udGludWUpIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IFVwbG9hZENvbmZpcm1EaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5VcGxvYWRDb25maXJtRGlhbG9nXCIpO1xuICAgICAgICBsZXQgdXBsb2FkQWxsID0gZmFsc2U7XG4gICAgICAgIC8vIFByb21pc2UgdG8gY29tcGxldGUgYmVmb3JlIHNlbmRpbmcgbmV4dCBmaWxlIGludG8gcm9vbSwgdXNlZCBmb3Igc3luY2hyb25pc2F0aW9uIG9mIGZpbGUtc2VuZGluZ1xuICAgICAgICAvLyB0byBtYXRjaCB0aGUgb3JkZXIgdGhlIGZpbGVzIHdlcmUgc3BlY2lmaWVkIGluXG4gICAgICAgIGxldCBwcm9tQmVmb3JlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb2tGaWxlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgZmlsZSA9IG9rRmlsZXNbaV07XG4gICAgICAgICAgICBpZiAoIXVwbG9hZEFsbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHtmaW5pc2hlZH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nPFtib29sZWFuLCBib29sZWFuXT4oJ1VwbG9hZCBGaWxlcyBjb25maXJtYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAnJywgVXBsb2FkQ29uZmlybURpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJbmRleDogaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsRmlsZXM6IG9rRmlsZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgW3Nob3VsZENvbnRpbnVlLCBzaG91bGRVcGxvYWRBbGxdID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgICAgICAgICAgaWYgKCFzaG91bGRDb250aW51ZSkgYnJlYWs7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZFVwbG9hZEFsbCkge1xuICAgICAgICAgICAgICAgICAgICB1cGxvYWRBbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb21CZWZvcmUgPSB0aGlzLnNlbmRDb250ZW50VG9Sb29tKGZpbGUsIHJvb21JZCwgbWF0cml4Q2xpZW50LCBwcm9tQmVmb3JlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldEN1cnJlbnRVcGxvYWRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnByb2dyZXNzLmZpbHRlcih1ID0+ICF1LmNhbmNlbGVkKTtcbiAgICB9XG5cbiAgICBjYW5jZWxVcGxvYWQocHJvbWlzZTogUHJvbWlzZTxhbnk+KSB7XG4gICAgICAgIGxldCB1cGxvYWQ6IElVcGxvYWQ7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbnByb2dyZXNzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pbnByb2dyZXNzW2ldLnByb21pc2UgPT09IHByb21pc2UpIHtcbiAgICAgICAgICAgICAgICB1cGxvYWQgPSB0aGlzLmlucHJvZ3Jlc3NbaV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwbG9hZCkge1xuICAgICAgICAgICAgdXBsb2FkLmNhbmNlbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5jYW5jZWxVcGxvYWQodXBsb2FkLnByb21pc2UpO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFVwbG9hZENhbmNlbGVkUGF5bG9hZD4oe2FjdGlvbjogQWN0aW9uLlVwbG9hZENhbmNlbGVkLCB1cGxvYWR9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2VuZENvbnRlbnRUb1Jvb20oZmlsZTogRmlsZSwgcm9vbUlkOiBzdHJpbmcsIG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50LCBwcm9tQmVmb3JlOiBQcm9taXNlPGFueT4pIHtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gQ291bnRseUFuYWx5dGljcy5nZXRUaW1lc3RhbXAoKTtcbiAgICAgICAgY29uc3QgY29udGVudDogSUNvbnRlbnQgPSB7XG4gICAgICAgICAgICBib2R5OiBmaWxlLm5hbWUgfHwgJ0F0dGFjaG1lbnQnLFxuICAgICAgICAgICAgaW5mbzoge1xuICAgICAgICAgICAgICAgIHNpemU6IGZpbGUuc2l6ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtc2d0eXBlOiBcIlwiLCAvLyBzZXQgbGF0ZXJcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBpZiB3ZSBoYXZlIGEgbWltZSB0eXBlIGZvciB0aGUgZmlsZSwgYWRkIGl0IHRvIHRoZSBtZXNzYWdlIG1ldGFkYXRhXG4gICAgICAgIGlmIChmaWxlLnR5cGUpIHtcbiAgICAgICAgICAgIGNvbnRlbnQuaW5mby5taW1ldHlwZSA9IGZpbGUudHlwZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByb20gPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGZpbGUudHlwZS5pbmRleE9mKCdpbWFnZS8nKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQubXNndHlwZSA9ICdtLmltYWdlJztcbiAgICAgICAgICAgICAgICBpbmZvRm9ySW1hZ2VGaWxlKG1hdHJpeENsaWVudCwgcm9vbUlkLCBmaWxlKS50aGVuKChpbWFnZUluZm8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihjb250ZW50LmluZm8sIGltYWdlSW5mbyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9LCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50Lm1zZ3R5cGUgPSAnbS5maWxlJztcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmaWxlLnR5cGUuaW5kZXhPZignYXVkaW8vJykgPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb250ZW50Lm1zZ3R5cGUgPSAnbS5hdWRpbyc7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmaWxlLnR5cGUuaW5kZXhPZigndmlkZW8vJykgPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb250ZW50Lm1zZ3R5cGUgPSAnbS52aWRlbyc7XG4gICAgICAgICAgICAgICAgaW5mb0ZvclZpZGVvRmlsZShtYXRyaXhDbGllbnQsIHJvb21JZCwgZmlsZSkudGhlbigodmlkZW9JbmZvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oY29udGVudC5pbmZvLCB2aWRlb0luZm8pO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudC5tc2d0eXBlID0gJ20uZmlsZSc7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGVudC5tc2d0eXBlID0gJ20uZmlsZSc7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBjcmVhdGUgdGVtcG9yYXJ5IGFib3J0IGhhbmRsZXIgZm9yIGJlZm9yZSB0aGUgYWN0dWFsIHVwbG9hZCBnZXRzIHBhc3NlZCBvZmYgdG8ganMtc2RrXG4gICAgICAgIChwcm9tIGFzIElBYm9ydGFibGVQcm9taXNlPGFueT4pLmFib3J0ID0gKCkgPT4ge1xuICAgICAgICAgICAgdXBsb2FkLmNhbmNlbGVkID0gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB1cGxvYWQ6IElVcGxvYWQgPSB7XG4gICAgICAgICAgICBmaWxlTmFtZTogZmlsZS5uYW1lIHx8ICdBdHRhY2htZW50JyxcbiAgICAgICAgICAgIHJvb21JZDogcm9vbUlkLFxuICAgICAgICAgICAgdG90YWw6IGZpbGUuc2l6ZSxcbiAgICAgICAgICAgIGxvYWRlZDogMCxcbiAgICAgICAgICAgIHByb21pc2U6IHByb20sXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaW5wcm9ncmVzcy5wdXNoKHVwbG9hZCk7XG4gICAgICAgIGRpcy5kaXNwYXRjaDxVcGxvYWRTdGFydGVkUGF5bG9hZD4oe2FjdGlvbjogQWN0aW9uLlVwbG9hZFN0YXJ0ZWQsIHVwbG9hZH0pO1xuXG4gICAgICAgIC8vIEZvY3VzIHRoZSBjb21wb3NlciB2aWV3XG4gICAgICAgIGRpcy5maXJlKEFjdGlvbi5Gb2N1c0NvbXBvc2VyKTtcblxuICAgICAgICBmdW5jdGlvbiBvblByb2dyZXNzKGV2KSB7XG4gICAgICAgICAgICB1cGxvYWQudG90YWwgPSBldi50b3RhbDtcbiAgICAgICAgICAgIHVwbG9hZC5sb2FkZWQgPSBldi5sb2FkZWQ7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2g8VXBsb2FkUHJvZ3Jlc3NQYXlsb2FkPih7YWN0aW9uOiBBY3Rpb24uVXBsb2FkUHJvZ3Jlc3MsIHVwbG9hZH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVycm9yO1xuICAgICAgICByZXR1cm4gcHJvbS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHVwbG9hZC5jYW5jZWxlZCkgdGhyb3cgbmV3IFVwbG9hZENhbmNlbGVkRXJyb3IoKTtcbiAgICAgICAgICAgIC8vIFhYWDogdXBsb2FkLnByb21pc2UgbXVzdCBiZSB0aGUgcHJvbWlzZSB0aGF0XG4gICAgICAgICAgICAvLyBpcyByZXR1cm5lZCBieSB1cGxvYWRGaWxlIGFzIGl0IGhhcyBhbiBhYm9ydCgpXG4gICAgICAgICAgICAvLyBtZXRob2QgaGFja2VkIG9udG8gaXQuXG4gICAgICAgICAgICB1cGxvYWQucHJvbWlzZSA9IHVwbG9hZEZpbGUoXG4gICAgICAgICAgICAgICAgbWF0cml4Q2xpZW50LCByb29tSWQsIGZpbGUsIG9uUHJvZ3Jlc3MsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuIHVwbG9hZC5wcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgY29udGVudC5maWxlID0gcmVzdWx0LmZpbGU7XG4gICAgICAgICAgICAgICAgY29udGVudC51cmwgPSByZXN1bHQudXJsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gQXdhaXQgcHJldmlvdXMgbWVzc2FnZSBiZWluZyBzZW50IGludG8gdGhlIHJvb21cbiAgICAgICAgICAgIHJldHVybiBwcm9tQmVmb3JlO1xuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHVwbG9hZC5jYW5jZWxlZCkgdGhyb3cgbmV3IFVwbG9hZENhbmNlbGVkRXJyb3IoKTtcbiAgICAgICAgICAgIGNvbnN0IHByb20gPSBtYXRyaXhDbGllbnQuc2VuZE1lc3NhZ2Uocm9vbUlkLCBjb250ZW50KTtcbiAgICAgICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2tTZW5kTWVzc2FnZShzdGFydFRpbWUsIHByb20sIHJvb21JZCwgZmFsc2UsIGZhbHNlLCBjb250ZW50KTtcbiAgICAgICAgICAgIHJldHVybiBwcm9tO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGVycm9yID0gZXJyO1xuICAgICAgICAgICAgaWYgKCF1cGxvYWQuY2FuY2VsZWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgZGVzYyA9IF90KFwiVGhlIGZpbGUgJyUoZmlsZU5hbWUpcycgZmFpbGVkIHRvIHVwbG9hZC5cIiwge2ZpbGVOYW1lOiB1cGxvYWQuZmlsZU5hbWV9KTtcbiAgICAgICAgICAgICAgICBpZiAoZXJyLmh0dHBfc3RhdHVzID09PSA0MTMpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzYyA9IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJUaGUgZmlsZSAnJShmaWxlTmFtZSlzJyBleGNlZWRzIHRoaXMgaG9tZXNlcnZlcidzIHNpemUgbGltaXQgZm9yIHVwbG9hZHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHtmaWxlTmFtZTogdXBsb2FkLmZpbGVOYW1lfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdVcGxvYWQgZmFpbGVkJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnVXBsb2FkIEZhaWxlZCcpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzYyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaW5wcm9ncmVzcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlucHJvZ3Jlc3NbaV0ucHJvbWlzZSA9PT0gdXBsb2FkLnByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnByb2dyZXNzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgLy8gNDEzOiBGaWxlIHdhcyB0b28gYmlnIG9yIHVwc2V0IHRoZSBzZXJ2ZXIgaW4gc29tZSB3YXk6XG4gICAgICAgICAgICAgICAgLy8gY2xlYXIgdGhlIG1lZGlhIHNpemUgbGltaXQgc28gd2UgZmV0Y2ggaXQgYWdhaW4gbmV4dCB0aW1lXG4gICAgICAgICAgICAgICAgLy8gd2UgdHJ5IHRvIHVwbG9hZFxuICAgICAgICAgICAgICAgIGlmIChlcnJvciAmJiBlcnJvci5odHRwX3N0YXR1cyA9PT0gNDEzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVkaWFDb25maWcgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8VXBsb2FkRXJyb3JQYXlsb2FkPih7YWN0aW9uOiBBY3Rpb24uVXBsb2FkRmFpbGVkLCB1cGxvYWQsIGVycm9yfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxVcGxvYWRGaW5pc2hlZFBheWxvYWQ+KHthY3Rpb246IEFjdGlvbi5VcGxvYWRGaW5pc2hlZCwgdXBsb2FkfSk7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdtZXNzYWdlX3NlbnQnfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNGaWxlU2l6ZUFjY2VwdGFibGUoZmlsZTogRmlsZSkge1xuICAgICAgICBpZiAodGhpcy5tZWRpYUNvbmZpZyAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgdGhpcy5tZWRpYUNvbmZpZ1tcIm0udXBsb2FkLnNpemVcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgZmlsZS5zaXplID4gdGhpcy5tZWRpYUNvbmZpZ1tcIm0udXBsb2FkLnNpemVcIl0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGVuc3VyZU1lZGlhQ29uZmlnRmV0Y2hlZCgpIHtcbiAgICAgICAgaWYgKHRoaXMubWVkaWFDb25maWcgIT09IG51bGwpIHJldHVybjtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIltNZWRpYSBDb25maWddIEZldGNoaW5nXCIpO1xuICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldE1lZGlhQ29uZmlnKCkudGhlbigoY29uZmlnKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltNZWRpYSBDb25maWddIEZldGNoZWQgY29uZmlnOlwiLCBjb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgLy8gTWVkaWEgcmVwbyBjYW4ndCBvciB3b24ndCByZXBvcnQgbGltaXRzLCBzbyBwcm92aWRlIGFuIGVtcHR5IG9iamVjdCAobm8gbGltaXRzKS5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW01lZGlhIENvbmZpZ10gQ291bGQgbm90IGZldGNoIGNvbmZpZywgc28gbm90IGxpbWl0aW5nIHVwbG9hZHMuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9KS50aGVuKChjb25maWcpID0+IHtcbiAgICAgICAgICAgIHRoaXMubWVkaWFDb25maWcgPSBjb25maWc7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBzaGFyZWRJbnN0YW5jZSgpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5teENvbnRlbnRNZXNzYWdlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB3aW5kb3cubXhDb250ZW50TWVzc2FnZXMgPSBuZXcgQ29udGVudE1lc3NhZ2VzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHdpbmRvdy5teENvbnRlbnRNZXNzYWdlcztcbiAgICB9XG59XG4iXX0=