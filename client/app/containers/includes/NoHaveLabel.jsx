// @flow
import React from 'react';
import { tt } from '../../components/TranslateElement';

type Props = {
  children: React$Node,
};

const NoHaveLabel = (props: Props) => (
  <div className="NoHaveLabel">
    {props.children}
  </div>
);

export default NoHaveLabel;
