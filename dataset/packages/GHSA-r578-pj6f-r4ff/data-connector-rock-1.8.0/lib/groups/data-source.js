"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rockApolloDataSource = _interopRequireDefault(require("@apollosproject/rock-apollo-data-source"));

var _config = _interopRequireDefault(require("@apollosproject/config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  ROCK_MAPPINGS
} = _config.default;

class Group extends _rockApolloDataSource.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "resource", 'Groups');

    _defineProperty(this, "expanded", true);

    _defineProperty(this, "groupTypeMap", {
      Serving: ROCK_MAPPINGS.SERVING_GROUP_TYPE_ID,
      Community: ROCK_MAPPINGS.COMMUNITY_GROUP_TYPE_ID,
      Family: ROCK_MAPPINGS.FAMILY_GROUP_TYPE_ID
    });

    _defineProperty(this, "getFromId", ({
      id
    }) => this.request().find(id).expand('Members').get());

    _defineProperty(this, "getMembers", async groupId => {
      const {
        Person
      } = this.context.dataSources;
      const members = await this.request('GroupMembers').andFilter(`GroupId eq ${groupId}`).get();
      return Promise.all(members.map(({
        personId
      }) => Person.getFromId(personId)));
    });

    _defineProperty(this, "getLeaders", async groupId => {
      const {
        Person
      } = this.context.dataSources;
      const members = await this.request('GroupMembers').filter(`GroupId eq ${groupId}`).andFilter('GroupRole/IsLeader eq true').expand('GroupRole').get();
      const leaders = await Promise.all(members.map(({
        personId
      }) => Person.getFromId(personId)));
      return leaders.length ? leaders : null;
    });

    _defineProperty(this, "getByPerson", async ({
      personId,
      type = null,
      asLeader = false
    }) => {
      // Get the active groups that the person is a member of.
      // Conditionally filter that list of groups on whether or not your
      // role in that group is that of "Leader".
      const groupAssociations = await this.request('GroupMembers').expand('GroupRole').filter(`PersonId eq ${personId} ${asLeader ? ' and GroupRole/IsLeader eq true' : ''}`).andFilter(`GroupMemberStatus ne 'Inactive'`).get(); // Get the actual group data for the groups above.

      const groups = await Promise.all(groupAssociations.map(({
        groupId
      }) => this.getFromId({
        id: groupId
      }))); // Filter the groups to make sure we only pull those that are
      // active and NOT archived

      const filteredGroups = await Promise.all(groups.filter(group => group.isActive === true && group.isArchived === false)); // Remove the groups that aren't of the types we want and return.

      return filteredGroups.filter(({
        groupTypeId
      }) => type ? groupTypeId === this.groupTypeMap[type] : Object.values(this.groupTypeMap).includes(groupTypeId));
    });
  }

}

exports.default = Group;
//# sourceMappingURL=data-source.js.map