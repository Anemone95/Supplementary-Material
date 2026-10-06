import PropTypes from 'prop-types';
import React from 'react';
import { Col, Panel, Row } from 'react-bootstrap';

import { ContactUs, DocumentationLink } from 'components/support';
import DocsHelper from 'util/DocsHelper';

const MalformedSearchQuery = React.createClass({
  propTypes: {
    error: PropTypes.object.isRequired,
  },

  _isGenericError(error) {
    return error.column === null || error.line === null;
  },

  _getFormattedErrorDetails(details) {
    return details.map(function(detail) {
        return <li><code>{detail}</code></li>
    });
  },

  _getFormattedErrorDescription(error) {
    return (
      <Panel bsStyle="danger">
        <dl style={{ marginBottom: 0 }}>
          <dt>错误信息:</dt>
          <dd>{error.message}</dd>
          <dt>详情:</dt>
          <dd>{this._getFormattedErrorDetails(error.details)}</dd>
        </dl>
      </Panel>
    );
  },

  render() {
    const error = this.props.error.body;

    let explanation;
    if (this._isGenericError(error)) {
      explanation = (
        <div>
          <p>给定查询有问题，以下是它的执行错误:</p>
          {this._getFormattedErrorDescription(error)}
        </div>
      );
    } else {
      explanation = (
        <div>
          {this._getFormattedErrorDescription(error)}
        </div>
      );
    }

    return (
      <div>
        <Row className="content content-head">
          <Col md={12}>

            <h1>
              出错的查询
            </h1>

            <p className="description">
              无法执行搜索查询，请纠正后再次尝试。{' '}
              <strong>
                如果您在搜索语法方面需要帮助，请查看{' '}
                <DocumentationLink page={DocsHelper.PAGES.SEARCH_QUERY_LANGUAGE} text="文档" />{' '}
                。
              </strong>
            </p>
          </Col>
        </Row>

        <Row className="content">
          <Col md={12}>
            {explanation}
          </Col>
        </Row>

        <ContactUs />
      </div>
    );
  },
});

export default MalformedSearchQuery;
