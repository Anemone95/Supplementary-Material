import PropTypes from 'prop-types';
import React from 'react';
import { Alert } from 'react-bootstrap';

import { DataTable, ExternalLink, Spinner } from 'components/common';

const PluginsDataTable = React.createClass({
  propTypes: {
    plugins: PropTypes.array,
  },
  _headerCellFormatter(header) {
    return <th>{header}</th>;
  },
  _pluginInfoFormatter(plugin) {
    return (
      <tr key={plugin.name}>
        <td className="limited">{plugin.name}</td>
        <td className="limited">{plugin.version}</td>
        <td className="limited">{plugin.author}</td>
        <td className="limited" style={{ width: '50%' }}>
          {plugin.description}
          &nbsp;&nbsp;
          <ExternalLink href={plugin.url} style={{ marginLeft: 10 }}>网站</ExternalLink>
        </td>
      </tr>
    );
  },
  render() {
    if (!this.props.plugins) {
      return <Spinner text="正在此节点上加载插件..." />;
    }

    if (this.props.plugins.length === 0) {
      return <Alert bsStyle="info"><i className="fa fa-info-circle" />&nbsp; 该节点没有任何安装的插件。</Alert>;
    }

    const headers = ['Name', 'Version', 'Author', 'Description'];

    return (
      <DataTable id="plugin-list"
                 rowClassName="row-sm"
                 className="table-hover table-condensed table-striped"
                 headers={headers}
                 headerCellFormatter={this._headerCellFormatter}
                 sortByKey={'name'}
                 rows={this.props.plugins}
                 dataRowFormatter={this._pluginInfoFormatter}
                 filterLabel="过滤"
                 filterKeys={[]} />
    );
  },
});

export default PluginsDataTable;
