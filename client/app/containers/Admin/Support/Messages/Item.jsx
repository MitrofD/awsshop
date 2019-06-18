// @flow
import React from 'react';
import AnswerModal from './AnswerModal';
import { tt } from '../../../../components/TranslateElement';

type Props = {
  data: Object,
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
    self.onClickAnswerButton = this.onClickAnswerButton.bind(this);
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

  onClickAnswerButton() {
    this.setState((prevState) => {
      const newState = {
        modal: (
          <AnswerModal
            isOpened
            item={prevState.data}
            onSuccess={this.onEditedItem}
            onClose={this.onCloseModal}
          />
        ),
      };

      return newState;
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
    let answerContent = null;

    if (item.answer) {
      answerContent = <div className="blockquote-footer answr">{item.answer}</div>;
    } else {
      answerContent = (
        <div className="text-right">
          <button
            className="btn btn-sm btn-primary"
            type="button"
            onClick={this.onClickAnswerButton}
          >
            {tt('Answer to')}
            {' '}
            {item.name}
          </button>
        </div>
      );
    }

    const subject = item.subject ? item.subject : tt('No subject');

    return (
      <div className="Item">
        {this.state.modal}
        <h5 className="title">
          <span className="text-primary">{subject}</span>
          {` | ID#${item._id}`}
          <span className="time">{Tools.prettyTime(item.createdAt)}</span>
        </h5>
        <h6 className="sndr">
          {tt('From')}
          {`: ${item.name}`}
          <a
            className="text-primary"
            href={`mailto:${item.email}`}
          >
            {` ${item.email}`}
          </a>
          {item.phone && (
          <a href={`tel:${item.phone}`}>
            {` ${item.phone}`}
          </a>
          )}
        </h6>
        <blockquote className="blockquote">
          {item.message}
        </blockquote>
        {answerContent}
      </div>
    );
  }
}

export default Item;
