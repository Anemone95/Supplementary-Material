"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepEventContentAsMedia = prepEventContentAsMedia;

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
// TODO: These types should be elsewhere.

/*:: export interface IEncryptedFile {
    url: string;
    mimetype?: string;
    key: {
        alg: string;
        key_ops: string[]; // eslint-disable-line camelcase
        kty: string;
        k: string;
        ext: boolean;
    };
    iv: string;
    hashes: {[alg: string]: string};
    v: string;
}*/

/*:: export interface IMediaEventContent {
    url?: string; // required on unencrypted media
    file?: IEncryptedFile; // required for *encrypted* media
    info?: {
        thumbnail_url?: string; // eslint-disable-line camelcase
        thumbnail_file?: IEncryptedFile; // eslint-disable-line camelcase
    };
}*/

/*:: export interface IPreparedMedia extends IMediaObject {
    thumbnail?: IMediaObject;
}*/

/*:: export interface IMediaObject {
    mxc: string;
    file?: IEncryptedFile;
}*/

/**
 * Parses an event content body into a prepared media object. This prepared media object
 * can be used with other functions to manipulate the media.
 * @param {IMediaEventContent} content Unredacted media event content. See interface.
 * @returns {IPreparedMedia} A prepared media object.
 * @throws Throws if the given content cannot be packaged into a prepared media object.
 */
