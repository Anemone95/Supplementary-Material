import React from 'react';
import { Col, Pagination, Row } from 'react-bootstrap';

import StoreProvider from 'injection/StoreProvider';
const SystemMessagesStore = StoreProvider.getStore('SystemMessages');

import { Spinner } from 'components/common';
import { SystemMessagesList } from 'components/systemmessages';

const SystemMessagesComponent = React.createClass({
  getInitialState() {
    return { currentPage: 1 };
  },
  componentDidMount() {
    this.loadMessages(this.state.currentPage);
    this.interval = setInterval(() => { this.loadMessages(this.state.currentPage); }, 1000);
  },
  componentWillUnmount() {
    clearInterval(this.interval);
  },
  PER_PAGE: 30,
  loadMessages(page) {
    SystemMessagesStore.all(page).then((response) => {
      this.setState(response);
    });
  },
  _onSelected(selectedPage) {
    this.setState({ currentPage: selectedPage });
    this.loadMessages(selectedPage);
  },
  render() {
    let content;
    if (this.state.total && this.state.messages) {
      const numberPages = Math.ceil(this.state.total / this.PER_PAGE);
      const paginatorSize = 10;

      content = (
        <div>
          <SystemMessagesList messages={this.state.messages} />

          <nav style={{ textAlign: 'center' }}>
            <Pagination bsSize="small" items={numberPages}
                        activePage={this.state.currentPage}
                        onSelect={this._onSelected}
                        prev next first last
                        maxButtons={Math.min(paginatorSize, numberPages)} />
          </nav>
        </div>
      );
    } else {
      content = <Spinner />;
    }

    return (
      <Row className="content">
        <Col md={12}>
          <h2>系统消息</h2>

          <p className="description">
            系统消息是由Graylog服务器节点因某些Graylog管理员会感兴趣的事件而生成的，因为任何需要反应的事件通知将会升级，您不需要对这里的任何消息做出任何反应。
          </p>

          {content}
        </Col>
      </Row>
    );
  },
});

export default SystemMessagesComponent;
