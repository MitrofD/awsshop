// @flow
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hot } from 'react-hot-loader/root';
import Page from './includes/Page';
import { tt } from '../components/TranslateElement';

const HowItWorks = () => {
  const fullCN = 'HowItWorks as-full';
  RootNode.addClass(fullCN);

  useEffect(() => {
    const retFunc = () => {
      RootNode.removeClass(fullCN);
    };

    return retFunc;
  }, []);

  return (
    <Page>
      <section className="top-box">
        <div className="container">
          <div className="row info">
            <div className="col-md-6">
              <h6>SO... HOW IT WORKS?</h6>
              <p>Do you have questions? Awesome-Shop has answers</p>
              <p>Read below and find out the answers</p>
              <div className="row">
                <div className="col-lg-10">
                  <div className="row mt-3">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <Link
                        className="btn btn-block btn-gen"
                        to="/create-shop"
                      >
                        {tt('Register')}
                      </Link>
                    </div>
                    <div className="col-md-6">
                      <Link
                        className="btn btn-block btn-border"
                        to={Config.catalogPath}
                      >
                        {tt('View catalog')}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="container about">
        <div className="text-center">
          <h6>
            Everything You Need To Run A Successful
            <br />
            Drop-shipping Business Is Here
          </h6>
          <p>
            You can stop wasting hours on product research and finding “Quality Vendors”?
            <br />
            No Storing Inventory, No Packing Or Shipping Out Products You Pick The Items You Want To Sell And Market Your Store…
            <br />
            our automated system will do the rest for you.
          </p>
        </div>
        <div className="row ways">
          <div className="col-lg-5 align-self-center mb-4 mb-lg-0 old">
            <p className="text-center">The old way...</p>
            <div className="img" />
          </div>
          <div className="col-lg-2 align-self-center text-center mb-4 mb-lg-0 vs">
            <span>VS</span>
          </div>
          <div className="col-lg-5 new">
            <p className="text-center">...The new way!</p>
            <div className="img" />
          </div>
        </div>
      </section>
      <section className="free">
        <div className="container">
          <h5 className="title">And it is free:</h5>
          <div className="row items">
            <div className="col-lg-4 mb-5 mb-lg-0 payments">
              <div className="img" />
              <p>No monthly payments</p>
            </div>
            <div className="col-lg-4 mb-5 mb-lg-0 registration">
              <div className="img" />
              <p>No registration fee</p>
            </div>
            <div className="col-lg-4 credit-card">
              <div className="img" />
              <p>No credit card</p>
            </div>
          </div>
          <div className="pay-info">
            ...you will pay only if you have sold
          </div>
          <div className="text-center">
            <Link
              className="btn btn-gen mt-5"
              to="/create-shop"
            >
              Get your free account now
            </Link>
          </div>
        </div>
      </section>
      <section className="container automation">
        <h5 className="title">
          With AwsomeShop’s powerful automation, you’ll free up
          <br />
          at least 25 hours a week…
        </h5>
        <p className="subtitle">
          so you can spend that precious time with your family (or yourself)
        </p>
        <div className="row data">
          <div className="col-xl-6 mb-4 mb-xl-0">
            <div className="item">
              <strong>Easy Add and Ship Products:</strong>
              <p>No more hours wasted manually adding products to your e-commerce store</p>
            </div>
            <div className="item">
              <strong>Time Savings:</strong>
              <p>No more messy spreadsheets placing orders</p>
            </div>
            <div className="item">
              <strong>Earn More Money:</strong>
              <p>No more managing all your orders</p>
            </div>
          </div>
          <div className="col-xl-6 text-center img" />
        </div>
      </section>
      <section className="extension">
        <div className="container">
          <h5 className="title">Use our free Chrome extention</h5>
          <p className="data">
            With the Chrome extension you can do product research anywhere and anytime. Simply go to AliExpress for product discovery, AwsomeShop’s Chrome extension will automatically mark the product for you and will offer to add the selected product to your AwsomeShop personal store. ! Click. Click! Done.
          </p>
          <p className="subtitle">It’s easy to get started:</p>
          <div className="row items mt-5">
            <div className="col-lg-4 mb-5 mb-lg-0 import">
              <div className="img" />
              <p>
                Pick Products You Want To Sell
                And Import Them With 1 Click using
                our browser extension
              </p>
            </div>
            <div className="col-lg-4 mb-5 mb-lg-0 traffic">
              <div className="img" />
              <p>Drive Traffic To Your Store And Start Selling Your Products</p>
            </div>
            <div className="col-lg-4 automate">
              <div className="img" />
              <p>Let us automate the rest</p>
            </div>
          </div>
        </div>
      </section>
      <section className="steps">
        <div className="container">
          <h5 className="title">
            Awsome Shop quickly does everything
            <br />
            else for you behind the scenes:
          </h5>
          <div className="row items mt-5">
            <div className="col-md-6 col-lg-3 mb-5 mb-lg-0 step1">
              <div className="img" />
              <span>Step 1</span>
              <p>Your customer places their order</p>
            </div>
            <div className="col-md-6 col-lg-3 mb-5 mb-lg-0 step2">
              <div className="img" />
              <span>Step 2</span>
              <p>Awsome Shop will place the order with your supplier</p>
            </div>
            <div className="col-md-6 col-lg-3 mb-5 mb-lg-0 step3">
              <div className="img" />
              <span>Step 3</span>
              <p>Your supplier will ship the product out</p>
            </div>
            <div className="col-md-6 col-lg-3 step4">
              <div className="img" />
              <span>Step 4</span>
              <p>Your customer’s receipt and tracking is emailed to them</p>
            </div>
          </div>
        </div>
      </section>
      <section className="container motivation">
        <div className="row">
          <div className="col-xl-6 mb-5 mb-xl-0 text-center text-xl-left align-self-center">
            <h5 className="title">
              Yes, it’s that easy
              <br />
              and it’s automated!
            </h5>
            <p>
              That will allow you to focus on finding great products,
              <br />
              marketing your store and scaling up…
              <br />
              …and we will  handle the rest of it
            </p>
            <Link
              className="btn btn-gen"
              to="/create-shop"
            >
              Start free shop now
            </Link>
          </div>
          <div className="col-xl-6 align-self-center">
            <div className="img" />
          </div>
        </div>
      </section>
      <section className="features">
        <div className="container">
          <h5 className="title">
            Here is some KEY features in our Drop Shipping Software that could…
            <br />
            Seriously change your business
          </h5>
          <div className="row items">
            <div className="col-lg-4 one-click">
              <div className="img" />
              <span>Add products with 1 click</span>
              <p>
                Find products and instantly add them to your store so you have high converting, great products to sell in your store
              </p>
            </div>
            <div className="col-lg-4 automate">
              <div className="img" />
              <span>Fulfill orders automatically</span>
              <p>
                Fulfill as many orders as you can sell from as many vendors as you want, in seconds
              </p>
            </div>
            <div className="col-lg-4 wish-boards">
              <div className="img" />
              <span>Create product wish boards</span>
              <p>
                Research amazing new products but save for later on your custom wish boards
              </p>
            </div>
            <div className="col-lg-4 tracking">
              <div className="img" />
              <span>Shipment tracking</span>
              <p>
                While you are working, we scan your orders to look for the latest tracking information and update your orders automatically without you having to manually search, copy or paste any longer
              </p>
            </div>
            <div className="col-lg-4 edit">
              <div className="img" />
              <span>Edit products on upload</span>
              <p>
                Write your own customized product descriptions, rename the product, or edit the image provided by the AliExpress drop shipping vendor. AwsomeShop offers user-friendly tools to help you edit and customize products quickly
              </p>
            </div>
            <div className="col-lg-4 manage">
              <div className="img" />
              <span>Manage your stores in one place</span>
              <p>
                Increase efficiency and frustration by managing multiple stores all from one place. You will be able to see, review and manage order fulfillment in one place
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="welcome">
        <div className="conteainer">
          <h5 className="title">
            You could be adding products to your e-commerce store and
            <br />
            fulfilling orders automatically IN MINUTES
          </h5>
          <div className="subtitle">
            ...Scroll down to that BLUE BUTTON, get started and hand off most of the grunt work off to us!
          </div>
          <Link
            className="btn btn-gen mt-5"
            to="/create-shop"
          >
            Lets get started - it&apos;s free
          </Link>
        </div>
      </section>
    </Page>
  );
};

export default hot(HowItWorks);
