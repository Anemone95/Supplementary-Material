import React from 'react';
import PropTypes from 'prop-types';

const Spinner = ({ text }) => <span><i className="fa fa-spin fa-spinner" /> {text}</span>;

Spinner.propTypes = {
  text: PropTypes.string,
};
Spinner.defaultProps = {
  text: '正在加载...',
};

export default Spinner;
