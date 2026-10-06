import PropTypes from 'prop-types';
import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Button, OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';

import PermissionsMixin from 'util/PermissionsMixin';
import Routes from 'routing/Routes';

import StoreProvider from 'injection/StoreProvider';
const UsersStore = StoreProvider.getStore('Users');
const RolesStore = StoreProvider.getStore('Roles');

import { DataTable, Spinner, Timestamp } from 'components/common';

import UserListStyle from '!style!css!./UserList.css';

const UserList = React.createClass({
  propTypes: {
    currentUsername: PropTypes.string.isRequired,
    currentUser: PropTypes.object.isRequired,
  },

  mixins: [PermissionsMixin],

  getInitialState() {
    return {
      users: undefined,
      roles: undefined,
    };
  },
  componentDidMount() {
    this.loadUsers();
    RolesStore.loadRoles().done((roles) => {
      this.setState({ roles: roles.map(role => role.name) });
    });
  },

  loadUsers() {
    const promise = UsersStore.loadUsers();
    promise.done((users) => {
      this.setState({
        users: users,
      });
    });
  },
  _hasAdminRole(user) {
    return this.isPermitted(user.permissions, ['*']);
  },
  deleteUser(username) {
    const promise = UsersStore.deleteUser(username);

    promise.done(() => {
      this.loadUsers();
    });
  },
  _deleteUserFunction(username) {
    return () => {
      if (window.confirm(`您真的想要删除用户${username}吗?`)) {
        this.deleteUser(username);
      }
    };
  },
  _headerCellFormatter(header) {
    let formattedHeaderCell;

    switch (header.toLocaleLowerCase()) {
      case '':
        formattedHeaderCell = <th className="user-type">{header}</th>;
        break;
      case 'client address': {
        const popover = (<Popover id="decorators-help" className={UserListStyle.sessionBadgeDetails}>
          <p className="description">
            客户端用于初始建立会话的地址，不一定是其当前地址。
          </p>
        </Popover>);

        formattedHeaderCell = (<th>
          {header}
          <OverlayTrigger trigger="click" rootClose placement="top" overlay={popover}>
            <Button bsStyle="link" className={UserListStyle.helpHeaderRow}><i className="fa fa-fw fa-question-circle" /></Button>
          </OverlayTrigger>
        </th>);
        break;
      }
      case 'actions':
        formattedHeaderCell = <th className="actions">{header}</th>;
        break;
      default:
        formattedHeaderCell = <th>{header}</th>;
    }

    return formattedHeaderCell;
  },
  _userInfoFormatter(user) {
    const rowClass = user.username === this.props.currentUsername ? 'active' : null;
    let userBadge = null;
    if (user.session_active) {
      const popover = (
        <Popover id="session-badge-details" title="登录" className={UserListStyle.sessionBadgeDetails}>
          <div>最后一次活动: <Timestamp dateTime={user.last_activity} relative /></div>
          <div>客户端地址: {user.client_address}</div>
        </Popover>
      );
      userBadge = (<OverlayTrigger trigger={['hover', 'focus']} placement="left" overlay={popover} rootClose>
        <i className={`fa fa-circle ${UserListStyle.activeSession}`} />
      </OverlayTrigger>);
    }

    const roleBadges = user.roles.map(role => <span key={role} className={`${UserListStyle.roleBadgeFixes} label label-${role === 'Admin' ? 'info' : 'default'}`}>{role}</span>);

    let actions = null;
    if (user.read_only) {
      const tooltip = <Tooltip id="system-user">系统用户只能在Graylog配置文件中修改。</Tooltip>;
      actions = (
        <OverlayTrigger placement="left" overlay={tooltip}>
          <span className={UserListStyle.help}>
            <Button bsSize="xs" bsStyle="info" disabled>系统用户</Button>
          </span>
        </OverlayTrigger>
      );
    } else {
      const deleteAction = (
        <Button id={`delete-user-${user.username}`} bsStyle="primary" bsSize="xs" title="删除用户"
                onClick={this._deleteUserFunction(user.username)}>
          删除
        </Button>
      );

      const editAction = (
        <LinkContainer to={Routes.SYSTEM.AUTHENTICATION.USERS.edit(encodeURIComponent(user.username))}>
          <Button id={`edit-user-${user.username}`} bsStyle="info" bsSize="xs" title={`编辑用户${user.username}`}>
            编辑
          </Button>
        </LinkContainer>
      );

      actions = (
        <div>
          {this.isPermitted(this.props.currentUser.permissions, ['users:edit']) ? deleteAction : null}
          &nbsp;
          {this.isPermitted(this.props.currentUser.permissions, [`users:edit:${user.username}`]) ? editAction : null}
        </div>
      );
    }

    return (
      <tr key={user.username} className={rowClass}>
        <td className="centered">{userBadge}</td>
        <td className="limited">{user.full_name}</td>
        <td className="limited">{user.username}</td>
        <td className="limited">{user.email}</td>
        <td className="limited">{user.client_address}</td>
        <td className={UserListStyle.limitedWide}>{roleBadges}</td>
        <td>{actions}</td>
      </tr>
    );
  },
  render() {
    const filterKeys = ['username', 'full_name', 'email', 'client_address'];
    const headers = ['', '名称', '用户名', '电子邮箱', '客户端地址', '角色', '操作'];

    if (this.state.users && this.state.roles) {
      return (
        <div>
          <DataTable id="user-list"
                     className="table-hover"
                     headers={headers}
                     headerCellFormatter={this._headerCellFormatter}
                     sortByKey={'full_name'}
                     rows={this.state.users}
                     filterBy="role"
                     filterSuggestions={this.state.roles}
                     dataRowFormatter={this._userInfoFormatter}
                     filterLabel="过滤用户"
                     filterKeys={filterKeys} />
        </div>
      );
    }

    return <Spinner />;
  },
});

export default UserList;
