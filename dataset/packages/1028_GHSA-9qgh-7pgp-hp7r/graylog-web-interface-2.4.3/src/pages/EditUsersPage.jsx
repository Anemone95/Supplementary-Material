import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';

import StoreProvider from 'injection/StoreProvider';
const UsersStore = StoreProvider.getStore('Users');
const StartpageStore = StoreProvider.getStore('Startpage');

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import UserForm from 'components/users/UserForm';

import UserPreferencesButton from 'components/users/UserPreferencesButton';

const EditUsersPage = React.createClass({
  propTypes: {
    params: PropTypes.object.isRequired,
    history: PropTypes.object,
  },
  getInitialState() {
    return {
      user: undefined,
    };
  },
  componentDidMount() {
    this._loadUser(this.props.params.username);
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.params.username !== nextProps.params.username) {
      this._loadUser(nextProps.params.username);
    }
  },

  _loadUser(username) {
    UsersStore.load(username).then((user) => {
      this.setState({ user: user });
    });
  },
  _resetStartpage() {
    if (window.confirm('你确定要重设起始页吗?')) {
      const username = this.props.params.username;
      StartpageStore.set(username).then(() => this._loadUser(username));
    }
  },
  render() {
    if (!this.state.user) {
      return <Spinner />;
    }

    const user = this.state.user;
    let resetStartpageButton;
    if (!user.read_only && user.startpage !== null && Object.keys(user.startpage).length > 0) {
      resetStartpageButton = <Button bsStyle="info" onClick={this._resetStartpage}>重置自定义起始页</Button>;
    }

    const userPreferencesButton = !user.read_only ?
      (<span id="react-user-preferences-button" data-user-name={this.props.params.username}>
        <UserPreferencesButton userName={user.username} />
      </span>)
      : null;

    return (
      <DocumentTitle title={`编辑用户${this.props.params.username}`}>
        <span>
          <PageHeader title={<span>编辑用户<em>{this.props.params.username}</em></span>} subpage>
            <span>您可以在此更改用户的详细信息或设置新密码。</span>
            {null}
            <div>
              {resetStartpageButton}{' '}
              {userPreferencesButton}
            </div>
          </PageHeader>

          <UserForm user={this.state.user} history={this.props.history} />
        </span>
      </DocumentTitle>
    );
  },
});

export default EditUsersPage;
