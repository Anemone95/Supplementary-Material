import PropTypes from 'prop-types';
import React from 'react';

import { Row, Col } from 'react-bootstrap';
import { PluginStore } from 'graylog-web-plugin/plugin';

import IndexMaintenanceStrategiesSummary from 'components/indices/IndexMaintenanceStrategiesSummary';
import {} from 'components/indices/rotation'; // Load rotation plugin UI plugins from core.
import {} from 'components/indices/retention'; // Load rotation plugin UI plugins from core.

const style = require('!style/useable!css!components/configurations/ConfigurationStyles.css');

const IndicesConfiguration = React.createClass({
  propTypes: {
    indexSet: PropTypes.object.isRequired,
  },

  componentDidMount() {
    style.use();
  },

  componentWillUnmount() {
    style.unuse();
  },

  render() {
    if (!this.props.indexSet.writable) {
      return (
        <Row>
          <Col md={12}>
            索引集不可写，也不会包含在索引循环和保留中。也不可能将其分配给一个流。
          </Col>
        </Row>
      );
    }

    const rotationConfig = {
      strategy: this.props.indexSet.rotation_strategy_class,
      config: this.props.indexSet.rotation_strategy,
    };
    const retentionConfig = {
      strategy: this.props.indexSet.retention_strategy_class,
      config: this.props.indexSet.retention_strategy,
    };

    return (
      <Row>
        <Col md={6}>
          <IndexMaintenanceStrategiesSummary config={rotationConfig}
                                             pluginExports={PluginStore.exports('indexRotationConfig')} />
        </Col>
        <Col md={6}>
          <IndexMaintenanceStrategiesSummary config={retentionConfig}
                                             pluginExports={PluginStore.exports('indexRetentionConfig')} />
        </Col>
      </Row>
    );
  },
});

export default IndicesConfiguration;
