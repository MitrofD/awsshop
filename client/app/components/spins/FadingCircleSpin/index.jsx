// @flow
import React from 'react';
import Spin from '../Spin';
import './style.scss';

const FadingCircleSpin = (props: Object) => (
  <Spin
    {...props}
    className="FadingCircleSpin"
  >
    <div className="crcl1" />
    <div className="crcl2" />
    <div className="crcl3" />
    <div className="crcl4" />
    <div className="crcl5" />
    <div className="crcl6" />
    <div className="crcl7" />
    <div className="crcl8" />
    <div className="crcl9" />
    <div className="crcl10" />
    <div className="crcl11" />
    <div className="crcl12" />
  </Spin>
);

export default FadingCircleSpin;
