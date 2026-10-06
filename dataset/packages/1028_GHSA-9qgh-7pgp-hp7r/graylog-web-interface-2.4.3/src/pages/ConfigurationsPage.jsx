import React from 'react';
import Reflux from 'reflux';
import { Row, Col } from 'react-bootstrap';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import { PluginStore } from 'graylog-web-plugin/plugin';

import StoreProvider from 'injection/StoreProvider';
const ConfigurationsStore = StoreProvider.getStore('Configurations');

import ActionsProvider from 'injection/ActionsProvider';
const ConfigurationActions = ActionsProvider.getActions('Configuration');

import SearchesConfig from 'components/configurations/SearchesConfig';
import MessageProcessorsConfig from 'components/configurations/MessageProcessorsConfig';

const ConfigurationsPage = React.createClass({
  mixins: [Reflux.connect(ConfigurationsStore)],

  getInitialState() {
    return {
      configuration: null,
    };
  },

  componentDidMount() {
    this.style.use();
    ConfigurationActions.list(this.SEARCHES_CLUSTER_CONFIG);
    ConfigurationActions.listMessageProcessorsConfig(this.MESSAGE_PROCESSORS_CONFIG);

    PluginStore.exports('systemConfigurations').forEach((systemConfig) => {
      ConfigurationActions.list(systemConfig.configType);
    });
  },

  componentWillUnmount() {
    this.style.unuse();
  },

  style: require('!style/useable!css!components/configurations/ConfigurationStyles.css'),
  SEARCHES_CLUSTER_CONFIG: 'org.graylog2.indexer.searches.SearchesClusterConfig',
  MESSAGE_PROCESSORS_CONFIG: 'org.graylog2.messageprocessors.MessageProcessorsConfig',

  _getConfig(configType) {
    if (this.state.configuration && this.state.configuration[configType]) {
      return this.state.configuration[configType];
    }
    return null;
  },

  _onUpdate(configType) {
    return (config) => {
      switch (configType) {
        case this.MESSAGE_PROCESSORS_CONFIG:
          return ConfigurationActions.updateMessageProcessorsConfig(configType, config);
        default:
          return ConfigurationActions.update(configType, config);
      }
    };
  },

  _pluginConfigs() {
    return PluginStore.exports('systemConfigurations').map((systemConfig, idx) => {
      return React.createElement(systemConfig.component, {
        key: `system-configuration-${idx}`,
        config: this._getConfig(systemConfig.configType) || undefined,
        updateConfig: this._onUpdate(systemConfig.configType),
      });
    });
  },

  _pluginConfigRows() {
    const pluginConfigs = this._pluginConfigs();
    const rows = [];
    let idx = 0;

    // Put two plugin config components per row.
    while (pluginConfigs.length > 0) {
      idx++;
      rows.push(
        <Row key={`plugin-config-row-${idx}`}>
          <Col md={6}>
            {pluginConfigs.shift()}
          </Col>
          <Col md={6}>
            {pluginConfigs.shift() || (<span>&nbsp;</span>)}
          </Col>
        </Row>,
      );
    }

    return rows;
  },

  render() {
    const searchesConfig = this._getConfig(this.SEARCHES_CLUSTER_CONFIG);
    const messageProcessorsConfig = this._getConfig(this.MESSAGE_PROCESSORS_CONFIG);
    let searchesConfigComponent;
    let messageProcessorsConfigComponent;
    if (searchesConfig) {
      searchesConfigComponent = (
        <SearchesConfig config={searchesConfig}
                        updateConfig={this._onUpdate(this.SEARCHES_CLUSTER_CONFIG)} />
      );
    } else {
      searchesConfigComponent = (<Spinner />);
    }
    if (messageProcessorsConfig) {
      messageProcessorsConfigComponent = (
        <MessageProcessorsConfig config={messageProcessorsConfig}
                                 updateConfig={this._onUpdate(this.MESSAGE_PROCESSORS_CONFIG)} />
      );
    } else {
      messageProcessorsConfigComponent = (<Spinner />);
    }

    const pluginConfigRows = this._pluginConfigRows();

    return (
      <DocumentTitle title="配置">
        <span>
          <PageHeader title="配置">
            <span>
              您可以在此页面上为不同的子系统配置系统设置。
            </span>
          </PageHeader>

          <Row className="content">
            <Col md={6}>
              {searchesConfigComponent}
            </Col>
            <Col md={6}>
              {messageProcessorsConfigComponent}
            </Col>
          </Row>

          {pluginConfigRows.length > 0 && <Row className="content">
            <Col md={12}>
              <h2>插件</h2>
              <p className="description">已安装插件的配置。</p>
              <hr className="separator" />
              <div className="top-margin">
                {pluginConfigRows}
              </div>
            </Col>
          </Row>}
        </span>
      </DocumentTitle>
    );
  },
});

export default ConfigurationsPage;
