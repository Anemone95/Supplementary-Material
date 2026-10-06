import PropTypes from 'prop-types';
import React from 'react';

import GracePeriodSummary from 'components/alertconditions/GracePeriodSummary';
import BacklogSummary from 'components/alertconditions/BacklogSummary';
import RepeatNotificationsSummary from 'components/alertconditions/RepeatNotificationsSummary';
import { Pluralize } from 'components/common';

const FieldValueConditionSummary = React.createClass({
  propTypes: {
    alertCondition: PropTypes.object.isRequired,
  },
  render() {
    const alertCondition = this.props.alertCondition;
    const field = alertCondition.parameters.field;
    const threshold = alertCondition.parameters.threshold;
    const thresholdType = alertCondition.parameters.threshold_type.toLowerCase();
    const type = alertCondition.parameters.type.toLowerCase();
    const time = alertCondition.parameters.time;

    return (
      <span>
        当字段 {field} 具有的 {thresholdType}
        {' '}{type} 值大于 {threshold} 时触发警报，时间在
        {' '}
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

export default FieldValueConditionSummary;
