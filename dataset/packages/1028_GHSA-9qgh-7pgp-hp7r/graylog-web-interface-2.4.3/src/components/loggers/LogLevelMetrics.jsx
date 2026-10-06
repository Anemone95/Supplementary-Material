import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import { Col } from 'react-bootstrap';
import String from 'string';
import numeral from 'numeral';

import ActionsProvider from 'injection/ActionsProvider';
const MetricsActions = ActionsProvider.getActions('Metrics');

import StoreProvider from 'injection/StoreProvider';
const MetricsStore = StoreProvider.getStore('Metrics');

import { Spinner } from 'components/common';

const LogLevelMetrics = React.createClass({
  propTypes: {
    nodeId: PropTypes.string.isRequired,
    loglevel: PropTypes.string.isRequired,
  },
  mixins: [Reflux.connect(MetricsStore)],
  componentDidMount() {
    MetricsActions.add(this.props.nodeId, this._metricName());
  },
  componentWillUnmount() {
    MetricsActions.remove(this.props.nodeId, this._metricName());
  },
  _metricName() {
    return `org.apache.logging.log4j.core.Appender.${this.props.loglevel}`;
  },
  render() {
    const { loglevel, nodeId } = this.props;
    const { metrics } = this.state;
    let metricsDetails;
    if (!metrics || !metrics[nodeId] || !metrics[nodeId][this._metricName()]) {
      metricsDetails = <Spinner />;
    } else {
      const metric = metrics[nodeId][this._metricName()].metric;
      metricsDetails = (
        <dl className="loglevel-metrics-list">
          <dt>总写次数:</dt>
          <dd><span className="loglevel-metric-total">{metric.rate.total}</span></dd>
          <dt>平均率:</dt>
          <dd><span className="loglevel-metric-mean">{numeral(metric.rate.mean).format('0.00')}</span> / 秒</dd>
          <dt>1分钟的速率:</dt>
          <dd><span className="loglevel-metric-1min">{numeral(metric.rate.one_minute).format('0.00')}</span> / 秒</dd>
        </dl>
      );
    }
    return (
      <div className="loglevel-metrics-row">
        <Col md={4}>
          <h3 className="u-light">级别: {String(loglevel).capitalize().toString()}</h3>
          {metricsDetails}
        </Col>
      </div>
    );
  },
});

export default LogLevelMetrics;
