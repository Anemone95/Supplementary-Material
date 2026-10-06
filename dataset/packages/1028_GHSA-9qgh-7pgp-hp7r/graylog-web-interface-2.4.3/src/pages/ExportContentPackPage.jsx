import React from 'react';
import Reflux from 'reflux';
import { Row, Col, Button } from 'react-bootstrap';

import FileSaver from 'logic/files/FileSaver';
import UserNotification from 'util/UserNotification';
import { DocumentTitle, PageHeader } from 'components/common';

import ActionsProvider from 'injection/ActionsProvider';
import StoreProvider from 'injection/StoreProvider';

const DashboardsStore = StoreProvider.getStore('Dashboards');
const GrokPatternsStore = StoreProvider.getStore('GrokPatterns');
const InputsStore = StoreProvider.getStore('Inputs');
const OutputsStore = StoreProvider.getStore('Outputs');
const StreamsStore = StoreProvider.getStore('Streams');
const LookupTablesStore = StoreProvider.getStore('LookupTables');
const LookupTableCachesStore = StoreProvider.getStore('LookupTableCaches');
const LookupTableDataAdaptersStore = StoreProvider.getStore('LookupTableDataAdapters');
// eslint-disable-next-line no-unused-vars
const ConfigurationBundlesStore = StoreProvider.getStore('ConfigurationBundles');

const InputsActions = ActionsProvider.getActions('Inputs');
const ConfigurationBundlesActions = ActionsProvider.getActions('ConfigurationBundles');

