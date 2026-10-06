import React from 'react';

const MetricsFilterInput = React.createClass({
  render() {
    return (
      <input type="text" className="metrics-filter input-lg form-control"
             style={{ width: '100%' }} placeholder="键入指标名称以过滤..." {...this.props} />
    );
  },
});

export default MetricsFilterInput;
