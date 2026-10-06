"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mediaFromContent = mediaFromContent;
exports.mediaFromMxc = mediaFromMxc;
exports.Media = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _MatrixClientPeg = require("../MatrixClientPeg");

var _IMediaEventContent = require("./models/IMediaEventContent");

/*
 * Copyright 2021 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Populate this class with the details of your customisations when copying it.
// Implementation note: The Media class must complete the contract as shown here, though
// the constructor can be whatever is relevant to your implementation. The mediaForX
// functions below create an instance of the Media class and are used throughout the
// project.

/**
 * A media object is a representation of a "source media" and an optional
 * "thumbnail media", derived from event contents or external sources.
 */
class Media {
  // Per above, this constructor signature can be whatever is helpful for you.
  constructor(prepared
  /*: IPreparedMedia*/
  , client
  /*: MatrixClient*/
  ) {
    this.prepared
    /*:: */
    = prepared
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "client", void 0);
    this.client = client ?? _MatrixClientPeg.MatrixClientPeg.get();

    if (!this.client) {
      throw new Error("No possible MatrixClient for media resolution. Please provide one or log in.");
    }
  }
  /**
   * True if the media appears to be encrypted. Actual file contents may vary.
   */


  get isEncrypted()
  /*: boolean*/
  {
    return !!this.prepared.file;
  }
  /**
   * The MXC URI of the source media.
   */


  get srcMxc()
  /*: string*/
  {
    return this.prepared.mxc;
  }
  /**
   * The MXC URI of the thumbnail media, if a thumbnail is recorded. Null/undefined
   * otherwise.
   */


  get thumbnailMxc()
  /*: string | undefined | null*/
  {
    return this.prepared.thumbnail?.mxc;
  }
  /**
   * Whether or not a thumbnail is recorded for this media.
   */


  get hasThumbnail()
  /*: boolean*/
  {
    return !!this.thumbnailMxc;
  }
  /**
   * The HTTP URL for the source media.
   */


  get srcHttp()
  /*: string*/
  {
    return this.client.mxcUrlToHttp(this.srcMxc);
  }
  /**
   * The HTTP URL for the thumbnail media (without any specified width, height, etc). Null/undefined
   * if no thumbnail media recorded.
   */


  get thumbnailHttp()
  /*: string | undefined | null*/
  {
    if (!this.hasThumbnail) return null;
    return this.client.mxcUrlToHttp(this.thumbnailMxc);
  }
  /**
   * Gets the HTTP URL for the thumbnail media with the requested characteristics, if a thumbnail
   * is recorded for this media. Returns null/undefined otherwise.
   * @param {number} width The desired width of the thumbnail.
   * @param {number} height The desired height of the thumbnail.
   * @param {"scale"|"crop"} mode The desired thumbnailing mode. Defaults to scale.
   * @returns {string} The HTTP URL which points to the thumbnail.
   */


  getThumbnailHttp(width
  /*: number*/
  , height
  /*: number*/
  , mode
  /*: ResizeMethod*/
  = "scale")
  /*: string | null | undefined*/
  {
    if (!this.hasThumbnail) return null; // scale using the device pixel ratio to keep images clear

    width = Math.floor(width * window.devicePixelRatio);
    height = Math.floor(height * window.devicePixelRatio);
    return this.client.mxcUrlToHttp(this.thumbnailMxc, width, height, mode);
  }
  /**
   * Gets the HTTP URL for a thumbnail of the source media with the requested characteristics.
   * @param {number} width The desired width of the thumbnail.
   * @param {number} height The desired height of the thumbnail.
   * @param {"scale"|"crop"} mode The desired thumbnailing mode. Defaults to scale.
   * @returns {string} The HTTP URL which points to the thumbnail.
   */


  getThumbnailOfSourceHttp(width
  /*: number*/
  , height
  /*: number*/
  , mode
  /*: ResizeMethod*/
  = "scale")
  /*: string*/
  {
    // scale using the device pixel ratio to keep images clear
    width = Math.floor(width * window.devicePixelRatio);
    height = Math.floor(height * window.devicePixelRatio);
    return this.client.mxcUrlToHttp(this.srcMxc, width, height, mode);
  }
  /**
   * Creates a square thumbnail of the media. If the media has a thumbnail recorded, that MXC will
   * be used, otherwise the source media will be used.
   * @param {number} dim The desired width and height.
   * @returns {string} An HTTP URL for the thumbnail.
   */


  getSquareThumbnailHttp(dim
  /*: number*/
  )
  /*: string*/
  {
    dim = Math.floor(dim * window.devicePixelRatio); // scale using the device pixel ratio to keep images clear

    if (this.hasThumbnail) {
      return this.getThumbnailHttp(dim, dim, 'crop');
    }

    return this.getThumbnailOfSourceHttp(dim, dim, 'crop');
  }
  /**
   * Downloads the source media.
   * @returns {Promise<Response>} Resolves to the server's response for chaining.
   */


  downloadSource()
  /*: Promise<Response>*/
  {
    return fetch(this.srcHttp);
  }

}
/**
 * Creates a media object from event content.
 * @param {IMediaEventContent} content The event content.
 * @param {MatrixClient} client? Optional client to use.
 * @returns {Media} The media object.
 */


