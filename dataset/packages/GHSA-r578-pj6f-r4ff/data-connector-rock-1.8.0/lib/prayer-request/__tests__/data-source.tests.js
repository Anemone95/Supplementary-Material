"use strict";

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _jestDateMock = require("jest-date-mock");

var _dataSource = _interopRequireDefault(require("../data-source"));

var _testUtils = require("../../test-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_config.default.loadJs({
  ROCK: {
    API_URL: 'https://apollosrock.newspring.cc/api',
    API_TOKEN: 'some-rock-token',
    IMAGE_URL: 'https://apollosrock.newspring.cc/GetImage.ashx',
    WEB_CAMPUS_ID: 'WEB_CAMPUS_ID',
    GENERAL_PRAYER_CATEGORY_ID: 'GENERAL_PRAYER_CATEGORY_ID'
  }
});

const auth = (dataSource, other = {}) => ({
  getCurrentPerson: (0, _testUtils.buildGetMock)({
    Id: 51,
    FirstName: 'Vincent',
    LastName: 'Wilson',
    PrimaryAliasId: 51,
    Email: 'Email@Email.com',
    ...other
  }, dataSource)
});

const prayerMock = {
  FirstName: 'Conrad',
  LastName: 'VanLandingham',
  Email: 'hi@convan.me',
  RequestedByPersonAliasId: null,
  CategoryId: 2,
  Text: 'Our Father, Who art in heaven, \nHallowed be Thy Name. \nThy Kingdom come. \nThy Will be done, \non earth as it is in Heaven.\n\nGive us this day our daily bread. \nAnd forgive us our trespasses, \nas we forgive those who trespass against us. \nAnd lead us not into temptation, \nbut deliver us from evil. Amen.',
  Answer: '',
  EnteredDateTime: '2020-05-15T12:42:29.227',
  ExpirationDate: '2020-05-29T00:00:00',
  GroupId: null,
  AllowComments: true,
  IsUrgent: false,
  IsPublic: true,
  IsActive: true,
  IsApproved: true,
  FlagCount: null,
  PrayerCount: null,
  ApprovedByPersonAliasId: 62,
  CampusId: 2,
  ApprovedOnDateTime: '2020-05-15T12:42:29.227',
  RequestedByPersonAlias: null,
  Category: null,
  ApprovedByPersonAlias: null,
  CreatedDateTime: '2020-05-15T12:42:29.243',
  ModifiedDateTime: '2020-05-15T12:42:29.243',
  CreatedByPersonAliasId: 62,
  ModifiedByPersonAliasId: 62,
  ModifiedAuditValuesAlreadyUpdated: false,
  Attributes: null,
  AttributeValues: null,
  Id: 13,
  Guid: 'eb90493d-0e41-4a35-b085-3b48ac78cadf',
  ForeignId: null,
  ForeignGuid: null,
  ForeignKey: null
};
describe('Prayer', () => {
  it('constructs', () => {
    expect(new _dataSource.default()).toBeTruthy();
  });
  it('gets daily prayer feed', async () => {
    (0, _jestDateMock.advanceTo)(new Date(2020, 1, 20, 0, 0, 0));
    const dataSource = new _dataSource.default();
    const Auth = auth(dataSource);
    dataSource.context = {
      rockCookie: 'fakeCookie',
      dataSources: {
        Auth
      }
    };
    dataSource.get = (0, _testUtils.buildGetMock)([prayerMock], dataSource);
    const result = await (await dataSource.byDailyPrayerFeed({
      numberDaysSincePrayer: 3
    })).get();
    expect(result).toMatchSnapshot();
    expect(dataSource.get.mock.calls).toMatchSnapshot();
  });
  it('gets by id', () => {
    const dataSource = new _dataSource.default();
    dataSource.get = (0, _testUtils.buildGetMock)({
      Id: 1
    }, dataSource);
    const result = dataSource.getFromId(1);
    expect(result).resolves.toMatchSnapshot();
    expect(dataSource.get.mock.calls).toMatchSnapshot();
  });
  it('flags by id', () => {
    const dataSource = new _dataSource.default();
    dataSource.put = (0, _testUtils.buildGetMock)({
      Id: 1
    }, dataSource);
    const result = dataSource.flag(1);
    expect(result).resolves.toMatchSnapshot();
    expect(dataSource.put.mock.calls).toMatchSnapshot();
  });
  it('incremenet prayed by id', () => {
    const dataSource = new _dataSource.default();
    dataSource.put = (0, _testUtils.buildGetMock)({
      Id: 1
    }, dataSource);
    const result = dataSource.incrementPrayed(1);
    expect(result).resolves.toMatchSnapshot();
    expect(dataSource.put.mock.calls).toMatchSnapshot();
  });
  describe('adding prayer', () => {
    beforeEach(() => (0, _jestDateMock.advanceTo)(new Date(2020, 1, 20, 0, 0, 0)));
    it('adds prayer', async () => {
      const dataSource = new _dataSource.default();
      const Auth = auth(dataSource);
      dataSource.context = {
        rockCookie: 'fakeCookie',
        dataSources: {
          Auth
        }
      };
      dataSource.post = (0, _testUtils.buildGetMock)({
        Id: 15
      }, dataSource);
      dataSource.get = (0, _testUtils.buildGetMock)({
        Id: 15
      }, dataSource);
      const result = await dataSource.addPrayer({
        text: 'My prayer'
      });
      expect(result).toMatchSnapshot();
      expect(dataSource.post.mock.calls).toMatchSnapshot();
      expect(dataSource.get.mock.calls).toMatchSnapshot();
    });
    it('adds anonymous prayer', async () => {
      const dataSource = new _dataSource.default();
      const Auth = auth(dataSource);
      dataSource.context = {
        rockCookie: 'fakeCookie',
        dataSources: {
          Auth
        }
      };
      dataSource.post = (0, _testUtils.buildGetMock)({
        Id: 15
      }, dataSource);
      dataSource.get = (0, _testUtils.buildGetMock)({
        Id: 15
      }, dataSource);
      const result = await dataSource.addPrayer({
        text: 'My prayer',
        isAnonymous: true
      });
      expect(result).toMatchSnapshot();
      expect(dataSource.post.mock.calls).toMatchSnapshot();
      expect(dataSource.get.mock.calls).toMatchSnapshot();
    });
    it('uses nickname', async () => {
      const dataSource = new _dataSource.default();
      const Auth = auth(dataSource, {
        NickName: 'Vinny'
      });
      dataSource.context = {
        rockCookie: 'fakeCookie',
        dataSources: {
          Auth
        }
      };
      dataSource.post = (0, _testUtils.buildGetMock)({
        Id: 15
      }, dataSource);
      dataSource.get = (0, _testUtils.buildGetMock)({
        Id: 15
      }, dataSource);
      const result = await dataSource.addPrayer({
        text: 'My prayer',
        isAnonymous: true
      });
      expect(result).toMatchSnapshot();
      expect(dataSource.post.mock.calls).toMatchSnapshot();
      expect(dataSource.get.mock.calls).toMatchSnapshot();
    });
    it('uses user campus', async () => {
      const dataSource = new _dataSource.default();
      const Auth = auth(dataSource, {
        PrimaryCampusId: 1
      });
      dataSource.context = {
        rockCookie: 'fakeCookie',
        dataSources: {
          Auth
        }
      };
      dataSource.post = (0, _testUtils.buildGetMock)({
        Id: 15
      }, dataSource);
      dataSource.get = (0, _testUtils.buildGetMock)({
        Id: 15
      }, dataSource);
      const result = await dataSource.addPrayer({
        text: 'My prayer',
        isAnonymous: true
      });
      expect(result).toMatchSnapshot();
      expect(dataSource.post.mock.calls).toMatchSnapshot();
      expect(dataSource.get.mock.calls).toMatchSnapshot();
    });
  });
});
//# sourceMappingURL=data-source.tests.js.map