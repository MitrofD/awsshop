// @flow
import React from 'react';
import Spin from '../Spin';
import './style.scss';

const DoubleBounceSpin = (props: Object) => (
  <Spin
    {...props}
    className="DoubleBounceSpin"
  >
    <div className="dbl-bnc1" />
    <div className="dbl-bnc2" />
  </Spin>
);

export default DoubleBounceSpin;
