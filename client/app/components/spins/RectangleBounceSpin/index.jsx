// @flow
import React from 'react';
import Spin from '../Spin';
import './style.scss';

const RectangleBounceSpin = (props: Object) => (
  <Spin
    {...props}
    className="RectangleBounceSpin"
  >
    <div className="rct1" />
    <div className="rct2" />
    <div className="rct3" />
    <div className="rct4" />
    <div className="rct5" />
  </Spin>
);

export default RectangleBounceSpin;
