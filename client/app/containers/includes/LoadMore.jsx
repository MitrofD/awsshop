// @flow
import React from 'react';
import { tt } from '../../components/TranslateElement';

type Props = {
  text: string,
};

const defaultProps = {
  text: 'Loading',
};

const LoadMore = (prop: Props) => (
  <div className="LoadMore">
    {tt(prop.text)} <span className="spnnr" />
  </div>
);

LoadMore.defaultProps = defaultProps;

export default LoadMore;
