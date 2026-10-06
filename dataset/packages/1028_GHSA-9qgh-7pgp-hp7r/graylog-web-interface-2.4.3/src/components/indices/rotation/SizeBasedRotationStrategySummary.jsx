import PropTypes from 'prop-types';
import React from 'react';
import NumberUtils from 'util/NumberUtils';

const SizeBasedRotationStrategySummary = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
  },

  render() {
    return (
      <div>
        <dl>
          <dt>索引循环策略:</dt>
          <dd>索引大小</dd>
          <dt>索引的最大值:</dt>
          <dd>{this.props.config.max_size} bytes ({NumberUtils.formatBytes(this.props.config.max_size)})</dd>
        </dl>
      </div>
    );
  },
});

export default SizeBasedRotationStrategySummary;
