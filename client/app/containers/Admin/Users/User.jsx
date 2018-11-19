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
  ethAddress: string,
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

  render() {
    const {
      _id,
      email,
      ethAddress,
      isAdmin,
    } = this.props;

    return (
      <tr>
        <td>
          <a href={`mailto:${email}`}>{email}</a>
        </td>
        <td>{ethAddress}</td>
        <td>{this.adminNode}</td>
      </tr>
    );
  }
}

export default User;
