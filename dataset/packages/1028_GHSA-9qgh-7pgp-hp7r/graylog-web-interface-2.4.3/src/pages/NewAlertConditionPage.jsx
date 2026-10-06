import React from 'react';
import Reflux from 'reflux';
import { Button, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import DocumentationLink from 'components/support/DocumentationLink';
import { DocumentTitle, PageHeader } from 'components/common';
import { CreateAlertConditionInput } from 'components/alertconditions';

import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';

import StoreProvider from 'injection/StoreProvider';
const CurrentUserStore = StoreProvider.getStore('CurrentUser');

const NewAlertConditionPage = React.createClass({
  mixins: [Reflux.connect(CurrentUserStore)],
  render() {
    return (
      <DocumentTitle title="新的警报条件">
        <div>
          <PageHeader title="新的警报条件">
            <span>
              定义警报条件并配置当条件满足时，Graylog通知您的方式。
            </span>

            <span>
              默认条件不够灵活吗? 您也可以自己写！要了解更多更多关于警告的信息，请查看{' '}
              <DocumentationLink page={DocsHelper.PAGES.ALERTS} text="文档" />。
            </span>

            <span>
              <LinkContainer to={Routes.ALERTS.CONDITIONS}>
                <Button bsStyle="info">管理条件</Button>
              </LinkContainer>
              &nbsp;
              <LinkContainer to={Routes.ALERTS.NOTIFICATIONS}>
                <Button bsStyle="info">管理通知</Button>
              </LinkContainer>
            </span>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <CreateAlertConditionInput />
            </Col>
          </Row>
        </div>
      </DocumentTitle>
    );
  },
});

export default NewAlertConditionPage;