const ExportContentPackPage = React.createClass({
  mixins: [Reflux.connect(InputsStore), Reflux.connect(DashboardsStore)],
  getInitialState() {
    return {};
  },
  componentDidMount() {
    GrokPatternsStore.loadPatterns((grokPatterns) => {
      this.setState({ grok_patterns: grokPatterns });
    });
    InputsActions.list();
    OutputsStore.load((resp) => {
      this.setState({ outputs: resp.outputs });
    });
    StreamsStore.listStreams().then((streams) => {
      this.setState({ streams });
    });
    // TODO the 10k items is bad. we need a searchable/scrollable long list select box
    LookupTablesStore.searchPaginated(1, 10000, null).then((result) => {
      this.setState({ lookup_tables: result.lookup_tables });
    });
    // TODO the 10k items is bad. we need a searchable/scrollable long list select box
    LookupTableCachesStore.searchPaginated(1, 10000, null).then((result) => {
      this.setState({ lookup_caches: result.caches });
    });
    // TODO the 10k items is bad. we need a searchable/scrollable long list select box
    LookupTableDataAdaptersStore.searchPaginated(1, 10000, null).then((result) => {
      this.setState({ lookup_data_adapters: result.data_adapters });
    });
  },
  onSubmit(evt) {
    evt.preventDefault();
    const request = {
      streams: [],
      inputs: [],
      outputs: [],
      dashboards: [],
      lookup_tables: [],
      lookup_caches: [],
      lookup_data_adapters: [],
      grok_patterns: [],
    };
    Object.keys(this.refs).forEach((key) => {
      if (key.indexOf('.') === -1) {
        request[key] = this.refs[key].value;
      } else if (this.refs[key].checked) {
        const group = key.split('.')[0];
        const id = key.split('.')[1];

        request[group].push(id);
      }
    });
    ConfigurationBundlesActions.export.triggerPromise(request)
      .then((response) => {
        UserNotification.success('成功导出内容包。开始下载...', '成功!');
        FileSaver.save(response, 'content_pack.json', 'application/json', 'utf-8');
      });
  },
  isEmpty(obj) {
    return ((obj === undefined) || (typeof obj.count === 'function' ? obj.count() === 0 : obj.length === 0));
  },
  inputDetails(input) {
    let details = input.name;
    if (input.attributes.bind_address) {
      details += ` on ${input.attributes.bind_address}`;
      if (input.attributes.port) {
        details += ` port ${input.attributes.port}`;
      }
    }

    return details;
  },
  formatDashboard(dashboard) {
    return (
      <div className="checkbox" key={`dashboard_checkbox-${dashboard.id}`}>
        <label className="checkbox"><input ref={`dashboards.${dashboard.id}`} type="checkbox" name="dashboards" id={`dashboard_${dashboard.id}`} value={dashboard.id} />{dashboard.title}</label>
      </div>
    );
  },
  formatGrokPattern(grokPattern) {
    return (
      <div className="checkbox" key={`grok_pattern_checkbox-${grokPattern.id}`}>
        <label className="checkbox"><input ref={`grok_patterns.${grokPattern.id}`} type="checkbox" name="grokPatterns" id={`grokPattern_${grokPattern.id}`} value={grokPattern.id} />{grokPattern.name}</label>
        <span className="help-inline">模式: <tt>{grokPattern.pattern}</tt></span>
      </div>
    );
  },
  formatInput(input) {
    return (
      <div className="checkbox" key={`input_checkbox-${input.id}`}>
        <label className="checkbox"><input ref={`inputs.${input.id}`} type="checkbox" name="inputs" id={`input_${input.id}`} value={input.id} />{input.title}</label>
        <span className="help-inline">({this.inputDetails(input)})</span>
      </div>
    );
  },
  formatOutput(output) {
    return (
      <div className="checkbox" key={`output_checkbox-${output.id}`}>
        <label className="checkbox"><input ref={`outputs.${output.id}`} type="checkbox" name="outputs" id={`output_${output.id}`} value={output.id} />{output.title}</label>
      </div>
    );
  },
  formatStream(stream) {
    return (
      <div className="checkbox" key={`stream_checkbox-${stream.id}`}>
        <label className="checkbox"><input ref={`streams.${stream.id}`} type="checkbox" name="streams" id={`stream_${stream.id}`} value={stream.id} />{stream.title}</label>
      </div>
    );
  },
  formatLookupTable(lookupTable) {
    return (
      <div className="checkbox" key={`lookup_table_checkbox-${lookupTable.id}`}>
        <label className="checkbox"><input ref={`lookup_tables.${lookupTable.id}`} type="checkbox" name="lookup_tables" id={`lookup_table_${lookupTable.id}`} value={lookupTable.id} />{lookupTable.title}</label>
      </div>
    );
  },
  formatLookupCache(lookupCache) {
    return (
      <div className="checkbox" key={`lookup_cache_checkbox-${lookupCache.id}`}>
        <label className="checkbox"><input ref={`lookup_caches.${lookupCache.id}`} type="checkbox" name="lookup_caches" id={`lookup_cache_${lookupCache.id}`} value={lookupCache.id} />{lookupCache.title}</label>
      </div>
    );
  },
  formatLookupDataAdapter(lookupDataAdapter) {
    return (
      <div className="checkbox" key={`lookup_data_adapter_checkbox-${lookupDataAdapter.id}`}>
        <label className="checkbox"><input ref={`lookup_data_adapters.${lookupDataAdapter.id}`} type="checkbox" name="lookup_data_adapters" id={`lookup_data_adapter_${lookupDataAdapter.id}`} value={lookupDataAdapter.id} />{lookupDataAdapter.title}</label>
      </div>
    );
  },
  selectAll(group) {
    Object.keys(this.refs).forEach((key) => {
      if (key.indexOf(group) === 0) {
        this.refs[key].checked = true;
      }
    });
  },
  selectAllInputs() {
    this.selectAll('input');
  },
  selectAllGrokPatterns() {
    this.selectAll('grok_pattern');
  },
  selectAllOutputs() {
    this.selectAll('output');
  },
  selectAllStreams() {
    this.selectAll('stream');
  },
  selectAllDashboards() {
    this.selectAll('dashboard');
  },
  selectAllLookupTables() {
    this.selectAll('lookup_table');
  },
  selectAllLookupCaches() {
    this.selectAll('lookup_cache');
  },
  selectAllLookupDataAdapters() {
    this.selectAll('lookup_data_adapter');
  },
  render() {
    return (
      <DocumentTitle title="创建内容包">
        <span>
          <PageHeader title="创建内容包">
            <span>将输入，输出，流和仪表板作为内容包导出，并与社区或其他设置共享。</span>
          </PageHeader>

          <Row className="content">
            <Col md={6}>
              <form className="form-horizontal build-content-pack" onSubmit={this.onSubmit}>
                <div className="form-group">
                  <Col sm={2}>
                    <label className="control-label" htmlFor="name">名称</label>
                  </Col>
                  <Col sm={10}>
                    <input ref="name" type="text" id="name" className="input-xlarge form-control" name="name" required />
                    <span className="help-block">配置包的名称。</span>
                  </Col>
                </div>

                <div className="form-group">
                  <Col sm={2}>
                    <label className="control-label" htmlFor="description">描述</label>
                  </Col>
                  <Col sm={10}>
                    <textarea ref="description" rows="6" id="description" name="description" className="input-xlarge form-control" required />
                    <span className="help-block">
                      描述您的包的功能和用户可能的特殊说明。
                      您可以使用<a href="http://daringfireball.net/projects/markdown/syntax" target="_blank">Markdown</a>语法。
                    </span>
                  </Col>
                </div>

                <div className="form-group">
                  <Col sm={2}>
                    <label className="control-label" htmlFor="category">类别</label>
                  </Col>
                  <Col sm={10}>
                    <input ref="category" type="text" id="category" name="category" className="input-xlarge form-control" required />
                    <span className="help-block">您的包的类别，例如 操作系统，防火墙或交换机。</span>
                  </Col>
                </div>

                <div className="form-group">
                  <Col sm={2}>
                    <label className="control-label" htmlFor="inputs">输入</label>
                  </Col>
                  <Col sm={10}>
                    {this.isEmpty(this.state.inputs) ?
                      <span className="help-block help-standalone">没有输入可以导出。</span>
                      :
                      <span>
                        <Button className="btn btn-sm btn-link select-all" onClick={this.selectAllInputs}>选择全部</Button>
                        {this.state.inputs.sort((i1, i2) => { return i1.title.localeCompare(i2.title); }).map(this.formatInput)}
                      </span>
                    }
                  </Col>
                </div>

                <div className="form-group">
                  <Col sm={2}>
                    <label className="control-label" htmlFor="grokPatterns">正则匹配模式</label>
                  </Col>
                  <Col sm={10}>
                    {this.isEmpty(this.state.grok_patterns) ?
                      <span className="help-block help-standalone">没有正则匹配模式可以导出。</span>
                      :
                      <span>
                        <Button className="btn btn-sm btn-link select-all" onClick={this.selectAllGrokPatterns}>选择全部</Button>
                        {this.state.grok_patterns.sort((g1, g2) => { return g1.name.localeCompare(g2.name); }).map(this.formatGrokPattern)}
                      </span>
                      }
                  </Col>
                </div>

                <div className="form-group">
                  <Col sm={2}>
                    <label className="control-label" htmlFor="outputs">输出</label>
                  </Col>
                  <Col sm={10}>
                    {this.isEmpty(this.state.outputs) ?
                      <span className="help-block help-standalone">没有输出可以导出。</span>
                      :
                      <span>
                        <Button className="btn btn-sm btn-link select-all" onClick={this.selectAllOutputs}>选择全部</Button>
                        {this.state.outputs.sort((o1, o2) => { return o1.title.localeCompare(o2.title); }).map(this.formatOutput)}
                      </span>
                    }
                  </Col>
                </div>

                <div className="form-group">
                  <Col sm={2}>
                    <label className="control-label" htmlFor="streams">流</label>
                  </Col>
                  <Col sm={10}>
                    {this.isEmpty(this.state.streams) ?
                      <span className="help-block help-standalone">没有流可以导出。</span>
                      :
                      <span>
                        <Button className="btn btn-sm btn-link select-all" onClick={this.selectAllStreams}>选择全部</Button>
                        {this.state.streams.sort((s1, s2) => { return s1.title.localeCompare(s2.title); }).map(this.formatStream)}
                      </span>
                      }
                  </Col>
                </div>

                <div className="form-group">
                  <Col sm={2}>
                    <label className="control-label" htmlFor="dashboards">仪表板</label>
                  </Col>
                  <Col sm={10}>
                    {this.isEmpty(this.state.dashboards) ?
                      <span className="help-block help-standalone">没有仪表板可以导出。</span>
                      :
                      <span>
                        <Button className="btn btn-sm btn-link select-all" onClick={this.selectAllDashboards}>选择全部</Button>
                        {this.state.dashboards.sort((d1, d2) => { return d1.title.localeCompare(d2.title); }).map(this.formatDashboard)}
                      </span>
                      }
                  </Col>
                </div>

                <div className="form-group">
                  <Col sm={2}>
                    <label className="control-label" htmlFor="lookup_tables">查找表</label>
                  </Col>
                  <Col sm={10}>
                    {this.isEmpty(this.state.lookup_tables) ?
                      <span className="help-block help-standalone">没有查找表可以导出。</span>
                      :
                      <span>
                        <Button className="btn btn-sm btn-link select-all" onClick={this.selectAllLookupTables}>选择全部</Button>
                        {this.state.lookup_tables.sort((t1, t2) => { return t1.title.localeCompare(t2.title); }).map(this.formatLookupTable)}
                      </span>
                    }
                  </Col>
                </div>

                <div className="form-group">
                  <Col sm={2}>
                    <label className="control-label" htmlFor="lookup_caches">查找缓存</label>
                  </Col>
                  <Col sm={10}>
                    {this.isEmpty(this.state.lookup_caches) ?
                      <span className="help-block help-standalone">没有查找缓存可以导出。</span>
                      :
                      <span>
                        <Button className="btn btn-sm btn-link select-all" onClick={this.selectAllLookupCaches}>选择全部</Button>
                        {this.state.lookup_caches.sort((c1, c2) => { return c1.title.localeCompare(c2.title); }).map(this.formatLookupCache)}
                      </span>
                    }
                  </Col>
                </div>

                <div className="form-group">
                  <Col sm={2}>
                    <label className="control-label" htmlFor="lookup_data_adapters">查找数据适配器</label>
                  </Col>
                  <Col sm={10}>
                    {this.isEmpty(this.state.lookup_data_adapters) ?
                      <span className="help-block help-standalone">没有查找数据适配器可以导出。</span>
                      :
                      <span>
                        <Button className="btn btn-sm btn-link select-all" onClick={this.selectAllLookupDataAdapters}>选择全部</Button>
                        {this.state.lookup_data_adapters.sort((a1, a2) => { return a1.title.localeCompare(a2.title); }).map(this.formatLookupDataAdapter)}
                      </span>
                    }
                  </Col>
                </div>

                <div className="form-group">
                  <Col smOffset={2} sm={10}>
                    <Button bsStyle="success" type="submit">
                      <i className="fa fa-cloud-download" /> 下载我的内容包
                    </Button>

                    <br /><br />
                    <p>
                      <i className="fa fa-lightbulb-o" />&nbsp;
                      在下载之后，将您的内容包分享到<a href="https://marketplace.graylog.org/" target="_blank">Graylog商城</a>的社区。
                    </p>
                  </Col>
                </div>
              </form>
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  },
});

export default ExportContentPackPage;
