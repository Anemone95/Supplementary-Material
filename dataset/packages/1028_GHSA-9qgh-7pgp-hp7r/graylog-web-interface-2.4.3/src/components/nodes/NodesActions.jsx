import PropTypes from 'prop-types';
import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Button, DropdownButton, MenuItem } from 'react-bootstrap';
import URI from 'urijs';

import { ExternalLinkButton, IfPermitted } from 'components/common';

import StoreProvider from 'injection/StoreProvider';
const SystemProcessingStore = StoreProvider.getStore('SystemProcessing');
const SystemLoadBalancerStore = StoreProvider.getStore('SystemLoadBalancer');
const SystemShutdownStore = StoreProvider.getStore('SystemShutdown');

import Routes from 'routing/Routes';

const NodesActions = React.createClass({
  propTypes: {
    node: PropTypes.object.isRequired,
    systemOverview: PropTypes.object.isRequired,
  },
  _toggleMessageProcessing() {
    if (confirm(`您确定在此节点中${this.props.systemOverview.is_processing ? '暂停' : '恢复'}消息处理吗?`)) {
      if (this.props.systemOverview.is_processing) {
        SystemProcessingStore.pause(this.props.node.node_id);
      } else {
        SystemProcessingStore.resume(this.props.node.node_id);
      }
    }
  },
  _changeLBStatus(status) {
    return () => {
      if (confirm(`您确定将此节点的负载平衡器状态更改为${status}吗?`)) {
        SystemLoadBalancerStore.override(this.props.node.node_id, status);
      }
    };
  },
  _shutdown() {
    if (prompt('您真的想关闭这个节点吗? 通过输入"SHUTDOWN"来确认。') === 'SHUTDOWN') {
      SystemShutdownStore.shutdown(this.props.node.node_id);
    }
  },
  render() {
    const apiBrowserURI = new URI(`${this.props.node.transport_address}/api-browser`).normalizePathname().toString();
    return (
      <div className="item-actions">
        <LinkContainer to={Routes.SYSTEM.NODES.SHOW(this.props.node.node_id)}>
          <Button bsStyle="info">详细信息</Button>
        </LinkContainer>

        <LinkContainer to={Routes.SYSTEM.METRICS(this.props.node.node_id)}>
          <Button bsStyle="info">指标</Button>
        </LinkContainer>

        <ExternalLinkButton bsStyle="info" href={apiBrowserURI}>
          API浏览器
        </ExternalLinkButton>

        <DropdownButton title="更多操作" id={`more-actions-dropdown-${this.props.node.node_id}`} pullRight>
          <IfPermitted permissions="processing:changestate">
            <MenuItem onSelect={this._toggleMessageProcessing}>
              {this.props.systemOverview.is_processing ? '暂停' : '恢复'}消息处理
            </MenuItem>
          </IfPermitted>

          <IfPermitted permissions="lbstatus:change">
            <li className="dropdown-submenu left-submenu">
              <a href="#">覆盖LB状态</a>
              <ul className="dropdown-menu">
                <MenuItem onSelect={this._changeLBStatus('ALIVE')}>活着</MenuItem>
                <MenuItem onSelect={this._changeLBStatus('DEAD')}>死亡</MenuItem>
              </ul>
            </li>
          </IfPermitted>

          <IfPermitted permissions="node:shutdown">
            <MenuItem onSelect={this._shutdown}>正常关闭</MenuItem>
          </IfPermitted>

          <IfPermitted permissions={['processing:changestate', 'lbstatus:change', 'node:shutdown']} anyPermissions>
            <IfPermitted permissions={['inputs:read', 'threads:dump']} anyPermissions>
              <MenuItem divider />
            </IfPermitted>
          </IfPermitted>

          <IfPermitted permissions="inputs:read">
            <LinkContainer to={Routes.node_inputs(this.props.node.node_id)}>
              <MenuItem>本地消息输入</MenuItem>
            </LinkContainer>
          </IfPermitted>
          <IfPermitted permissions="threads:dump">
            <LinkContainer to={Routes.SYSTEM.THREADDUMP(this.props.node.node_id)}>
              <MenuItem>获取线程转储</MenuItem>
            </LinkContainer>
          </IfPermitted>
        </DropdownButton>
      </div>
    );
  },
});

export default NodesActions;
