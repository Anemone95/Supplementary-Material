"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _crypto = _interopRequireDefault(require("crypto"));

var _apolloServer = require("apollo-server");

var _apolloServerEnv = require("apollo-server-env");

var _moment = _interopRequireDefault(require("moment"));

var _rockApolloDataSource = _interopRequireDefault(require("@apollosproject/rock-apollo-data-source"));

var _utils = require("../utils");

var _token = require("./token");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class AuthDataSource extends _rockApolloDataSource.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "resource", 'Auth');

    _defineProperty(this, "rockCookie", null);

    _defineProperty(this, "userToken", null);

    _defineProperty(this, "getCurrentPerson", async ({
      cookie = null
    } = {
      cookie: null
    }) => {
      const {
        rockCookie,
        currentPerson
      } = this.context;
      const userCookie = cookie || rockCookie;

      if (currentPerson) {
        return currentPerson;
      }

      if (userCookie) {
        try {
          const request = await this.request('People/GetCurrentPerson').get({
            options: {
              headers: {
                cookie: userCookie,
                'Authorization-Token': null
              }
            }
          });
          this.context.currentPerson = request;
          return request;
        } catch (e) {
          const person = await this.lookupUserFromCache({
            userCookie
          });

          if (!person) {
            throw new _apolloServer.AuthenticationError('Invalid user cookie; no person found');
          } // TODO: Send over a new cookie to be stored in the `set-cookie` header.


          return person;
        }
      }

      throw new _apolloServer.AuthenticationError('Must be logged in');
    });

    _defineProperty(this, "lookupUserFromCache", async ({
      userCookie
    }) => {
      const {
        Cache
      } = this.context.dataSources;
      const cachedUserName = await Cache.get({
        key: `:userLogins:${_crypto.default.createHash('sha1').update(userCookie).digest('hex')}`
      });

      if (!cachedUserName) {
        throw new _apolloServer.AuthenticationError('Invalid user cookie; no eligble user login found');
      }

      const login = await this.request('/UserLogins').filter(`UserName eq '${cachedUserName}'`).first();

      if (!login || !login.personId) {
        throw new _apolloServer.AuthenticationError('Invalid user cookie; no user login found');
      }

      return this.request('/People').filter(`Id eq ${login.personId}`).first();
    });

    _defineProperty(this, "fetchUserCookie", async (Username, Password) => {
      try {
        // We use `new Response` rather than string/options b/c if conforms more closely with ApolloRESTDataSource
        // (makes mocking in tests WAY easier to use `new Request` as an input in both places)
        const response = await (0, _apolloServerEnv.fetch)(new _apolloServerEnv.Request(`${this.baseURL}/Auth/Login`, {
          method: 'POST',
          body: JSON.stringify({
            Username,
            Password,
            Persisted: true
          }),
          headers: {
            'Content-Type': 'Application/Json'
          }
        }));
        if (response.status >= 400) throw new _apolloServer.AuthenticationError();
        const cookie = response.headers.get('set-cookie');
        return cookie;
      } catch (err) {
        throw new _apolloServer.AuthenticationError('Invalid Credentials');
      }
    });

    _defineProperty(this, "createSession", async ({
      cookie
    }) => {
      const currentUser = await this.getCurrentPerson({
        cookie
      });
      return this.post('/InteractionSessions', {
        PersonAliasId: currentUser.primaryAliasId
      });
    });

    _defineProperty(this, "authenticate", async ({
      identity,
      password
    }) => {
      const {
        Cache
      } = this.context.dataSources;

      try {
        const cookie = await this.fetchUserCookie(identity, password);
        const sessionId = await this.createSession({
          cookie
        });
        const token = (0, _token.generateToken)({
          cookie,
          sessionId
        });
        this.context.rockCookie = cookie;
        this.context.userToken = token;
        this.context.sessionId = sessionId;
        Cache.set({
          key: `:userLogins:${_crypto.default.createHash('sha1').update(cookie).digest('hex')}`,
          data: identity,
          expiresIn: 31556952 // one year

        });
        return {
          token,
          rockCookie: cookie
        };
      } catch (e) {
        if (e instanceof _apolloServer.AuthenticationError) {
          throw new _apolloServer.UserInputError('Username or Password incorrect');
        }

        throw e;
      }
    });

    _defineProperty(this, "personExists", async ({
      identity
    }) => {
      const hasUserName = await this.request(`/UserLogins?$filter=UserName eq '${identity}'`).get();

      if (hasUserName.length) {
        return true;
      }

      return false;
    });

    _defineProperty(this, "createUserProfile", async ({
      email,
      ...otherFields
    }) => {
      try {
        const id = await this.post('/People', {
          Gender: 0,
          // Required by Rock. Listed first so it can be overridden by otherFields
          IsSystem: false // Required by Rock

        });
        await this.patch(`/People/${id}`, { ...otherFields,
          Email: email
        });
        return id;
      } catch (err) {
        console.error(err);
        throw new Error('Unable to create profile!');
      }
    });

    _defineProperty(this, "createUserLogin", async (props = {}) => {
      try {
        const {
          email,
          password,
          personId
        } = props;
        return await this.post('/UserLogins', {
          PersonId: personId,
          EntityTypeId: 27,
          // A default setting we use in Rock-person-creation-flow
          UserName: email,
          PlainTextPassword: password,
          LastLoginDateTime: `${(0, _moment.default)().toISOString()}`
        });
      } catch (err) {
        throw new Error('Unable to create user login!');
      }
    });

    _defineProperty(this, "changePassword", async ({
      password
    }) => {
      const currentUser = await this.getCurrentPerson();
      const {
        email,
        id
      } = currentUser;
      const login = await this.request('/UserLogins').filter(`UserName eq '${email}'`).first();

      if (login) {
        await this.delete(`/UserLogins/${login.id}`);
      }

      await this.createUserLogin({
        personId: id,
        email,
        password
      });
      return this.authenticate({
        identity: email,
        password
      });
    });

    _defineProperty(this, "registerPerson", async ({
      email,
      password,
      userProfile
    }) => {
      const personExists = await this.personExists({
        identity: email
      });
      if (personExists) throw new Error('User already exists!');
      const profileFields = (0, _utils.fieldsAsObject)(userProfile || []);
      const rockUpdateFields = this.context.dataSources.Person.mapApollosFieldsToRock(profileFields);
      const personId = await this.createUserProfile({
        email,
        ...rockUpdateFields
      });
      await this.createUserLogin({
        email,
        password,
        personId
      });
      const token = await this.authenticate({
        identity: email,
        password
      });
      return token;
    });

    _defineProperty(this, "getAuthToken", async () => {
      const {
        rockCookie
      } = this.context;
      if (!rockCookie) throw new _apolloServer.AuthenticationError('Cannot get token, no cookie in context'); // TODO remove this safety check and less secure implementation
      // once core Rock has the GetCurrentPersonImpersonationToken endpoint

      try {
        const token = await this.request(`People/GetCurrentPersonImpersonationToken?expireDateTime=${(0, _moment.default)().add(1, 'weeks').toISOString()}`).get({
          options: {
            headers: {
              cookie: rockCookie,
              'Authorization-Token': null
            }
          }
        });
        return token;
      } catch (e) {
        console.warn('Using deprecated Rock endpoint, upgrade Rock to v10 when available.');
        const {
          id
        } = await this.getCurrentPerson();
        const param = await this.request(`People/GetImpersonationParameter?personId=${id}&expireDateTime=${(0, _moment.default)().add(1, 'weeks').toISOString()}`).get();
        return param.split('=')[1];
      }
    });
  }

}

exports.default = AuthDataSource;
//# sourceMappingURL=data-source.js.map