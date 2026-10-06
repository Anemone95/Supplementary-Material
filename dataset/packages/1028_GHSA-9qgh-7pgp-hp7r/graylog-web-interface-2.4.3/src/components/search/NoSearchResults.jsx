import PropTypes from 'prop-types';
import React from 'react';
import { Col, Row } from 'react-bootstrap';

import { AddSearchCountToDashboard, SavedSearchControls, ShowQueryModal } from 'components/search';
import AddToDashboardMenu from 'components/dashboard/AddToDashboardMenu';
import { ContactUs, DocumentationLink } from 'components/support';

import DocsHelper from 'util/DocsHelper';

import StoreProvider from 'injection/StoreProvider';
const SearchStore = StoreProvider.getStore('Search');

const NoSearchResults = React.createClass({
  propTypes: {
    builtQuery: PropTypes.string,
    histogram: PropTypes.object.isRequired,
    permissions: PropTypes.array.isRequired,
    searchInStream: PropTypes.object,
  },

  componentDidMount() {
    this.style.use();
  },

  componentWillUnmount() {
    this.style.unuse();
  },

  style: require('!style/useable!css!./NoSearchResults.css'),

  _showQueryModal(event) {
    event.preventDefault();
    this.refs.showQueryModal.open();
  },

  render() {
    let streamDescription = null;
    if (this.props.searchInStream) {
      streamDescription = <span>在流<em>{this.props.searchInStream.title}</em></span>;
    }

    return (
      <div>
        <Row className="content content-head">
          <Col md={12}>
            <h1>没有搜索结果{streamDescription}</h1>

            <p className="description">
              您的搜索没有返回任何结果，请更改使用时间段或查询条件。{' '}
              您想要了解详细信息吗? <a href="#" onClick={this._showQueryModal}>显示Elasticsearch的查询</a>。
              <ShowQueryModal key="debugQuery" ref="showQueryModal" builtQuery={this.props.builtQuery} />
              <br />
              <strong>
                如果需要的话请查看{' '}
                <DocumentationLink page={DocsHelper.PAGES.SEARCH_QUERY_LANGUAGE} text="文档" />{' '}
                以了解搜索语法或时间段的选择。
              </strong>
            </p>
          </Col>
        </Row>
        <Row className="content search-actions">
          <Col md={12}>
            <Row className="row-sm">
              <Col md={4}>
                <h2>搜索操作</h2>
              </Col>
              <Col md={8}>
                <div className="actions">
                  <AddSearchCountToDashboard searchInStream={this.props.searchInStream}
                                             permissions={this.props.permissions} pullRight />
                  <AddToDashboardMenu title="将直方图添加到仪表板"
                                      widgetType="SEARCH_RESULT_CHART"
                                      configuration={{ interval: this.props.histogram.interval }}
                                      pullRight
                                      permissions={this.props.permissions} />
                  <SavedSearchControls currentSavedSearch={SearchStore.savedSearch} pullRight />
                </div>
              </Col>
            </Row>

            <p>
              如果您希望将来也使用这个搜索，您可以在仪表板中添加搜索小部件，并在此管理保存的搜索。
            </p>
          </Col>
        </Row>
        <ContactUs />
      </div>
    );
  },
});

export default NoSearchResults;
