import { makeRouteConfig, Route } from 'found';
import React from 'react';
import { graphql } from 'react-relay';

import Index from './components/Index';
import Tickers from './components/tickers';
import Ticker from './components/ticker';

import TickersQuery from './rootQueries/tickers';
import TickerQuery from './rootQueries/ticker';

export default makeRouteConfig(
  <Route
    path="/"
    Component={Index}
  >
    <Route
      path="tickers"
      Component={Tickers}
      query={TickersQuery}
    >
      <Route
        path=":symbol"
        Component={Ticker}
        query={TickerQuery}
        prepareVariables={params => ({ ...params, symbol:'btc-usd' })}
      />
    </Route>
  </Route>
);
