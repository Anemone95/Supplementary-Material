import PropTypes from 'prop-types';
import React from 'react';
import { Input } from 'components/bootstrap';
import moment from 'moment';

const TimeBasedRotationStrategyConfiguration = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
    jsonSchema: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      rotation_period: this.props.config.rotation_period,
    };
  },

  _onPeriodUpdate(field) {
    return () => {
      const update = {};
      let period = this.refs[field].getValue().toUpperCase();

      if (!period.startsWith('P')) {
        period = `P${period}`;
      }

      update[field] = period;

      this.setState(update);

      if (this._isValidPeriod(update[field])) {
        // Only propagate state if the config is valid.
        this.props.updateConfig(update);
      }
    };
  },

  _isValidPeriod(duration) {
    const check = duration || this.state.rotation_period;
    return moment.duration(check).asMilliseconds() >= 3600000;
  },

  _validationState() {
    if (this._isValidPeriod()) {
      return undefined;
    }
    return 'error';
  },

  _formatDuration() {
    return this._isValidPeriod() ? moment.duration(this.state.rotation_period).humanize() : '无效的(最低1小时)';
  },

  render() {
    return (
      <div>
        <Input type="text"
               ref="rotation_period"
               label="循环周期(ISO8601 持续时间)"
               onChange={this._onPeriodUpdate('rotation_period')}
               value={this.state.rotation_period}
               help={'索引在循环之前使用了多长时间。(例“P1D”为1天，“PT6H”为6小时)'}
               addonAfter={this._formatDuration()}
               bsStyle={this._validationState()}
               required />
      </div>
    );
  },
});

export default TimeBasedRotationStrategyConfiguration;
