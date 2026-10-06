import React from 'react';
import Reflux from 'reflux';
import { Alert, Row, Col } from 'react-bootstrap';

import StoreProvider from 'injection/StoreProvider';
const NotificationsStore = StoreProvider.getStore('Notifications');

import { Spinner } from 'components/common';
import Notification from 'components/notifications/Notification';

const NotificationsList = React.createClass({
  mixins: [Reflux.connect(NotificationsStore)],
  _formatNotificationCount(count) {
    if (count === 0) {
      return '没有通知';
    }
    if (count === 1) {
      return '有一条通知';
    }

    return `有${count}条通知`;
  },
  render() {
    if (!this.state.notifications) {
      return <Spinner />;
    }

    const count = this.state.total;

    let title;
    let content;

    if (count === 0) {
      title = '没有通知';
      content = (
        <Alert bsStyle="success" className="notifications-none">
          <i className="fa fa-check-circle" />{' '}
          &nbsp;没有通知
        </Alert>
      );
    } else {
      title = `${this._formatNotificationCount(count)}`;
      content = this.state.notifications.map((notification) => {
        return <Notification key={`${notification.type}-${notification.timestamp}`} notification={notification} />;
      });
    }

    return (
      <Row className="content">
        <Col md={12}>
          <h2>{title}</h2>
          <p className="description">
            通知是由Graylog触发的，并表明你应该采取行动。如果您需要更多的信息或帮助，许多通知类型还将提供一个链接到Graylog文档的链接。
          </p>

          {content}
        </Col>
      </Row>
    );
  },
});

export default NotificationsList;
