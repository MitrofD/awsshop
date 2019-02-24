// @flow
import React, { Fragment } from 'react';
import DatePicker from './DatePicker';
import FixedOverlay from './FixedOverlay';
import { tt } from './TranslateElement';

const TYPE = {
  FROM: 'FROM',
  TO: 'TO',
};

const MAX_DETAIL_TYPE = {
  month: 'month',
  year: 'year',
  decade: 'decade',
  century: 'century',
};

type Props = {
  maxDetail?: $Keys<typeof MAX_DETAIL_TYPE>,
};

type State = {
  fromDate: ?Date,
  toDate: ?Date,
  showDatePicker: ?string,
};

const defaultProps = {
  maxDetail: MAX_DETAIL_TYPE.month,
};

const onKeyDownInput = (event: SyntheticEvent<HTMLElement>) => {
  event.preventDefault();
};

class DateRange extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      fromDate: null,
      toDate: null,
      showDatePicker: null,
    };

    const self: any = this;
    self.onFocusFromInput = this.onFocusFromInput.bind(this);
    self.onFocusToInput = this.onFocusToInput.bind(this);
    self.onClickFixedOverlay = this.onClickFixedOverlay.bind(this);
    self.onChangeFromDatePicker = this.onChangeFromDatePicker.bind(this);
    self.onChangeToDatePicker = this.onChangeToDatePicker.bind(this);
  }

  onFocusFromInput() {
    this.setState({
      showDatePicker: TYPE.FROM,
    });
  }

  onFocusToInput() {
    this.setState({
      showDatePicker: TYPE.TO,
    });
  }

  onClickFixedOverlay() {
    this.hideDatepicker();
  }

  onChangeFromDatePicker(date: Date) {
    this.fromDate = date;
  }

  onChangeToDatePicker(date: Date) {
    const fSMaxDetail = this.props.maxDetail;
    let dateTime = date.getTime();
    let mDays = 1;

    if (fSMaxDetail === MAX_DETAIL_TYPE.year) {
      const nextMonth = date.getMonth() + 1;
      const nextDate = new Date(date.getFullYear(), nextMonth, 0);
      mDays = nextDate.getDate();
    } else if (fSMaxDetail === MAX_DETAIL_TYPE.month) {
      mDays = 10;
    } else if (fSMaxDetail === MAX_DETAIL_TYPE.century) {
      mDays = 36525;
    }

    const totalMs = mDays * 86400000;
    dateTime += totalMs - 1;
    this.toDate = new Date(dateTime);
  }

  get fromDate(): ?Date {
    return this.state.fromDate;
  }

  set fromDate(mbDate: any) {
    let fromDate = null;

    if (mbDate instanceof Date) {
      fromDate = mbDate;
    }

    this.setState({
      fromDate,
      showDatePicker: null,
    });
  }

  get toDate(): ?Date {
    return this.state.toDate;
  }

  set toDate(mbDate: any) {
    let toDate = null;

    if (mbDate instanceof Date) {
      toDate = mbDate;
    }

    this.setState({
      toDate,
      showDatePicker: null,
    });
  }

  hideDatepicker() {
    this.setState({
      showDatePicker: null,
    });
  }

  render() {
    const {
      fromDate,
      toDate,
      showDatePicker,
    } = this.state;

    let fromDatePicker = null;
    let toDatePicker = null;
    let fromDateVal = '';
    let pFromDateVal = '';
    let toDateVal = '';
    let pToDateVal = '';
    const dateSep = '-';

    if (fromDate) {
      fromDateVal = Tools.date(fromDate, dateSep);
      pFromDateVal = fromDate.getTime();
    }

    if (toDate) {
      toDateVal = Tools.date(toDate, dateSep);
      pToDateVal = toDate.getTime();
    }

    if (showDatePicker === TYPE.FROM) {
      fromDatePicker = (
        <Fragment>
          <FixedOverlay onClick={this.onClickFixedOverlay} />
          <DatePicker
            maxDetail={this.props.maxDetail}
            maxDate={toDate}
            onChange={this.onChangeFromDatePicker}
            value={fromDate}
          />
        </Fragment>
      );
    } else if (showDatePicker === TYPE.TO) {
      toDatePicker = (
        <Fragment>
          <FixedOverlay onClick={this.onClickFixedOverlay} />
          <DatePicker
            maxDetail={this.props.maxDetail}
            minDate={fromDate}
            onChange={this.onChangeToDatePicker}
            value={toDate}
          />
        </Fragment>
      );
    }

    return (
      <div className="DateRange row">
        <div className="from">
          <label>{tt('From')}:</label>
          <div className="itm">
            {fromDatePicker}
            <input
              name="df-from"
              type="hidden"
              value={pFromDateVal}
            />
            <input
              readOnly
              type="text"
              onFocus={this.onFocusFromInput}
              onKeyDown={onKeyDownInput}
              value={fromDateVal}
            />
          </div>
        </div>
        <div className="to">
          <label>{tt('To')}:</label>
          <div className="itm">
            {toDatePicker}
            <input
              name="df-to"
              type="hidden"
              value={pToDateVal}
            />
            <input
              readOnly
              type="text"
              onFocus={this.onFocusToInput}
              onKeyDown={onKeyDownInput}
              value={toDateVal}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default DateRange;
