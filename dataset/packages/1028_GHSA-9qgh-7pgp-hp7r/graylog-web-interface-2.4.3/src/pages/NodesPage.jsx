import React from 'react';
import Reflux from 'reflux';

import StoreProvider from 'injection/StoreProvider';
const CurrentUserStore = StoreProvider.getStore('CurrentUser');

import { DocumentTitle, PageHeader } from 'components/common';
import { NodesList } from 'components/nodes';

const NodesPage = React.createClass({
  mixins: [Reflux.connect(CurrentUserStore)],
  render() {
    return (
      <DocumentTitle title="节点">
        <div>
          <PageHeader title="节点">
            <span>此页面提供了Graylog集群中节点的实时概览。</span>

            <span>
              您可以随时暂停消息处理。进程缓冲区将不会接受任何新的消息，直到你恢复它。如果在默认情况下，消息日志在某一节点上开启，则即使处理被禁用，传入的消息也将被保存到磁盘。
            </span>
          </PageHeader>
          <NodesList permissions={this.state.currentUser.permissions} />
        </div>
      </DocumentTitle>
    );
  },
});

export default NodesPage;
