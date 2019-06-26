// @flow
import React, { useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import Page from './includes/Page';
import { tt } from '../components/TranslateElement';

const AboutUs = () => {
  const fullCN = 'AboutUs as-full';
  RootNode.addClass(fullCN);

  useEffect(() => {
    const retFunc = () => {
      RootNode.removeClass(fullCN);
    };

    return retFunc;
  }, []);

  return (
    <Page>
      <section className="first">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="title">Awesome shop</div>
              <p>
                We are a team of developers who decided to convert their common experience into this project. More than 6 years of web development in most different niches allows us offering you products of premium quality. Among other spheres, we’ve got a solid experience of work with Alibaba Holding, and have developed the best plugin for AliExpress dropshipping. If you are thinking of a turnkey business bringing good stable income, you’ve found your perfect starting point right here, on this website.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="container second">
        <div className="row">
          <div className="col-xl-6">
            <div className="img" />
          </div>
          <div className="col-xl-6">
            <div className="title">Being successful drop shippers ourselves</div>
            <p>
              We don’t only create software and develop webstores for our customers. We have been running many dropshipping stores of our own and accumulating tricks and strategies in every niche we deal with. As a result we have sharpened our skills and market knowledge to the level that allows reaching maximum conversions and income. And now we are ready to share this all with you – so that you could repeat our success.
            </p>
          </div>
        </div>
      </section>
      <section className="thirth">
        <div className="container">
          <div className="row">
            <div className="col-xl-6 align-self-center info">
              <div className="title mb-2">More than 10 years of web development in most different niches allows us offering you products of premium quality</div>
              <p>
                Among other spheres, we’ve got a solid experience of work with Alibaba Holding, and have developed the best plugin for AliExpress dropshipping. AwesomeShop is completely cloud-based and hosted, which means you don’t have to worry about upgrading or maintaining software or web servers. This gives you the flexibility to access and run your business from anywhere with an internet connection
              </p>
            </div>
            <div className="col-xl-6 img-wrppr align-self-center">
              <div className="img" />
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
};

export default hot(AboutUs);
