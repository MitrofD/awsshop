// @flow
import React, { useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import { Link } from 'react-router-dom';
import Categories from './Categories';
import Page from '../includes/Page';
import ProductsSlider from '../includes/ProductsSlider';
import { tt } from '../../components/TranslateElement';

const Home = () => {
  const fullCN = 'Home as-full';
  RootNode.addClass(fullCN);

  useEffect(() => {
    const retFunc = () => {
      RootNode.removeClass(fullCN);
    };

    return retFunc;
  });

  return (
    <Page>
      <div className="top-box">
        <div className="container">
          <div className="row info">
            <div className="col-md-6">
              <h6>
                Your dream
                <br />
                at a good price
              </h6>
              <p>Do you have questions? The Modern Pack has answers</p>
              <p>Read below and find out the answers</p>
              <Link
                className="btn animated pulse"
                to="/catalog"
              >
                {tt('View catalog')}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="sub-info">
          <div className="row">
            <div className="col-xl-4 offset-xl-1">
              Your favorite gadgets at the best price
            </div>
          </div>
        </div>
        <ProductsSlider
          title="Latest products"
        />
        <Categories />
        <ProductsSlider
          title="Most popular products"
        />
      </div>
    </Page>
  );
};

export default hot(Home);
