"use strict";

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _dataSource = _interopRequireDefault(require("../data-source"));

var _testUtils = require("../../test-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_config.default.loadJs({
  ROCK: {
    API_URL: 'https://apollosrock.newspring.cc/api',
    API_TOKEN: 'some-rock-token',
    IMAGE_URL: 'https://apollosrock.newspring.cc/GetImage.ashx'
  }
});

const auth = dataSource => ({
  getCurrentPerson: (0, _testUtils.buildGetMock)({
    Id: 51,
    FirstName: 'Vincent',
    LastName: 'Wilson'
  }, dataSource)
});

const personaAuth = dataSource => ({
  getCurrentPerson: (0, _testUtils.buildGetMock)({
    id: 51,
    FirstName: 'Vincent',
    LastName: 'Wilson'
  }, dataSource)
});

const rockConstants = () => ({
  modelType: type => ({
    id: 15,
    type
  })
});

describe('Person', () => {
  it('constructs', () => {
    expect(new _dataSource.default()).toBeTruthy();
  });
  it('gets persons dataview associations', async () => {
    const dataSource = new _dataSource.default();
    const Auth = personaAuth(dataSource);
    const RockConstants = rockConstants();
    const categoryId = 210;
    dataSource.context = {
      rockCookie: 'fakeCookie',
      dataSources: {
        Auth,
        RockConstants
      }
    };
    dataSource.get = (0, _testUtils.buildGetMock)({}, dataSource);
    const result = await dataSource.getPersonas(categoryId);
    expect(result).toMatchSnapshot();
    expect(dataSource.get.mock.calls).toMatchSnapshot();
  });
  it('gets persons dataview associations from plugin endpoints', async () => {
    _config.default.loadJs({
      ROCK: {
        USE_PLUGIN: true
      }
    });

    const dataSource = new _dataSource.default();
    const Auth = personaAuth(dataSource);
    const RockConstants = rockConstants();
    const categoryId = 210;
    dataSource.context = {
      rockCookie: 'fakeCookie',
      dataSources: {
        Auth,
        RockConstants
      }
    };
    dataSource.get = (0, _testUtils.buildGetMock)({}, dataSource);
    const result = await dataSource.getPersonas({
      categoryId
    });
    expect(result).toMatchSnapshot();
    expect(dataSource.get.mock.calls).toMatchSnapshot();

    _config.default.loadJs({
      ROCK: {
        USE_PLUGIN: false
      }
    });
  });
  it('gets person from id', () => {
    const dataSource = new _dataSource.default();
    dataSource.get = (0, _testUtils.buildGetMock)([{
      Id: 51
    }], dataSource);
    const result = dataSource.getFromId(51);
    expect(result).resolves.toMatchSnapshot();
    expect(dataSource.get.mock.calls).toMatchSnapshot();
  });
  it('gets person from aliasId', async () => {
    const dataSource = new _dataSource.default();
    dataSource.get = jest.fn(() => Promise.resolve([{
      personId: 123
    }]));
    dataSource.getFromId = jest.fn(() => Promise.resolve({
      id: 321,
      firstName: 'John'
    }));
    const result = await dataSource.getFromAliasId(51);
    expect(result).toMatchSnapshot('The result from getAliasId');
    expect(dataSource.get.mock.calls).toMatchSnapshot('The call to fetch the alias id');
    expect(dataSource.getFromId.mock.calls).toMatchSnapshot('The call to fetch the person by id');
  });
  it('returns null when getPersonByAliasId is not valid', async () => {
    const dataSource = new _dataSource.default();
    dataSource.get = jest.fn(() => Promise.resolve([]));
    const result = await dataSource.getFromAliasId(51);
    expect(result).toMatchSnapshot('The result from getAliasId');
    expect(dataSource.get.mock.calls).toMatchSnapshot('The call to fetch the alias id');
  });
  it("updates a user's profile attributes", () => {
    const dataSource = new _dataSource.default();
    const Auth = auth(dataSource);
    dataSource.context = {
      rockCookie: 'fakeCookie',
      dataSources: {
        Auth
      }
    };
    dataSource.patch = (0, _testUtils.buildGetMock)({}, dataSource);
    const result = dataSource.updateProfile([{
      field: '        FirstName',
      value: 'Nick'
    }]);
    expect(result).resolves.toMatchSnapshot();
    expect(Auth.getCurrentPerson.mock.calls).toMatchSnapshot();
    expect(dataSource.patch.mock.calls).toMatchSnapshot();
  });
  it("updates a user's gender attributes", () => {
    const dataSource = new _dataSource.default();
    const Auth = auth(dataSource);
    dataSource.context = {
      rockCookie: 'fakeCookie',
      dataSources: {
        Auth
      }
    };
    dataSource.patch = (0, _testUtils.buildGetMock)({}, dataSource);
    const result = dataSource.updateProfile([{
      field: 'Gender',
      value: 'Male'
    }]);
    expect(result).resolves.toMatchSnapshot('result');
    expect(Auth.getCurrentPerson.mock.calls).toMatchSnapshot('current person');
    expect(dataSource.patch.mock.calls).toMatchSnapshot('rock patch');
  });
  it("updates a user's birth date attributes", async () => {
    const dataSource = new _dataSource.default();
    const Auth = auth(dataSource);
    dataSource.context = {
      rockCookie: 'fakeCookie',
      dataSources: {
        Auth
      }
    };
    dataSource.patch = (0, _testUtils.buildGetMock)({}, dataSource);
    const result = await dataSource.updateProfile([{
      field: 'BirthDate',
      value: '1996-11-02T07:00:00.000Z'
    }]);
    expect(result).toMatchSnapshot();
    expect(Auth.getCurrentPerson.mock.calls).toMatchSnapshot();
    expect(dataSource.patch.mock.calls).toMatchSnapshot();
  });
  it('throws an error setting an invalid birth date', () => {
    const dataSource = new _dataSource.default();
    const Auth = auth(dataSource);
    dataSource.context = {
      rockCookie: 'fakeCookie',
      dataSources: {
        Auth
      }
    };
    dataSource.patch = (0, _testUtils.buildGetMock)({}, dataSource);
    const result = dataSource.updateProfile([{
      field: 'BirthDate',
      value: 'ABCD'
    }]);
    expect(result).rejects.toThrowErrorMatchingSnapshot();
  });
  it('Throws an error if trying to set an invalid gender', () => {
    const dataSource = new _dataSource.default();
    const Auth = auth(dataSource);
    dataSource.context = {
      rockCookie: 'fakeCookie',
      dataSources: {
        Auth
      }
    };
    dataSource.patch = (0, _testUtils.buildGetMock)({}, dataSource);
    const result = dataSource.updateProfile([{
      field: 'Gender',
      value: 'Squirrel'
    }]);
    expect(result).rejects.toThrowErrorMatchingSnapshot();
  });
  it("uploads a user's profile picture", async () => {
    const dataSource = new _dataSource.default();
    const uploadMock = jest.fn(() => Promise.resolve('456'));
    const binaryGetMock = jest.fn(() => Promise.resolve({
      id: 123,
      url: 'http://imageurl.....'
    }));
    dataSource.context = {
      rockCookie: 'fakeCookie',
      dataSources: {
        Auth: {
          getCurrentPerson: () => Promise.resolve({
            id: 123
          })
        },
        BinaryFiles: {
          uploadFile: uploadMock,
          getFromId: binaryGetMock
        }
      }
    };
    dataSource.updateProfile = (0, _testUtils.buildGetMock)({
      Id: 51,
      FirstName: 'Vincent',
      LastName: 'Wilson'
    }, dataSource);
    dataSource.get = (0, _testUtils.buildGetMock)([], dataSource);
    const result = await dataSource.uploadProfileImage({
      createReadStream: () => '123',
      filename: 'img.jpg'
    }, 456);
    expect(result).toMatchSnapshot('Upload result');
    expect(uploadMock.mock.calls).toMatchSnapshot('Upload datasource mock');
    expect(binaryGetMock.mock.calls).toMatchSnapshot('Get media datasource mock');
    expect(dataSource.updateProfile.mock.calls).toMatchSnapshot('Update profile mock');
    expect(dataSource.get.mock.calls).toMatchSnapshot('Get updated profile mock');
  });
});
//# sourceMappingURL=data-source.tests.js.map