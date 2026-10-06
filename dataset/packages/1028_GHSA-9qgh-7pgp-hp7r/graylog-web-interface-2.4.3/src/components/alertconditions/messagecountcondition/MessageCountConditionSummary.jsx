import PropTypes from 'prop-types';
import React from 'react';

import GracePeriodSummary from 'components/alertconditions/GracePeriodSummary';
import BacklogSummary from 'components/alertconditions/BacklogSummary';
import RepeatNotificationsSummary from 'components/alertconditions/RepeatNotificationsSummary';
import { Pluralize } from 'components/common';

const MessageCountConditionSummary = React.createClass({
  propTypes: {
    alertCondition: PropTypes.object.isRequired,
  },
  render() {
    const alertCondition = this.props.alertCondition;
    const threshold = alertCondition.parameters.threshold;
    const thresholdType = alertCondition.parameters.threshold_type.toLowerCase();
    const time = alertCondition.parameters.time;

    return (
      <span>
        警报会被触发，当
        {' '}
        <Pluralize value={threshold} singular={`有 ${thresholdType} 过 1 条消息`}
                   plural={`有 ${thresholdType} 过 ${threshold} 条消息`} />
        {' '}在{' '}
        <Pluralize value={time} singular="最近 1 分钟" plural={`最近 ${time} 分钟`} />。
        {' '}
        <GracePeriodSummary alertCondition={alertCondition} />
        {' '}
        <BacklogSummary alertCondition={alertCondition} />
        {' '}
        <RepeatNotificationsSummary alertCondition={alertCondition} />
      </span>
    );
  },
});

export default MessageCountConditionSummary;
