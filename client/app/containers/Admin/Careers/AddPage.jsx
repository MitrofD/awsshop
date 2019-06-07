// @flow
import React from 'react';
import SubmitForm from './SubmitForm';
import { tt } from '../../../components/TranslateElement';

type Props = Object & {
  onCancel: Function,
  onAdded: (Object) => void,
};

class AddPage extends React.PureComponent<Props> {
  constructor(props: Props, context: null) {
    super(props, context);

    const self: any = this;
    self.onClickCancelButton = this.onClickCancelButton.bind(this);
    self.onSave = this.onSave.bind(this);
  }

  onClickCancelButton(event: SyntheticEvent<HTMLElement>) {
    event.preventDefault();
    this.props.onCancel();
  }

  onSave(page: Object) {
    NotificationBox.success('Vacancy has been added');
    this.props.onAdded(page);
  }

  render() {
    return (
      <div className="AddPage">
        <div className="ttl">
          {tt('Add new vacancy')}
          <div className="inf">
            <a
              className="to-bck icn-wrppr"
              href="#!"
              onClick={this.onClickCancelButton}
            >
              <i className="icn icn-lng-lft-arrw" />
              {' '}
              {tt('Go to back')}
            </a>
          </div>
        </div>
        <SubmitForm
          {...this.props}
          onCancel={this.onClickCancelButton}
          onSuccess={this.onSave}
        />
      </div>
    );
  }
}

export default AddPage;
