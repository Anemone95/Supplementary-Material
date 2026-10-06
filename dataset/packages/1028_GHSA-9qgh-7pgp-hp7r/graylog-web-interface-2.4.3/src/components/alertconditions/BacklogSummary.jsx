import PropTypes from 'prop-types';
import React from 'react';

const BacklogSummary = React.createClass({
  propTypes: {
    alertCondition: PropTypes.object.isRequired,
  },
  _formatMessageCount(count) {
    if (count === 0) {
      return '不包括任何消息';
    }

    if (count === 1) {
      return '包括最近 1 条消息';
    }

    return `包括最近 ${count} 条消息`;
  },
  render() {
    const backlog = this.props.alertCondition.parameters.backlog;
    return (
      <span>警报通知中的{this._formatMessageCount(backlog)}。</span>
    );
  },
});

export default BacklogSummary;
