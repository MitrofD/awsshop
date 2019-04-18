// @flow
import React from 'react';
import Modal from '../../components/Modal';
import { tt } from '../../components/TranslateElement';
import support from '../../api/support';
import windowScroll from '../../api/window-scroll';

const SCROLL_FAULT = 40;

type SubjectId = ?string;

type Props = Object & {
  onClose: Function,
  limit?: number,
  subjectId: SubjectId,
  onSelect: (SubjectId, ?string) => void,
};

type State = {
  loadMore: boolean,
  subjectId: SubjectId,
  xhrRequest: boolean,
};

const defaultProps = {
  limit: 50,
};

class SupportSubjectsModal extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  searchSubject: ?string = null;

  items: Object[] = [];

  scrollFunc: ?Function = null;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      loadMore: false,
      subjectId: props.subjectId,
      xhrRequest: true,
    };

    const self: any = this;
    self.onChangeSearchInput = this.onChangeSearchInput.bind(this);
    self.onClickWithoutButton = this.onClickWithoutButton.bind(this);
    self.onSetRootNode = this.onSetRootNode.bind(this);
    self.onScrollWindow = this.onScrollWindow.bind(this);
    self.onSubmitSearchForm = this.onSubmitSearchForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
    this.filter();
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.stopListenWindowScroll();
  }

  onChangeSearchInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureValue = input.value.trim();
    this.searchSubject = pureValue.length > 0 ? pureValue : null;
  }

  onClickWithoutButton(event: SyntheticEvent<HTMLButtonElement>) {
    event.preventDefault();
    this.props.onSelect(null, null);
  }

  onSetRootNode(el: ?HTMLElement) {
    if (el) {
      this.rootNode = el;
    }
  }

  onScrollWindow(scrollData: Object) {
    const rootNodeHeight = this.rootNode.offsetHeight;
    const rootNodeTop = this.rootNode.offsetTop;
    const rootNodeBottom = rootNodeHeight + rootNodeTop;
    const windowBottom = SCROLL_FAULT + scrollData.height + scrollData.topPos;

    if (windowBottom >= rootNodeBottom) {
      this.filter();
    }
  }

  onSubmitSearchForm() {
    this.reset();
    this.filter();
  }

  getSearchPattern(): ?string {
    if (this.searchSubject) {
      const escapedStr = Tools.escapedString(this.searchSubject);
      return `.*${escapedStr}.*`;
    }

    return null;
  }

  getSearchRegExp(): ?RegExp {
    const searchPattern = this.getSearchPattern();
    return searchPattern ? new RegExp(searchPattern, 'i') : null;
  }

  setStateAfterRequest(newState: Object) {
    if (this.unmounted) {
      return;
    }

    const pureNewState = Object.assign({
      xhrRequest: false,
    }, newState);

    this.setState(pureNewState);
  }

  stopListenWindowScroll() {
    if (this.scrollFunc) {
      windowScroll.unbind(this.scrollFunc);
      this.scrollFunc = null;
    }
  }

  filter() {
    this.stopListenWindowScroll();
    const query = {};
    query.limit = this.props.limit;
    const searchPattern = this.getSearchPattern();

    if (searchPattern) {
      query.searchPattern = searchPattern;
    }

    query.skip = this.items.length;

    support.getSubjects(query).then(({ items, loadMore }) => {
      this.items = this.items.concat(items);

      this.setStateAfterRequest({
        loadMore,
      });

      if (loadMore) {
        this.scrollFunc = windowScroll.bind(this.onScrollWindow);
      }
    }).catch((error) => {
      NotificationBox.danger(error.message);
      this.setStateAfterRequest({});
    });
  }

  reset() {
    this.setState({
      xhrRequest: true,
    });
  }

  rootNode: HTMLElement;

  render() {
    const {
      loadMore,
      xhrRequest,
    } = this.state;

    const content = null;
    const itemsContent = null;
    const headerContent = null;

    const modalFooter = (
      <button
        className="btn btn-primary btn-sm"
        type="button"
        onClick={this.onClickWithoutButton}
      >
        {tt('Without subject')}
      </button>
    );

    return (
      <Modal
        {...this.props}
        className="SupportSubjectsModal"
        closeButtonText="Cancel"
        footer={modalFooter}
      >
        <div
          className="lst"
          ref={this.onSetRootNode}
        >
          {itemsContent}
        </div>
      </Modal>
    );
  }
}

export default SupportSubjectsModal;
