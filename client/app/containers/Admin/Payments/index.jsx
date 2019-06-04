// @flow
import React from 'react';
import { Switch, Route } from 'react-router-dom';

const {
  Loadable,
  LoadableWithParams,
} = require('../../../components/Loadable').default(cN => import(`./${cN}`));

const StartPage = Loadable('Start');
const StartOfMonthPaymentsPage = LoadableWithParams('Payments', {
  mode: 'START_OF_MONTH',
});

const OnTheSameDatePaymentsPage = LoadableWithParams('Payments', {
  mode: 'ON_THE_SAME_DATE',
});

const CurrentTimePaymentsPage = LoadableWithParams('Payments', {
  mode: 'CURR_TIME',
});

export default () => (
  <Switch>
    <Route
      component={StartPage}
      exact
      path="/admin/payments"
    />
    <Route
      component={CurrentTimePaymentsPage}
      path="/admin/payments/curr"
    />
    <Route
      component={StartOfMonthPaymentsPage}
      path="/admin/payments/som"
    />
    <Route
      component={OnTheSameDatePaymentsPage}
      path="/admin/payments/otsd"
    />
  </Switch>
);
