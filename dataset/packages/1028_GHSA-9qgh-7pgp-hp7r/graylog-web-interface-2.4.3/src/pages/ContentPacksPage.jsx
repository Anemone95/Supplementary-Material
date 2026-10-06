import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import Routes from 'routing/Routes';

import { DocumentTitle, PageHeader } from 'components/common';
import ConfigurationBundles from 'components/source-tagging/ConfigurationBundles';

const ContentPacksPage = React.createClass({
  render() {
    return (
      <DocumentTitle title="内容包">
        <span>
          <PageHeader title="内容包">
            <span>
              内容包加速了特定数据源的设置过程。内容包可以包括输入/提取器，流和仪表板。
            </span>

            <span>
              更多的内容包资源尽在{' '}
              <a href="https://marketplace.graylog.org/" target="_blank">Graylog商城</a>。
            </span>

            <LinkContainer to={Routes.SYSTEM.CONTENTPACKS.EXPORT}>
              <Button bsStyle="success" bsSize="large">创建内容包</Button>
            </LinkContainer>
          </PageHeader>

          <Row className="content">
            <Col md={12}>

              <h2>选择内容包</h2>
              <div id="react-configuration-bundles">
                <ConfigurationBundles />
              </div>
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  },
});

export default ContentPacksPage;
