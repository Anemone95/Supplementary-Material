import PropTypes from 'prop-types';
import React from 'react';
import { NavDropdown, MenuItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { ExternalLink } from 'components/common';

import DocsHelper from 'util/DocsHelper';
import Routes from 'routing/Routes';

const HelpMenu = React.createClass({
  propTypes: {
    active: PropTypes.bool.isRequired,
  },
  render() {
    return (
      <NavDropdown title="帮助" id="help-menu-dropdown" active={this.props.active}>
        <LinkContainer to={Routes.getting_started(true)}>
          <MenuItem>入门指南</MenuItem>
        </LinkContainer>
        <MenuItem href={DocsHelper.versionedDocsHomePage()} target="_blank">
          <ExternalLink>文档</ExternalLink>
        </MenuItem>
      </NavDropdown>
    );
  },
});

export default HelpMenu;
