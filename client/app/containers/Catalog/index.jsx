// @flow
import React from 'react';
import Page from '../includes/Page';
import PluginButton from '../includes/PluginButton';
import LoadMore from '../includes/LoadMore';
import XHRSpin from '../includes/XHRSpin';
import Advertising from './Advertising';
import Categories from './Categories';
import Products from './Products';

type Props = {};

type State = {
  isDidInit: boolean,
};

class Catalog extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);
    RootNode.isInitMode = true;

    this.state = {
      isDidInit: false,
    };

    const self: any = this;
    self.onDidInitCategories = this.onDidInitCategories.bind(this);
  }

  componentWillUnmount() {
    RootNode.isInitMode = false;
  }

  onDidInitCategories() {
    this.isInitCategories = true;
    this.checkIsInit();
  }

  checkIsInit() {
    let isDidInit = false;

    if (this.isInitCategories && this.isInitProducts) {
      RootNode.isInitMode = false;
      isDidInit = true;
    }

    this.setState({
      isDidInit,
    });
  }

  isInitCategories = false;
  isInitProducts = true;

  render() {
    let className = 'Catalog';
    let xhrSpin = null;

    if (!this.state.isDidInit) {
      xhrSpin = <XHRSpin />;
    }

    return (
      <Page className={className}>
        {xhrSpin}
        <div className="sd lft">
          <PluginButton />
          <Categories onDidInit={this.onDidInitCategories} />
          <Advertising />
        </div>
        <div className="sd rght">
          <Products />
          <LoadMore />
        </div>
      </Page>
    );
  }
}

export default asHOT(module)(Catalog);
