import React from 'react';
import Reflux from 'reflux';

import StoreProvider from 'injection/StoreProvider';
const CurrentUserStore = StoreProvider.getStore('CurrentUser');

import { DocumentTitle, PageHeader } from 'components/common';
import OutputsComponent from 'components/outputs/OutputsComponent';

const SystemOutputsPage = React.createClass({
  mixins: [Reflux.connect(CurrentUserStore)],
  render() {
    return (
      <DocumentTitle title="输出">
        <span>
          <PageHeader title="集群中的输出">
            <span>
              Graylog节点可以通过输出转发消息流。在这里启动或终止任意数量的输出。{' '}
              <strong>然后将它们分配给流以实时转发流的所有消息。</strong>
            </span>

            <span>
              您可以在<a href="https://marketplace.graylog.org/" target="_blank">Graylog商城</a>中找到更多输出插件。
            </span>
          </PageHeader>

          <OutputsComponent permissions={this.state.currentUser.permissions} />
        </span>
      </DocumentTitle>
    );
  },
});

export default SystemOutputsPage;
