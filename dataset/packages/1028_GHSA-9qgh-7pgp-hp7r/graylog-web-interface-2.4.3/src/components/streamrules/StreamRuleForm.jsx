import PropTypes from 'prop-types';
import React from 'react';
import { Col } from 'react-bootstrap';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

import { Input } from 'components/bootstrap';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import { TypeAheadFieldInput } from 'components/common';
import { DocumentationLink } from 'components/support';
import DocsHelper from 'util/DocsHelper';
import Version from 'util/Version';

import HumanReadableStreamRule from 'components/streamrules//HumanReadableStreamRule';

const StreamRuleForm = React.createClass({
  propTypes: {
    onSubmit: PropTypes.func.isRequired,
    streamRule: PropTypes.object,
    streamRuleTypes: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired,
  },
  mixins: [LinkedStateMixin],
  getDefaultProps() {
    return {
      streamRule: { field: '', type: 1, value: '', inverted: false, description: '' },
    };
  },
  getInitialState() {
    return this.props.streamRule;
  },
  FIELD_PRESENCE_RULE_TYPE: 5,
  ALWAYS_MATCH_RULE_TYPE: 7,
  _resetValues() {
    this.setState(this.props.streamRule);
  },
  _onSubmit() {
    if (this.state.type === this.ALWAYS_MATCH_RULE_TYPE) {
      this.state.field = '';
    }
    if (this.state.type === this.FIELD_PRESENCE_RULE_TYPE || this.state.type === this.ALWAYS_MATCH_RULE_TYPE) {
      this.state.value = '';
    }
    this.props.onSubmit(this.props.streamRule.id, this.state);
    this.refs.modal.close();
  },
  _formatStreamRuleType(streamRuleType) {
    return (
      <option key={`streamRuleType${streamRuleType.id}`}
              value={streamRuleType.id}>{streamRuleType.short_desc}</option>
    );
  },
  open() {
    this._resetValues();
    this.refs.modal.open();
  },
  close() {
    this.refs.modal.close();
  },
  render() {
    const streamRuleTypes = this.props.streamRuleTypes.map(this._formatStreamRuleType);
    const fieldBox = (String(this.state.type) !== String(this.ALWAYS_MATCH_RULE_TYPE) ?
      <TypeAheadFieldInput ref="fieldInput" type="text" required label="字段" valueLink={this.linkState('field')} autoFocus /> : '');
    const valueBox = (String(this.state.type) !== String(this.FIELD_PRESENCE_RULE_TYPE) && String(this.state.type) !== String(this.ALWAYS_MATCH_RULE_TYPE) ?
      <Input id="Value" type="text" required label="值" name="Value" valueLink={this.linkState('value')} /> : '');
    return (
      <BootstrapModalForm ref="modal"
                          title={this.props.title}
                          onSubmitForm={this._onSubmit}
                          submitButtonText="保存"
                          formProps={{id: 'StreamRuleForm'}}>
        <div>
          <Col md={8}>
            {fieldBox}
            <Input id="Type" type="select" required label="类型" name="Type" valueLink={this.linkState('type')}>
              {streamRuleTypes}
            </Input>
            {valueBox}
            <Input id="Inverted" type="checkbox" label="相反的" name="Inverted" checkedLink={this.linkState('inverted')} />

            <Input id="Description" type="textarea" label="描述 (可选的)" name="Description" valueLink={this.linkState('description')} />

            <p>
              <strong>结果:</strong>
              {' '}
              <HumanReadableStreamRule streamRule={this.state} streamRuleTypes={this.props.streamRuleTypes} />
            </p>
          </Col>
          <Col md={4}>
            <div className="well well-sm matcher-github">
              服务器将尝试根据匹配器类型尽可能地转换为字符串或数字。

              <br /><br />
              <i className="fa fa-github" />
              <a href={`https://github.com/Graylog2/graylog2-server/tree/${Version.getMajorAndMinorVersion()}/graylog2-server/src/main/java/org/graylog2/streams/matchers`}
                 target="_blank"> 查看GitHub上的匹配器代码
              </a>
              <br /><br />
              Java使用正则表达式的语法。  <DocumentationLink page={DocsHelper.PAGES.STREAMS}
                                                                      title="更多信息"
                                                                      text={<i className="fa fa-lightbulb-o" />} />
            </div>
          </Col>
        </div>
      </BootstrapModalForm>
    );
  },
});

export default StreamRuleForm;
