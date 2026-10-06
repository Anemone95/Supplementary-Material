import React from 'react';
import Reflux from 'reflux';
import { Col, Row } from 'react-bootstrap';
import moment from 'moment';
import DateTime from 'logic/datetimes/DateTime';

import StoreProvider from 'injection/StoreProvider';
const CurrentUserStore = StoreProvider.getStore('CurrentUser');
const SystemStore = StoreProvider.getStore('System');

import { Spinner, Timestamp } from 'components/common';

const TimesList = React.createClass({
  mixins: [Reflux.connect(CurrentUserStore), Reflux.connect(SystemStore)],
  getInitialState() {
    return { time: moment() };
  },
  componentDidMount() {
    this.interval = setInterval(() => this.setState(this.getInitialState()), 1000);
  },
  componentWillUnmount() {
    clearInterval(this.interval);
  },
  render() {
    if (!this.state.system) {
      return <Spinner />;
    }
    const time = this.state.time;
    const timeFormat = DateTime.Formats.DATETIME_TZ;
    const currentUser = this.state.currentUser;
    const serverTimezone = this.state.system.timezone;
    return (
      <Row className="content">
        <Col md={12}>
          <h2>时间配置</h2>

          <p className="description">
            时区处理可能会令人困惑。在这里，您可以看到应用于系统的不同组件的时区。
            您可以在相关详细的页面上查看特定Graylog服务器节点的时区设置。
          </p>

          <dl className="system-dl">
            <dt>用户 <em>{currentUser.username}</em>:</dt>
            <dd><Timestamp dateTime={time} format={timeFormat} /></dd>
            <dt>你的网页浏览器:</dt>
            <dd><Timestamp dateTime={time} format={timeFormat} tz={'browser'} /></dd>
            <dt>Graylog服务器:</dt>
            <dd><Timestamp dateTime={time} format={timeFormat} tz={serverTimezone} /></dd>
          </dl>
        </Col>
      </Row>
    );
  },
});

export default TimesList;
