import PropTypes from 'prop-types';
import React from 'react';
import InputDropdown from 'components/inputs/InputDropdown';
import UserNotification from 'util/UserNotification';

import StoreProvider from 'injection/StoreProvider';
const UniversalSearchStore = StoreProvider.getStore('UniversalSearch');

const RecentMessageLoader = React.createClass({
  propTypes: {
    inputs: PropTypes.object,
    onMessageLoaded: PropTypes.func.isRequired,
    selectedInputId: PropTypes.string,
  },
  getInitialState() {
    return {
      loading: false,
    };
  },

  onClick(inputId) {
    const input = this.props.inputs.get(inputId);
    if (!input) {
      UserNotification.error(`选择的输入无效: ${inputId}`,
        `无法加载消息，由于无效输入${inputId}`);
    }
    this.setState({ loading: true });
    const promise = UniversalSearchStore.search('relative', `gl2_source_input:${inputId} OR gl2_source_radio_input:${inputId}`,
      { relative: 3600 }, undefined, 1, undefined, undefined, undefined, false);
    promise.then((response) => {
      if (response.total_results > 0) {
        this.props.onMessageLoaded(response.messages[0]);
      } else {
        UserNotification.error('Input did not return a recent message.');
        this.props.onMessageLoaded(undefined);
      }
    });
    promise.finally(() => this.setState({ loading: false }));
  },
  render() {
    let helpMessage;
    if (this.props.selectedInputId) {
      helpMessage = '单击“加载消息”来加载最近一个小时内接收到的最新消息。';
    } else {
      helpMessage = '从下面的列表中选择一个“输入”，然后单击“加载消息”来加载最近一个小时内接收到的最新消息。';
    }
    return (
      <div style={{ marginTop: 5 }}>
        {helpMessage}
        <InputDropdown inputs={this.props.inputs} preselectedInputId={this.props.selectedInputId}
                       onLoadMessage={this.onClick} title={this.state.loading ? '正在加载消息...' : '加载消息'}
                       disabled={this.state.loading} />
      </div>
    );
  },
});

export default RecentMessageLoader;
