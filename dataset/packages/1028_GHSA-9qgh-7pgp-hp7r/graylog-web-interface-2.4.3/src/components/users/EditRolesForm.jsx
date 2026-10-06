import PropTypes from 'prop-types';
import React from 'react';
import { Alert, Col, Button, Row } from 'react-bootstrap';
import Routes from 'routing/Routes';

import { Input } from 'components/bootstrap';
import UserNotification from 'util/UserNotification';
import ObjectUtils from 'util/ObjectUtils';

import StoreProvider from 'injection/StoreProvider';
const RolesStore = StoreProvider.getStore('Roles');
const UsersStore = StoreProvider.getStore('Users');

import RolesSelect from 'components/users/RolesSelect';
import { Spinner } from 'components/common';

import EditRolesFormStyle from '!style!css!./EditRolesForm.css';

const EditRolesForm = React.createClass({
  propTypes: {
    user: PropTypes.object.isRequired,
    history: PropTypes.object,
  },
  getInitialState() {
    return {
      newRoles: null,
    };
  },
  componentDidMount() {
    RolesStore.loadRoles().then((roles) => {
      this.setState({ roles: roles.sort((r1, r2) => r1.name.localeCompare(r2.name)) });
    });
  },
  _updateRoles(evt) {
    evt.preventDefault();
    if (confirm(`确定更新角色"${this.props.user.username}"吗?`)) {
      const roles = this.refs.roles.getValue().filter(value => value !== '');
      const user = ObjectUtils.clone(this.props.user);
      user.roles = roles;
      UsersStore.update(this.props.user.username, user).then(() => {
        UserNotification.success('角色更新成功。', '成功!');
        this.props.history.replaceState(null, Routes.SYSTEM.AUTHENTICATION.USERS.LIST);
      }, () => {
        UserNotification.error('更新角色失败。', '错误!');
      });
    }
  },
  _onCancel() {
    this.props.history.pushState(null, Routes.SYSTEM.AUTHENTICATION.USERS.LIST);
  },
  _onValueChange(newRoles) {
    const roles = newRoles.split(',');
    this.setState({ newRoles: roles });
  },
  render() {
    const user = this.props.user;
    if (!this.state.roles) {
      return <Spinner />;
    }
    let rolesAlert = null;
    const roles = this.state.newRoles;
    if (roles != null && !(roles.includes('Reader') || roles.includes('Admin'))) {
      rolesAlert = (<Alert bsStyle="danger" role="alert" className={EditRolesFormStyle.rolesMissingAlert}>
        您需要至少选择一个 <em>阅读者</em> 或 <em>管理员</em> 角色。
      </Alert>);
    }
    const externalUser = user.external ?
      (
        <Col smOffset={3} sm={9} style={{ marginBottom: 15 }}>
          <Alert bsStyle="warning" role="alert">
            此用户是从外部LDAP系统创建的，请考虑映射LDAP群而不是手动编辑角色。
            请更新LDAP群映射进行更改或联系管理员以获取更多信息。
          </Alert>
        </Col>
      ) : null;
    const editUserForm = user.read_only ? (
      <Col smOffset={3} sm={9}>
        <Alert bsStyle="warning" role="alert">
          您无法编辑管理员的用户角色。
        </Alert>
      </Col>
    ) : (
      <span>
        {externalUser}
        <form className="form-horizontal" style={{ marginTop: '10px' }} onSubmit={this._updateRoles}>
          <Input label="角色" help="选择用户应该成为的角色。所有授予的权限将被合并。"
                 labelClassName="col-sm-3" wrapperClassName="col-sm-9">
            <RolesSelect ref="roles" userRoles={user.roles} availableRoles={this.state.roles} onValueChange={this._onValueChange} />
          </Input>
          <div className="form-group">
            <Col smOffset={3} sm={9}>
              {rolesAlert}
              <Button bsStyle="primary" type="submit" className="save-button-margin" disabled={!!rolesAlert}>
                更新角色
              </Button>
              <Button onClick={this._onCancel}>取消</Button>
            </Col>
          </div>
        </form>
      </span>
    );
    return (
      <Row>
        <Col md={8}>
          <h2>更改用户角色</h2>
          {editUserForm}
        </Col>
      </Row>
    );
  },
});

export default EditRolesForm;
