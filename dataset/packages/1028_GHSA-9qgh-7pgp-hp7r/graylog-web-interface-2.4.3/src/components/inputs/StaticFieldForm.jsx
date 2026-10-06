import PropTypes from 'prop-types';
import React from 'react';

import { BootstrapModalForm, Input } from 'components/bootstrap';

import StoreProvider from 'injection/StoreProvider';
const InputStaticFieldsStore = StoreProvider.getStore('InputStaticFields');

const StaticFieldForm = React.createClass({
  propTypes: {
    input: PropTypes.object.isRequired,
  },
  open() {
    this.refs.modal.open();
  },
  _addStaticField() {
    const fieldName = this.refs.fieldName.getValue();
    const fieldValue = this.refs.fieldValue.getValue();

    InputStaticFieldsStore.create(this.props.input, fieldName, fieldValue).then(() => this.refs.modal.close());
  },
  render() {
    return (
      <BootstrapModalForm ref="modal" title="添加静态字段" submitButtonText="添加字段"
                          onSubmitForm={this._addStaticField}>
        <p>定义一个将添加到从该输入进来的每个消息的静态字段。如果消息已经有了密钥，该字段不被覆盖。密钥只能包含字母数字字符或下划线，不能是保留字段。</p>
        <Input ref="fieldName" type="text" id="field-name" label="字段名" className="validatable"
               data-validate="alphanum_underscore" required autoFocus />
        <Input ref="fieldValue" type="text" id="field-value" label="字段值" required />
      </BootstrapModalForm>
    );
  },
});

export default StaticFieldForm;
