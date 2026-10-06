import PropTypes from 'prop-types';
import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import { Input } from 'components/bootstrap';
import { Select, Spinner } from 'components/common';
import CombinedProvider from 'injection/CombinedProvider';

const { IndexSetsActions } = CombinedProvider.get('IndexSets');

const StreamForm = React.createClass({
  propTypes: {
    onSubmit: PropTypes.func.isRequired,
    stream: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    indexSets: PropTypes.array.isRequired,
  },

  mixins: [LinkedStateMixin],

  getDefaultProps() {
    return {
      stream: {
        title: '',
        description: '',
        remove_matches_from_default_stream: false,
      },
    };
  },

  getInitialState() {
    return this._getValuesFromProps(this.props);
  },

  _resetValues() {
    this.setState(this._getValuesFromProps(this.props));
  },

  _getValuesFromProps(props) {
    let defaultIndexSetId = props.stream.index_set_id;
    if (!defaultIndexSetId && props.indexSets && props.indexSets.length > 0) {
      const defaultIndexSet = props.indexSets.find(indexSet => indexSet.default);
      if (defaultIndexSet) {
        defaultIndexSetId = defaultIndexSet.id;
      }
    }

    return {
      title: props.stream.title,
      description: props.stream.description,
      remove_matches_from_default_stream: props.stream.remove_matches_from_default_stream,
      index_set_id: defaultIndexSetId,
    };
  },

  _onSubmit() {
    this.props.onSubmit(this.props.stream.id,
      {
        title: this.state.title,
        description: this.state.description,
        remove_matches_from_default_stream: this.state.remove_matches_from_default_stream,
        index_set_id: this.state.index_set_id,
      });
    this.refs.modal.close();
  },

  open() {
    this._resetValues();
    IndexSetsActions.list(false);
    this.refs.modal.open();
  },

  close() {
    this.refs.modal.close();
  },

  _formatSelectOptions() {
    return this.props.indexSets.filter(indexSet => indexSet.writable).map((indexSet) => {
      return { value: indexSet.id, label: indexSet.title };
    });
  },

  _onIndexSetSelect(selection) {
    this.linkState('index_set_id').requestChange(selection);
  },

  render() {
    let indexSetSelect;
    if (this.props.indexSets) {
      indexSetSelect = (
        <div className="form-group">
          <label>索引集</label>
          <Select placeholder="选择索引集" options={this._formatSelectOptions()} matchProp="label"
                  onChange={this._onIndexSetSelect} value={this.state.index_set_id} />
          <p className="help-block">匹配上该流的消息将被写入配置的索引集</p>
        </div>
      );
    } else {
      indexSetSelect = <Spinner>正在加载索引集...</Spinner>;
    }

    return (
      <BootstrapModalForm ref="modal"
                          title={this.props.title}
                          onSubmitForm={this._onSubmit}
                          submitButtonText="保存">
        <Input id="Title" type="text" required label="标题" name="Title"
               placeholder="新流的名称"
               valueLink={this.linkState('title')} autoFocus />
        <Input id="Description" type="text" required label="描述" name="Description"
               placeholder="什么类型的消息被路由到这个流中?"
               valueLink={this.linkState('description')} />
        {indexSetSelect}
        <Input id="RemoveFromDefaultStream" type="checkbox" label="从“所有消息”流中删除匹配项" name="Remove from All messages"
               help={<span>从“所有消息”流中删除与此流匹配的消息，这是每个消息的缺省指定设置。</span>}
               checkedLink={this.linkState('remove_matches_from_default_stream')} />
      </BootstrapModalForm>
    );
  },
});

export default StreamForm;
