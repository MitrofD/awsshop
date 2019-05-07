// @flow
import React from 'react';

type Props = {};
type TimeParts = {
  date: string,
  time: string,
};

const ONE_SEC_IN_MS = 1000;

class Time extends React.PureComponent<Props> {
  dateEl: ?HTMLElement = null;

  timeEl: ?HTMLElement = null;

  time = new Date();

  tickIntervalID: ?IntervalID;

  synchIntervalID: ?IntervalID;

  componentDidMount() {
    this.restartTimer();
  }

  componentWillUnmount() {
    this.stopSynchTimeout();
    this.stopTickInterval();
  }

  getTimeParts(): TimeParts {
    const timeStr = this.time.toISOString();
    const parts = timeStr.split('T');
    const date = parts[0];
    const time = parts[1].substr(0, 8);

    return {
      date,
      time,
    };
  }

  startTickInterval() {
    if (this.dateEl) {
      const rDateEl = this.dateEl;

      if (this.timeEl) {
        const rTimeEl = this.timeEl;

        this.tickIntervalID = setInterval(() => {
          const nowSeconds = this.time.getMilliseconds();
          this.time.setMilliseconds(nowSeconds + ONE_SEC_IN_MS);
          const timeParts = this.getTimeParts();
          rDateEl.innerText = timeParts.date;
          rTimeEl.innerText = timeParts.time;
        }, ONE_SEC_IN_MS);
      }
    }
  }

  stopTickInterval() {
    if (this.tickIntervalID) {
      clearInterval(this.tickIntervalID);
    }

    this.tickIntervalID = null;
  }

  startSynchTimeout() {
    const fiveMinutesInMS = 300 * ONE_SEC_IN_MS;
    this.synchIntervalID = setInterval(this.restartTimer, fiveMinutesInMS);
  }

  stopSynchTimeout() {
    if (this.synchIntervalID) {
      clearInterval(this.synchIntervalID);
    }

    this.synchIntervalID = null;
  }

  restartTimer() {
    this.stopTickInterval();
    this.time = new Date();
    const timeParts = this.getTimeParts();

    if (this.dateEl) {
      this.dateEl.innerText = timeParts.date;
    }

    if (this.timeEl) {
      this.timeEl.innerText = timeParts.time;
    }

    this.startTickInterval();
  }

  render() {
    const timeParts = this.getTimeParts();

    return (
      <div className="Time">
        <div
          className="d"
          ref={(el) => { this.dateEl = el; }}
        >
          {timeParts.date}
        </div>
        <div
          className="t"
          ref={(el) => { this.timeEl = el; }}
        >
          {timeParts.time}
        </div>
      </div>
    );
  }
}

export default Time;
