import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';

import { Timestamp } from 'components/common';

import DateTime from 'logic/datetimes/DateTime';

const SystemInformation = React.createClass({
  propTypes: {
    node: PropTypes.object.isRequired,
    systemInformation: PropTypes.object.isRequired,
    jvmInformation: PropTypes.object,
  },
  getInitialState() {
    return { time: moment() };
  },
  componentDidMount() {
    this.interval = setInterval(() => this.setState(this.getInitialState()), 1000);
  },
  componentWillUnmount() {
    clearTimeout(this.interval);
  },
  render() {
    const systemInformation = this.props.systemInformation;
    let jvmInformation;
    if (this.props.jvmInformation) {
      jvmInformation = <span>PID {this.props.jvmInformation.pid}, {this.props.jvmInformation.info}</span>;
    } else {
      jvmInformation = <span>此节点的JMV信息不可用。</span>;
    }

    return (
      <dl className="system-system">
        <dt>主机名:</dt>
        <dd>{systemInformation.hostname}</dd>
        <dt>节点ID:</dt>
        <dd>{this.props.node.node_id}</dd>
        <dt>版本:</dt>
        <dd>{systemInformation.version}, 研发代码 <em>{systemInformation.codename}</em></dd>
        <dt>JVM:</dt>
        <dd>{jvmInformation}</dd>
        <dt>时间:</dt>
        <dd><Timestamp dateTime={this.state.time} format={DateTime.Formats.DATETIME_TZ} tz={systemInformation.timezone} /></dd>
      </dl>
    );
  },
});

export default SystemInformation;
