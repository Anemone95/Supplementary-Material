"use strict";

var _graphql = require("graphql");

var _apolloServerEnv = require("apollo-server-env");

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _testUtils = require("@apollosproject/server-core/lib/testUtils");

var _dataSchema = require("@apollosproject/data-schema");

var Auth = _interopRequireWildcard(require("../index"));

var Person = _interopRequireWildcard(require("../../people/index"));

var _token = require("../token");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

_config.default.loadJs({
  ROCK: {
    API_URL: 'https://apollosrock.newspring.cc/api',
    API_TOKEN: 'some-rock-token'
  }
});

class CacheMock {
  constructor() {
    _defineProperty(this, "get", jest.fn());

    _defineProperty(this, "set", jest.fn());
  }

}

const Cache = {
  dataSource: CacheMock
};
const {
  getContext,
  getSchema
} = (0, _testUtils.createTestHelpers)({
  Auth,
  Person,
  Cache
});
describe('Auth', () => {
  let schema;
  let context;
  beforeEach(() => {
    _apolloServerEnv.fetch.resetMocks();

    _apolloServerEnv.fetch.mockRockDataSourceAPI();

    schema = getSchema([_dataSchema.peopleSchema, _dataSchema.mediaSchema]);
    context = getContext();
  });
  it('logs in a user', async () => {
    const query = `
      mutation {
        authenticate(identity: "some-identity", password: "good") {
          user {
            id
            profile {
              email
            }
            rockToken
            rock {
              authCookie
              authToken
            }
          }
        }
      }
    `;
    const rootValue = {};
    context.dataSources.Auth.getAuthToken = jest.fn(() => 'some token');
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
    expect(context.dataSources.Cache.set.mock.calls).toMatchSnapshot();
  });
  it('throws invalid credentials error on bad password', async () => {
    const query = `
      mutation {
        authenticate(identity: "some-identity", password: "bad") {
          user {
            id
          }
        }
      }
    `;
    const rootValue = {};
    const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
    expect(result).toMatchSnapshot();
  });
  describe('currentUser query', () => {
    const query = `
      query {
        currentUser {
          id
          profile {
            email
          }
        }
      }
    `;
    it('requires you to be logged in', async () => {
      const rootValue = {};
      const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
      expect(result).toMatchSnapshot();
    });
    it('queries current user when logged in', async () => {
      const rootValue = {};
      const token = (0, _token.generateToken)({
        cookie: 'some-cookie',
        sessionId: 123
      });
      context = getContext({
        req: {
          headers: {
            authorization: token
          }
        }
      });
      const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
      expect(result).toMatchSnapshot();
    });
    it('will return current person from context to avoid duplicate checks', async () => {
      const rootValue = {};
      const token = (0, _token.generateToken)({
        cookie: 'some-cookie',
        sessionId: 123
      });
      context = getContext({
        req: {
          headers: {
            authorization: token
          }
        }
      });
      context.dataSources.Auth.get = jest.fn(() => ({}));
      context.currentPerson = {
        id: 123456
      };
      const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
      expect(result).toMatchSnapshot();
      expect(context.dataSources.Auth.get.mock).toMatchSnapshot(); // the `get` method shouldn't bet hit b/c we aren't calling `currentUser`
      // the current user is already on the context

      expect(context.dataSources.Auth.get.mock.calls.length).toEqual(0);
    });
    it('logs a user out without a sessionId', async () => {
      const rootValue = {};
      const token = (0, _token.generateToken)({
        cookie: 'some-cookie'
      });
      context = getContext({
        req: {
          headers: {
            authorization: token
          }
        }
      });
      const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
      expect(result).toMatchSnapshot();
    });
    it('queries current user when logged in', async () => {
      const rootValue = {};

      try {
        const {
          userToken,
          rockCookie
        } = (0, _token.registerToken)('asdfasdfasdf');
        context.userToken = userToken;
        context.rockCookie = rockCookie;
        await (0, _graphql.graphql)(schema, query, rootValue, context);
      } catch (e) {
        expect(e.message).toEqual('Invalid token');
      }
    });
  });
  it('registers an auth token and passes the cookie on requests to rock', async () => {
    const token = (0, _token.generateToken)({
      cookie: 'some-cookie',
      sessionId: 123
    });
    const secondContext = getContext({
      req: {
        headers: {
          authorization: token
        }
      }
    });
    const query = `
      query {
        currentUser {
          id
        }
      }
    `;
    const rootValue = {};
    await (0, _graphql.graphql)(schema, query, rootValue, secondContext);
    expect(_apolloServerEnv.fetch.mock.calls[0][0].headers).toMatchSnapshot();
  });
  describe('Change Password', () => {
    it('throws error without a current user', async () => {
      try {
        await context.dataSources.Auth.changePassword({
          password: 'newPassword'
        });
      } catch (e) {
        expect(e.message).toEqual('Must be logged in');
      }
    });
    it('generates a new token', async () => {
      const {
        userToken,
        rockCookie
      } = (0, _token.registerToken)((0, _token.generateToken)({
        cookie: 'some-cookie'
      }));
      context.userToken = userToken;
      context.rockCookie = rockCookie;
      const {
        rockCookie: newCookie,
        token: newToken
      } = await context.dataSources.Auth.changePassword({
        password: 'good'
      });
      expect(newCookie).toEqual('some cookie');
      expect(typeof newToken).toEqual('string');
    });
  });
  describe('User Registration', () => {
    it('checks if user is already registered', async () => {
      const result = await context.dataSources.Auth.personExists({
        identity: 'isaac.hardy@newspring.cc'
      });
      expect(result).toEqual(true);
    });
    it('throws error in personExists', async () => {
      const result = await context.dataSources.Auth.personExists({
        identity: 'fake'
      });
      expect(result).toEqual(false);
    });
    it('throws error in createUserProfile', async () => {
      try {
        await context.dataSources.Auth.createUserProfile({
          email: ''
        });
      } catch (e) {
        expect(e.message).toEqual('Unable to create profile!');
      }
    });
    it('creates user login', async () => {
      const result = await context.dataSources.Auth.createUserLogin({
        email: 'isaac.hardy@newspring.cc',
        password: 'password',
        personId: 35
      });
      expect(result).toEqual({
        id: 21
      });
    });
    it('throws error in createUserLogin', async () => {
      try {
        await context.dataSources.Auth.createUserLogin({
          email: '',
          password: 'password',
          personId: 35
        });
      } catch (e) {
        expect(e.message).toEqual('Unable to create user login!');
      }
    });
    it('creates new registration', async () => {
      const query = `
        mutation {
          registerPerson(email: "hello.world@earth.org", password: "good") {
            user {
              id
              profile {
                email
              }
            }
          }
        }
      `;
      const rootValue = {};

      context.dataSources.Auth.post = () => 35;

      context.dataSources.Auth.patch = () => null;

      const result = await (0, _graphql.graphql)(schema, query, rootValue, context);
      expect(result).toMatchSnapshot();
    });
    it('passes the right args when creating a registration', async () => {
      const query = `
        mutation {
          registerPerson(email: "hello.world@earth.org", password: "good") {
            user {
              id
              profile {
                id
                email
              }
            }
          }
        }
      `;
      const createUserProfile = jest.fn().mockImplementation(async () => Promise.resolve('123'));
      const createUserLogin = jest.fn();
      const rootValue = {};
      context.dataSources.Auth.createUserLogin = createUserLogin;
      context.dataSources.Auth.createUserProfile = createUserProfile;
      await (0, _graphql.graphql)(schema, query, rootValue, context);
      expect(createUserProfile.mock.calls).toMatchSnapshot();
      expect(createUserLogin.mock.calls).toMatchSnapshot();
    });
  });
});
//# sourceMappingURL=index.tests.js.map