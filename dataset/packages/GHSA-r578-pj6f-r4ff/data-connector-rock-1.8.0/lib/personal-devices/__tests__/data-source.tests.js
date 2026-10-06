"use strict";

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _apolloServer = require("apollo-server");

var _dataSource = _interopRequireDefault(require("../data-source"));

var _testUtils = require("../../test-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_config.default.loadJs({
  ROCK: {
    API_URL: 'https://apollosrock.newspring.cc/api',
    API_TOKEN: 'some-rock-token',
    IMAGE_URL: 'https://apollosrock.newspring.cc/GetImage.ashx'
  },
  ROCK_MAPPINGS: {
    MOBILE_DEVICE_TYPE_ID: 671
  }
});

const buildDataSource = Auth => {
  const dataSource = new _dataSource.default();
  dataSource.context = {
    dataSources: {
      Auth
    }
  };
  return dataSource;
};

const AuthMock = {
  getCurrentPerson: () => ({
    primaryAliasId: 123
  })
};
describe('Personal device data source', () => {
  it("must post a user's device to Rock", async () => {
    const dataSource = buildDataSource(AuthMock);
    dataSource.get = (0, _testUtils.buildGetMock)([], dataSource);
    dataSource.post = (0, _testUtils.buildGetMock)('123', dataSource);
    const result = await dataSource.addPersonalDevice({
      pushId: 'somepushid'
    });
    expect(result).toMatchSnapshot();
    expect(dataSource.post).toMatchSnapshot();
  });
  it('must exit early if a device is found', async () => {
    const dataSource = buildDataSource(AuthMock);
    dataSource.get = (0, _testUtils.buildGetMock)([{
      Id: 'some device'
    }], dataSource);
    dataSource.post = (0, _testUtils.buildGetMock)('123', dataSource);
    const result = await dataSource.addPersonalDevice({
      pushId: 'somepushid'
    });
    expect(result).toMatchSnapshot();
    expect(dataSource.post).toMatchSnapshot();
  });
  it('must raise an error without a pushId', async () => {
    const dataSource = buildDataSource(AuthMock);
    dataSource.get = (0, _testUtils.buildGetMock)([], dataSource);
    await expect(dataSource.addPersonalDevice({
      pushId: null
    })).rejects.toThrow();
  });
  it('raise an error without a logged in user', async () => {
    const dataSource = buildDataSource({
      getCurrentPerson: () => function (e) {
        throw e;
      }(new _apolloServer.AuthenticationError())
    });
    dataSource.get = (0, _testUtils.buildGetMock)([], dataSource);
    await expect(dataSource.addPersonalDevice({
      pushId: 'somepushid'
    })).rejects.toThrow();
  });
  it('disable notifications', async () => {
    const dataSource = buildDataSource(AuthMock);
    dataSource.get = (0, _testUtils.buildGetMock)([{
      id: 123
    }], dataSource);
    dataSource.patch = (0, _testUtils.buildGetMock)('123', dataSource);
    const result = await dataSource.updateNotificationsEnabled('somepushid', false);
    expect(result).toMatchSnapshot();
    expect(dataSource.get).toMatchSnapshot();
    expect(dataSource.patch).toMatchSnapshot();
  });
});
//# sourceMappingURL=data-source.tests.js.map