// @flow
import React from 'react';
import Modal from '../../../components/Modal';
import { InvalidLabel } from '../../../components/Label';
import { tt } from '../../../components/TranslateElement';
import faqs from '../../../api/faqs';

type Props = {
  item?: ?Object,
  onSuccess: (Object) => void,
};

type State = {
  answerError: ?string,
  questionError: ?string,
  xhrRequest: boolean,
};

const defaultProps = {
  item: null,
};

const isChangedVal = (mbStr: any) => typeof mbStr === 'string';

class ItemSubmitModal extends React.Component<Props, State> {
  static defaultProps = defaultProps;

  buttonTitle = '+ Add';

  editItem = {};

  answer: ?string;

  question: ?string;

  firstInput: ?HTMLInputElement;

  inputChangeTimer: ?TimeoutID;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    if (props.item) {
      this.editItem = props.item;
      this.buttonTitle = 'Save';
      this.answer = this.editItem.answer;
      this.question = this.editItem.question;
    }

    this.state = {
      answerError: null,
      questionError: null,
      xhrRequest: false,
    };

    const self: any = this;
    self.onClickApplyButton = this.onClickApplyButton.bind(this);
    self.onChangeAnswerInput = this.onChangeAnswerInput.bind(this);
    self.onChangeQuestionInput = this.onChangeQuestionInput.bind(this);
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

  onClickApplyButton() {
    const emptyStr = '';
    const pureAnswer = this.answer || emptyStr;
    const pureQuestion = this.question || emptyStr;

    this.setState({
      xhrRequest: true,
    });

    const thenClbck = (answer) => {
      if (this.unmounted) {
        return;
      }

      if (typeof answer.errors === 'object' && answer.errors !== null) {
        this.setState(Tools.getErrorsObj(answer.errors));
      } else {
        this.props.onSuccess(answer.data);
      }
    };

    const catchClbck = (error) => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        xhrRequest: false,
      });

      NotificationBox.danger(error.message);
    };

    const newData = {
      answer: pureAnswer,
      question: pureQuestion,
    };

    if (this.props.item) {
      faqs.update(this.editItem._id, newData).then(thenClbck).catch(catchClbck);
    } else {
      faqs.add(newData).then(thenClbck).catch(catchClbck);
    }
  }

  onChangeAnswerInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureVal = input.value.trim();
    let error: ?string = null;

    if (pureVal.length === 0) {
      error = 'Answer is required';
    }

    this.answer = pureVal;
    this.setStateAfterInputChange({
      answerError: error,
    });
  }

  onChangeQuestionInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureVal = input.value.trim();
    let error: ?string = null;

    if (pureVal.length === 0) {
      error = 'Question is required';
    }

    this.question = pureVal;
    this.setStateAfterInputChange({
      questionError: error,
    });
  }

  setFirstInput(el: ?HTMLInputElement) {
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

  render() {
    const {
      answerError,
      questionError,
      xhrRequest,
    } = this.state;

    let allInputsChanged = true;
    const errorCNPrefix = ' is-invalid';
    const inputCN = 'form-control';
    const errorLabels = {};

    const inputCNs = {
      answer: inputCN,
      question: inputCN,
    };

    if (isChangedVal(this.answer)) {
      if (answerError) {
        errorLabels.answer = <InvalidLabel>{answerError}</InvalidLabel>;
        inputCNs.answer += errorCNPrefix;
      }
    } else {
      allInputsChanged = false;
    }

    if (isChangedVal(this.question)) {
      if (questionError) {
        errorLabels.question = <InvalidLabel>{questionError}</InvalidLabel>;
        inputCNs.question += errorCNPrefix;
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
        type="button"
        onClick={this.onClickApplyButton}
      >
        {tt(this.buttonTitle)}
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
            {tt('Question:')}
          </label>
          <input
            className={inputCNs.question}
            defaultValue={this.editItem.question}
            onChange={this.onChangeQuestionInput}
            type="text"
            ref={this.setFirstInput}
          />
          {errorLabels.question}
        </div>
        <div className="form-group">
          <label>
            {tt('Answer:')}
          </label>
          <textarea
            className={inputCNs.answer}
            defaultValue={this.editItem.answer}
            onChange={this.onChangeAnswerInput}
            type="text"
          />
          {errorLabels.answer}
        </div>
      </Modal>
    );
  }
}

export default ItemSubmitModal;
