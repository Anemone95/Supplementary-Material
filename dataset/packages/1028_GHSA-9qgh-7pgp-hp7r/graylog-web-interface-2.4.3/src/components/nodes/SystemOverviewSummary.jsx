import PropTypes from 'prop-types';
import React from 'react';
import StringUtils from 'util/StringUtils';

const SystemOverviewSummary = React.createClass({
  propTypes: {
    information: PropTypes.object.isRequired,
  },
  render() {
    const lbStatus = this.props.information.lb_status.toUpperCase();
    return (
      <dl className="graylog-node-state">
        <dt>当前生命周期状态:</dt>
        <dd>{StringUtils.capitalizeFirstLetter(this.props.information.lifecycle)}</dd>
        <dt>消息处理:</dt>
        <dd>{this.props.information.is_processing ? '启用' : '禁用'}</dd>
        <dt>负载均衡器指示:</dt>
        <dd className={lbStatus === 'DEAD' ? 'text-danger' : ''}>{lbStatus}</dd>
      </dl>
    );
  },
});

export default SystemOverviewSummary;
