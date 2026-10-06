import PropTypes from 'prop-types';
import React from 'react';
import { Input } from 'components/bootstrap';

const MessageCountRotationStrategyConfiguration = React.createClass({
  propTypes: {
    config: PropTypes.object.isRequired,
    jsonSchema: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      max_docs_per_index: this.props.config.max_docs_per_index,
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
                 id="max-docs-per-index"
                 label="每个索引的最大文档数"
                 onChange={this._onInputUpdate('max_docs_per_index')}
                 value={this.state.max_docs_per_index}
                 help="循环之前，索引中的文档的最大数量"
                 required />
        </fieldset>
      </div>
    );
  },
});

export default MessageCountRotationStrategyConfiguration;
