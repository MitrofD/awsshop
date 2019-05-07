// @flow
import React from 'react';
import tinymce from 'tinymce/tinymce';
import 'tinymce/themes/silver';
import 'tinymce/plugins/colorpicker';
import 'tinymce/plugins/textcolor';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/image';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/table';
import 'tinymce/skins/ui/oxide/skin.min.css';
import NumberInput from 'tl-react-numeric-input';
import XHRSpin from '../../includes/XHRSpin';
import { InvalidLabel } from '../../../components/Label';
import { tt } from '../../../components/TranslateElement';
import serverSettings from '../../../api/server-settings';
import pages from '../../../api/pages';

const getUniqueId = (function makeUniqueIdFunc() {
  let idx = 0;

  return () => {
    idx += 1;
    return `page-${idx}`;
  };
}());

type Props = Object & {
  _id?: string,
  onCancel: Function,
  onSuccess: (data: Object) => void,
};

type State = {
  titleError: ?string,
  pathError: ?string,
  contentError: ?string,
  xhrRequest: boolean,
};

const EMPTY_STR = '';

class SubmitForm extends React.Component<Props, State> {
  inputChangeTimer: ?TimeoutID = null;

  btnTitle: string;

  content: string;

  title: string;

  path: string;

  contentId: string;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);
    this.btnTitle = props._id ? 'Save changes' : 'Add page';
    this.contentId = `content-txtrea${getUniqueId()}`;

    const getStrPropOrDef = (prop: string) => {
      const retVal = typeof props[prop] === 'string' ? props[prop].trim() : EMPTY_STR;
      return retVal;
    };

    this.title = getStrPropOrDef('title');
    this.path = getStrPropOrDef('path');
    this.content = getStrPropOrDef('content');

    this.state = {
      titleError: this.getRequiredErrorWithPropStr('title'),
      pathError: this.getRequiredErrorWithPropStr('path'),
      contentError: this.getRequiredErrorWithPropStr('content'),
      xhrRequest: false,
    };

    const self: any = this;
    self.onChangeTitleInput = this.onChangeTitleInput.bind(this);
    self.onChangePathInput = this.onChangePathInput.bind(this);
    self.onClickCancelButton = this.onClickCancelButton.bind(this);
    self.onSubmitForm = this.onSubmitForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    const onChangeContent = (editor: Object) => {
      const content = editor.getContent();
      this.content = content.trim();

      this.setStateAfterInputChange({
        contentError: this.getRequiredErrorWithPropStr('content'),
      });
    };

    tinymce.init({
      // theme_url: '../../tinymce/themes/silver',
      height: 500,
      menu: [],
      plugins: 'textcolor table colorpicker image link lists hr',
      toolbar: 'undo redo | bold italic underline | strikethrough alignleft aligncenter alignright alignjustify alignnone | formatselect forecolor backcolor | bullist numlist | table tabledelete | fontsizeselect | link unlink | hr | image',
      selector: `#${this.contentId}`,
      setup: (contentEditor) => {
        contentEditor.on('keyup', () => {
          onChangeContent(contentEditor);
        });

        contentEditor.on('change', () => {
          onChangeContent(contentEditor);
        });
      },
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.stopInputChangeTimer();
  }

  onChangeTitleInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    this.title = input.value.trim();

    this.setStateAfterInputChange({
      titleError: this.getRequiredErrorWithPropStr('title'),
    });
  }

  onChangePathInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    this.path = input.value.trim();

    this.setStateAfterInputChange({
      pathError: this.getRequiredErrorWithPropStr('path'),
    });
  }

  onClickCancelButton(event: SyntheticEvent<HTMLElement>) {
    this.props.onCancel(event);
  }

  onSubmitForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const sendData = {
      title: this.title,
      path: this.path,
      content: this.content,
    };

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
      NotificationBox.danger(error.message);
    };

    if (this.props._id) {
      pages.update(this.props._id, sendData).then(thenClbck).catch(catchClbck);
    } else {
      pages.add(sendData).then(thenClbck).catch(catchClbck);
    }
  }

  getRequiredErrorWithPropStr(prop: string): ?string {
    let pureVal = EMPTY_STR;

    if (Tools.has.call(this, prop)) {
      pureVal = (this: Object)[prop];
    }

    let error: ?string = null;

    if (pureVal.length === 0) {
      error = `${Tools.capitalize(prop)} is required`;
    }

    return error;
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
      titleError,
      pathError,
      contentError,
      xhrRequest,
    } = this.state;

    let className = 'SubmitForm';
    let loader = null;

    const errorLabels = {};
    const inputCN = 'form-control';

    const inputCNs = {
      title: inputCN,
      path: inputCN,
      content: inputCN,
    };

    if (xhrRequest) {
      loader = <XHRSpin />;
      className += ' ldr-md';
    } else {
      const errorCNPrefix = ' is-invalid';

      if (titleError) {
        errorLabels.title = <InvalidLabel>{titleError}</InvalidLabel>;
        inputCNs.title += errorCNPrefix;
      }

      if (pathError) {
        errorLabels.path = <InvalidLabel>{pathError}</InvalidLabel>;
        inputCNs.path += errorCNPrefix;
      }

      if (contentError) {
        errorLabels.content = <InvalidLabel>{contentError}</InvalidLabel>;
        inputCNs.content += errorCNPrefix;
      }
    }

    const errorsCount = Object.keys(errorLabels).length;
    const disabledSubmit = xhrRequest || errorsCount > 0;

    return (
      <div className={className}>
        {loader}
        <form
          noValidate
          className="row ldr-hddn"
          onSubmit={this.onSubmitForm}
        >
          <div className="col-6">
            <div className="form-group">
              <label>
                {tt('Title')}
:
              </label>
              <input
                autoComplete="title"
                className={inputCNs.title}
                defaultValue={this.title}
                onChange={this.onChangeTitleInput}
                name="title"
                type="text"
              />
              {errorLabels.title}
            </div>
          </div>
          <div className="col-6">
            <div className="form-group">
              <label>
                {tt('Path')}
:
              </label>
              <input
                autoComplete="path"
                className={inputCNs.path}
                defaultValue={this.path}
                onChange={this.onChangePathInput}
                name="path"
                type="text"
              />
              {errorLabels.path}
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label>
                {tt('Content')}
:
              </label>
              <textarea
                className={inputCNs.content}
                defaultValue={this.content}
                id={this.contentId}
                name="content"
              />
              {errorLabels.content}
            </div>
          </div>
          <div className="col-12 mt-3">
            <div className="btns-grp float-right">
              <button
                className="btn btn-link"
                onClick={this.onClickCancelButton}
                type="button"
              >
                {tt('Cancel')}
              </button>
              <button
                className="btn btn-primary"
                disabled={disabledSubmit}
                type="submit"
              >
                {tt(this.btnTitle)}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default SubmitForm;
