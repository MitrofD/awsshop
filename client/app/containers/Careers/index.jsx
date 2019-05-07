// @flow
import React, { useEffect } from 'react';
import Page from '../includes/Page';
import { tt } from '../../components/TranslateElement';
import NoHaveLabel from '../includes/NoHaveLabel';

const Careers = () => {
  useEffect(() => {
    const fullCN = 'Careers as-full';
    RootNode.addClass(fullCN);

    return () => {
      RootNode.removeClass(fullCN);
    };
  }, []);

  return (
    <Page>
      <div className="top-box">
        <div className="container">
          <div className="p-ttl">{tt('Careers')}</div>
        </div>
      </div>
      <div className="container">
        <div className="ttop white-box padding animated fadeInUp">
          <div className="pre-ttl">
            {tt('You’re just a few steps away from starting your dream job!')}
          </div>
          <div className="p-ttl">
            {tt('Our current vacancies')}
          </div>
          <div className="table-responsive">
            <table className="table table-striped border">
              <tbody>
                <tr>
                  <td>
                    <div className="info">
                      <div className="text-primary">Sales manager</div>
                      <span>1 positions available</span>
                    </div>
                  </td>
                  <td>
                    <strong>Senior</strong>
                  </td>
                  <td>
                    Rome, Italy
                  </td>
                  <td>
                    <a href="#" className="btn">Details</a>
                    <a href="#" className="btn btn-apply">Apply</a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="info">
                      <div className="text-primary">Sales manager</div>
                      <span>1 positions available</span>
                    </div>
                  </td>
                  <td>
                    <strong>Senior</strong>
                  </td>
                  <td>
                    Rome, Italy
                  </td>
                  <td>
                    <a href="#" className="btn">Details</a>
                    <a href="#" className="btn btn-apply">Apply</a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="info">
                      <div className="text-primary">Sales manager</div>
                      <span>1 positions available</span>
                    </div>
                  </td>
                  <td>
                    <strong>Senior</strong>
                  </td>
                  <td>
                    Rome, Italy
                  </td>
                  <td>
                    <a href="#" className="btn">Details</a>
                    <a href="#" className="btn btn-apply">Apply</a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="info">
                      <div className="text-primary">Sales manager</div>
                      <span>1 positions available</span>
                    </div>
                  </td>
                  <td>
                    <strong>Senior</strong>
                  </td>
                  <td>
                    Rome, Italy
                  </td>
                  <td>
                    <a href="#" className="btn">Details</a>
                    <a href="#" className="btn btn-apply">Apply</a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="info">
                      <div className="text-primary">Sales manager</div>
                      <span>1 positions available</span>
                    </div>
                  </td>
                  <td>
                    <strong>Senior</strong>
                  </td>
                  <td>
                    Rome, Italy
                  </td>
                  <td>
                    <a href="#" className="btn">Details</a>
                    <a href="#" className="btn btn-apply">Apply</a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="info">
                      <div className="text-primary">Sales manager</div>
                      <span>1 positions available</span>
                    </div>
                  </td>
                  <td>
                    <strong>Senior</strong>
                  </td>
                  <td>
                    Rome, Italy
                  </td>
                  <td>
                    <a href="#" className="btn">Details</a>
                    <a href="#" className="btn btn-apply">Apply</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default asHOT(module)(Careers);
