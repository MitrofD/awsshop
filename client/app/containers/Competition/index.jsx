// @flow
import React, { useEffect, createRef } from 'react';
import { hot } from 'react-hot-loader/root';
import { Link } from 'react-router-dom';
import FlipClock from 'flipclock';
import Page from '../includes/Page';
import { tt } from '../../components/TranslateElement';
import user from '../../api/user';

const Competition = () => {
  const fullCN = 'Competition as-full';
  const timerRef = createRef();
  let createShopContent = null;
  RootNode.addClass(fullCN);

  if (!user.get()) {
    createShopContent = (
      <div className="col-xl-3 align-self-center text-center right text-xl-right">
        {tt('Your Ranking?')}
        {tt('Please')}
        <Link
          className="btn btn-outline-primary"
          to="/create-shop"
        >
          {tt('Create shop')}
        </Link>
      </div>
    );
  }

  useEffect(() => {
    const timeNow = new Date();
    timeNow.setDate(timeNow.getDate() + 2);

    const timer = new FlipClock(timerRef.current, timeNow, {
      countdown: true,
      face: 'DayCounter',
    });

    return () => {
      timer.stop();
      RootNode.removeClass(fullCN);
    };
  }, []);

  return (
    <Page>
      <div className="top-box">
        <div className="container">
          <div className="p-ttl">{tt('Seller competition awards')}</div>
        </div>
      </div>
      <div className="container">
        <div className="ttop white-box padding animated fadeInUp">
          <div className="countdown row text-center">
            <div className="col-xl-2 mb-3 mb-xl-0 align-self-center left text-center text-xl-left">
              {tt('Time left')}
              :
            </div>
            <div
              className="col-xl-7 mb-3 mb-xl-0 align-self-center text-center"
              ref={timerRef}
            />
            {createShopContent}
          </div>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>{tt('Ranking')}</th>
                  <th>{tt('Seller id')}</th>
                  <th>{tt('Seller volume')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className="active">1</span>
                  </td>
                  <td>
                    9087626
                  </td>
                  <td>
                    1680195.95 USD
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="active">2</span>
                  </td>
                  <td>
                    9087626
                  </td>
                  <td>
                    1680195.95 USD
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="active">3</span>
                  </td>
                  <td>
                    9087626
                  </td>
                  <td>
                    1680195.95 USD
                  </td>
                </tr>
                <tr>
                  <td>
                    <span>4</span>
                  </td>
                  <td>
                    9087626
                  </td>
                  <td>
                    1680195.95 USD
                  </td>
                </tr>
                <tr>
                  <td>
                    <span>5</span>
                  </td>
                  <td>
                    9087626
                  </td>
                  <td>
                    1680195.95 USD
                  </td>
                </tr>
                <tr>
                  <td>
                    <span>6</span>
                  </td>
                  <td>
                    9087626
                  </td>
                  <td>
                    1680195.95 USD
                  </td>
                </tr>
                <tr>
                  <td>
                    <span>7</span>
                  </td>
                  <td>
                    9087626
                  </td>
                  <td>
                    1680195.95 USD
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="prize-places">
            <h5 className="ttl">{tt('Your prize in prize places')}</h5>
            <div className="row">
              <div className="col-md-3 mb-3 mb-xl-0">
                <div className="item first">
                  <div className="info">
                    <p>
                      Your winnings
                      <br />
                      for 1 place
                    </p>
                    <h6>20.000 USD</h6>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3 mb-xl-0">
                <div className="item second">
                  <div className="info">
                    <p>
                      Your winnings
                      <br />
                      for 2 place
                    </p>
                    <h6>15.000 USD</h6>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3 mb-xl-0">
                <div className="item third">
                  <div className="info">
                    <p>
                      Your winnings
                      <br />
                      for 3 place
                    </p>
                    <h6>10.000 USD</h6>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3 mb-xl-0">
                <div className="item fourth">
                  <div className="info">
                    <p>
                      Your winnings
                      <br />
                      for 4 place
                    </p>
                    <h6>5.000 USD</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default hot(Competition);
