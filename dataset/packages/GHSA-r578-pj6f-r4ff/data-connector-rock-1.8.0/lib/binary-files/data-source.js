"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _formData = _interopRequireDefault(require("form-data"));

var _rockApolloDataSource = _interopRequireDefault(require("@apollosproject/rock-apollo-data-source"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class BinaryFiles extends _rockApolloDataSource.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "resource", 'BinaryFiles');
  }

  getFromId(id) {
    return this.request().find(id).get();
  }

  async uploadFile({
    stream
  }) {
    const data = new _formData.default();
    data.append('file', stream);
    const response = await this.nodeFetch(`${this.baseURL}/BinaryFiles/Upload?binaryFileTypeId=5`, {
      method: 'POST',
      body: data,
      headers: {
        'Authorization-Token': this.rockToken,
        ...data.getHeaders()
      }
    });
    return response.text();
  }

  async findOrReturnImageUrl(image) {
    if (image == null) return image;
    const {
      url,
      id
    } = image;

    if (url && typeof url === 'string') {
      return url;
    }

    if (id != null && typeof id !== 'object') {
      const binaryImage = await this.getFromId(id);
      return binaryImage.url;
    }

    return null;
  }

}

exports.default = BinaryFiles;
//# sourceMappingURL=data-source.js.map