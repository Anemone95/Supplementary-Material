import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import { Button, Row, Col, Alert, Panel } from 'react-bootstrap';
import Routes from 'routing/Routes';

import { Input } from 'components/bootstrap';
import PermissionsMixin from 'util/PermissionsMixin';
import UserNotification from 'util/UserNotification';
import ValidationsUtils from 'util/ValidationsUtils';
import FormsUtils from 'util/FormsUtils';
import ObjectUtils from 'util/ObjectUtils';

import CombinedProvider from 'injection/CombinedProvider';
import StoreProvider from 'injection/StoreProvider';

const StreamsStore = StoreProvider.getStore('Streams');
const { DashboardsStore } = CombinedProvider.get('Dashboards');
const CurrentUserStore = StoreProvider.getStore('CurrentUser');
const UsersStore = StoreProvider.getStore('Users');

import TimeoutInput from 'components/users/TimeoutInput';
import EditRolesForm from 'components/users/EditRolesForm';
import { IfPermitted, MultiSelect, TimezoneSelect, Spinner } from 'components/common';

const UserForm = React.createClass({
  propTypes: {
    user: PropTypes.object.isRequired,
    history: PropTypes.object,
  },
  mixins: [PermissionsMixin, Reflux.connect(CurrentUserStore), Reflux.connect(DashboardsStore)],
  getInitialState() {
    return {
      streams: undefined,
      user: this._getUserStateFromProps(this.props),
    };
  },
  componentDidMount() {
    StreamsStore.listStreams().then((streams) => {
      this.setState({
        streams: streams.sort((s1, s2) => s1.title.localeCompare(s2.title)),
      });
    });
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.user.username !== nextProps.user.username) {
      this.setState({
        user: this._getUserStateFromProps(nextProps),
      });
    }
  },

  _getUserStateFromProps(props) {
    return {
      full_name: props.user.full_name,
      email: props.user.email,
      session_timeout_ms: props.user.session_timeout_ms,
      timezone: props.user.timezone,
      permissions: props.user.permissions,
      read_only: props.user.read_only,
      external: props.user.external,
      roles: props.user.roles,
    };
  },

  formatMultiselectOptions(collection) {
    return collection.map((item) => {
      return { value: item.id, label: item.title };
    });
  },
  formatSelectedOptions(permissions, permission, collection) {
    return collection
      .filter(item => this.isPermitted(permissions, [`${permission}:${item.id}`]))
      .map(item => item.id)
      .join(',');
  },
  _onPasswordChange() {
    const passwordField = this.refs.password.getInputDOMNode();
    const passwordConfirmField = this.refs.password_repeat.getInputDOMNode();

    if (passwordField.value !== '' && passwordConfirmField.value !== '') {
      ValidationsUtils.setFieldValidity(passwordConfirmField, passwordField.value !== passwordConfirmField.value, 'Passwords do not match');
    }
  },

  _changePassword(evt) {
    evt.preventDefault();
    const request = {};

    if (this.refs.old_password) {
      request.old_password = this.refs.old_password.getValue();
    }
    request.password = this.refs.password.getValue();

    UsersStore.changePassword(this.props.user.username, request).then(() => {
      UserNotification.success('密码已成功修改。', '成功');
      if (this.isPermitted(this.state.currentUser.permissions, ['users:list'])) {
        this.props.history.replaceState(null, Routes.SYSTEM.AUTHENTICATION.USERS.LIST);
      }
    }, () => {
      UserNotification.error('无法修改密码。请验证您的当前密码是否正确。', '修改密码失败');
    });
  },

  _updateUser(evt) {
    evt.preventDefault();

    UsersStore.update(this.props.user.username, this.state.user).then(() => {
      UserNotification.success('用户已成功更新。', '成功');
      if (this.isPermitted(this.state.currentUser.permissions, ['users:list'])) {
        this.props.history.replaceState(null, Routes.SYSTEM.AUTHENTICATION.USERS.LIST);
      }
      if (this.props.user.username === this.state.currentUser.username) {
        CurrentUserStore.reload();
      }
    }, () => {
      UserNotification.error('无法更新用户。请检查日志以获取更多信息。', '更新用户失败');
    });
  },

  _updateField(name, value) {
    const updatedUser = ObjectUtils.clone(this.state.user);
    updatedUser[name] = value;
    this.setState({ user: updatedUser });
  },

  _bindValue(event) {
    this._updateField(event.target.name, FormsUtils.getValueFromInput(event.target));
  },

  _onFieldChange(name) {
    return (value) => {
      this._updateField(name, value);
    };
  },

  _onPermissionsChange(entity, permission) {
    return (entityIds) => {
      const userPermissions = this.state.user.permissions.slice();
      let newUserPermissions = userPermissions.filter(p => p.indexOf(`${entity}:${permission}`) !== 0);

      const updatedPermissions = entityIds === '' ? [] : entityIds.split(',').map(id => `${entity}:${permission}:${id}`);
      const previousPermissions = userPermissions.filter(p => p.indexOf(`${entity}:${permission}`) === 0);

      // Remove edit permissions to entities without read permissions
      if (permission === 'read') {
        previousPermissions.forEach((previousPermission) => {
          // Do nothing if permission is still there
          if (updatedPermissions.some(p => p === previousPermission)) {
            return;
          }

          // Remove edit permission
          const entityId = previousPermission.split(':').pop();
          newUserPermissions = newUserPermissions.filter(p => p !== `${entity}:edit:${entityId}`);
        });
      }

      // Grant read permissions to entities with edit permissions
      if (permission === 'edit') {
        updatedPermissions.forEach((updatePermission) => {
          // Do nothing if permission was there before
          if (previousPermissions.some(p => p === updatePermission)) {
            return;
          }

          // Grant read permission
          const entityId = updatePermission.split(':').pop();
          newUserPermissions.push(`${entity}:read:${entityId}`);
        });
      }

      this._updateField('permissions', newUserPermissions.concat(updatedPermissions));
    };
  },

  _onCancel() {
    this.props.history.goBack();
  },

  render() {
    if (!this.state.streams || !this.state.dashboards) {
      return <Spinner />;
    }

    const user = this.state.user;
    const permissions = this.state.currentUser.permissions;
    const dashboards = this.state.dashboards.toArray().sort((d1, d2) => d1.title.localeCompare(d2.title));

    let requiresOldPassword = true;
    if (this.isPermitted(permissions, 'users:passwordchange:*')) {
      // Ask for old password if user is editing their own account
      requiresOldPassword = this.props.user.username === this.state.currentUser.username;
    }

    const streamReadOptions = this.formatSelectedOptions(this.state.user.permissions, 'streams:read', this.state.streams);
    const streamEditOptions = this.formatSelectedOptions(this.state.user.permissions, 'streams:edit', this.state.streams);

    const dashboardReadOptions = this.formatSelectedOptions(this.state.user.permissions, 'dashboards:read', dashboards);
    const dashboardEditOptions = this.formatSelectedOptions(this.state.user.permissions, 'dashboards:edit', dashboards);

    return (
      <div>
        <Row>
          <Col lg={8}>
            <h2>用户信息</h2>
            <form className="form-horizontal user-form" id="edit-user-form" onSubmit={this._updateUser}>
              {user.read_only &&
                <span>
                  <Col smOffset={3} sm={9}>
                    <Alert bsStyle="warning" role="alert">
                      管理员用户只能在Graylog服务器配置文件中进行修改。
                    </Alert>
                  </Col>
                  <div className="clearfix" />
                  <br />
                </span>
              }
              <fieldset disabled={user.read_only}>
                <Input name="full_name" id="full_name" type="text" maxLength={200} value={user.full_name}
                       onChange={this._bindValue} labelClassName="col-sm-3" wrapperClassName="col-sm-9"
                       label="全名" help="为此帐户提供一个描述性名称，例如 the full name."
                       required />

                <Input ref="email" name="email" id="email" type="email" maxLength={254} value={user.email}
                       onChange={this._bindValue} labelClassName="col-sm-3" wrapperClassName="col-sm-9"
                       label="电子邮件" help="给联系人的电子邮件地址。" required />

                <IfPermitted permissions="users:edit">
                  <span>
                    <div className="form-group">
                      <Col sm={9} smOffset={3}>
                        <Panel bsStyle="danger" header="设置个人权限已被弃用，请考虑迁移到角色。">
                          此处列出的权限是将所有授予的权限的组合，
                          包括您可以在此页面的底部编辑的分配给用户的这些角色所有授予的权限相结合的结果，以及之前分配给用户的遗留的、单独的权限。
                        </Panel>
                      </Col>
                      <label className="col-sm-3 control-label" htmlFor="streampermissions">流权限</label>
                      <Col sm={9}>
                        <MultiSelect ref="streamReadOptions" placeholder="选择流读取权限..."
                                     options={this.formatMultiselectOptions(this.state.streams)}
                                     value={streamReadOptions}
                                     onChange={this._onPermissionsChange('streams', 'read')} />
                        <span className="help-block">选择用户可以<strong>查看</strong>
                          的流。 删除读访问权限也将删除编辑访问权限。</span>
                        <MultiSelect ref="streamEditOptions" placeholder="选择流编辑权限..."
                                     options={this.formatMultiselectOptions(this.state.streams)}
                                     value={streamEditOptions}
                                     onChange={this._onPermissionsChange('streams', 'edit')} />
                        <span className="help-block">选择用户可以<strong>编辑</strong>
                          的流。 在这里选择的值也将启用读访问权限。</span>
                      </Col>
                    </div>
                    <div className="form-group">
                      <label className="col-sm-3 control-label" htmlFor="dashboardpermissions">仪表板权限</label>
                      <Col sm={9}>
                        <MultiSelect ref="dashboardReadOptions" placeholder="选择仪表板读取权限..."
                                     options={this.formatMultiselectOptions(dashboards)}
                                     value={dashboardReadOptions}
                                     onChange={this._onPermissionsChange('dashboards', 'read')} />
                        <span className="help-block">选择用户可以<strong>查看</strong>
                          的仪表板。 删除读访问权限也将删除编辑访问权限。</span>
                        <MultiSelect ref="dashboardEditOptions" placeholder="选择仪表板编辑权限..."
                                     options={this.formatMultiselectOptions(dashboards)}
                                     value={dashboardEditOptions}
                                     onChange={this._onPermissionsChange('dashboards', 'edit')} />
                        <span className="help-block">选择用户可以<strong>编辑</strong>
                          的仪表板。 在这里选择的值也将启用读访问权限。</span>
                      </Col>
                    </div>
                  </span>
                </IfPermitted>
                <IfPermitted permissions="*">
                  <TimeoutInput ref="session_timeout_ms" value={user.session_timeout_ms} labelSize={3} controlSize={9}
                                onChange={this._onFieldChange('session_timeout_ms')} />
                </IfPermitted>

                <Input label="时区"
                       help="选择您的本地时区，或者保留原来的系统默认值。"
                       labelClassName="col-sm-3" wrapperClassName="col-sm-9">
                  <TimezoneSelect ref="timezone" className="timezone-select" value={user.timezone}
                                  onChange={this._onFieldChange('timezone')} />
                </Input>

                <div className="form-group">
                  <Col smOffset={3} sm={9}>
                    <Button type="submit" bsStyle="primary" className="create-user save-button-margin">
                      更新用户
                    </Button>
                    <Button onClick={this._onCancel}>取消</Button>
                  </Col>
                </div>
              </fieldset>
            </form>
          </Col>
        </Row>
        <Row>
          <Col lg={8}>
            <h2>修改密码</h2>
            {user.read_only ?
              <Col smOffset={3} sm={9}>
                <Alert bsStyle="warning" role="alert">
                  请编辑Graylog服务器配置文件以更改管理员密码。
              </Alert>
              </Col>
            :
              user.external ?
                <Col smOffset={3} sm={9}>
                  <Alert bsStyle="warning" role="alert">
                    此用户是从外部系统创建的，您无法在此更改密码。
                    请联系管理员以获取更多信息。
                </Alert>
                </Col>
              :
                <form className="form-horizontal" style={{ marginTop: 10 }} onSubmit={this._changePassword}>
                  {requiresOldPassword &&
                  <Input ref="old_password" name="old_password" id="old_password" type="password" maxLength={100}
                         labelClassName="col-sm-3" wrapperClassName="col-sm-9"
                         label="原密码" required />
                }
                  <Input ref="password" name="password" id="password" type="password" maxLength={100}
                       labelClassName="col-sm-3" wrapperClassName="col-sm-9"
                       label="新密码" required minLength="6"
                       help="密码必须至少有6个字符。我们建议使用强密码。"
                       onChange={this._onPasswordChange} />

                  <Input ref="password_repeat" name="password_repeat" id="password_repeat" type="password" maxLength={100}
                       labelClassName="col-sm-3" wrapperClassName="col-sm-9"
                       label="重复输入密码" required minLength="6" onChange={this._onPasswordChange} />

                  <div className="form-group">
                    <Col smOffset={3} sm={9}>
                      <Button bsStyle="primary" type="submit" className="save-button-margin">
                        修改密码
                    </Button>
                      <Button onClick={this._onCancel}>取消</Button>
                    </Col>
                  </div>
                </form>
            }
          </Col>
        </Row>
        <IfPermitted permissions="users:rolesedit">
          <EditRolesForm user={this.props.user} history={this.props.history} />
        </IfPermitted>
      </div>
    );
  },
});

export default UserForm;
