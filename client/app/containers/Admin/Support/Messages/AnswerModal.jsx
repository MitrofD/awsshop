// @flow
import React from 'react';
import Modal from '../../../../components/Modal';
import { InvalidLabel } from '../../../../components/Label';
import { tt } from '../../../../components/TranslateElement';
import support from '../../../../api/support';

type Props = {
  item: Object,
  onSuccess: (Object) => void,
};

type State = {
  answerError: ?string,
  xhrRequest: boolean,
};

const isChangedVal = (mbStr: any) => typeof mbStr === 'string';

class AnswerModal extends React.Component<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      answerError: null,
      xhrRequest: false,
    };

    const self: any = this;
    self.onClickAnswerButton = this.onClickAnswerButton.bind(this);
    self.onChangeAnswerInput = this.onChangeAnswerInput.bind(this);
    self.setFirstInput = this.setFirstInput.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    if (this.firstInput) {
      this.firstInput.focus();
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onClickAnswerButton() {
    const pureAnswer = this.answer || '';

    this.setState({
      xhrRequest: true,
    });

    support.answerToMessage(this.props.item._id, pureAnswer).then((answer) => {
      if (this.unmounted) {
        return;
      }

      this.props.onSuccess(answer);
    }).catch((error) => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        xhrRequest: false,
      });

      NotificationBox.danger(error.message);
    });
  }

  onChangeAnswerInput(event: SyntheticEvent<HTMLTextAreaElement>) {
    const input = event.currentTarget;
    const pureVal = input.value.trim();
    let error: ?string = null;

    if (pureVal.length === 0) {
      error = 'Field is required';
    }

    this.answer = pureVal;
    this.setStateAfterInputChange({
      answerError: error,
    });
  }

  setFirstInput(el: ?HTMLTextAreaElement) {
    this.firstInput = el;
  }

  setStateAfterInputChange(newState: Object) {
    this.stopInputChangeTimer();

    this.inputChangeTimer = setTimeout(() => {
      this.setState(newState);
    }, Config.inputTimeout);
  }

  stopInputChangeTimer() {
    if (this.inputChangeTimer) {
      clearTimeout(this.inputChangeTimer);
    }

    this.inputChangeTimer = null;
  }

  firstInput: ?HTMLTextAreaElement;
  inputChangeTimer: ?TimeoutID;
  answer: ?string;
  unmounted = true;

  render() {
    const {
      answerError,
      xhrRequest,
    } = this.state;

    let allInputsChanged = true;
    const errorCNPrefix = ' is-invalid';
    const inputCN = 'form-control';
    const errorLabels = {};

    const inputCNs = {
      answer: inputCN,
    };

    if (isChangedVal(this.answer)) {
      if (answerError) {
        errorLabels.answer = <InvalidLabel>{answerError}</InvalidLabel>;
        inputCNs.answer += errorCNPrefix;
      }
    } else {
      allInputsChanged = false;
    }

    const errorsCount = Object.keys(errorLabels).length;
    const disabledSubmit = xhrRequest || !allInputsChanged || errorsCount > 0;

    const footer = (
      <button
        className="btn btn-primary btn-sm"
        disabled={disabledSubmit}
        onClick={this.onClickAnswerButton}
      >
        {tt('Apply')}
      </button>
    );

    return (
      <Modal
        {...this.props}
        closeButtonText="Cancel"
        footer={footer}
      >
        <div className="form-group">
          <label>
            {tt('Answer:')}
          </label>
          <textarea
            className={inputCNs.answer}
            onChange={this.onChangeAnswerInput}
            type="text"
            ref={this.setFirstInput}
          />
          {errorLabels.answer}
        </div>
      </Modal>
    );
  }
}

export default AnswerModal;
