import PropTypes from 'prop-types';
import React from 'react';
import numeral from 'numeral';

const TimerDetails = React.createClass({
  propTypes: {
    metric: PropTypes.object.isRequired,
  },
  render() {
    const timing = this.props.metric.metric.time;
    return (
      <dl className="metric-def metric-timer">
        <dt>第95百分位:</dt>
        <dd><span>{numeral(timing['95th_percentile']).format('0,0.[00]')}</span>&#956;s</dd>

        <dt>第98百分位:</dt>
        <dd><span>{numeral(timing['98th_percentile']).format('0,0.[00]')}</span>&#956;s</dd>

        <dt>第99百分位:</dt>
        <dd><span>{numeral(timing['99th_percentile']).format('0,0.[00]')}</span>&#956;s</dd>

        <dt>标准偏差:</dt>
        <dd><span>{numeral(timing.std_dev).format('0,0.[00]')}</span>&#956;s</dd>

        <dt>平均值:</dt>
        <dd><span>{numeral(timing.mean).format('0,0.[00]')}</span>&#956;s</dd>

        <dt>最小值:</dt>
        <dd><span>{numeral(timing.min).format('0,0.[00]')}</span>&#956;s</dd>

        <dt>最大值:</dt>
        <dd><span>{numeral(timing.max).format('0,0.[00]')}</span>&#956;s</dd>
      </dl>
    );
  },
});

export default TimerDetails;
