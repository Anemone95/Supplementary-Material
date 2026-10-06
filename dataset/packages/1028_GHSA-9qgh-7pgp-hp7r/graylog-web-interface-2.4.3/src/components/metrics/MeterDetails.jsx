import PropTypes from 'prop-types';
import React from 'react';
import numeral from 'numeral';

const MeterDetails = React.createClass({
  propTypes: {
    metric: PropTypes.object.isRequired,
  },
  render() {
    const meter = this.props.metric.metric;
    return (
      <dl className="metric-def metric-meter">
        <dt>总计:</dt>
        <dd><span className="number-format">{numeral(meter.rate.total).format('0,0')}</span> 事件</dd>
        <dt>平均值:</dt>
        <dd><span className="number-format">{numeral(meter.rate.mean).format('0,0.[00]')}</span> {meter.rate_unit}</dd>
        <dt>平均1分钟:</dt>
        <dd><span className="number-format">{numeral(meter.rate.one_minute).format('0,0.[00]')}</span> {meter.rate_unit}</dd>
        <dt>平均5分钟:</dt>
        <dd><span className="number-format">{numeral(meter.rate.five_minute).format('0,0.[00]')}</span> {meter.rate_unit}</dd>
        <dt>平均15分钟:</dt>
        <dd><span className="number-format">{numeral(meter.rate.fifteen_minute).format('0,0.[00]')}</span> {meter.rate_unit}</dd>
      </dl>
    );
  },
});

export default MeterDetails;
