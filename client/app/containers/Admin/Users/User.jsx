// @flow
import React from 'react';
import Checkbox from '../../../components/Checkbox';
import { tt } from '../../../components/TranslateElement';
import users from '../../../api/users';
import user from '../../../api/user';

const currUserEmail = (function getCurrUserEmail() {
  const currUser = user.get();
  return currUser ? currUser.email : null;
}());

type Props = {
  _id: string,
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  pMWallet: string,
  isAdmin: boolean,
};

class User extends React.PureComponent<Props> {
  constructor(props: Props, context: null) {
    super(props, context);

    const self: any = this;
    self.onChangeIsAdminCheckbox = this.onChangeIsAdminCheckbox.bind(this);

    this.adminNode = currUserEmail !== props.email ? (
      <label className="chckkbx">
        <Checkbox
          defaultChecked={this.props.isAdmin}
          onChange={this.onChangeIsAdminCheckbox}
        />
        {tt('Is admin')}
      </label>
    ) : tt('You');

    const noHaveText = '- - -';
    this.phoneText = typeof props.phone === 'string' ? props.phone : noHaveText;
    this.walletText = typeof props.pMWallet === 'string' ? props.pMWallet : noHaveText;
  }

  onChangeIsAdminCheckbox(event: SyntheticEvent<HTMLInputElement>) {
    const checkbox = event.currentTarget;
    checkbox.disabled = true;

    users.update(this.props._id, {
      isAdmin: checkbox.checked,
    }).then(() => {
      checkbox.disabled = false;
    }).catch((error) => {
      checkbox.disabled = false;
      NotificationBox.danger(error.message);
    });
  }

  adminNode: React$Node;
  phoneText: string;
  walletText: string;

  render() {
    const {
      _id,
      email,
      firstName,
      lastName,
      isAdmin,
    } = this.props;

    return (
      <tr>
        <td>{firstName} {lastName}</td>
        <td>
          <a href={`mailto:${email}`}>{email}</a>
        </td>
        <td>
          <strong>{tt('Wallet')}:</strong> {this.walletText}<br />
          <strong>{tt('Phone')}:</strong> {this.phoneText}
        </td>
        <td>{this.adminNode}</td>
      </tr>
    );
  }
}

export default User;
