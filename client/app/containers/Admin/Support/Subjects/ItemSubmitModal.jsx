// @flow
import React from 'react';
import Modal from '../../../../components/Modal';
import { InvalidLabel } from '../../../../components/Label';
import { tt } from '../../../../components/TranslateElement';
import support from '../../../../api/support';

type Props = {
  item?: ?Object,
  onSuccess: (Object) => void,
};

type State = {
  subjectError: ?string,
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

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    if (props.item) {
      this.editItem = props.item;
      this.buttonTitle = 'Save';
      this.subject = this.editItem.subject;
    }

    this.state = {
      subjectError: null,
      xhrRequest: false,
    };

    const self: any = this;
    self.onClickApplyButton = this.onClickApplyButton.bind(this);
    self.onChangeSubjectInput = this.onChangeSubjectInput.bind(this);
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
    const pureSubject = this.subject || '';

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

    const sendData = {
      subject: pureSubject,
    };

    if (this.props.item) {
      support.updateSubject(this.editItem._id, sendData).then(thenClbck).catch(catchClbck);
    } else {
      support.addSubject(sendData).then(thenClbck).catch(catchClbck);
    }
  }

  onChangeSubjectInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureVal = input.value.trim();
    let error: ?string = null;

    if (pureVal.length === 0) {
      error = 'Field is required';
    }

    this.subject = pureVal;
    this.setStateAfterInputChange({
      answerError: error,
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

  firstInput: ?HTMLInputElement;

  inputChangeTimer: ?TimeoutID;

  subject: ?string;

  render() {
    const {
      subjectError,
      xhrRequest,
    } = this.state;

    let allInputsChanged = true;
    const errorCNPrefix = ' is-invalid';
    const inputCN = 'form-control';
    const errorLabels = {};

    const inputCNs = {
      subject: inputCN,
    };

    if (isChangedVal(this.subject)) {
      if (subjectError) {
        errorLabels.subject = <InvalidLabel>{subjectError}</InvalidLabel>;
        inputCNs.subject += errorCNPrefix;
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
            {tt('Subject:')}
          </label>
          <input
            className={inputCNs.subject}
            defaultValue={this.editItem.subject}
            onChange={this.onChangeSubjectInput}
            type="text"
            ref={this.setFirstInput}
          />
          {errorLabels.subject}
        </div>
      </Modal>
    );
  }
}

export default ItemSubmitModal;
