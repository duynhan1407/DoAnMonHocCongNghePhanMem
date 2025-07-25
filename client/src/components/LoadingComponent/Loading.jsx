import { Spin } from 'antd';
import React from 'react';
import PropTypes from 'prop-types';

const Loading = ({ children, isLoading, delay = 1000 }) => {
  return (
    <Spin spinning={isLoading} delay={delay} tip="Loading...">
      {children}
    </Spin>
  );
};

Loading.propTypes = {
  children: PropTypes.node,
  isLoading: PropTypes.bool.isRequired,
  delay: PropTypes.number,
};

Loading.defaultProps = {
  delay: 1000,
};

export default Loading;
