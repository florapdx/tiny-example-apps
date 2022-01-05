import React, { Component } from 'react';
const { createFragmentContainer } = require('react-relay');
import Table from './shared/table';

class Tickers extends Component {
  constructor() {
    super();
    this.columns = [];
  }

  render() {
    const { allTickers } = this.props;

    const tickers = {};
    allTickers.forEach(ticker => {
      const symbolKey = ticker.symbol.toLowerCase().replace('/', '-');
      tickers[symbolKey] = ticker;
    });

    const columns = allTickers.reduce((acc, mem) => {
      let newKeys = Object.keys(mem).filter(key => key !== 'info' && acc.indexOf(key) === -1);
      return acc.concat(newKeys);
    }, []);

    return (
      <div className="tickers">
        <Table data={tickers} columns={columns} />
      </div>
    );
  }
}

export default createFragmentContainer(
  Tickers,
  graphql`
    fragment Tickers_allTickers on Ticker @relay(plural: true) {
      symbol
      timestamp
      datetime
      high
      low
      bid
      ask
      vwap
      open
      last
      baseVolume
      quoteVolume
      id
    }
  `
);
