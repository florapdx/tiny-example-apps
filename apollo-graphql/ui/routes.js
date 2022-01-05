import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Index from './components/Index';
import Tickers from './components/tickers';
import Ticker from './components/ticker';

function Routes() {
  return (
    <Switch>
      <Route exact path="/" component={Index} />
      <Route exact path="/tickers" component={Tickers} />
      <Route exact path="/tickers/:symbol" component={Ticker} />
    </Switch>
  );
}

export default Routes;
