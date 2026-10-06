import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import ExportExtractors from 'components/extractors/ExportExtractors';

import ActionsProvider from 'injection/ActionsProvider';
const InputsActions = ActionsProvider.getActions('Inputs');

import StoreProvider from 'injection/StoreProvider';
const InputsStore = StoreProvider.getStore('Inputs');

const ExportExtractorsPage = React.createClass({
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
    InputsActions.get.triggerPromise(this.props.params.inputId);
  },
  _isLoading() {
    return !this.state.input;
  },
  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    return (
      <DocumentTitle title={`导出${this.state.input.title}的提取器`}>
        <div>
          <PageHeader title={<span>导出<em>{this.state.input.title}</em>的提取器</span>}>
            <span>
              输入的提取器可以导出为JSON，以便导入其他设置
              或在<a href="https://marketplace.graylog.org/" target="_blank">Graylog商城</a>中共享。
            </span>
          </PageHeader>
          <ExportExtractors input={this.state.input} />
        </div>
      </DocumentTitle>
    );
  },
});

export default ExportExtractorsPage;
