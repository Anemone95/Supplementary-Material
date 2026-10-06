import React from 'react';
import { Col, Row } from 'react-bootstrap';
import numeral from 'numeral';
import moment from 'moment';

import StoreProvider from 'injection/StoreProvider';
const IndexerFailuresStore = StoreProvider.getStore('IndexerFailures');

import DocsHelper from 'util/DocsHelper';

import { DocumentTitle, Spinner, PageHeader, PaginatedList } from 'components/common';
import { DocumentationLink } from 'components/support';
import { IndexerFailuresList } from 'components/indexers';

const IndexerFailuresPage = React.createClass({
  getInitialState() {
    return {};
  },
  componentDidMount() {
    IndexerFailuresStore.count(moment().subtract(10, 'years')).then((response) => {
      this.setState({ total: response.count });
    });
    this.loadData(1, this.defaultPageSize);
  },
  defaultPageSize: 50,
  loadData(page, size) {
    IndexerFailuresStore.list(size, (page - 1) * size).then((response) => {
      this.setState({ failures: response.failures });
    });
  },
  _onChangePaginatedList(page, size) {
    this.loadData(page, size);
  },
  render() {
    if (this.state.total === undefined || !this.state.failures) {
      return <Spinner />;
    }
    return (
      <DocumentTitle title="索引失败">
        <span>
          <PageHeader title="索引失败">
            <span>
              这是失败的消息索引尝试列表。失败意味着您发送给Graylog的消息{' '}
              已正确处理，但将其写入Elasticsearch群集失败。请注意，该列表的大小被限制为{' '}
              50 MB，所以它将包含大量的失败日志，但不需包含所有发生过的。
            </span>

            <span>
              总共包含了{numeral(this.state.total).format('0,0')}个失败索引的集合。更多有关此主题的信息，请查看
              <DocumentationLink page={DocsHelper.PAGES.INDEXER_FAILURES} text="文档" />。
            </span>
          </PageHeader>
          <Row className="content">
            <Col md={12}>
              <PaginatedList totalItems={this.state.total} onChange={this._onChangePaginatedList} pageSize={this.defaultPageSize}>
                <IndexerFailuresList failures={this.state.failures} />
              </PaginatedList>
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  },
});

export default IndexerFailuresPage;
