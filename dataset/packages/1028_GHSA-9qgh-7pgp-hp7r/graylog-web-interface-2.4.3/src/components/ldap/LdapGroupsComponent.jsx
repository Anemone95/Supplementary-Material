import PropTypes from 'prop-types';
import React from 'react';
import Immutable from 'immutable';
import { Row, Col, Panel, Button } from 'react-bootstrap';
import naturalSort from 'javascript-natural-sort';

import { Input } from 'components/bootstrap';
import { Spinner } from 'components/common';

import ActionsProvider from 'injection/ActionsProvider';
const LdapGroupsActions = ActionsProvider.getActions('LdapGroups');

import StoreProvider from 'injection/StoreProvider';
const RolesStore = StoreProvider.getStore('Roles');
const LdapGroupsStore = StoreProvider.getStore('LdapGroups');

const LdapGroupsComponent = React.createClass({
  propTypes: {
    onCancel: PropTypes.func.isRequired,
    onShowConfig: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      groups: Immutable.Set.of(),
      roles: Immutable.Set.of(),
      mapping: Immutable.Map(),
      groupsErrorMessage: null,
    };
  },

  componentDidMount() {
    LdapGroupsActions.loadMapping.triggerPromise().then(mapping => this.setState({ mapping: Immutable.Map(mapping) }));
    LdapGroupsActions.loadGroups.triggerPromise()
      .then(
        groups => this.setState({ groups: Immutable.Set(groups) }),
        error => {
          if (error.additional.status !== 400) {
            this.setState({ groupsErrorMessage: error });
          }
        },
      );
    RolesStore.loadRoles().then(roles => this.setState({ roles: Immutable.Set(roles) }));
  },

  _updateMapping(event) {
    const role = event.target.value;
    const group = event.target.getAttribute('data-group');
    if (role === '') {
      this.setState({ mapping: this.state.mapping.delete(group) });
    } else {
      this.setState({ mapping: this.state.mapping.set(group, role) });
    }
  },

  _saveMapping(event) {
    event.preventDefault();
    LdapGroupsActions.saveMapping(this.state.mapping.toJS());
  },

  _onShowConfig(event) {
    event.preventDefault();
    this.props.onShowConfig();
  },

  _isLoading() {
    return !(this.state.mapping && this.state.groups && this.state.roles);
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    if (this.state.groupsErrorMessage) {
      return (
        <Panel header="错误：无法加载LDAP群" bsStyle="danger">
          错误信息是:<br />{this.state.groupsErrorMessage.message}
        </Panel>
      );
    }

    naturalSort.insensitive = true; // sigh

    const options = this.state.roles.sort(naturalSort).map((role) => {
      return <option key={role.name} value={role.name}>{role.name}</option>;
    });

    const content = this.state.groups.sort(naturalSort).map((group) => {
      return (
        <li key={group}>
          <Input label={group} data-group={group} type="select" value={this.state.mapping.get(group, '')}
                 onChange={this._updateMapping} labelClassName="col-sm-2" wrapperClassName="col-sm-5">
            <option value="">无</option>
            {options}
          </Input>
        </li>
      );
    });

    naturalSort.insensitive = false; // sigh 2

    if (content.size === 0) {
      return (
        <p>
          未找到LDAP / Active Directory群。请确认您的{' '}
          <a href="#" onClick={this._onShowConfig}>LDAP群映射</a>{' '}
          设置是正确的。
        </p>
      );
    }
    return (
      <form className="form-horizontal" onSubmit={this._saveMapping}>
        <Row>
          <Col md={12}>
            <ul style={{ padding: 0 }}>{content}</ul>
          </Col>
          <Col md={10} mdPush={2}>
            <Button type="submit" bsStyle="primary" className="save-button-margin">保存</Button>
            <Button onClick={this.props.onCancel}>取消</Button>
          </Col>
        </Row>
      </form>
    );
  },
});

export default LdapGroupsComponent;
