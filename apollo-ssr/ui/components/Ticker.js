import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

const tickerFragment = gql`
  fragment ticker on Ticker {
    open
    high
    low
    bid
    ask
    baseVolume
    quoteVolume
    symbol
  }
`;

const tickerQuery = gql`
  query tickerQuery($symbol: String!) {
    ticker(symbol: $symbol) {
      ...ticker
    }
  }
  ${tickerFragment}
`;

const tickerSubscription = gql`
  subscription tickerSubscription($symbol: String!) {
    ticker(symbol: $symbol) {
      ...ticker
    }
  }
  ${tickerFragment}
`;

class Ticker extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentWillMount() {
    const { match: { params } } = this.props;

    this.props.subscribeToTickerUpdates({
      symbol: params.symbol,
    });
  }

  render() {
    const { ticker = {}, loading, error } = this.props.data;

    return (
      <div className="ticker">
        <h2>{ticker.symbol}</h2>
        <div className="ticker-data">
          <div>{`Bid: ${ticker.bid}`}</div>
          <div>{`Ask: ${ticker.ask}`}</div>
          <div>{`Open: ${ticker.open}`}</div>
          <div>{`High: ${ticker.high}`}</div>
          <div>{`Low: ${ticker.low}`}</div>
          <div>{`Base Volume: ${ticker.baseVolume || 'n/a'}`}</div>
          <div>{`Quote Volume: ${ticker.quoteVolume || 'n/a'}`}</div>
        </div>
      </div>
    );
  }
}

export default graphql(
  tickerQuery,
  {
    options: ({ match: { params } }) => ({ variables: { symbol: params.symbol } }),
    props: props => ({
      ...props,
      subscribeToTickerUpdates: params => {
        return props.data.subscribeToMore({
          document: tickerSubscription,
          variables: { symbol: params.symbol },
          updateQuery: (prev, { subscriptionData }) => {
            return !subscriptionData.data ? prev : {
              ...prev,
              ...subscriptionData.data
            };
          }
        })
      }
    })
  },
)(Ticker);
