import React from 'react';
import { Col, Jumbotron, Row } from 'react-bootstrap';
import { DocumentTitle } from 'components/common';

import style from '!style/useable!css!./NotFoundPage.css';

const NotFoundPage = React.createClass({
  componentDidMount() {
    style.use();
  },

  componentWillUnmount() {
    style.unuse();
  },

  render() {
    return (
      <DocumentTitle title="找不到网页">
        <Row className="jumbotron-container">
          <Col mdOffset={2} md={8}>
            <Jumbotron>
              <h1>找不到网页</h1>
              <p>派对大猩猩就在这里，但又有另外一派摇滚。</p>
              <p>哦，派对大猩猩！ 我们如何想念你！ 我们会再见到你吗？</p>
            </Jumbotron>
          </Col>
        </Row>
      </DocumentTitle>
    );
  },
});

export default NotFoundPage;
