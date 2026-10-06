import PropTypes from 'prop-types';
import React from 'react';

const ClosingRetentionStrategySummary = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
  },

  render() {
    return (
      <div>
        <dl>
          <dt>索引保留策略:</dt>
          <dd>关闭</dd>
          <dt>索引的最大数量:</dt>
          <dd>{this.props.config.max_number_of_indices}</dd>
        </dl>
      </div>
    );
  },
});

export default ClosingRetentionStrategySummary;
