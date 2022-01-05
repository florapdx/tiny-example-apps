import React, { Component } from 'react';
const {
  createFragmentContainer,
  requestSubscription
} = require('react-relay');
import TickerSubscription from '../subscriptions/ticker';

class Ticker extends Component {
  constructor() {
    super();
    this.subscription = null;
  }

  componentDidMount() {
    const { relay: { environment }, params } = this.props;
    this.subscription = requestSubscription(TickerSubscription(environment, symbol));
  }

  componentWillUnmount() {
    this.subscription.dispose();
  }

  render() {
    const { ticker } = this.props;

    return (
      <div className="ticker">
        <h2>{ticker.symbol}</h2>
        <div className="ticker-data">
          <div>{`Open: ${ticker.open}`}</div>
          <div>{`High: ${ticker.high}`}</div>
          <div>{`Low: ${ticker.low}`}</div>
          <div>{`Volume: ${ticker.baseVolume}`}</div>
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(
  Ticker,
  graphql`
    fragment Ticker_ticker on Ticker {
      symbol
      open
      high
      low
      baseVolume
    }
  `
);
