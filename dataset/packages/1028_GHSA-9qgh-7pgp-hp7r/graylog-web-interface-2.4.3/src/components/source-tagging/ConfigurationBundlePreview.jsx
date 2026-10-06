import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';
import { markdown } from 'markdown';

import UserNotification from 'util/UserNotification';

import ActionsProvider from 'injection/ActionsProvider';
const ConfigurationBundlesActions = ActionsProvider.getActions('ConfigurationBundles');

const ConfigurationBundlePreview = React.createClass({
  propTypes: {
    sourceTypeId: PropTypes.string,
    sourceTypeDescription: PropTypes.string,
    onDelete: PropTypes.func.isRequired,
  },

  _confirmDeletion() {
    if (window.confirm('您确定删除这个内容包吗?')) {
      ConfigurationBundlesActions.delete(this.props.sourceTypeId).then(() => {
        UserNotification.success('包删除成功。', '成功');
        this.props.onDelete();
      }, () => {
        UserNotification.error('删除包失败，请检查您的日志以获取更多信息。', '错误');
      });
    }
  },
  _onApply() {
    ConfigurationBundlesActions.apply(this.props.sourceTypeId).then(() => {
      UserNotification.success('包应用成功。', '成功');
    }, () => {
      UserNotification.error('应用包失败，请检查您的日志以获取更多信息。', '错误');
    });
  },
  render() {
    let preview = '从列表中选择一个内容包以查看其预览。';
    let applyAction = '';
    let deleteAction = '';

    if (this.props.sourceTypeDescription) {
      preview = this.props.sourceTypeDescription;
      applyAction = <Button bsStyle="success" onClick={this._onApply}>应用内容</Button>;
      deleteAction = <Button className="pull-right" bsStyle="warning" bsSize="xsmall" onClick={this._confirmDeletion}>删除包</Button>;
    }

    const markdownPreview = markdown.toHTML(preview);

    return (
      <div className="bundle-preview">
        <div style={{ marginBottom: 5 }}>
          {deleteAction}
          <h2>内容包描述:</h2>
        </div>
        <div dangerouslySetInnerHTML={{ __html: markdownPreview }} />
        <div className="preview-actions">
          {applyAction}
        </div>
      </div>
    );
  },
});

export default ConfigurationBundlePreview;
