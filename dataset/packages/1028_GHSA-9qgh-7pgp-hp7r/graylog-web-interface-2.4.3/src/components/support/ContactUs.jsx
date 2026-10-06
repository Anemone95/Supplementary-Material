import React from 'react';
import { Col, Row } from 'react-bootstrap';

import DocumentationLink from 'components/support/DocumentationLink';
import DocsHelper from 'util/DocsHelper';

const ContactUs = React.createClass({
  render() {
    return (
      <Row className="content">
        <Col md={12}>
          <div className="support-sources">
            <h2>需要帮助吗?</h2>
            <p>
              如果在文档{' '}
              <DocumentationLink page={DocsHelper.PAGES.WELCOME} text="文档" />中没有您问题的解答，请毫不犹豫地咨询Graylog社区。
            </p>

            <ul>
              <li>
                <i className="fa fa-group" />&nbsp;
                <a href="https://www.graylog.org/community-support/" target="_blank">社区支持</a>
              </li>
              <li>
                <i className="fa fa-github-alt" />&nbsp;
                <a href="https://github.com/Graylog2/graylog2-server/issues" target="_blank">问题跟踪</a>
              </li>
              <li>
                <i className="fa fa-heart" />&nbsp;
                <a href="https://www.graylog.org/professional-support" target="_blank">专业支持</a>
              </li>
            </ul>
          </div>
        </Col>
      </Row>
    );
  },
});

export default ContactUs;