function prepEventContentAsMedia(content
/*: IMediaEventContent*/
)
/*: IPreparedMedia*/
{
  let thumbnail
  /*: IMediaObject*/
  = null;

  if (content?.info?.thumbnail_url) {
    thumbnail = {
      mxc: content.info.thumbnail_url,
      file: content.info.thumbnail_file
    };
  } else if (content?.info?.thumbnail_file?.url) {
    thumbnail = {
      mxc: content.info.thumbnail_file.url,
      file: content.info.thumbnail_file
    };
  }

  if (content?.url) {
    return {
      thumbnail,
      mxc: content.url,
      file: content.file
    };
  } else if (content?.file?.url) {
    return {
      thumbnail,
      mxc: content.file.url,
      file: content.file
    };
  }

  throw new Error("Invalid file provided: cannot determine MXC URI. Has it been redacted?");
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jdXN0b21pc2F0aW9ucy9tb2RlbHMvSU1lZGlhRXZlbnRDb250ZW50LnRzIl0sIm5hbWVzIjpbInByZXBFdmVudENvbnRlbnRBc01lZGlhIiwiY29udGVudCIsInRodW1ibmFpbCIsImluZm8iLCJ0aHVtYm5haWxfdXJsIiwibXhjIiwiZmlsZSIsInRodW1ibmFpbF9maWxlIiwidXJsIiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7O0FBaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBTkE7QUFDQTs7O0FBREE7QUFDQTtBQUNBOztBQWlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLFNBQVNBLHVCQUFULENBQWlDQztBQUFqQztBQUFBO0FBQUE7QUFBOEU7QUFDakYsTUFBSUM7QUFBdUI7QUFBQSxJQUFHLElBQTlCOztBQUNBLE1BQUlELE9BQU8sRUFBRUUsSUFBVCxFQUFlQyxhQUFuQixFQUFrQztBQUM5QkYsSUFBQUEsU0FBUyxHQUFHO0FBQ1JHLE1BQUFBLEdBQUcsRUFBRUosT0FBTyxDQUFDRSxJQUFSLENBQWFDLGFBRFY7QUFFUkUsTUFBQUEsSUFBSSxFQUFFTCxPQUFPLENBQUNFLElBQVIsQ0FBYUk7QUFGWCxLQUFaO0FBSUgsR0FMRCxNQUtPLElBQUlOLE9BQU8sRUFBRUUsSUFBVCxFQUFlSSxjQUFmLEVBQStCQyxHQUFuQyxFQUF3QztBQUMzQ04sSUFBQUEsU0FBUyxHQUFHO0FBQ1JHLE1BQUFBLEdBQUcsRUFBRUosT0FBTyxDQUFDRSxJQUFSLENBQWFJLGNBQWIsQ0FBNEJDLEdBRHpCO0FBRVJGLE1BQUFBLElBQUksRUFBRUwsT0FBTyxDQUFDRSxJQUFSLENBQWFJO0FBRlgsS0FBWjtBQUlIOztBQUVELE1BQUlOLE9BQU8sRUFBRU8sR0FBYixFQUFrQjtBQUNkLFdBQU87QUFDSE4sTUFBQUEsU0FERztBQUVIRyxNQUFBQSxHQUFHLEVBQUVKLE9BQU8sQ0FBQ08sR0FGVjtBQUdIRixNQUFBQSxJQUFJLEVBQUVMLE9BQU8sQ0FBQ0s7QUFIWCxLQUFQO0FBS0gsR0FORCxNQU1PLElBQUlMLE9BQU8sRUFBRUssSUFBVCxFQUFlRSxHQUFuQixFQUF3QjtBQUMzQixXQUFPO0FBQ0hOLE1BQUFBLFNBREc7QUFFSEcsTUFBQUEsR0FBRyxFQUFFSixPQUFPLENBQUNLLElBQVIsQ0FBYUUsR0FGZjtBQUdIRixNQUFBQSxJQUFJLEVBQUVMLE9BQU8sQ0FBQ0s7QUFIWCxLQUFQO0FBS0g7O0FBRUQsUUFBTSxJQUFJRyxLQUFKLENBQVUsd0VBQVYsQ0FBTjtBQUNIIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vLyBUT0RPOiBUaGVzZSB0eXBlcyBzaG91bGQgYmUgZWxzZXdoZXJlLlxuXG5leHBvcnQgaW50ZXJmYWNlIElFbmNyeXB0ZWRGaWxlIHtcbiAgICB1cmw6IHN0cmluZztcbiAgICBtaW1ldHlwZT86IHN0cmluZztcbiAgICBrZXk6IHtcbiAgICAgICAgYWxnOiBzdHJpbmc7XG4gICAgICAgIGtleV9vcHM6IHN0cmluZ1tdOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNhbWVsY2FzZVxuICAgICAgICBrdHk6IHN0cmluZztcbiAgICAgICAgazogc3RyaW5nO1xuICAgICAgICBleHQ6IGJvb2xlYW47XG4gICAgfTtcbiAgICBpdjogc3RyaW5nO1xuICAgIGhhc2hlczoge1thbGc6IHN0cmluZ106IHN0cmluZ307XG4gICAgdjogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElNZWRpYUV2ZW50Q29udGVudCB7XG4gICAgdXJsPzogc3RyaW5nOyAvLyByZXF1aXJlZCBvbiB1bmVuY3J5cHRlZCBtZWRpYVxuICAgIGZpbGU/OiBJRW5jcnlwdGVkRmlsZTsgLy8gcmVxdWlyZWQgZm9yICplbmNyeXB0ZWQqIG1lZGlhXG4gICAgaW5mbz86IHtcbiAgICAgICAgdGh1bWJuYWlsX3VybD86IHN0cmluZzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2VcbiAgICAgICAgdGh1bWJuYWlsX2ZpbGU/OiBJRW5jcnlwdGVkRmlsZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2VcbiAgICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElQcmVwYXJlZE1lZGlhIGV4dGVuZHMgSU1lZGlhT2JqZWN0IHtcbiAgICB0aHVtYm5haWw/OiBJTWVkaWFPYmplY3Q7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU1lZGlhT2JqZWN0IHtcbiAgICBteGM6IHN0cmluZztcbiAgICBmaWxlPzogSUVuY3J5cHRlZEZpbGU7XG59XG5cbi8qKlxuICogUGFyc2VzIGFuIGV2ZW50IGNvbnRlbnQgYm9keSBpbnRvIGEgcHJlcGFyZWQgbWVkaWEgb2JqZWN0LiBUaGlzIHByZXBhcmVkIG1lZGlhIG9iamVjdFxuICogY2FuIGJlIHVzZWQgd2l0aCBvdGhlciBmdW5jdGlvbnMgdG8gbWFuaXB1bGF0ZSB0aGUgbWVkaWEuXG4gKiBAcGFyYW0ge0lNZWRpYUV2ZW50Q29udGVudH0gY29udGVudCBVbnJlZGFjdGVkIG1lZGlhIGV2ZW50IGNvbnRlbnQuIFNlZSBpbnRlcmZhY2UuXG4gKiBAcmV0dXJucyB7SVByZXBhcmVkTWVkaWF9IEEgcHJlcGFyZWQgbWVkaWEgb2JqZWN0LlxuICogQHRocm93cyBUaHJvd3MgaWYgdGhlIGdpdmVuIGNvbnRlbnQgY2Fubm90IGJlIHBhY2thZ2VkIGludG8gYSBwcmVwYXJlZCBtZWRpYSBvYmplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmVwRXZlbnRDb250ZW50QXNNZWRpYShjb250ZW50OiBJTWVkaWFFdmVudENvbnRlbnQpOiBJUHJlcGFyZWRNZWRpYSB7XG4gICAgbGV0IHRodW1ibmFpbDogSU1lZGlhT2JqZWN0ID0gbnVsbDtcbiAgICBpZiAoY29udGVudD8uaW5mbz8udGh1bWJuYWlsX3VybCkge1xuICAgICAgICB0aHVtYm5haWwgPSB7XG4gICAgICAgICAgICBteGM6IGNvbnRlbnQuaW5mby50aHVtYm5haWxfdXJsLFxuICAgICAgICAgICAgZmlsZTogY29udGVudC5pbmZvLnRodW1ibmFpbF9maWxlLFxuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAoY29udGVudD8uaW5mbz8udGh1bWJuYWlsX2ZpbGU/LnVybCkge1xuICAgICAgICB0aHVtYm5haWwgPSB7XG4gICAgICAgICAgICBteGM6IGNvbnRlbnQuaW5mby50aHVtYm5haWxfZmlsZS51cmwsXG4gICAgICAgICAgICBmaWxlOiBjb250ZW50LmluZm8udGh1bWJuYWlsX2ZpbGUsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGNvbnRlbnQ/LnVybCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGh1bWJuYWlsLFxuICAgICAgICAgICAgbXhjOiBjb250ZW50LnVybCxcbiAgICAgICAgICAgIGZpbGU6IGNvbnRlbnQuZmlsZSxcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGNvbnRlbnQ/LmZpbGU/LnVybCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGh1bWJuYWlsLFxuICAgICAgICAgICAgbXhjOiBjb250ZW50LmZpbGUudXJsLFxuICAgICAgICAgICAgZmlsZTogY29udGVudC5maWxlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgZmlsZSBwcm92aWRlZDogY2Fubm90IGRldGVybWluZSBNWEMgVVJJLiBIYXMgaXQgYmVlbiByZWRhY3RlZD9cIik7XG59XG4iXX0=