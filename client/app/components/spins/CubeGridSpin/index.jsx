// @flow
import React from 'react';
import Spin from '../Spin';
import './style.scss';

const CubeGridSpin = (props: Object) => (
  <Spin
    {...props}
    className="CubeGridSpin"
  >
    <div className="cb1" />
    <div className="cb2" />
    <div className="cb3" />
    <div className="cb4" />
    <div className="cb5" />
    <div className="cb6" />
    <div className="cb7" />
    <div className="cb8" />
    <div className="cb9" />
  </Spin>
);

export default CubeGridSpin;
