// @flow
import React from 'react';
import Spin from '../Spin';
import './style.scss';

const CubeMoveSpin = (props: Object) => (
  <Spin
    {...props}
    className="CubeMoveSpin"
  >
    <div className="cb1" />
    <div className="cb2" />
  </Spin>
);

export default CubeMoveSpin;
