// @flow
import React, { Fragment, useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import Page from './includes/Page';
import XHRSpin from './includes/XHRSpin';
import pages from '../api/pages';

type Props = {
  path: string,
};

const StaticPage = (props: Props) => {
  const [
    page,
    setPage,
  ] = useState(null);

  useEffect(() => {
    setPage(null);

    pages.withPath(props.path).then(setPage).catch(() => {
      setPage(true);
    });
  }, [
    props.path,
  ]);

  let content = null;

  if (page) {
    if (typeof page === 'object' && page !== null) {
      content = (
        <Fragment>
          <div className="p-ttl">
            {page.title}
          </div>
          <div
            className="dt"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </Fragment>
      );
    } else {
      content = <Redirect to="/404" />;
    }
  } else {
    content = <XHRSpin />;
  }

  return (
    <Page className="StaticPage sp">
      {content}
    </Page>
  );
};

export default StaticPage;
