import PropTypes from 'prop-types';
import React from 'react';
import { Alert, Button, Col, Row, Table } from 'react-bootstrap';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import { DocumentTitle, IfPermitted, PageHeader, SortableList } from 'components/common';
import Routes from 'routing/Routes';
import ObjectUtils from 'util/ObjectUtils';
import naturalSort from 'javascript-natural-sort';

const AuthProvidersConfig = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
    descriptors: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
  },

  getDefaultProps() {
    return {
      config: {
        disabled_realms: [],
        realm_order: [],
      },
    };
  },

  getInitialState() {
    return {
      config: {
        disabled_realms: this.props.config.disabled_realms,
        realm_order: this.props.config.realm_order,
      },
    };
  },

  _openModal() {
    this.refs.configModal.open();
  },

  _closeModal() {
    this.refs.configModal.close();
  },

  _saveConfig() {
    if (!this._hasNoActiveRealm()) {
      this.props.updateConfig(this.state.config).then(() => {
        this._closeModal();
      });
    }
  },

  _resetConfig() {
    // Reset to initial state when the modal is closed without saving.
    this.setState(this.getInitialState());
  },

  _onCancel() {
    this.props.history.pushState(null, Routes.SYSTEM.AUTHENTICATION.OVERVIEW);
  },

  _updateSorting(newSorting) {
    const update = ObjectUtils.clone(this.state.config);

    update.realm_order = newSorting.map(entry => entry.id);

    this.setState({ config: update });
  },

  _toggleStatus(realmName) {
    return () => {
      const disabledProcessors = this.state.config.disabled_realms;
      const update = ObjectUtils.clone(this.state.config);
      const checked = this.refs[realmName].checked;

      if (checked) {
        update.disabled_realms = disabledProcessors.filter(p => p !== realmName);
      } else if (disabledProcessors.indexOf(realmName) === -1) {
        update.disabled_realms.push(realmName);
      }

      this.setState({ config: update });
    };
  },

  _hasNoActiveRealm() {
    return this.state.config.disabled_realms.length >= this.state.config.realm_order.length;
  },

  _noActiveRealmWarning() {
    if (this._hasNoActiveRealm()) {
      return (
        <Alert bsStyle="danger">
          <strong>错误:</strong> 没有活动的的认证提供者!
        </Alert>
      );
    }
    return null;
  },

  _summary() {
    return this.state.config.realm_order.map((name, idx) => {
      const status = this.state.config.disabled_realms.filter(disabledName => disabledName === name).length > 0 ? '禁用的' : '活动的';
      const realm = (this.props.descriptors[name] || { id: name, title: 'Unavailable' });
      return (
        <tr key={idx}>
          <td>{idx + 1}</td>
          <td>{realm.displayName}</td>
          <td>{realm.description}</td>
          <td>{status}</td>
        </tr>
      );
    });
  },

  _sortableItems() {
    return this.state.config.realm_order.map((name) => {
      const realm = (this.props.descriptors[name] || { id: name, title: 'Unavailable' });
      return { id: realm.name, title: realm.displayName };
    });
  },

  _statusForm() {
    return ObjectUtils.clone(this.state.config.realm_order).sort((a, b) => naturalSort(a.displayName, b.displayName)).map((realmName, idx) => {
      const enabled = this.state.config.disabled_realms.filter(disabledName => disabledName === realmName).length < 1;
      const realm = (this.props.descriptors[realmName] || { id: realmName, displayName: 'Unavailable' });

      return (
        <tr key={idx}>
          <td>{realm.displayName}</td>
          <td>
            <input ref={realm.name}
                   type="checkbox"
                   checked={enabled}
                   disabled={!realm.canBeDisabled}
                   onChange={this._toggleStatus(realm.name)} />
          </td>
        </tr>
      );
    });
  },

  render() {
    return (
      <DocumentTitle title="认证提供者">
        <span>
          <PageHeader title="认证提供者" subpage>
            <span>以下认证提供者在登录时按顺序执行。禁用的提供者将被跳过。
			<br />用户通过第一个匹配的提供者进行身份验证，成功的匹配会导致创建该用户的Graylog帐户。
            </span>
          </PageHeader>
          <Row>
            <IfPermitted permissions={['clusterconfigentry:read', 'authentication:read']}>
              <Col md={6}>
                <Table striped bordered className="top-margin">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>提供者</th>
                      <th>描述</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this._summary()}
                  </tbody>
                </Table>

                <IfPermitted permissions={['clusterconfigentry:edit', 'authentication:edit']}>
                  <Button bsStyle="primary" onClick={this._openModal} className="save-button-margin">编辑</Button>
                  <Button onClick={this._onCancel}>取消</Button>
                </IfPermitted>

                <BootstrapModalForm ref="configModal"
                                    title="更新认证提供者配置"
                                    onSubmitForm={this._saveConfig}
                                    onModalClose={this._resetConfig}
                                    submitButtonText="保存">
                  <h3>顺序</h3>
                  <p>使用拖放来更改认证提供者的执行顺序。</p>
                  <SortableList items={this._sortableItems()} onMoveItem={this._updateSorting} />

                  <h3>状态</h3>
                  <p>更改复选框以更改认证提供者的状态。</p>
                  <Table striped bordered condensed className="top-margin">
                    <thead>
                      <tr>
                        <th>提供者</th>
                        <th>启用</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this._statusForm()}
                    </tbody>
                  </Table>
                  {this._noActiveRealmWarning()}
                </BootstrapModalForm>
              </Col>
            </IfPermitted>
          </Row>
        </span>
      </DocumentTitle>
    );
  },
});

export default AuthProvidersConfig;
