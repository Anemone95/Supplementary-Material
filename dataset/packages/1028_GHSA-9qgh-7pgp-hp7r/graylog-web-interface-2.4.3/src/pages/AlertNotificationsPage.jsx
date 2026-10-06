import React from 'react';
import Reflux from 'reflux';
import { Button, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { DocumentTitle, PageHeader } from 'components/common';
import { AlertNotificationsComponent } from 'components/alertnotifications';
import Routes from 'routing/Routes';

import StoreProvider from 'injection/StoreProvider';
const CurrentUserStore = StoreProvider.getStore('CurrentUser');

const AlertNotificationsPage = React.createClass({
  mixins: [Reflux.connect(CurrentUserStore)],
  render() {
    return (
      <DocumentTitle title="警报通知">
        <div>
          <PageHeader title="管理警报通知">
            <span>
              通知让您随时了解您的警报条件状态的变化。Graylog可以直接将通知发送给您或您使用的其他系统。
            </span>

            <span>
              	请记住分配要在警报条件页面中使用的通知。
            </span>

            <span>
              <LinkContainer to={Routes.ALERTS.CONDITIONS}>
                <Button bsStyle="info">管理条件</Button>
              </LinkContainer>
              &nbsp;
              <Button bsStyle="info" href="https://marketplace.graylog.org/" target="_blank">
                <i className="fa fa-external-link" />&nbsp; 找到更多的通知
              </Button>
            </span>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <AlertNotificationsComponent />
            </Col>
          </Row>
        </div>
      </DocumentTitle>
    );
  },
});

export default AlertNotificationsPage;
