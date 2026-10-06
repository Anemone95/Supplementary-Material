"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _serverCore = require("@apollosproject/server-core");

var _rockApolloDataSource = _interopRequireDefault(require("@apollosproject/rock-apollo-data-source"));

var _config = _interopRequireDefault(require("@apollosproject/config"));

var _lodash = require("lodash");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Interactions extends _rockApolloDataSource.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "resource", 'Interactions');

    _defineProperty(this, "ADDITIONAL_INTERACTIONS_MAP", {
      ContentItem: {
        COMPLETE: this.updateSeriesStarted.bind(this)
      },
      PrayerRequest: {
        PRAY: this.incrementPrayer.bind(this)
      }
    });
  }

  async incrementPrayer({
    id
  }) {
    const {
      PrayerRequest
    } = this.context.dataSources;
    return PrayerRequest.incrementPrayed(id);
  }

  async updateSeriesStarted({
    id
  }) {
    const {
      ContentItem
    } = this.context.dataSources; // Get all the parents

    const seriesParents = await (await ContentItem.getCursorByChildContentItemId(id)).get();
    return Promise.all(seriesParents.map(async seriesParent => {
      // Check to see if we have started the series before
      const parentType = ContentItem.resolveType(seriesParent);
      const nodeId = (0, _serverCore.createGlobalId)(seriesParent.id, parentType);
      const otherInteractions = await this.getInteractionsForCurrentUserAndNodes({
        nodeIds: [nodeId],
        actions: ['SERIES_START']
      }); // If we haven't, mark it as started

      if (!otherInteractions.length) {
        await this.createNodeInteraction({
          nodeId,
          action: 'SERIES_START',
          additional: false // we pass this prop to avoid recursive interaction creation

        });
      }
    }));
  }

  async createAdditionalInteractions({
    id,
    __type,
    action
  }) {
    // Get all the typenames for an entity.
    // This will likely be something like, [UniversalContentItem, ContentItem]
    const normalizedTypeNames = this.context.models.Node.getPossibleDataModels({
      schema: this.context.schema,
      __type
    }); // For each of this types

    return Promise.all(normalizedTypeNames.map(async normalizedType => {
      // do we have a function to call?
      const possibleFunction = (0, _lodash.get)(this.ADDITIONAL_INTERACTIONS_MAP, `${normalizedType}.${action}`); // if so, call it.

      if (possibleFunction) {
        return possibleFunction({
          id,
          __type,
          action
        });
      }

      return null;
    }));
  }

  async createContentItemInteraction({
    itemId,
    operationName,
    itemTitle
  }) {
    const {
      dataSources: {
        RockConstants,
        Auth
      }
    } = this.context;
    const {
      id
    } = (0, _serverCore.parseGlobalId)(itemId);
    const interactionComponent = await RockConstants.contentItemInteractionComponent({
      contentItemId: id,
      // Don't want to recreate channels if name changes
      // In the future, we could use itemTitle here.
      contentName: id
    });
    const currentUser = await Auth.getCurrentPerson();
    const interactionId = await this.post('/Interactions', {
      PersonAliasId: currentUser.primaryAliasId,
      InteractionComponentId: interactionComponent.id,
      Operation: operationName,
      InteractionDateTime: new Date().toJSON(),
      InteractionSummary: `${operationName} - ${itemTitle}`,
      InteractionData: `${_config.default.APP.DEEP_LINK_HOST}://Interactions/ContentSingle?itemId=${itemId}`
    });
    return this.get(`/Interactions/${interactionId}`);
  }

  async getInteractionsForCurrentUserAndNodes({
    nodeIds,
    actions = []
  }) {
    let currentUser;

    try {
      currentUser = await this.context.dataSources.Auth.getCurrentPerson();
    } catch (e) {
      return [];
    }

    if (nodeIds.length === 0) {
      return [];
    }

    if (_config.default.ROCK.USE_PLUGIN) {
      // need to split up the request for ASP.NET
      return (0, _lodash.flatten)((await Promise.all((0, _lodash.chunk)(nodeIds, 10).map(async group => this.request(`/Apollos/GetInteractionsByForeignKeys?keys=${group.join(',')}`).filterOneOf(actions.map(a => `Operation eq '${a}'`)).andFilter(`PersonAliasId eq ${currentUser.primaryAliasId}`).get()))));
    }

    console.warn('Fetching interactions without the Rock plugin is extremly inefficient\n\nWe highly recommend using plugin version 1.6.0 or higher');
    return (0, _lodash.flatten)((await Promise.all(nodeIds.map(async nodeId => this.request().filterOneOf(actions.map(a => `Operation eq '${a}'`)).andFilter(`(ForeignKey eq '${nodeId}') and (PersonAliasId eq ${currentUser.primaryAliasId})`).get()))));
  }

  getNodeInteractionsForCurrentUser({
    nodeId,
    actions = []
  }) {
    return this.getInteractionsForCurrentUserAndNodes({
      nodeIds: [nodeId],
      actions
    });
  }

  async getInteractionsForCurrentUser({
    actions = []
  }) {
    let currentUser;

    try {
      currentUser = await this.context.dataSources.Auth.getCurrentPerson();
    } catch (e) {
      return [];
    }

    return this.request().filterOneOf(actions.map(a => `Operation eq '${a}'`)).andFilter(`PersonAliasId eq ${currentUser.primaryAliasId}`).get();
  }

  async createNodeInteraction({
    nodeId,
    action,
    additional = true
  }) {
    const {
      dataSources: {
        RockConstants,
        Auth
      }
    } = this.context;
    const {
      id,
      __type
    } = (0, _serverCore.parseGlobalId)(nodeId);
    const entityType = await RockConstants.modelType(__type);

    if (!entityType) {
      console.error('nodeId is an invalid (non-rock) entity type. This is not yet supported.');
      return {
        success: false
      };
    }

    const interactionComponent = await RockConstants.interactionComponent({
      entityId: id,
      entityTypeId: entityType.id,
      entityTypeName: entityType.friendlyName
    });
    const currentUser = await Auth.getCurrentPerson();
    await this.post('/Interactions', {
      PersonAliasId: currentUser.primaryAliasId,
      InteractionComponentId: interactionComponent.id,
      Operation: action,
      InteractionDateTime: new Date().toJSON(),
      InteractionSummary: `${action}`,
      ForeignKey: nodeId
    });

    if (additional) {
      this.createAdditionalInteractions({
        id,
        __type,
        action
      });
    }

    return {
      success: true,
      nodeId
    };
  }

}

exports.default = Interactions;
//# sourceMappingURL=data-source.js.map