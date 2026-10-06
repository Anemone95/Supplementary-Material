import PropTypes from 'prop-types';
import React from 'react';
import { Col, Jumbotron, Row } from 'react-bootstrap';

import style from '!style/useable!css!pages/NotFoundPage.css';

const PageErrorOverview = React.createClass({
  propTypes: {
    errors: PropTypes.array.isRequired,
  },
  componentDidMount() {
    style.use();
  },

  componentWillUnmount() {
    style.unuse();
  },

  _formatErrors(errors) {
    const formattedErrors = errors ? errors.map(error => <li>{error.toString()}</li>) : [];
    return (
      <ul>
        {formattedErrors}
        <li>查看您的Graylog日志以获取更多信息。</li>
      </ul>
    );
  },
  render() {
    return (
      <Row className="jumbotron-container">
        <Col mdOffset={2} md={8}>
          <Jumbotron>
            <h1>获取数据出错</h1>
            <p>我们无法获取构建此页面所需的一些数据，因此在这用一张图片代替。</p>
            {this._formatErrors(this.props.errors)}
          </Jumbotron>
        </Col>
      </Row>
    );
  },
});

export default PageErrorOverview;
