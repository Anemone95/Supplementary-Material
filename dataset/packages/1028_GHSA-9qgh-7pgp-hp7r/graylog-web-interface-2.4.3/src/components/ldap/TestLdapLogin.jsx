import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col, Button, Panel } from 'react-bootstrap';

import { Input } from 'components/bootstrap';
import ObjectUtils from 'util/ObjectUtils';

import ActionsProvider from 'injection/ActionsProvider';
const LdapActions = ActionsProvider.getActions('Ldap');

const TestLdapLogin = React.createClass({
  propTypes: {
    ldapSettings: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
  },

  getInitialState() {
    return {
      loginUser: '',
      loginPassword: '',
      loginStatus: {},
    };
  },

  componentDidMount() {
    this.style.use();
  },

  componentWillReceiveProps(nextProps) {
    // Reset login status if ldapSettings changed
    if (JSON.stringify(this.props.ldapSettings) !== JSON.stringify(nextProps.ldapSettings)) {
      this.setState({ loginStatus: {} });
    }
  },

  componentWillUnmount() {
    this.style.unuse();
  },

  style: require('!style/useable!css!./TestLdapLogin.css'),

  _changeLoginForm(event) {
    const newState = {};
    const key = (event.target.name === 'test_login_username' ? 'loginUser' : 'loginPassword');
    newState[key] = event.target.value;
    newState.loginStatus = {};
    this.setState(newState);
  },

  _disableSubmitOnEnter(event) {
    if (event.key && event.key === 'Enter') {
      event.preventDefault();
    }
  },

  _testLogin() {
    LdapActions.testLogin.triggerPromise(this.props.ldapSettings, this.state.loginUser, this.state.loginPassword)
      .then(
        (result) => {
          if (result.connected && (result.login_authenticated || !ObjectUtils.isEmpty(result.entry))) {
            this.setState({ loginStatus: { loading: false, success: true, result: result } });
          } else {
            this.setState({ loginStatus: { loading: false, error: true, result: result } });
          }
        },
        () => {
          this.setState({
            loginStatus: {
              loading: false,
              error: true,
              result: {
                exception: '无法测试登录，请重试。',
              },
            },
          });
        },
      );

    this.setState({ loginStatus: { loading: true } });
  },

  _loginTestButtonStyle() {
    if (this.state.loginStatus.success) {
      return 'success';
    }
    if (this.state.loginStatus.error) {
      return 'danger';
    }

    return 'info';
  },

  _formatLoginStatus(loginStatus) {
    // Don't show any status if login didn't complete
    if (!loginStatus.error && !loginStatus.success) {
      return null;
    }

    const title = `连接${loginStatus.error ? '失败' : '成功'}`;
    const style = loginStatus.error ? 'danger' : 'success';

    let userFound;
    if (ObjectUtils.isEmpty(loginStatus.result.entry)) {
      userFound = <i className="fa fa-times ldap-failure" />;
    } else {
      userFound = <i className="fa fa-check ldap-success" />;
    }

    let loginCheck;
    if (loginStatus.result.login_authenticated) {
      loginCheck = <i className="fa fa-check ldap-success" />;
    } else if (this.state.loginPassword === '') {
      loginCheck = <i className="fa fa-question ldap-info" />;
    } else {
      loginCheck = <i className="fa fa-times ldap-failure" />;
    }

    let serverResponse;
    if (loginStatus.result.exception) {
      serverResponse = <pre>{loginStatus.result.exception}</pre>;
    }

    const attributes = Object.keys(loginStatus.result.entry).map((key) => {
      return [
        <dt>{key}</dt>,
        <dd>{loginStatus.result.entry[key]}</dd>,
      ];
    });
    const formattedEntry = (attributes.length > 0 ? <dl>{attributes}</dl> :
    <p>LDAP服务器没有返回用户的任何属性。</p>);

    const groups = (loginStatus.result.groups ? loginStatus.result.groups.map(group => <li key={group}>{group}</li>) : []);
    const formattedGroups = (groups.length > 0 ? <ul style={{ padding: 0 }}>{groups}</ul> :
    <p>LDAP服务器没有为用户返回任何群。</p>);

    return (
      <Row>
        <Col sm={9} smOffset={3}>
          <Panel header={title} bsStyle={style} className="ldap-test-login-result">
            <ul className="login-status">
              <li><h4>用户找到{userFound}</h4></li>
              <li><h4>登录尝试{loginCheck}</h4></li>
            </ul>
            {serverResponse && <h4>服务器响应</h4>}
            {serverResponse}
            <h4>用户的LDAP属性</h4>
            {formattedEntry}
            <h4>用户的LDAP群</h4>
            {formattedGroups}
          </Panel>
        </Col>
      </Row>
    );
  },

  render() {
    const loginStatus = this.state.loginStatus;
    const loginDisabled = this.props.disabled || !this.state.loginUser || loginStatus.loading;

    return (
      <div>
        <Input id="test_login_username" labelClassName="col-sm-3" wrapperClassName="col-sm-9" label="登陆测试"
               help="通过加载给定用户名的条目来验证以前的设置。 如果您省略密码，则不会进行认证。">
          <Row className="row-sm">
            <Col sm={5}>
              <input type="text" id="test_login_username" name="test_login_username" className="form-control"
                     value={this.state.loginUser} onChange={this._changeLoginForm}
                     onKeyPress={this._disableSubmitOnEnter}
                     placeholder="用户名登录测试" disabled={this.props.disabled} />
            </Col>
            <Col sm={5}>
              <input type="password" id="test_login_password" name="test_login_password" className="form-control"
                     value={this.state.testLoginPassword} onChange={this._changeLoginForm}
                     onKeyPress={this._disableSubmitOnEnter}
                     placeholder="密码" disabled={this.props.disabled} />
            </Col>
            <Col sm={2}>
              <Button bsStyle={this._loginTestButtonStyle()} disabled={loginDisabled}
                      onClick={this._testLogin}>
                {loginStatus.loading ? '正在测试...' : '测试登录'}
              </Button>
            </Col>
          </Row>
        </Input>
        {this._formatLoginStatus(loginStatus)}
      </div>
    );
  },
});

export default TestLdapLogin;
