import PropTypes from 'prop-types';
import React from 'react';

const GracePeriodSummary = React.createClass({
  propTypes: {
    alertCondition: PropTypes.object.isRequired,
  },
  _formatTime(time) {
    if (time === 1) {
      return '1 分钟';
    }

    return `${time} 分钟`;
  },
  render() {
    const time = this.props.alertCondition.parameters.grace;
    return <span>宽限期: {this._formatTime(time)}.</span>;
  },
});

export default GracePeriodSummary;
