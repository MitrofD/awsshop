// @flow
import React, { Fragment } from 'react';
import Categories from './Categories';
import Products from './Products';
import Page from '../includes/Page';
import PluginButton from '../includes/PluginButton';

type Props = {
  category: ?string,
};

const Catalog = (props: Props) => (
  <Page className="Catalog">
    <div className="sprtr" />
    <div className="sd lft">
      <PluginButton />
      <Categories category={props.category} />
    </div>
    <div className="sd rght">
      <Products category={props.category} />
    </div>
  </Page>
);

export default asHOT(module)(Catalog);
