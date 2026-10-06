import PropTypes from 'prop-types';
import React from 'react';
import { Col, Row } from 'react-bootstrap';

import { DocumentTitle, Spinner } from 'components/common';

import disconnectedStyle from '!style/useable!css!less!stylesheets/disconnected.less';
import authStyle from '!style/useable!css!less!stylesheets/auth.less';

const LoadingPage = React.createClass({
  propTypes: {
    text: PropTypes.string,
  },

  getDefaultProps() {
    return {
      text: '正在加载, 请稍等...',
    };
  },

  componentDidMount() {
    disconnectedStyle.use();
    authStyle.use();
  },

  componentWillUnmount() {
    disconnectedStyle.unuse();
    authStyle.unuse();
  },

  render() {
    return (
      <DocumentTitle title="正在加载...">
        <div className="container" id="login-box">
          <Row>
            <Col md={4} mdOffset={4} className="well" id="login-box-content">
              <legend><i className="fa fa-group" /> 欢迎来到Graylog</legend>
              <p className="loading-text">
                <Spinner text={this.props.text} />
              </p>
            </Col>
          </Row>
        </div>
      </DocumentTitle>
    );
  },
});

export default LoadingPage;
