import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Table from './shared/table';

const tickersQuery = gql`
  query tickersQuery {
    allTickers {
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
  }
`;

class Tickers extends Component {
  constructor() {
    super();
    this.columns = [];
  }

  render() {
    const { data: { allTickers = [], loading, error } } = this.props;

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
        {
          loading ? <div>LOADING!</div> : <Table data={tickers} columns={columns} />
        }
      </div>
    );
  }
}

export default graphql(tickersQuery)(Tickers);
