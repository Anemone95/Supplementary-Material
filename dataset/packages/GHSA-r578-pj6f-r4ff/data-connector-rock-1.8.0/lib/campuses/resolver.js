"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _serverCore = require("@apollosproject/server-core");

var _utils = require("../utils");

var _default = {
  Query: {
    campuses: (root, {
      location
    }, {
      dataSources
    }) => dataSources.Campus.getByLocation(location)
  },
  Campus: {
    id: ({
      id
    }, args, context, {
      parentType
    }) => (0, _serverCore.createGlobalId)(id, parentType.name),
    latitude: ({
      location
    }) => location.latitude,
    longitude: ({
      location
    }) => location.longitude,
    postalCode: (root, args, {
      dataSources: {
        Campus
      }
    }) => Campus.getAddressField({
      field: 'postalCode',
      root
    }),
    city: (root, args, {
      dataSources: {
        Campus
      }
    }) => Campus.getAddressField({
      field: 'city',
      root
    }),
    state: (root, args, {
      dataSources: {
        Campus
      }
    }) => Campus.getAddressField({
      field: 'state',
      root
    }),
    street1: (root, args, {
      dataSources: {
        Campus
      }
    }) => Campus.getAddressField({
      field: 'street1',
      root
    }),
    street2: (root, args, {
      dataSources: {
        Campus
      }
    }) => Campus.getAddressField({
      field: 'street2',
      root
    }),
    image: ({
      location
    }) => location.image ? {
      uri: (0, _utils.createImageUrlFromGuid)(location.image.guid),
      width: location.image.width,
      height: location.image.height
    } : null,
    distanceFromLocation: (campus, {
      location
    } = {}) => {
      if (location) {
        return (0, _utils.latLonDistance)(location.latitude, location.longitude, campus.location.latitude, campus.location.longitude);
      }

      return campus.distanceFromLocation;
    }
  },
  Person: {
    campus: (0, _utils.enforceCurrentUser)(({
      id
    }, args, {
      dataSources
    }) => dataSources.Campus.getForPerson({
      personId: id
    }))
  },
  Mutation: {
    updateUserCampus: (root, {
      campusId
    }, {
      dataSources
    }) => dataSources.Campus.updateCurrentUserCampus({
      campusId
    })
  }
};
exports.default = _default;
//# sourceMappingURL=resolver.js.map