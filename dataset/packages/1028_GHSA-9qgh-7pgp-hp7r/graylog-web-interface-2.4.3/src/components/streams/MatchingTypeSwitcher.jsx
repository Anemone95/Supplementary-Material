import PropTypes from 'prop-types';
import React from 'react';
import { Component } from 'react';
import { Input } from 'components/bootstrap';

import StoreProvider from 'injection/StoreProvider';
const StreamsStore = StoreProvider.getStore('Streams');

import UserNotification from 'util/UserNotification';

class MatchingTypeSwitcher extends Component {
  static propTypes = {
    stream: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    return (
      <div className="streamrule-connector-type-form">
        <div>
          <Input type="radio" label="消息必须符合以下所有规则"
                 checked={this.props.stream.matching_type === 'AND'} onChange={this.handleTypeChangeToAnd.bind(this)} />
          <Input type="radio" label="消息必须至少符合以下规则之一"
                 checked={this.props.stream.matching_type === 'OR'} onChange={this.handleTypeChangeToOr.bind(this)} />
        </div>
      </div>
    );
  }

  handleTypeChangeToAnd() {
    this.handleTypeChange('AND');
  }

  handleTypeChangeToOr() {
    this.handleTypeChange('OR');
  }

  handleTypeChange(newValue) {
    if (window.confirm('您将要更改这个流的规则，您想继续吗?改变将立即生效。')) {
      StreamsStore.update(this.props.stream.id, { matching_type: newValue }, (response) => {
        this.props.onChange();
        UserNotification.success(`当${newValue === 'AND' ? '全部' : '部分'}规则匹配时，消息将被路由到流中`,
          '成功');
        return response;
      });
    }
  }
}

export default MatchingTypeSwitcher;
