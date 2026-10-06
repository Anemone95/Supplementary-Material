import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import Routes from 'routing/Routes';

import DocsHelper from 'util/DocsHelper';
import { DocumentTitle, PageHeader } from 'components/common';
import { DocumentationLink } from 'components/support';
import { IndexSetsComponent } from 'components/indices';

const IndicesPage = React.createClass({
  render() {
    const pageHeader = (
      <PageHeader title="索引 & 索引集">
        <span>
          Graylog流将消息写入到一个索引集，它是存储数据的保留、分片和复制的配置。
          例如，通过配置索引集，您可以对某些流设置不同的保留时间。
        </span>

        <span>
          要了解关于索引模型的更多信息，请查看{' '}
          <DocumentationLink page={DocsHelper.PAGES.INDEX_MODEL} text="文档" />
        </span>

        <span>
          <LinkContainer to={Routes.SYSTEM.INDEX_SETS.CREATE}>
            <Button bsStyle="success" bsSize="lg">创建索引集</Button>
          </LinkContainer>
        </span>
      </PageHeader>
    );

    return (
      <DocumentTitle title="索引和索引集">
        <span>
          {pageHeader}

          <Row className="content">
            <Col md={12}>
              <IndexSetsComponent />
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  },
});

export default IndicesPage;
