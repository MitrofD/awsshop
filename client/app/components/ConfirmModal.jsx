// @flow
import React from 'react';
import Modal, { SIZE as MODAL_SIZE } from './Modal';

type Props = {
  onConfirm: Function,
};

class ConfirmModal extends React.PureComponent<Props> {
  constructor(props: Props, context: void) {
    super(props, context);

    // binds ...
    const self: any = this;
    self.onClickConfirmButton = this.onClickConfirmButton.bind(this);
  }

  onClickConfirmButton(event: SyntheticEvent<HTMLButtonElement>) {
    event.preventDefault();
    this.props.onConfirm();
  }

  render() {
    const footer = (
      <button
        className="btn btn-danger btn-sm"
        type="button"
        onClick={this.onClickConfirmButton}
      >
        Confirm
      </button>
    );

    return (
      <Modal
        {...this.props}
        className="ConfirmModal"
        closeButtonText="Cancel"
        footer={footer}
        size={MODAL_SIZE.SMALL}
      />
    );
  }
}

export default ConfirmModal;
