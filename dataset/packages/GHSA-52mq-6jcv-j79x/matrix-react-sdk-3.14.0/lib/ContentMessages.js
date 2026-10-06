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
        action: 'upload_canceled',
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
      action: 'upload_started'
    }); // Focus the composer view


    _dispatcher.default.fire(_actions.Action.FocusComposer);

    function onProgress(ev) {
      upload.total = ev.total;
      upload.loaded = ev.loaded;

      _dispatcher.default.dispatch({
        action: 'upload_progress',
        upload: upload
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
          action: 'upload_failed',
          upload,
          error
        });
      } else {
        _dispatcher.default.dispatch({
          action: 'upload_finished',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Db250ZW50TWVzc2FnZXMudHN4Il0sIm5hbWVzIjpbIk1BWF9XSURUSCIsIk1BWF9IRUlHSFQiLCJQSFlTX0hJRFBJIiwiVXBsb2FkQ2FuY2VsZWRFcnJvciIsIkVycm9yIiwiY3JlYXRlVGh1bWJuYWlsIiwiZWxlbWVudCIsImlucHV0V2lkdGgiLCJpbnB1dEhlaWdodCIsIm1pbWVUeXBlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJ0YXJnZXRXaWR0aCIsInRhcmdldEhlaWdodCIsIk1hdGgiLCJmbG9vciIsImNhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIndpZHRoIiwiaGVpZ2h0IiwiZ2V0Q29udGV4dCIsImRyYXdJbWFnZSIsInRvQmxvYiIsInRodW1ibmFpbCIsImluZm8iLCJ0aHVtYm5haWxfaW5mbyIsInciLCJoIiwibWltZXR5cGUiLCJ0eXBlIiwic2l6ZSIsImxvYWRJbWFnZUVsZW1lbnQiLCJpbWFnZUZpbGUiLCJpbWciLCJvYmplY3RVcmwiLCJVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJpbWdQcm9taXNlIiwicmVqZWN0Iiwib25sb2FkIiwicmV2b2tlT2JqZWN0VVJMIiwib25lcnJvciIsImUiLCJzcmMiLCJwYXJzZVByb21pc2UiLCJoZWFkZXJzIiwicmVhZEZpbGVBc0FycmF5QnVmZmVyIiwidGhlbiIsImFycmF5QnVmZmVyIiwiYnVmZmVyIiwiVWludDhBcnJheSIsImNodW5rcyIsImNodW5rIiwibmFtZSIsImRhdGEiLCJieXRlTGVuZ3RoIiwibGVuZ3RoIiwiZXZlcnkiLCJ2YWwiLCJpIiwiaGlkcGkiLCJhbGwiLCJpbmZvRm9ySW1hZ2VGaWxlIiwibWF0cml4Q2xpZW50Iiwicm9vbUlkIiwidGh1bWJuYWlsVHlwZSIsImltYWdlSW5mbyIsInIiLCJyZXN1bHQiLCJ1cGxvYWRGaWxlIiwidGh1bWJuYWlsX3VybCIsInVybCIsInRodW1ibmFpbF9maWxlIiwiZmlsZSIsImxvYWRWaWRlb0VsZW1lbnQiLCJ2aWRlb0ZpbGUiLCJ2aWRlbyIsInJlYWRlciIsIkZpbGVSZWFkZXIiLCJldiIsInRhcmdldCIsIm9ubG9hZGVkZGF0YSIsInJlYWRBc0RhdGFVUkwiLCJpbmZvRm9yVmlkZW9GaWxlIiwidmlkZW9JbmZvIiwidmlkZW9XaWR0aCIsInZpZGVvSGVpZ2h0IiwicmVhZEFzQXJyYXlCdWZmZXIiLCJwcm9ncmVzc0hhbmRsZXIiLCJjYW5jZWxlZCIsImlzUm9vbUVuY3J5cHRlZCIsInVwbG9hZFByb21pc2UiLCJlbmNyeXB0SW5mbyIsInByb20iLCJlbmNyeXB0IiwiZW5jcnlwdEF0dGFjaG1lbnQiLCJlbmNyeXB0UmVzdWx0IiwiYmxvYiIsIkJsb2IiLCJ1cGxvYWRDb250ZW50IiwiaW5jbHVkZUZpbGVuYW1lIiwiYWJvcnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJjYW5jZWxVcGxvYWQiLCJiYXNlUHJvbWlzZSIsInByb21pc2UxIiwiQ29udGVudE1lc3NhZ2VzIiwic2VuZFN0aWNrZXJDb250ZW50VG9Sb29tIiwidGV4dCIsInN0YXJ0VGltZSIsIkNvdW50bHlBbmFseXRpY3MiLCJnZXRUaW1lc3RhbXAiLCJzZW5kU3RpY2tlck1lc3NhZ2UiLCJjYXRjaCIsImNvbnNvbGUiLCJ3YXJuIiwiaW5zdGFuY2UiLCJ0cmFja1NlbmRNZXNzYWdlIiwibXNndHlwZSIsImdldFVwbG9hZExpbWl0IiwibWVkaWFDb25maWciLCJ1bmRlZmluZWQiLCJzZW5kQ29udGVudExpc3RUb1Jvb20iLCJmaWxlcyIsImlzR3Vlc3QiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsImlzUXVvdGluZyIsIkJvb2xlYW4iLCJSb29tVmlld1N0b3JlIiwiZ2V0UXVvdGluZ0V2ZW50IiwiUXVlc3Rpb25EaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJmaW5pc2hlZCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJoYXNDYW5jZWxCdXR0b24iLCJidXR0b24iLCJzaG91bGRVcGxvYWQiLCJtb2RhbCIsImNyZWF0ZURpYWxvZyIsIlNwaW5uZXIiLCJlbnN1cmVNZWRpYUNvbmZpZ0ZldGNoZWQiLCJjbG9zZSIsInRvb0JpZ0ZpbGVzIiwib2tGaWxlcyIsImlzRmlsZVNpemVBY2NlcHRhYmxlIiwicHVzaCIsIlVwbG9hZEZhaWx1cmVEaWFsb2ciLCJiYWRGaWxlcyIsInRvdGFsRmlsZXMiLCJjb250ZW50TWVzc2FnZXMiLCJzaG91bGRDb250aW51ZSIsIlVwbG9hZENvbmZpcm1EaWFsb2ciLCJ1cGxvYWRBbGwiLCJwcm9tQmVmb3JlIiwiY3VycmVudEluZGV4Iiwic2hvdWxkVXBsb2FkQWxsIiwic2VuZENvbnRlbnRUb1Jvb20iLCJnZXRDdXJyZW50VXBsb2FkcyIsImlucHJvZ3Jlc3MiLCJmaWx0ZXIiLCJ1IiwicHJvbWlzZSIsInVwbG9hZCIsImNvbnRlbnQiLCJib2R5IiwiaW5kZXhPZiIsIk9iamVjdCIsImFzc2lnbiIsImVycm9yIiwiZmlsZU5hbWUiLCJ0b3RhbCIsImxvYWRlZCIsImZpcmUiLCJBY3Rpb24iLCJGb2N1c0NvbXBvc2VyIiwib25Qcm9ncmVzcyIsInNlbmRNZXNzYWdlIiwiZXJyIiwiZGVzYyIsImh0dHBfc3RhdHVzIiwiRXJyb3JEaWFsb2ciLCJmaW5hbGx5Iiwic3BsaWNlIiwibG9nIiwiZ2V0TWVkaWFDb25maWciLCJjb25maWciLCJzaGFyZWRJbnN0YW5jZSIsIndpbmRvdyIsIm14Q29udGVudE1lc3NhZ2VzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOztBQWpDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBY0E7QUFLQSxNQUFNQSxTQUFTLEdBQUcsR0FBbEI7QUFDQSxNQUFNQyxVQUFVLEdBQUcsR0FB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Q0FBQ0MsaUJBQWQ7QUFDSDs7QUFuUmdDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgZGlzIGZyb20gJy4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQge01hdHJpeENsaWVudH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi9Nb2RhbCc7XG5pbXBvcnQgUm9vbVZpZXdTdG9yZSBmcm9tICcuL3N0b3Jlcy9Sb29tVmlld1N0b3JlJztcbmltcG9ydCBlbmNyeXB0IGZyb20gXCJicm93c2VyLWVuY3J5cHQtYXR0YWNobWVudFwiO1xuaW1wb3J0IGV4dHJhY3RQbmdDaHVua3MgZnJvbSBcInBuZy1jaHVua3MtZXh0cmFjdFwiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9TcGlubmVyXCI7XG5cbi8vIFBvbHlmaWxsIGZvciBDYW52YXMudG9CbG9iIEFQSSB1c2luZyBDYW52YXMudG9EYXRhVVJMXG5pbXBvcnQgXCJibHVlaW1wLWNhbnZhcy10by1ibG9iXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCBDb3VudGx5QW5hbHl0aWNzIGZyb20gXCIuL0NvdW50bHlBbmFseXRpY3NcIjtcblxuY29uc3QgTUFYX1dJRFRIID0gODAwO1xuY29uc3QgTUFYX0hFSUdIVCA9IDYwMDtcblxuLy8gc2NyYXBlZCBvdXQgb2YgYSBtYWNPUyBoaWRwaSAoNTY2MHBwbSkgc2NyZWVuc2hvdCBwbmdcbi8vICAgICAgICAgICAgICAgICAgNTY2OSBweCAoeC1heGlzKSAgICAgICwgNTY2OSBweCAoeS1heGlzKSAgICAgICwgcGVyIG1ldHJlXG5jb25zdCBQSFlTX0hJRFBJID0gWzB4MDAsIDB4MDAsIDB4MTYsIDB4MjUsIDB4MDAsIDB4MDAsIDB4MTYsIDB4MjUsIDB4MDFdO1xuXG5leHBvcnQgY2xhc3MgVXBsb2FkQ2FuY2VsZWRFcnJvciBleHRlbmRzIEVycm9yIHt9XG5cbnR5cGUgVGh1bWJuYWlsYWJsZUVsZW1lbnQgPSBIVE1MSW1hZ2VFbGVtZW50IHwgSFRNTFZpZGVvRWxlbWVudDtcblxuaW50ZXJmYWNlIElVcGxvYWQge1xuICAgIGZpbGVOYW1lOiBzdHJpbmc7XG4gICAgcm9vbUlkOiBzdHJpbmc7XG4gICAgdG90YWw6IG51bWJlcjtcbiAgICBsb2FkZWQ6IG51bWJlcjtcbiAgICBwcm9taXNlOiBQcm9taXNlPGFueT47XG4gICAgY2FuY2VsZWQ/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSU1lZGlhQ29uZmlnIHtcbiAgICBcIm0udXBsb2FkLnNpemVcIj86IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIElDb250ZW50IHtcbiAgICBib2R5OiBzdHJpbmc7XG4gICAgbXNndHlwZTogc3RyaW5nO1xuICAgIGluZm86IHtcbiAgICAgICAgc2l6ZTogbnVtYmVyO1xuICAgICAgICBtaW1ldHlwZT86IHN0cmluZztcbiAgICB9O1xuICAgIGZpbGU/OiBzdHJpbmc7XG4gICAgdXJsPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVRodW1ibmFpbCB7XG4gICAgaW5mbzoge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIHRodW1ibmFpbF9pbmZvOiB7XG4gICAgICAgICAgICB3OiBudW1iZXI7XG4gICAgICAgICAgICBoOiBudW1iZXI7XG4gICAgICAgICAgICBtaW1ldHlwZTogc3RyaW5nO1xuICAgICAgICAgICAgc2l6ZTogbnVtYmVyO1xuICAgICAgICB9O1xuICAgICAgICB3OiBudW1iZXI7XG4gICAgICAgIGg6IG51bWJlcjtcbiAgICB9O1xuICAgIHRodW1ibmFpbDogQmxvYjtcbn1cblxuaW50ZXJmYWNlIElBYm9ydGFibGVQcm9taXNlPFQ+IGV4dGVuZHMgUHJvbWlzZTxUPiB7XG4gICAgYWJvcnQoKTogdm9pZDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSB0aHVtYm5haWwgZm9yIGEgaW1hZ2UgRE9NIGVsZW1lbnQuXG4gKiBUaGUgaW1hZ2Ugd2lsbCBiZSBzbWFsbGVyIHRoYW4gTUFYX1dJRFRIIGFuZCBNQVhfSEVJR0hULlxuICogVGhlIHRodW1ibmFpbCB3aWxsIGhhdmUgdGhlIHNhbWUgYXNwZWN0IHJhdGlvIGFzIHRoZSBvcmlnaW5hbC5cbiAqIERyYXdzIHRoZSBlbGVtZW50IGludG8gYSBjYW52YXMgdXNpbmcgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELmRyYXdJbWFnZVxuICogVGhlbiBjYWxscyBDYW52YXMudG9CbG9iIHRvIGdldCBhIGJsb2Igb2JqZWN0IGZvciB0aGUgaW1hZ2UgZGF0YS5cbiAqXG4gKiBTaW5jZSBpdCBuZWVkcyB0byBjYWxjdWxhdGUgdGhlIGRpbWVuc2lvbnMgb2YgdGhlIHNvdXJjZSBpbWFnZSBhbmQgdGhlXG4gKiB0aHVtYm5haWxlZCBpbWFnZSBpdCByZXR1cm5zIGFuIGluZm8gb2JqZWN0IGZpbGxlZCBvdXQgd2l0aCBpbmZvcm1hdGlvblxuICogYWJvdXQgdGhlIG9yaWdpbmFsIGltYWdlIGFuZCB0aGUgdGh1bWJuYWlsLlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gdGh1bWJuYWlsLlxuICogQHBhcmFtIHtudW1iZXJ9IGlucHV0V2lkdGggVGhlIHdpZHRoIG9mIHRoZSBpbWFnZSBpbiB0aGUgaW5wdXQgZWxlbWVudC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBpbnB1dEhlaWdodCB0aGUgd2lkdGggb2YgdGhlIGltYWdlIGluIHRoZSBpbnB1dCBlbGVtZW50LlxuICogQHBhcmFtIHtTdHJpbmd9IG1pbWVUeXBlIFRoZSBtaW1lVHlwZSB0byBzYXZlIHRoZSBibG9iIGFzLlxuICogQHJldHVybiB7UHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCBhbiBvYmplY3Qgd2l0aCBhbiBpbmZvIGtleVxuICogIGFuZCBhIHRodW1ibmFpbCBrZXkuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVRodW1ibmFpbChcbiAgICBlbGVtZW50OiBUaHVtYm5haWxhYmxlRWxlbWVudCxcbiAgICBpbnB1dFdpZHRoOiBudW1iZXIsXG4gICAgaW5wdXRIZWlnaHQ6IG51bWJlcixcbiAgICBtaW1lVHlwZTogc3RyaW5nLFxuKTogUHJvbWlzZTxJVGh1bWJuYWlsPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGxldCB0YXJnZXRXaWR0aCA9IGlucHV0V2lkdGg7XG4gICAgICAgIGxldCB0YXJnZXRIZWlnaHQgPSBpbnB1dEhlaWdodDtcbiAgICAgICAgaWYgKHRhcmdldEhlaWdodCA+IE1BWF9IRUlHSFQpIHtcbiAgICAgICAgICAgIHRhcmdldFdpZHRoID0gTWF0aC5mbG9vcih0YXJnZXRXaWR0aCAqIChNQVhfSEVJR0hUIC8gdGFyZ2V0SGVpZ2h0KSk7XG4gICAgICAgICAgICB0YXJnZXRIZWlnaHQgPSBNQVhfSEVJR0hUO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YXJnZXRXaWR0aCA+IE1BWF9XSURUSCkge1xuICAgICAgICAgICAgdGFyZ2V0SGVpZ2h0ID0gTWF0aC5mbG9vcih0YXJnZXRIZWlnaHQgKiAoTUFYX1dJRFRIIC8gdGFyZ2V0V2lkdGgpKTtcbiAgICAgICAgICAgIHRhcmdldFdpZHRoID0gTUFYX1dJRFRIO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgICAgY2FudmFzLndpZHRoID0gdGFyZ2V0V2lkdGg7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSB0YXJnZXRIZWlnaHQ7XG4gICAgICAgIGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIikuZHJhd0ltYWdlKGVsZW1lbnQsIDAsIDAsIHRhcmdldFdpZHRoLCB0YXJnZXRIZWlnaHQpO1xuICAgICAgICBjYW52YXMudG9CbG9iKGZ1bmN0aW9uKHRodW1ibmFpbCkge1xuICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgaW5mbzoge1xuICAgICAgICAgICAgICAgICAgICB0aHVtYm5haWxfaW5mbzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdzogdGFyZ2V0V2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBoOiB0YXJnZXRIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW1ldHlwZTogdGh1bWJuYWlsLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiB0aHVtYm5haWwuc2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdzogaW5wdXRXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaDogaW5wdXRIZWlnaHQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aHVtYm5haWw6IHRodW1ibmFpbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBtaW1lVHlwZSk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogTG9hZCBhIGZpbGUgaW50byBhIG5ld2x5IGNyZWF0ZWQgaW1hZ2UgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge0ZpbGV9IGltYWdlRmlsZSBUaGUgZmlsZSB0byBsb2FkIGluIGFuIGltYWdlIGVsZW1lbnQuXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBodG1sIGltYWdlIGVsZW1lbnQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRJbWFnZUVsZW1lbnQoaW1hZ2VGaWxlOiBGaWxlKSB7XG4gICAgLy8gTG9hZCB0aGUgZmlsZSBpbnRvIGFuIGh0bWwgZWxlbWVudFxuICAgIGNvbnN0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgY29uc3Qgb2JqZWN0VXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChpbWFnZUZpbGUpO1xuICAgIGNvbnN0IGltZ1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwob2JqZWN0VXJsKTtcbiAgICAgICAgICAgIHJlc29sdmUoaW1nKTtcbiAgICAgICAgfTtcbiAgICAgICAgaW1nLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgaW1nLnNyYyA9IG9iamVjdFVybDtcblxuICAgIC8vIGNoZWNrIGZvciBoaS1kcGkgUE5HcyBhbmQgZnVkZ2UgZGlzcGxheSByZXNvbHV0aW9uIGFzIG5lZWRlZC5cbiAgICAvLyB0aGlzIGlzIG1haW5seSBuZWVkZWQgZm9yIG1hY09TIHNjcmVlbmNhcHNcbiAgICBsZXQgcGFyc2VQcm9taXNlO1xuICAgIGlmIChpbWFnZUZpbGUudHlwZSA9PT0gXCJpbWFnZS9wbmdcIikge1xuICAgICAgICAvLyBpbiBwcmFjdGljZSBtYWNPUyBoYXBwZW5zIHRvIG9yZGVyIHRoZSBjaHVua3Mgc28gdGhleSBmYWxsIGluXG4gICAgICAgIC8vIHRoZSBmaXJzdCAweDEwMDAgYnl0ZXMgKHRoYW5rcyB0byBhIG1hc3NpdmUgSUNDIGhlYWRlcikuXG4gICAgICAgIC8vIFRodXMgd2UgY291bGQgc2xpY2UgdGhlIGZpbGUgZG93biB0byBvbmx5IHNuaWZmIHRoZSBmaXJzdCAweDEwMDBcbiAgICAgICAgLy8gYnl0ZXMgKGJ1dCB0aGlzIG1ha2VzIGV4dHJhY3RQbmdDaHVua3MgY2hva2Ugb24gdGhlIGNvcnJ1cHQgZmlsZSlcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IGltYWdlRmlsZTsgLy8uc2xpY2UoMCwgMHgxMDAwKTtcbiAgICAgICAgcGFyc2VQcm9taXNlID0gcmVhZEZpbGVBc0FycmF5QnVmZmVyKGhlYWRlcnMpLnRoZW4oYXJyYXlCdWZmZXIgPT4ge1xuICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpO1xuICAgICAgICAgICAgY29uc3QgY2h1bmtzID0gZXh0cmFjdFBuZ0NodW5rcyhidWZmZXIpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaHVuayBvZiBjaHVua3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2h1bmsubmFtZSA9PT0gJ3BIWXMnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaHVuay5kYXRhLmJ5dGVMZW5ndGggIT09IFBIWVNfSElEUEkubGVuZ3RoKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjaHVuay5kYXRhLmV2ZXJ5KCh2YWwsIGkpID0+IHZhbCA9PT0gUEhZU19ISURQSVtpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBbaGlkcGldID0gYXdhaXQgUHJvbWlzZS5hbGwoW3BhcnNlUHJvbWlzZSwgaW1nUHJvbWlzZV0pO1xuICAgIGNvbnN0IHdpZHRoID0gaGlkcGkgPyAoaW1nLndpZHRoID4+IDEpIDogaW1nLndpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IGhpZHBpID8gKGltZy5oZWlnaHQgPj4gMSkgOiBpbWcuaGVpZ2h0O1xuICAgIHJldHVybiB7d2lkdGgsIGhlaWdodCwgaW1nfTtcbn1cblxuLyoqXG4gKiBSZWFkIHRoZSBtZXRhZGF0YSBmb3IgYW4gaW1hZ2UgZmlsZSBhbmQgY3JlYXRlIGFuZCB1cGxvYWQgYSB0aHVtYm5haWwgb2YgdGhlIGltYWdlLlxuICpcbiAqIEBwYXJhbSB7TWF0cml4Q2xpZW50fSBtYXRyaXhDbGllbnQgQSBtYXRyaXhDbGllbnQgdG8gdXBsb2FkIHRoZSB0aHVtYm5haWwgd2l0aC5cbiAqIEBwYXJhbSB7U3RyaW5nfSByb29tSWQgVGhlIElEIG9mIHRoZSByb29tIHRoZSBpbWFnZSB3aWxsIGJlIHVwbG9hZGVkIGluLlxuICogQHBhcmFtIHtGaWxlfSBpbWFnZUZpbGUgVGhlIGltYWdlIHRvIHJlYWQgYW5kIHRodW1ibmFpbC5cbiAqIEByZXR1cm4ge1Byb21pc2V9IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIGF0dGFjaG1lbnQgaW5mby5cbiAqL1xuZnVuY3Rpb24gaW5mb0ZvckltYWdlRmlsZShtYXRyaXhDbGllbnQsIHJvb21JZCwgaW1hZ2VGaWxlKSB7XG4gICAgbGV0IHRodW1ibmFpbFR5cGUgPSBcImltYWdlL3BuZ1wiO1xuICAgIGlmIChpbWFnZUZpbGUudHlwZSA9PT0gXCJpbWFnZS9qcGVnXCIpIHtcbiAgICAgICAgdGh1bWJuYWlsVHlwZSA9IFwiaW1hZ2UvanBlZ1wiO1xuICAgIH1cblxuICAgIGxldCBpbWFnZUluZm87XG4gICAgcmV0dXJuIGxvYWRJbWFnZUVsZW1lbnQoaW1hZ2VGaWxlKS50aGVuKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVRodW1ibmFpbChyLmltZywgci53aWR0aCwgci5oZWlnaHQsIHRodW1ibmFpbFR5cGUpO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgIGltYWdlSW5mbyA9IHJlc3VsdC5pbmZvO1xuICAgICAgICByZXR1cm4gdXBsb2FkRmlsZShtYXRyaXhDbGllbnQsIHJvb21JZCwgcmVzdWx0LnRodW1ibmFpbCk7XG4gICAgfSkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgaW1hZ2VJbmZvLnRodW1ibmFpbF91cmwgPSByZXN1bHQudXJsO1xuICAgICAgICBpbWFnZUluZm8udGh1bWJuYWlsX2ZpbGUgPSByZXN1bHQuZmlsZTtcbiAgICAgICAgcmV0dXJuIGltYWdlSW5mbztcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBMb2FkIGEgZmlsZSBpbnRvIGEgbmV3bHkgY3JlYXRlZCB2aWRlbyBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7RmlsZX0gdmlkZW9GaWxlIFRoZSBmaWxlIHRvIGxvYWQgaW4gYW4gdmlkZW8gZWxlbWVudC5cbiAqIEByZXR1cm4ge1Byb21pc2V9IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIHZpZGVvIGltYWdlIGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGxvYWRWaWRlb0VsZW1lbnQodmlkZW9GaWxlKTogUHJvbWlzZTxIVE1MVmlkZW9FbGVtZW50PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgLy8gTG9hZCB0aGUgZmlsZSBpbnRvIGFuIGh0bWwgZWxlbWVudFxuICAgICAgICBjb25zdCB2aWRlbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ2aWRlb1wiKTtcblxuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihldikge1xuICAgICAgICAgICAgdmlkZW8uc3JjID0gZXYudGFyZ2V0LnJlc3VsdCBhcyBzdHJpbmc7XG5cbiAgICAgICAgICAgIC8vIE9uY2UgcmVhZHksIHJldHVybnMgaXRzIHNpemVcbiAgICAgICAgICAgIC8vIFdhaXQgdW50aWwgd2UgaGF2ZSBlbm91Z2ggZGF0YSB0byB0aHVtYm5haWwgdGhlIGZpcnN0IGZyYW1lLlxuICAgICAgICAgICAgdmlkZW8ub25sb2FkZWRkYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh2aWRlbyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmlkZW8ub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwodmlkZW9GaWxlKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBSZWFkIHRoZSBtZXRhZGF0YSBmb3IgYSB2aWRlbyBmaWxlIGFuZCBjcmVhdGUgYW5kIHVwbG9hZCBhIHRodW1ibmFpbCBvZiB0aGUgdmlkZW8uXG4gKlxuICogQHBhcmFtIHtNYXRyaXhDbGllbnR9IG1hdHJpeENsaWVudCBBIG1hdHJpeENsaWVudCB0byB1cGxvYWQgdGhlIHRodW1ibmFpbCB3aXRoLlxuICogQHBhcmFtIHtTdHJpbmd9IHJvb21JZCBUaGUgSUQgb2YgdGhlIHJvb20gdGhlIHZpZGVvIHdpbGwgYmUgdXBsb2FkZWQgdG8uXG4gKiBAcGFyYW0ge0ZpbGV9IHZpZGVvRmlsZSBUaGUgdmlkZW8gdG8gcmVhZCBhbmQgdGh1bWJuYWlsLlxuICogQHJldHVybiB7UHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgYXR0YWNobWVudCBpbmZvLlxuICovXG5mdW5jdGlvbiBpbmZvRm9yVmlkZW9GaWxlKG1hdHJpeENsaWVudCwgcm9vbUlkLCB2aWRlb0ZpbGUpIHtcbiAgICBjb25zdCB0aHVtYm5haWxUeXBlID0gXCJpbWFnZS9qcGVnXCI7XG5cbiAgICBsZXQgdmlkZW9JbmZvO1xuICAgIHJldHVybiBsb2FkVmlkZW9FbGVtZW50KHZpZGVvRmlsZSkudGhlbihmdW5jdGlvbih2aWRlbykge1xuICAgICAgICByZXR1cm4gY3JlYXRlVGh1bWJuYWlsKHZpZGVvLCB2aWRlby52aWRlb1dpZHRoLCB2aWRlby52aWRlb0hlaWdodCwgdGh1bWJuYWlsVHlwZSk7XG4gICAgfSkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgdmlkZW9JbmZvID0gcmVzdWx0LmluZm87XG4gICAgICAgIHJldHVybiB1cGxvYWRGaWxlKG1hdHJpeENsaWVudCwgcm9vbUlkLCByZXN1bHQudGh1bWJuYWlsKTtcbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICB2aWRlb0luZm8udGh1bWJuYWlsX3VybCA9IHJlc3VsdC51cmw7XG4gICAgICAgIHZpZGVvSW5mby50aHVtYm5haWxfZmlsZSA9IHJlc3VsdC5maWxlO1xuICAgICAgICByZXR1cm4gdmlkZW9JbmZvO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFJlYWQgdGhlIGZpbGUgYXMgYW4gQXJyYXlCdWZmZXIuXG4gKiBAcGFyYW0ge0ZpbGV9IGZpbGUgVGhlIGZpbGUgdG8gcmVhZFxuICogQHJldHVybiB7UHJvbWlzZX0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCBhbiBBcnJheUJ1ZmZlciB3aGVuIHRoZSBmaWxlXG4gKiAgIGlzIHJlYWQuXG4gKi9cbmZ1bmN0aW9uIHJlYWRGaWxlQXNBcnJheUJ1ZmZlcihmaWxlOiBGaWxlIHwgQmxvYik6IFByb21pc2U8QXJyYXlCdWZmZXI+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmVzb2x2ZShlLnRhcmdldC5yZXN1bHQgYXMgQXJyYXlCdWZmZXIpO1xuICAgICAgICB9O1xuICAgICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGZpbGUpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFVwbG9hZCB0aGUgZmlsZSB0byB0aGUgY29udGVudCByZXBvc2l0b3J5LlxuICogSWYgdGhlIHJvb20gaXMgZW5jcnlwdGVkIHRoZW4gZW5jcnlwdCB0aGUgZmlsZSBiZWZvcmUgdXBsb2FkaW5nLlxuICpcbiAqIEBwYXJhbSB7TWF0cml4Q2xpZW50fSBtYXRyaXhDbGllbnQgVGhlIG1hdHJpeCBjbGllbnQgdG8gdXBsb2FkIHRoZSBmaWxlIHdpdGguXG4gKiBAcGFyYW0ge1N0cmluZ30gcm9vbUlkIFRoZSBJRCBvZiB0aGUgcm9vbSBiZWluZyB1cGxvYWRlZCB0by5cbiAqIEBwYXJhbSB7RmlsZX0gZmlsZSBUaGUgZmlsZSB0byB1cGxvYWQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9uP30gcHJvZ3Jlc3NIYW5kbGVyIG9wdGlvbmFsIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCB3aGVuIGEgY2h1bmsgb2ZcbiAqICAgIGRhdGEgaXMgdXBsb2FkZWQuXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIGFuIG9iamVjdC5cbiAqICBJZiB0aGUgZmlsZSBpcyB1bmVuY3J5cHRlZCB0aGVuIHRoZSBvYmplY3Qgd2lsbCBoYXZlIGEgXCJ1cmxcIiBrZXkuXG4gKiAgSWYgdGhlIGZpbGUgaXMgZW5jcnlwdGVkIHRoZW4gdGhlIG9iamVjdCB3aWxsIGhhdmUgYSBcImZpbGVcIiBrZXkuXG4gKi9cbmZ1bmN0aW9uIHVwbG9hZEZpbGUobWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQsIHJvb21JZDogc3RyaW5nLCBmaWxlOiBGaWxlIHwgQmxvYiwgcHJvZ3Jlc3NIYW5kbGVyPzogYW55KSB7XG4gICAgbGV0IGNhbmNlbGVkID0gZmFsc2U7XG4gICAgaWYgKG1hdHJpeENsaWVudC5pc1Jvb21FbmNyeXB0ZWQocm9vbUlkKSkge1xuICAgICAgICAvLyBJZiB0aGUgcm9vbSBpcyBlbmNyeXB0ZWQgdGhlbiBlbmNyeXB0IHRoZSBmaWxlIGJlZm9yZSB1cGxvYWRpbmcgaXQuXG4gICAgICAgIC8vIEZpcnN0IHJlYWQgdGhlIGZpbGUgaW50byBtZW1vcnkuXG4gICAgICAgIGxldCB1cGxvYWRQcm9taXNlO1xuICAgICAgICBsZXQgZW5jcnlwdEluZm87XG4gICAgICAgIGNvbnN0IHByb20gPSByZWFkRmlsZUFzQXJyYXlCdWZmZXIoZmlsZSkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBpZiAoY2FuY2VsZWQpIHRocm93IG5ldyBVcGxvYWRDYW5jZWxlZEVycm9yKCk7XG4gICAgICAgICAgICAvLyBUaGVuIGVuY3J5cHQgdGhlIGZpbGUuXG4gICAgICAgICAgICByZXR1cm4gZW5jcnlwdC5lbmNyeXB0QXR0YWNobWVudChkYXRhKTtcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbihlbmNyeXB0UmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoY2FuY2VsZWQpIHRocm93IG5ldyBVcGxvYWRDYW5jZWxlZEVycm9yKCk7XG4gICAgICAgICAgICAvLyBSZWNvcmQgdGhlIGluZm9ybWF0aW9uIG5lZWRlZCB0byBkZWNyeXB0IHRoZSBhdHRhY2htZW50LlxuICAgICAgICAgICAgZW5jcnlwdEluZm8gPSBlbmNyeXB0UmVzdWx0LmluZm87XG4gICAgICAgICAgICAvLyBQYXNzIHRoZSBlbmNyeXB0ZWQgZGF0YSBhcyBhIEJsb2IgdG8gdGhlIHVwbG9hZGVyLlxuICAgICAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtlbmNyeXB0UmVzdWx0LmRhdGFdKTtcbiAgICAgICAgICAgIHVwbG9hZFByb21pc2UgPSBtYXRyaXhDbGllbnQudXBsb2FkQ29udGVudChibG9iLCB7XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NIYW5kbGVyOiBwcm9ncmVzc0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgaW5jbHVkZUZpbGVuYW1lOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHVwbG9hZFByb21pc2U7XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24odXJsKSB7XG4gICAgICAgICAgICBpZiAoY2FuY2VsZWQpIHRocm93IG5ldyBVcGxvYWRDYW5jZWxlZEVycm9yKCk7XG4gICAgICAgICAgICAvLyBJZiB0aGUgYXR0YWNobWVudCBpcyBlbmNyeXB0ZWQgdGhlbiBidW5kbGUgdGhlIFVSTCBhbG9uZ1xuICAgICAgICAgICAgLy8gd2l0aCB0aGUgaW5mb3JtYXRpb24gbmVlZGVkIHRvIGRlY3J5cHQgdGhlIGF0dGFjaG1lbnQgYW5kXG4gICAgICAgICAgICAvLyBhZGQgaXQgdW5kZXIgYSBmaWxlIGtleS5cbiAgICAgICAgICAgIGVuY3J5cHRJbmZvLnVybCA9IHVybDtcbiAgICAgICAgICAgIGlmIChmaWxlLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBlbmNyeXB0SW5mby5taW1ldHlwZSA9IGZpbGUudHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XCJmaWxlXCI6IGVuY3J5cHRJbmZvfTtcbiAgICAgICAgfSk7XG4gICAgICAgIChwcm9tIGFzIElBYm9ydGFibGVQcm9taXNlPGFueT4pLmFib3J0ID0gKCkgPT4ge1xuICAgICAgICAgICAgY2FuY2VsZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHVwbG9hZFByb21pc2UpIE1hdHJpeENsaWVudFBlZy5nZXQoKS5jYW5jZWxVcGxvYWQodXBsb2FkUHJvbWlzZSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBwcm9tO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGJhc2VQcm9taXNlID0gbWF0cml4Q2xpZW50LnVwbG9hZENvbnRlbnQoZmlsZSwge1xuICAgICAgICAgICAgcHJvZ3Jlc3NIYW5kbGVyOiBwcm9ncmVzc0hhbmRsZXIsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBwcm9taXNlMSA9IGJhc2VQcm9taXNlLnRoZW4oZnVuY3Rpb24odXJsKSB7XG4gICAgICAgICAgICBpZiAoY2FuY2VsZWQpIHRocm93IG5ldyBVcGxvYWRDYW5jZWxlZEVycm9yKCk7XG4gICAgICAgICAgICAvLyBJZiB0aGUgYXR0YWNobWVudCBpc24ndCBlbmNyeXB0ZWQgdGhlbiBpbmNsdWRlIHRoZSBVUkwgZGlyZWN0bHkuXG4gICAgICAgICAgICByZXR1cm4ge1widXJsXCI6IHVybH07XG4gICAgICAgIH0pO1xuICAgICAgICBwcm9taXNlMS5hYm9ydCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNhbmNlbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5jYW5jZWxVcGxvYWQoYmFzZVByb21pc2UpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcHJvbWlzZTE7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250ZW50TWVzc2FnZXMge1xuICAgIHByaXZhdGUgaW5wcm9ncmVzczogSVVwbG9hZFtdID0gW107XG4gICAgcHJpdmF0ZSBtZWRpYUNvbmZpZzogSU1lZGlhQ29uZmlnID0gbnVsbDtcblxuICAgIHNlbmRTdGlja2VyQ29udGVudFRvUm9vbSh1cmw6IHN0cmluZywgcm9vbUlkOiBzdHJpbmcsIGluZm86IHN0cmluZywgdGV4dDogc3RyaW5nLCBtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudCkge1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBDb3VudGx5QW5hbHl0aWNzLmdldFRpbWVzdGFtcCgpO1xuICAgICAgICBjb25zdCBwcm9tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlbmRTdGlja2VyTWVzc2FnZShyb29tSWQsIHVybCwgaW5mbywgdGV4dCkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIHNlbmQgY29udGVudCB3aXRoIFVSTCAke3VybH0gdG8gcm9vbSAke3Jvb21JZH1gLCBlKTtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH0pO1xuICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrU2VuZE1lc3NhZ2Uoc3RhcnRUaW1lLCBwcm9tLCByb29tSWQsIGZhbHNlLCBmYWxzZSwge21zZ3R5cGU6IFwibS5zdGlja2VyXCJ9KTtcbiAgICAgICAgcmV0dXJuIHByb207XG4gICAgfVxuXG4gICAgZ2V0VXBsb2FkTGltaXQoKSB7XG4gICAgICAgIGlmICh0aGlzLm1lZGlhQ29uZmlnICE9PSBudWxsICYmIHRoaXMubWVkaWFDb25maWdbXCJtLnVwbG9hZC5zaXplXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1lZGlhQ29uZmlnW1wibS51cGxvYWQuc2l6ZVwiXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgc2VuZENvbnRlbnRMaXN0VG9Sb29tKGZpbGVzOiBGaWxlW10sIHJvb21JZDogc3RyaW5nLCBtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudCkge1xuICAgICAgICBpZiAobWF0cml4Q2xpZW50LmlzR3Vlc3QoKSkge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdyZXF1aXJlX3JlZ2lzdHJhdGlvbid9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzUXVvdGluZyA9IEJvb2xlYW4oUm9vbVZpZXdTdG9yZS5nZXRRdW90aW5nRXZlbnQoKSk7XG4gICAgICAgIGlmIChpc1F1b3RpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IFF1ZXN0aW9uRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuUXVlc3Rpb25EaWFsb2dcIik7XG4gICAgICAgICAgICBjb25zdCB7ZmluaXNoZWR9ID0gTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZzxbYm9vbGVhbl0+KCdVcGxvYWQgUmVwbHkgV2FybmluZycsICcnLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnUmVwbHlpbmcgV2l0aCBGaWxlcycpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXY+e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0F0IHRoaXMgdGltZSBpdCBpcyBub3QgcG9zc2libGUgdG8gcmVwbHkgd2l0aCBhIGZpbGUuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1dvdWxkIHlvdSBsaWtlIHRvIHVwbG9hZCB0aGlzIGZpbGUgd2l0aG91dCByZXBseWluZz8nLFxuICAgICAgICAgICAgICAgICAgICApfTwvZGl2PlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsQnV0dG9uOiB0cnVlLFxuICAgICAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJDb250aW51ZVwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgW3Nob3VsZFVwbG9hZF0gPSBhd2FpdCBmaW5pc2hlZDtcbiAgICAgICAgICAgIGlmICghc2hvdWxkVXBsb2FkKSByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMubWVkaWFDb25maWcpIHsgLy8gaG90LXBhdGggb3B0aW1pemF0aW9uIHRvIG5vdCBmbGFzaCBhIHNwaW5uZXIgaWYgd2UgZG9uJ3QgbmVlZCB0b1xuICAgICAgICAgICAgY29uc3QgbW9kYWwgPSBNb2RhbC5jcmVhdGVEaWFsb2coU3Bpbm5lciwgbnVsbCwgJ214X0RpYWxvZ19zcGlubmVyJyk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmVuc3VyZU1lZGlhQ29uZmlnRmV0Y2hlZCgpO1xuICAgICAgICAgICAgbW9kYWwuY2xvc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRvb0JpZ0ZpbGVzID0gW107XG4gICAgICAgIGNvbnN0IG9rRmlsZXMgPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0ZpbGVTaXplQWNjZXB0YWJsZShmaWxlc1tpXSkpIHtcbiAgICAgICAgICAgICAgICBva0ZpbGVzLnB1c2goZmlsZXNbaV0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0b29CaWdGaWxlcy5wdXNoKGZpbGVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0b29CaWdGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBVcGxvYWRGYWlsdXJlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuVXBsb2FkRmFpbHVyZURpYWxvZ1wiKTtcbiAgICAgICAgICAgIGNvbnN0IHtmaW5pc2hlZH0gPSBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nPFtib29sZWFuXT4oJ1VwbG9hZCBGYWlsdXJlJywgJycsIFVwbG9hZEZhaWx1cmVEaWFsb2csIHtcbiAgICAgICAgICAgICAgICBiYWRGaWxlczogdG9vQmlnRmlsZXMsXG4gICAgICAgICAgICAgICAgdG90YWxGaWxlczogZmlsZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGNvbnRlbnRNZXNzYWdlczogdGhpcyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgW3Nob3VsZENvbnRpbnVlXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgaWYgKCFzaG91bGRDb250aW51ZSkgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgVXBsb2FkQ29uZmlybURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlVwbG9hZENvbmZpcm1EaWFsb2dcIik7XG4gICAgICAgIGxldCB1cGxvYWRBbGwgPSBmYWxzZTtcbiAgICAgICAgLy8gUHJvbWlzZSB0byBjb21wbGV0ZSBiZWZvcmUgc2VuZGluZyBuZXh0IGZpbGUgaW50byByb29tLCB1c2VkIGZvciBzeW5jaHJvbmlzYXRpb24gb2YgZmlsZS1zZW5kaW5nXG4gICAgICAgIC8vIHRvIG1hdGNoIHRoZSBvcmRlciB0aGUgZmlsZXMgd2VyZSBzcGVjaWZpZWQgaW5cbiAgICAgICAgbGV0IHByb21CZWZvcmUgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBva0ZpbGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlID0gb2tGaWxlc1tpXTtcbiAgICAgICAgICAgIGlmICghdXBsb2FkQWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qge2ZpbmlzaGVkfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2c8W2Jvb2xlYW4sIGJvb2xlYW5dPignVXBsb2FkIEZpbGVzIGNvbmZpcm1hdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICcnLCBVcGxvYWRDb25maXJtRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEluZGV4OiBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxGaWxlczogb2tGaWxlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zdCBbc2hvdWxkQ29udGludWUsIHNob3VsZFVwbG9hZEFsbF0gPSBhd2FpdCBmaW5pc2hlZDtcbiAgICAgICAgICAgICAgICBpZiAoIXNob3VsZENvbnRpbnVlKSBicmVhaztcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkVXBsb2FkQWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZEFsbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJvbUJlZm9yZSA9IHRoaXMuc2VuZENvbnRlbnRUb1Jvb20oZmlsZSwgcm9vbUlkLCBtYXRyaXhDbGllbnQsIHByb21CZWZvcmUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0Q3VycmVudFVwbG9hZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlucHJvZ3Jlc3MuZmlsdGVyKHUgPT4gIXUuY2FuY2VsZWQpO1xuICAgIH1cblxuICAgIGNhbmNlbFVwbG9hZChwcm9taXNlOiBQcm9taXNlPGFueT4pIHtcbiAgICAgICAgbGV0IHVwbG9hZDogSVVwbG9hZDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmlucHJvZ3Jlc3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlucHJvZ3Jlc3NbaV0ucHJvbWlzZSA9PT0gcHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHVwbG9hZCA9IHRoaXMuaW5wcm9ncmVzc1tpXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodXBsb2FkKSB7XG4gICAgICAgICAgICB1cGxvYWQuY2FuY2VsZWQgPSB0cnVlO1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmNhbmNlbFVwbG9hZCh1cGxvYWQucHJvbWlzZSk7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3VwbG9hZF9jYW5jZWxlZCcsIHVwbG9hZH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZW5kQ29udGVudFRvUm9vbShmaWxlOiBGaWxlLCByb29tSWQ6IHN0cmluZywgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQsIHByb21CZWZvcmU6IFByb21pc2U8YW55Pikge1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBDb3VudGx5QW5hbHl0aWNzLmdldFRpbWVzdGFtcCgpO1xuICAgICAgICBjb25zdCBjb250ZW50OiBJQ29udGVudCA9IHtcbiAgICAgICAgICAgIGJvZHk6IGZpbGUubmFtZSB8fCAnQXR0YWNobWVudCcsXG4gICAgICAgICAgICBpbmZvOiB7XG4gICAgICAgICAgICAgICAgc2l6ZTogZmlsZS5zaXplLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1zZ3R5cGU6IFwiXCIsIC8vIHNldCBsYXRlclxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGlmIHdlIGhhdmUgYSBtaW1lIHR5cGUgZm9yIHRoZSBmaWxlLCBhZGQgaXQgdG8gdGhlIG1lc3NhZ2UgbWV0YWRhdGFcbiAgICAgICAgaWYgKGZpbGUudHlwZSkge1xuICAgICAgICAgICAgY29udGVudC5pbmZvLm1pbWV0eXBlID0gZmlsZS50eXBlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvbSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmlsZS50eXBlLmluZGV4T2YoJ2ltYWdlLycpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29udGVudC5tc2d0eXBlID0gJ20uaW1hZ2UnO1xuICAgICAgICAgICAgICAgIGluZm9Gb3JJbWFnZUZpbGUobWF0cml4Q2xpZW50LCByb29tSWQsIGZpbGUpLnRoZW4oKGltYWdlSW5mbykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGNvbnRlbnQuaW5mbywgaW1hZ2VJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0sIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQubXNndHlwZSA9ICdtLmZpbGUnO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZpbGUudHlwZS5pbmRleE9mKCdhdWRpby8nKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQubXNndHlwZSA9ICdtLmF1ZGlvJztcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZpbGUudHlwZS5pbmRleE9mKCd2aWRlby8nKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQubXNndHlwZSA9ICdtLnZpZGVvJztcbiAgICAgICAgICAgICAgICBpbmZvRm9yVmlkZW9GaWxlKG1hdHJpeENsaWVudCwgcm9vbUlkLCBmaWxlKS50aGVuKCh2aWRlb0luZm8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihjb250ZW50LmluZm8sIHZpZGVvSW5mbyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9LCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50Lm1zZ3R5cGUgPSAnbS5maWxlJztcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZW50Lm1zZ3R5cGUgPSAnbS5maWxlJztcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGNyZWF0ZSB0ZW1wb3JhcnkgYWJvcnQgaGFuZGxlciBmb3IgYmVmb3JlIHRoZSBhY3R1YWwgdXBsb2FkIGdldHMgcGFzc2VkIG9mZiB0byBqcy1zZGtcbiAgICAgICAgKHByb20gYXMgSUFib3J0YWJsZVByb21pc2U8YW55PikuYWJvcnQgPSAoKSA9PiB7XG4gICAgICAgICAgICB1cGxvYWQuY2FuY2VsZWQgPSB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHVwbG9hZDogSVVwbG9hZCA9IHtcbiAgICAgICAgICAgIGZpbGVOYW1lOiBmaWxlLm5hbWUgfHwgJ0F0dGFjaG1lbnQnLFxuICAgICAgICAgICAgcm9vbUlkOiByb29tSWQsXG4gICAgICAgICAgICB0b3RhbDogZmlsZS5zaXplLFxuICAgICAgICAgICAgbG9hZGVkOiAwLFxuICAgICAgICAgICAgcHJvbWlzZTogcHJvbSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5pbnByb2dyZXNzLnB1c2godXBsb2FkKTtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICd1cGxvYWRfc3RhcnRlZCd9KTtcblxuICAgICAgICAvLyBGb2N1cyB0aGUgY29tcG9zZXIgdmlld1xuICAgICAgICBkaXMuZmlyZShBY3Rpb24uRm9jdXNDb21wb3Nlcik7XG5cbiAgICAgICAgZnVuY3Rpb24gb25Qcm9ncmVzcyhldikge1xuICAgICAgICAgICAgdXBsb2FkLnRvdGFsID0gZXYudG90YWw7XG4gICAgICAgICAgICB1cGxvYWQubG9hZGVkID0gZXYubG9hZGVkO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICd1cGxvYWRfcHJvZ3Jlc3MnLCB1cGxvYWQ6IHVwbG9hZH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVycm9yO1xuICAgICAgICByZXR1cm4gcHJvbS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHVwbG9hZC5jYW5jZWxlZCkgdGhyb3cgbmV3IFVwbG9hZENhbmNlbGVkRXJyb3IoKTtcbiAgICAgICAgICAgIC8vIFhYWDogdXBsb2FkLnByb21pc2UgbXVzdCBiZSB0aGUgcHJvbWlzZSB0aGF0XG4gICAgICAgICAgICAvLyBpcyByZXR1cm5lZCBieSB1cGxvYWRGaWxlIGFzIGl0IGhhcyBhbiBhYm9ydCgpXG4gICAgICAgICAgICAvLyBtZXRob2QgaGFja2VkIG9udG8gaXQuXG4gICAgICAgICAgICB1cGxvYWQucHJvbWlzZSA9IHVwbG9hZEZpbGUoXG4gICAgICAgICAgICAgICAgbWF0cml4Q2xpZW50LCByb29tSWQsIGZpbGUsIG9uUHJvZ3Jlc3MsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuIHVwbG9hZC5wcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgY29udGVudC5maWxlID0gcmVzdWx0LmZpbGU7XG4gICAgICAgICAgICAgICAgY29udGVudC51cmwgPSByZXN1bHQudXJsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gQXdhaXQgcHJldmlvdXMgbWVzc2FnZSBiZWluZyBzZW50IGludG8gdGhlIHJvb21cbiAgICAgICAgICAgIHJldHVybiBwcm9tQmVmb3JlO1xuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHVwbG9hZC5jYW5jZWxlZCkgdGhyb3cgbmV3IFVwbG9hZENhbmNlbGVkRXJyb3IoKTtcbiAgICAgICAgICAgIGNvbnN0IHByb20gPSBtYXRyaXhDbGllbnQuc2VuZE1lc3NhZ2Uocm9vbUlkLCBjb250ZW50KTtcbiAgICAgICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2tTZW5kTWVzc2FnZShzdGFydFRpbWUsIHByb20sIHJvb21JZCwgZmFsc2UsIGZhbHNlLCBjb250ZW50KTtcbiAgICAgICAgICAgIHJldHVybiBwcm9tO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGVycm9yID0gZXJyO1xuICAgICAgICAgICAgaWYgKCF1cGxvYWQuY2FuY2VsZWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgZGVzYyA9IF90KFwiVGhlIGZpbGUgJyUoZmlsZU5hbWUpcycgZmFpbGVkIHRvIHVwbG9hZC5cIiwge2ZpbGVOYW1lOiB1cGxvYWQuZmlsZU5hbWV9KTtcbiAgICAgICAgICAgICAgICBpZiAoZXJyLmh0dHBfc3RhdHVzID09PSA0MTMpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzYyA9IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJUaGUgZmlsZSAnJShmaWxlTmFtZSlzJyBleGNlZWRzIHRoaXMgaG9tZXNlcnZlcidzIHNpemUgbGltaXQgZm9yIHVwbG9hZHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHtmaWxlTmFtZTogdXBsb2FkLmZpbGVOYW1lfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdVcGxvYWQgZmFpbGVkJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnVXBsb2FkIEZhaWxlZCcpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzYyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaW5wcm9ncmVzcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlucHJvZ3Jlc3NbaV0ucHJvbWlzZSA9PT0gdXBsb2FkLnByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnByb2dyZXNzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgLy8gNDEzOiBGaWxlIHdhcyB0b28gYmlnIG9yIHVwc2V0IHRoZSBzZXJ2ZXIgaW4gc29tZSB3YXk6XG4gICAgICAgICAgICAgICAgLy8gY2xlYXIgdGhlIG1lZGlhIHNpemUgbGltaXQgc28gd2UgZmV0Y2ggaXQgYWdhaW4gbmV4dCB0aW1lXG4gICAgICAgICAgICAgICAgLy8gd2UgdHJ5IHRvIHVwbG9hZFxuICAgICAgICAgICAgICAgIGlmIChlcnJvciAmJiBlcnJvci5odHRwX3N0YXR1cyA9PT0gNDEzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVkaWFDb25maWcgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3VwbG9hZF9mYWlsZWQnLCB1cGxvYWQsIGVycm9yfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAndXBsb2FkX2ZpbmlzaGVkJywgdXBsb2FkfSk7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdtZXNzYWdlX3NlbnQnfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNGaWxlU2l6ZUFjY2VwdGFibGUoZmlsZTogRmlsZSkge1xuICAgICAgICBpZiAodGhpcy5tZWRpYUNvbmZpZyAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgdGhpcy5tZWRpYUNvbmZpZ1tcIm0udXBsb2FkLnNpemVcIl0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgZmlsZS5zaXplID4gdGhpcy5tZWRpYUNvbmZpZ1tcIm0udXBsb2FkLnNpemVcIl0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGVuc3VyZU1lZGlhQ29uZmlnRmV0Y2hlZCgpIHtcbiAgICAgICAgaWYgKHRoaXMubWVkaWFDb25maWcgIT09IG51bGwpIHJldHVybjtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIltNZWRpYSBDb25maWddIEZldGNoaW5nXCIpO1xuICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldE1lZGlhQ29uZmlnKCkudGhlbigoY29uZmlnKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIltNZWRpYSBDb25maWddIEZldGNoZWQgY29uZmlnOlwiLCBjb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgLy8gTWVkaWEgcmVwbyBjYW4ndCBvciB3b24ndCByZXBvcnQgbGltaXRzLCBzbyBwcm92aWRlIGFuIGVtcHR5IG9iamVjdCAobm8gbGltaXRzKS5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW01lZGlhIENvbmZpZ10gQ291bGQgbm90IGZldGNoIGNvbmZpZywgc28gbm90IGxpbWl0aW5nIHVwbG9hZHMuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9KS50aGVuKChjb25maWcpID0+IHtcbiAgICAgICAgICAgIHRoaXMubWVkaWFDb25maWcgPSBjb25maWc7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBzaGFyZWRJbnN0YW5jZSgpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5teENvbnRlbnRNZXNzYWdlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB3aW5kb3cubXhDb250ZW50TWVzc2FnZXMgPSBuZXcgQ29udGVudE1lc3NhZ2VzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHdpbmRvdy5teENvbnRlbnRNZXNzYWdlcztcbiAgICB9XG59XG4iXX0=