import PropTypes from 'prop-types';
import React from 'react';
import { Alert, Row, Col, Button } from 'react-bootstrap';

import { Input } from 'components/bootstrap';
import RolesSelect from 'components/users/RolesSelect';
import TimeoutInput from 'components/users/TimeoutInput';
import { TimezoneSelect } from 'components/common';

import StoreProvider from 'injection/StoreProvider';
const UsersStore = StoreProvider.getStore('Users');

import ValidationsUtils from 'util/ValidationsUtils';

const NewUserForm = React.createClass({
  propTypes: {
    roles: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      users: [],
      newRoles: null,
    };
  },

  componentDidMount() {
    UsersStore.loadUsers().then((users) => {
      this.setState({ users });
    });
  },

  _onUsernameChange(event) {
    const usernameField = this.refs.username.getInputDOMNode();
    const usernameExists = this.state.users.some(user => user.username === event.target.value);

    ValidationsUtils.setFieldValidity(usernameField, usernameExists, '用户名已存在');
  },

  _onPasswordChange() {
    const passwordField = this.refs.password;
    const passwordConfirmField = this.refs.password_repeat;

    if (passwordField.value !== '' && passwordConfirmField.value !== '') {
      ValidationsUtils.setFieldValidity(passwordConfirmField, passwordField.value !== passwordConfirmField.value, '密码不匹配');
    }
  },

  _onSubmit(evt) {
    evt.preventDefault();
    const result = {};
    Object.keys(this.refs).forEach((ref) => {
      if (ref !== 'password_repeat') {
        result[ref] = (this.refs[ref].getValue ? this.refs[ref].getValue() : this.refs[ref].value);
      }
    });

    this.props.onSubmit(result);
  },

  _onValueChange(newRoles) {
    const roles = newRoles.split(',');
    this.setState({ newRoles: roles });
  },

  render() {
    const rolesHelp = (
      <span className="help-block">
        将相关角色分配给该用户，授予他们对相关流和仪表板的访问权限。<br />
        <em>读者</em>角色被授予对系统的基本访问权限并将被启用。<br />
        <em>管理员</em>角色被授予访问Graylog中的所有内容的权限。
      </span>
    );
    const roles = this.state.newRoles;
    let rolesAlert = null;
    if (roles != null && !(roles.includes('Reader') || roles.includes('Admin'))) {
      rolesAlert = (<Alert bsStyle="danger" role="alert">
        您需要至少选择一个 <em>读者</em> 或 <em>管理员</em> 角色。
      </Alert>);
    }
    return (
      <form id="create-user-form" className="form-horizontal" onSubmit={this._onSubmit}>
        <Input ref="username" name="username" id="username" type="text" maxLength={100}
               labelClassName="col-sm-2" wrapperClassName="col-sm-10"
               label="用户名" help="选择用于登录的唯一用户名。" required
               onChange={this._onUsernameChange} autoFocus />

        <Input ref="full_name" name="fullname" id="fullname" type="text" maxLength={200}
               labelClassName="col-sm-2" wrapperClassName="col-sm-10"
               label="全名" help="为此帐户提供一个描述性名称，例如 the full name." required />

        <Input ref="email" name="email" id="email" type="email" maxLength={254}
               labelClassName="col-sm-2" wrapperClassName="col-sm-10"
               label="电子邮件" help="给联系人的电子邮件地址。" required />

        <Input label="密码"
               help="密码必须至少有6个字符。我们建议使用强密码。"
               labelClassName="col-sm-2" wrapperClassName="col-sm-10">
          <Row>
            <Col sm={6}>
              <input className="form-control" ref="password" name="password" id="password" type="password"
                     placeholder="密码" required minLength="6" onChange={this._onPasswordChange} />
            </Col>
            <Col sm={6}>
              <input className="form-control" ref="password_repeat" id="password-repeat" type="password"
                     placeholder="重复输入密码" required minLength="6" onChange={this._onPasswordChange} />
            </Col>
          </Row>
        </Input>

        <Input label="角色" help={rolesHelp}
               labelClassName="col-sm-2" wrapperClassName="col-sm-10">
          <RolesSelect ref="roles" availableRoles={this.props.roles} userRoles={['Reader']}
                       className="form-control" onValueChange={this._onValueChange} />
          {rolesAlert}
        </Input>

        <TimeoutInput ref="session_timeout_ms" />

        <Input label="时区" help="选择用来显示时间的时区，或保留使用系统默认值的时区。"
               labelClassName="col-sm-2" wrapperClassName="col-sm-10">
          <TimezoneSelect ref="timezone" className="timezone-select" />
        </Input>

        <div className="form-group">
          <Col smOffset={2} sm={10}>
            <Button type="submit" bsStyle="primary" className="create-user save-button-margin" disabled={!!rolesAlert}>
              创建用户
            </Button>
            <Button onClick={this.props.onCancel}>取消</Button>
          </Col>
        </div>
      </form>
    );
  },
});

export default NewUserForm;
