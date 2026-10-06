import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';
import EditExtractor from 'components/extractors/EditExtractor';

import DocsHelper from 'util/DocsHelper';
import Routes from 'routing/Routes';

import ActionsProvider from 'injection/ActionsProvider';
const InputsActions = ActionsProvider.getActions('Inputs');
const ExtractorsActions = ActionsProvider.getActions('Extractors');

import StoreProvider from 'injection/StoreProvider';
const ExtractorsStore = StoreProvider.getStore('Extractors');
const InputsStore = StoreProvider.getStore('Inputs');
const UniversalSearchstore = StoreProvider.getStore('UniversalSearch');

const EditExtractorsPage = React.createClass({
  propTypes: {
    params: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  },
  mixins: [Reflux.connect(ExtractorsStore), Reflux.connect(InputsStore)],
  getInitialState() {
    return {
      extractor: undefined,
      input: undefined,
      exampleMessage: undefined,
    };
  },
  componentDidMount() {
    InputsActions.get.triggerPromise(this.props.params.inputId);
    ExtractorsActions.get.triggerPromise(this.props.params.inputId, this.props.params.extractorId);
    UniversalSearchstore.search('relative', `gl2_source_input:${this.props.params.inputId} OR gl2_source_radio_input:${this.props.params.inputId}`, { range: 0 }, undefined, 1)
      .then((response) => {
        if (response.total_results > 0) {
          this.setState({ exampleMessage: response.messages[0] });
        } else {
          this.setState({ exampleMessage: {} });
        }
      });
  },
  _isLoading() {
    return !(this.state.input && this.state.extractor && this.state.exampleMessage);
  },
  _extractorSaved() {
    let url;
    if (this.state.input.global) {
      url = Routes.global_input_extractors(this.props.params.inputId);
    } else {
      url = Routes.local_input_extractors(this.props.params.nodeId, this.props.params.inputId);
    }

    this.props.history.pushState(null, url);
  },
  render() {
    // TODO:
    // - Redirect when extractor or input were deleted

    if (this._isLoading()) {
      return <Spinner />;
    }

    return (
      <DocumentTitle title={`编辑提取器${this.state.extractor.title}`}>
        <div>
          <PageHeader
            title={<span>编辑输入<em>{this.state.input.title}</em>的提取器<em>{this.state.extractor.title}</em> </span>}>
            <span>
              提取器应用于此输入接收的每条消息。使用它们来提取和转换{' '}
              任何文本数据到字段中，以便以后进行简单的筛选和分析。
            </span>

            <span>
              要了解更多关于提取器的信息，请查看
              {' '}<DocumentationLink page={DocsHelper.PAGES.EXTRACTORS} text="文档" />。
            </span>
          </PageHeader>
          <EditExtractor action="edit"
                         extractor={this.state.extractor}
                         inputId={this.state.input.id}
                         exampleMessage={this.state.exampleMessage.fields ? this.state.exampleMessage.fields[this.state.extractor.source_field] : undefined}
                         onSave={this._extractorSaved} />
        </div>
      </DocumentTitle>
    );
  },
});

export default EditExtractorsPage;
