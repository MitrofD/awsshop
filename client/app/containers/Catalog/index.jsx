// @flow
import React, { Fragment } from 'react';
import Categories from './Categories';
import Products from './Products';
import Page from '../includes/Page';
import PluginButton from '../includes/PluginButton';

type Props = {
  category: ?string,
};

const Catalog = (props: Props) => {
  let pureCategory: ?string = null;

  if (props.category) {
    pureCategory = decodeURI(props.category);
  }

  return (
    <Page className="Catalog">
      <div className="sd lft">
        <PluginButton />
        <Categories category={pureCategory} />
      </div>
      <div className="sd rght">
        <Products category={pureCategory} />
      </div>
    </Page>
  );
};

export default asHOT(module)(Catalog);
