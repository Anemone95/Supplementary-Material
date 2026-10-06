import PropTypes from 'prop-types';
import React from 'react';

const MessageCountRotationStrategySummary = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
  },

  render() {
    return (
      <div>
        <dl>
          <dt>索引循环策略:</dt>
          <dd>消息计数</dd>
          <dt>每个索引的最大文档数:</dt>
          <dd>{this.props.config.max_docs_per_index}</dd>
        </dl>
      </div>
    );
  },
});

export default MessageCountRotationStrategySummary;
