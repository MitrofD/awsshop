// @flow
import React from 'react';
import Dropdown, { DropdownItem } from '../../../components/Dropdown';
import { tt } from '../../../components/TranslateElement';

type Props = {
  isAdmin: boolean,
};

type State = {
  isActive: boolean,
  isAdmin: boolean,
};

const ADMIN_TEXT = 'Admin';
const NOT_ADMIN_TEXT = 'Not admin';

class AdminSelectbox extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      isActive: false,
      isAdmin: props.isAdmin,
    };

    const self: any = this;
    self.onClickDropdownItem = this.onClickDropdownItem.bind(this);
    self.onClickValue = this.onClickValue.bind(this);
    self.onLeaveDropdown = this.onLeaveDropdown.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onClickDropdownItem(value: any) {
    const boolValue = !!value;
    const oldValue = this.state.isAdmin;
    this.state.isAdmin = boolValue;
    this.hideDropdown();
  }

  onClickValue(event: SyntheticEvent<HTMLElement>) {
    event.preventDefault();
    this.showDropdown();
  }

  onLeaveDropdown() {
    this.hideDropdown();
  }

  hideDropdown() {
    this.setState({
      isActive: false,
    });
  }

  showDropdown() {
    this.setState({
      isActive: true,
    });
  }

  unmounted = true;

  render() {
    const {
      isActive,
      isAdmin,
    } = this.state;

    let dropdown = null;
    const adminText = isAdmin ? ADMIN_TEXT : NOT_ADMIN_TEXT;

    if (isActive) {
      dropdown = (
        <Dropdown
          onLeave={this.onLeaveDropdown}
        >
          <DropdownItem
            data={false}
            onClick={this.onClickDropdownItem}
          >
            {tt(NOT_ADMIN_TEXT)}
          </DropdownItem>
          <DropdownItem
            data
            onClick={this.onClickDropdownItem}
          >
            {tt(ADMIN_TEXT)}
          </DropdownItem>
        </Dropdown>
      );
    }

    return (
      <div className="AdminSelectbox">
        <a
          href="#!"
          onClick={this.onClickValue}
        >
          {tt(adminText)}
        </a>
        {dropdown}
      </div>
    );
  }
}

export default AdminSelectbox;
