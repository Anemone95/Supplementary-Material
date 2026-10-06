import PropTypes from 'prop-types';
import React from 'react';

import moment from 'moment';
import {} from 'moment-duration-format';

const TimeBasedRotationStrategySummary = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
  },

  _humanizedPeriod() {
    const duration = moment.duration(this.props.config.rotation_period);

    return `${duration.format()}, ${duration.humanize()}`;
  },

  render() {
    return (
      <div>
        <dl>
          <dt>索引循环策略:</dt>
          <dd>索引时间</dd>
          <dt>循环周期:</dt>
          <dd>{this.props.config.rotation_period} ({this._humanizedPeriod()})</dd>
        </dl>
      </div>
    );
  },
});

export default TimeBasedRotationStrategySummary;
