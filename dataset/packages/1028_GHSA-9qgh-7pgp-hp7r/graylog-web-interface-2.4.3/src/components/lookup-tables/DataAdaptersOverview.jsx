import PropTypes from 'prop-types';
import React from 'react';
import { Button, Row, Col, Table, Popover, OverlayTrigger } from 'react-bootstrap';
import Routes from 'routing/Routes';

import CombinedProvider from 'injection/CombinedProvider';
import { LinkContainer } from 'react-router-bootstrap';

import { PaginatedList, SearchForm, Spinner } from 'components/common';

import DataAdapterTableEntry from 'components/lookup-tables/DataAdapterTableEntry';

import Styles from './Overview.css';

const { LookupTableDataAdaptersActions } = CombinedProvider.get('LookupTableDataAdapters');

const DataAdaptersOverview = React.createClass({

  propTypes: {
    dataAdapters: PropTypes.array.isRequired,
    pagination: PropTypes.object.isRequired,
    errorStates: PropTypes.object.isRequired,
  },

  _onPageChange(newPage, newPerPage) {
    LookupTableDataAdaptersActions.searchPaginated(newPage, newPerPage,
      this.props.pagination.query);
  },

  _onSearch(query, resetLoadingStateCb) {
    LookupTableDataAdaptersActions
      .searchPaginated(this.props.pagination.page, this.props.pagination.per_page, query)
      .then(resetLoadingStateCb);
  },

  _onReset() {
    LookupTableDataAdaptersActions.searchPaginated(this.props.pagination.page, this.props.pagination.per_page);
  },

  _helpPopover() {
    return (
      <Popover id="search-query-help" className={Styles.popoverWide} title="搜索语法帮助">
        <p><strong>可用的搜索字段</strong></p>
        <Table condensed>
          <thead>
          <tr>
            <th>字段</th>
            <th>描述</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>id</td>
            <td>数据适配器ID</td>
          </tr>
          <tr>
            <td>标题</td>
            <td>数据适配器的标题</td>
          </tr>
          <tr>
            <td>名称</td>
            <td>数据适配器的参考名称</td>
          </tr>
          <tr>
            <td>描述</td>
            <td>数据适配器的描述</td>
          </tr>
          </tbody>
        </Table>
        <p><strong>示例</strong></p>
        <p>
          按部分名称查找数据适配器:<br />
          <kbd>{'name:geoip'}</kbd><br />
          <kbd>{'name:geo'}</kbd>
        </p>
        <p>
          没有字段名称的搜索与<code>标题</code>字段匹配:<br />
          <kbd>{'geoip'}</kbd> <br />相同于<br />
          <kbd>{'title:geoip'}</kbd>
        </p>
      </Popover>
    );
  },

  render() {
    if (!this.props.dataAdapters) {
      return <Spinner text="正在加载数据适配器" />;
    }
    const dataAdapters = this.props.dataAdapters.map((dataAdapter) => {
      return (<DataAdapterTableEntry key={dataAdapter.id}
                                     adapter={dataAdapter}
                                     error={this.props.errorStates.dataAdapters[dataAdapter.name]} />);
    });

    return (<div>
      <Row className="content">
        <Col md={12}>
          <h2>
            配置的查找数据适配器
            <span>&nbsp;
              <small>{this.props.pagination.total} 总计</small></span>
          </h2>
          <PaginatedList onChange={this._onPageChange} totalItems={this.props.pagination.total}>
            <SearchForm onSearch={this._onSearch} onReset={this._onReset} useLoadingState>
              <LinkContainer to={Routes.SYSTEM.LOOKUPTABLES.DATA_ADAPTERS.CREATE}>
                <Button bsStyle="success" style={{ marginLeft: 5 }}>创建数据适配器</Button>
              </LinkContainer>
              <OverlayTrigger trigger="click" rootClose placement="right" overlay={this._helpPopover()}>
                <Button bsStyle="link" className={Styles.searchHelpButton}><i className="fa fa-fw fa-question-circle" /></Button>
              </OverlayTrigger>
            </SearchForm>
            <Table condensed hover className={Styles.overviewTable}>
              <thead>
                <tr>
                  <th className={Styles.rowTitle}>标题</th>
                  <th className={Styles.rowDescription}>描述</th>
                  <th className={Styles.rowName}>名称</th>
                  <th>吞吐量</th>
                  <th className={Styles.rowActions}>操作</th>
                </tr>
              </thead>
              {dataAdapters}
            </Table>
          </PaginatedList>
        </Col>
      </Row>
    </div>);
  },
});

export default DataAdaptersOverview;
