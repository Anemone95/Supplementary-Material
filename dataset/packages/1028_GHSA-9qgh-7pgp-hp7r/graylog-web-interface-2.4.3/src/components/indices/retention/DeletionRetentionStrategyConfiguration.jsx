import PropTypes from 'prop-types';
import React from 'react';
import { Input } from 'components/bootstrap';

const DeletionRetentionStrategyConfiguration = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
    jsonSchema: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      max_number_of_indices: this.props.config.max_number_of_indices,
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

  render() {
    return (
      <div>
        <fieldset>
          <Input type="number"
                 id="max-number-of-indices"
                 label="索引的最大数量"
                 onChange={this._onInputUpdate('max_number_of_indices')}
                 value={this.state.max_number_of_indices}
                 help={<span>在<strong>删除</strong>最老的索引之前，要保留索引的最大数量</span>}
                 required />
        </fieldset>
      </div>
    );
  },
});

export default DeletionRetentionStrategyConfiguration;
