// @flow
import shallowequal from 'shallowequal';
import React from 'react';
import Calendar from 'react-calendar';
import { tt } from './TranslateElement';

type Props = {
  hideCleanButton?: boolean,
  hideTodayButton?: boolean,
  maxDate?: ?Date,
  minDate?: ?Date,
  onChange: Function,
};

const defaultProps = {
  hideCleanButton: false,
  hideTodayButton: false,
  maxDate: null,
  minDate: null,
};

const getDateNow = () => {
  const msInDay = 86400000;
  const timeNow = new Date();
  const needTime = timeNow.getTime();
  const rem = needTime % msInDay;
  timeNow.setTime(needTime + rem);
  return timeNow;
};

class DatePicker extends React.Component<Props> {
  static defaultProps = defaultProps;
  cleanBtnNode: React$Node = null;
  todayBtnNode: React$Node = null;

  constructor(props: Props, context: null) {
    super(props, context);

    const self: any = this;
    self.onClickCleanButton = this.onClickCleanButton.bind(this);
    self.onClickTodayButton = this.onClickTodayButton.bind(this);
    self.onSetCalendarRef = this.onSetCalendarRef.bind(this);
    this.propsHasBeenChanged(props);
  }

  shouldComponentUpdate(nextProps: Props) {
    const needUpdate = shallowequal(this.props, nextProps);

    if (needUpdate) {
      this.propsHasBeenChanged(nextProps);
    }

    return needUpdate;
  }

  onClickCleanButton() {
    this.calendar.value = null;
    this.props.onChange(null);
  }

  onClickTodayButton() {
    const timeNow = getDateNow();
    const newDate = new Date(timeNow);
    this.calendar.value = newDate;
    this.props.onChange(newDate);
  }

  onSetCalendarRef(mbCalendar: ?Calendar) {
    if (mbCalendar) {
      this.calendar = mbCalendar;
    }
  }

  propsHasBeenChanged(props: Props) {
    let disabledTodayButton = false;
    let cleanButton = null;
    let todayButton = null;

    const {
      hideCleanButton,
      hideTodayButton,
      maxDate,
      minDate,
    } = props;

    const nowTime = getDateNow();

    if (!hideCleanButton) {
      cleanButton = (
        <button
          onClick={this.onClickCleanButton}
          type="button"
        >
          {tt('Clean')}
        </button>
      );
    }

    if (!hideTodayButton) {
      if (maxDate instanceof Date) {
        disabledTodayButton = maxDate < nowTime;
      }

      if (minDate instanceof Date) {
        disabledTodayButton = minDate > nowTime;
      }

      todayButton = (
        <button
          disabled={disabledTodayButton}
          onClick={this.onClickTodayButton}
          type="button"
        >
          {tt('Today')}
        </button>
      );
    }

    this.cleanBtnNode = cleanButton;
    this.disabledTodayButton = disabledTodayButton;
    this.todayBtnNode = todayButton;
  }

  calendar: Calendar;
  disabledTodayButton: boolean;

  render() {
    return (
      <div className="DatePicker">
        <div className="inner">
          <Calendar
            {...this.props}
            ref={this.onSetCalendarRef}
          />
          <div className="cntrl">
            {this.cleanBtnNode}
            {this.todayBtnNode}
          </div>
        </div>
      </div>
    );
  }
}

export default DatePicker;
