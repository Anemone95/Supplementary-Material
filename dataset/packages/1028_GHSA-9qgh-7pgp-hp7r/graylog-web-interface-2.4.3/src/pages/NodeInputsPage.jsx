import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import { LinkContainer } from 'react-router-bootstrap';

import StoreProvider from 'injection/StoreProvider';
const NodesStore = StoreProvider.getStore('Nodes');
const CurrentUserStore = StoreProvider.getStore('CurrentUser');
const InputStatesStore = StoreProvider.getStore('InputStates');

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import { InputsList } from 'components/inputs';

import Routes from 'routing/Routes';

function nodeFilter(state) {
  return state.nodes ? state.nodes[this.props.params.nodeId] : state.nodes;
}

const NodeInputsPage = React.createClass({
  propTypes: {
    params: PropTypes.object.isRequired,
  },
  mixins: [Reflux.connect(CurrentUserStore), Reflux.connectFilter(NodesStore, 'node', nodeFilter)],
  componentDidMount() {
    this.interval = setInterval(InputStatesStore.list, 2000);
  },
  componentWillUnmount() {
    clearInterval(this.interval);
  },
  _isLoading() {
    return !this.state.node;
  },
  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const title = <span>节点{this.state.node.short_node_id} / {this.state.node.hostname}的输入</span>;

    return (
      <DocumentTitle title={`节点${this.state.node.short_node_id} / ${this.state.node.hostname}的输入`}>
        <div>
          <PageHeader title={title}>
            <span>Graylog节点通过输入接受数据。在这个页面上，你可以看到哪个输入在这个特定的节点上运行。</span>

            <span>
              您可以在<LinkContainer to={Routes.SYSTEM.INPUTS}><a>这里</a></LinkContainer>启动和终止集群上的输入。
            </span>
          </PageHeader>
          <InputsList permissions={this.state.currentUser.permissions} node={this.state.node} />
        </div>
      </DocumentTitle>
    );
  },
});

export default NodeInputsPage;
