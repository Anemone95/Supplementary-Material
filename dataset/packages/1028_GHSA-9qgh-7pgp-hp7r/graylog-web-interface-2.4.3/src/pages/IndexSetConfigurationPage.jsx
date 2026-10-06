import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import { LinkContainer } from 'react-router-bootstrap';
import { Button, Row, Col } from 'react-bootstrap';

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import { IndexSetConfigurationForm } from 'components/indices';
import { DocumentationLink } from 'components/support';

import CombinedProvider from 'injection/CombinedProvider';

const { IndexSetsStore, IndexSetsActions } = CombinedProvider.get('IndexSets');
const { IndicesConfigurationStore, IndicesConfigurationActions } = CombinedProvider.get('IndicesConfiguration');

import DocsHelper from 'util/DocsHelper';
import Routes from 'routing/Routes';

const IndexSetConfigurationPage = React.createClass({
  propTypes: {
    params: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  },

  mixins: [Reflux.connect(IndexSetsStore), Reflux.connect(IndicesConfigurationStore)],

  getInitialState() {
    return {
      indexSet: undefined,
    };
  },

  componentDidMount() {
    IndexSetsActions.get(this.props.params.indexSetId);
    IndicesConfigurationActions.loadRotationStrategies();
    IndicesConfigurationActions.loadRetentionStrategies();
  },

  _formCancelLink() {
    if (this.props.location.query.from === 'details') {
      return Routes.SYSTEM.INDEX_SETS.SHOW(this.state.indexSet.id);
    }

    return Routes.SYSTEM.INDICES.LIST;
  },

  _saveConfiguration(indexSet) {
    IndexSetsActions.update(indexSet).then(() => {
      this.props.history.pushState(null, Routes.SYSTEM.INDICES.LIST);
    });
  },

  _isLoading() {
    return !this.state.indexSet || !this.state.rotationStrategies || !this.state.retentionStrategies;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const indexSet = this.state.indexSet;

    return (
      <DocumentTitle title="配置索引集">
        <div>
          <PageHeader title="配置索引集">
            <span>
              修改这个索引集的当前配置，允许您对来自一个或多个流的消息定制保留、分片和复制。
            </span>
            <span>
              要了解关于索引模型的更多信息，请查看{' '}
              <DocumentationLink page={DocsHelper.PAGES.INDEX_MODEL} text="文档" />
            </span>
            <span>
              <LinkContainer to={Routes.SYSTEM.INDICES.LIST}>
                <Button bsStyle="info">索引集概览</Button>
              </LinkContainer>
            </span>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <IndexSetConfigurationForm indexSet={indexSet}
                                         rotationStrategies={this.state.rotationStrategies}
                                         retentionStrategies={this.state.retentionStrategies}
                                         cancelLink={this._formCancelLink()}
                                         onUpdate={this._saveConfiguration} />
            </Col>
          </Row>
        </div>
      </DocumentTitle>
    );
  },
});

export default IndexSetConfigurationPage;
