"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Auth {
  constructor() {
    _defineProperty(this, "initialize", () => {});

    _defineProperty(this, "getCurrentPerson", () => ({
      id: 51,
      firstName: 'Isaac',
      lastName: 'Hardy',
      nickName: 'Isaac',
      email: 'isaac.hardy@newspring.cc',
      photo: {
        url: 'https://apollosrock.newspring.cc:443/GetImage.ashx?guid=60fd5f35-3167-4c26-9a30-d44937287b87'
      }
    }));
  }

}

exports.default = Auth;
//# sourceMappingURL=authMock.js.map