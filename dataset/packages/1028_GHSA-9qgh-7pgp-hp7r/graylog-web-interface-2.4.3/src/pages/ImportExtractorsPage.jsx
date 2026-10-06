import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import ImportExtractors from 'components/extractors/ImportExtractors';

import ActionsProvider from 'injection/ActionsProvider';
const InputsActions = ActionsProvider.getActions('Inputs');

import StoreProvider from 'injection/StoreProvider';
const InputsStore = StoreProvider.getStore('Inputs');

const ImportExtractorsPage = React.createClass({
  propTypes: {
    params: PropTypes.object.isRequired,
  },
  mixins: [Reflux.connect(InputsStore)],
  getInitialState() {
    return {
      input: undefined,
    };
  },
  componentDidMount() {
    InputsActions.get.triggerPromise(this.props.params.inputId).then(input => this.setState({ input: input }));
  },
  _isLoading() {
    return !this.state.input;
  },
  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    return (
      <DocumentTitle title={`导入${this.state.input.title}的提取器`}>
        <div>
          <PageHeader title={<span>导入<em>{this.state.input.title}</em>的提取器</span>}>
            <span>
              导出的提取器可以被导入到输入。所有你需要的提取器的JSON可从任何
              其他Graylog设置或从<a href="https://marketplace.graylog.org/" target="_blank">Graylog
              商城</a>导出。
            </span>
          </PageHeader>
          <ImportExtractors input={this.state.input} />
        </div>
      </DocumentTitle>
    );
  },
});

export default ImportExtractorsPage;
