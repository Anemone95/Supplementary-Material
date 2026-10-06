import PropTypes from 'prop-types';
import React from 'react';
import { Input } from 'components/bootstrap';

import NumberUtils from 'util/NumberUtils';

const SizeBasedRotationStrategyConfiguration = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
    jsonSchema: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      max_size: this.props.config.max_size,
    };
  },

  _onInputUpdate(field) {
    return (e) => {
      const update = {};
      update[field] = e.target.value;

      this.setState(update);
      this.props.updateConfig(update);
    };
  },

  _formatSize() {
    return NumberUtils.formatBytes(this.state.max_size);
  },

  render() {
    return (
      <div>
        <fieldset>
          <Input type="number"
                 id="max-size"
                 label="每个索引的最大大小(单位:字节)"
                 onChange={this._onInputUpdate('max_size')}
                 value={this.state.max_size}
                 help="在循环之前，索引的最大大小"
                 addonAfter={this._formatSize()}
                 required />
        </fieldset>
      </div>
    );
  },
});

export default SizeBasedRotationStrategyConfiguration;