exports.Media = Media;

function mediaFromContent(content
/*: IMediaEventContent*/
, client
/*: MatrixClient*/
)
/*: Media*/
{
  return new Media((0, _IMediaEventContent.prepEventContentAsMedia)(content), client);
}
/**
 * Creates a media object from an MXC URI.
 * @param {string} mxc The MXC URI.
 * @param {MatrixClient} client? Optional client to use.
 * @returns {Media} The media object.
 */


function mediaFromMxc(mxc
/*: string*/
, client
/*: MatrixClient*/
)
/*: Media*/
{
  return mediaFromContent({
    url: mxc
  }, client);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jdXN0b21pc2F0aW9ucy9NZWRpYS50cyJdLCJuYW1lcyI6WyJNZWRpYSIsImNvbnN0cnVjdG9yIiwicHJlcGFyZWQiLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJFcnJvciIsImlzRW5jcnlwdGVkIiwiZmlsZSIsInNyY014YyIsIm14YyIsInRodW1ibmFpbE14YyIsInRodW1ibmFpbCIsImhhc1RodW1ibmFpbCIsInNyY0h0dHAiLCJteGNVcmxUb0h0dHAiLCJ0aHVtYm5haWxIdHRwIiwiZ2V0VGh1bWJuYWlsSHR0cCIsIndpZHRoIiwiaGVpZ2h0IiwibW9kZSIsIk1hdGgiLCJmbG9vciIsIndpbmRvdyIsImRldmljZVBpeGVsUmF0aW8iLCJnZXRUaHVtYm5haWxPZlNvdXJjZUh0dHAiLCJnZXRTcXVhcmVUaHVtYm5haWxIdHRwIiwiZGltIiwiZG93bmxvYWRTb3VyY2UiLCJmZXRjaCIsIm1lZGlhRnJvbUNvbnRlbnQiLCJjb250ZW50IiwibWVkaWFGcm9tTXhjIiwidXJsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQWpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFPQTtBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sTUFBTUEsS0FBTixDQUFZO0FBR2Y7QUFDQUMsRUFBQUEsV0FBVyxDQUFTQztBQUFUO0FBQUEsSUFBbUNDO0FBQW5DO0FBQUEsSUFBMEQ7QUFBQSxTQUFqREQ7QUFBaUQ7QUFBQSxNQUFqREE7QUFBaUQ7QUFBQTtBQUFBO0FBQ2pFLFNBQUtDLE1BQUwsR0FBY0EsTUFBTSxJQUFJQyxpQ0FBZ0JDLEdBQWhCLEVBQXhCOztBQUNBLFFBQUksQ0FBQyxLQUFLRixNQUFWLEVBQWtCO0FBQ2QsWUFBTSxJQUFJRyxLQUFKLENBQVUsOEVBQVYsQ0FBTjtBQUNI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UDtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7OztBQUNXQyxFQUFBQSxjQUFQO0FBQUE7QUFBMkM7QUFDdkMsV0FBT0MsS0FBSyxDQUFDLEtBQUtmLE9BQU4sQ0FBWjtBQUNIOztBQTFHYztBQTZHbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQUNPLFNBQVNnQixnQkFBVCxDQUEwQkM7QUFBMUI7QUFBQSxFQUF1RDVCO0FBQXZEO0FBQUE7QUFBQTtBQUFxRjtBQUN4RixTQUFPLElBQUlILEtBQUosQ0FBVSxpREFBd0IrQixPQUF4QixDQUFWLEVBQTRDNUIsTUFBNUMsQ0FBUDtBQUNIO0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDTyxTQUFTNkIsWUFBVCxDQUFzQnRCO0FBQXRCO0FBQUEsRUFBbUNQO0FBQW5DO0FBQUE7QUFBQTtBQUFpRTtBQUNwRSxTQUFPMkIsZ0JBQWdCLENBQUM7QUFBQ0csSUFBQUEsR0FBRyxFQUFFdkI7QUFBTixHQUFELEVBQWFQLE1BQWIsQ0FBdkI7QUFDSCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBDb3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCB7SU1lZGlhRXZlbnRDb250ZW50LCBJUHJlcGFyZWRNZWRpYSwgcHJlcEV2ZW50Q29udGVudEFzTWVkaWF9IGZyb20gXCIuL21vZGVscy9JTWVkaWFFdmVudENvbnRlbnRcIjtcbmltcG9ydCB7UmVzaXplTWV0aG9kfSBmcm9tIFwiLi4vQXZhdGFyXCI7XG5pbXBvcnQge01hdHJpeENsaWVudH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuXG4vLyBQb3B1bGF0ZSB0aGlzIGNsYXNzIHdpdGggdGhlIGRldGFpbHMgb2YgeW91ciBjdXN0b21pc2F0aW9ucyB3aGVuIGNvcHlpbmcgaXQuXG5cbi8vIEltcGxlbWVudGF0aW9uIG5vdGU6IFRoZSBNZWRpYSBjbGFzcyBtdXN0IGNvbXBsZXRlIHRoZSBjb250cmFjdCBhcyBzaG93biBoZXJlLCB0aG91Z2hcbi8vIHRoZSBjb25zdHJ1Y3RvciBjYW4gYmUgd2hhdGV2ZXIgaXMgcmVsZXZhbnQgdG8geW91ciBpbXBsZW1lbnRhdGlvbi4gVGhlIG1lZGlhRm9yWFxuLy8gZnVuY3Rpb25zIGJlbG93IGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgTWVkaWEgY2xhc3MgYW5kIGFyZSB1c2VkIHRocm91Z2hvdXQgdGhlXG4vLyBwcm9qZWN0LlxuXG4vKipcbiAqIEEgbWVkaWEgb2JqZWN0IGlzIGEgcmVwcmVzZW50YXRpb24gb2YgYSBcInNvdXJjZSBtZWRpYVwiIGFuZCBhbiBvcHRpb25hbFxuICogXCJ0aHVtYm5haWwgbWVkaWFcIiwgZGVyaXZlZCBmcm9tIGV2ZW50IGNvbnRlbnRzIG9yIGV4dGVybmFsIHNvdXJjZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBNZWRpYSB7XG4gICAgcHJpdmF0ZSBjbGllbnQ6IE1hdHJpeENsaWVudDtcblxuICAgIC8vIFBlciBhYm92ZSwgdGhpcyBjb25zdHJ1Y3RvciBzaWduYXR1cmUgY2FuIGJlIHdoYXRldmVyIGlzIGhlbHBmdWwgZm9yIHlvdS5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHByZXBhcmVkOiBJUHJlcGFyZWRNZWRpYSwgY2xpZW50PzogTWF0cml4Q2xpZW50KSB7XG4gICAgICAgIHRoaXMuY2xpZW50ID0gY2xpZW50ID8/IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKCF0aGlzLmNsaWVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gcG9zc2libGUgTWF0cml4Q2xpZW50IGZvciBtZWRpYSByZXNvbHV0aW9uLiBQbGVhc2UgcHJvdmlkZSBvbmUgb3IgbG9nIGluLlwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRydWUgaWYgdGhlIG1lZGlhIGFwcGVhcnMgdG8gYmUgZW5jcnlwdGVkLiBBY3R1YWwgZmlsZSBjb250ZW50cyBtYXkgdmFyeS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGlzRW5jcnlwdGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLnByZXBhcmVkLmZpbGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIE1YQyBVUkkgb2YgdGhlIHNvdXJjZSBtZWRpYS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHNyY014YygpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5wcmVwYXJlZC5teGM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIE1YQyBVUkkgb2YgdGhlIHRodW1ibmFpbCBtZWRpYSwgaWYgYSB0aHVtYm5haWwgaXMgcmVjb3JkZWQuIE51bGwvdW5kZWZpbmVkXG4gICAgICogb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgdGh1bWJuYWlsTXhjKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwge1xuICAgICAgICByZXR1cm4gdGhpcy5wcmVwYXJlZC50aHVtYm5haWw/Lm14YztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIG9yIG5vdCBhIHRodW1ibmFpbCBpcyByZWNvcmRlZCBmb3IgdGhpcyBtZWRpYS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGhhc1RodW1ibmFpbCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy50aHVtYm5haWxNeGM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIEhUVFAgVVJMIGZvciB0aGUgc291cmNlIG1lZGlhLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgc3JjSHR0cCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5jbGllbnQubXhjVXJsVG9IdHRwKHRoaXMuc3JjTXhjKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgSFRUUCBVUkwgZm9yIHRoZSB0aHVtYm5haWwgbWVkaWEgKHdpdGhvdXQgYW55IHNwZWNpZmllZCB3aWR0aCwgaGVpZ2h0LCBldGMpLiBOdWxsL3VuZGVmaW5lZFxuICAgICAqIGlmIG5vIHRodW1ibmFpbCBtZWRpYSByZWNvcmRlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHRodW1ibmFpbEh0dHAoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCB7XG4gICAgICAgIGlmICghdGhpcy5oYXNUaHVtYm5haWwpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gdGhpcy5jbGllbnQubXhjVXJsVG9IdHRwKHRoaXMudGh1bWJuYWlsTXhjKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBIVFRQIFVSTCBmb3IgdGhlIHRodW1ibmFpbCBtZWRpYSB3aXRoIHRoZSByZXF1ZXN0ZWQgY2hhcmFjdGVyaXN0aWNzLCBpZiBhIHRodW1ibmFpbFxuICAgICAqIGlzIHJlY29yZGVkIGZvciB0aGlzIG1lZGlhLiBSZXR1cm5zIG51bGwvdW5kZWZpbmVkIG90aGVyd2lzZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggVGhlIGRlc2lyZWQgd2lkdGggb2YgdGhlIHRodW1ibmFpbC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IFRoZSBkZXNpcmVkIGhlaWdodCBvZiB0aGUgdGh1bWJuYWlsLlxuICAgICAqIEBwYXJhbSB7XCJzY2FsZVwifFwiY3JvcFwifSBtb2RlIFRoZSBkZXNpcmVkIHRodW1ibmFpbGluZyBtb2RlLiBEZWZhdWx0cyB0byBzY2FsZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgSFRUUCBVUkwgd2hpY2ggcG9pbnRzIHRvIHRoZSB0aHVtYm5haWwuXG4gICAgICovXG4gICAgcHVibGljIGdldFRodW1ibmFpbEh0dHAod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIG1vZGU6IFJlc2l6ZU1ldGhvZCA9IFwic2NhbGVcIik6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQge1xuICAgICAgICBpZiAoIXRoaXMuaGFzVGh1bWJuYWlsKSByZXR1cm4gbnVsbDtcbiAgICAgICAgLy8gc2NhbGUgdXNpbmcgdGhlIGRldmljZSBwaXhlbCByYXRpbyB0byBrZWVwIGltYWdlcyBjbGVhclxuICAgICAgICB3aWR0aCA9IE1hdGguZmxvb3Iod2lkdGggKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyk7XG4gICAgICAgIGhlaWdodCA9IE1hdGguZmxvb3IoaGVpZ2h0ICogd2luZG93LmRldmljZVBpeGVsUmF0aW8pO1xuICAgICAgICByZXR1cm4gdGhpcy5jbGllbnQubXhjVXJsVG9IdHRwKHRoaXMudGh1bWJuYWlsTXhjLCB3aWR0aCwgaGVpZ2h0LCBtb2RlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBIVFRQIFVSTCBmb3IgYSB0aHVtYm5haWwgb2YgdGhlIHNvdXJjZSBtZWRpYSB3aXRoIHRoZSByZXF1ZXN0ZWQgY2hhcmFjdGVyaXN0aWNzLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBUaGUgZGVzaXJlZCB3aWR0aCBvZiB0aGUgdGh1bWJuYWlsLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgVGhlIGRlc2lyZWQgaGVpZ2h0IG9mIHRoZSB0aHVtYm5haWwuXG4gICAgICogQHBhcmFtIHtcInNjYWxlXCJ8XCJjcm9wXCJ9IG1vZGUgVGhlIGRlc2lyZWQgdGh1bWJuYWlsaW5nIG1vZGUuIERlZmF1bHRzIHRvIHNjYWxlLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBIVFRQIFVSTCB3aGljaCBwb2ludHMgdG8gdGhlIHRodW1ibmFpbC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0VGh1bWJuYWlsT2ZTb3VyY2VIdHRwKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBtb2RlOiBSZXNpemVNZXRob2QgPSBcInNjYWxlXCIpOiBzdHJpbmcge1xuICAgICAgICAvLyBzY2FsZSB1c2luZyB0aGUgZGV2aWNlIHBpeGVsIHJhdGlvIHRvIGtlZXAgaW1hZ2VzIGNsZWFyXG4gICAgICAgIHdpZHRoID0gTWF0aC5mbG9vcih3aWR0aCAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKTtcbiAgICAgICAgaGVpZ2h0ID0gTWF0aC5mbG9vcihoZWlnaHQgKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyk7XG4gICAgICAgIHJldHVybiB0aGlzLmNsaWVudC5teGNVcmxUb0h0dHAodGhpcy5zcmNNeGMsIHdpZHRoLCBoZWlnaHQsIG1vZGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzcXVhcmUgdGh1bWJuYWlsIG9mIHRoZSBtZWRpYS4gSWYgdGhlIG1lZGlhIGhhcyBhIHRodW1ibmFpbCByZWNvcmRlZCwgdGhhdCBNWEMgd2lsbFxuICAgICAqIGJlIHVzZWQsIG90aGVyd2lzZSB0aGUgc291cmNlIG1lZGlhIHdpbGwgYmUgdXNlZC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGltIFRoZSBkZXNpcmVkIHdpZHRoIGFuZCBoZWlnaHQuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gQW4gSFRUUCBVUkwgZm9yIHRoZSB0aHVtYm5haWwuXG4gICAgICovXG4gICAgcHVibGljIGdldFNxdWFyZVRodW1ibmFpbEh0dHAoZGltOiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICBkaW0gPSBNYXRoLmZsb29yKGRpbSAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKTsgLy8gc2NhbGUgdXNpbmcgdGhlIGRldmljZSBwaXhlbCByYXRpbyB0byBrZWVwIGltYWdlcyBjbGVhclxuICAgICAgICBpZiAodGhpcy5oYXNUaHVtYm5haWwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFRodW1ibmFpbEh0dHAoZGltLCBkaW0sICdjcm9wJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VGh1bWJuYWlsT2ZTb3VyY2VIdHRwKGRpbSwgZGltLCAnY3JvcCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERvd25sb2FkcyB0aGUgc291cmNlIG1lZGlhLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFJlc3BvbnNlPn0gUmVzb2x2ZXMgdG8gdGhlIHNlcnZlcidzIHJlc3BvbnNlIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwdWJsaWMgZG93bmxvYWRTb3VyY2UoKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gZmV0Y2godGhpcy5zcmNIdHRwKTtcbiAgICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1lZGlhIG9iamVjdCBmcm9tIGV2ZW50IGNvbnRlbnQuXG4gKiBAcGFyYW0ge0lNZWRpYUV2ZW50Q29udGVudH0gY29udGVudCBUaGUgZXZlbnQgY29udGVudC5cbiAqIEBwYXJhbSB7TWF0cml4Q2xpZW50fSBjbGllbnQ/IE9wdGlvbmFsIGNsaWVudCB0byB1c2UuXG4gKiBAcmV0dXJucyB7TWVkaWF9IFRoZSBtZWRpYSBvYmplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZWRpYUZyb21Db250ZW50KGNvbnRlbnQ6IElNZWRpYUV2ZW50Q29udGVudCwgY2xpZW50PzogTWF0cml4Q2xpZW50KTogTWVkaWEge1xuICAgIHJldHVybiBuZXcgTWVkaWEocHJlcEV2ZW50Q29udGVudEFzTWVkaWEoY29udGVudCksIGNsaWVudCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1lZGlhIG9iamVjdCBmcm9tIGFuIE1YQyBVUkkuXG4gKiBAcGFyYW0ge3N0cmluZ30gbXhjIFRoZSBNWEMgVVJJLlxuICogQHBhcmFtIHtNYXRyaXhDbGllbnR9IGNsaWVudD8gT3B0aW9uYWwgY2xpZW50IHRvIHVzZS5cbiAqIEByZXR1cm5zIHtNZWRpYX0gVGhlIG1lZGlhIG9iamVjdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lZGlhRnJvbU14YyhteGM6IHN0cmluZywgY2xpZW50PzogTWF0cml4Q2xpZW50KTogTWVkaWEge1xuICAgIHJldHVybiBtZWRpYUZyb21Db250ZW50KHt1cmw6IG14Y30sIGNsaWVudCk7XG59XG4iXX0=