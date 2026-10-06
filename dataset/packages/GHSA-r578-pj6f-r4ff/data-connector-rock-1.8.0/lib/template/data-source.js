"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rockApolloDataSource = _interopRequireDefault(require("@apollosproject/rock-apollo-data-source"));

var _apolloServer = require("apollo-server");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Template extends _rockApolloDataSource.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "renderTemplate", async ({
      template,
      currentPersonId
    }) => {
      const personId = currentPersonId || (await this.context.dataSources.Auth.getCurrentPerson()).id;
      if (!personId) throw new _apolloServer.AuthenticationError('Must provide a `currentPersonId` context or be logged in');
      const templateWithContext = `{% person id:'${personId}' %}${template}{% endperson %}`;
      const result = await this.post('Lava/RenderTemplate', {
        template: templateWithContext
      });
      return JSON.parse(result).template;
    });
  }

}

exports.default = Template;
//# sourceMappingURL=data-source.js.map