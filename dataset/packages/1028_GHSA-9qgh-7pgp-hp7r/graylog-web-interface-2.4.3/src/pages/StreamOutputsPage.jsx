import React from 'react';
import Reflux from 'reflux';
import { Row, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import StoreProvider from 'injection/StoreProvider';
const CurrentUserStore = StoreProvider.getStore('CurrentUser');
const StreamsStore = StoreProvider.getStore('Streams');

import OutputsComponent from 'components/outputs/OutputsComponent';
import SupportLink from 'components/support/SupportLink';
import { DocumentTitle, Spinner } from 'components/common';
import Routes from 'routing/Routes';

const StreamOutputsPage = React.createClass({
  mixins: [Reflux.connect(CurrentUserStore)],
  getInitialState() {
    return { stream: undefined };
  },
  componentDidMount() {
    StreamsStore.get(this.props.params.streamId, (stream) => {
      this.setState({ stream: stream });
    });
  },
  render() {
    if (!this.state.stream) {
      return <Spinner />;
    }
    return (
      <DocumentTitle title={`流${this.state.stream.title}的输出`}>
        <div>
          <Row className="content content-head">
            <Col md={10}>
              <h1>
                流 &raquo;{this.state.stream.title}&laquo; 的输出
              </h1>

              <p className="description">
                Graylog节点可以通过输出转发消息流。您可以在这里启动或终止任意数量的输出。
                您还可以重用已经为其他流运行的输出。

                在<a href="@routes.OutputsController.index()">这里</a>所有配置输出的全局视图是可用的。
                您可以在<a href="https://marketplace.graylog.org/" target="_blank">Graylog商城</a>中找到输出插件。
              </p>

              <SupportLink>
                <i>删除</i>一个输出，将它从这个流中删除，但是它仍然在可用输出的列表中。
                删除一个<i>全局</i>输出将会从这个和所有其他流中删除它并终止它。
                您可以在{' '} <LinkContainer to={Routes.SYSTEM.OUTPUTS}><a>全局输出列表</a></LinkContainer>中看到所有已定义的输出。
              </SupportLink>
            </Col>
          </Row>
          <OutputsComponent streamId={this.state.stream.id} permissions={this.state.currentUser.permissions} />
        </div>
      </DocumentTitle>
    );
  },
});

export default StreamOutputsPage;
