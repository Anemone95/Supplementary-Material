import PropTypes from 'prop-types';
import React from 'react';
import { Button, Alert, Table } from 'react-bootstrap';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import { IfPermitted, SortableList } from 'components/common';
import ObjectUtils from 'util/ObjectUtils';
import naturalSort from 'javascript-natural-sort';

const MessageProcessorsConfig = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      config: {
        disabled_processors: [],
        processor_order: [],
      },
    };
  },

  getInitialState() {
    return {
      config: {
        disabled_processors: this.props.config.disabled_processors,
        processor_order: this.props.config.processor_order,
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
    if (!this._hasNoActiveProcessor()) {
      this.props.updateConfig(this.state.config).then(() => {
        this._closeModal();
      });
    }
  },

  _resetConfig() {
    // Reset to initial state when the modal is closed without saving.
    this.setState(this.getInitialState());
  },

  _updateSorting(newSorting) {
    const update = ObjectUtils.clone(this.state.config);

    update.processor_order = newSorting.map((item) => {
      return { class_name: item.id, name: item.title };
    });

    this.setState({ config: update });
  },

  _toggleStatus(className) {
    return () => {
      const disabledProcessors = this.state.config.disabled_processors;
      const update = ObjectUtils.clone(this.state.config);
      const checked = this.refs[className].checked;

      if (checked) {
        update.disabled_processors = disabledProcessors.filter(p => p !== className);
      } else if (disabledProcessors.indexOf(className) === -1) {
        update.disabled_processors.push(className);
      }

      this.setState({ config: update });
    };
  },

  _hasNoActiveProcessor() {
    return this.state.config.disabled_processors.length >= this.state.config.processor_order.length;
  },

  _noActiveProcessorWarning() {
    if (this._hasNoActiveProcessor()) {
      return (
        <Alert bsStyle="danger">
          <strong>错误:</strong> 没有活动的消息处理器!
        </Alert>
      );
    }
  },

  _summary() {
    return this.state.config.processor_order.map((processor, idx) => {
      const status = this.state.config.disabled_processors.filter(p => p === processor.class_name).length > 0 ? '禁用' : '活动';
      return (
        <tr key={idx}>
          <td>{idx + 1}</td>
          <td>{processor.name}</td>
          <td>{status}</td>
        </tr>
      );
    });
  },

  _sortableItems() {
    return this.state.config.processor_order.map((processor) => {
      return { id: processor.class_name, title: processor.name };
    });
  },

  _statusForm() {
    return ObjectUtils.clone(this.state.config.processor_order).sort((a, b) => naturalSort(a.name, b.name)).map((processor, idx) => {
      const enabled = this.state.config.disabled_processors.filter(p => p === processor.class_name).length < 1;

      return (
        <tr key={idx}>
          <td>{processor.name}</td>
          <td>
            <input ref={processor.class_name}
                   type="checkbox"
                   checked={enabled}
                   onChange={this._toggleStatus(processor.class_name)} />
          </td>
        </tr>
      );
    });
  },

  render() {
    return (
      <div>
        <h2>消息处理器配置</h2>
        <p>以下消息处理器按顺序执行。禁用的处理器将被跳过。</p>

        <Table striped bordered condensed className="top-margin">
          <thead>
            <tr>
              <th>#</th>
              <th>处理器</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {this._summary()}
          </tbody>
        </Table>

        <IfPermitted permissions="clusterconfigentry:edit">
          <Button bsStyle="info" bsSize="xs" onClick={this._openModal}>修改</Button>
        </IfPermitted>

        <BootstrapModalForm ref="configModal"
                            title="修改消息处理器配置"
                            onSubmitForm={this._saveConfig}
                            onModalClose={this._resetConfig}
                            submitButtonText="保存">
          <h3>顺序</h3>
          <p>使用拖放来更改消息处理器的执行顺序。</p>
          <SortableList items={this._sortableItems()} onMoveItem={this._updateSorting} />

          <h3>状态</h3>
          <p>更改复选框以更改消息处理器的状态。</p>
          <Table striped bordered condensed className="top-margin">
            <thead>
              <tr>
                <th>处理器</th>
                <th>启用</th>
              </tr>
            </thead>
            <tbody>
              {this._statusForm()}
            </tbody>
          </Table>
          {this._noActiveProcessorWarning()}
        </BootstrapModalForm>
      </div>
    );
  },
});

export default MessageProcessorsConfig;
