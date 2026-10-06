import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import { LinkContainer } from 'react-router-bootstrap';
import { Alert, Button, Row, Col, Panel } from 'react-bootstrap';
import numeral from 'numeral';

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import { IndicesMaintenanceDropdown, IndicesOverview, IndexSetDetails } from 'components/indices';
import { IndexerClusterHealthSummary } from 'components/indexers';
import { DocumentationLink } from 'components/support';

import DocsHelper from 'util/DocsHelper';

import CombinedProvider from 'injection/CombinedProvider';

const { IndexSetsStore, IndexSetsActions } = CombinedProvider.get('IndexSets');
const { IndicesStore, IndicesActions } = CombinedProvider.get('Indices');
const { IndexerOverviewStore, IndexerOverviewActions } = CombinedProvider.get('IndexerOverview');

import Routes from 'routing/Routes';

const IndexSetPage = React.createClass({
  propTypes: {
    params: PropTypes.object.isRequired,
  },

  mixins: [
    Reflux.connect(IndexSetsStore),
    Reflux.connect(IndicesStore, 'indexDetails'),
    Reflux.connect(IndexerOverviewStore),
  ],

  getInitialState() {
    return {
      indexSet: undefined,
    };
  },

  componentDidMount() {
    IndexSetsActions.get(this.props.params.indexSetId);
    IndicesActions.list(this.props.params.indexSetId);

    this.timerId = setInterval(() => {
      IndicesActions.multiple();
      IndexerOverviewActions.list(this.props.params.indexSetId);
    }, this.REFRESH_INTERVAL);
  },

  componentWillUnmount() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  },

  REFRESH_INTERVAL: 2000,

  _totalIndexCount() {
    return Object.keys(this.state.indexerOverview.indices).length;
  },

  _renderElasticsearchUnavailableInformation() {
    return (
      <Row className="content">
        <Col md={8} mdOffset={2}>
          <div className="top-margin">
            <Panel bsStyle="danger"
                   header={<span><i className="fa fa-exclamation-triangle" /> 索引概况功能不可用</span>}>
              <p>
                我们无法获得索引概述信息。这通常意味着连接到弹性搜索有问题，并且
                <strong>您应该确保Elasticsearch已启动并可从Graylog访问</strong>。
              </p>
              <p>
                Graylog将继续将你的信息储存在它的日志中，在再连接上Elasticsearch之前，你将无法搜索它们。
              </p>
            </Panel>
          </div>
        </Col>
      </Row>
    );
  },

  _isLoading() {
    return !this.state.indexSet;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const indexSet = this.state.indexSet;

    const pageHeader = (
      <PageHeader title={`索引集: ${indexSet.title}`}>
        <span>
          这是Graylog目前用于搜索和分析的索引集合中所有索引(消息存储)的一个概述。
        </span>

        <span>
          要了解关于索引模型更多的信息，请查看{' '}
          <DocumentationLink page={DocsHelper.PAGES.INDEX_MODEL} text="文档" />
        </span>

        <span>
          <LinkContainer to={Routes.SYSTEM.INDICES.LIST}>
            <Button bsStyle="info">索引集概述</Button>
          </LinkContainer>
          &nbsp;
          <LinkContainer to={Routes.SYSTEM.INDEX_SETS.CONFIGURATION(indexSet.id, 'details')}>
            <Button bsStyle="info">编辑索引集</Button>
          </LinkContainer>
          &nbsp;
          <IndicesMaintenanceDropdown indexSetId={this.props.params.indexSetId} indexSet={this.state.indexSet} />
        </span>
      </PageHeader>
    );

    if (this.state.indexerOverviewError) {
      return (
        <span>
          {pageHeader}
          {this._renderElasticsearchUnavailableInformation()}
        </span>
      );
    }

    let indicesInfo;
    let indicesOverview;
    if (this.state.indexerOverview && this.state.indexDetails.closedIndices) {
      const deflectorInfo = this.state.indexerOverview.deflector;

      indicesInfo = (
        <span>
          <Alert bsStyle="success" style={{ marginTop: '10' }}>
            <i className="fa fa-th" /> &nbsp;{this._totalIndexCount()} 索引中共管理{' '}
            {numeral(this.state.indexerOverview.counts.events).format('0,0')} 条消息，
            当前使用中的索引为 <i>{deflectorInfo.current_target}</i>。
          </Alert>
          <IndexerClusterHealthSummary health={this.state.indexerOverview.indexer_cluster.health} />
        </span>
      );
      indicesOverview = (
        <IndicesOverview indices={this.state.indexerOverview.indices}
                         indexDetails={this.state.indexDetails.indices}
                         indexSetId={this.props.params.indexSetId}
                         closedIndices={this.state.indexDetails.closedIndices}
                         deflector={this.state.indexerOverview.deflector} />
      );
    } else {
      indicesInfo = <Spinner />;
      indicesOverview = <Spinner />;
    }

    return (
      <DocumentTitle title={`索引集 - ${indexSet.title}`}>
        <div>
          {pageHeader}

          <Row className="content">
            <Col md={12}>
              <IndexSetDetails indexSet={indexSet} />
            </Col>
          </Row>

          <Row className="content">
            <Col md={12}>
              {indicesInfo}
            </Col>
          </Row>

          {indicesOverview}
        </div>
      </DocumentTitle>
    );
  },
});

export default IndexSetPage;
