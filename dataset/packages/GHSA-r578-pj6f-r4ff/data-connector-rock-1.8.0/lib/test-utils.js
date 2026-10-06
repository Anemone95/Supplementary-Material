"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildGetMock = void 0;

/* eslint-disable import/prefer-default-export */
const buildGetMock = (response, dataSource) => {
  const get = jest.fn();

  if (Array.isArray(response) && Array.isArray(response[0])) {
    response.forEach(responseVal => {
      get.mockReturnValueOnce(new Promise(resolve => resolve(dataSource.normalize(responseVal))));
    });
  }

  get.mockReturnValue(new Promise(resolve => resolve(dataSource.normalize(response))));
  return get;
};

exports.buildGetMock = buildGetMock;
//# sourceMappingURL=test-utils.js.map