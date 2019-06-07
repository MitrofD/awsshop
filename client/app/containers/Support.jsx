// @flow
import React from 'react';
import { hot } from 'react-hot-loader/root';
import Page from './includes/Page';
import SupportSubjectsModal from './includes/SupportSubjectsModal';
import { InvalidLabel } from '../components/Label';
import { tt } from '../components/TranslateElement';
import support from '../api/support';
import user from '../api/user';

type Props = {};

type State = {
  emailError: ?string,
  messageError: ?string,
  modal: React$Node,
  nameError: ?string,
  xhrRequest: boolean,
};

const wrapCN = 'as-full';

const checkRequiredValue = (value: string, field: string): string => {
  const pureVal = value.trim();

  if (pureVal.length === 0) {
    throw new Error(`${field} is required`);
  }

  return pureVal;
};

class Support extends React.Component<Props, State> {
  emailCh = false;

  nameCh = false;

  messageCh = false;

  subjectId: ?string = null;

  defEmail: ?string;

  firstInput: ?HTMLInputElement;

  inputChangeTimer: ?TimeoutID;

  subject: ?string;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      emailError: null,
      messageError: null,
      modal: null,
      nameError: null,
      xhrRequest: false,
    };

    const currUser = user.get();

    if (currUser) {
      this.defEmail = currUser.email;
      this.emailCh = currUser.email;
    }

    const self: any = this;
    self.onChangeNameInput = this.onChangeNameInput.bind(this);
    self.onChangeEmailInput = this.onChangeEmailInput.bind(this);
    self.onChangeMessageTextarea = this.onChangeMessageTextarea.bind(this);
    self.onClickToSubject = this.onClickToSubject.bind(this);
    self.onCloseModal = this.onCloseModal.bind(this);
    self.onSelectSupportSubjects = this.onSelectSupportSubjects.bind(this);
    self.onSubmitForm = this.onSubmitForm.bind(this);
    self.onRefFirstInput = this.onRefFirstInput.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
    window.RootNode.addClass(wrapCN);

    if (this.firstInput) {
      this.firstInput.focus();
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
    window.RootNode.removeClass(wrapCN);
    this.stopInputChangeTimer();
  }

  onChangeNameInput(event: SyntheticEvent<HTMLInputElement>) {
    let error: ?string = null;

    try {
      checkRequiredValue(event.currentTarget.value, 'Name');
    } catch (gError) {
      error = gError.message;
    }

    this.nameCh = true;
    this.setStateAfterInputChange({
      nameError: error,
    });
  }

  onChangeEmailInput(event: SyntheticEvent<HTMLInputElement>) {
    let error: ?string = null;

    try {
      const pureEmail = checkRequiredValue(event.currentTarget.value, 'Email');

      if (!Tools.emailRegExp.test(pureEmail)) {
        throw new Error('Email is incorrect');
      }
    } catch (gError) {
      error = gError.message;
    }

    this.emailCh = true;
    this.setStateAfterInputChange({
      emailError: error,
    });
  }

  onChangeMessageTextarea(event: SyntheticEvent<HTMLInputElement>) {
    let error: ?string = null;

    try {
      checkRequiredValue(event.currentTarget.value, 'Message');
    } catch (gError) {
      error = gError.message;
    }

    this.messageCh = true;
    this.setStateAfterInputChange({
      messageError: error,
    });
  }

  onClickToSubject(event: SyntheticEvent<HTMLElement>) {
    event.preventDefault();

    this.setState({
      modal: (
        <SupportSubjectsModal
          isOpened
          subjectId={this.subjectId}
          onSelect={this.onSelectSupportSubjects}
          onClose={this.onCloseModal}
        />
      ),
    });
  }

  onCloseModal() {
    this.setState({
      modal: null,
    });
  }

  onSelectSupportSubjects(subjectId: ?string, subject: ?string) {
    this.subjectId = subjectId;
    this.subject = subject;
    this.onCloseModal();
  }

  onSubmitForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const emailInput: HTMLInputElement = (form['email']: any);
    const nameInput: HTMLInputElement = (form['name']: any);
    const messageTextarea: HTMLInputElement = (form['message']: any);
    const phoneInput: HTMLInputElement = (form['phone']: any);

    this.setState({
      xhrRequest: true,
    });

    const finish = () => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        xhrRequest: false,
      });
    };

    support.addMessage({
      email: emailInput.value,
      name: nameInput.value,
      message: messageTextarea.value,
      phone: phoneInput.value,
    }).then((messID) => {
      form.reset();
      NotificationBox.success('Message has been sent');
      finish();
    }).catch((error) => {
      NotificationBox.danger(error.response.data);
      finish();
    });
  }

  onRefFirstInput(el: ?HTMLInputElement) {
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
      emailError,
      messageError,
      nameError,
      xhrRequest,
    } = this.state;

    const errorCNPrefix = ' is-invalid';
    const errorLabels = {};
    const inputCN = 'form-control';

    const inputCNs = {
      email: inputCN,
      name: inputCN,
      message: inputCN,
    };

    let allInputsChanged = true;

    if (this.emailCh) {
      if (emailError) {
        errorLabels.email = <InvalidLabel>{emailError}</InvalidLabel>;
        inputCNs.email += errorCNPrefix;
      }
    } else {
      allInputsChanged = false;
    }

    if (this.nameCh) {
      if (nameError) {
        errorLabels.name = <InvalidLabel>{nameError}</InvalidLabel>;
        inputCNs.name += errorCNPrefix;
      }
    } else {
      allInputsChanged = false;
    }

    if (this.messageCh) {
      if (messageError) {
        errorLabels.message = <InvalidLabel>{messageError}</InvalidLabel>;
        inputCNs.message += errorCNPrefix;
      }
    } else {
      allInputsChanged = false;
    }

    const errorsCount = Object.keys(errorLabels).length;
    const disabledSubmit = xhrRequest || !allInputsChanged || errorsCount > 0;
    const subjectText = this.subject || 'What can we help you with?';

    return (
      <Page className="Support">
        {this.state.modal}
        <div className="row">
          <div className="col-12 col-md-6 col-lg-4 offset-lg-1 left">
            <div className="text-center">
              <div className="p-ttl">
                {tt('Send us an E-mail')}
              </div>
              <div className="info">
                {tt('Ask us anything! We’ll get back to you within 24 - 48 hours')}
              </div>
              <form
                noValidate
                onSubmit={this.onSubmitForm}
              >
                <div className="form-group name">
                  <input
                    type="text"
                    className={inputCNs.name}
                    name="name"
                    placeholder="Name"
                    onChange={this.onChangeNameInput}
                    ref={this.onRefFirstInput}
                  />
                  {errorLabels.name}
                </div>
                <div className="form-group email">
                  <input
                    className={inputCNs.email}
                    defaultValue={this.defEmail}
                    name="email"
                    type="email"
                    placeholder="E-mail"
                    onChange={this.onChangeEmailInput}
                  />
                  {errorLabels.email}
                </div>
                <div className="form-group phone">
                  <input
                    className="form-control"
                    type="text"
                    name="phone"
                    placeholder="Phone number (optional)"
                  />
                </div>
                <div className="form-group subject">
                  <a
                    className="form-control select-wrap text-truncate"
                    href="#"
                    onClick={this.onClickToSubject}
                  >
                    {subjectText}
                  </a>
                </div>
                <div className="form-group message">
                  <textarea
                    cols="30"
                    rows="10"
                    className={inputCNs.message}
                    name="message"
                    placeholder="Message text"
                    onChange={this.onChangeMessageTextarea}
                  />
                  {errorLabels.message}
                </div>
                <button
                  className="btn btn-primary btn-block"
                  disabled={disabledSubmit}
                  type="submit"
                >
                  {tt('Send message')}
                </button>
              </form>
            </div>
          </div>
          <div className="col-6 offset-lg-1 d-none d-md-inline-block right" />
        </div>
      </Page>
    );
  }
}

export default hot(Support);
