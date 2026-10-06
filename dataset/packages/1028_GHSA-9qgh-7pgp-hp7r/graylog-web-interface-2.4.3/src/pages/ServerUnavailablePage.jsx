import PropTypes from 'prop-types';
import React from 'react';
import { Modal, Well } from 'react-bootstrap';
import { DocumentTitle } from 'components/common';

import URLUtils from 'util/URLUtils';

import disconnectedStyle from '!style/useable!css!less!stylesheets/disconnected.less';

const ServerUnavailablePage = React.createClass({
  propTypes: {
    server: PropTypes.object,
  },

  getInitialState() {
    return {
      showDetails: false,
    };
  },

  componentDidMount() {
    disconnectedStyle.use();
  },

  componentWillUnmount() {
    disconnectedStyle.unuse();
  },

  _toggleDetails() {
    this.setState({ showDetails: !this.state.showDetails });
  },

  _formatErrorMessage() {
    if (!this.state.showDetails) {
      return null;
    }

    const noInformationMessage = (
      <div>
        <hr />
        <p>没有可用的信息。</p>
      </div>
    );

    if (!this.props.server || !this.props.server.error) {
      return noInformationMessage;
    }

    const error = this.props.server.error;

    const errorDetails = [];
    if (error.message) {
      errorDetails.push(<dt key="error-title">错误信息</dt>, <dd key="error-desc">{error.message}</dd>);
    }
    if (error.originalError) {
      const originalError = error.originalError;
      errorDetails.push(
        <dt key="status-original-request-title">原始请求</dt>,
        <dd key="status-original-request-content">{String(originalError.method)} {String(originalError.url)}</dd>,
      );
      errorDetails.push(
        <dt key="status-code-title">状态码</dt>,
        <dd key="status-code-desc">{String(originalError.status)}</dd>,
      );

      if (typeof originalError.toString === 'function') {
        errorDetails.push(
          <dt key="full-error-title">完整的错误信息</dt>,
          <dd key="full-error-desc">{originalError.toString()}</dd>,
        );
      }
    }

    if (errorDetails.length === 0) {
      return noInformationMessage;
    }

    return (
      <div>
        <hr style={{ marginTop: 10, marginBottom: 10 }} />
        <p>这是我们从服务器收到的最后一个响应:</p>
        <Well bsSize="small" style={{ whiteSpace: 'pre-line' }}>
          <dl style={{ marginBottom: 0 }}>
            {errorDetails}
          </dl>
        </Well>
      </div>
    );
  },

  render() {
    return (
      <DocumentTitle title="服务器不可用">
        <Modal show>
          <Modal.Header>
            <Modal.Title><i className="fa fa-exclamation-triangle" /> 服务器当前不可用</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <p>
                我们在连接到运行在<i>{URLUtils.qualifyUrl('')}</i>上的Graylog服务器时遇到问题。
                请确认服务器运行正常并正常工作。
              </p>
              <p>一旦我们可以连接到服务器，您将自动重定向到上一页。</p>
              <p>
                您需要帮助吗？?{' '}
                <a href="https://www.graylog.org/community-support" target="_blank">我们能帮助您</a>。
              </p>
              <div>
                <a href="#" onClick={this._toggleDetails}>
                  {this.state.showDetails ? '收起' : '详细信息'}
                </a>
                {this._formatErrorMessage()}
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </DocumentTitle>
    );
  },
});

export default ServerUnavailablePage;
