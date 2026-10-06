import React from 'react';

const NoopRetentionStrategySummary = React.createClass({
  render() {
    return (
      <div>
        <dl>
          <dt>索引保留策略:</dt>
          <dd>无需操作</dd>
        </dl>
      </div>
    );
  },
});

export default NoopRetentionStrategySummary;
