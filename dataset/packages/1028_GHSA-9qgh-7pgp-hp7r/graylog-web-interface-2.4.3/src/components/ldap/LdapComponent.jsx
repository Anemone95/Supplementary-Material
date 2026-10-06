import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import { Row, Col, Button, Panel } from 'react-bootstrap';
import URI from 'urijs';
import naturalSort from 'javascript-natural-sort';

import { Input } from 'components/bootstrap';
import { MultiSelect, Spinner } from 'components/common';
import ObjectUtils from 'util/ObjectUtils';

import TestLdapConnection from './TestLdapConnection';
import TestLdapLogin from './TestLdapLogin';

import StoreProvider from 'injection/StoreProvider';
const RolesStore = StoreProvider.getStore('Roles');
const LdapStore = StoreProvider.getStore('Ldap');

import ActionsProvider from 'injection/ActionsProvider';
const LdapActions = ActionsProvider.getActions('Ldap');

const HelperText = {
  activeDirectory: {
    SYSTEM_USERNAME: (
      <span>
        初始连接到Active Directory服务器的用户名，例如 <code>ldapbind@some.domain</code>。<br />
        这需要匹配该用户的<code>userPrincipalName</code>。
      </span>
    ),
    SYSTEM_PASSWORD: ('初始连接到Active Directory服务器的密码。'),
    SEARCH_BASE: (
      <span>
        基本树将对Active Directory搜索查询限制，例如 <code>cn=users,dc=example,dc=com</code>。
      </span>
    ),
    SEARCH_PATTERN: (
      <span>
        例如 <code className="text-nowrap">{'(&(objectClass=user)(sAMAccountName={0}))'}</code>。{' '}
        字符串 <code>{'{0}'}</code>将被输入的用户名替换。
      </span>
    ),
    DISPLAY_NAME: (
      <span>
        哪个Active Directory属性用于Graylog中用户的全名，例如 <code>displayName</code>。<br />
        如果您不确定要使用哪个属性，请尝试使用下面的表单加载测试用户。
      </span>
    ),
    GROUP_SEARCH_BASE: (
      <span>
        基本树将对Active Directory组搜索查询限制，例如 <code>cn=users,dc=example,dc=com</code>。
      </span>
    ),
    GROUP_PATTERN: (
      <span>
        用于在Active Directory中查找群以映射到Graylog角色的搜索模式，例如{' '}
        <code className="text-nowrap">(objectClass=group)</code> 或{' '}
        <code className="text-nowrap">(&amp;(objectClass=group)(cn=graylog*))</code>。
      </span>
    ),
    GROUP_ID: (
      <span>哪个Active Directory属性用于群的全名，通常是 <code>cn</code>。</span>
    ),
    defaultGroup: onClickHandler => (
      <span>
        默认的Graylog角色决定了通过Active Directory创建的用户是否可以访问整个系统，或者访问权限是否有限。<br />
        您可以分配额外的权限通过{' '}
        <a href="#" onClick={onClickHandler}>将Active Directory群映射到Graylog角色</a>,{' '}
        或者将其他Graylog角色分配给下面的Active Directory用户。
      </span>
    ),
    ADDITIONAL_GROUPS: (
      '如果要将Active Directory群映射到Graylog角色，请选择每个Active Directory用户默认具有的额外角色，并将其保留为空。'
    ),
  },

  ldap: {
    SYSTEM_USERNAME: (
      <span>
        初始连接到LDAP服务器的用户名，例如{' '}
        <code className="text-nowrap">uid=admin,ou=system</code>，这可能是可选的，具体取决于您的LDAP服务器。
      </span>
    ),
    SYSTEM_PASSWORD: ('初始连接到LDAP服务器的密码。'),
    SEARCH_BASE: (
      <span>
        基本树将对LDAP搜索查询限制，例如 <code
        className="text-nowrap">cn=users,dc=example,dc=com</code>。
      </span>
    ),
    SEARCH_PATTERN: (
      <span>
        例如 <code className="text-nowrap">{'(&(objectClass=inetOrgPerson)(uid={0}))'}</code>。{' '}
        字符串 <code>{'{0}'}</code>将被输入的用户名替换。
      </span>
    ),
    DISPLAY_NAME: (
      <span>
        哪个LDAP属性用于Graylog中用户的全名，例如 <code>cn</code>。<br />
        如果您不确定要使用哪个属性，请尝试使用下面的表单加载测试用户。
      </span>
    ),
    GROUP_SEARCH_BASE: (
      <span>
        基本树将对LDAP组搜索查询限制，例如 <code>cn=users,dc=example,dc=com</code>。
      </span>
    ),
    GROUP_PATTERN: (
      <span>
        用于在LDAP中查找群以映射到Graylog角色的搜索模式，例如{' '}
        <code>(objectClass=groupOfNames)</code> 或{' '}
        <code className="text-nowrap">(&amp;(objectClass=groupOfNames)(cn=graylog*))</code>。
      </span>
    ),
    GROUP_ID: (
      <span>使用哪个LDAP属性作为群的全名，通常是 <code>cn</code>。</span>
    ),
    defaultGroup: onClickHandler => (
      <span>
        默认的Graylog角色决定了通过LDAP创建的用户是否可以访问整个系统，或者具有有限的访问权限。<br />
        您可以分配额外的权限通过{' '}
        <a href="#" onClick={onClickHandler}>将LDAP群映射到Graylog角色</a>,{' '}
        或者您可以将其他Graylog角色分配给下面的LDAP用户。
      </span>
    ),
    ADDITIONAL_GROUPS: (
      '选择每个LDAP用户默认具有额外角色，如果要将LDAP群映射到Graylog角色，请将其保留为空。'
    ),
  },
};

