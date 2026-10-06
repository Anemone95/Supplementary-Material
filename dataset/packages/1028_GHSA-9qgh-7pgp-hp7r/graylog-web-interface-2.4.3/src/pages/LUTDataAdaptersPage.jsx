import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import { Button, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Routes from 'routing/Routes';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';

import { DataAdapter, DataAdapterCreate, DataAdapterForm, DataAdaptersOverview } from 'components/lookup-tables';

import CombinedProvider from 'injection/CombinedProvider';

const { LookupTableDataAdaptersStore, LookupTableDataAdaptersActions } = CombinedProvider.get(
  'LookupTableDataAdapters');
const { LookupTablesStore, LookupTablesActions } = CombinedProvider.get('LookupTables');

const LUTDataAdaptersPage = React.createClass({
  propTypes: {
// eslint-disable-next-line react/no-unused-prop-types
    params: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  },

  mixins: [
    Reflux.connect(LookupTableDataAdaptersStore),
    Reflux.connect(LookupTablesStore, 'tableStore'),
  ],

  componentDidMount() {
    this._loadData(this.props);
  },

  componentWillReceiveProps(nextProps) {
    this._loadData(nextProps);
  },

  componentWillUnmount() {
    clearInterval(this.errorStatesTimer);
  },

  errorStatesTimer: undefined,
  errorStatesInterval: 1000,

  _startErrorStatesTimer() {
    this._stopErrorStatesTimer();

    this.errorStatesTimer = setInterval(() => {
      let names = null;
      if (this.state.dataAdapters) {
        names = this.state.dataAdapters.map(t => t.name);
      }
      if (names) {
        LookupTablesActions.getErrors(null, null, names || null);
      }
    }, this.errorStatesInterval);
  },

  _stopErrorStatesTimer() {
    if (this.errorStatesTimer) {
      clearInterval(this.errorStatesTimer);
      this.errorStatesTimer = undefined;
    }
  },

  _loadData(props) {
    this._stopErrorStatesTimer();
    if (props.params && props.params.adapterName) {
      LookupTableDataAdaptersActions.get(props.params.adapterName);
    } else if (this._isCreating(props)) {
      LookupTableDataAdaptersActions.getTypes();
    } else {
      const p = this.state.pagination;
      LookupTableDataAdaptersActions.searchPaginated(p.page, p.per_page, p.query);
      this._startErrorStatesTimer();
    }
  },

  _saved() {
    // reset detail state
    this.setState({ dataAdapter: undefined });
    this.props.history.pushState(null, Routes.SYSTEM.LOOKUPTABLES.DATA_ADAPTERS.OVERVIEW);
  },

  _isCreating(props) {
    return props.route.action === 'create';
  },

  _validateAdapter(adapter) {
    LookupTableDataAdaptersActions.validate(adapter);
  },

  render() {
    let content;
    const isShowing = this.props.route.action === 'show';
    const isEditing = this.props.route.action === 'edit';

    if (isShowing || isEditing) {
      if (!this.state.dataAdapter) {
        content = <Spinner text="正在加载数据适配器" />;
      } else if (isEditing) {
        content = (
          <Row className="content">
            <Col lg={12}>
              <h2>数据适配器</h2>
              <DataAdapterForm dataAdapter={this.state.dataAdapter}
                               type={this.state.dataAdapter.config.type}
                               create={false}
                               saved={this._saved}
                               validate={this._validateAdapter}
                               validationErrors={this.state.validationErrors} />
            </Col>
          </Row>
        );
      } else {
        content = <DataAdapter dataAdapter={this.state.dataAdapter} />;
      }
    } else if (this._isCreating(this.props)) {
      if (!this.state.types) {
        content = <Spinner text="正在加载数据适配器类型" />;
      } else {
        content = (<DataAdapterCreate history={this.props.history}
                                      types={this.state.types}
                                      saved={this._saved}
                                      validate={this._validateAdapter}
                                      validationErrors={this.state.validationErrors} />);
      }
    } else if (!this.state.dataAdapters) {
      content = <Spinner text="正在加载数据适配器" />;
    } else {
      content = (<DataAdaptersOverview dataAdapters={this.state.dataAdapters}
                                       pagination={this.state.pagination} errorStates={this.state.tableStore.errorStates} />);
    }

    return (
      <DocumentTitle title="查找表 - 数据适配器">
        <span>
          <PageHeader title="查找表的数据适配器">
            <span>数据适配器为查找表提供实际值</span>
            {null}
            <span>
              {isShowing && (
                <LinkContainer to={Routes.SYSTEM.LOOKUPTABLES.DATA_ADAPTERS.edit(this.props.params.adapterName)}
                               onlyActiveOnIndex>
                  <Button bsStyle="success">编辑</Button>
                </LinkContainer>
              )}
              &nbsp;
              {(isShowing || isEditing) && (
                <LinkContainer to={Routes.SYSTEM.LOOKUPTABLES.DATA_ADAPTERS.OVERVIEW}
                               onlyActiveOnIndex>
                  <Button bsStyle="info">数据适配器</Button>
                </LinkContainer>
              )}
              &nbsp;
              <LinkContainer to={Routes.SYSTEM.LOOKUPTABLES.OVERVIEW} onlyActiveOnIndex>
                <Button bsStyle="info">查找表</Button>
              </LinkContainer>
              &nbsp;
              <LinkContainer to={Routes.SYSTEM.LOOKUPTABLES.CACHES.OVERVIEW} onlyActiveOnIndex>
                <Button bsStyle="info">缓存</Button>
              </LinkContainer>
            </span>
          </PageHeader>

          {content}
        </span>
      </DocumentTitle>
    );
  },
});

export default LUTDataAdaptersPage;
