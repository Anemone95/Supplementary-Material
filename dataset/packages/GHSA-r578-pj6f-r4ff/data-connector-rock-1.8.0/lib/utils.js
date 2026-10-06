"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.enforceCurrentUser = exports.latLonDistance = exports.fieldsAsObject = exports.createImageUrlFromGuid = exports.enforceProtocol = void 0;

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _apolloServer = require("apollo-server");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const enforceProtocol = uri => uri.startsWith('//') ? `https:${uri}` : uri;

exports.enforceProtocol = enforceProtocol;

const createImageUrlFromGuid = uri => uri.split('-').length === 5 ? `${_config.default.ROCK.IMAGE_URL}?guid=${uri}` : enforceProtocol(uri);

exports.createImageUrlFromGuid = createImageUrlFromGuid;

const fieldsAsObject = fields => fields.reduce((accum, {
  field,
  value
}) => ({ ...accum,
  [field]: typeof value === 'string' ? value.trim() : value
}), {});

exports.fieldsAsObject = fieldsAsObject;

const latLonDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const radlat1 = Math.PI * lat1 / 180;
  const radlat2 = Math.PI * lat2 / 180;
  const theta = lon1 - lon2;
  const radtheta = Math.PI * theta / 180;
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

  if (dist > 1) {
    dist = 1;
  }

  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515;
  return dist;
};

exports.latLonDistance = latLonDistance;

const enforceCurrentUser = func => async (root, args, context, info) => {
  try {
    const currentPerson = await context.dataSources.Auth.getCurrentPerson();

    if (root.id !== currentPerson.id) {
      return null;
    }
  } catch (e) {
    if (!(e instanceof _apolloServer.AuthenticationError)) {
      throw e;
    }

    return null;
  }

  return func(root, args, context, info);
};

exports.enforceCurrentUser = enforceCurrentUser;
//# sourceMappingURL=utils.js.map