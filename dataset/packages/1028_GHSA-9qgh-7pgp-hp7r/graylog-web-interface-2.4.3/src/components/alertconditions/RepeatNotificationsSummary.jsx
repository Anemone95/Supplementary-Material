import PropTypes from 'prop-types';
import React from 'react';

const RepeatNotificationsSummary = React.createClass({
  propTypes: {
    alertCondition: PropTypes.object.isRequired,
  },
  render() {
    const repeatNotifications = this.props.alertCondition.parameters.repeat_notifications || false;
    return (
      <span>配置为{!repeatNotifications && <b>不</b>}重复通知。</span>
    );
  },
});

export default RepeatNotificationsSummary;
