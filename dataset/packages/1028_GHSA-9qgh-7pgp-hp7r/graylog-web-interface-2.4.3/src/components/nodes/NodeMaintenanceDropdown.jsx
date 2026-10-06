import PropTypes from 'prop-types';
import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap';
import URI from 'urijs';

import { ExternalLink, IfPermitted } from 'components/common';

import Routes from 'routing/Routes';

const NodeMaintenanceDropdown = React.createClass({
  propTypes: {
    node: PropTypes.object.isRequired,
  },
  render() {
    const apiBrowserURI = new URI(`${this.props.node.transport_address}/api-browser`).normalizePathname().toString();
    return (
      <ButtonGroup>
        <DropdownButton bsStyle="info" bsSize="lg" title="操作" id="node-maintenance-actions" pullRight>
          <IfPermitted permissions="threads:dump">
            <LinkContainer to={Routes.SYSTEM.THREADDUMP(this.props.node.node_id)}>
              <MenuItem>获取线程转储</MenuItem>
            </LinkContainer>
          </IfPermitted>

          <LinkContainer to={Routes.SYSTEM.METRICS(this.props.node.node_id)}>
            <MenuItem>指标</MenuItem>
          </LinkContainer>

          <IfPermitted permissions="loggers:read">
            <LinkContainer to={Routes.SYSTEM.LOGGING}>
              <MenuItem>配置内部记录</MenuItem>
            </LinkContainer>
          </IfPermitted>

          <MenuItem href={apiBrowserURI} target="_blank">
            <ExternalLink>API浏览器</ExternalLink>
          </MenuItem>
        </DropdownButton>
      </ButtonGroup>
    );
  },
});

export default NodeMaintenanceDropdown;
