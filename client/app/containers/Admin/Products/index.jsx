// @flow
import React from 'react';
import { tt } from '../../../components/TranslateElement';

type Props = {};

class Products extends React.PureComponent<Props> {
  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  unmounted = true;

  render() {
    return (
      <div className="Products">
        <div className="ttl">{tt('Products')}</div>
      </div>
    );
  }
}

export default Products;
