import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';

import StoreProvider from 'injection/StoreProvider';

const GrokPatternsStore = StoreProvider.getStore('GrokPatterns');

import PageHeader from 'components/common/PageHeader';
import EditPatternModal from 'components/grok-patterns/EditPatternModal';
import BulkLoadPatternModal from 'components/grok-patterns/BulkLoadPatternModal';
import DataTable from 'components/common/DataTable';
import IfPermitted from 'components/common/IfPermitted';

const GrokPatterns = React.createClass({
  getInitialState() {
    return {
      patterns: [],
    };
  },
  componentDidMount() {
    this.loadData();
  },
  loadData() {
    GrokPatternsStore.loadPatterns((patterns) => {
      if (this.isMounted()) {
        this.setState({
          patterns: patterns,
        });
      }
    });
  },
  validPatternName(name) {
    // Check if patterns already contain a pattern with the given name.
    return !this.state.patterns.some(pattern => pattern.name === name);
  },
  savePattern(pattern, callback) {
    GrokPatternsStore.savePattern(pattern, () => {
      callback();
      this.loadData();
    });
  },
  confirmedRemove(pattern) {
    if (window.confirm(`确定删除grok模式${pattern.name}吗?\n它将从系统中删除，不可用于任何提取器。如果它仍然被抽取器使用，那么将无法工作。`)) {
      GrokPatternsStore.deletePattern(pattern, this.loadData);
    }
  },
  _headerCellFormatter(header) {
    let formattedHeaderCell;

    switch (header.toLocaleLowerCase()) {
      case '名称':
        formattedHeaderCell = <th className="name">{header}</th>;
        break;
      case '操作':
        formattedHeaderCell = <th className="actions">{header}</th>;
        break;
      default:
        formattedHeaderCell = <th>{header}</th>;
    }

    return formattedHeaderCell;
  },
  _patternFormatter(pattern) {
    return (
      <tr key={pattern.id}>
        <td>{pattern.name}</td>
        <td>{pattern.pattern}</td>
        <td>
          <IfPermitted permissions="inputs:edit">
            <Button style={{ marginRight: 5 }}
                    bsStyle="primary"
                    bsSize="xs"
                    onClick={() => this.confirmedRemove(pattern)}>
              删除
            </Button>
            <EditPatternModal id={pattern.id}
                              name={pattern.name}
                              pattern={pattern.pattern}
                              create={false}
                              reload={this.loadData}
                              savePattern={this.savePattern}
                              validPatternName={this.validPatternName} />
          </IfPermitted>
        </td>
      </tr>
    );
  },
  render() {
    const headers = ['名称', '模式', '操作'];
    const filterKeys = ['name'];

    return (
      <div>
        <PageHeader title="正则匹配模式">
          <span>
            这是您可以在Graylog 正则匹配提取器中使用的正则匹配模式列表。 您可以手动添加自己的文件或从所谓的模式文件导入整个模式列表。
          </span>
          {null}
          <IfPermitted permissions="inputs:edit">
            <span>
              <BulkLoadPatternModal onSuccess={this.loadData} />
              <EditPatternModal id={''}
                                name={''}
                                pattern={''}
                                create
                                reload={this.loadData}
                                savePattern={this.savePattern}
                                validPatternName={this.validPatternName} />
            </span>
          </IfPermitted>
        </PageHeader>

        <Row className="content">
          <Col md={12}>
            <IfPermitted permissions="inputs:read">
              <DataTable id="grok-pattern-list"
                         className="table-striped table-hover"
                         headers={headers}
                         headerCellFormatter={this._headerCellFormatter}
                         sortByKey={'name'}
                         rows={this.state.patterns}
                         dataRowFormatter={this._patternFormatter}
                         filterLabel="过滤模式"
                         filterKeys={filterKeys} />
            </IfPermitted>
          </Col>
        </Row>
      </div>
    );
  },
});

export default GrokPatterns;
