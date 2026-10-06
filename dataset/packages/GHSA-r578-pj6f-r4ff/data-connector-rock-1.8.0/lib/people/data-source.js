"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _apolloServer = require("apollo-server");

var _lodash = require("lodash");

var _rockApolloDataSource = _interopRequireDefault(require("@apollosproject/rock-apollo-data-source"));

var _moment = _interopRequireDefault(require("moment"));

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const RockGenderMap = {
  Unknown: 0,
  Male: 1,
  Female: 2
};

class Person extends _rockApolloDataSource.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "resource", 'People');

    _defineProperty(this, "getFromId", id => this.request().filter(`Id eq ${id}`).expand('Photo').first());

    _defineProperty(this, "getFromAliasId", async id => {
      // Fetch the PersonAlias, selecting only the PersonId.
      const personAlias = await this.request('/PersonAlias').filter(`Id eq ${id}`).select('PersonId').first(); // If we have a personAlias, return him.

      if (personAlias) {
        return this.getFromId(personAlias.personId);
      } // Otherwise, return null.


      return null;
    });

    _defineProperty(this, "getPersonas", async ({
      categoryId
    }) => {
      const {
        dataSources: {
          RockConstants,
          Auth
        }
      } = this.context; // Get current user

      const {
        id
      } = await Auth.getCurrentPerson(); // Get the entity type ID of the Person model

      const personEntityTypeId = await RockConstants.modelType('Person'); // Rely on custom code without the plugin.
      // Use plugin, if the user has set USE_PLUGIN to true.
      // In general, you should ALWAYS use the plugin if possible.

      const endpoint = (0, _lodash.get)(_config.default, 'ROCK.USE_PLUGIN', false) ? 'Apollos/GetPersistedDataViewsForEntity' : 'DataViews/GetPersistedDataViewsForEntity'; // Return a list of all dataviews by GUID a user is a memeber

      return this.request(endpoint).find(`${personEntityTypeId.id}/${id}?categoryId=${categoryId}`).select('Guid').get();
    });

    _defineProperty(this, "mapGender", ({
      gender
    }) => {
      // If the gender is coming from Rock (an int) map into the string value.
      if (typeof gender === 'number') {
        return Object.keys(RockGenderMap).find(key => RockGenderMap[key] === gender);
      } // Otherwise return the string value.


      return gender;
    });

    _defineProperty(this, "mapApollosFieldsToRock", fields => {
      const profileFields = { ...fields
      };

      if (profileFields.Gender) {
        if (!Object.keys(RockGenderMap).includes(profileFields.Gender)) {
          throw new _apolloServer.UserInputError('Rock gender must be either Unknown, Male, or Female');
        }

        profileFields.Gender = RockGenderMap[profileFields.Gender];
      }

      let rockUpdateFields = { ...profileFields
      };

      if (profileFields.BirthDate) {
        delete rockUpdateFields.BirthDate;
        const birthDate = (0, _moment.default)(profileFields.BirthDate);

        if (!birthDate.isValid()) {
          throw new _apolloServer.UserInputError('BirthDate must be a valid date');
        }

        rockUpdateFields = { ...rockUpdateFields,
          // months in moment are 0 indexed
          BirthMonth: birthDate.month() + 1,
          BirthDay: birthDate.date(),
          BirthYear: birthDate.year()
        };
      }

      return rockUpdateFields;
    });

    _defineProperty(this, "updateProfile", async fields => {
      const currentPerson = await this.context.dataSources.Auth.getCurrentPerson();
      if (!currentPerson) throw new _apolloServer.AuthenticationError('Invalid Credentials');
      const profileFields = (0, _utils.fieldsAsObject)(fields);
      const rockUpdateFields = this.mapApollosFieldsToRock(profileFields); // Because we have a custom enum for Gender, we do this transform prior to creating our "update object"
      // i.e. our schema will send Gender: 1 as Gender: Male

      await this.patch(`/People/${currentPerson.id}`, rockUpdateFields);
      return { ...currentPerson,
        ...(0, _lodash.mapKeys)(profileFields, (_, key) => (0, _lodash.camelCase)(key))
      };
    });

    _defineProperty(this, "uploadProfileImage", async (file, length) => {
      const {
        dataSources: {
          Auth,
          BinaryFiles
        }
      } = this.context;
      const currentPerson = await Auth.getCurrentPerson();
      if (!currentPerson) throw new _apolloServer.AuthenticationError('Invalid Credentials');
      const {
        createReadStream,
        filename
      } = await file;
      const stream = createReadStream();
      const photoId = await BinaryFiles.uploadFile({
        filename,
        stream,
        length
      });
      const person = await this.updateProfile([{
        field: 'PhotoId',
        value: photoId
      }]);
      const photo = await BinaryFiles.getFromId(photoId);
      return { ...person,
        photo
      };
    });
  }

}

exports.default = Person;
//# sourceMappingURL=data-source.js.map