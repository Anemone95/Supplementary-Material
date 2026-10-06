import PropTypes from 'prop-types';
import React from 'react';
import StreamThroughput from './StreamThroughput';
import StreamControls from './StreamControls';
import StreamStateBadge from './StreamStateBadge';
import CollapsibleStreamRuleList from 'components/streamrules/CollapsibleStreamRuleList';
import PermissionsMixin from 'util/PermissionsMixin';

import StoreProvider from 'injection/StoreProvider';
const StreamsStore = StoreProvider.getStore('Streams');
const StreamRulesStore = StoreProvider.getStore('StreamRules');

import StreamRuleForm from 'components/streamrules/StreamRuleForm';
import { OverlayElement, Pluralize } from 'components/common';
import UserNotification from 'util/UserNotification';
import { Button, Tooltip } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Routes from 'routing/Routes';

import style from './Stream.css';

const Stream = React.createClass({
  propTypes() {
    return {
      stream: PropTypes.object.isRequired,
      permissions: PropTypes.arrayOf(PropTypes.string).isRequired,
      streamRuleTypes: PropTypes.array.isRequired,
      user: PropTypes.object.isRequired,
      indexSets: PropTypes.array.isRequired,
    };
  },
  mixins: [PermissionsMixin],

  getInitialState() {
    return {
      loading: false,
    };
  },

  _formatNumberOfStreamRules(stream) {
    if (stream.is_default) {
      return '默认流包含所有消息。';
    }
    if (stream.rules.length === 0) {
      return '没有配置的规则。';
    }

    let verbalMatchingType;
    switch (stream.matching_type) {
      case 'OR': verbalMatchingType = '至少一条'; break;
      default:
      case 'AND': verbalMatchingType = '所有'; break;
    }

    return (
      <span>
        必须匹配{verbalMatchingType} {stream.rules.length} 配置的流{' '}
        <Pluralize value={stream.rules.length} plural="规则" singular="规则" />.
      </span>
    );
  },
  _onDelete(stream) {
    if (window.confirm('您真的想删除这条流吗?')) {
      StreamsStore.remove(stream.id, (response) => {
        UserNotification.success(`流'${stream.title}'删除成功。`, '成功');
        return response;
      });
    }
  },
  _onResume() {
    this.setState({ loading: true });
    StreamsStore.resume(this.props.stream.id, response => response)
      .finally(() => this.setState({ loading: false }));
  },
  _onUpdate(streamId, stream) {
    StreamsStore.update(streamId, stream, (response) => {
      UserNotification.success(`流'${stream.title}'更新成功。`, '成功');
      return response;
    });
  },
  _onClone(streamId, stream) {
    StreamsStore.cloneStream(streamId, stream, (response) => {
      UserNotification.success(`成功克隆了流'${stream.title}'.`, '成功');
      return response;
    });
  },
  _onPause() {
    if (window.confirm(`您真的想要暂停流'${this.props.stream.title}'吗?`)) {
      this.setState({ loading: true });
      StreamsStore.pause(this.props.stream.id, response => response)
        .finally(() => this.setState({ loading: false }));
    }
  },
  _onQuickAdd() {
    this.refs.quickAddStreamRuleForm.open();
  },
  _onSaveStreamRule(streamRuleId, streamRule) {
    StreamRulesStore.create(this.props.stream.id, streamRule, () => UserNotification.success('流规则创建成功。', '成功'));
  },
  render() {
    const stream = this.props.stream;
    const permissions = this.props.permissions;

    const isDefaultStream = stream.is_default;
    const defaultStreamTooltip = isDefaultStream ?
      <Tooltip id="default-stream-tooltip">默认流无法使用该操作</Tooltip> : null;

    let editRulesLink;
    let manageOutputsLink;
    let manageAlertsLink;
    if (this.isPermitted(permissions, [`streams:edit:${stream.id}`])) {
      editRulesLink = (
        <OverlayElement overlay={defaultStreamTooltip} placement="top" useOverlay={isDefaultStream}>
          <LinkContainer disabled={isDefaultStream} to={Routes.stream_edit(stream.id)}>
            <Button bsStyle="info">管理规则</Button>
          </LinkContainer>
        </OverlayElement>
      );

      if (this.isPermitted(permissions, ['stream_outputs:read'])) {
        manageOutputsLink = (
          <LinkContainer to={Routes.stream_outputs(stream.id)}>
            <Button bsStyle="info">管理输出</Button>
          </LinkContainer>
        );
      }
    }

    let toggleStreamLink;
    if (this.isAnyPermitted(permissions, [`streams:changestate:${stream.id}`, `streams:edit:${stream.id}`])) {
      if (stream.disabled) {
        toggleStreamLink = (
          <OverlayElement overlay={defaultStreamTooltip} placement="top" useOverlay={isDefaultStream}>
            <Button bsStyle="success" className="toggle-stream-button" onClick={this._onResume}
                    disabled={isDefaultStream || this.state.loading}>
              {this.state.loading ? '正在启动...' : '启动流'}
            </Button>
          </OverlayElement>
        );
      } else {
        toggleStreamLink = (
          <OverlayElement overlay={defaultStreamTooltip} placement="top" useOverlay={isDefaultStream}>
            <Button bsStyle="primary" className="toggle-stream-button" onClick={this._onPause}
                    disabled={isDefaultStream || this.state.loading}>
              {this.state.loading ? '正在暂停...' : '暂停流'}
            </Button>
          </OverlayElement>
        );
      }
    }

    const createdFromContentPack = (stream.content_pack ?
      <i className="fa fa-cube" title="从内容包中创建" /> : null);

    const streamRuleList = isDefaultStream ? null :
                           (<CollapsibleStreamRuleList key={`streamRules-${stream.id}`}
                                 stream={stream}
                                 streamRuleTypes={this.props.streamRuleTypes}
                                 permissions={this.props.permissions} />);
    const streamControls = (
      <OverlayElement overlay={defaultStreamTooltip} placement="top" useOverlay={isDefaultStream}>
        <StreamControls stream={stream} permissions={this.props.permissions}
                        user={this.props.user}
                        onDelete={this._onDelete} onUpdate={this._onUpdate}
                        onClone={this._onClone}
                        onQuickAdd={this._onQuickAdd}
                        indexSets={this.props.indexSets}
                        isDefaultStream={isDefaultStream} />
      </OverlayElement>
    );

    const indexSet = this.props.indexSets.find(is => is.id === stream.index_set_id) || this.props.indexSets.find(is => is.is_default);
    const indexSetDetails = this.isPermitted(permissions, ['indexsets:read']) && indexSet ? <span>索引集 <em>{indexSet.title}</em> &nbsp;</span> : null;

    return (
      <li className="stream">
        <div className="stream-actions pull-right">
          {editRulesLink}{' '}
          {manageOutputsLink}{' '}
          {manageAlertsLink}{' '}
          {toggleStreamLink}{' '}

          {streamControls}
        </div>

        <h2 className={style.streamTitle}>
          <LinkContainer to={Routes.stream_search(stream.id)}>
            <a>{stream.title}</a>
          </LinkContainer>
          {' '}
          <small>{indexSetDetails}<StreamStateBadge stream={stream} /></small>
        </h2>

        <div className="stream-data">
          <div className="stream-description">
            {createdFromContentPack}

            {stream.description}
          </div>
          <div className="stream-metadata">
            <StreamThroughput streamId={stream.id} />. {this._formatNumberOfStreamRules(stream)}
            {streamRuleList}
          </div>
        </div>
        <StreamRuleForm ref="quickAddStreamRuleForm" title="新的流规则"
                        onSubmit={this._onSaveStreamRule}
                        streamRuleTypes={this.props.streamRuleTypes} />
      </li>
    );
  },
});

export default Stream;
