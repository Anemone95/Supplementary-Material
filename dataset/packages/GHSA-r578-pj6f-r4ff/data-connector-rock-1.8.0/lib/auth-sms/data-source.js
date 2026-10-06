"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _crypto = _interopRequireDefault(require("crypto"));

var _apolloServer = require("apollo-server");

var _rockApolloDataSource = _interopRequireDefault(require("@apollosproject/rock-apollo-data-source"));

var _awesomePhonenumber = _interopRequireDefault(require("awesome-phonenumber"));

var _utils = require("../utils");

var _token = require("../auth/token");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class AuthSmsDataSource extends _rockApolloDataSource.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "expanded", true);

    _defineProperty(this, "hashPassword", ({
      pin
    }) => _crypto.default.createHash('sha256').update(`${pin}${_token.secret}`).digest('hex'));

    _defineProperty(this, "parsePhoneNumber", ({
      phoneNumber
    }) => {
      const number = new _awesomePhonenumber.default(phoneNumber, 'US');
      return {
        valid: number.isValid(),
        phoneNumber: number.getNumber('significant'),
        countryCode: _awesomePhonenumber.default.getCountryCodeForRegionCode(number.getRegionCode()),
        // "The international public telecommunication numbering plan", twilio likes numbers to be in this format.
        e164: number.getNumber('e164')
      };
    });

    _defineProperty(this, "userExists", async ({
      identity
    }) => {
      const {
        valid,
        phoneNumber
      } = this.parsePhoneNumber({
        phoneNumber: identity
      });
      let parsedIdentity = identity;

      if (valid) {
        parsedIdentity = phoneNumber;
      }

      const userExists = await this.context.dataSources.Auth.personExists({
        identity: parsedIdentity
      });

      if (userExists) {
        // We are a Rock user and have logged in via sms or username/password
        return 'EXISTING_APP_USER';
      }

      return 'NONE';
    });

    _defineProperty(this, "generateSmsPinAndPassword", () => {
      const pin = `${Math.floor(Math.random() * 1000000)}`.padStart(6, '0');
      const password = this.hashPassword({
        pin
      });
      return {
        pin,
        password
      };
    });

    _defineProperty(this, "createPhoneNumber", ({
      personId,
      phoneNumber,
      countryCode
    }) => this.post('/PhoneNumbers', {
      PersonId: personId,
      IsMessagingEnabled: true,
      IsSystem: false,
      Number: phoneNumber,
      CountryCode: countryCode,
      NumberTypeValueId: 12 // 12 is a Constant Set in Rock, means "Mobile"

    }));

    _defineProperty(this, "createOrFindSmsLoginUserId", async ({
      phoneNumber: inputPhoneNumber,
      userProfile
    }) => {
      const {
        phoneNumber,
        countryCode
      } = this.parsePhoneNumber({
        phoneNumber: inputPhoneNumber
      });
      const existingPhoneNumbers = await this.request('/PhoneNumbers').filter(`Number eq '${phoneNumber}'`).get(); // If we have only one phone number, use that phone number

      if (existingPhoneNumbers.length === 1) {
        return existingPhoneNumbers[0].personId;
      } // Otherwise, create a new user.


      const profileFields = (0, _utils.fieldsAsObject)(userProfile || []);
      const rockUpdateFields = this.context.dataSources.Person.mapApollosFieldsToRock(profileFields);
      const personId = await this.context.dataSources.Auth.createUserProfile({
        email: null,
        ...rockUpdateFields
      }); // And create their phone number.

      await this.createPhoneNumber({
        personId,
        phoneNumber,
        countryCode
      });
      return personId;
    });

    _defineProperty(this, "authenticateWithSms", async ({
      pin,
      phoneNumber: phoneNumberInput,
      userProfile
    }) => {
      const {
        phoneNumber
      } = this.parsePhoneNumber({
        phoneNumber: phoneNumberInput
      });
      const userLogin = await this.request('/UserLogins').filter(`UserName eq '${phoneNumber}'`).first();

      if (!userLogin) {
        throw new _apolloServer.AuthenticationError('Invalid input');
      } // remember that Rock null values are often empty objects!


      if (!userLogin.personId || typeof userLogin.personId === 'object') {
        // We created a login for this user, but don't know who they are yet.
        const personId = await this.createOrFindSmsLoginUserId({
          phoneNumber,
          userProfile
        }); // Update the user login to include the PersonId.

        await this.patch(`/UserLogins/${userLogin.id}`, {
          PersonId: personId
        });
      }

      const password = this.hashPassword({
        pin
      });
      return this.context.dataSources.Auth.authenticate({
        identity: phoneNumber,
        password
      });
    });

    _defineProperty(this, "requestSmsLogin", async ({
      phoneNumber: phoneNumberInput
    }) => {
      // E.164 Regex that twilio recommends
      // https://www.twilio.com/docs/glossary/what-e164
      const {
        valid,
        phoneNumber,
        e164
      } = this.parsePhoneNumber({
        phoneNumber: phoneNumberInput
      });

      if (!valid) {
        throw new _apolloServer.UserInputError(`${phoneNumber} is not a valid phone number`);
      }

      const {
        pin,
        password
      } = this.generateSmsPinAndPassword();
      const existingUserLogin = await this.request('/UserLogins').filter(`UserName eq '${phoneNumber}'`).first();
      let personOptions = {}; // Updating PlainTextPassword via Patch doesn't work, so we delete and recreate.

      if (existingUserLogin) {
        // if we have a PersonId on the user login, we should move it over to the new login.
        if (existingUserLogin.personId) personOptions = {
          PersonId: existingUserLogin.personId
        };
        await this.delete(`/UserLogins/${existingUserLogin.id}`);
      }

      await this.post('/UserLogins', {
        EntityTypeId: 27,
        // A default setting we use in Rock-person-creation-flow
        UserName: phoneNumber,
        PlainTextPassword: password,
        ...personOptions
      });
      await this.context.dataSources.Sms.sendSms({
        to: e164,
        body: `Your login code is ${pin}`
      });
      return {
        success: true,
        userAuthStatus: existingUserLogin ? 'EXISTING_APP_USER' : 'NONE'
      };
    });
  }

}

exports.default = AuthSmsDataSource;
//# sourceMappingURL=data-source.js.map