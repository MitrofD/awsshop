// @flow
import React, { useState } from 'react';

type Props = Object;

const Item = (props: Props) => {
  const [
    showAnswer,
    setShowAnswer,
  ] = useState(false);

  const onClickToHeader = (event: SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    setShowAnswer(!showAnswer);
  };

  let iconCN = 'icn';
  let answerContent = null;

  if (showAnswer) {
    iconCN += ' opnd';
    answerContent = (
      <div className="answr">
        <div className="animated flipInX">
          {props.answer}
        </div>
      </div>
    );
  }

  return (
    <div className="FAQItem item">
      <a
        className="hdr"
        href="#"
        onClick={onClickToHeader}
      >
        {props.question}
        <span className={iconCN} />
      </a>
      {answerContent}
    </div>
  );
};

export default Item;
