// @flow
import React, {
  Fragment,
  useState,
  useEffect,
} from 'react';

import { Link, Redirect } from 'react-router-dom';
import { hot } from 'react-hot-loader/root';
import Page from './includes/Page';
import XHRSpin from './includes/XHRSpin';
import { tt } from '../components/TranslateElement';
import vacancies from '../api/vacancies';

const fullCN = 'Careers details as-full';

type Props = {
  id: string,
};

const Career = (props: Props) => {
  const [
    data,
    setData,
  ] = useState();

  useEffect(() => {
    let unmounted = false;
    RootNode.addClass(fullCN);

    const setNewData = (newData: any) => {
      if (unmounted) {
        return;
      }

      setData(newData);
    };

    vacancies.withId(props.id).then((career) => {
      setNewData(career);
    }).catch(() => {
      setNewData(null);
    });

    return () => {
      unmounted = true;
      RootNode.removeClass(fullCN);
    };
  }, []);

  if (data === null) {
    return <Redirect to="/404" />;
  }

  let content = null;

  if (typeof data === 'object') {
    content = (
      <Fragment>
        <div className="info">
          <div className="title">{data.title}</div>
          <div className="location">{data.location}</div>
        </div>
        <div
          className="data"
          dangerouslySetInnerHTML={{ __html: data.description }}
        />
        <div className="sign">
          <p>
            We would like to thank all applicants for your interest however,
            <br />
            only candidates selected for an interview will be contacted
          </p>
          <Link
            className="btn btn-border"
            to="/careers"
          >
            Return to careers
          </Link>
        </div>
      </Fragment>
    );
  } else {
    content = <XHRSpin />;
  }

  return (
    <Page>
      <div className="top-box">
        <div className="container">
          <div className="p-ttl">{tt('Careers')}</div>
        </div>
      </div>
      <div className="container">
        <div className="ttop white-box padding">
          {content}
        </div>
      </div>
    </Page>
  );
};

export default hot(Career);
