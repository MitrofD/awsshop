// @flow
/*
import React from 'react';
import { createPortal } from 'react-dom';
import './style.scss';

const genId = (function genIdFunc() {
  let idx = 0;
  return () => {
    idx += 1;
    return `mdl-${idx}`;
  };
}());

const MODAL_SIZE = {
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
};

type Props = {
  children: React$Node,
  id: string,
  size: $Values<typeof MODAL_SIZE>,
};

const defaultProps = {
  id: genId(),
  size: MODAL_SIZE.MEDIUM,
};

class Modal extends React.PureComponent<Props> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: null) {
    super(props, context);

    const box = document.createElement('div');
    box.id = props.id;
    doumnet.body.appendChild(box);
    this.box = box;
  }

  box: HTMLElement,

  render() {

    return (
      <div className="Modal mdl-bg">
        <div className={innerModalClassName}>
          <div className="modal-content">
            {this.getTitle()}
            <div className="bd">
              {children}
            </div>
            {this.getFooter()}
          </div>
        </div>
      </div>
    );
  }
}

export { MODAL_SIZE };
export default Modal;
*/
