import PropTypes from 'prop-types';
import React from 'react';
import { DocumentTitle, PageHeader } from 'components/common';
import { Button } from 'react-bootstrap';

import LdapComponent from 'components/ldap/LdapComponent';
import LdapGroupsComponent from 'components/ldap/LdapGroupsComponent';

import CombinedProvider from 'injection/CombinedProvider';
const { LdapActions } = CombinedProvider.get('Ldap');

import Routes from 'routing/Routes';

const LegacyLdapConfig = React.createClass({
  propTypes: {
    history: PropTypes.object.isRequired,
  },
  getInitialState() {
    return {
      showSettings: true,
    };
  },

  componentDidMount() {
    LdapActions.loadSettings();
  },

  _toggleButton() {
    this.setState({ showSettings: !this.state.showSettings });
  },

  _onSettingsCancel() {
    this._toggleButton();
  },

  _onCancel() {
    this.props.history.pushState(null, Routes.SYSTEM.AUTHENTICATION.OVERVIEW);
  },

  render() {
    const toggleButtonText = this.state.showSettings ? 'LDAP组映射' : 'LDAP设置';
    const activeComponent = (this.state.showSettings ?
      <LdapComponent onCancel={this._onCancel} onShowGroups={this._toggleButton} /> :
      <LdapGroupsComponent onCancel={this._onSettingsCancel} onShowConfig={this._toggleButton} />);

    return (
      <DocumentTitle title="LDAP设置">
        <span>
          <PageHeader title="LDAP设置" subpage>
            <span>
              此页面是您设置Graylog LDAP集成所需的唯一资源。您可以测试与LDAP服务器的连接，甚至尝试使用您选择的LDAP帐户立即登录。
            </span>
            {null}
            <span>
              <Button bsStyle="success" onClick={this._toggleButton}>{toggleButtonText}</Button>
            </span>
          </PageHeader>
          {activeComponent}
        </span>
      </DocumentTitle>
    );
  },
});

export default LegacyLdapConfig;
