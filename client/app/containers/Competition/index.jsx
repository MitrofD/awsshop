// @flow
import React, {
  createRef,
  useEffect,
  useState,
} from 'react';

import { hot } from 'react-hot-loader/root';
import { Link } from 'react-router-dom';
import FlipClock from 'flipclock';
import Page from '../includes/Page';
import NoHaveLabel from '../includes/NoHaveLabel';
import XHRSpin from '../includes/XHRSpin';
import { tt } from '../../components/TranslateElement';
import competition from '../../api/competition';
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

  const [
    members,
    setMembers,
  ] = useState(null);

  let unmounted = false;

  const setRightMembers = (newMembers: Object[]) => {
    if (!unmounted) {
      setMembers(newMembers);
    }
  };

  useEffect(() => {
    const timeNow = new Date();
    const nextMonth = timeNow.getMonth() + 1;
    const nextMonthDate = new Date(timeNow.getFullYear(), nextMonth, 0);

    const timer = new FlipClock(timerRef.current, nextMonthDate, {
      countdown: true,
      face: 'DayCounter',
    });

    competition.getMembers().then(setRightMembers).catch((error) => {
      setRightMembers([]);
      NotificationBox.danger(error.message);
    });

    return () => {
      timer.stop();
      RootNode.removeClass(fullCN);
      unmounted = true;
    };
  }, []);

  let content = null;

  if (Array.isArray(members)) {
    if (members.length > 0) {
      let activeCount = 3;

      content = (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>{tt('Ranking')}</th>
                <th>{tt('Seller')}</th>
                <th>{tt('Seller id')}</th>
                <th>{tt('Volume')}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, idx) => {
                let activeClassName = 'rnkng';

                if (activeCount > 0) {
                  activeClassName += ' active';
                }

                activeCount -= 1;

                return (
                  <tr key={member._id}>
                    <td>
                      <span className={activeClassName}>{idx + 1}</span>
                    </td>
                    <td>{member.name}</td>
                    <td>{`#${member.id}`}</td>
                    <td>{NumberFormat(member.value)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    } else {
      content = <NoHaveLabel>{tt('No members find')}</NoHaveLabel>;
    }
  } else {
    content = <XHRSpin />;
  }

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
          {content}
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
