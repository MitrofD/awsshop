// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import { tt } from '../../components/TranslateElement';
import user from '../../api/user';

type Props = {};

class Dashboard extends React.PureComponent<Props> {
  currUser = user.get();

  render() {
    return (
      <div className="Dashboard mt-3">
        <div className="row">
          <div className="col-12 col-md-6 mb-3 mb-sm-0">
            <div className="box">
              <i className="fas fa-lock fa-2x ico" />
              <div className="desc">
                <strong>Login password</strong>
              </div>
              <Link
                className="btn btn-sm btn-outline-secondary"
                to={`${Config.accountCenterPath}/password`}
              >
                {tt('Change')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default asHOT(module)(Dashboard);
