import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { PluginStore } from 'graylog-web-plugin/plugin';
import { ContentPackMarker } from 'components/common';

import Styles from './ConfigSummary.css';

const Cache = React.createClass({

  propTypes: {
    cache: PropTypes.object.isRequired,
  },

  render() {
    const plugins = {};
    PluginStore.exports('lookupTableCaches').forEach((p) => {
      plugins[p.type] = p;
    });

    const cache = this.props.cache;
    const plugin = plugins[cache.config.type];
    if (!plugin) {
      return <p>未知缓存类型{cache.config.type}。 该插件是否丢失?</p>;
    }

    const summary = plugin.summaryComponent;
    return (
      <Row className="content">
        <Col md={6}>
          <h2>
            {cache.title}
            <ContentPackMarker contentPack={cache.content_pack} marginLeft={5} />
            {' '}
            <small>({plugin.displayName})</small>
          </h2>
          <div className={Styles.config}>
            <dl>
              <dt>描述</dt>
              <dd>{cache.description || <em>无描述。</em>}</dd>
            </dl>
          </div>
          <h4>配置</h4>
          <div className={Styles.config}>
            {React.createElement(summary, { cache: cache })}
          </div>
        </Col>
        <Col md={6} />
      </Row>
    );
  },

});

export default Cache;
