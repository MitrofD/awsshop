// @flow
import React from 'react';
import Modal from './Modal';

type Props = {
  text: string,
  closeButtonHidden?: boolean,
  isOpened?: boolean,
};

const defaultProps = {
  closeButtonHidden: true,
  isOpened: true,
};

const InfoModal = (props: Props) => (
  <Modal
    {...props}
    className="InfoModal"
  >
    {props.text}
  </Modal>
);

InfoModal.defaultProps = defaultProps;

export default InfoModal;
