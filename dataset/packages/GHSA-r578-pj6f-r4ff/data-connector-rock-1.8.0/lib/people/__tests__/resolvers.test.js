"use strict";

var _graphql = require("graphql");

var _apolloServerEnv = require("apollo-server-env");

var _apolloServer = require("apollo-server");

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _serverCore = require("@apollosproject/server-core");

var _testUtils = require("@apollosproject/server-core/lib/testUtils");

var _dataSchema = require("@apollosproject/data-schema");

var _auth = require("../../auth");

var Person = _interopRequireWildcard(require("../index"));

var _index2 = require("../../index");

var _authMock = _interopRequireDefault(require("../../authMock"));

var _utils = require("../../utils");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// we import the root-level schema and resolver so we test the entire integration:
const Auth = {
  schema: _dataSchema.authSchema,
  dataSource: _authMock.default
};
const {
  getContext,
  getSchema
} = (0, _testUtils.createTestHelpers)({
  Person,
  Auth,
  PersonalDevice: _index2.PersonalDevice
});

_config.default.loadJs({
  ROCK: {
    API_URL: 'https://apollosrock.newspring.cc/api',
    API_TOKEN: 'some-rock-token',
    IMAGE_URL: 'https://apollosrock.newspring.cc/GetImage.ashx'
  }
});

describe('Person', () => {
  let schema;
  let context;
  beforeEach(() => {
    _apolloServerEnv.fetch.resetMocks();

    _apolloServerEnv.fetch.mockRockDataSourceAPI();

    schema = getSchema([_dataSchema.peopleSchema, _dataSchema.mediaSchema, _dataSchema.deviceSchema]);
    context = getContext();
  });
  it("updates a user's attributes, if there is a current user", async () => {
    const query = `
      mutation {
        updateProfileField(input: { field: FirstName, value: "Richard" }) {
          firstName
          id
        }
      }
    `;
    const {
      userToken,
      rockCookie
    } = (0, _auth.registerToken)((0, _auth.generateToken)({
      cookie: 'some-cookie'
    }));
    context.userToken = userToken;
    context.rockCookie = rockCookie;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it('updates multiple fields', async () => {
    const query = `
      mutation {
        updateProfileFields(input: [
          { field: FirstName, value: "Richard" },
          { field: LastName, value: "Walkerton" }
        ]) {
          firstName
          lastName
          id
        }
      }
    `;
    const {
      userToken,
      rockCookie
    } = (0, _auth.registerToken)((0, _auth.generateToken)({
      cookie: 'some-cookie'
    }));
    context.userToken = userToken;
    context.rockCookie = rockCookie;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it("updates a user's gender", async () => {
    const query = `
      mutation {
        updateProfileFields(input: [
          { field: Gender, value: "Male" },
        ]) {
          id
          gender
        }
      }
    `;
    const {
      userToken,
      rockCookie
    } = (0, _auth.registerToken)((0, _auth.generateToken)({
      cookie: 'some-cookie'
    }));
    context.userToken = userToken;
    context.rockCookie = rockCookie;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it("fails to update a user's attributes, without a current user", async () => {
    const query = `
      mutation {
        updateProfileField(input: { field: FirstName, value: "Richard" }) {
          firstName
          id
        }
      }
    `;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  it('gets a single person when querying by root node', async () => {
    const query = `
      query {
        node(
          id: "${(0, _serverCore.createGlobalId)(51, 'Person')}"
        ) {
          ... on Person {
            id
            firstName
            lastName
            nickName
            email
            photo {
              uri
            }
            devices {
              id
              pushId
              notificationsEnabled
            }
          }
        }
      }
    `;
    context.dataSources.PersonalDevice.request = jest.fn(() => ({
      filter: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve([{
          id: '1',
          deviceRegistrationId: 'abc-123',
          notificationsEnabled: true
        }]))
      }))
    }));
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
});
describe('enforceCurrentUser', () => {
  it('will return a field if the queried user is the current user', async () => {
    const context = {
      dataSources: {
        Auth: {
          getCurrentPerson: () => ({
            id: 1
          })
        }
      }
    };
    const resultFunc = (0, _utils.enforceCurrentUser)(({
      firstName
    }) => firstName);
    const result = await resultFunc({
      firstName: 'John',
      id: 1
    }, {}, context, {});
    expect(result).toEqual('John');
  });
  it("won't return a field with no user", async () => {
    const context = {
      dataSources: {
        Auth: {
          getCurrentPerson: () => function (e) {
            throw e;
          }(new _apolloServer.AuthenticationError())
        }
      }
    };
    const resultFunc = (0, _utils.enforceCurrentUser)(({
      firstName
    }) => firstName);
    const result = await resultFunc({
      firstName: 'John',
      id: 1
    }, {}, context, {});
    expect(result).toEqual(null);
  });
  it("won't return a field with a different user", async () => {
    const context = {
      dataSources: {
        Auth: {
          getCurrentPerson: () => ({
            id: 9
          })
        }
      }
    };
    const resultFunc = (0, _utils.enforceCurrentUser)(({
      firstName
    }) => firstName);
    const result = await resultFunc({
      firstName: 'John',
      id: 1
    }, {}, context, {});
    expect(result).toEqual(null);
  });
  it("won't swallow non-auth errors", async () => {
    const context = {
      dataSources: {
        Auth: {
          getCurrentPerson: () => ({
            id: 9
          })
        }
      }
    };
    const resultFunc = (0, _utils.enforceCurrentUser)(({
      firstName
    }) => firstName);
    const result = await resultFunc({
      firstName: 'John',
      id: 1
    }, {}, context, {});
    expect(result).toEqual(null);
  });
  it("won't swallow non-auth errors", () => {
    const context = {
      dataSources: {
        Auth: {
          getCurrentPerson: () => function (e) {
            throw e;
          }(new Error('Random Error'))
        }
      }
    };
    const resultFunc = (0, _utils.enforceCurrentUser)(({
      firstName
    }) => firstName);
    const result = resultFunc({
      firstName: 'John',
      id: 1
    }, {}, context, {});
    expect(result).rejects.toThrowErrorMatchingSnapshot();
  });
});
//# sourceMappingURL=resolvers.test.js.map