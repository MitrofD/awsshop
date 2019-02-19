// @flow
import React from 'react';
import { tt } from '../../components/TranslateElement';

type ApplyFunc = (Date, Date) => void;

type Props = {
  onApply: ApplyFunc,
};

const TimeRangeControl = (props: Props) => {
  const buttons = {
    day: {
      num: 1,
      text: 'Day',
    },
    week: {
      num: 1,
      text: 'Week',
    },
    month: {
      num: 1,
      text: 'Month',
    },
    threeMonth: {
      num: 3,
      text: 'Months',
    },
  };

  const btnKeys = Object.keys(buttons);
  const maxLength = 12;
  let needMaxLength = Math.floor(maxLength / btnKeys.length);
  const tZOffset = (new Date()).getTimezoneOffset() * 60000;

  if (needMaxLength > maxLength) {
    needMaxLength = maxLength;
  }

  const btnWrapperClassName = `col-sm-${needMaxLength}`;

  const onClickItemButton = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const currBtnType = event.currentTarget.dataset.key;

    const msInDay = 86400000;
    const timeNow = new Date();
    let startUnixTime = timeNow.getTime() + tZOffset;
    const startTime = new Date(startUnixTime);

    const msInMonth = (durationInDay: number): number => {
      let totalMs = 0;
      let nDate = new Date(startUnixTime);

      for (let i = 0; i < durationInDay; i += 1) {
        const month = nDate.getMonth() - 1;
        const year = nDate.getFullYear();
        nDate = new Date(year, month, 0);
        totalMs += nDate.getDate() * msInDay;
      }

      return totalMs;
    };

    const keyToTime = {
      day: () => msInDay,
      week: () => msInDay * 7,
      month: () => msInMonth(1),
      threeMonth: () => msInMonth(3),
    };

    if (Tools.has.call(keyToTime, currBtnType)) {
      const addMs = keyToTime[currBtnType]();
      startUnixTime -= addMs;
      const startDate = new Date(startUnixTime + msInDay);
      const startTimeMS = startTime.getTime();
      const nearlyDayMS = msInDay - 1;
      const endDate = new Date(startTimeMS + nearlyDayMS);
      props.onApply(startDate, endDate);
    }
  };

  return (
    <div className="TimeRangeControl row">
      {btnKeys.map((btnKey) => {
        const btnItem = buttons[btnKey];

        return (
          <div
            className={btnWrapperClassName}
            key={btnKey}
          >
            <button
              className="btn btn-link btn-sm btn-block"
              data-key={btnKey}
              onClick={onClickItemButton}
              type="button"
            >
              {btnItem.num} {tt(btnItem.text)}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default TimeRangeControl;
