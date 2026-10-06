import React from 'react';
import Reflux from 'reflux';
import { Button, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import DocumentationLink from 'components/support/DocumentationLink';
import { DocumentTitle, PageHeader } from 'components/common';
import { AlertConditionsComponent } from 'components/alertconditions';

import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';

import StoreProvider from 'injection/StoreProvider';
const CurrentUserStore = StoreProvider.getStore('CurrentUser');

const AlertConditionsPage = React.createClass({
  mixins: [Reflux.connect(CurrentUserStore)],
  render() {
    return (
      <DocumentTitle title="警报条件">
        <div>
          <PageHeader title="管理警报条件">
            <span>
              警报条件定义一些需要你注意的情况。Graylog会定期检查这些条件，并在它们的状态发生变化时通知您。
            </span>

            <span>
              要了解跟多关于警报的信息，请查看<DocumentationLink page={DocsHelper.PAGES.ALERTS} text="文档" />。
            </span>

            <span>
              <LinkContainer to={Routes.ALERTS.NOTIFICATIONS}>
                <Button bsStyle="info">管理通知</Button>
              </LinkContainer>
            </span>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <AlertConditionsComponent />
            </Col>
          </Row>
        </div>
      </DocumentTitle>
    );
  },
});

export default AlertConditionsPage;
