import React from 'react';
import Reflux from 'reflux';
import { Row, Button, FormGroup, Alert } from 'react-bootstrap';
import { DocumentTitle } from 'components/common';

import { Input } from 'components/bootstrap';
import LoadingPage from './LoadingPage';

import StoreProvider from 'injection/StoreProvider';
const SessionStore = StoreProvider.getStore('Session');
import ActionsProvider from 'injection/ActionsProvider';
const SessionActions = ActionsProvider.getActions('Session');

import disconnectedStyle from '!style/useable!css!less!stylesheets/disconnected.less';
import authStyle from '!style/useable!css!less!stylesheets/auth.less';

const LoginPage = React.createClass({
  mixins: [Reflux.connect(SessionStore), Reflux.ListenerMethods],

  getInitialState() {
    return {
      loading: false,
    };
  },

  componentDidMount() {
    disconnectedStyle.use();
    authStyle.use();
    SessionActions.validate();
  },
  componentWillUnmount() {
    disconnectedStyle.unuse();
    authStyle.unuse();
  },

  onSignInClicked(event) {
    event.preventDefault();
    this.resetLastError();
    this.setState({ loading: true });
    const username = this.refs.username.getValue();
    const password = this.refs.password.getValue();
    const location = document.location.host;
    const promise = SessionActions.login.triggerPromise(username, password, location);
    promise.catch((error) => {
      if (error.additional.status === 401) {
        this.setState({ lastError: '无效的凭证，请验证它们并重试。' });
      } else {
        this.setState({ lastError: `错误 - 服务器返回: ${error.additional.status} - ${error.message}` });
      }
    });
    promise.finally(() => {
      if (this.isMounted()) {
        this.setState({ loading: false });
      }
    });
  },
  formatLastError(error) {
    if (error) {
      return (
        <div className="form-group">
          <Alert bsStyle="danger">
            <a className="close" onClick={this.resetLastError}>×</a>{error}
          </Alert>
        </div>
      );
    }
    return null;
  },
  resetLastError() {
    this.setState({ lastError: undefined });
  },
  render() {
    if (this.state.validatingSession) {
      return (
        <LoadingPage />
      );
    }

    const alert = this.formatLastError(this.state.lastError);
    return (
      <DocumentTitle title="登录">
        <div>
          <div className="container" id="login-box">
            <Row>
              <form className="col-md-4 col-md-offset-4 well" id="login-box-content" onSubmit={this.onSignInClicked}>
                <legend><i className="fa fa-group" /> 欢迎来到Graylog</legend>

                {alert}

                <Input ref="username" type="text" placeholder="用户名" autoFocus />

                <Input ref="password" type="password" placeholder="密码" />

                <FormGroup>
                  <Button type="submit" bsStyle="info" disabled={this.state.loading}>
                    {this.state.loading ? '正在登录...' : '登录'}
                  </Button>
                </FormGroup>

              </form>
            </Row>
          </div>
        </div>
      </DocumentTitle>
    );
  },
});

export default LoginPage;

