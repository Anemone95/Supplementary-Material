import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import PageHeader from 'components/common/PageHeader';
import ExtractorsList from 'components/extractors/ExtractorsList';
import { DocumentTitle, Spinner } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';

import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';

import ActionsProvider from 'injection/ActionsProvider';
const NodesActions = ActionsProvider.getActions('Nodes');
const InputsActions = ActionsProvider.getActions('Inputs');

import StoreProvider from 'injection/StoreProvider';
const NodesStore = StoreProvider.getStore('Nodes');
const InputsStore = StoreProvider.getStore('Inputs');

const ExtractorsPage = React.createClass({
  propTypes: {
    params: PropTypes.object.isRequired,
  },
  mixins: [Reflux.connect(InputsStore), Reflux.listenTo(NodesStore, 'onNodesChange')],
  getInitialState() {
    return {
      input: undefined,
      node: undefined,
    };
  },
  componentDidMount() {
    InputsActions.get.triggerPromise(this.props.params.inputId);
    NodesActions.list.triggerPromise();
  },
  onNodesChange(nodes) {
    let inputNode;
    if (this.props.params.nodeId) {
      inputNode = nodes.nodes[this.props.params.nodeId];
    } else {
      const nodeIds = Object.keys(nodes.nodes);
      for (let i = 0; i < nodeIds.length && !inputNode; i++) {
        const tempNode = nodes.nodes[nodeIds[i]];
        if (tempNode.is_master) {
          inputNode = tempNode;
        }
      }
    }

    if (!this.state.node || this.state.node.node_id !== inputNode.node_id) {
      this.setState({ node: inputNode });
    }
  },
  _isLoading() {
    return !(this.state.input && this.state.node);
  },
  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    return (
      <DocumentTitle title={`${this.state.input.title}的提取器`}>
        <div>
          <PageHeader title={<span><em>{this.state.input.title}</em>的提取器</span>}>
            <span>
              提取器应用于此输入接收的每条消息。使用它们来提取和转换{' '}
              任何文本数据到字段中，以便以后进行简单的筛选和分析。{' '}
              示例：从日志消息中提取HTTP响应代码，将其转换为数字字段，并将其{' '}
              作为<em>Http响应码</em>附加到消息中。
            </span>

            <span>
              要了解更多关于提取器的信息，请查看
              {' '}<DocumentationLink page={DocsHelper.PAGES.EXTRACTORS} text="文档" />。
            </span>

            <DropdownButton bsStyle="info" bsSize="large" id="extractor-actions-dropdown" title="操作" pullRight>
              <LinkContainer to={Routes.import_extractors(this.state.node.node_id, this.state.input.id)}>
                <MenuItem>导入提取器</MenuItem>
              </LinkContainer>
              <LinkContainer to={Routes.export_extractors(this.state.node.node_id, this.state.input.id)}>
                <MenuItem>导出提取器</MenuItem>
              </LinkContainer>
            </DropdownButton>
          </PageHeader>
          <ExtractorsList input={this.state.input} node={this.state.node} />
        </div>
      </DocumentTitle>
    );
  },
});

export default ExtractorsPage;
