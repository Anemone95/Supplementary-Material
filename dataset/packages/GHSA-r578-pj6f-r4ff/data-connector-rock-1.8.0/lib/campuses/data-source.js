"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = require("lodash");

var _rockApolloDataSource = _interopRequireDefault(require("@apollosproject/rock-apollo-data-source"));

var _serverCore = require("@apollosproject/server-core");

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Campus extends _rockApolloDataSource.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "resource", 'Campuses');

    _defineProperty(this, "expanded", true);

    _defineProperty(this, "getFromId", id => this.request().filter(`Id eq ${id}`).expand('Location').expand('Location/Image').expand('CampusTypeValue').first());

    _defineProperty(this, "getAll", () => this.request().filter('IsActive eq true').expand('Location').expand('Location/Image').expand('CampusTypeValue').cache({
      ttl: 600
    }) // ten minutes
    .get());

    _defineProperty(this, "getByLocation", async ({
      latitude,
      longitude
    } = {}) => {
      let campuses = await this.getAll();
      const onlineCampuses = campuses.filter(({
        campusTypeValue
      }) => (campusTypeValue === null || campusTypeValue === void 0 ? void 0 : campusTypeValue.value) === 'Online');
      campuses = campuses.filter(({
        campusTypeValue
      }) => (campusTypeValue === null || campusTypeValue === void 0 ? void 0 : campusTypeValue.value) !== 'Online');
      campuses = campuses.map(campus => ({ ...campus,
        distanceFromLocation: (0, _utils.latLonDistance)(latitude, longitude, campus.location.latitude, campus.location.longitude)
      }));
      campuses = campuses.sort((a, b) => a.distanceFromLocation - b.distanceFromLocation);

      if (campuses.every(({
        distanceFromLocation
      }) => distanceFromLocation > 50)) {
        campuses = [...onlineCampuses, ...campuses];
      } else {
        campuses = [...campuses, ...onlineCampuses];
      }

      return campuses;
    });

    _defineProperty(this, "getForPerson", async ({
      personId
    }) => {
      const family = await this.request(`/Groups/GetFamilies/${personId}`).expand('Campus').expand('Campus/Location').expand('Campus/CampusTypeValue').expand('Campus/Location/Image').first();
      /* Ensure we have a valid campus instead of returning an empty object
       * if `family.campus` is empty Rock sends:
       *   `{ campus: { location: {} } }`
       */

      if (family && family.campus && family.campus.location) {
        return family.campus;
      }

      return null;
    });

    _defineProperty(this, "ONLINE_CAMPUS_FIELDS", {
      street1: 'No locations near you. ',
      city: "When there's one",
      state: "we'll let you know!",
      postalCode: ''
    });

    _defineProperty(this, "getAddressField", ({
      field,
      root
    }) => {
      var _root$campusTypeValue;

      if (((_root$campusTypeValue = root.campusTypeValue) === null || _root$campusTypeValue === void 0 ? void 0 : _root$campusTypeValue.value) === 'Online') {
        return (0, _lodash.get)(_config.default, `ONLINE_CAMPUS.FIELDS.${field}`) || // TODO: deprecated, use ONLINE_CAMPUS_FIELDS and swap in config yaml
        (0, _lodash.get)(_config.default, `REMOTE_CAMPUS.FIELDS.${field}`) || this.ONLINE_CAMPUS_FIELDS[field];
      }

      return root.location[field];
    });

    _defineProperty(this, "updateCurrentUserCampus", async ({
      campusId
    }) => {
      const {
        Auth
      } = this.context.dataSources;
      const currentUser = await Auth.getCurrentPerson();
      const personGroup = await this.request(`/Groups/GetFamilies/${currentUser.id}`).first();
      if (!personGroup) return null;
      const {
        id: rockCampusId
      } = (0, _serverCore.parseGlobalId)(campusId);
      await this.patch(`/Groups/${personGroup.id}`, {
        CampusId: rockCampusId
      });
      return currentUser;
    });
  }

}

exports.default = Campus;
//# sourceMappingURL=data-source.js.map