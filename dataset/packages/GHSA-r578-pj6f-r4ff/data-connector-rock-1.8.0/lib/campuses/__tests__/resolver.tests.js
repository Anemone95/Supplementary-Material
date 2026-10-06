"use strict";

var _graphql = require("graphql");

var _apolloServerEnv = require("apollo-server-env");

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _serverCore = require("@apollosproject/server-core");

var _testUtils = require("@apollosproject/server-core/lib/testUtils");

var _dataSchema = require("@apollosproject/data-schema");

var Campus = _interopRequireWildcard(require("../index"));

var _index2 = require("../../index");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class AuthDataSourceMock {
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

    _defineProperty(this, "getCurrentPersonAlternateLookupId", () => '0faad2f-3258f47');
  }

}

const Auth = {
  schema: _dataSchema.authSchema,
  dataSource: AuthDataSourceMock,
  resolver: {
    Query: {
      currentUser: () => ({
        profile: {
          id: 51
        }
      })
    }
  }
};
const {
  getContext,
  getSchema
} = (0, _testUtils.createTestHelpers)({
  Campus,
  Person: _index2.Person,
  Auth
});

_config.default.loadJs({
  ROCK: {
    API_URL: 'https://apollosrock.newspring.cc/api',
    API_TOKEN: 'some-rock-token',
    IMAGE_URL: 'https://apollosrock.newspring.cc/GetImage.ashx'
  }
});

describe('Campus', () => {
  let schema;
  let context;
  beforeEach(() => {
    _apolloServerEnv.fetch.resetMocks();

    _apolloServerEnv.fetch.mockRockDataSourceAPI();

    schema = getSchema([_dataSchema.campusSchema]);
    context = getContext();
  });
  it('gets a campus by id', async () => {
    const query = `
      query {
        node(id: "${(0, _serverCore.createGlobalId)(1, 'Campus')}") {
          ...on Campus {
            id
            name
            street1
            street2
            city
            state
            postalCode
            latitude
            longitude
            image {
              uri
            }
            distanceFromLocation
          }
        }
      }
    `;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it('gets a campus by id', async () => {
    const query = `
      query {
        node(id: "${(0, _serverCore.createGlobalId)(5, 'Campus')}") {
          ...on Campus {
            id
            name
            street1
            street2
            city
            state
            postalCode
            latitude
            longitude
            image {
              uri
            }
            distanceFromLocation
          }
        }
      }
    `;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it('gets a campus by id with location', async () => {
    const query = `
      query {
        node(id: "${(0, _serverCore.createGlobalId)(1, 'Campus')}") {
          ...on Campus {
            id
            name
            street1
            street2
            city
            state
            postalCode
            latitude
            longitude
            image {
              uri
            }
            distanceFromLocation(location: { latitude: 34, longitude: -82 })
          }
        }
      }
    `;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it('gets campuses sorted by location', async () => {
    const query = `
      query {
        campuses(location: { latitude: 34.59814, longitude: -82.62045 }) {
            id
            name
            street1
            street2
            city
            state
            postalCode
            latitude
            longitude
            image {
              uri
            }
            distanceFromLocation
        }
      }
    `;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it('gets campuses sorted by location with remote campuses first', async () => {
    const query = `
      query {
        campuses(location: { latitude: 35.8617, longitude: 104.1954 }) {
            id
            name
            street1
            street2
            city
            state
            postalCode
            latitude
            longitude
            image {
              uri
            }
            distanceFromLocation
        }
      }
    `;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it('gets campuses (without location)', async () => {
    const query = `
      query {
        campuses {
            id
            name
            street1
            street2
            city
            state
            postalCode
            latitude
            longitude
            image {
              uri
            }
            distanceFromLocation
        }
      }
    `;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
    expect(_apolloServerEnv.fetch.mock.calls).toMatchSnapshot();
  });
  it("gets current user's campus", async () => {
    const query = `
      query {
        currentUser {
          profile {
            campus {
              id
              name
              latitude
              longitude
            }
          }
        }
      }
    `;
    const rootValue = {};
    const getMock = jest.fn(() => Promise.resolve([{
      campus: {
        id: 1,
        name: 'the best campus',
        location: {
          latitude: 1.1,
          longitude: 2.2
        }
      }
    }]));
    context.dataSources.Campus.get = getMock;
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
    expect(getMock.mock.calls).toMatchSnapshot();
  });
  it("gets current user's campus", async () => {
    const query = `
      query {
        currentUser {
          profile {
            campus {
              id
              name
              latitude
              longitude
            }
          }
        }
      }
    `;
    const rootValue = {};
    const getMock = jest.fn(() => Promise.resolve([{
      campus: {
        id: 5,
        name: 'the best campus',
        location: {
          latitude: 1.1,
          longitude: 2.2
        }
      }
    }]));
    context.dataSources.Campus.get = getMock;
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
    expect(getMock.mock.calls).toMatchSnapshot();
  });
  it('returns null if a user has no campus', async () => {
    const query = `
      query {
        currentUser {
          profile {
            campus {
              id
              name
            }
          }
        }
      }
    `;
    const rootValue = {};
    const getMock = jest.fn(() => Promise.resolve([]));
    context.dataSources.Campus.get = getMock;
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
    expect(getMock.mock.calls).toMatchSnapshot();
  });
  it("updates a current user's campus", async () => {
    const query = `
      mutation {
        updateUserCampus(campusId: "${(0, _serverCore.createGlobalId)(123, 'Campus')}") {
          campus {
            id
            name
          }
        }
      }
    `;
    const rootValue = {};
    const getMock = jest.fn(() => Promise.resolve([{
      id: 1,
      campus: {
        id: 123,
        name: 'the very best campus',
        location: {
          latitude: 1.1,
          longitude: 2.2
        }
      }
    }]));
    const patchMock = jest.fn(() => Promise.resolve());
    context.dataSources.Campus.get = getMock;
    context.dataSources.Campus.patch = patchMock;
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
    expect(getMock.mock.calls).toMatchSnapshot();
    expect(patchMock.mock.calls).toMatchSnapshot();
  });
  it('supports overriding the remote campus fields', async () => {
    const query = `
      query {
        campuses(location: { latitude: 35.8617, longitude: 104.1954 }) {
            id
            name
            street1
            street2
            city
            state
            postalCode
            latitude
            longitude
            image {
              uri
            }
            distanceFromLocation
        }
      }
    `;
    const rootValue = {};

    _config.default.loadJs({
      REMOTE_CAMPUS: {
        FIELDS: {
          street1: 'Test street',
          city: 'Test city',
          state: 'A state of being'
        }
      }
    });

    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
});
//# sourceMappingURL=resolver.tests.js.map