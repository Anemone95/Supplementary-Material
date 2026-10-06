import React from 'react';
import Reflux from 'reflux';
import { Row, Col } from 'react-bootstrap';

import StoreProvider from 'injection/StoreProvider';
const IndexerClusterStore = StoreProvider.getStore('IndexerCluster');

import { Spinner } from 'components/common';
import { DocumentationLink, SmallSupportLink } from 'components/support';
import DocsHelper from 'util/DocsHelper';
import { IndexerClusterHealthSummary } from 'components/indexers';

const IndexerClusterHealth = React.createClass({
  mixins: [Reflux.connect(IndexerClusterStore)],

  componentDidMount() {
    IndexerClusterStore.update();
  },

  render() {
    const health = this.state.health;

    let content;
    if (health) {
      content = <IndexerClusterHealthSummary health={health} />;
    } else {
      content = <Spinner />;
    }

    return (
      <Row className="content">
        <Col md={12}>
          <h2>Elasticsearch集群</h2>

          <SmallSupportLink>
            可能的Elasticsearch集群状态和更多相关信息可以查看{' '}
            <DocumentationLink page={DocsHelper.PAGES.CONFIGURING_ES} text="Graylog文档" />。
          </SmallSupportLink>

          {content}
        </Col>
      </Row>
    );
  },
});

export default IndexerClusterHealth;
