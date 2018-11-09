// @flow
import React from 'react';

type Props = {
  onPrevClick: Function,
  onNextClick: Function,
  enablePrev?: boolean,
  enableNext?: boolean,
  prev?: React$Node,
  next?: React$Node,
};

const defaultProps = {
  enablePrev: false,
  enableNext: false,
  prev: 'Prev',
  next: 'Next',
};

const Pager = (props: Props) => {
  const {
    enablePrev,
    enableNext,
    prev,
    next,
  } = props;

  const buttons = [];

  const onPrevClick = (event: SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    props.onPrevClick();
  };

  const onNextClick = (event: SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    props.onNextClick();
  };

  if (enablePrev) {
    buttons.push((
      <button
        className="btn btn-outline-primary"
        key="prev"
        onClick={onPrevClick}
      >
        &larr; {prev}
      </button>
    ));
  }

  if (enableNext) {
    buttons.push((
      <button
        className="btn btn-outline-primary"
        key="next"
        onClick={onNextClick}
      >
        {next} &rarr;
      </button>
    ));
  }

  if (buttons.length === 0) {
    return null;
  }

  return (
    <div className="Pager">
      {buttons}
    </div>
  );
};

Pager.defaultProps = defaultProps;

export default Pager;