const LdapComponent = React.createClass({
  mixins: [Reflux.listenTo(LdapStore, '_onLdapSettingsChange', '_onLdapSettingsChange')],

  propTypes: {
    onCancel: PropTypes.func.isRequired,
    onShowGroups: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      ldapSettings: undefined,
      ldapUri: undefined,
      roles: undefined,
    };
  },

  componentDidMount() {
    RolesStore.loadRoles().then((roles) => {
      this.setState({ roles: this._formatAdditionalRoles(roles) });
    });
  },

  _formatAdditionalRoles(roles) {
    return roles
      .filter(r => !(r.name.toLowerCase() === 'reader' || r.name.toLowerCase() === 'admin'))
      .sort((r1, r2) => naturalSort(r1.name.toLowerCase(), r2.name.toLowerCase()))
      .map((r) => {
        return { label: r.name, value: r.name };
      });
  },

  _onLdapSettingsChange(state) {
    if (!state.ldapSettings) {
      return;
    }

    // Clone settings object, so we don't the store reference
    const settings = ObjectUtils.clone(state.ldapSettings);
    const ldapUri = new URI(settings.ldap_uri);
    this.setState({ ldapSettings: settings, ldapUri: ldapUri });
  },

  _isLoading() {
    return !this.state.ldapSettings || !this.state.roles;
  },

  _bindChecked(ev, value) {
    this._setSetting(ev.target.name, typeof value === 'undefined' ? ev.target.checked : value);
  },

  _bindValue(ev) {
    this._setSetting(ev.target.name, ev.target.value);
  },

  _updateSsl(ev) {
    this._setUriScheme(ev.target.checked ? 'ldaps' : 'ldap');
  },

  _setSetting(attribute, value) {
    const newState = {};

    let formattedValue = value;
    // Convert URI object into string to store it in the state
    if (attribute === 'ldap_uri' && typeof value === 'object') {
      newState.ldapUri = value;
      formattedValue = value.toString();
    }

    // Clone state to not modify it directly
    const settings = ObjectUtils.clone(this.state.ldapSettings);
    settings[attribute] = formattedValue;
    newState.ldapSettings = settings;
    newState.serverConnectionStatus = {};
    this.setState(newState);
  },

  _setUriScheme(scheme) {
    const ldapUri = this.state.ldapUri.clone();
    ldapUri.scheme(scheme);
    this._setSetting('ldap_uri', ldapUri);
  },

  _uriScheme() {
    return `${this.state.ldapUri.scheme()}://`;
  },

  _setUriHost(host) {
    const ldapUri = this.state.ldapUri.clone();
    ldapUri.hostname(host);
    this._setSetting('ldap_uri', ldapUri);
  },

  _uriHost() {
    return this.state.ldapUri.hostname();
  },

  _setUriPort(port) {
    const ldapUri = this.state.ldapUri.clone();
    ldapUri.port(port);
    this._setSetting('ldap_uri', ldapUri);
  },

  _uriPort() {
    return this.state.ldapUri.port();
  },

  _setAdditionalDefaultGroups(rolesString) {
    // only keep non-empty entries
    const roles = rolesString.split(',').filter(v => v !== '');
    this._setSetting('additional_default_groups', roles);
  },

  _saveSettings(event) {
    event.preventDefault();
    LdapActions.update(this.state.ldapSettings);
  },

  _onShowGroups(event) {
    event.preventDefault();
    this.props.onShowGroups();
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const isAD = this.state.ldapSettings.active_directory;
    const disabled = !this.state.ldapSettings.enabled;
    const help = isAD ? HelperText.activeDirectory : HelperText.ldap;

    const rolesOptions = this.state.roles;

    return (
      <Row>
        <Col lg={8}>
          <form id="ldap-settings-form" className="form-horizontal" onSubmit={this._saveSettings}>
            <Input type="checkbox" label="启用LDAP"
                   help="用户帐户将从LDAP / Active Directory中获取，管理员帐户仍然可用。"
                   wrapperClassName="col-sm-offset-3 col-sm-9"
                   name="enabled"
                   checked={this.state.ldapSettings.enabled}
                   onChange={this._bindChecked} />

            <fieldset>
              <Row className="row-sm">
                <Col sm={12}>
                  <legend>1. 服务器配置</legend>
                </Col>
              </Row>
              <Input id="active_directory" labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9" label="服务器类型">
                <label className="radio-inline">
                  <input type="radio" name="active_directory"
                         checked={!isAD} disabled={disabled}
                         onChange={ev => this._bindChecked(ev, false)} />
                  LDAP
                </label>
                <label className="radio-inline">
                  <input type="radio" name="active_directory"
                         checked={isAD} disabled={disabled}
                         onChange={ev => this._bindChecked(ev, true)} />
                  Active Directory
                </label>
              </Input>

              <Input id="ldap-uri-host" labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9" label="服务器地址">
                <div className="input-group">
                  <span className="input-group-addon">{this._uriScheme()}</span>
                  <input type="text" className="form-control" id="ldap-uri-host" value={this._uriHost()}
                         placeholder="主机名" required onChange={ev => this._setUriHost(ev.target.value)}
                         disabled={disabled} />
                  <span className="input-group-addon input-group-separator">:</span>
                  <input type="number" className="form-control" id="ldap-uri-port" value={this._uriPort()} min="1"
                         max="65535" placeholder="端口"
                         required style={{ width: 120 }} onChange={ev => this._setUriPort(ev.target.value)}
                         disabled={disabled} />
                </div>
                <label className="checkbox-inline">
                  <input type="checkbox" name="ssl" checked={this.state.ldapUri.scheme() === 'ldaps'}
                         onChange={this._updateSsl}
                         disabled={disabled} /> SSL
                </label>
                <label className="checkbox-inline">
                  <input type="checkbox" name="use_start_tls" value="true" id="ldap-uri-starttls"
                         checked={this.state.ldapSettings.use_start_tls} onChange={this._bindChecked}
                         disabled={disabled} /> 开始TLS
                </label>
                <label className="checkbox-inline">
                  <input type="checkbox" name="trust_all_certificates" value="true" id="trust-all-certificates"
                         checked={this.state.ldapSettings.trust_all_certificates} onChange={this._bindChecked}
                         disabled={disabled} /> 允许自签名证书
                </label>
              </Input>

              <Input type="text" id="system_username" name="system_username" labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9" placeholder="系统用户DN" label="系统用户名"
                     value={this.state.ldapSettings.system_username} help={help.SYSTEM_USERNAME}
                     onChange={this._bindValue} disabled={disabled} />

              <Input type="password" id="system_password" name="system_password" labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9" placeholder="系统密码" label="系统密码"
                     value={this.state.ldapSettings.system_password} help={help.SYSTEM_PASSWORD}
                     onChange={this._bindValue} disabled={disabled} />
            </fieldset>

            <fieldset>
              <Row className="row-sm">
                <Col sm={12}>
                  <legend>2. 连接测试</legend>
                </Col>
              </Row>
              <TestLdapConnection ldapSettings={this.state.ldapSettings} ldapUri={this.state.ldapUri} disabled={disabled} />
            </fieldset>

            <fieldset>
              <Row className="row-sm">
                <Col sm={12}>
                  <legend>3. 用户映射</legend>
                </Col>
              </Row>
              <Input type="text" id="search_base" name="search_base" labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9" placeholder="搜索基线" label="搜索基线DN"
                     value={this.state.ldapSettings.search_base} help={help.SEARCH_BASE}
                     onChange={this._bindValue} disabled={disabled} required />

              <Input type="text" id="search_pattern" name="search_pattern" labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9" placeholder="搜索模式" label="用户搜索模式"
                     value={this.state.ldapSettings.search_pattern} help={help.SEARCH_PATTERN}
                     onChange={this._bindValue} disabled={disabled} required />

              <Input type="text" id="display_name_attribute" name="display_name_attribute" labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9" placeholder="显示名称属性" label="显示名称属性"
                     value={this.state.ldapSettings.display_name_attribute} help={help.DISPLAY_NAME}
                     onChange={this._bindValue} disabled={disabled} required />
            </fieldset>

            <fieldset>
              <Row className="row-sm">
                <Col sm={12}>
                  <legend>4. 群映射 <small>(可选的)</small></legend>
                </Col>
              </Row>
              <Input type="text" id="group_search_base" name="group_search_base" labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9" placeholder="群搜索基线" label="群搜索基线DN"
                     value={this.state.ldapSettings.group_search_base} help={help.GROUP_SEARCH_BASE}
                     onChange={this._bindValue} disabled={disabled} />

              <Input type="text" id="group_search_pattern" name="group_search_pattern" labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9" placeholder="群搜索模式" label="群搜索模式"
                     value={this.state.ldapSettings.group_search_pattern} help={help.GROUP_PATTERN}
                     onChange={this._bindValue} disabled={disabled} />

              <Input type="text" id="group_id_attribute" name="group_id_attribute" labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9" placeholder="群ID属性" label="群名称属性"
                     value={this.state.ldapSettings.group_id_attribute} help={help.GROUP_ID}
                     onChange={this._bindValue} disabled={disabled} />

              <Input id="default_group" labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9" label="默认用户角色"
                     help={help.defaultGroup(this._onShowGroups)}>
                <Row>
                  <Col sm={4}>
                    <select id="default_group" name="default_group" className="form-control" required
                            value={this.state.ldapSettings.default_group.toLowerCase()} disabled={disabled}
                            onChange={ev => this._setSetting('default_group', ev.target.value)}>

                      <option value="reader">读者 - 基本访问</option>
                      <option value="admin">管理员 - 完全访问</option>
                    </select>
                  </Col>
                </Row>
              </Input>

              <Row>
                <Col sm={9} smOffset={3}>
                  <Panel bsStyle="info">
                    更改静态角色分配只会影响通过LDAP / Active Directory创建的新用户!<br />
                    现有的用户帐户将在其下次登录时更新，或者手动编辑其角色。
                  </Panel>
                </Col>
              </Row>

              <Input id="additional_default_groups" labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9" label="默认额外的角色"
                     help={help.ADDITIONAL_GROUPS}>
                <MultiSelect
                  ref="select"
                  options={rolesOptions}
                  disabled={disabled}
                  value={this.state.ldapSettings.additional_default_groups}
                  onChange={roles => this._setAdditionalDefaultGroups(roles)}
                  placeholder="选择额外的角色..."
                />
              </Input>

              <Row>
                <Col sm={9} smOffset={3}>
                  <Panel bsStyle="info">
                    更改静态角色分配只会影响通过LDAP / Active Directory创建的新用户!<br />
                    现有的用户帐户将在其下次登录时更新，或者手动编辑其角色。
                  </Panel>
                </Col>
              </Row>
            </fieldset>

            <fieldset>
              <Row className="row-sm">
                <Col sm={12}>
                  <legend>5. 登录测试</legend>
                </Col>
              </Row>
              <TestLdapLogin ldapSettings={this.state.ldapSettings} disabled={disabled} />
            </fieldset>

            <fieldset>
              <Row className="row-sm">
                <Col sm={12}>
                  <legend>6. 存储设置</legend>
                </Col>
              </Row>
              <div className="form-group">
                <Col sm={9} smOffset={3}>
                  <Button type="submit" bsStyle="primary" className="save-button-margin">保存LDAP设置</Button>
                  <Button onClick={this.props.onCancel}>取消</Button>
                </Col>
              </div>
            </fieldset>
          </form>
        </Col>
      </Row>
    );
  },
});

export default LdapComponent;
