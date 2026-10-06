import React from 'react';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import numeral from 'numeral';
import moment from 'moment';

import StoreProvider from 'injection/StoreProvider';
const IndexerFailuresStore = StoreProvider.getStore('IndexerFailures');

import DocsHelper from 'util/DocsHelper';
import Routes from 'routing/Routes';

import { Spinner } from 'components/common';
import { SmallSupportLink, DocumentationLink } from 'components/support';

const IndexerFailuresComponent = React.createClass({
  getInitialState() {
    return {};
  },
  componentDidMount() {
    const since = moment().subtract(24, 'hours');

    IndexerFailuresStore.count(since).then((response) => {
      this.setState({ total: response.count });
    });
  },
  _formatFailuresSummary() {
    return (
      <Alert bsStyle={this.state.total === 0 ? 'success' : 'danger'}>
        <i className={`fa fa-${this._iconForFailureCount(this.state.total)}`} /> {this._formatTextForFailureCount(this.state.total)}

        <LinkContainer to={Routes.SYSTEM.INDICES.FAILURES}>
          <Button bsStyle="info" bsSize="xs" className="pull-right">
            显示错误
          </Button>
        </LinkContainer>
      </Alert>
    );
  },
  _formatTextForFailureCount(count) {
    if (count === 0) {
      return '在过去24小时内没有失败的索引尝试。';
    }
    return <strong>在过去24小时内有{numeral(count).format('0,0')}失败的索引尝试。</strong>;
  },
  _iconForFailureCount(count) {
    if (count === 0) {
      return 'check-circle';
    }
    return 'ambulance';
  },
  render() {
    let content;
    if (this.state.total === undefined) {
      content = <Spinner />;
    } else {
      content = this._formatFailuresSummary();
    }

    return (
      <Row className="content">
        <Col md={12}>
          <h2>索引失败</h2>

          <SmallSupportLink>
            没有成功索引的每条消息都将被记录为索引失败。了解更多关于这个特性的信息，请查看{' '}
            <DocumentationLink page={DocsHelper.PAGES.INDEXER_FAILURES} text="Graylog文档" />。
          </SmallSupportLink>

          {content}
        </Col>
      </Row>
    );
  },
});

export default IndexerFailuresComponent;
