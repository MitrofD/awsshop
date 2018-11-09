// @flow
import React from 'react';
import Spin from '../Spin';
import './style.scss';

const FoldingCubeSpin = (props: Object) => (
  <Spin
    {...props}
    className="FoldingCubeSpin"
  >
    <div className="cb1" />
    <div className="cb2" />
    <div className="cb4" />
    <div className="cb3" />
  </Spin>
);

export default FoldingCubeSpin;
