import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Routes from 'routing/Routes';

import UserNotification from 'util/UserNotification';

import StoreProvider from 'injection/StoreProvider';
const RolesStore = StoreProvider.getStore('Roles');
const UsersStore = StoreProvider.getStore('Users');

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import NewUserForm from 'components/users/NewUserForm';

const CreateUsersPage = React.createClass({

  propTypes: {
    history: PropTypes.object,
  },

  getInitialState() {
    return {
      roles: undefined,
    };
  },

  componentDidMount() {
    RolesStore.loadRoles().then((roles) => {
      this.setState({ roles: roles });
    });
  },

  _onSubmit(r) {
    const request = r;
    request.permissions = [];
    delete request['session-timeout-never'];
    UsersStore.create(request).then(() => {
      UserNotification.success(`用户${request.username}创建成功。`, '成功!');
      this.props.history.replaceState(null, Routes.SYSTEM.AUTHENTICATION.USERS.LIST);
    }, () => {
      UserNotification.error('创建用户失败!', '失败!');
    });
  },

  _onCancel() {
    this.props.history.pushState(null, Routes.SYSTEM.AUTHENTICATION.USERS.LIST);
  },

  render() {
    if (!this.state.roles) {
      return <Spinner />;
    }
    return (
      <DocumentTitle title="创建新的用户">
        <span>
          <PageHeader title="创建新的用户" subpage>
            <span>
              使用此页面创建新的Graylog用户。这里创建的用户及其权限不仅限于Web界面，也适用于和被要求Graylog服务器节点的REST API。
            </span>
          </PageHeader>
          <Row>
            <Col lg={8}>
              <NewUserForm roles={this.state.roles} onSubmit={this._onSubmit} onCancel={this._onCancel} />
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  },
});

export default CreateUsersPage;
