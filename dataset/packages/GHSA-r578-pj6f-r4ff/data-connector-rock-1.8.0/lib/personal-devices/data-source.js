"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rockApolloDataSource = _interopRequireDefault(require("@apollosproject/rock-apollo-data-source"));

var _config = _interopRequireDefault(require("@apollosproject/config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class PersonalDevices extends _rockApolloDataSource.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "resource", 'PersonalDevices');

    _defineProperty(this, "updateNotificationsEnabled", async (pushId, enabled) => {
      if (pushId === null || enabled === null) throw new Error("Device ID and 'enabled' required.");
      const {
        primaryAliasId
      } = await this.context.dataSources.Auth.getCurrentPerson();
      const {
        id
      } = await this.request().filter(`PersonAliasId eq ${primaryAliasId}`).andFilter(`DeviceRegistrationId eq '${pushId}'`).first();
      if (!id) throw new Error(`Device doesn't exist`);
      return this.patch(`/PersonalDevices/${id}`, {
        NotificationsEnabled: enabled
      });
    });
  }

  async addPersonalDevice({
    pushId
  }) {
    if (!pushId) {
      throw new Error('You must supply a `pushId` to the addPersonalDevice function');
    }

    const existing = await this.request().filter(`DeviceRegistrationId eq '${pushId}'`).first(); // if we already have a device, shortcut the function;

    const currentUser = await this.context.dataSources.Auth.getCurrentPerson();
    if (existing) return currentUser;
    await this.post('/PersonalDevices', {
      PersonAliasId: currentUser.primaryAliasId,
      DeviceRegistrationId: pushId,
      PersonalDeviceTypeValueId: _config.default.ROCK_MAPPINGS.MOBILE_DEVICE_TYPE_ID,
      NotificationsEnabled: 1,
      IsActive: 1
    });
    return currentUser;
  }

  getByPersonAliasId(id) {
    return this.request().filter(`PersonAliasId eq ${id}`).get();
  }

}

exports.default = PersonalDevices;
//# sourceMappingURL=data-source.js.map