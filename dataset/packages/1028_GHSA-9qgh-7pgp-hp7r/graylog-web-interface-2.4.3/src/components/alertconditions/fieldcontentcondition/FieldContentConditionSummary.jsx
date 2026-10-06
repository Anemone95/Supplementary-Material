import PropTypes from 'prop-types';
import React from 'react';

import GracePeriodSummary from 'components/alertconditions/GracePeriodSummary';
import BacklogSummary from 'components/alertconditions/BacklogSummary';
import RepeatNotificationsSummary from 'components/alertconditions/RepeatNotificationsSummary';

const FieldContentConditionSummary = React.createClass({
  propTypes: {
    alertCondition: PropTypes.object.isRequired,
  },
  _formatMatcher(field, value) {
    return <span>{`\<${field}: "${value}"\>`}</span>;
  },
  render() {
    const alertCondition = this.props.alertCondition;
    const field = alertCondition.parameters.field;
    const value = alertCondition.parameters.value;

    return (
      <span>
        当收到与 {this._formatMatcher(field, value)} 匹配的消息时，会触发警报。
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

export default FieldContentConditionSummary;
