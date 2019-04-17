// @flow
import React, { Fragment, useState, useEffect } from 'react';
import Page from './includes/Page';
import XHRSpin from './includes/XHRSpin';
import pages from '../api/pages';

type Props = {
  history: Object,
  path: string,
};

const StaticPage = (props: Props) => {
  const [
    page,
    setPage,
  ] = useState(null);

  useEffect(() => {
    pages.withPath(props.path).then(setPage).catch(() => {
      props.history.push('/404');
    });
  });

  let content = null;

  if (page) {
    content = (
      <Fragment>
        <div className="p-ttl">{page.title}</div>
        <div
          className="dt"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </Fragment>
    );
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
