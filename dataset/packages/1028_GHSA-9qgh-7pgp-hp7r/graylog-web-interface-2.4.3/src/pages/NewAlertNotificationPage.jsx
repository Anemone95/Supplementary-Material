import React from 'react';
import Reflux from 'reflux';
import { Button, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { DocumentTitle, PageHeader } from 'components/common';
import { CreateAlertNotificationInput } from 'components/alertnotifications';

import Routes from 'routing/Routes';

import StoreProvider from 'injection/StoreProvider';
const CurrentUserStore = StoreProvider.getStore('CurrentUser');

const NewAlertNotificationPage = React.createClass({
  mixins: [Reflux.connect(CurrentUserStore)],
  render() {
    return (
      <DocumentTitle title="新的警报通知">
        <div>
          <PageHeader title="新的警报通知">
            <span>
              创建一个新的通知，以避免错过任何警告。
            </span>

            <span>
              请记住在警报条件页面中指定要使用的通知
            </span>

            <span>
              <LinkContainer to={Routes.ALERTS.NOTIFICATIONS}>
                <Button bsStyle="info">管理通知</Button>
              </LinkContainer>
              &nbsp;
              <Button bsStyle="info" href="https://marketplace.graylog.org/" target="_blank">
                <i className="fa fa-external-link" />&nbsp; 找到更多的通知
              </Button>
            </span>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <CreateAlertNotificationInput />
            </Col>
          </Row>
        </div>
      </DocumentTitle>
    );
  },
});

export default NewAlertNotificationPage;
