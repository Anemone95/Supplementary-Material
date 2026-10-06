import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { Button, DropdownButton, MenuItem, Modal, Tab, Tabs } from 'react-bootstrap';
import { AutoAffix } from 'react-overlays';
import numeral from 'numeral';
import URI from 'urijs';
import naturalSort from 'javascript-natural-sort';

import { Timestamp } from 'components/common';
import DateTime from 'logic/datetimes/DateTime';

import StoreProvider from 'injection/StoreProvider';
const SessionStore = StoreProvider.getStore('Session');
const SearchStore = StoreProvider.getStore('Search');

import { AddSearchCountToDashboard,
  DecoratorSidebar,
  FieldAnalyzersSidebar,
  SavedSearchControls,
  ShowQueryModal } from 'components/search';
import BootstrapModalWrapper from 'components/bootstrap/BootstrapModalWrapper';

import URLUtils from 'util/URLUtils';
import ApiRoutes from 'routing/ApiRoutes';

import EventHandlersThrottler from 'util/EventHandlersThrottler';

const SearchSidebar = React.createClass({
  propTypes: {
    builtQuery: PropTypes.any,
    currentSavedSearch: PropTypes.string,
    fields: PropTypes.array,
    fieldAnalyzers: PropTypes.array,
    onFieldAnalyzer: PropTypes.func,
    onFieldToggled: PropTypes.func,
    permissions: PropTypes.array,
    predefinedFieldSelection: PropTypes.func,
    result: PropTypes.object,
    searchInStream: PropTypes.object,
    selectedFields: PropTypes.object,
    shouldHighlight: PropTypes.bool,
    showAllFields: PropTypes.bool,
    showHighlightToggle: PropTypes.bool,
    togglePageFields: PropTypes.func,
    toggleShouldHighlight: PropTypes.func,
    loadingSearch: PropTypes.bool,
    searchConfig: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      availableHeight: 1000,
      lastResultsUpdate: DateTime.now().toISOString(),
    };
  },

  componentDidMount() {
    this._updateHeight();
    window.addEventListener('resize', this._resizeCallback);
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.loadingSearch && !nextProps.loadingSearch) {
      this.setState({ lastResultsUpdate: DateTime.now().toISOString() });
    }
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this._resizeCallback);
  },

  eventsThrottler: new EventHandlersThrottler(),
  SIDEBAR_MARGIN_BOTTOM: 10,

  _resizeCallback() {
    this.eventsThrottler.throttle(() => this._updateHeight());
  },

  _updateHeight() {
    const viewPortHeight = window.innerHeight;

    const sidebar = ReactDOM.findDOMNode(this.refs.sidebar);
    const sidebarCss = window.getComputedStyle(ReactDOM.findDOMNode(sidebar));
    const sidebarPaddingBottom = parseFloat(sidebarCss.getPropertyValue('padding-bottom'));

    const maxHeight = viewPortHeight - sidebarPaddingBottom - this.SIDEBAR_MARGIN_BOTTOM;

    this.setState({ availableHeight: maxHeight });
  },

  _getURLForExportAsCSV() {
    const searchParams = SearchStore.getOriginalSearchURLParams();
    const streamId = this.props.searchInStream ? this.props.searchInStream.id : undefined;
    const query = searchParams.get('q') === '' ? '*' : searchParams.get('q');
    const fields = this.props.selectedFields;
    const rangeType = searchParams.get('rangetype');
    const timeRange = {};
    switch (rangeType) {
      case 'relative':
        timeRange.range = searchParams.get('relative');
        break;
      case 'absolute':
        timeRange.from = searchParams.get('from');
        timeRange.to = searchParams.get('to');
        break;
      case 'keyword':
        timeRange.keyword = searchParams.get('keyword');
        break;
      default:
        // Nothing to do here
    }

    const url = new URI(URLUtils.qualifyUrl(
      ApiRoutes.UniversalSearchApiController.export(rangeType, query, timeRange, streamId, 0, 0, fields.toJS()).url,
    ));

    if (URLUtils.areCredentialsInURLSupported()) {
      url
        .username(SessionStore.getSessionId())
        .password('session');
    }

    return url.toString();
  },

  _closeModal(ref) {
    return () => ref.close();
  },

  _openModal(ref) {
    return (...args) => {
      // Prevent event propagation that may come as first or second argument, as handlers for `onClick` and `onSelect`
      // have different signatures.
      [args[0], args[1]].some((argument) => {
        if (argument && argument.preventDefault) {
          argument.preventDefault();
          return true;
        }
        return false;
      });

      ref.open();
    };
  },

  _getExportModal() {
    const infoText = (URLUtils.areCredentialsInURLSupported() ?
      '请右键点击下面的下载链接，选择“链接另存为…”来下载CSV文件' :
      '请点击下面的下载链接，您的浏览器可能会要求您输入用户名和密码来' +
      '下载CSV文件。');
    return (
      <BootstrapModalWrapper ref={(ref) => { this.exportModal = ref; }}>
        <Modal.Header closeButton>
          <Modal.Title>将搜索结果导出为CSV</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{infoText}</p>
          <p>
            <a href={this._getURLForExportAsCSV()} target="_blank">
              <i className="fa fa-cloud-download" />&nbsp;
              下载
            </a>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this._closeModal(this.exportModal)}>关闭</Button>
        </Modal.Footer>
      </BootstrapModalWrapper>
    );
  },

  render() {
    const formattedIndices = this.props.result.used_indices
      .sort((i1, i2) => naturalSort(i1.index_name.toLowerCase(), i2.index_name.toLowerCase()))
      .map(index => <li key={index.index_name}> {index.index_name}</li>);

    const indicesModal = (
      <BootstrapModalWrapper ref={(ref) => { this.indicesModal = ref; }}>
        <Modal.Header closeButton>
          <Modal.Title>使用索引</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>基于您选择的时间框架Graylog智能地选择需要搜索的索引。
            这个索引列表主要是用于调试用的。</p>
          <h4>用于搜索的索引:</h4>

          <ul className="index-list">
            {formattedIndices}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this._closeModal(this.indicesModal)}>关闭</Button>
        </Modal.Footer>
      </BootstrapModalWrapper>
    );

    let searchTitle = null;
    const moreActions = [
      <MenuItem key="export" onSelect={this._openModal(this.exportModal)}>导出为CSV</MenuItem>,
    ];
    if (this.props.searchInStream) {
      searchTitle = <span>{this.props.searchInStream.title}</span>;
      // TODO: add stream actions to dropdown
    } else {
      searchTitle = <span>搜索结果</span>;
    }

    // always add the debug query link as last elem
    moreActions.push(<MenuItem divider key="div2" />);
    moreActions.push(<MenuItem key="showQuery" onSelect={this._openModal(this.showQueryModal)}>显示查询结果</MenuItem>);

    return (
      <AutoAffix affixClassName="affix">
        <div className="content-col" ref="sidebar" style={{ top: undefined, position: undefined }}>
          <div>
            <h2>
              {searchTitle}
            </h2>

            <p style={{ marginTop: 3 }}>
              找到了<strong>{numeral(this.props.result.total_results).format('0,0')} 消息</strong>{' '}
              在{numeral(this.props.result.time).format('0,0')} ms, 搜索于&nbsp;
              <a href="#" onClick={this._openModal(this.indicesModal)}>
                {this.props.result.used_indices.length}&nbsp;{this.props.result.used_indices.length === 1 ? '索引' : '索引'}
              </a>.
              {indicesModal}
              <br />
              结果检索时间 <Timestamp dateTime={this.state.lastResultsUpdate} format={DateTime.Formats.DATETIME} />。
            </p>

            <div className="actions">
              <AddSearchCountToDashboard searchInStream={this.props.searchInStream} permissions={this.props.permissions} />

              <SavedSearchControls currentSavedSearch={this.props.currentSavedSearch} />

              <div style={{ display: 'inline-block' }}>
                <DropdownButton bsSize="small" title="更多操作" id="search-more-actions-dropdown">
                  {moreActions}
                </DropdownButton>
                <ShowQueryModal key="debugQuery" ref={(ref) => { this.showQueryModal = ref; }} builtQuery={this.props.builtQuery} />
              </div>
            </div>

            {this._getExportModal()}

            <hr />
          </div>
          <Tabs id="searchSidebarTabs" animation={false}>
            <Tab eventKey={1} title={<h4>字段</h4>}>
              <FieldAnalyzersSidebar fields={this.props.fields}
                                     fieldAnalyzers={this.props.fieldAnalyzers}
                                     onFieldAnalyzer={this.props.onFieldAnalyzer}
                                     onFieldToggled={this.props.onFieldToggled}
                                     maximumHeight={this.state.availableHeight}
                                     predefinedFieldSelection={this.props.predefinedFieldSelection}
                                     result={this.props.result}
                                     searchConfig={this.props.searchConfig}
                                     selectedFields={this.props.selectedFields}
                                     shouldHighlight={this.props.shouldHighlight}
                                     showAllFields={this.props.showAllFields}
                                     showHighlightToggle={this.props.showHighlightToggle}
                                     togglePageFields={this.props.togglePageFields}
                                     toggleShouldHighlight={this.props.toggleShouldHighlight} />
            </Tab>

            <Tab eventKey={2} title={<h4>装饰器</h4>}>
              <DecoratorSidebar stream={this.props.searchInStream ? this.props.searchInStream.id : undefined}
                                maximumHeight={this.state.availableHeight} />
            </Tab>
          </Tabs>
        </div>
      </AutoAffix>
    );
  },
});

export default SearchSidebar;
