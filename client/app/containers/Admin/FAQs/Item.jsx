// @flow
import React from 'react';
import ItemSubmitModal from './ItemSubmitModal';
import { tt } from '../../../components/TranslateElement';
import faqs from '../../../api/faqs';

type onRemoveFunction = (string) => void;

type Props = {
  data: Object,
  onRemove: onRemoveFunction,
};

type State = {
  data: Object,
  modal: React$Node,
};

class Item extends React.PureComponent<Props, State> {
  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      data: props.data,
      modal: null,
    };

    const self: any = this;
    self.onCloseModal = this.onCloseModal.bind(this);
    self.onClickEditButton = this.onClickEditButton.bind(this);
    self.onClickRemoveButton = this.onClickRemoveButton.bind(this);
    self.onEditedItem = this.onEditedItem.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onCloseModal() {
    this.setState({
      modal: null,
    });
  }

  onClickEditButton() {
    this.setState(() => {
      const newState = {
        modal: (
          <ItemSubmitModal
            isOpened
            title="Edit item"
            item={this.state.data}
            onSuccess={this.onEditedItem}
            onClose={this.onCloseModal}
          />
        ),
      };

      return newState;
    });
  }

  onClickRemoveButton(event: SyntheticEvent<HTMLButtonElement>) {
    showConfirmModal('Are you sure?', () => {
      const item = this.state.data;
      const button = event.currentTarget;
      button.disabled = true;

      faqs.remove(item._id).then(() => {
        this.props.onRemove(item._id);
      }).catch((error) => {
        button.disabled = false;
        NotificationBox.danger(error.message);
      });
    });
  }

  onEditedItem(newData: Object) {
    this.setState({
      data: newData,
    });

    this.onCloseModal();
  }

  render() {
    const item = this.state.data;

    return (
      <tr>
        <td>
          {item.question}
          {this.state.modal}
        </td>
        <td>{item.answer}</td>
        <td className="td-actns text-right">
          <button
            className="edt"
            onClick={this.onClickEditButton}
            type="button"
          >
            {tt('Edit')}
          </button>
|
          <button
            className="rmv"
            onClick={this.onClickRemoveButton}
            type="button"
          >
            {tt('Remove')}
          </button>
        </td>
      </tr>
    );
  }
}

export default Item;
