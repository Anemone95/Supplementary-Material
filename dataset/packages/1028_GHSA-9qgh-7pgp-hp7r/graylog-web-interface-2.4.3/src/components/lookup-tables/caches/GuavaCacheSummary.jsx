import PropTypes from 'prop-types';
import React from 'react';
import { TimeUnit } from 'components/common';

const GuavaCacheSummary = React.createClass({
  propTypes: {
    cache: PropTypes.object.isRequired,
  },

  render() {
    const config = this.props.cache.config;
    return (<dl>
      <dt>最大条目数</dt>
      <dd>{config.max_size}</dd>
      <dt>访问后失效</dt>
      <dd><TimeUnit value={config.expire_after_access} unit={config.expire_after_access_unit} /></dd>
      <dt>写入后实效</dt>
      <dd><TimeUnit value={config.expire_after_write} unit={config.expire_after_write_unit} /></dd>
    </dl>);
  },
});

export default GuavaCacheSummary;
